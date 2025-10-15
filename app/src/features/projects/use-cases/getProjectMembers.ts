/**
 * Get Project Members Use Case
 */

import { z } from 'zod';
import type { ProjectMember } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

const ProjectIdSchema = z.string().uuid();

export async function getProjectMembers(
  userId: string,
  projectId: string
): Promise<ProjectMember[]> {
  // Validate project ID
  const validationResult = ProjectIdSchema.safeParse(projectId);
  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  // Get project
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new Error('NOT_FOUND');
  }

  // Check user is member of organization
  const isMember = await isUserMemberOfOrganization(userId, project.organization_id);
  if (!isMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check permissions
  const permissions = await getUserPermissionsInOrganization(userId, project.organization_id);
  if (!permissions.includes('project.members.view')) {
    throw new Error('FORBIDDEN');
  }

  // Get members
  const members = await projectService.getProjectMembers(projectId);

  return members;
}
