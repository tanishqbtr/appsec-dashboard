import { 
  users, 
  applications, 
  mendScaFindings, 
  mendSastFindings, 
  mendContainersFindings,
  escapeWebAppsFindings,
  escapeApisFindings,
  crowdstrikeImagesFindings,
  crowdstrikeContainersFindings,
  riskAssessments,
  type User, 
  type InsertUser, 
  type Application, 
  type InsertApplication,
  type MendScaFinding,
  type InsertMendScaFinding,
  type MendSastFinding,
  type InsertMendSastFinding,
  type MendContainersFinding,
  type InsertMendContainersFinding,
  type EscapeWebAppsFinding,
  type InsertEscapeWebAppsFinding,
  type EscapeApisFinding,
  type InsertEscapeApisFinding,
  type CrowdstrikeImagesFinding,
  type InsertCrowdstrikeImagesFinding,
  type CrowdstrikeContainersFinding,
  type InsertCrowdstrikeContainersFinding,
  type RiskAssessment,
  type InsertRiskAssessment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  // Mend findings methods
  getMendScaFindings(serviceName?: string): Promise<MendScaFinding[]>;
  getMendSastFindings(serviceName?: string): Promise<MendSastFinding[]>;
  getMendContainersFindings(serviceName?: string): Promise<MendContainersFinding[]>;
  createMendScaFinding(finding: InsertMendScaFinding): Promise<MendScaFinding>;
  createMendSastFinding(finding: InsertMendSastFinding): Promise<MendSastFinding>;
  createMendContainersFinding(finding: InsertMendContainersFinding): Promise<MendContainersFinding>;
  // Escape findings methods
  getEscapeWebAppsFindings(serviceName?: string): Promise<EscapeWebAppsFinding[]>;
  getEscapeApisFindings(serviceName?: string): Promise<EscapeApisFinding[]>;
  createEscapeWebAppsFinding(finding: InsertEscapeWebAppsFinding): Promise<EscapeWebAppsFinding>;
  createEscapeApisFinding(finding: InsertEscapeApisFinding): Promise<EscapeApisFinding>;
  // Crowdstrike findings methods
  getCrowdstrikeImagesFindings(serviceName?: string): Promise<CrowdstrikeImagesFinding[]>;
  getCrowdstrikeContainersFindings(serviceName?: string): Promise<CrowdstrikeContainersFinding[]>;
  createCrowdstrikeImagesFinding(finding: InsertCrowdstrikeImagesFinding): Promise<CrowdstrikeImagesFinding>;
  createCrowdstrikeContainersFinding(finding: InsertCrowdstrikeContainersFinding): Promise<CrowdstrikeContainersFinding>;
  // Risk assessment methods
  getRiskAssessment(serviceName: string): Promise<RiskAssessment | undefined>;
  createOrUpdateRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getAllRiskAssessments(): Promise<RiskAssessment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private applications: Map<number, Application>;
  private currentUserId: number;
  private currentApplicationId: number;

  constructor() {
    this.users = new Map();
    this.applications = new Map();
    this.currentUserId = 1;
    this.currentApplicationId = 1;
    
    // Initialize with dummy admin user
    this.createUser({ username: "admin", password: "password@hh" });
    
    // Initialize with dummy applications data
    this.initializeApplications();
  }

  private async initializeApplications() {
    const mockApplications = [
      {
        name: 'Hinge Health Web Portal',
        projects: 122,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '33K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 372, C: 56, H: 192, M: 95, L: 29 }),
        labels: ['SCA', 'SAST'],
        tags: ['HITRUST', 'SOC 2'],
        lastScan: '07/16/2025, 06:10:01',
        hasAlert: false,
        scanEngine: 'Mend',
        githubRepo: 'https://github.com/hingehealth/web-portal',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/WEB',
        serviceOwner: 'Sarah Chen (Frontend Team Lead)',
        slackChannel: 'https://hingehealth.slack.com/channels/web-portal-team',
        description: 'Main customer-facing web application for Hinge Health platform'
      },
      {
        name: 'Payment Processing API',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '4.3K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 27, C: 12, H: 27, M: 16, L: 5 }),
        labels: ['Containers'],
        tags: ['PCI DSS', 'HIPAA'],
        lastScan: '07/17/2025, 02:40:07',
        hasAlert: false,
        scanEngine: 'Mend',
        githubRepo: 'https://github.com/hingehealth/payment-api',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/PAY',
        serviceOwner: 'Marcus Rodriguez (Backend Team Lead)',
        slackChannel: 'https://hingehealth.slack.com/channels/payments-team',
        description: 'Secure payment processing service handling billing and transactions'
      },
      {
        name: 'Mobile App Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '4.8K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 39, C: 1, H: 23, M: 849, L: 102 }),
        labels: ['Web Applications'],
        tags: ['ISO 27001', 'HIPAA'],
        lastScan: '07/17/2025, 04:30:34',
        hasAlert: false,
        scanEngine: 'Escape',
        githubRepo: 'https://github.com/hingehealth/mobile-app',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/MOB',
        serviceOwner: 'Lisa Park (Mobile Team Lead)',
        slackChannel: 'https://hingehealth.slack.com/channels/mobile-team',
        description: 'Backend services supporting the Hinge Health mobile application'
      },
      {
        name: 'User Authentication Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '2.1K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 11, C: 366, H: 1, M: 750, L: 88 }),
        labels: ['Images'],
        tags: ['HITRUST', 'ISO 27001'],
        lastScan: '07/17/2025, 10:03:15',
        hasAlert: false,
        scanEngine: 'Crowdstrike',
        githubRepo: 'https://github.com/hingehealth/auth-service',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/AUTH',
        serviceOwner: 'David Kim (Security Team Lead)',
        slackChannel: 'https://hingehealth.slack.com/channels/auth-security',
        description: 'Core authentication and authorization service'
      },
      {
        name: 'Coach Assistant Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.6K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 15, C: 2, H: 8, M: 4, L: 1 }),
        labels: ['APIs'],
        tags: ['SOC 2'],
        lastScan: '07/17/2025, 09:54:27',
        hasAlert: true,
        scanEngine: 'Escape',
        githubRepo: 'https://github.com/hingehealth/coach-assistant',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/COACH',
        serviceOwner: 'Emma Thompson (AI/ML Team)',
        slackChannel: 'https://hingehealth.slack.com/channels/coach-ai-team',
        description: 'AI-powered coaching assistant for personalized health recommendations'
      },
      {
        name: 'Eligibility Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.6K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 9, C: 0, H: 3, M: 5, L: 1 }),
        labels: ['Containers'],
        tags: ['HIPAA', 'SOC 2'],
        lastScan: '07/17/2025, 05:04:28',
        hasAlert: true,
        scanEngine: 'Mend',
        githubRepo: 'https://github.com/hingehealth/eligibility-service',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/ELIG',
        serviceOwner: 'Jennifer Martinez (Healthcare Integration)',
        slackChannel: 'https://hingehealth.slack.com/channels/eligibility-team',
        description: 'Service for validating member eligibility and benefits'
      },
      {
        name: 'Shipment Tracking Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.5K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 12, C: 1, H: 7, M: 3, L: 1 }),
        labels: ['Images'],
        tags: ['ISO 27001'],
        lastScan: '07/17/2025, 11:51:54',
        hasAlert: true,
        scanEngine: 'Crowdstrike',
        githubRepo: 'https://github.com/hingehealth/shipment-tracking',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/SHIP',
        serviceOwner: 'Carlos Rivera (Logistics Team)',
        slackChannel: 'https://hingehealth.slack.com/channels/logistics-team',
        description: 'Service for tracking device shipments and delivery status'
      },
      {
        name: 'Member Data Integration Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.1K',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 6, C: 0, H: 2, M: 3, L: 1 }),
        labels: ['SCA'],
        tags: ['HITRUST', 'HIPAA'],
        lastScan: '06/24/2025, 10:53:38',
        hasAlert: true,
        scanEngine: 'Mend',
        githubRepo: 'https://github.com/hingehealth/member-data-integration',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/MDI',
        serviceOwner: 'Alex Chen (Data Engineering)',
        slackChannel: 'https://hingehealth.slack.com/channels/data-integration',
        description: 'Service for integrating and synchronizing member health data'
      },
      {
        name: 'CV Reforge Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '856',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 6, C: 0, H: 2, M: 3, L: 1 }),
        labels: ['SAST'],
        tags: ['SOC 2'],
        lastScan: '06/19/2025, 06:20:03',
        hasAlert: false,
        scanEngine: 'Mend',
        githubRepo: 'https://github.com/hingehealth/cv-reforge',
        jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/CVR',
        serviceOwner: 'Michael Chen (Computer Vision Team)',
        slackChannel: 'https://hingehealth.slack.com/channels/cv-team',
        description: 'Computer vision service for exercise form analysis and feedback'
      },
      {
        name: 'Kubernetes Airflow Lineage',
        projects: 5,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '407',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 14, C: 1, H: 6, M: 6, L: 1 }),
        labels: ['Containers'],
        tags: ['ISO 27001'],
        lastScan: '05/21/2025, 12:34:01',
        hasAlert: false,
        scanEngine: 'Mend'
      },
      {
        name: 'K8s GCC Service',
        projects: 8,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '311',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 9, C: 0, H: 4, M: 4, L: 1 }),
        labels: ['Images'],
        tags: ['SOC 2'],
        lastScan: '05/21/2025, 11:57:00',
        hasAlert: false,
        scanEngine: 'Crowdstrike'
      },
      {
        name: 'Communication Service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '206',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 5, C: 0, H: 1, M: 3, L: 1 }),
        labels: ['Web Applications'],
        tags: ['HIPAA'],
        lastScan: '07/17/2025, 10:36:37',
        hasAlert: true,
        scanEngine: 'Escape'
      },
      {
        name: 'Hinge Health Main Platform',
        projects: 13,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '157',
        riskScore: '0.0',
        totalFindings: JSON.stringify({ total: 25, C: 5, H: 12, M: 7, L: 1 }),
        labels: ['SCA', 'SAST'],
        tags: ['HITRUST', 'PCI DSS'],
        lastScan: '07/09/2025, 07:22:28',
        hasAlert: true,
        scanEngine: 'Mend'
      }
    ];

    for (const app of mockApplications) {
      await this.createApplication(app);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const application: Application = { 
      ...insertApplication, 
      id,
      labels: insertApplication.labels || null,
      tags: insertApplication.tags || null,
      hasAlert: insertApplication.hasAlert || false
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) {
      return undefined;
    }
    
    const updatedApplication = {
      ...existingApplication,
      ...updates
    };
    
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }

  // Mend findings methods (stub implementations for MemStorage)
  async getMendScaFindings(serviceName?: string): Promise<MendScaFinding[]> {
    return [];
  }

  async getMendSastFindings(serviceName?: string): Promise<MendSastFinding[]> {
    return [];
  }

  async getMendContainersFindings(serviceName?: string): Promise<MendContainersFinding[]> {
    return [];
  }

  async createMendScaFinding(finding: InsertMendScaFinding): Promise<MendScaFinding> {
    throw new Error("Mend findings not supported in memory storage");
  }

  async createMendSastFinding(finding: InsertMendSastFinding): Promise<MendSastFinding> {
    throw new Error("Mend findings not supported in memory storage");
  }

  async createMendContainersFinding(finding: InsertMendContainersFinding): Promise<MendContainersFinding> {
    throw new Error("Mend findings not supported in memory storage");
  }

  // Escape findings methods (stub implementations for MemStorage)
  async getEscapeWebAppsFindings(serviceName?: string): Promise<EscapeWebAppsFinding[]> {
    return [];
  }

  async getEscapeApisFindings(serviceName?: string): Promise<EscapeApisFinding[]> {
    return [];
  }

  async createEscapeWebAppsFinding(finding: InsertEscapeWebAppsFinding): Promise<EscapeWebAppsFinding> {
    throw new Error("Escape findings not supported in memory storage");
  }

  async createEscapeApisFinding(finding: InsertEscapeApisFinding): Promise<EscapeApisFinding> {
    throw new Error("Escape findings not supported in memory storage");
  }

  // Crowdstrike findings methods (stub implementations for MemStorage)
  async getCrowdstrikeImagesFindings(serviceName?: string): Promise<CrowdstrikeImagesFinding[]> {
    return [];
  }

  async getCrowdstrikeContainersFindings(serviceName?: string): Promise<CrowdstrikeContainersFinding[]> {
    return [];
  }

  async createCrowdstrikeImagesFinding(finding: InsertCrowdstrikeImagesFinding): Promise<CrowdstrikeImagesFinding> {
    throw new Error("Crowdstrike findings not supported in memory storage");
  }

  async createCrowdstrikeContainersFinding(finding: InsertCrowdstrikeContainersFinding): Promise<CrowdstrikeContainersFinding> {
    throw new Error("Crowdstrike findings not supported in memory storage");
  }

  async getRiskAssessment(serviceName: string): Promise<RiskAssessment | undefined> {
    // Not implemented in memory storage - will use database storage for persistence
    return undefined;
  }

  async createOrUpdateRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    // Not implemented in memory storage - will use database storage for persistence
    throw new Error("Risk assessments not implemented in memory storage");
  }

  async getAllRiskAssessments(): Promise<RiskAssessment[]> {
    // Not implemented in memory storage - will use database storage for persistence
    return [];
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const [updatedApplication] = await db
      .update(applications)
      .set(updates)
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication || undefined;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db
      .delete(applications)
      .where(eq(applications.id, id));
    return result.rowCount > 0;
  }

  // Mend findings methods - simplified since each service has only one record
  async getMendScaFindings(serviceName?: string): Promise<MendScaFinding[]> {
    if (serviceName) {
      return await db.select().from(mendScaFindings)
        .where(eq(mendScaFindings.serviceName, serviceName));
    }
    return await db.select().from(mendScaFindings);
  }

  async getMendSastFindings(serviceName?: string): Promise<MendSastFinding[]> {
    if (serviceName) {
      return await db.select().from(mendSastFindings)
        .where(eq(mendSastFindings.serviceName, serviceName));
    }
    return await db.select().from(mendSastFindings);
  }

  async getMendContainersFindings(serviceName?: string): Promise<MendContainersFinding[]> {
    if (serviceName) {
      return await db.select().from(mendContainersFindings)
        .where(eq(mendContainersFindings.serviceName, serviceName));
    }
    return await db.select().from(mendContainersFindings);
  }

  async createMendScaFinding(finding: InsertMendScaFinding): Promise<MendScaFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(mendScaFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: mendScaFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  async createMendSastFinding(finding: InsertMendSastFinding): Promise<MendSastFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(mendSastFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: mendSastFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  async createMendContainersFinding(finding: InsertMendContainersFinding): Promise<MendContainersFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(mendContainersFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: mendContainersFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  // Escape findings methods
  async getEscapeWebAppsFindings(serviceName?: string): Promise<EscapeWebAppsFinding[]> {
    if (serviceName) {
      return await db.select().from(escapeWebAppsFindings)
        .where(eq(escapeWebAppsFindings.serviceName, serviceName));
    }
    return await db.select().from(escapeWebAppsFindings);
  }

  async getEscapeApisFindings(serviceName?: string): Promise<EscapeApisFinding[]> {
    if (serviceName) {
      return await db.select().from(escapeApisFindings)
        .where(eq(escapeApisFindings.serviceName, serviceName));
    }
    return await db.select().from(escapeApisFindings);
  }

  async createEscapeWebAppsFinding(finding: InsertEscapeWebAppsFinding): Promise<EscapeWebAppsFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(escapeWebAppsFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: escapeWebAppsFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  async createEscapeApisFinding(finding: InsertEscapeApisFinding): Promise<EscapeApisFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(escapeApisFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: escapeApisFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  // Crowdstrike findings methods
  async getCrowdstrikeImagesFindings(serviceName?: string): Promise<CrowdstrikeImagesFinding[]> {
    if (serviceName) {
      return await db.select().from(crowdstrikeImagesFindings)
        .where(eq(crowdstrikeImagesFindings.serviceName, serviceName));
    }
    return await db.select().from(crowdstrikeImagesFindings);
  }

  async getCrowdstrikeContainersFindings(serviceName?: string): Promise<CrowdstrikeContainersFinding[]> {
    if (serviceName) {
      return await db.select().from(crowdstrikeContainersFindings)
        .where(eq(crowdstrikeContainersFindings.serviceName, serviceName));
    }
    return await db.select().from(crowdstrikeContainersFindings);
  }

  async createCrowdstrikeImagesFinding(finding: InsertCrowdstrikeImagesFinding): Promise<CrowdstrikeImagesFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(crowdstrikeImagesFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: crowdstrikeImagesFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  async createCrowdstrikeContainersFinding(finding: InsertCrowdstrikeContainersFinding): Promise<CrowdstrikeContainersFinding> {
    // Use upsert to overwrite existing data for the same service
    const [created] = await db.insert(crowdstrikeContainersFindings)
      .values(finding)
      .onConflictDoUpdate({
        target: crowdstrikeContainersFindings.serviceName,
        set: {
          scanDate: finding.scanDate,
          critical: finding.critical,
          high: finding.high,
          medium: finding.medium,
          low: finding.low
        }
      })
      .returning();
    return created;
  }

  async getRiskAssessment(serviceName: string): Promise<RiskAssessment | undefined> {
    const [assessment] = await db.select().from(riskAssessments).where(eq(riskAssessments.serviceName, serviceName));
    return assessment || undefined;
  }

  async createOrUpdateRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const existing = await this.getRiskAssessment(assessment.serviceName);
    
    if (existing) {
      // Update existing assessment
      const [updated] = await db
        .update(riskAssessments)
        .set({
          ...assessment,
          lastUpdated: new Date(),
        })
        .where(eq(riskAssessments.serviceName, assessment.serviceName))
        .returning();
      return updated;
    } else {
      // Create new assessment
      const [created] = await db
        .insert(riskAssessments)
        .values(assessment)
        .returning();
      return created;
    }
  }

  async getAllRiskAssessments(): Promise<RiskAssessment[]> {
    return await db.select().from(riskAssessments);
  }
}

// Initialize storage - try database first, fallback to memory if database fails
async function initializeStorage(): Promise<IStorage> {
  try {
    const dbStorage = new DatabaseStorage();
    
    // Test database connection
    await dbStorage.getApplications();
    
    // Check if we need to seed data
    const existingApps = await dbStorage.getApplications();
    const existingUsers = await dbStorage.getUserByUsername("admin");
    
    if (!existingUsers) {
      await dbStorage.createUser({ username: "admin", password: "password@hh" });
    }
    
    if (existingApps.length === 0) {
      // Seed initial applications data
      await seedApplications(dbStorage);
    }
    
    console.log("Database storage initialized successfully");
    return dbStorage;
  } catch (error) {
    console.error("Database storage failed, falling back to memory storage:", error);
    return new MemStorage();
  }
}

async function seedApplications(storage: DatabaseStorage) {
  const mockApplications = [
    {
      name: 'Hinge Health Web Portal',
      riskScore: '0.0',
      labels: ['SCA', 'SAST'],
      tags: ['HITRUST', 'SOC 2'],
      hasAlert: false,
      githubRepo: 'https://github.com/hingehealth/web-portal',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/WEB',
      serviceOwner: 'Sarah Chen (Frontend Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/web-portal-team',
      description: 'Main customer-facing web application for Hinge Health platform'
    },
    {
      name: 'Payment Processing API',
      riskScore: '0.0',
      labels: ['SAST'],
      tags: ['PCI DSS', 'SOC 2'],
      hasAlert: false,
      githubRepo: 'https://github.com/hingehealth/payment-api',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/PAY',
      serviceOwner: 'Michael Rodriguez (Backend Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/payment-team',
      description: 'Secure payment processing API for subscription and billing management'
    },
    {
      name: 'User Authentication Service',
      riskScore: '0.0',
      labels: ['SAST', 'DAST'],
      tags: ['HITRUST', 'SOC 2'],
      hasAlert: true,
      githubRepo: 'https://github.com/hingehealth/auth-service',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/AUTH',
      serviceOwner: 'Jessica Park (Security Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/auth-security',
      description: 'Centralized authentication and authorization service for all Hinge Health applications'
    },
    {
      name: 'Data Analytics Platform',
      riskScore: '0.0',
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HIPAA', 'SOC 2'],
      hasAlert: false,
      githubRepo: 'https://github.com/hingehealth/analytics-platform',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/ANLY',
      serviceOwner: 'David Kim (Data Engineering Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/data-analytics',
      description: 'Real-time analytics platform processing patient health data and outcomes'
    },
    {
      name: 'Mobile Application Backend',
      riskScore: '0.0',
      labels: ['SAST', 'DAST'],
      tags: ['HITRUST', 'HIPAA'],
      hasAlert: true,
      githubRepo: 'https://github.com/hingehealth/mobile-backend',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/MOB',
      serviceOwner: 'Emily Rodriguez (Mobile Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/mobile-backend',
      description: 'Backend services supporting iOS and Android mobile applications'
    },
    {
      name: 'Notification Service',
      riskScore: '0.0',
      labels: ['SCA', 'SAST'],
      tags: ['SOC 2'],
      hasAlert: false,
      githubRepo: 'https://github.com/hingehealth/notification-service',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/NOTIF',
      serviceOwner: 'Alex Thompson (Platform Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/notifications',
      description: 'Multi-channel notification service for email, SMS, and push notifications'
    },
    {
      name: 'File Storage Service',
      riskScore: '0.0',
      labels: ['SCA', 'DAST'],
      tags: ['HIPAA', 'SOC 2'],
      hasAlert: false,
      githubRepo: 'https://github.com/hingehealth/file-storage',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/FILE',
      serviceOwner: 'Marcus Johnson (Infrastructure Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/storage-team',
      description: 'Secure file storage and retrieval service for patient documents and media'
    },
    {
      name: 'Exercise Video Platform',
      riskScore: '0.0',
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HITRUST', 'SOC 2'],
      hasAlert: true,
      githubRepo: 'https://github.com/hingehealth/video-platform',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/VID',
      serviceOwner: 'Rachel Green (Content Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/video-platform',
      description: 'Video streaming platform for exercise content and patient education'
    },
    {
      name: 'Shipment Tracking Service',
      riskScore: '0.0',
      labels: ['SAST'],
      tags: ['SOC 2'],
      hasAlert: false,
      githubRepo: 'https://github.com/hingehealth/shipment-tracking',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/SHIP',
      serviceOwner: 'Tom Wilson (Logistics Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/shipment-tracking',
      description: 'Real-time tracking service for medical device shipments and deliveries'
    },
    {
      name: 'Telemedicine Platform',
      riskScore: '0.0',
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HIPAA', 'HITRUST', 'SOC 2'],
      hasAlert: true,
      githubRepo: 'https://github.com/hingehealth/telemedicine',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/TELE',
      serviceOwner: 'Dr. Lisa Anderson (Clinical Technology)',
      slackChannel: 'https://hingehealth.slack.com/channels/telemedicine',
      description: 'HIPAA-compliant video consultation platform for patient-provider interactions'
    }
  ];

  for (const app of mockApplications) {
    await storage.createApplication(app);
  }

  // Seed Mend findings data
  await seedMendFindings(storage);
}

async function seedMendFindings(storage: DatabaseStorage) {
  // Mend SCA findings
  const scaFindings = [
    { serviceName: 'Hinge Health Web Portal', scanDate: '2025-07-16', critical: 56, high: 192, medium: 95, low: 29 },
    { serviceName: 'Data Analytics Platform', scanDate: '2025-07-16', critical: 8, high: 45, medium: 156, low: 75 },
    { serviceName: 'Notification Service', scanDate: '2025-07-16', critical: 2, high: 18, medium: 45, low: 24 },
    { serviceName: 'File Storage Service', scanDate: '2025-07-15', critical: 5, high: 28, medium: 67, low: 27 },
    { serviceName: 'Exercise Video Platform', scanDate: '2025-07-16', critical: 22, high: 89, medium: 134, low: 67 },
    { serviceName: 'Telemedicine Platform', scanDate: '2025-07-16', critical: 34, high: 128, medium: 189, low: 94 },
  ];

  // Mend SAST findings
  const sastFindings = [
    { serviceName: 'Hinge Health Web Portal', scanDate: '2025-07-16', critical: 12, high: 45, medium: 67, low: 23 },
    { serviceName: 'Data Analytics Platform', scanDate: '2025-07-16', critical: 3, high: 15, medium: 42, low: 18 },
    { serviceName: 'Notification Service', scanDate: '2025-07-16', critical: 1, high: 8, medium: 22, low: 12 },
    { serviceName: 'Exercise Video Platform', scanDate: '2025-07-16', critical: 8, high: 28, medium: 45, low: 19 },
    { serviceName: 'Telemedicine Platform', scanDate: '2025-07-16', critical: 15, high: 52, medium: 78, low: 31 },
  ];

  // Mend Containers findings
  const containersFindings = [
    { serviceName: 'Data Analytics Platform', scanDate: '2025-07-16', critical: 2, high: 12, medium: 28, low: 15 },
    { serviceName: 'Exercise Video Platform', scanDate: '2025-07-16', critical: 4, high: 18, medium: 35, low: 22 },
    { serviceName: 'Telemedicine Platform', scanDate: '2025-07-16', critical: 6, high: 24, medium: 42, low: 18 },
  ];

  // Insert findings
  for (const finding of scaFindings) {
    await storage.createMendScaFinding(finding);
  }

  for (const finding of sastFindings) {
    await storage.createMendSastFinding(finding);
  }

  for (const finding of containersFindings) {
    await storage.createMendContainersFinding(finding);
  }
}

// Initialize and export storage
let storage: IStorage;

export async function getStorage(): Promise<IStorage> {
  if (!storage) {
    storage = await initializeStorage();
  }
  return storage;
}
