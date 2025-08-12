import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(), // This will be the email
  status: text("status").notNull().default("Active"), // Active, Disabled
  type: text("type").notNull().default("User"), // User, Admin
  password: text("password").notNull(), // Legacy plaintext password (to be removed after migration)
  passwordHash: text("password_hash"), // New hashed password
  passwordAlgo: text("password_algo").default("argon2id"), // Hashing algorithm used
  passwordUpdatedAt: timestamp("password_updated_at"), // When password was last updated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  riskScore: text("risk_score").notNull(),
  labels: text("labels").array(),
  tags: text("tags").array(),
  hasAlert: boolean("has_alert").default(false),
  // Service details
  githubRepo: text("github_repo"),
  jiraProject: text("jira_project"),
  serviceOwner: text("service_owner"),
  slackChannel: text("slack_channel"),
  description: text("description"),
  // Scanner URLs
  mendUrl: text("mend_url"),
  crowdstrikeUrl: text("crowdstrike_url"),
  escapeUrl: text("escape_url"),
});

// Mend SCA findings table
export const mendScaFindings = pgTable("mend_sca_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Mend SAST findings table
export const mendSastFindings = pgTable("mend_sast_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Mend Containers findings table
export const mendContainersFindings = pgTable("mend_containers_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Escape Web Applications findings table
export const escapeWebAppsFindings = pgTable("escape_webapps_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Escape APIs findings table
export const escapeApisFindings = pgTable("escape_apis_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Crowdstrike Images findings table
export const crowdstrikeImagesFindings = pgTable("crowdstrike_images_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Crowdstrike Containers findings table
export const crowdstrikeContainersFindings = pgTable("crowdstrike_containers_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Risk assessments table
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull().unique(),
  // Data Classification Factors
  dataClassification: text("data_classification"),
  phi: text("phi"),
  eligibilityData: text("eligibility_data"),
  // CIA Triad
  confidentialityImpact: text("confidentiality_impact"),
  integrityImpact: text("integrity_impact"),
  availabilityImpact: text("availability_impact"),
  // Attack Surface Factors
  publicEndpoint: text("public_endpoint"),
  discoverability: text("discoverability"),
  awareness: text("awareness"),
  // Calculated scores
  dataClassificationScore: integer("data_classification_score").default(0),
  ciaTriadScore: integer("cia_triad_score").default(0),
  attackSurfaceScore: integer("attack_surface_score").default(0),
  finalRiskScore: real("final_risk_score").default(0),
  riskLevel: text("risk_level").default("Low"),
  // Metadata
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: text("updated_by"),
});

// Activity logs table for tracking user actions
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  action: text("action").notNull(), // CREATE_SERVICE, DELETE_SERVICE, EXPORT_DATA, UPDATE_RISK_SCORE, etc.
  serviceName: text("service_name"), // Optional - for service-related actions
  details: text("details"), // Additional context or data
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
});

export const insertMendScaFindingsSchema = createInsertSchema(mendScaFindings).omit({
  id: true,
});

export const insertMendSastFindingsSchema = createInsertSchema(mendSastFindings).omit({
  id: true,
});

export const insertMendContainersFindingsSchema = createInsertSchema(mendContainersFindings).omit({
  id: true,
});

export const insertEscapeWebAppsFindingsSchema = createInsertSchema(escapeWebAppsFindings).omit({
  id: true,
});

export const insertEscapeApisFindingsSchema = createInsertSchema(escapeApisFindings).omit({
  id: true,
});

export const insertCrowdstrikeImagesFindingsSchema = createInsertSchema(crowdstrikeImagesFindings).omit({
  id: true,
});

export const insertCrowdstrikeContainersFindingsSchema = createInsertSchema(crowdstrikeContainersFindings).omit({
  id: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  lastUpdated: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type MendScaFinding = typeof mendScaFindings.$inferSelect;
export type InsertMendScaFinding = z.infer<typeof insertMendScaFindingsSchema>;
export type MendSastFinding = typeof mendSastFindings.$inferSelect;
export type InsertMendSastFinding = z.infer<typeof insertMendSastFindingsSchema>;
export type MendContainersFinding = typeof mendContainersFindings.$inferSelect;
export type InsertMendContainersFinding = z.infer<typeof insertMendContainersFindingsSchema>;
export type EscapeWebAppsFinding = typeof escapeWebAppsFindings.$inferSelect;
export type InsertEscapeWebAppsFinding = z.infer<typeof insertEscapeWebAppsFindingsSchema>;
export type EscapeApisFinding = typeof escapeApisFindings.$inferSelect;
export type InsertEscapeApisFinding = z.infer<typeof insertEscapeApisFindingsSchema>;
export type CrowdstrikeImagesFinding = typeof crowdstrikeImagesFindings.$inferSelect;
export type InsertCrowdstrikeImagesFinding = z.infer<typeof insertCrowdstrikeImagesFindingsSchema>;
export type CrowdstrikeContainersFinding = typeof crowdstrikeContainersFindings.$inferSelect;
export type InsertCrowdstrikeContainersFinding = z.infer<typeof insertCrowdstrikeContainersFindingsSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Analytics and reporting types
export interface SecurityMetrics {
  totalApplications: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  averageRiskScore: number;
  complianceRate: number;
}

export interface TrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ComplianceMetric {
  tag: string;
  coverage: number;
  applications: string[];
}
