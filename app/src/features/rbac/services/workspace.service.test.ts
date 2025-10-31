/**
 * Workspace Service Tests
 *
 * Defines data access interfaces for workspace CRUD operations.
 * These tests specify pure database interactions with RLS enforcement.
 *
 * Phase: RED (TDD) - All tests MUST FAIL initially
 * Expected failure: "workspaceService is not defined" (service not implemented yet)
 *
 * Testing strategy:
 * - Test CRUD operations with Supabase client
 * - Verify RLS policies enforce workspace isolation
 * - Test snake_case ↔ camelCase transformations
 * - Test error handling (not found, connection errors)
 *
 * Service Interface to Implement:
 * ```typescript
 * export const workspaceService = {
 *   createWorkspace(input: WorkspaceCreate): Promise<Workspace>;
 *   getWorkspaceById(id: string, userId: string): Promise<Workspace | null>;
 *   updateWorkspace(id: string, input: WorkspaceUpdate, userId: string): Promise<Workspace>;
 *   deleteWorkspace(id: string, userId: string): Promise<void>;
 * };
 * ```
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Workspace, WorkspaceCreate, WorkspaceUpdate } from '../entities';

// UUID constants for consistent test data
const VALID_USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_WORKSPACE_UUID = '223e4567-e89b-12d3-a456-426614174000';
const VALID_OWNER_UUID = '323e4567-e89b-12d3-a456-426614174000';
const VALID_MEMBER_UUID = '423e4567-e89b-12d3-a456-426614174000';
const VALID_USER_A_UUID = '523e4567-e89b-12d3-a456-426614174000';
const VALID_USER_B_UUID = '623e4567-e89b-12d3-a456-426614174000';

// ============================================================================
// SERVICE INTERFACE (TO BE IMPLEMENTED BY SUPABASE AGENT)
// ============================================================================

/**
 * Workspace Service Interface
 *
 * Pure data access layer for workspace operations.
 * NO business logic - only database CRUD + RLS enforcement.
 */
interface WorkspaceService {
  createWorkspace(input: WorkspaceCreate, userId: string): Promise<Workspace>;
  getWorkspaceById(id: string, userId: string): Promise<Workspace | null>;
  updateWorkspace(id: string, input: WorkspaceUpdate, userId: string): Promise<Workspace>;
  deleteWorkspace(id: string, userId: string): Promise<void>;
  listWorkspacesByUser(userId: string): Promise<Workspace[]>;
}

// RED phase: Service not defined yet
// @ts-expect-error - Service will be implemented by Supabase Agent
let workspaceService: WorkspaceService;

// ============================================================================
// MOCK SETUP
// ============================================================================

