import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import crypto from "node:crypto";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for secure cookies and correct client IPs when behind load balancers
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware with environment-based secret and production store
if (app.get("env") === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production");
}

const PgSession = connectPgSimple(session);
const sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "dev-insecure-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: app.get("env") === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 60 * 1000,
  },
};

// Use persistent Postgres-backed session store only in production
if (app.get("env") === "production") {
  sessionOptions.store = new PgSession({
    pool,
    createTableIfMissing: true,
  });
}

app.use(session(sessionOptions));

// CSRF token initializer (double-submit via header matched to session token)
app.use((req, res, next) => {
  if (!req.session) return next();
  if (!(req.session as any).csrfToken) {
    (req.session as any).csrfToken = crypto.randomBytes(32).toString("hex");
  }
  // Expose token via non-HTTPOnly cookie for clients to read and send back in header
  res.cookie("XSRF-TOKEN", (req.session as any).csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: app.get("env") === "production",
  });
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const requestId = (req.headers["x-request-id"] as string) || "-";
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms [reqId=${requestId}]`;

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
