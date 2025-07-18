import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
});

// Mend SCA findings table
export const mendScaFindings = pgTable("mend_sca_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Mend SAST findings table
export const mendSastFindings = pgTable("mend_sast_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Mend Containers findings table
export const mendContainersFindings = pgTable("mend_containers_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Escape Web Applications findings table
export const escapeWebAppsFindings = pgTable("escape_webapps_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

// Escape APIs findings table
export const escapeApisFindings = pgTable("escape_apis_findings", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  scanDate: text("scan_date").notNull(),
  critical: integer("critical").notNull().default(0),
  high: integer("high").notNull().default(0),
  medium: integer("medium").notNull().default(0),
  low: integer("low").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
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
