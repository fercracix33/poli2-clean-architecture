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
  getOrganizationBySlugFromDB,
} from '@/features/organizations/services/organization.service';

const OrganizationSlugSchema = z.string().min(2).max(50).regex(/^[a-z0-9\-_]+$/);

export async function getProjectBySlug(
  userId: string,
  organizationSlug: string,
  slug: string
): Promise<Project> {
  // Validate organization slug format
  const validationResult = OrganizationSlugSchema.safeParse(organizationSlug);
  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  // Convert organization slug to UUID
  const organization = await getOrganizationBySlugFromDB(organizationSlug);
  if (!organization) {
    throw new Error('NOT_FOUND');
  }

  const organizationId = organization.id;

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
