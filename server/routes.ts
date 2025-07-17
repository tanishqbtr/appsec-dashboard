import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt:", { username, password: password ? "***" : "missing" });
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? { id: user.id, username: user.username } : "not found");
      
      if (!user || user.password !== password) {
        console.log("Invalid credentials");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      console.log("Session set:", { userId: req.session.userId, username: req.session.username });
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    try {
      // Clear session
      req.session.destroy();
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get applications endpoint
  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update application endpoint
  app.patch("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedApplication = await storage.updateApplication(parseInt(id), updates);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add application endpoint
  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const newApplication = req.body;
      
      const applications = await storage.getApplications();
      applications.push(newApplication);
      
      res.status(201).json(newApplication);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete application endpoint
  app.delete("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const applications = await storage.getApplications();
      const applicationIndex = applications.findIndex((app: any) => app.id?.toString() === id);
      
      if (applicationIndex === -1) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Remove the application
      applications.splice(applicationIndex, 1);
      
      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
