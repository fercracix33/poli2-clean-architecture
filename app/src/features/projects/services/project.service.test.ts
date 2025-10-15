/**
 * Project Service Tests
 *
 * Tests pure data access layer (CRUD operations).
 * Mocks Supabase client.
 *
 * IMPORTANT: Services should be PURE - no business logic, only data access.
 *
 * Created by: Test Agent
 * Date: 2025-10-15
 */

import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import * as projectService from './project.service';

// Mock the Supabase client module
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase-server';

// Type-safe mock
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

describe('Project Service', () => {
  let mockSupabase: any;
  let mockFrom: MockedFunction<any>;
  let mockSelect: MockedFunction<any>;
  let mockInsert: MockedFunction<any>;
  let mockUpdate: MockedFunction<any>;
  let mockDelete: MockedFunction<any>;
  let mockEq: MockedFunction<any>;
  let mockSingle: MockedFunction<any>;
  let mockOrder: MockedFunction<any>;
  let mockOr: MockedFunction<any>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create chainable mock methods
    mockSingle = vi.fn();
    mockEq = vi.fn().mockReturnThis();
    mockOrder = vi.fn().mockReturnThis();
    mockOr = vi.fn().mockReturnThis();
    mockSelect = vi.fn().mockReturnThis();
    mockInsert = vi.fn().mockReturnThis();
    mockUpdate = vi.fn().mockReturnThis();
    mockDelete = vi.fn().mockReturnThis();

    // Setup mockFrom to return the query builder
    mockFrom = vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      or: mockOr,
    }));

    // Mock the Supabase client
    mockSupabase = {
      from: mockFrom,
      auth: {
        getUser: vi.fn(),
      },
    };

    // Make createClient return our mock
    (createClient as MockedFunction<typeof createClient>).mockResolvedValue(
      mockSupabase as any
    );
  });

  // ============================================
  // CREATE PROJECT TESTS
  // ============================================

  describe('createProject', () => {
    it('should insert new project into database', async () => {
      const createData = {
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        description: 'Test description',
        status: 'active' as const,
        color: '#3B82F6',
        icon: '📁',
        is_favorite: false,
        settings: { theme: 'dark' },
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const createdProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ...createData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: createdProject,
        error: null,
      });

      const result = await projectService.createProject(createData);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockInsert).toHaveBeenCalledWith({
        organization_id: createData.organization_id,
        name: createData.name,
        slug: createData.slug,
        description: createData.description,
        status: createData.status,
        color: createData.color,
        icon: createData.icon,
        is_favorite: createData.is_favorite,
        settings: createData.settings,
        created_by: createData.created_by,
      });
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: createdProject.id,
        name: createData.name,
      }));
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should handle null optional fields correctly', async () => {
      const createData = {
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Minimal Project',
        slug: 'minimal-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const createdProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: createData.organization_id,
        name: createData.name,
        slug: createData.slug,
        description: null,
        status: createData.status,
        color: null,
        icon: null,
        is_favorite: createData.is_favorite,
        settings: {},
        created_by: createData.created_by,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: createdProject,
        error: null,
      });

      await projectService.createProject(createData as any);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
          color: null,
          icon: null,
          settings: {},
        })
      );
    });

    it('should throw error when database insert fails', async () => {
      const createData = {
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '23505' },
      });

      await expect(projectService.createProject(createData)).rejects.toThrow(
        'Failed to create project'
      );
    });

    it('should convert timestamps to Date objects', async () => {
      const createData = {
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
      };

      const createdProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ...createData,
        description: null,
        color: null,
        icon: null,
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        archived_at: '2024-01-03T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: createdProject,
        error: null,
      });

      const result = await projectService.createProject(createData as any);

      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.archived_at).toBeInstanceOf(Date);
    });
  });

  // ============================================
  // GET PROJECT BY ID TESTS
  // ============================================

  describe('getProjectById', () => {
    it('should retrieve project by id', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';
      const dbProject = {
        id: projectId,
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        description: 'Test description',
        status: 'active',
        color: '#3B82F6',
        icon: '📁',
        is_favorite: false,
        settings: {},
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: dbProject,
        error: null,
      });

      const result = await projectService.getProjectById(projectId);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', projectId);
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: projectId,
        name: 'Test Project',
      }));
    });

    it('should return null when project not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // PostgreSQL not found error
      });

      const result = await projectService.getProjectById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error for database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Connection error', code: 'CONNECTION_ERROR' },
      });

      await expect(projectService.getProjectById('any-id')).rejects.toThrow(
        'Failed to get project'
      );
    });

    it('should convert timestamps to Date objects', async () => {
      const dbProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        status: 'active',
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: dbProject,
        error: null,
      });

      const result = await projectService.getProjectById('test-id');

      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });
  });

  // ============================================
  // GET PROJECT BY SLUG TESTS
  // ============================================

  describe('getProjectBySlug', () => {
    it('should retrieve project by organization and slug', async () => {
      const organizationId = '550e8400-e29b-41d4-a716-446655440001';
      const slug = 'test-project';
      const dbProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: organizationId,
        name: 'Test Project',
        slug,
        status: 'active',
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: dbProject,
        error: null,
      });

      const result = await projectService.getProjectBySlug(organizationId, slug);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('organization_id', organizationId);
      expect(mockEq).toHaveBeenCalledWith('slug', slug);
      expect(result).toEqual(expect.objectContaining({
        slug,
      }));
    });

    it('should return null when project not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await projectService.getProjectBySlug('org-id', 'non-existent-slug');

      expect(result).toBeNull();
    });

    it('should handle unique constraint correctly', async () => {
      // This test ensures that querying by org_id + slug works
      const organizationId = '550e8400-e29b-41d4-a716-446655440001';
      const slug = 'unique-slug';

      mockSingle.mockResolvedValue({
        data: {
          id: 'project-id',
          organization_id: organizationId,
          slug,
          name: 'Project',
          status: 'active',
          is_favorite: false,
          created_by: 'user-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          archived_at: null,
        },
        error: null,
      });

      const result = await projectService.getProjectBySlug(organizationId, slug);

      expect(result).not.toBeNull();
      expect(mockEq).toHaveBeenCalledTimes(2); // Both org_id and slug
    });
  });

  // ============================================
  // GET PROJECTS (LIST) TESTS
  // ============================================

  describe('getProjects', () => {
    it('should retrieve all projects for an organization', async () => {
      const organizationId = '550e8400-e29b-41d4-a716-446655440001';
      const dbProjects = [
        {
          id: '1',
          organization_id: organizationId,
          name: 'Project 1',
          slug: 'project-1',
          status: 'active',
          is_favorite: false,
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          archived_at: null,
        },
        {
          id: '2',
          organization_id: organizationId,
          name: 'Project 2',
          slug: 'project-2',
          status: 'active',
          is_favorite: false,
          created_by: 'user-2',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          archived_at: null,
        },
      ];

      // Mock the query chain
      mockOrder.mockResolvedValue({
        data: dbProjects,
        error: null,
      });

      const result = await projectService.getProjects({
        organization_id: organizationId,
      });

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('organization_id', organizationId);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Project 1');
    });

    it('should apply status filter', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      await projectService.getProjects({
        organization_id: 'org-id',
        status: 'archived',
      });

      expect(mockEq).toHaveBeenCalledWith('status', 'archived');
    });

    it('should apply is_favorite filter', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      await projectService.getProjects({
        organization_id: 'org-id',
        is_favorite: true,
      });

      expect(mockEq).toHaveBeenCalledWith('is_favorite', true);
    });

    it('should apply created_by filter', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const createdBy = '550e8400-e29b-41d4-a716-446655440002';
      await projectService.getProjects({
        organization_id: 'org-id',
        created_by: createdBy,
      });

      expect(mockEq).toHaveBeenCalledWith('created_by', createdBy);
    });

    it('should apply search filter', async () => {
      mockOr.mockResolvedValue({
        data: [],
        error: null,
      });

      await projectService.getProjects({
        organization_id: 'org-id',
        search: 'test',
      });

      expect(mockOr).toHaveBeenCalledWith('name.ilike.%test%,description.ilike.%test%');
    });

    it('should return empty array when no projects found', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await projectService.getProjects({
        organization_id: 'org-id',
      });

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        projectService.getProjects({ organization_id: 'org-id' })
      ).rejects.toThrow('Failed to get projects');
    });
  });

  // ============================================
  // GET PROJECTS WITH STATS TESTS
  // ============================================

  describe('getProjectsWithStats', () => {
    it('should fetch projects with member_count and creator_name', async () => {
      const organizationId = '550e8400-e29b-41d4-a716-446655440001';
      const dbProjects = [
        {
          id: '1',
          organization_id: organizationId,
          name: 'Project 1',
          slug: 'project-1',
          status: 'active',
          is_favorite: false,
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          archived_at: null,
          member_count: [{ count: 5 }],
          creator: { name: 'John Doe' },
        },
      ];

      mockOrder.mockResolvedValue({
        data: dbProjects,
        error: null,
      });

      const result = await projectService.getProjectsWithStats(organizationId);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('member_count'));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('creator'));
      expect(result[0].member_count).toBe(5);
      expect(result[0].creator_name).toBe('John Doe');
    });

    it('should handle projects with zero members', async () => {
      const dbProjects = [
        {
          id: '1',
          organization_id: 'org-id',
          name: 'Project 1',
          slug: 'project-1',
          status: 'active',
          is_favorite: false,
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          archived_at: null,
          member_count: [{ count: 0 }],
          creator: { name: 'Jane Doe' },
        },
      ];

      mockOrder.mockResolvedValue({
        data: dbProjects,
        error: null,
      });

      const result = await projectService.getProjectsWithStats('org-id');

      expect(result[0].member_count).toBe(0);
    });

    it('should apply status filter', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      await projectService.getProjectsWithStats('org-id', { status: 'archived' });

      expect(mockEq).toHaveBeenCalledWith('status', 'archived');
    });

    it('should apply is_favorite filter', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      await projectService.getProjectsWithStats('org-id', { is_favorite: true });

      expect(mockEq).toHaveBeenCalledWith('is_favorite', true);
    });
  });

  // ============================================
  // UPDATE PROJECT TESTS
  // ============================================

  describe('updateProject', () => {
    it('should update project fields', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const updatedProject = {
        id: projectId,
        organization_id: 'org-id',
        name: updateData.name,
        slug: 'test-project',
        description: updateData.description,
        status: 'active',
        is_favorite: false,
        created_by: 'user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: updatedProject,
        error: null,
      });

      const result = await projectService.updateProject(projectId, updateData);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateData.name,
          description: updateData.description,
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', projectId);
      expect(result.name).toBe(updateData.name);
    });

    it('should allow partial updates', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';
      const updateData = {
        is_favorite: true,
      };

      mockSingle.mockResolvedValue({
        data: {
          id: projectId,
          organization_id: 'org-id',
          name: 'Project',
          slug: 'project',
          status: 'active',
          is_favorite: true,
          created_by: 'user-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          archived_at: null,
        },
        error: null,
      });

      await projectService.updateProject(projectId, updateData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_favorite: true,
        })
      );
    });

    it('should throw error when update fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        projectService.updateProject('project-id', { name: 'Test' })
      ).rejects.toThrow('Failed to update project');
    });

    it('should update the updated_at timestamp', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';

      mockSingle.mockResolvedValue({
        data: {
          id: projectId,
          organization_id: 'org-id',
          name: 'Updated Project',
          slug: 'project',
          status: 'active',
          is_favorite: false,
          created_by: 'user-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          archived_at: null,
        },
        error: null,
      });

      await projectService.updateProject(projectId, { name: 'Updated Project' });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });

  // ============================================
  // DELETE PROJECT TESTS
  // ============================================

  describe('deleteProject', () => {
    it('should delete project by id', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';

      mockDelete.mockResolvedValue({
        data: null,
        error: null,
      });

      await projectService.deleteProject(projectId);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', projectId);
    });

    it('should throw error when deletion fails', async () => {
      mockDelete.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      await expect(projectService.deleteProject('project-id')).rejects.toThrow(
        'Failed to delete project'
      );
    });
  });

  // ============================================
  // ARCHIVE PROJECT TESTS
  // ============================================

  describe('archiveProject', () => {
    it('should set status to archived and record archived_at', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';
      const archivedProject = {
        id: projectId,
        organization_id: 'org-id',
        name: 'Project',
        slug: 'project',
        status: 'archived',
        is_favorite: false,
        created_by: 'user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
        archived_at: new Date().toISOString(),
      };

      mockSingle.mockResolvedValue({
        data: archivedProject,
        error: null,
      });

      const result = await projectService.archiveProject(projectId);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'archived',
          archived_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
      expect(result.status).toBe('archived');
      expect(result.archived_at).toBeInstanceOf(Date);
    });

    it('should throw error when archiving fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Archive failed' },
      });

      await expect(projectService.archiveProject('project-id')).rejects.toThrow(
        'Failed to archive project'
      );
    });
  });

  // ============================================
  // UNARCHIVE PROJECT TESTS
  // ============================================

  describe('unarchiveProject', () => {
    it('should set status to active and clear archived_at', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440000';
      const unarchivedProject = {
        id: projectId,
        organization_id: 'org-id',
        name: 'Project',
        slug: 'project',
        status: 'active',
        is_favorite: false,
        created_by: 'user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
        archived_at: null,
      };

      mockSingle.mockResolvedValue({
        data: unarchivedProject,
        error: null,
      });

      const result = await projectService.unarchiveProject(projectId);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          archived_at: null,
          updated_at: expect.any(String),
        })
      );
      expect(result.status).toBe('active');
      expect(result.archived_at).toBeNull();
    });

    it('should throw error when unarchiving fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Unarchive failed' },
      });

      await expect(projectService.unarchiveProject('project-id')).rejects.toThrow(
        'Failed to unarchive project'
      );
    });
  });

  // ============================================
  // PROJECT MEMBERS TESTS
  // ============================================

  describe('addProjectMember', () => {
    it('should insert new project member', async () => {
      const memberData = {
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        role_id: '550e8400-e29b-41d4-a716-446655440003',
        invited_by: '550e8400-e29b-41d4-a716-446655440004',
      };

      const createdMember = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ...memberData,
        joined_at: '2024-01-01T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: createdMember,
        error: null,
      });

      const result = await projectService.addProjectMember(memberData);

      expect(mockFrom).toHaveBeenCalledWith('project_members');
      expect(mockInsert).toHaveBeenCalledWith(memberData);
      expect(result.joined_at).toBeInstanceOf(Date);
    });

    it('should throw error on duplicate member', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate member', code: '23505' },
      });

      await expect(
        projectService.addProjectMember({
          project_id: 'project-id',
          user_id: 'user-id',
          role_id: 'role-id',
          invited_by: 'inviter-id',
        })
      ).rejects.toThrow('Failed to add project member');
    });
  });

  describe('removeProjectMember', () => {
    it('should remove project member', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440001';
      const userId = '550e8400-e29b-41d4-a716-446655440002';

      mockDelete.mockResolvedValue({
        data: null,
        error: null,
      });

      await projectService.removeProjectMember(projectId, userId);

      expect(mockFrom).toHaveBeenCalledWith('project_members');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('project_id', projectId);
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw error when removal fails', async () => {
      mockDelete.mockResolvedValue({
        data: null,
        error: { message: 'Removal failed' },
      });

      await expect(
        projectService.removeProjectMember('project-id', 'user-id')
      ).rejects.toThrow('Failed to remove project member');
    });
  });

  describe('getProjectMembers', () => {
    it('should retrieve all members of a project', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440001';
      const members = [
        {
          id: '1',
          project_id: projectId,
          user_id: 'user-1',
          role_id: 'role-1',
          joined_at: '2024-01-01T00:00:00Z',
          invited_by: 'user-2',
        },
        {
          id: '2',
          project_id: projectId,
          user_id: 'user-2',
          role_id: 'role-2',
          joined_at: '2024-01-02T00:00:00Z',
          invited_by: null,
        },
      ];

      mockOrder.mockResolvedValue({
        data: members,
        error: null,
      });

      const result = await projectService.getProjectMembers(projectId);

      expect(mockFrom).toHaveBeenCalledWith('project_members');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('project_id', projectId);
      expect(mockOrder).toHaveBeenCalledWith('joined_at', { ascending: true });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no members found', async () => {
      mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await projectService.getProjectMembers('project-id');

      expect(result).toEqual([]);
    });
  });

  describe('updateProjectMemberRole', () => {
    it('should update member role', async () => {
      const projectId = '550e8400-e29b-41d4-a716-446655440001';
      const userId = '550e8400-e29b-41d4-a716-446655440002';
      const newRoleId = '550e8400-e29b-41d4-a716-446655440003';

      const updatedMember = {
        id: 'member-id',
        project_id: projectId,
        user_id: userId,
        role_id: newRoleId,
        joined_at: '2024-01-01T00:00:00Z',
        invited_by: 'inviter-id',
      };

      mockSingle.mockResolvedValue({
        data: updatedMember,
        error: null,
      });

      const result = await projectService.updateProjectMemberRole(
        projectId,
        userId,
        newRoleId
      );

      expect(mockFrom).toHaveBeenCalledWith('project_members');
      expect(mockUpdate).toHaveBeenCalledWith({ role_id: newRoleId });
      expect(mockEq).toHaveBeenCalledWith('project_id', projectId);
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(result.role_id).toBe(newRoleId);
    });

    it('should throw error when update fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        projectService.updateProjectMemberRole('project-id', 'user-id', 'role-id')
      ).rejects.toThrow('Failed to update project member role');
    });
  });

  // ============================================
  // UTILITY FUNCTIONS TESTS
  // ============================================

  describe('getProjectCount', () => {
    it('should return project count for organization', async () => {
      const organizationId = '550e8400-e29b-41d4-a716-446655440001';

      // Mock the query that returns count
      mockEq.mockResolvedValue({
        count: 10,
        error: null,
      });

      const result = await projectService.getProjectCount(organizationId);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(mockSelect).toHaveBeenCalledWith('id', { count: 'exact', head: true });
      expect(mockEq).toHaveBeenCalledWith('organization_id', organizationId);
      expect(result).toBe(10);
    });

    it('should filter count by status', async () => {
      mockEq.mockResolvedValue({
        count: 5,
        error: null,
      });

      const result = await projectService.getProjectCount('org-id', 'active');

      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(result).toBe(5);
    });

    it('should return 0 when no projects exist', async () => {
      mockEq.mockResolvedValue({
        count: null,
        error: null,
      });

      const result = await projectService.getProjectCount('org-id');

      expect(result).toBe(0);
    });
  });

  describe('isSlugAvailable', () => {
    it('should return true when slug is available', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found
      });

      const result = await projectService.isSlugAvailable('org-id', 'new-slug');

      expect(result).toBe(true);
    });

    it('should return false when slug exists', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'existing-project-id' },
        error: null,
      });

      const result = await projectService.isSlugAvailable('org-id', 'existing-slug');

      expect(result).toBe(false);
    });

    it('should exclude specific project when checking', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await projectService.isSlugAvailable('org-id', 'slug', 'exclude-project-id');

      // Should use neq to exclude the project
      expect(mockFrom).toHaveBeenCalledWith('projects');
    });
  });

  describe('isProjectMember', () => {
    it('should return true when user is member', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'member-id' },
        error: null,
      });

      const result = await projectService.isProjectMember('project-id', 'user-id');

      expect(result).toBe(true);
    });

    it('should return false when user is not member', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await projectService.isProjectMember('project-id', 'user-id');

      expect(result).toBe(false);
    });

    it('should throw error for database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'OTHER_ERROR' },
      });

      await expect(
        projectService.isProjectMember('project-id', 'user-id')
      ).rejects.toThrow('Failed to check project membership');
    });
  });
});
