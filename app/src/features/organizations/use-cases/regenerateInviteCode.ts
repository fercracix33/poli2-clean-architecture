/**
 * Regenerate Invite Code Use Case
 *
 * Business logic for regenerating organization invite code.
 * Only organization owner can regenerate the code.
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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random 8-character alphanumeric invite code
 * Format: uppercase letters and numbers (e.g., ABC12345)
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// USE CASE
// ============================================================================

/**
 * Regenerate organization invite code
 *
 * @param orgId - Organization ID
 * @param userId - User ID performing regeneration
 * @returns New invite code
 * @throws OrganizationError if org not found, user is not owner, or code generation fails
 */
export async function regenerateInviteCode(
  orgId: string,
  userId: string
): Promise<{ invite_code: string }> {
  // Get organization
  const organization = await organizationService.getOrganizationByIdFromDB(orgId);

  if (!organization) {
    throw new OrganizationError('Organization not found', 'ORGANIZATION_NOT_FOUND');
  }

  // Check if user is the owner (only owner can regenerate invite code)
  if (organization.created_by !== userId) {
    throw new OrganizationError(
      'Only the owner can regenerate the invite code',
      'ACCESS_DENIED'
    );
  }

  // Generate new unique invite code
  // Retry up to 5 times if collision occurs
  let newCode: string | null = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (!newCode && attempts < maxAttempts) {
    const candidate = generateInviteCode();

    try {
      // Attempt to update with new code
      const updated = await organizationService.updateOrganizationInDB(orgId, {
        invite_code: candidate,
      } as any);

      newCode = updated.invite_code;
    } catch (error) {
      // If duplicate error, retry with new code
      if (error instanceof Error && error.message.includes('Duplicate invite code')) {
        attempts++;
        continue;
      }

      // If other error, re-throw
      throw error;
    }
  }

  if (!newCode) {
    throw new OrganizationError(
      'Could not generate unique invite code. Please try again.',
      'CODE_GENERATION_FAILED'
    );
  }

  return { invite_code: newCode };
}
