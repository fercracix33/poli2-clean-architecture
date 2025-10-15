/**
 * Add Project Member Use Case
 */

import { ProjectMemberCreateSchema, type ProjectMemberCreate } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

export async function addProjectMember(
  userId: string,
  data: ProjectMemberCreate
): Promise<void> {
  // Validate input
  const validationResult = ProjectMemberCreateSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  const validatedData = validationResult.data;

  // Get project to verify it exists and get organization_id
  const project = await projectService.getProjectById(validatedData.project_id);
  if (!project) {
    throw new Error('NOT_FOUND');
  }

  // Check requesting user is member of organization
  const isRequestingUserMember = await isUserMemberOfOrganization(
    userId,
    project.organization_id
  );
  if (!isRequestingUserMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check requesting user has permission
  const permissions = await getUserPermissionsInOrganization(
    userId,
    project.organization_id
  );
  if (!permissions.includes('project.members.add')) {
    throw new Error('FORBIDDEN');
  }

  // Check new user is member of organization
  const isNewUserMember = await isUserMemberOfOrganization(
    validatedData.user_id,
    project.organization_id
  );
  if (!isNewUserMember) {
    throw new Error('USER_NOT_IN_ORGANIZATION');
  }

  // Check if user is already a member
  const isAlreadyMember = await projectService.isProjectMember(
    validatedData.project_id,
    validatedData.user_id
  );
  if (isAlreadyMember) {
    throw new Error('ALREADY_MEMBER');
  }

  // Add member with invited_by set to requesting user
  await projectService.addProjectMember({
    ...validatedData,
    invited_by: userId,
  });
}
