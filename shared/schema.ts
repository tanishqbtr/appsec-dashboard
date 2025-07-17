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
  projects: integer("projects").notNull(),
  violatingFindings: text("violating_findings").notNull(), // JSON string
  riskFactors: text("risk_factors").notNull(),
  riskScore: text("risk_score").notNull(),
  totalFindings: text("total_findings").notNull(), // JSON string
  labels: text("labels").array(),
  tags: text("tags").array(),
  lastScan: text("last_scan").notNull(),
  hasAlert: boolean("has_alert").default(false),
  scanEngine: text("scan_engine").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

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
