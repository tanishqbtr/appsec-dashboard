import { users, applications, type User, type InsertUser, type Application, type InsertApplication } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
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
      riskFactors: '2K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 23, C: 0, H: 0, M: 12, L: 11 }),
      labels: ['SAST'],
      tags: ['PCI DSS', 'SOC 2'],
      lastScan: '07/16/2025, 04:30:15',
      hasAlert: false,
      scanEngine: 'Checkmarx',
      githubRepo: 'https://github.com/hingehealth/payment-api',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/PAY',
      serviceOwner: 'Michael Rodriguez (Backend Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/payment-team',
      description: 'Secure payment processing API for subscription and billing management'
    },
    {
      name: 'User Authentication Service',
      projects: 3,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '8K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 156, C: 12, H: 34, M: 67, L: 43 }),
      labels: ['SAST', 'DAST'],
      tags: ['HITRUST', 'SOC 2'],
      lastScan: '07/15/2025, 10:22:33',
      hasAlert: true,
      scanEngine: 'Veracode',
      githubRepo: 'https://github.com/hingehealth/auth-service',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/AUTH',
      serviceOwner: 'Jessica Park (Security Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/auth-security',
      description: 'Centralized authentication and authorization service for all Hinge Health applications'
    },
    {
      name: 'Data Analytics Platform',
      projects: 8,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '15K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 284, C: 8, H: 45, M: 156, L: 75 }),
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HIPAA', 'SOC 2'],
      lastScan: '07/16/2025, 02:15:42',
      hasAlert: false,
      scanEngine: 'Snyk',
      githubRepo: 'https://github.com/hingehealth/analytics-platform',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/ANLY',
      serviceOwner: 'David Kim (Data Engineering Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/data-analytics',
      description: 'Real-time analytics platform processing patient health data and outcomes'
    },
    {
      name: 'Mobile Application Backend',
      projects: 5,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '12K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 198, C: 15, H: 62, M: 89, L: 32 }),
      labels: ['SAST', 'DAST'],
      tags: ['HITRUST', 'HIPAA'],
      lastScan: '07/15/2025, 08:45:21',
      hasAlert: true,
      scanEngine: 'Veracode',
      githubRepo: 'https://github.com/hingehealth/mobile-backend',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/MOB',
      serviceOwner: 'Emily Rodriguez (Mobile Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/mobile-backend',
      description: 'Backend services supporting iOS and Android mobile applications'
    },
    {
      name: 'Notification Service',
      projects: 2,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '4K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 89, C: 2, H: 18, M: 45, L: 24 }),
      labels: ['SCA', 'SAST'],
      tags: ['SOC 2'],
      lastScan: '07/16/2025, 01:30:18',
      hasAlert: false,
      scanEngine: 'Checkmarx',
      githubRepo: 'https://github.com/hingehealth/notification-service',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/NOTIF',
      serviceOwner: 'Alex Thompson (Platform Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/notifications',
      description: 'Multi-channel notification service for email, SMS, and push notifications'
    },
    {
      name: 'File Storage Service',
      projects: 1,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '6K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 127, C: 5, H: 28, M: 67, L: 27 }),
      labels: ['SCA', 'DAST'],
      tags: ['HIPAA', 'SOC 2'],
      lastScan: '07/15/2025, 09:12:05',
      hasAlert: false,
      scanEngine: 'Mend',
      githubRepo: 'https://github.com/hingehealth/file-storage',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/FILE',
      serviceOwner: 'Marcus Johnson (Infrastructure Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/storage-team',
      description: 'Secure file storage and retrieval service for patient documents and media'
    },
    {
      name: 'Exercise Video Platform',
      projects: 4,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '18K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 312, C: 22, H: 89, M: 134, L: 67 }),
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HITRUST', 'SOC 2'],
      lastScan: '07/16/2025, 03:22:14',
      hasAlert: true,
      scanEngine: 'Snyk',
      githubRepo: 'https://github.com/hingehealth/video-platform',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/VID',
      serviceOwner: 'Rachel Green (Content Team Lead)',
      slackChannel: 'https://hingehealth.slack.com/channels/video-platform',
      description: 'Video streaming platform for exercise content and patient education'
    },
    {
      name: 'Shipment Tracking Service',
      projects: 3,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '7K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 76, C: 1, H: 12, M: 38, L: 25 }),
      labels: ['SAST'],
      tags: ['SOC 2'],
      lastScan: '07/15/2025, 11:18:47',
      hasAlert: false,
      scanEngine: 'Checkmarx',
      githubRepo: 'https://github.com/hingehealth/shipment-tracking',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/SHIP',
      serviceOwner: 'Tom Wilson (Logistics Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/shipment-tracking',
      description: 'Real-time tracking service for medical device shipments and deliveries'
    },
    {
      name: 'Telemedicine Platform',
      projects: 6,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '25K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 445, C: 34, H: 128, M: 189, L: 94 }),
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HIPAA', 'HITRUST', 'SOC 2'],
      lastScan: '07/16/2025, 05:45:32',
      hasAlert: true,
      scanEngine: 'Veracode',
      githubRepo: 'https://github.com/hingehealth/telemedicine',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/TELE',
      serviceOwner: 'Dr. Lisa Anderson (Clinical Technology)',
      slackChannel: 'https://hingehealth.slack.com/channels/telemedicine',
      description: 'HIPAA-compliant video consultation platform for patient-provider interactions'
    },
    {
      name: 'Communication Service',
      projects: 2,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '5K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 63, C: 0, H: 8, M: 32, L: 23 }),
      labels: ['SCA', 'SAST'],
      tags: ['SOC 2'],
      lastScan: '07/15/2025, 07:33:29',
      hasAlert: false,
      scanEngine: 'Mend',
      githubRepo: 'https://github.com/hingehealth/communication-service',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/COMM',
      serviceOwner: 'Kevin Chang (Platform Team)',
      slackChannel: 'https://hingehealth.slack.com/channels/communication',
      description: 'Internal communication service for care team coordination and messaging'
    },
    {
      name: 'Hinge Health Main Platform',
      projects: 15,
      violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      riskFactors: '42K',
      riskScore: '0.0',
      totalFindings: JSON.stringify({ total: 678, C: 67, H: 245, M: 278, L: 88 }),
      labels: ['SCA', 'SAST', 'DAST'],
      tags: ['HIPAA', 'HITRUST', 'SOC 2', 'PCI DSS'],
      lastScan: '07/16/2025, 07:15:03',
      hasAlert: true,
      scanEngine: 'Veracode',
      githubRepo: 'https://github.com/hingehealth/main-platform',
      jiraProject: 'https://hingehealth.atlassian.net/jira/software/projects/MAIN',
      serviceOwner: 'Jennifer Martinez (Platform Architecture)',
      slackChannel: 'https://hingehealth.slack.com/channels/main-platform',
      description: 'Core Hinge Health platform managing patient care plans, provider workflows, and health data'
    }
  ];

  for (const app of mockApplications) {
    await storage.createApplication(app);
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
