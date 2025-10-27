/**
 * RBAC Foundation Entities
 *
 * Pure data contracts defined with Zod schemas for the RBAC modular permissions system.
 * Phase 1: Foundation - Core entities for workspaces, roles, permissions, and features.
 *
 * NO business logic, NO external dependencies (except Zod).
 * All schemas follow latest Zod best practices from Context7.
 */

import { z } from 'zod';
import type { MongoAbility } from '@casl/ability';

// ============================================================================
// WORKSPACE ENTITIES
// ============================================================================

/**
 * Workspace Schema
 *
 * Represents an isolated workspace (organization or project) in the multi-tenant system.
 * Every feature and permission is scoped to a workspace.
 */
export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Workspace name is required').max(100, 'Workspace name too long'),
  owner_id: z.string().uuid(), // References auth.users(id)
  created_at: z.string().datetime(), // ISO 8601 with Z
  updated_at: z.string().datetime(),
});

export const WorkspaceCreateSchema = WorkspaceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).strict();

export const WorkspaceUpdateSchema = WorkspaceSchema
  .omit({
    id: true,
    owner_id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
  .strict();

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceCreate = z.infer<typeof WorkspaceCreateSchema>;
export type WorkspaceUpdate = z.infer<typeof WorkspaceUpdateSchema>;

// ============================================================================
// ROLE ENTITIES
// ============================================================================

/**
 * System Roles (Immutable)
 *
 * These are the core system roles that cannot be deleted or modified.
 * - owner: Full control over workspace (bypass all permissions)
 * - admin: Administrative access with some restrictions
 * - member: Basic member access
 */
export const SYSTEM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

/**
 * Role Schema
 *
 * Represents a role that can be assigned to users within a workspace.
 * System roles have is_system=true and workspace_id=null.
 * Custom roles have is_system=false and belong to a specific workspace.
 */
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  is_system: z.boolean().default(false),
  workspace_id: z.string().uuid().nullable(), // null for system roles
  created_at: z.string().datetime(),
});

export const RoleCreateSchema = RoleSchema.omit({
  id: true,
  created_at: true,
}).strict();

export const RoleUpdateSchema = RoleSchema
  .omit({
    id: true,
    is_system: true, // Cannot change system flag
    workspace_id: true, // Cannot reassign to different workspace
    created_at: true,
  })
  .partial()
  .strict();

export type Role = z.infer<typeof RoleSchema>;
export type RoleCreate = z.infer<typeof RoleCreateSchema>;
export type RoleUpdate = z.infer<typeof RoleUpdateSchema>;

// ============================================================================
// FEATURE ENTITIES
// ============================================================================

/**
 * Feature Schema
 *
 * Represents a modular feature in the system (e.g., 'projects', 'tasks', 'kanban').
 * Features can be enabled/disabled per workspace and contain permissions.
 */
export const FeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Feature name is required').max(50, 'Feature name too long'), // e.g., 'projects', 'tasks'
  display_name: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  is_enabled: z.boolean().default(true),
  created_at: z.string().datetime(),
});

export const FeatureCreateSchema = FeatureSchema.omit({
  id: true,
  created_at: true,
}).strict();

export const FeatureUpdateSchema = FeatureSchema
  .omit({
    id: true,
    name: true, // Feature name is immutable (used as identifier)
    created_at: true,
  })
  .partial()
  .strict();

export type Feature = z.infer<typeof FeatureSchema>;
export type FeatureCreate = z.infer<typeof FeatureCreateSchema>;
export type FeatureUpdate = z.infer<typeof FeatureUpdateSchema>;

// ============================================================================
// PERMISSION ENTITIES
// ============================================================================

/**
 * Permission Actions
 *
 * Standard CRUD operations plus 'manage' for full control.
 * Custom actions can be added per feature (e.g., 'move' for Kanban cards).
 */
export const PermissionActionSchema = z.enum([
  'create',
  'read',
  'update',
  'delete',
  'manage', // Implies all other actions
]);

export type PermissionAction = z.infer<typeof PermissionActionSchema>;

/**
 * Permission Schema
 *
 * Represents a granular permission within a feature.
 * Format: {feature}.{resource}.{action}
 * Example: projects.Project.create
 *
 * Conditions are optional CASL conditions for field-level permissions.
 */
export const PermissionSchema = z.object({
  id: z.string().uuid(),
  feature_id: z.string().uuid(),
  action: PermissionActionSchema,
  resource: z.string().min(1, 'Resource is required').max(50, 'Resource name too long'), // e.g., 'Project', 'Task'
  description: z.string().max(500, 'Description too long').optional(),
  conditions: z.record(z.any()).optional(), // CASL conditions (JSONB)
  created_at: z.string().datetime(),
});

