import { z } from 'zod';

// Usuario base (extiende auth.users de Supabase)
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  avatar_url: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

// Organización
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

// Miembro de organización
export const OrganizationMemberSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  joined_at: z.date(),
  invited_by: z.string().uuid().optional(),
});

// Permiso base (escalable para futuras features)
export const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  resource: z.string().min(1).max(50), // ej: "organization", "project", "task"
  action: z.string().min(1).max(50), // ej: "create", "read", "update", "delete", "manage"
  created_at: z.date(),
});

// Rol (agrupa permisos)
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organization_id: z.string().uuid().optional(), // null = rol del sistema
  is_system_role: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

// Relación rol-permiso
export const RolePermissionSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
});

// Schemas para operaciones
export const OrganizationCreateSchema = OrganizationSchema.omit({
  id: true,
  invite_code: true,
  created_by: true,
  created_at: true,
  updated_at: true,
});

export const OrganizationJoinSchema = z.object({
  slug: z.string().min(2).max(50),
  invite_code: z.string().length(8),
});

export const UserProfileUpdateSchema = UserProfileSchema.pick({
  name: true,
  avatar_url: true,
}).partial();

// Tipos TypeScript
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationJoin = z.infer<typeof OrganizationJoinSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;