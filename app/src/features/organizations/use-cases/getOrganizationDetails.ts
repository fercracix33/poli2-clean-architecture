/**
 * Get Organization Details Use Case
 *
 * Business logic for retrieving organization details with user role and permissions.
 * Validates user membership and returns complete organization information.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-10
 * Phase: 2.1 - TDD Remediation (Green Phase)
 */

import { z } from 'zod';
import * as organizationService from '../services/organization.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SlugSchema = z.string().min(1, 'Slug cannot be empty').refine(
  (slug) => slug === slug.toLowerCase(),
  { message: 'Slug must be lowercase' }
);

const UserIdSchema = z.string().uuid('Invalid User ID format');

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class OrganizationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'OrganizationError';
  }
}

// ============================================================================
// USE CASE
// ============================================================================

export interface OrganizationDetails {
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    invite_code: string;
    created_by: string;
    created_at: Date;
    updated_at: Date | undefined;
  };
  userRole: string;
  isOwner: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
  canEditSettings: boolean;
}

/**
 * Get organization details by slug
 *
 * @param slug - Organization slug (must be lowercase)
 * @param userId - User ID requesting details
 * @returns Organization details with user role and permissions
 * @throws OrganizationError if validation fails, org not found, or access denied
 */
export async function getOrganizationDetails(
  slug: string,
  userId: string
): Promise<OrganizationDetails> {
  // Validate inputs
  const slugValidation = SlugSchema.safeParse(slug);
  if (!slugValidation.success) {
    throw new OrganizationError(
      slugValidation.error.errors[0].message,
      'VALIDATION_ERROR'
    );
  }

  const userIdValidation = UserIdSchema.safeParse(userId);
  if (!userIdValidation.success) {
    throw new OrganizationError(
      userIdValidation.error.errors[0].message,
      'VALIDATION_ERROR'
    );
  }

  // Get organization by slug
  const organization = await organizationService.getOrganizationBySlugFromDB(slug);

  if (!organization) {
    throw new OrganizationError('Organization not found', 'ORGANIZATION_NOT_FOUND');
  }

  // Check if user is member
  const isMember = await organizationService.isUserMemberOfOrganization(
    userId,
    organization.id
  );

  if (!isMember) {
    throw new OrganizationError(
      'You are not a member of this organization',
      'ACCESS_DENIED'
    );
  }

  // Get user role in organization
  const roleResult = await organizationService.getUserRoleInOrganization(
    userId,
    organization.id
  );

  if (!roleResult) {
    throw new OrganizationError(
      'Could not determine user role',
      'ROLE_NOT_FOUND'
    );
  }

  // Get user permissions
  const permissions = await organizationService.getUserPermissionsInOrganization(
    userId,
    organization.id
  );

  // Extract role name from result (service returns role object)
  const roleName = typeof roleResult === 'string' ? roleResult : (roleResult as any).name;

  // Determine role flags
  const isOwner = organization.created_by === userId;
  const isAdmin =
    roleName === 'organization_admin' || roleName === 'organization_owner' || isOwner;
  const canManageMembers = permissions.includes('user.manage') || isOwner;
  const canEditSettings =
    permissions.includes('organization.update') || permissions.includes('organization.manage') || isOwner;

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description || null,
      invite_code: organization.invite_code,
      created_by: organization.created_by,
      created_at: organization.created_at,
      updated_at: organization.updated_at,
    },
    userRole: roleName,
    isOwner,
    isAdmin,
    canManageMembers,
    canEditSettings,
  };
}
