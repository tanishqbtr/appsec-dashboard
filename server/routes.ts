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
        console.log("Invalid credentials - expected:", user?.password, "got:", password);
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

  // User info endpoint
  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Get user error:", error);
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
      const storage = await getStorage();
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
  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const newApplication = req.body;
      
      const storage = await getStorage();
      const createdApplication = await storage.createApplication(newApplication);
      
      res.status(201).json(createdApplication);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete application endpoint
  app.delete("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const storage = await getStorage();
      const success = await storage.deleteApplication(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json({ success: true, message: "Application deleted successfully" });
    } catch (error) {
      console.error("Delete application error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mend findings endpoints
  app.get("/api/mend/sca", requireAuth, async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getMendScaFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/mend/sast", requireAuth, async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getMendSastFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/mend/containers", requireAuth, async (req, res) => {
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
  app.get("/api/escape/webapps", requireAuth, async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getEscapeWebAppsFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/escape/apis", requireAuth, async (req, res) => {
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
  app.get("/api/crowdstrike/images", requireAuth, async (req, res) => {
    try {
      const { serviceName } = req.query;
      const storage = await getStorage();
      const findings = await storage.getCrowdstrikeImagesFindings(serviceName as string);
      res.json(findings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crowdstrike/containers", requireAuth, async (req, res) => {
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
  app.get("/api/risk-assessments/:serviceName", requireAuth, async (req, res) => {
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

  app.post("/api/risk-assessments", requireAuth, async (req, res) => {
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
  app.get("/api/services-with-risk-scores", requireAuth, async (req, res) => {
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
  app.get("/api/applications-with-risk", requireAuth, async (req, res) => {
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
  app.get("/api/services-total-findings", requireAuth, async (req, res) => {
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

  // Risk score distribution endpoint for charts
  app.get("/api/dashboard/risk-distribution", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const riskAssessments = await storage.getAllRiskAssessments();
      
      // Categorize risk scores
      const distribution = riskAssessments.reduce((acc, assessment) => {
        const score = assessment.finalRiskScore || 0;
        let category;
        if (score >= 8) category = 'Critical';
        else if (score >= 6) category = 'High';
        else if (score >= 4) category = 'Medium';
        else category = 'Low';
        
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to array format for the pie chart
      const distributionArray = Object.entries(distribution).map(([name, value]) => ({
        name,
        value
      }));
      
      res.json(distributionArray);
    } catch (error) {
      console.error("Risk distribution error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Scan engine findings endpoint for charts
  app.get("/api/dashboard/scan-engine-findings", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      
      // Get findings from all scan engines
      const [
        mendScaFindings,
        mendSastFindings, 
        mendContainersFindings,
        escapeWebAppsFindings,
        escapeApisFindings,
        crowdstrikeImagesFindings,
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
      
      // Aggregate findings by engine
      const aggregateFindings = (findings: any[], engineName: string) => {
        return findings.reduce((acc, finding) => ({
          critical: acc.critical + (finding.critical || 0),
          high: acc.high + (finding.high || 0),
          medium: acc.medium + (finding.medium || 0),
          low: acc.low + (finding.low || 0)
        }), { engine: engineName, critical: 0, high: 0, medium: 0, low: 0 });
      };
      
      const scanEngineData = [
        aggregateFindings([...mendScaFindings, ...mendSastFindings, ...mendContainersFindings], "Mend"),
        aggregateFindings([...escapeWebAppsFindings, ...escapeApisFindings], "Escape"),
        aggregateFindings([...crowdstrikeImagesFindings, ...crowdstrikeContainersFindings], "Crowdstrike")
      ];
      
      res.json(scanEngineData);
    } catch (error) {
      console.error("Scan engine findings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      
      // Get all applications
      const applications = await storage.getApplications();
      const totalApplications = applications.length;
      
      // Get all findings from all scan engines
      const [
        mendScaFindings,
        mendSastFindings, 
        mendContainersFindings,
        escapeWebAppsFindings,
        escapeApisFindings,
        crowdstrikeImagesFindings,
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
      
      // Calculate total critical and high findings across all engines
      const allFindings = [
        ...mendScaFindings,
        ...mendSastFindings,
        ...mendContainersFindings,
        ...escapeWebAppsFindings,
        ...escapeApisFindings,
        ...crowdstrikeImagesFindings,
        ...crowdstrikeContainersFindings
      ];
      
      const criticalFindings = allFindings.reduce((sum, finding) => sum + (finding.critical || 0), 0);
      const highFindings = allFindings.reduce((sum, finding) => sum + (finding.high || 0), 0);
      
      // Get risk assessments for average risk score
      const riskAssessments = await storage.getAllRiskAssessments();
      const averageRiskScore = riskAssessments.length > 0 
        ? riskAssessments.reduce((sum, assessment) => sum + (assessment.finalRiskScore || 0), 0) / riskAssessments.length
        : 0;
      
      const metrics = {
        totalApplications,
        criticalFindings,
        highFindings,
        averageRiskScore: Number(averageRiskScore.toFixed(1))
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