export const PermissionCreateSchema = PermissionSchema.omit({
  id: true,
  created_at: true,
}).strict();

export const PermissionUpdateSchema = PermissionSchema
  .omit({
    id: true,
    feature_id: true, // Cannot change feature
    action: true, // Cannot change action
    resource: true, // Cannot change resource
    created_at: true,
  })
  .partial()
  .strict();

export type Permission = z.infer<typeof PermissionSchema>;
export type PermissionCreate = z.infer<typeof PermissionCreateSchema>;
export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>;

// ============================================================================
// WORKSPACE USERS (MEMBERSHIP)
// ============================================================================

/**
 * Workspace User Schema
 *
 * Represents the many-to-many relationship between users and workspaces.
 * Each user has a role within the workspace.
 */
export const WorkspaceUserSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(), // References auth.users(id)
  role_id: z.string().uuid(),
  invited_by: z.string().uuid(), // Who invited this user
  joined_at: z.string().datetime(),
});

export const WorkspaceUserCreateSchema = WorkspaceUserSchema.omit({
  joined_at: true,
}).strict();

export const WorkspaceUserUpdateSchema = WorkspaceUserSchema
  .pick({
    role_id: true, // Can only update role
  })
  .strict();

export type WorkspaceUser = z.infer<typeof WorkspaceUserSchema>;
export type WorkspaceUserCreate = z.infer<typeof WorkspaceUserCreateSchema>;
export type WorkspaceUserUpdate = z.infer<typeof WorkspaceUserUpdateSchema>;

// ============================================================================
// ROLE PERMISSIONS (MANY-TO-MANY)
// ============================================================================

/**
 * Role Permission Schema
 *
 * Represents the many-to-many relationship between roles and permissions.
 */
export const RolePermissionSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  granted_at: z.string().datetime(),
});

export const RolePermissionCreateSchema = RolePermissionSchema.omit({
  granted_at: true,
}).strict();

export type RolePermission = z.infer<typeof RolePermissionSchema>;
export type RolePermissionCreate = z.infer<typeof RolePermissionCreateSchema>;

// ============================================================================
// USER ENTITY (from Supabase Auth)
// ============================================================================

/**
 * User Schema
 *
 * Represents a user from Supabase Auth.
 * is_super_admin is stored in app_metadata for security.
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  is_super_admin: z.boolean().default(false), // Stored in app_metadata
  created_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * User with Role
 *
 * Combines user information with their role in a specific workspace.
 */
export interface UserWithRole extends User {
  role: Role;
  workspace_id: string;
}

/**
 * Permission with Feature
 *
 * Combines permission with its parent feature information.
 */
export interface PermissionWithFeature extends Permission {
  feature: Feature;
}

// ============================================================================
// CASL INTEGRATION (Type Definitions Only - No Implementation)
// ============================================================================

/**
 * CASL Actions
 *
 * All possible actions in the CASL authorization system.
 * Matches PermissionAction but includes 'manage' for owner bypass.
 */
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * CASL Subjects
 *
 * All possible resources/subjects in the CASL authorization system.
 * These are PascalCase, singular form (CASL convention).
 *
 * Phase 1 includes only RBAC core resources.
 * Future phases will add feature-specific subjects (Project, Task, etc.).
 */
export type Subjects =
  | 'Workspace'
  | 'Role'
  | 'Permission'
  | 'Feature'
  | 'User'
  | 'all'; // Special: represents all resources

/**
 * App Ability Type
 *
 * The CASL Ability type for the application.
 * MongoAbility allows MongoDB-like query conditions.
 */
export type AppAbility = MongoAbility<[Actions, Subjects]>;

/**
 * Define Ability Input
 *
 * Input parameters for the defineAbilityFor function.
 * This function will be implemented by the Implementer Agent.
 */
export interface DefineAbilityInput {
  user: User;
  workspace: Workspace;
  permissions: Permission[]; // User's permissions in this workspace
}

/**
 * Define Ability Function Type
 *
 * Function signature for building CASL ability instances.
 * Implementation will be in features/rbac/abilities/defineAbility.ts
 *
 * @param input - User, workspace, and permissions
 * @returns CASL Ability instance with rules
 */
export type DefineAbilityFunction = (input: DefineAbilityInput) => Promise<AppAbility>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate if a string is a valid system role
 */
export function isSystemRole(role: string): role is SystemRole {
  return Object.values(SYSTEM_ROLES).includes(role as SystemRole);
}

/**
 * Validate if a role can be deleted
 * System roles cannot be deleted
 */
export function canDeleteRole(role: Role): boolean {
  return !role.is_system;
}

/**
 * Validate if a role can be modified
 * System roles have limited modification (only description)
 */
export function canModifyRole(role: Role): boolean {
  return !role.is_system;
}
