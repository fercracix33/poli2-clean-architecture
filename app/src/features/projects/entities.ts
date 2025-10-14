import { z } from 'zod';

// ============================================
// PROJECT SCHEMAS
// ============================================

/**
 * Main Project Schema
 * Represents a project within an organization
 */
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(/^[a-z0-9\-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens and underscores"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional().nullable(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold'], {
    errorMap: () => ({ message: "Status must be one of: active, archived, completed, on_hold" })
  }),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX color (#RRGGBB)")
    .optional()
    .nullable(),
  icon: z.string().max(50, "Icon cannot exceed 50 characters").optional().nullable(),
  is_favorite: z.boolean(),
  settings: z.record(z.any()).optional().nullable(),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
  archived_at: z.date().optional().nullable(),
});

/**
 * Project Member Schema
 * Represents a user's membership in a project
 */
export const ProjectMemberSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  joined_at: z.date(),
  invited_by: z.string().uuid().optional().nullable(),
});

// ============================================
// OPERATIONAL SCHEMAS
// ============================================

/**
 * Schema for creating a new project
 * Omits auto-generated and metadata fields
 */
export const ProjectCreateSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9\-_]+$/),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold']).default('active'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  is_favorite: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
});

/**
 * Schema for updating an existing project
 * All fields are optional except those that shouldn't change
 */
export const ProjectUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  is_favorite: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
});

/**
 * Schema for adding a member to a project
 */
export const ProjectMemberCreateSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
});

/**
 * Schema for project filters/search
 */
export const ProjectFilterSchema = z.object({
  organization_id: z.string().uuid(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold']).optional(),
  is_favorite: z.boolean().optional(),
  search: z.string().optional(), // Search in name and description
  created_by: z.string().uuid().optional(),
});

// ============================================
// EXTENDED SCHEMAS WITH RELATIONS
// ============================================

/**
 * Project with member count
 */
export const ProjectWithStatsSchema = ProjectSchema.extend({
  member_count: z.number().int().nonnegative(),
  creator_name: z.string().optional(),
});

/**
 * Project member with user details
 */
export const ProjectMemberWithUserSchema = ProjectMemberSchema.extend({
  user_email: z.string().email(),
  user_name: z.string(),
  user_avatar_url: z.string().url().optional().nullable(),
  role_name: z.string(),
});

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
export type ProjectMemberCreate = z.infer<typeof ProjectMemberCreateSchema>;
export type ProjectFilter = z.infer<typeof ProjectFilterSchema>;
export type ProjectWithStats = z.infer<typeof ProjectWithStatsSchema>;
export type ProjectMemberWithUser = z.infer<typeof ProjectMemberWithUserSchema>;

// ============================================
// TYPE GUARDS
// ============================================

export function isValidProjectStatus(status: string): status is Project['status'] {
  return ['active', 'archived', 'completed', 'on_hold'].includes(status);
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
