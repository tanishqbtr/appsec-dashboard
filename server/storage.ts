import { users, applications, type User, type InsertUser, type Application, type InsertApplication } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
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
    this.createUser({ username: "admin", password: "password" });
    
    // Initialize with dummy applications data
    this.initializeApplications();
  }

  private async initializeApplications() {
    const mockApplications = [
      {
        name: 'PROD-ECR-US-EAST-1',
        projects: 122,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '33K',
        totalFindings: JSON.stringify({ total: 372, C: 56, H: 192, M: 95, L: 29 }),
        labels: ['L1', 'Production'],
        tags: [],
        lastScan: '07/16/2025, 06:10:01',
        hasAlert: false
      },
      {
        name: 'PROD-ECR-US-WEST-1',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '4.3K',
        totalFindings: JSON.stringify({ total: 27, C: 12, H: 27, M: 16, L: 5 }),
        labels: ['L1', 'Production'],
        tags: [],
        lastScan: '07/17/2025, 02:40:07',
        hasAlert: false
      },
      {
        name: 'GH_streamlit-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '4.8K',
        totalFindings: JSON.stringify({ total: 39, C: 1, H: 23, M: 849, L: 102 }),
        labels: ['L1', 'Development'],
        tags: [],
        lastScan: '07/17/2025, 04:30:34',
        hasAlert: false
      },
      {
        name: 'GH_basilisk',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '2.1K',
        totalFindings: JSON.stringify({ total: 11, C: 366, H: 1, M: 750, L: 88 }),
        labels: ['L1', 'Testing'],
        tags: ['L1'],
        lastScan: '07/17/2025, 10:03:15',
        hasAlert: false
      },
      {
        name: 'GH_coach-assistant-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.6K',
        totalFindings: JSON.stringify({ total: 15, C: 264, H: 651, M: 759, L: 33 }),
        labels: ['L1', 'Production'],
        tags: [],
        lastScan: '07/17/2025, 09:54:27',
        hasAlert: true
      },
      {
        name: 'GH_eligibility-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.6K',
        totalFindings: JSON.stringify({ total: 9, C: 234, H: 617, M: 743, L: 45 }),
        labels: ['L1', 'Development'],
        tags: ['L1'],
        lastScan: '07/17/2025, 05:04:28',
        hasAlert: true
      },
      {
        name: 'GH_shipment-tracking-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.5K',
        totalFindings: JSON.stringify({ total: 9, C: 237, H: 618, M: 725, L: 22 }),
        labels: ['L1', 'Production'],
        tags: [],
        lastScan: '07/17/2025, 11:51:54',
        hasAlert: true
      },
      {
        name: 'GH_member-data-integration-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '1.1K',
        totalFindings: JSON.stringify({ total: 9, C: 172, H: 482, M: 440, L: 67 }),
        labels: ['L1', 'Testing'],
        tags: [],
        lastScan: '06/24/2025, 10:53:38',
        hasAlert: true
      },
      {
        name: 'GH_cv-reforge-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '856',
        totalFindings: JSON.stringify({ total: 6, C: 119, H: 491, M: 240, L: 12 }),
        labels: ['L1', 'Development'],
        tags: [],
        lastScan: '06/19/2025, 06:20:03',
        hasAlert: false
      },
      {
        name: 'kubernetes-dockerhub-jmm2-airflow-lineage',
        projects: 5,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '407',
        totalFindings: JSON.stringify({ total: 14, C: 82, H: 161, M: 150, L: 8 }),
        labels: ['Production'],
        tags: [],
        lastScan: '05/21/2025, 12:34:01',
        hasAlert: false
      },
      {
        name: 'k8s-gccio',
        projects: 8,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '311',
        totalFindings: JSON.stringify({ total: 9, C: 61, H: 196, M: 45, L: 3 }),
        labels: ['Testing'],
        tags: [],
        lastScan: '05/21/2025, 11:57:00',
        hasAlert: false
      },
      {
        name: 'GH_communication-service',
        projects: 1,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '206',
        totalFindings: JSON.stringify({ total: 0, C: 30, H: 35, M: 141, L: 7 }),
        labels: ['L1', 'Development'],
        tags: ['L1'],
        lastScan: '07/17/2025, 10:36:37',
        hasAlert: true
      },
      {
        name: 'GH_hinge-health',
        projects: 13,
        violatingFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
        riskFactors: '157',
        totalFindings: JSON.stringify({ total: 0, C: 58, H: 69, M: 30, L: 2 }),
        labels: ['Production'],
        tags: [],
        lastScan: '07/09/2025, 07:22:28',
        hasAlert: true
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
}

export const storage = new MemStorage();
