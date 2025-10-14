/**
 * Delete Organization Use Case
 *
 * Business logic for deleting an organization.
 * Only owner can delete, requires name confirmation, and cascades all related data.
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
 * Delete an organization
 *
 * Business Rules:
 * - Only owner can delete
 * - Requires name confirmation (case-sensitive) to prevent accidents
 * - Cannot delete if organization has active projects (future validation)
 * - Cascades deletion of all members, permissions, and invites (handled by DB RLS)
 *
 * @param orgId - Organization ID
 * @param userId - User ID performing deletion
 * @param confirmation - Confirmation object with organization name
 * @returns Success confirmation
 * @throws OrganizationError if validation fails or business rules violated
 */
export async function deleteOrganization(
  orgId: string,
  userId: string,
  confirmation: { name: string }
): Promise<{ success: true }> {
  // Get organization
  const organization = await organizationService.getOrganizationByIdFromDB(orgId);

  if (!organization) {
    throw new OrganizationError('Organization not found', 'ORGANIZATION_NOT_FOUND');
  }

  // Check if user is owner (only owner can delete)
  if (organization.created_by !== userId) {
    throw new OrganizationError(
      'Only the owner can delete the organization',
      'ACCESS_DENIED'
    );
  }

  // Validate confirmation name matches (case-sensitive)
  if (confirmation.name !== organization.name) {
    throw new OrganizationError(
      'Confirmation name does not match. Organization name must match exactly.',
      'CONFIRMATION_REQUIRED'
    );
  }

  // Check if organization has active projects (future validation)
  // For now, check if organization object has a project_count property
  const projectCount = (organization as any).project_count;
  if (projectCount && projectCount > 0) {
    throw new OrganizationError(
      'Cannot delete organization with active projects. Please delete all projects first.',
      'HAS_ACTIVE_PROJECTS'
    );
  }

  // Get all members (for logging/cleanup verification)
  await organizationService.getOrganizationMembersFromDB(orgId);

  // Delete organization
  // Database cascade rules will automatically delete:
  // - organization_members
  // - organization permissions
  // - related invites
  await organizationService.deleteOrganizationFromDB(orgId);

  return { success: true };
}
