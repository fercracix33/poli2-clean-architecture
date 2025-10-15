/**
 * Get Project By Slug Use Case
 *
 * Business logic for retrieving a project by organization and slug.
 */

import { z } from 'zod';
import type { Project } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

const OrganizationIdSchema = z.string().uuid();

export async function getProjectBySlug(
  userId: string,
  organizationId: string,
  slug: string
): Promise<Project> {
  // Validate organization ID
  const validationResult = OrganizationIdSchema.safeParse(organizationId);
  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  // Check membership
  const isMember = await isUserMemberOfOrganization(userId, organizationId);
  if (!isMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check permissions
  const permissions = await getUserPermissionsInOrganization(userId, organizationId);
  if (!permissions.includes('project.read')) {
    throw new Error('FORBIDDEN');
  }

  // Retrieve project
  const project = await projectService.getProjectBySlug(organizationId, slug);
  if (!project) {
    throw new Error('NOT_FOUND');
  }

  return project;
}
