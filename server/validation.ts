import { z } from "zod";

export const ChangePasswordInput = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(12),
}).strict();
export type ChangePasswordDTO = z.infer<typeof ChangePasswordInput>;

export const CreateApplicationInput = z.object({
  name: z.string().min(1),
  // accept number or string, will be coerced to string at the route
  riskScore: z.union([z.number().min(0).max(100), z.string()]).optional(),
  labels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  githubRepo: z.string().url().optional(),
  jiraProject: z.string().optional(),
  serviceOwner: z.string().optional(),
  slackChannel: z.string().optional(),
  description: z.string().optional(),
}).strict();
export type CreateApplicationDTO = z.infer<typeof CreateApplicationInput>;

// Allow extra client-only metadata (e.g., riskScoreReason) but we'll whitelist on the route
export const UpdateApplicationInput = CreateApplicationInput.partial().passthrough();
export type UpdateApplicationDTO = z.infer<typeof UpdateApplicationInput>;

export const CreateUserInput = z.object({
  name: z.string().min(1),
  username: z.string().email(),
  password: z.string().min(12),
  type: z.enum(["User", "Admin"]).optional(),
  status: z.enum(["Active", "Disabled"]).optional(),
}).strict();
export type CreateUserDTO = z.infer<typeof CreateUserInput>;

export const UpdateUserInput = z.object({
  name: z.string().min(1).optional(),
  username: z.string().email().optional(),
  status: z.enum(["Active", "Disabled"]).optional(),
  type: z.enum(["User", "Admin"]).optional(),
}).strict();
export type UpdateUserDTO = z.infer<typeof UpdateUserInput>;

export const BulkDeleteUsersInput = z.object({
  userIds: z.array(z.number().int().positive()).min(1),
}).strict();
export type BulkDeleteUsersDTO = z.infer<typeof BulkDeleteUsersInput>;

export const CreateRiskAssessmentInput = z.object({
  serviceName: z.string().min(1),
  dataClassification: z.string().optional(),
  phi: z.string().optional(),
  eligibilityData: z.string().optional(),
  confidentialityImpact: z.string().optional(),
  integrityImpact: z.string().optional(),
  availabilityImpact: z.string().optional(),
  publicEndpoint: z.string().optional(),
  discoverability: z.string().optional(),
  awareness: z.string().optional(),
  // Optional calculated fields coming from client
  dataClassificationScore: z.coerce.number().optional(),
  ciaTriadScore: z.coerce.number().optional(),
  attackSurfaceScore: z.coerce.number().optional(),
  finalRiskScore: z.coerce.number().optional(),
  riskLevel: z.string().optional(),
  updatedBy: z.string().optional(),
}).strict();
export type CreateRiskAssessmentDTO = z.infer<typeof CreateRiskAssessmentInput>;


