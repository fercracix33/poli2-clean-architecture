/**
 * Update Project Member Role Use Case
 */

import { z } from 'zod';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

const UuidSchema = z.string().uuid();

export async function updateProjectMemberRole(
  userId: string,
  projectId: string,
  memberId: string,
  roleId: string
): Promise<void> {
  // Validate UUIDs
  UuidSchema.parse(projectId);
  UuidSchema.parse(memberId);
  UuidSchema.parse(roleId);

  // Get project
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new Error('NOT_FOUND');
  }

  // Check requesting user is member
  const isRequestingUserMember = await isUserMemberOfOrganization(
    userId,
    project.organization_id
  );
  if (!isRequestingUserMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check permissions
  const permissions = await getUserPermissionsInOrganization(
    userId,
    project.organization_id
  );
  if (!permissions.includes('project.members.update')) {
    throw new Error('FORBIDDEN');
  }

  // Check target user is a member
  const isMember = await projectService.isProjectMember(projectId, memberId);
  if (!isMember) {
    throw new Error('USER_NOT_MEMBER');
  }

  // Update role
  await projectService.updateProjectMemberRole(projectId, memberId, roleId);
}
