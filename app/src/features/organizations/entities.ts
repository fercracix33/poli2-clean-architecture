/**
 * Organizations Feature - Entities
 *
 * Pure data contracts defined with Zod schemas.
 * NO business logic, NO external dependencies (except Zod).
 *
 * Created by: Architect Agent (Architectural Refactoring Phase 0)
 * Date: 2025-10-10
 * Moved from: features/auth/entities.ts
 */

import { z } from 'zod';

// ============================================================================
// ORGANIZATION ENTITY
// ============================================================================

/**
 * Organization represents a multi-tenant workspace.
 * Each organization has members with roles and permissions.
 */
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Solo letras, números, espacios, guiones y guiones bajos"),
  slug: z.string()
    .min(2, "Identificador debe tener al menos 2 caracteres")
    .max(50, "Identificador no puede exceder 50 caracteres")
    .regex(/^[a-z0-9\-_]+$/, "Solo letras minúsculas, números, guiones y guiones bajos"),
  invite_code: z.string().length(8, "Código debe tener exactamente 8 caracteres"),
  description: z.string().max(500, "Descripción no puede exceder 500 caracteres").optional(),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

/**
 * Schema for creating new organizations
 * Omits auto-generated fields (id, invite_code, created_by, timestamps)
 */
export const OrganizationCreateSchema = OrganizationSchema.omit({
  id: true,
  invite_code: true,
  created_by: true,
  created_at: true,
  updated_at: true,
});

/**
 * Schema for updating organization details
 * Only name and description are editable
 */
export const OrganizationUpdateSchema = OrganizationSchema.pick({
  name: true,
  description: true,
}).partial();

/**
 * Schema for joining an organization via invite
 */
export const OrganizationJoinSchema = z.object({
  slug: z.string().min(2).max(50),
  invite_code: z.string().length(8),
});

// ============================================================================
// ORGANIZATION MEMBER ENTITY
// ============================================================================

/**
 * OrganizationMember represents user membership in an organization
 * Links users to organizations with a specific role
 */
export const OrganizationMemberSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  joined_at: z.date(),
  invited_by: z.string().uuid().optional(),
});

// ============================================================================
// PERMISSION ENTITY
// ============================================================================

/**
 * Permission represents a granular access right
 * Scalable for future features (projects, tasks, etc.)
 */
export const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  resource: z.string().min(1).max(50), // e.g., "organization", "project", "task"
  action: z.string().min(1).max(50), // e.g., "create", "read", "update", "delete", "manage"
  created_at: z.date(),
});

// ============================================================================
// ROLE ENTITY
// ============================================================================

/**
 * Role groups permissions together
 * Can be system-wide or organization-specific
 */
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organization_id: z.string().uuid().optional(), // null = system role
  is_system_role: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

/**
 * RolePermission links roles to permissions (many-to-many)
 */
export const RolePermissionSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationUpdate = z.infer<typeof OrganizationUpdateSchema>;
export type OrganizationJoin = z.infer<typeof OrganizationJoinSchema>;

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;

// ============================================================================
// TYPE GUARDS (for runtime checking)
// ============================================================================

export function isOrganization(value: unknown): value is Organization {
  return OrganizationSchema.safeParse(value).success;
}

export function isOrganizationCreate(value: unknown): value is OrganizationCreate {
  return OrganizationCreateSchema.safeParse(value).success;
}
