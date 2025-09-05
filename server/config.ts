import { z } from "zod";

const base = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().optional(),
  PASSWORD_PEPPER: z.string().optional(),
});

const env = base.parse(process.env);
const prod = env.NODE_ENV === "production";

if (prod) {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required in production");
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is required in production");
  if (!env.PASSWORD_PEPPER) throw new Error("PASSWORD_PEPPER is required in production");
}

export const config = env;


