/**
 * Auth Feature - Entities
 *
 * Pure data contracts for user authentication and profiles.
 * NO business logic, NO external dependencies (except Zod).
 *
 * Updated by: Architect Agent (Architectural Refactoring Phase 0)
 * Date: 2025-10-10
 * Changes: Removed organization-related schemas (moved to features/organizations/entities.ts)
 */

import { z } from 'zod';

// ============================================================================
// USER PROFILE ENTITY
// ============================================================================

/**
 * UserProfile represents user account information.
 * Extends Supabase auth.users table with custom profile data.
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  avatar_url: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

/**
 * Schema for updating user profile
 * Only name and avatar_url are editable
 */
export const UserProfileUpdateSchema = UserProfileSchema.pick({
  name: true,
  avatar_url: true,
}).partial();

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isUserProfile(value: unknown): value is UserProfile {
  return UserProfileSchema.safeParse(value).success;
}
