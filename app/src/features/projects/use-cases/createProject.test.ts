/**
 * Create Project Use Case Tests
 *
 * Tests business logic orchestration for creating projects.
 * Mocks all external dependencies (services).
 *
 * Created by: Test Agent
 * Date: 2025-10-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import will fail - this is expected in TDD Red phase
import { createProject } from './createProject';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, SAMPLE_PROJECTS, createMockProject } from '@/test/test-fixtures';

// Mock the service module
vi.mock('../services/project.service');

describe('createProject use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default successful mocks for all service calls
    vi.mocked(projectService.getProjectCount).mockResolvedValue(0);
    vi.mocked(projectService.isSlugAvailable).mockResolvedValue(true);
    vi.mocked(projectService.addProjectMember).mockResolvedValue({} as any);

    // Reset organization service mocks to defaults (from setup.ts)
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
      'project.create',
      'project.update',
      'project.delete',
    ]);
    vi.mocked(organizationService.getRoleByNameFromDB).mockResolvedValue({
      id: TEST_UUIDS.adminRole,
      name: 'Admin',
    } as any);
  });

  describe('happy path', () => {
    it('should create project when user has project.create permission', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project',
        description: 'Test project',
        status: 'active' as const,
        color: '#3B82F6',
        icon: '📁',
        is_favorite: false,
        settings: {},
      };

      const expectedProject = createMockProject({
        ...projectData,
        created_by: userId,
      });

      vi.mocked(projectService.createProject).mockResolvedValue(expectedProject);

      // Act
      const result = await createProject(userId, projectData);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith({
        ...projectData,
        created_by: userId,
      });
      expect(result.id).toBe(TEST_UUIDS.project1);
      expect(result.name).toBe('New Project');
    });

    it('should auto-add creator as project member with admin role', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project',
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockResolvedValue(
        createMockProject({
          ...projectData,
          created_by: userId,
        })
      );
      vi.mocked(projectService.addProjectMember).mockResolvedValue({} as any);

      // Act
      await createProject(userId, projectData);

      // Assert
      expect(projectService.addProjectMember).toHaveBeenCalledWith({
        project_id: TEST_UUIDS.project1,
        user_id: userId,
        role_id: expect.any(String), // Admin role ID
        invited_by: userId,
      });
    });

    it('should sanitize input data before creating', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: '  New Project  ', // Has whitespace
        slug: 'new-project',
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockResolvedValue({} as any);

      // Act
      await createProject(userId, projectData);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Project', // Should be trimmed
        })
      );
    });

    it('should convert slug to lowercase', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project-test', // Valid lowercase slug
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockResolvedValue({} as any);

      // Act
      await createProject(userId, projectData);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'new-project-test', // Should remain lowercase
        })
      );
    });
  });

  describe('validation', () => {
    it('should reject creation with invalid data', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidData = {
        organization_id: TEST_UUIDS.org1,
        name: '', // Empty string (invalid)
        slug: 'test',
        status: 'active' as const,
        is_favorite: false,
      };

      // Act & Assert
      await expect(createProject(userId, invalidData)).rejects.toThrow(
        'String must contain at least 2 character(s)'
      );

      // Service should not be called
      expect(projectService.createProject).not.toHaveBeenCalled();
    });

    it('should reject creation with missing required field', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidData = {
        organization_id: TEST_UUIDS.org1,
        // name missing
        slug: 'test',
        status: 'active' as const,
        is_favorite: false,
      } as any;

      // Act & Assert
      await expect(createProject(userId, invalidData)).rejects.toThrow(
        'name is required'
      );

      expect(projectService.createProject).not.toHaveBeenCalled();
    });

    it('should reject creation when name too short', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidData = {
        organization_id: TEST_UUIDS.org1,
        name: 'A', // Too short (min 2)
        slug: 'test',
        status: 'active' as const,
        is_favorite: false,
      };

      // Act & Assert
      await expect(createProject(userId, invalidData)).rejects.toThrow(
        'String must contain at least 2 character(s)'
      );

      expect(projectService.createProject).not.toHaveBeenCalled();
    });

    it('should reject creation when slug contains invalid characters', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidData = {
        organization_id: TEST_UUIDS.org1,
        name: 'Test Project',
        slug: 'Test Project', // Contains spaces and uppercase
        status: 'active' as const,
        is_favorite: false,
      };

      // Act & Assert
      await expect(createProject(userId, invalidData)).rejects.toThrow(
        'Invalid'
      );

      expect(projectService.createProject).not.toHaveBeenCalled();
    });

    it('should reject creation with invalid color format', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const invalidData = {
        organization_id: TEST_UUIDS.org1,
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        color: 'red', // Invalid HEX format
        is_favorite: false,
      };

      // Act & Assert
      await expect(createProject(userId, invalidData)).rejects.toThrow(
        'Invalid'
      );

      expect(projectService.createProject).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('should reject creation when user lacks project.create permission', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project',
        status: 'active' as const,
        is_favorite: false,
      };

      // Mock permission check to return permissions without 'project.create'
      vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
        'project.update',
        'project.delete',
      ]);

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow('FORBIDDEN');

      expect(projectService.createProject).not.toHaveBeenCalled();
    });

    it('should reject creation when user not in organization', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org2, // User not in this org
        name: 'New Project',
        slug: 'new-project',
        status: 'active' as const,
        is_favorite: false,
      };

      // Mock user not being a member
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow(
        'NOT_MEMBER_OF_ORGANIZATION'
      );

      expect(projectService.createProject).not.toHaveBeenCalled();
    });
  });

  describe('business rules', () => {
    it('should enforce unique slug constraint', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'existing-slug', // Already exists
        status: 'active' as const,
        is_favorite: false,
      };

      // Mock service to indicate duplicate
      vi.mocked(projectService.createProject).mockRejectedValue(
        new Error('unique constraint violation')
      );

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow(
        'SLUG_ALREADY_EXISTS'
      );
    });

    it('should apply default status of active when not provided', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project',
        is_favorite: false,
        // status omitted
      };

      vi.mocked(projectService.createProject).mockResolvedValue({} as any);

      // Act
      await createProject(userId, projectData as any);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active', // Should have default
        })
      );
    });

    it('should apply default is_favorite of false when not provided', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project',
        status: 'active' as const,
        // is_favorite omitted
      };

      vi.mocked(projectService.createProject).mockResolvedValue({} as any);

      // Act
      await createProject(userId, projectData as any);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          is_favorite: false, // Should have default
        })
      );
    });

    it('should limit project count per organization', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'New Project',
        slug: 'new-project',
        status: 'active' as const,
        is_favorite: false,
      };

      // Mock that organization already has max projects
      vi.mocked(projectService.getProjectCount).mockResolvedValue(1000);

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow(
        'MAX_PROJECTS_REACHED'
      );

      expect(projectService.createProject).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow(
        'Failed to create project'
      );

      expect(projectService.createProject).toHaveBeenCalled();
    });

    it('should handle unexpected service errors gracefully', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow();
    });

    it('should rollback member addition if it fails', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
      };

      const createdProject = createMockProject({
        id: 'project-123', // Different ID than TEST_UUIDS.project1
        ...projectData,
        created_by: userId,
      });

      vi.mocked(projectService.createProject).mockResolvedValue(createdProject);
      vi.mocked(projectService.addProjectMember).mockRejectedValue(
        new Error('Failed to add member')
      );

      // Act & Assert
      await expect(createProject(userId, projectData)).rejects.toThrow();

      // Should attempt to delete the created project (rollback)
      expect(projectService.deleteProject).toHaveBeenCalledWith('project-123');
    });
  });

  describe('edge cases', () => {
    it('should handle unicode characters in name', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: '你好世界 🌍',
        slug: 'hello-world',
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockResolvedValue({
        ...projectData,
        id: 'project-123',
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null,
      } as any);

      // Act
      const result = await createProject(userId, projectData);

      // Assert
      expect(result.name).toBe('你好世界 🌍');
    });

    it('should handle very long valid names', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'A'.repeat(100), // At max length
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockResolvedValue({
        ...projectData,
        id: 'project-123',
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null,
      } as any);

      // Act
      const result = await createProject(userId, projectData);

      // Assert
      expect(result.name).toHaveLength(100);
    });

    it('should handle empty optional fields', async () => {
      // Arrange
      const userId = TEST_UUIDS.user1;
      const projectData = {
        organization_id: TEST_UUIDS.org1,
        name: 'Test Project',
        slug: 'test-project',
        description: '', // Empty string
        status: 'active' as const,
        is_favorite: false,
      };

      vi.mocked(projectService.createProject).mockResolvedValue({} as any);

      // Act
      await createProject(userId, projectData);

      // Assert
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          description: undefined, // Should convert empty string to undefined
        })
      );
    });
  });
});
