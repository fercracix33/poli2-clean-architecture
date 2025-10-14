/**
 * Update Organization Details Use Case
 *
 * Business logic for updating organization name and description.
 * Validates permissions and prevents slug modification.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-10
 * Phase: 2.1 - TDD Remediation (Green Phase)
 */

import { z } from 'zod';
import * as organizationService from '../services/organization.service';
import type { Organization } from '../entities';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const UpdateDataSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    slug: z.string().optional(), // For detection (will be rejected)
  })
  .strict();

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
 * Update organization details (name and/or description)
 *
 * @param orgId - Organization ID
 * @param userId - User ID performing update
 * @param data - Update data (name and/or description)
 * @returns Updated organization
 * @throws OrganizationError if validation fails, org not found, or access denied
 */
export async function updateOrganizationDetails(
  orgId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    slug?: string; // Type includes slug for detection
  }
): Promise<Organization> {
  // Check if trying to update slug (immutable)
  if ('slug' in data && data.slug !== undefined) {
    throw new OrganizationError('Slug cannot be modified', 'SLUG_IMMUTABLE');
  }

  // Validate input data
  const validation = UpdateDataSchema.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }

  // Get organization
  const organization = await organizationService.getOrganizationByIdFromDB(orgId);

  if (!organization) {
    throw new OrganizationError('Organization not found', 'ORGANIZATION_NOT_FOUND');
  }

  // Check permission (organization.update)
  const hasPermission = await organizationService.userHasPermissionInOrganization(
    userId,
    orgId,
    'organization.update'
  );

  if (!hasPermission) {
    throw new OrganizationError('Insufficient permissions', 'ACCESS_DENIED');
  }

  // Update organization (only pass allowed fields)
  const updatePayload: { name?: string; description?: string } = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.description !== undefined) updatePayload.description = data.description;

  const updatedOrganization = await organizationService.updateOrganizationInDB(
    orgId,
    updatePayload
  );

  return updatedOrganization;
}
