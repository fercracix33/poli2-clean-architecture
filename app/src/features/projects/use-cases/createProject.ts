/**
 * Create Project Use Case
 *
 * Business logic for creating new projects within an organization.
 * Validates input, checks permissions, enforces business rules, and orchestrates
 * calls to data services.
 *
 * Implementer Agent - TDD Green Phase
 * Date: 2025-10-15
 */

import { ProjectCreateSchema, type ProjectCreate, type Project } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
  getRoleByNameFromDB,
} from '@/features/organizations/services/organization.service';

// Business rules constants
const MAX_PROJECTS_PER_ORGANIZATION = 1000;
const PROJECT_ADMIN_ROLE_NAME = 'Admin'; // Default admin role

/**
 * Create a new project
 *
 * @param userId - ID of the user creating the project
 * @param data - Project creation data
 * @returns Created project
 * @throws Error with specific codes: VALIDATION_ERROR, FORBIDDEN, NOT_MEMBER_OF_ORGANIZATION,
 *         SLUG_ALREADY_EXISTS, MAX_PROJECTS_REACHED
 */
export async function createProject(
  userId: string,
  data: ProjectCreate
): Promise<Project> {
  // ==============================
  // 1. VALIDATION (Zod)
  // ==============================
  const validationResult = ProjectCreateSchema.safeParse(data);

  if (!validationResult.success) {
    // Extract meaningful error message from Zod
    const firstError = validationResult.error.issues[0];
    const errorMessage = firstError.message;

    // Check if it's missing required field
    if (firstError.code === 'invalid_type' && firstError.path.includes('name')) {
      throw new Error('name is required');
    }

    // Throw with Zod error message
    throw new Error(errorMessage);
  }

  const validatedData = validationResult.data;

  // ==============================
  // 2. SANITIZATION & TRANSFORMATION
  // ==============================
  const sanitizedData = {
    ...validatedData,
    name: validatedData.name.trim(),
    slug: validatedData.slug.toLowerCase().trim(),
    description: validatedData.description?.trim() || undefined, // Empty string → undefined
    color: validatedData.color?.trim() || undefined,
    icon: validatedData.icon?.trim() || undefined,
  };

  // ==============================
  // 3. AUTHORIZATION - Check if user is member of organization
  // ==============================
  const isMember = await isUserMemberOfOrganization(userId, sanitizedData.organization_id);

  if (!isMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // ==============================
  // 4. AUTHORIZATION - Check permissions
  // ==============================
  const permissions = await getUserPermissionsInOrganization(userId, sanitizedData.organization_id);

  if (!permissions.includes('project.create')) {
    throw new Error('FORBIDDEN');
  }

  // ==============================
  // 5. BUSINESS RULE - Enforce project limit
  // ==============================
  const projectCount = await projectService.getProjectCount(
    sanitizedData.organization_id
  );

  if (projectCount >= MAX_PROJECTS_PER_ORGANIZATION) {
    throw new Error('MAX_PROJECTS_REACHED');
  }

  // ==============================
  // 6. BUSINESS RULE - Ensure unique slug
  // ==============================
  const slugAvailable = await projectService.isSlugAvailable(
    sanitizedData.organization_id,
    sanitizedData.slug
  );

  if (!slugAvailable) {
    throw new Error('SLUG_ALREADY_EXISTS');
  }

  // ==============================
  // 7. CREATE PROJECT
  // ==============================
  let createdProject: Project;

  try {
    createdProject = await projectService.createProject({
      ...sanitizedData,
      created_by: userId,
    });
  } catch (error: any) {
    // Handle unique constraint violation (race condition)
    if (error.message.includes('unique constraint')) {
      throw new Error('SLUG_ALREADY_EXISTS');
    }

    // Re-throw with context
    throw new Error(`Failed to create project: ${error.message}`);
  }

  // ==============================
  // 8. AUTO-ADD CREATOR AS MEMBER
  // ==============================
  try {
    // Get admin role for the organization (or default admin role)
    const adminRole = await getRoleByNameFromDB(
      PROJECT_ADMIN_ROLE_NAME,
      sanitizedData.organization_id
    );

    if (!adminRole) {
      // Fallback: Try to get the default admin role
      const defaultAdminRole = await getRoleByNameFromDB(PROJECT_ADMIN_ROLE_NAME);

      if (!defaultAdminRole) {
        throw new Error('Admin role not found for project member assignment');
      }

      await projectService.addProjectMember({
        project_id: createdProject.id,
        user_id: userId,
        role_id: defaultAdminRole.id,
        invited_by: userId,
      });
    } else {
      await projectService.addProjectMember({
        project_id: createdProject.id,
        user_id: userId,
        role_id: adminRole.id,
        invited_by: userId,
      });
    }
  } catch (memberError: any) {
    // ==============================
    // 9. ROLLBACK - Delete project if member addition fails
    // ==============================
    try {
      await projectService.deleteProject(createdProject.id);
    } catch (deleteError) {
      // Log rollback failure but throw original error
      console.error('Failed to rollback project creation:', deleteError);
    }

    throw new Error(`Failed to add creator as member: ${memberError.message}`);
  }

  return createdProject;
}
