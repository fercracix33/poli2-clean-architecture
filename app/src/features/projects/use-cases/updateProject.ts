/**
 * Update Project Use Case
 */

import { z } from 'zod';
import { ProjectUpdateSchema, type ProjectUpdate, type Project } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

const ProjectIdSchema = z.string().uuid();

export async function updateProject(
  userId: string,
  projectId: string,
  data: ProjectUpdate
): Promise<Project> {
  // Validate project ID
  const idValidation = ProjectIdSchema.safeParse(projectId);
  if (!idValidation.success) {
    throw new Error(idValidation.error.issues[0].message);
  }

  // Validate update data
  const dataValidation = ProjectUpdateSchema.safeParse(data);
  if (!dataValidation.success) {
    throw new Error(dataValidation.error.issues[0].message);
  }

  const validatedData = dataValidation.data;

  // Get existing project
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new Error('NOT_FOUND');
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

  // Sanitize data
  const sanitizedData: ProjectUpdate = {};
  if (validatedData.name !== undefined) {
    sanitizedData.name = validatedData.name.trim();
  }
  if (validatedData.description !== undefined) {
    sanitizedData.description = validatedData.description?.trim() || undefined;
  }
  if (validatedData.status !== undefined) {
    sanitizedData.status = validatedData.status;
  }
  if (validatedData.color !== undefined) {
    sanitizedData.color = validatedData.color;
  }
  if (validatedData.icon !== undefined) {
    sanitizedData.icon = validatedData.icon;
  }
  if (validatedData.is_favorite !== undefined) {
    sanitizedData.is_favorite = validatedData.is_favorite;
  }
  if (validatedData.settings !== undefined) {
    sanitizedData.settings = validatedData.settings;
  }

  // Update project
  const updatedProject = await projectService.updateProject(projectId, sanitizedData);

  return updatedProject;
}
