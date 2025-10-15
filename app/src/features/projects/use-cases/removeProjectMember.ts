/**
 * Remove Project Member Use Case
 */

import { z } from 'zod';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

const UuidSchema = z.string().uuid();

export async function removeProjectMember(
  userId: string,
  projectId: string,
  memberId: string
): Promise<void> {
  // Validate UUIDs
  UuidSchema.parse(projectId);
  UuidSchema.parse(memberId);

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

  // Check if user is removing themselves (allowed without permission)
  const isSelfRemoval = userId === memberId;

  // If not self-removal, check permissions
  if (!isSelfRemoval) {
    const permissions = await getUserPermissionsInOrganization(
      userId,
      project.organization_id
    );
    if (!permissions.includes('project.members.remove')) {
      throw new Error('FORBIDDEN');
    }
  }

  // Check target user is a member
  const isMember = await projectService.isProjectMember(projectId, memberId);
  if (!isMember) {
    throw new Error('USER_NOT_MEMBER');
  }

  // Remove member
  await projectService.removeProjectMember(projectId, memberId);
}
