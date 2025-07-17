import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd create a session or JWT token here
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get applications endpoint
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update application endpoint
  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const applications = await storage.getApplications();
      const applicationIndex = applications.findIndex((app: any) => app.id?.toString() === id);
      
      if (applicationIndex === -1) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Update the application with new data
      applications[applicationIndex] = {
        ...applications[applicationIndex],
        ...updates
      };
      
      res.json(applications[applicationIndex]);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add application endpoint
  app.post("/api/applications", async (req, res) => {
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
  app.delete("/api/applications/:id", async (req, res) => {
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
