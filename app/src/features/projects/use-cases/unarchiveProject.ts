/**
 * Unarchive Project Use Case
 */

import { z } from 'zod';
import type { Project } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

const ProjectIdSchema = z.string().uuid();

export async function unarchiveProject(
  userId: string,
  projectId: string
): Promise<Project> {
  // Validate project ID
  const validationResult = ProjectIdSchema.safeParse(projectId);
  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  // Get existing project
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new Error('NOT_FOUND');
  }

  // Check if not archived
  if (project.status !== 'archived') {
    throw new Error('NOT_ARCHIVED');
  }

  // Check membership
  const isMember = await isUserMemberOfOrganization(userId, project.organization_id);
  if (!isMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check permissions
  const permissions = await getUserPermissionsInOrganization(userId, project.organization_id);
  if (!permissions.includes('project.update')) {
    throw new Error('FORBIDDEN');
  }

  // Unarchive project
  const unarchivedProject = await projectService.unarchiveProject(projectId);

  return unarchivedProject;
}
