/**
 * Get Project By ID Use Case
 *
 * Business logic for retrieving a single project by its ID.
 * Validates ID, checks permissions, and retrieves project.
 *
 * Implementer Agent - TDD Green Phase
 * Date: 2025-10-15
 */

import { z } from 'zod';
import type { Project } from '../entities';
import * as projectService from '../services/project.service';
import {
  getUserPermissionsInOrganization,
  isUserMemberOfOrganization,
} from '@/features/organizations/services/organization.service';

// UUID validation schema
const ProjectIdSchema = z.string().uuid();

/**
 * Get a project by its ID
 *
 * @param userId - ID of the user requesting the project
 * @param projectId - ID of the project to retrieve
 * @returns The requested project
 * @throws Error with specific codes: VALIDATION_ERROR, NOT_FOUND, FORBIDDEN, NOT_MEMBER_OF_ORGANIZATION
 */
export async function getProjectById(
  userId: string,
  projectId: string
): Promise<Project> {
  // ==============================
  // 1. VALIDATION (Zod)
  // ==============================
  const validationResult = ProjectIdSchema.safeParse(projectId);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    throw new Error(firstError.message);
  }

  // ==============================
  // 2. RETRIEVE PROJECT
  // ==============================
  const project = await projectService.getProjectById(projectId);

  if (!project) {
    throw new Error('NOT_FOUND');
  }

  // ==============================
  // 3. AUTHORIZATION CHECKS
  // ==============================

  // Check if user is member of the project's organization
  const isMember = await isUserMemberOfOrganization(
    userId,
    project.organization_id
  );

  if (!isMember) {
    throw new Error('NOT_MEMBER_OF_ORGANIZATION');
  }

  // Check if user has permission to view projects
  const permissions = await getUserPermissionsInOrganization(
    userId,
    project.organization_id
  );

  if (!permissions.includes('project.read')) {
    throw new Error('FORBIDDEN');
  }

  return project;
}
