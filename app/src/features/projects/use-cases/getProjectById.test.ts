/**
 * Get Project By ID Use Case Tests
 *
 * Tests business logic for retrieving a single project by ID.
 * Mocks all external dependencies (services).
 *
 * Created by: Implementer Agent (TDD Red Phase)
 * Date: 2025-10-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectById } from './getProjectById';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

// Mock the service module
vi.mock('../services/project.service');

describe('getProjectById use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset organization service mocks to defaults
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
      'project.read',
    ]);
  });

  describe('happy path', () => {
    it('should retrieve project by ID when user has permission', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectId = TEST_UUIDS.project1;

      const mockProject = createMockProject({ id: projectId });

      vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);

      // Act
      const result = await getProjectById(userId, projectId);

      // Assert
      expect(projectService.getProjectById).toHaveBeenCalledWith(projectId);
      expect(result.id).toBe(projectId);
      expect(result.name).toBe(mockProject.name);
    });
  });

  describe('validation', () => {
    it('should reject when projectId is invalid UUID', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidId = 'invalid-uuid';

      // Act & Assert
      await expect(getProjectById(userId, invalidId)).rejects.toThrow(
        'Invalid uuid'
      );

      expect(projectService.getProjectById).not.toHaveBeenCalled();
    });
  });

  describe('not found', () => {
    it('should throw NOT_FOUND when project does not exist', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectId = TEST_UUIDS.project1;

      vi.mocked(projectService.getProjectById).mockResolvedValue(null);

      // Act & Assert
      await expect(getProjectById(userId, projectId)).rejects.toThrow(
        'NOT_FOUND'
      );
    });
  });

  describe('authorization', () => {
    it('should reject when user not member of project organization', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectId = TEST_UUIDS.project1;

      const mockProject = createMockProject({
        id: projectId,
        organization_id: TEST_UUIDS.org2,
      });

      vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(getProjectById(userId, projectId)).rejects.toThrow(
        'NOT_MEMBER_OF_ORGANIZATION'
      );
    });

    it('should reject when user lacks project.read permission', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectId = TEST_UUIDS.project1;

      const mockProject = createMockProject({ id: projectId });

      vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
      vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
        'project.create', // Has create but not read
      ]);

      // Act & Assert
      await expect(getProjectById(userId, projectId)).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectId = TEST_UUIDS.project1;

      vi.mocked(projectService.getProjectById).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(getProjectById(userId, projectId)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
