import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
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
      
      const storage = await getStorage();
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
  app.get("/api/applications", async (req, res) => {
    try {
      const storage = await getStorage();
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
      
      const storage = await getStorage();
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
  app.post("/api/applications", async (req, res) => {
    try {
      const newApplication = req.body;
      
      const storage = await getStorage();
      const createdApplication = await storage.createApplication(newApplication);
      
      res.status(201).json(createdApplication);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete application endpoint (Note: Not implemented for database storage, would need additional method)
  app.delete("/api/applications/:id", async (req, res) => {
    try {
      res.status(501).json({ message: "Delete operation not implemented for persistent storage" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mend findings endpoints
  app.get("/api/mend/sca", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getMendScaFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/mend/sast", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getMendSastFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/mend/containers", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getMendContainersFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Escape findings endpoints
  app.get("/api/escape/webapps", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getEscapeWebAppsFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/escape/apis", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getEscapeApisFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Crowdstrike findings endpoints
  app.get("/api/crowdstrike/images", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getCrowdstrikeImagesFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crowdstrike/containers", async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getCrowdstrikeContainersFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Risk assessments endpoints
  app.get("/api/risk-assessments/:serviceName", async (req, res) => {
    try {
      const { serviceName } = req.params;
      const storage = await getStorage();
      const assessment = await storage.getRiskAssessment(serviceName);
      res.json(assessment || null);
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
      res.status(500).json({ error: "Failed to fetch risk assessment" });
    }
  });

  app.post("/api/risk-assessments", async (req, res) => {
    try {
      const assessmentData = req.body;
      const storage = await getStorage();
      const assessment = await storage.createOrUpdateRiskAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error saving risk assessment:", error);
      res.status(500).json({ error: "Failed to save risk assessment" });
    }
  });

  // Get services with risk scores for Services page
  app.get("/api/services-with-risk-scores", async (req, res) => {
    try {
      const storage = await getStorage();
      const applications = await storage.getApplications();
      const riskAssessments = await storage.getAllRiskAssessments();
      
      // Create a map of risk assessments by service name
      const riskMap = new Map();
      riskAssessments.forEach(risk => {
        riskMap.set(risk.serviceName, risk);
      });
      
      // Transform applications with their risk data for Services page
      const servicesWithRisk = applications.map(app => {
        const riskData = riskMap.get(app.name);
        return {
          id: app.id, // Use application ID for proper routing
          name: app.name,
          finalRiskScore: riskData?.finalRiskScore || 0,
          riskLevel: riskData?.riskLevel || "Low",
          scanEngine: app.scanEngine || "Risk Assessment",
          labels: app.labels || [],
          tags: app.tags || []
        };
      });
      
      res.json(servicesWithRisk);
    } catch (error) {
      console.error("Error fetching services with risk scores:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Get applications with risk assessment data merged
  app.get("/api/applications-with-risk", async (req, res) => {
    try {
      const storage = await getStorage();
      const applications = await storage.getApplications();
      const riskAssessments = await storage.getAllRiskAssessments();
      
      // Create a map of risk assessments by service name
      const riskMap = new Map();
      riskAssessments.forEach(risk => {
        riskMap.set(risk.serviceName, risk);
      });
      
      // Merge applications with their risk assessment data
      const applicationsWithRisk = applications.map(app => {
        const riskData = riskMap.get(app.name);
        if (riskData) {
          return {
            ...app,
            riskScore: riskData.finalRiskScore.toString(),
            riskLevel: riskData.riskLevel,
            riskAssessment: riskData
          };
        }
        return app;
      });
      
      res.json(applicationsWithRisk);
    } catch (error) {
      console.error("Error fetching applications with risk data:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get all services with total findings across all scan engines
  app.get("/api/services-total-findings", async (req, res) => {
    try {
      const storage = await getStorage();
      const applications = await storage.getApplications();
      
      // Get all findings from all engines
      const [
        scaFindings,
        sastFindings,
        mendContainersFindings,
        webAppsFindings,
        apisFindings,
        imagesFindings,
        crowdstrikeContainersFindings
      ] = await Promise.all([
        storage.getMendScaFindings(),
        storage.getMendSastFindings(),
        storage.getMendContainersFindings(),
        storage.getEscapeWebAppsFindings(),
        storage.getEscapeApisFindings(),
        storage.getCrowdstrikeImagesFindings(),
        storage.getCrowdstrikeContainersFindings()
      ]);
      
      // Calculate total findings for each service across all engines
      const servicesWithTotalFindings = applications.map(app => {
        let totalFindings = 0;
        const serviceName = app.name;
        
        // Helper function to sum findings from an engine
        const sumFindings = (findings: any[]) => {
          findings?.forEach((finding: any) => {
            if (finding.serviceName === serviceName) {
              totalFindings += finding.critical + finding.high + finding.medium + finding.low;
            }
          });
        };
        
        // Sum findings from all engines
        sumFindings(scaFindings);
        sumFindings(sastFindings);
        sumFindings(mendContainersFindings);
        sumFindings(webAppsFindings);
        sumFindings(apisFindings);
        sumFindings(imagesFindings);
        sumFindings(crowdstrikeContainersFindings);
        
        return {
          id: app.id,
          name: app.name,
          totalFindings,
          riskScore: app.riskScore,
          tags: app.tags || []
        };
      });
      
      res.json(servicesWithTotalFindings);
    } catch (error) {
      console.error("Error fetching services with total findings:", error);
      res.status(500).json({ error: "Failed to fetch services with total findings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
