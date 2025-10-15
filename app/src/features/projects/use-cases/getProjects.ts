/**
 * Get Projects Use Case
 *
 * Business logic for retrieving projects with optional filters.
 * Validates filters, checks permissions, and retrieves projects from organization.
 *
 * Implementer Agent - TDD Green Phase
 * Date: 2025-10-15
 */

import { ProjectFilterSchema, type ProjectFilter, type Project } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

/**
 * Get projects for an organization with optional filters
 *
 * @param userId - ID of the user requesting projects
 * @param filters - Filter criteria (organization_id required)
 * @returns Array of projects matching filters
 * @throws Error with specific codes: VALIDATION_ERROR, FORBIDDEN, NOT_MEMBER_OF_ORGANIZATION
 */
export async function getProjects(
  userId: string,
  filters: ProjectFilter
): Promise<Project[]> {
  // ==============================
  // 1. VALIDATION (Zod)
  // ==============================
  const validationResult = ProjectFilterSchema.safeParse(filters);

  if (!validationResult.success) {
    // Extract meaningful error message from Zod
    const firstError = validationResult.error.issues[0];
    const errorMessage = firstError.message;

    // Check if it's missing required field
    if (firstError.code === 'invalid_type' && firstError.path.includes('organization_id')) {
      throw new Error('organization_id is required');
    }

    // Throw with Zod error message
    throw new Error(errorMessage);
  }

  const validatedFilters = validationResult.data;

  // ==============================
  // 2. AUTHORIZATION CHECKS
  // ==============================

  // Check if user is member of the organization
  const isMember = await isUserMemberOfOrganization(
    userId,
    validatedFilters.organization_id
  );

  if (!isMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check if user has permission to view projects
  const permissions = await getUserPermissionsInOrganization(
    userId,
    validatedFilters.organization_id
  );

  if (!permissions.includes('project.read')) {
    throw new Error('FORBIDDEN');
  }

  // ==============================
  // 3. RETRIEVE PROJECTS
  // ==============================
  const projects = await projectService.getProjects(validatedFilters);

  return projects;
}
