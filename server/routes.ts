import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { getStorage } from "./storage";
import { hashPassword, verifyPassword, verifyPlaintextPassword, needsRehash } from "./auth/passwords";
import { insertUserSchema } from "@shared/schema";

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin role middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.session.type !== 'Admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Rate limiting for authentication endpoints
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: { message: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development', // Skip in development
  });

  // Rate limiting for general API endpoints
  const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs for general endpoints
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development', // Skip in development
  });

  // Apply general rate limiting to all API routes
  app.use('/api', apiRateLimit);
  
  // Login endpoint with enhanced security
  app.post("/api/login", authRateLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt:", { username, password: password ? "***" : "missing" });
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const storage = await getStorage();
      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? { id: user.id, username: user.username } : "not found");
      
      if (!user) {
        // Use consistent error message to prevent username enumeration
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password (supports both legacy plaintext and new hashed passwords)
      let isValidPassword = false;
      
      if (user.passwordHash) {
        // User has migrated to hashed password
        isValidPassword = await verifyPassword(user.passwordHash, password);
        
        // Check if password needs rehashing with stronger parameters
        if (isValidPassword && needsRehash(user.passwordHash)) {
          console.log("Password verified but needs rehashing for user:", user.username);
          try {
            const newHash = await hashPassword(password);
            await storage.updateUser(user.id, {
              passwordHash: newHash,
              passwordAlgo: 'argon2id',
              passwordUpdatedAt: new Date(),
            });
            console.log("Password rehashed successfully for user:", user.username);
          } catch (rehashError) {
            console.error("Failed to rehash password for user:", user.username, rehashError);
            // Don't fail login if rehashing fails
          }
        }
      } else {
        console.log("No password hash found for user:", user.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!isValidPassword) {
        console.log("Invalid credentials for user:", user.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user account is disabled
      if (user.status === 'Disabled') {
        console.log("Disabled user attempted login:", user.username);
        return res.status(403).json({ 
          message: "Your account has been disabled. Please contact AppSec Team!",
          accountDisabled: true 
        });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.type = user.type;
      console.log("Session set:", { userId: req.session.userId, username: req.session.username, type: req.session.type });
      res.json({ success: true, user: { id: user.id, username: user.username, type: user.type } });
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
      res.json({ id: user.id, name: user.name, username: user.username, type: user.type });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", requireAuth, authRateLimit, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }
      
      const storage = await getStorage();
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      let isValidCurrentPassword = false;
      
      if (user.passwordHash) {
        isValidCurrentPassword = await verifyPassword(user.passwordHash, currentPassword);
      }
      
      if (!isValidCurrentPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // Update user password
      await storage.updateUser(user.id, {
        passwordHash: newPasswordHash,
        passwordAlgo: 'argon2id',
        passwordUpdatedAt: new Date(),
      });
      
      console.log(`Password changed successfully for user: ${user.username}`);
      res.json({ success: true, message: "Password changed successfully" });
      
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile endpoints
  app.get("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        type: user.type
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const { name, username, currentPassword, newPassword } = req.body;
      
      if (!name || !username) {
        return res.status(400).json({ message: "Name and username are required" });
      }

      const storage = await getStorage();
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If password change is requested, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change password" });
        }
        if (user.password !== currentPassword) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
      }

      // Check if username is already taken by another user
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Update user
      const updateData: any = { name, username };
      if (newPassword) {
        updateData.password = newPassword;
      }

      const updatedUser = await storage.updateUser(user.id, updateData);
      
      // Update session if username changed
      if (username !== user.username) {
        req.session.username = username;
      }

      res.json({ 
        id: updatedUser.id, 
        name: updatedUser.name, 
        username: updatedUser.username, 
        type: updatedUser.type 
      });
    } catch (error) {
      console.error("Update profile error:", error);
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

  // Update application endpoint - Admin only
  app.patch("/api/applications/:id", requireAdmin, async (req, res) => {
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

  // Add application endpoint - Admin only
  app.post("/api/applications", requireAdmin, async (req: any, res) => {
    try {
      const newApplication = req.body;
      
      const storage = await getStorage();
      const createdApplication = await storage.createApplication(newApplication);
      
      // Log the activity
      await logActivity(
        req.session.userId,
        req.session.username,
        'CREATE_SERVICE',
        createdApplication.name,
        `Created new service: ${createdApplication.name}`
      );
      
      res.status(201).json(createdApplication);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete application endpoint - Admin only
  app.delete("/api/applications/:id", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const storage = await getStorage();
      
      // Get the application first to log its name
      const application = await storage.getApplication(parseInt(id));
      const success = await storage.deleteApplication(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Log the activity
      if (application) {
        await logActivity(
          req.session.userId,
          req.session.username,
          'DELETE_SERVICE',
          application.name,
          `Deleted service: ${application.name}`
        );
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

  app.post("/api/risk-assessments", requireAdmin, async (req: any, res) => {
    try {
      const assessmentData = req.body;
      const storage = await getStorage();
      const assessment = await storage.createOrUpdateRiskAssessment(assessmentData);
      
      // Log the activity
      await logActivity(
        req.session.userId,
        req.session.username,
        'UPDATE_RISK_SCORE',
        assessment.serviceName,
        `Updated risk assessment for ${assessment.serviceName} - Final Risk Score: ${assessment.finalRiskScore}, Risk Level: ${assessment.riskLevel}`
      );
      
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

  // Admin endpoints
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const storage = await getStorage();
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/metrics", requireAdmin, async (req, res) => {
    try {
      const storage = await getStorage();
      const users = await storage.getAllUsers();
      const applications = await storage.getApplications();
      
      const metrics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'Active').length,
        adminUsers: users.filter(u => u.type === 'Admin').length,
        totalServices: applications.length,
        totalFindings: 0, // Could be calculated from all findings
        criticalFindings: 0, // Could be calculated from all findings
        systemHealth: 'healthy' as const
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const storage = await getStorage();
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      const storage = await getStorage();
      
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const storage = await getStorage();
      
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Bulk delete users endpoint
  app.delete("/api/admin/users/bulk", requireAdmin, async (req, res) => {
    try {
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "Invalid user IDs provided" });
      }
      
      const storage = await getStorage();
      let deletedCount = 0;
      
      for (const userId of userIds) {
        try {
          await storage.deleteUser(userId);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete user ${userId}:`, error);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deletedCount} users`,
        deletedCount 
      });
    } catch (error) {
      console.error("Bulk delete users error:", error);
      res.status(500).json({ error: "Failed to delete users" });
    }
  });

  // Activity logs endpoint for admin panel
  app.get("/api/admin/activity-logs", requireAdmin, async (req, res) => {
    try {
      const storage = await getStorage();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // Top high-risk applications endpoints
  app.get("/api/dashboard/top-applications-total", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const totalFindings = await storage.getServicesWithTotalFindings();
      
      // Sort by total findings and take top 5
      const topApps = totalFindings
        .sort((a, b) => b.totalFindings - a.totalFindings)
        .slice(0, 5)
        .map(app => ({
          name: app.name,
          totalFindings: app.totalFindings,
          critical: app.critical,
          high: app.high,
          medium: app.medium,
          low: app.low
        }));
      
      res.json(topApps);
    } catch (error) {
      console.error("Top applications total error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/top-applications-mend", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const [scaFindings, sastFindings, containerFindings] = await Promise.all([
        storage.getMendScaFindings(),
        storage.getMendSastFindings(),
        storage.getMendContainersFindings()
      ]);
      
      // Aggregate Mend findings by service
      const serviceFindings = new Map();
      [...scaFindings, ...sastFindings, ...containerFindings].forEach(finding => {
        const serviceName = finding.serviceName;
        const existing = serviceFindings.get(serviceName) || { critical: 0, high: 0, medium: 0, low: 0 };
        serviceFindings.set(serviceName, {
          critical: existing.critical + (finding.critical || 0),
          high: existing.high + (finding.high || 0),
          medium: existing.medium + (finding.medium || 0),
          low: existing.low + (finding.low || 0)
        });
      });
      
      const topApps = Array.from(serviceFindings.entries())
        .map(([name, findings]) => ({
          name,
          totalFindings: findings.critical + findings.high + findings.medium + findings.low,
          ...findings
        }))
        .sort((a, b) => b.totalFindings - a.totalFindings)
        .slice(0, 5);
      
      res.json(topApps);
    } catch (error) {
      console.error("Top applications Mend error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/top-applications-escape", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const [webAppsFindings, apisFindings] = await Promise.all([
        storage.getEscapeWebAppsFindings(),
        storage.getEscapeApisFindings()
      ]);
      
      // Aggregate Escape findings by service
      const serviceFindings = new Map();
      [...webAppsFindings, ...apisFindings].forEach(finding => {
        const serviceName = finding.serviceName;
        const existing = serviceFindings.get(serviceName) || { critical: 0, high: 0, medium: 0, low: 0 };
        serviceFindings.set(serviceName, {
          critical: existing.critical + (finding.critical || 0),
          high: existing.high + (finding.high || 0),
          medium: existing.medium + (finding.medium || 0),
          low: existing.low + (finding.low || 0)
        });
      });
      
      const topApps = Array.from(serviceFindings.entries())
        .map(([name, findings]) => ({
          name,
          totalFindings: findings.critical + findings.high + findings.medium + findings.low,
          ...findings
        }))
        .sort((a, b) => b.totalFindings - a.totalFindings)
        .slice(0, 5);
      
      res.json(topApps);
    } catch (error) {
      console.error("Top applications Escape error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/top-applications-crowdstrike", requireAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const [imagesFindings, containersFindings] = await Promise.all([
        storage.getCrowdstrikeImagesFindings(),
        storage.getCrowdstrikeContainersFindings()
      ]);
      
      // Aggregate Crowdstrike findings by service
      const serviceFindings = new Map();
      [...imagesFindings, ...containersFindings].forEach(finding => {
        const serviceName = finding.serviceName;
        const existing = serviceFindings.get(serviceName) || { critical: 0, high: 0, medium: 0, low: 0 };
        serviceFindings.set(serviceName, {
          critical: existing.critical + (finding.critical || 0),
          high: existing.high + (finding.high || 0),
          medium: existing.medium + (finding.medium || 0),
          low: existing.low + (finding.low || 0)
        });
      });
      
      const topApps = Array.from(serviceFindings.entries())
        .map(([name, findings]) => ({
          name,
          totalFindings: findings.critical + findings.high + findings.medium + findings.low,
          ...findings
        }))
        .sort((a, b) => b.totalFindings - a.totalFindings)
        .slice(0, 5);
      
      res.json(topApps);
    } catch (error) {
      console.error("Top applications Crowdstrike error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Helper function to log user activities (used by other endpoints)
  const logActivity = async (userId: number, username: string, action: string, serviceName?: string, details?: string) => {
    try {
      const storage = await getStorage();
      await storage.createActivityLog({
        userId,
        username,
        action,
        serviceName,
        details
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const httpServer = createServer(app);
  return httpServer;
}
