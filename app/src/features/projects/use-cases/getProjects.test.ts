/**
 * Get Projects Use Case Tests
 *
 * Tests business logic for retrieving projects with filters.
 * Mocks all external dependencies (services).
 *
 * Created by: Implementer Agent (TDD Red Phase)
 * Date: 2025-10-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjects } from './getProjects';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

// Mock the service module
vi.mock('../services/project.service');

describe('getProjects use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset organization service mocks to defaults
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
      'project.read',
      'project.create',
    ]);
  });

  describe('happy path', () => {
    it('should retrieve all projects for organization', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const organizationId = TEST_UUIDS.org1;

      const mockProjects = [
        createMockProject({ name: 'Project 1', slug: 'project-1' }),
        createMockProject({ id: TEST_UUIDS.project2, name: 'Project 2', slug: 'project-2' }),
      ];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, { organization_id: organizationId });

      // Assert
      expect(projectService.getProjects).toHaveBeenCalledWith({
        organization_id: organizationId,
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Project 1');
    });

    it('should apply status filter', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const filters = {
        organization_id: TEST_UUIDS.org1,
        status: 'active' as const,
      };

      const mockProjects = [
        createMockProject({ status: 'active' }),
      ];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, filters);

      // Assert
      expect(projectService.getProjects).toHaveBeenCalledWith(filters);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });

    it('should apply is_favorite filter', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const filters = {
        organization_id: TEST_UUIDS.org1,
        is_favorite: true,
      };

      const mockProjects = [
        createMockProject({ is_favorite: true }),
      ];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, filters);

      // Assert
      expect(projectService.getProjects).toHaveBeenCalledWith(filters);
      expect(result[0].is_favorite).toBe(true);
    });

    it('should apply created_by filter', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const filters = {
        organization_id: TEST_UUIDS.org1,
        created_by: TEST_UUIDS.user1,
      };

      const mockProjects = [
        createMockProject({ created_by: TEST_UUIDS.user1 }),
      ];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, filters);

      // Assert
      expect(projectService.getProjects).toHaveBeenCalledWith(filters);
      expect(result[0].created_by).toBe(TEST_UUIDS.user1);
    });

    it('should apply search filter', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const filters = {
        organization_id: TEST_UUIDS.org1,
        search: 'Design',
      };

      const mockProjects = [
        createMockProject({ name: 'Design System', slug: 'design-system' }),
      ];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, filters);

      // Assert
      expect(projectService.getProjects).toHaveBeenCalledWith(filters);
      expect(result[0].name).toContain('Design');
    });

    it('should return empty array when no projects exist', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const organizationId = TEST_UUIDS.org1;

      vi.mocked(projectService.getProjects).mockResolvedValue([]);

      // Act
      const result = await getProjects(userId, { organization_id: organizationId });

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('validation', () => {
    it('should reject when organization_id is missing', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidFilters = {} as any;

      // Act & Assert
      await expect(getProjects(userId, invalidFilters)).rejects.toThrow(
        'organization_id is required'
      );

      expect(projectService.getProjects).not.toHaveBeenCalled();
    });

    it('should reject when organization_id is invalid UUID', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidFilters = {
        organization_id: 'invalid-uuid',
      };

      // Act & Assert
      await expect(getProjects(userId, invalidFilters)).rejects.toThrow(
        'Invalid uuid'
      );

      expect(projectService.getProjects).not.toHaveBeenCalled();
    });

    it('should reject when status is invalid', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidFilters = {
        organization_id: TEST_UUIDS.org1,
        status: 'invalid-status' as any,
      };

      // Act & Assert
      await expect(getProjects(userId, invalidFilters)).rejects.toThrow(
        'Invalid'
      );

      expect(projectService.getProjects).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('should reject when user not member of organization', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const organizationId = TEST_UUIDS.org2;

      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(
        getProjects(userId, { organization_id: organizationId })
      ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');

      expect(projectService.getProjects).not.toHaveBeenCalled();
    });

    it('should reject when user lacks project.read permission', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const organizationId = TEST_UUIDS.org1;

      vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
        'project.create', // Has create but not read
      ]);

      // Act & Assert
      await expect(
        getProjects(userId, { organization_id: organizationId })
      ).rejects.toThrow('FORBIDDEN');

      expect(projectService.getProjects).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const organizationId = TEST_UUIDS.org1;

      vi.mocked(projectService.getProjects).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        getProjects(userId, { organization_id: organizationId })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle unexpected service errors gracefully', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const organizationId = TEST_UUIDS.org1;

      vi.mocked(projectService.getProjects).mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act & Assert
      await expect(
        getProjects(userId, { organization_id: organizationId })
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple filters simultaneously', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const filters = {
        organization_id: TEST_UUIDS.org1,
        status: 'active' as const,
        is_favorite: true,
        created_by: TEST_UUIDS.user1,
        search: 'Design',
      };

      const mockProjects = [
        createMockProject({
          status: 'active',
          is_favorite: true,
          created_by: TEST_UUIDS.user1,
          name: 'Design System',
        }),
      ];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, filters);

      // Assert
      expect(projectService.getProjects).toHaveBeenCalledWith(filters);
      expect(result).toHaveLength(1);
    });

    it('should handle empty search string', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const filters = {
        organization_id: TEST_UUIDS.org1,
        search: '',
      };

      const mockProjects = [createMockProject()];

      vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects);

      // Act
      const result = await getProjects(userId, filters);

      // Assert
      expect(result).toHaveLength(1);
    });
  });
});
