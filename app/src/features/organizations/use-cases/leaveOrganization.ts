/**
 * Leave Organization Use Case
 *
 * Business logic for users leaving an organization.
 * Handles ownership restrictions and last admin checks.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-10
 * Phase: 2.1 - TDD Remediation (Green Phase)
 */

import * as organizationService from '../services/organization.service';

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

/**
 * Leave an organization
 *
 * Business Rules:
 * - Owner cannot leave (must transfer ownership or delete org first)
 * - Last admin cannot leave (must promote another admin first)
 * - Regular members can leave anytime
 * - Permissions are automatically revoked (RLS handles cascade)
 *
 * @param orgId - Organization ID
 * @param userId - User ID leaving the organization
 * @returns Success confirmation
 * @throws OrganizationError if validation fails or business rules violated
 */
export async function leaveOrganization(
  orgId: string,
  userId: string
): Promise<{ success: true }> {
  // Get organization
  const organization = await organizationService.getOrganizationByIdFromDB(orgId);

  if (!organization) {
    throw new OrganizationError('Organization not found', 'ORGANIZATION_NOT_FOUND');
  }

  // Check if user is member
  const isMember = await organizationService.isUserMemberOfOrganization(
    userId,
    orgId
  );

  if (!isMember) {
    throw new OrganizationError(
      'You are not a member of this organization',
      'NOT_A_MEMBER'
    );
  }

  // Check if user is owner (owner cannot leave)
  if (organization.created_by === userId) {
    throw new OrganizationError(
      'The owner cannot leave the organization. You must transfer ownership or delete the organization first.',
      'OWNER_CANNOT_LEAVE'
    );
  }

  // Get user role to check if admin
  const userRole = await organizationService.getUserRoleInOrganization(userId, orgId);

  // If user is an admin, check if they're the last admin
  if (userRole) {
    // Extract role name (service might return string or object)
    const roleName = typeof userRole === 'string' ? userRole : (userRole as any).name;

    if (roleName === 'organization_admin') {
      // Get role ID from the userRole object (if it has an id field)
      const roleId = typeof userRole === 'string' ? null : (userRole as any).id;

      if (roleId) {
        // Count admins using the role ID
        const adminCount = await organizationService.countOrganizationAdminsFromDB(
          orgId,
          roleId
        );

        if (adminCount <= 1) {
          throw new OrganizationError(
            'Cannot leave: you are the last administrator. Please promote another member to admin first.',
            'LAST_ADMIN'
          );
        }
      }
    }
  }

  // Remove user from organization
  await organizationService.removeUserFromOrganizationInDB(orgId, userId);

  return { success: true };
}