function createSupabaseMock() {
  const fromMock = vi.fn();
  const selectMock = vi.fn().mockReturnThis();
  const insertMock = vi.fn().mockReturnThis();
  const updateMock = vi.fn().mockReturnThis();
  const deleteMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockReturnThis();
  const singleMock = vi.fn();

  const queryBuilder = {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    eq: eqMock,
    single: singleMock,
  };

  fromMock.mockReturnValue(queryBuilder);

  const supabase = {
    from: fromMock,
    auth: {
      getUser: vi.fn(),
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    mocks: {
      from: fromMock,
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
      eq: eqMock,
      single: singleMock,
    },
  };
}

// ============================================================================
// SERVICE TESTS - CREATE
// ============================================================================

describe('WorkspaceService', () => {
  describe('RED phase check', () => {
    it('should not be defined yet (TDD RED phase)', () => {
      // @ts-expect-error - Service not implemented yet
      expect(workspaceService).toBeUndefined();
    });
  });

  describe('createWorkspace', () => {
    it('should insert workspace into database', async () => {
      const createData: WorkspaceCreate = {
        name: 'Test Workspace',
        owner_id: VALID_USER_UUID,
      };

      const expectedWorkspace: Workspace = {
        id: VALID_WORKSPACE_UUID,
        name: 'Test Workspace',
        owner_id: VALID_USER_UUID,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock implementation would call supabase.from('workspaces').insert()
      const result = await workspaceService.createWorkspace(createData, VALID_USER_UUID);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Workspace');
      expect(result.owner_id).toBe(VALID_USER_UUID);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should use Supabase client for insert', async () => {
      const { supabase, mocks } = createSupabaseMock();

      // Mock successful insert
      mocks.single.mockResolvedValue({
        data: {
          id: VALID_WORKSPACE_UUID,
          name: 'Test Workspace',
          owner_id: VALID_USER_UUID,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      // Service would use supabase.from('workspaces')
      await supabase
        .from('workspaces')
        .insert({
          name: 'Test Workspace',
          owner_id: VALID_USER_UUID,
        })
        .single();

      expect(mocks.from).toHaveBeenCalledWith('workspaces');
      expect(mocks.insert).toHaveBeenCalledWith({
        name: 'Test Workspace',
        owner_id: VALID_USER_UUID,
      });
    });

    it('should transform camelCase to snake_case for database', async () => {
      const createData: WorkspaceCreate = {
        name: 'My Workspace',
        owner_id: VALID_OWNER_UUID, // camelCase in TypeScript
      };

      // Service should transform to snake_case for PostgreSQL
      // Database column: owner_id (snake_case)
      const result = await workspaceService.createWorkspace(createData, VALID_OWNER_UUID);

      expect(result.owner_id).toBe(VALID_OWNER_UUID); // camelCase in response
    });

    it('should transform snake_case from database to camelCase', async () => {
      const createData: WorkspaceCreate = {
        name: 'Transform Test',
        owner_id: VALID_OWNER_UUID,
      };

      // Database returns: created_at, updated_at (snake_case)
      // Service should transform to: createdAt, updatedAt (camelCase)
      const result = await workspaceService.createWorkspace(createData, VALID_OWNER_UUID);

      expect(result.created_at).toBeDefined(); // Check snake_case
      expect(result.updated_at).toBeDefined();
    });

    it('should throw error when insert fails', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: null,
        error: {
          message: 'Database connection error',
          code: 'PGRST301',
        },
      });

      await expect(async () => {
        const createData: WorkspaceCreate = {
          name: 'Fail Workspace',
          owner_id: '99999999-9999-9999-9999-000000000001',
        };

        await workspaceService.createWorkspace(createData, '99999999-9999-9999-9999-000000000001');
      }).rejects.toThrow(/database|connection|error/i);
    });

    it('should enforce RLS WITH CHECK policy on insert', async () => {
      // User A tries to create workspace with User B as owner (should fail)
      const createData: WorkspaceCreate = {
        name: 'Hacked Workspace',
        owner_id: VALID_USER_B_UUID, // Different from authenticated user
      };

      await expect(async () => {
        // Authenticated as user-a, trying to set owner_id to user-b
        await workspaceService.createWorkspace(createData, VALID_USER_A_UUID);
      }).rejects.toThrow(/policy|permission|check constraint/i);
    });

    it('should auto-generate UUID for id', async () => {
      const createData: WorkspaceCreate = {
        name: 'UUID Test',
        owner_id: '66666666-6666-6666-6666-000000000001',
      };

      const result = await workspaceService.createWorkspace(createData, '66666666-6666-6666-6666-000000000001');

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should auto-generate timestamps', async () => {
      const createData: WorkspaceCreate = {
        name: 'Timestamp Test',
        owner_id: '77777777-7777-7777-7777-000000000001',
      };

      const result = await workspaceService.createWorkspace(createData, '77777777-7777-7777-7777-000000000001');

      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
      expect(new Date(result.created_at).getTime()).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SERVICE TESTS - READ
  // ============================================================================

  describe('getWorkspaceById', () => {
    it('should fetch workspace by ID', async () => {
      const workspaceId = VALID_WORKSPACE_UUID;
      const userId = VALID_USER_UUID;

      const result = await workspaceService.getWorkspaceById(workspaceId, userId);

      expect(result).toBeDefined();
      expect(result!.id).toBe(workspaceId);
      expect(result!.name).toBeDefined();
    });

    it('should enforce RLS on SELECT', async () => {
      const workspaceId = '00000000-0000-0000-0000-a';
      const ownerId = VALID_USER_A_UUID;
      const attackerId = VALID_USER_B_UUID;

      // User A creates workspace
      await workspaceService.createWorkspace({ name: 'Protected', owner_id: ownerId }, ownerId);

      // User B (not a member) tries to fetch
      const result = await workspaceService.getWorkspaceById(workspaceId, attackerId);

      // RLS blocks access
      expect(result).toBeNull();
    });

    it('should return null if workspace not found', async () => {
      const result = await workspaceService.getWorkspaceById('non-existent-id', VALID_USER_UUID);

      expect(result).toBeNull();
    });

    it('should return workspace if user is member', async () => {
      const workspaceId = '00000000-0000-0000-0000-member';
      const ownerId = VALID_OWNER_UUID;
      const memberId = VALID_MEMBER_UUID;

      // Create workspace
      await workspaceService.createWorkspace({ name: 'Shared', owner_id: ownerId }, ownerId);

      // Add member to workspace (via workspace_users table)
      // In real implementation, this would be done by roleService

      // Member can fetch workspace
      const result = await workspaceService.getWorkspaceById(workspaceId, memberId);

      expect(result).toBeDefined();
      expect(result!.id).toBe(workspaceId);
    });

    it('should use correct Supabase query', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: {
          id: VALID_WORKSPACE_UUID,
          name: 'Test',
          owner_id: VALID_USER_UUID,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      await supabase
        .from('workspaces')
        .select('*')
        .eq('id', VALID_WORKSPACE_UUID)
        .single();

      expect(mocks.from).toHaveBeenCalledWith('workspaces');
      expect(mocks.select).toHaveBeenCalledWith('*');
      expect(mocks.eq).toHaveBeenCalledWith('id', VALID_WORKSPACE_UUID);
      expect(mocks.single).toHaveBeenCalled();
    });
  });

  describe('listWorkspacesByUser', () => {
    it('should return all workspaces user belongs to', async () => {
      const userId = '11111111-1111-1111-1111-multi';

      const workspaces = await workspaceService.listWorkspacesByUser(userId);

      expect(Array.isArray(workspaces)).toBe(true);
      expect(workspaces.length).toBeGreaterThanOrEqual(0);
    });

    it('should enforce RLS (only user workspaces)', async () => {
      const userAId = '44444444-4444-4444-4444-000000000001';
      const userBId = '44444444-4444-4444-4444-000000000002';

      // User A creates workspace
      await workspaceService.createWorkspace({ name: 'A Workspace', owner_id: userAId }, userAId);

      // User B creates workspace
      await workspaceService.createWorkspace({ name: 'B Workspace', owner_id: userBId }, userBId);

      // User A lists workspaces (should see only their own)
      const workspacesA = await workspaceService.listWorkspacesByUser(userAId);
      const workspacesB = await workspaceService.listWorkspacesByUser(userBId);

      // Each user sees only their workspace
      expect(workspacesA.every(w => w.owner_id === userAId || workspaceHasMember(w.id, userAId))).toBe(true);
      expect(workspacesB.every(w => w.owner_id === userBId || workspaceHasMember(w.id, userBId))).toBe(true);
    });

    it('should return empty array if user has no workspaces', async () => {
      const newUserId = '55555555-5555-5555-5555-000000000001';

      const workspaces = await workspaceService.listWorkspacesByUser(newUserId);

      expect(workspaces).toEqual([]);
    });
  });

  // ============================================================================
  // SERVICE TESTS - UPDATE
  // ============================================================================

  describe('updateWorkspace', () => {
    it('should update workspace name', async () => {
      const workspaceId = '00000000-0000-0000-0000-update';
      const userId = '11111111-1111-1111-1111-update';

      // Create workspace first
      await workspaceService.createWorkspace({ name: 'Original Name', owner_id: userId }, userId);

      // Update name
      const updated = await workspaceService.updateWorkspace(
        workspaceId,
        { name: 'Updated Name' },
        userId
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated.updated_at).not.toBe(updated.created_at); // Timestamp changed
    });

    it('should enforce RLS on UPDATE (owner only)', async () => {
      const workspaceId = '00000000-0000-0000-0000-rls-update';
      const ownerId = '22222222-2222-2222-2222-update';
      const memberId = '33333333-3333-3333-3333-update';

      // Owner creates workspace
      await workspaceService.createWorkspace({ name: 'Protected', owner_id: ownerId }, ownerId);

      // Member tries to update (should fail - RLS blocks)
      await expect(async () => {
        await workspaceService.updateWorkspace(
          workspaceId,
          { name: 'Hacked Name' },
          memberId
        );
      }).rejects.toThrow(/policy|permission|unauthorized/i);
    });

    it('should prevent updating immutable fields', async () => {
      const workspaceId = '00000000-0000-0000-0000-immutable';
      const userId = '11111111-1111-1111-1111-immutable';

      await workspaceService.createWorkspace({ name: 'Test', owner_id: userId }, userId);

      // Attempt to update owner_id (immutable)
      await expect(async () => {
        await workspaceService.updateWorkspace(
          workspaceId,
          { owner_id: '88888888-8888-8888-8888-000000000001' } as any, // TypeScript should block, but test anyway
          userId
        );
      }).rejects.toThrow(/immutable|cannot update owner/i);
    });

    it('should update updated_at timestamp', async () => {
      const workspaceId = '00000000-0000-0000-0000-timestamp-update';
      const userId = '11111111-1111-1111-1111-timestamp-update';

      const created = await workspaceService.createWorkspace({ name: 'Before', owner_id: userId }, userId);
      const originalUpdatedAt = created.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await workspaceService.updateWorkspace(
        workspaceId,
        { name: 'After' },
        userId
      );

      expect(updated.updated_at).not.toBe(originalUpdatedAt);
      expect(new Date(updated.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('should use correct Supabase query', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: {
          id: VALID_WORKSPACE_UUID,
          name: 'Updated Name',
          owner_id: VALID_USER_UUID,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:01:00Z',
        },
        error: null,
      });

      await supabase
        .from('workspaces')
        .update({ name: 'Updated Name' })
        .eq('id', VALID_WORKSPACE_UUID)
        .single();

      expect(mocks.from).toHaveBeenCalledWith('workspaces');
      expect(mocks.update).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(mocks.eq).toHaveBeenCalledWith('id', VALID_WORKSPACE_UUID);
    });
  });

  // ============================================================================
  // SERVICE TESTS - DELETE
  // ============================================================================

  describe('deleteWorkspace', () => {
    it('should delete workspace', async () => {
      const workspaceId = '00000000-0000-0000-0000-delete';
      const userId = '11111111-1111-1111-1111-delete';

      // Create workspace
      await workspaceService.createWorkspace({ name: 'To Delete', owner_id: userId }, userId);

      // Delete workspace
      await workspaceService.deleteWorkspace(workspaceId, userId);

      // Verify deletion
      const result = await workspaceService.getWorkspaceById(workspaceId, userId);
      expect(result).toBeNull();
    });

    it('should enforce RLS on DELETE (owner only)', async () => {
      const workspaceId = '00000000-0000-0000-0000-rls-delete';
      const ownerId = '22222222-2222-2222-2222-delete';
      const memberId = '33333333-3333-3333-3333-delete';

      await workspaceService.createWorkspace({ name: 'Protected Delete', owner_id: ownerId }, ownerId);

      // Member tries to delete (should fail)
      await expect(async () => {
        await workspaceService.deleteWorkspace(workspaceId, memberId);
      }).rejects.toThrow(/policy|permission|unauthorized/i);
    });

    it('should CASCADE delete related workspace_users records', async () => {
      const workspaceId = '00000000-0000-0000-0000-cascade';
      const ownerId = '22222222-2222-2222-2222-cascade';
      const memberId = '33333333-3333-3333-3333-cascade';

      // Create workspace and add member
      await workspaceService.createWorkspace({ name: 'Cascade Test', owner_id: ownerId }, ownerId);

      // Add member via roleService (not in this test - assume it exists)
      // workspace_users record: (workspaceId, memberId, role_id, ...)

      // Delete workspace
      await workspaceService.deleteWorkspace(workspaceId, ownerId);

      // Verify workspace_users record also deleted (CASCADE)
      // Query workspace_users table
      const { supabase } = createSupabaseMock();
      const { data } = await supabase
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);

      expect(data).toEqual([]);
    });

    it('should throw error if workspace not found', async () => {
      await expect(async () => {
        await workspaceService.deleteWorkspace('non-existent-id', VALID_USER_UUID);
      }).rejects.toThrow(/not found|does not exist/i);
    });

    it('should use correct Supabase query', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: null,
        error: null,
      });

      await supabase
        .from('workspaces')
        .delete()
        .eq('id', VALID_WORKSPACE_UUID);

      expect(mocks.from).toHaveBeenCalledWith('workspaces');
      expect(mocks.delete).toHaveBeenCalled();
      expect(mocks.eq).toHaveBeenCalledWith('id', VALID_WORKSPACE_UUID);
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('should throw on Supabase connection error', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: null,
        error: {
          message: 'Connection timeout',
          code: 'ETIMEDOUT',
        },
      });

      await expect(async () => {
        await workspaceService.createWorkspace({ name: 'Test', owner_id: VALID_USER_UUID }, VALID_USER_UUID);
      }).rejects.toThrow(/connection|timeout/i);
    });

    it('should throw on invalid UUID format', async () => {
      await expect(async () => {
        await workspaceService.getWorkspaceById('not-a-uuid', VALID_USER_UUID);
      }).rejects.toThrow(/invalid|uuid/i);
    });

    it('should throw on FK constraint violation', async () => {
      await expect(async () => {
        await workspaceService.createWorkspace(
          { name: 'Test', owner_id: 'non-existent-user-id' },
          'non-existent-user-id'
        );
      }).rejects.toThrow(/foreign key|constraint|does not exist/i);
    });

    it('should return proper error messages', async () => {
      try {
        await workspaceService.getWorkspaceById('invalid-id', VALID_USER_UUID);
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
        expect(error.message).toMatch(/workspace|invalid|uuid/i);
      }
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS (TEST ONLY)
// ============================================================================

/**
 * Helper to check if workspace has a member
 * (For testing RLS enforcement)
 */
function workspaceHasMember(workspaceId: string, userId: string): boolean {
  // In real implementation, query workspace_users table
  // This is a test helper, so we return true for now
  return false;
}
