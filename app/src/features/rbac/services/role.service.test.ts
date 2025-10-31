/**
 * Role Service Tests
 *
 * Defines data access interfaces for role and workspace membership operations.
 * These tests specify pure database interactions with RLS enforcement.
 *
 * Phase: RED (TDD) - All tests MUST FAIL initially
 * Expected failure: "roleService is not defined" (service not implemented yet)
 *
 * Testing strategy:
 * - Test role queries (system roles)
 * - Test workspace membership operations (assign, update, remove)
 * - Verify RLS policies enforce workspace membership requirements
 * - Test error handling
 *
 * Service Interface to Implement:
 * ```typescript
 * export const roleService = {
 *   getSystemRoles(): Promise<Role[]>;
 *   getRoleByName(name: string): Promise<Role | null>;
 *   assignRole(input: WorkspaceUserCreate): Promise<WorkspaceUser>;
 *   updateUserRole(workspaceId: string, userId: string, input: WorkspaceUserUpdate): Promise<WorkspaceUser>;
 *   removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
 *   getWorkspaceMembership(userId: string, workspaceId: string): Promise<WorkspaceUser | null>;
 *   listWorkspaceMembers(workspaceId: string, userId: string): Promise<WorkspaceUser[]>;
 * };
 * ```
 */

import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role, WorkspaceUser, WorkspaceUserCreate, WorkspaceUserUpdate } from '../entities';

// UUID constants for consistent test data
const VALID_USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_WORKSPACE_UUID = '223e4567-e89b-12d3-a456-426614174000';
const VALID_OWNER_ROLE_UUID = '00000000-0000-0000-0000-000000000001';
const VALID_ADMIN_ROLE_UUID = '00000000-0000-0000-0000-000000000002';
const VALID_MEMBER_ROLE_UUID = '00000000-0000-0000-0000-000000000003';
const VALID_OWNER_UUID = '323e4567-e89b-12d3-a456-426614174000';
const VALID_INVITER_UUID = '423e4567-e89b-12d3-a456-426614174000';
const VALID_ATTACKER_UUID = '523e4567-e89b-12d3-a456-426614174000';

// ============================================================================
// SERVICE INTERFACE (TO BE IMPLEMENTED BY SUPABASE AGENT)
// ============================================================================

/**
 * Role Service Interface
 *
 * Pure data access layer for role and membership operations.
 * NO business logic - only database CRUD + RLS enforcement.
 */
interface RoleService {
  getSystemRoles(): Promise<Role[]>;
  getRoleByName(name: string): Promise<Role | null>;
  assignRole(input: WorkspaceUserCreate, userId: string): Promise<WorkspaceUser>;
  updateUserRole(workspaceId: string, userId: string, input: WorkspaceUserUpdate, requesterId: string): Promise<WorkspaceUser>;
  removeUserFromWorkspace(workspaceId: string, userId: string, requesterId: string): Promise<void>;
  getWorkspaceMembership(userId: string, workspaceId: string): Promise<WorkspaceUser | null>;
  listWorkspaceMembers(workspaceId: string, requesterId: string): Promise<WorkspaceUser[]>;
}

// RED phase: Service not defined yet
// @ts-expect-error - Service will be implemented by Supabase Agent
let roleService: RoleService;

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
// SERVICE TESTS - SYSTEM ROLES
// ============================================================================

describe('RoleService', () => {
  describe('RED phase check', () => {
    it('should not be defined yet (TDD RED phase)', () => {
      // @ts-expect-error - Service not implemented yet
      expect(roleService).toBeUndefined();
    });
  });

  describe('getSystemRoles', () => {
    it('should return all 3 system roles', async () => {
      const roles = await roleService.getSystemRoles();

      expect(roles).toHaveLength(3);
      expect(roles.map(r => r.name)).toContain('owner');
      expect(roles.map(r => r.name)).toContain('admin');
      expect(roles.map(r => r.name)).toContain('member');
    });

    it('should return roles with is_system=true', async () => {
      const roles = await roleService.getSystemRoles();

      roles.forEach(role => {
        expect(role.is_system).toBe(true);
        expect(role.workspace_id).toBeNull(); // System roles are global
      });
    });

    it('should return roles with fixed UUIDs', async () => {
      const roles = await roleService.getSystemRoles();

      const ownerRole = roles.find(r => r.name === 'owner');
      const adminRole = roles.find(r => r.name === 'admin');
      const memberRole = roles.find(r => r.name === 'member');

      expect(ownerRole!.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(adminRole!.id).toBe('00000000-0000-0000-0000-000000000002');
      expect(memberRole!.id).toBe('00000000-0000-0000-0000-000000000003');
    });

    it('should return roles with descriptions', async () => {
      const roles = await roleService.getSystemRoles();

      roles.forEach(role => {
        expect(role.description).toBeDefined();
        expect(role.description!.length).toBeGreaterThan(0);
      });
    });

    it('should use correct Supabase query', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: [
          { id: '1', name: 'owner', is_system: true, workspace_id: null },
          { id: '2', name: 'admin', is_system: true, workspace_id: null },
          { id: '3', name: 'member', is_system: true, workspace_id: null },
        ],
        error: null,
      });

      await supabase
        .from('roles')
        .select('*')
        .eq('is_system', true);

      expect(mocks.from).toHaveBeenCalledWith('roles');
      expect(mocks.select).toHaveBeenCalledWith('*');
      expect(mocks.eq).toHaveBeenCalledWith('is_system', true);
    });
  });

  describe('getRoleByName', () => {
    it('should fetch owner role by name', async () => {
      const role = await roleService.getRoleByName('owner');

      expect(role).toBeDefined();
      expect(role!.name).toBe('owner');
      expect(role!.is_system).toBe(true);
      expect(role!.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should fetch admin role by name', async () => {
      const role = await roleService.getRoleByName('admin');

      expect(role).toBeDefined();
      expect(role!.name).toBe('admin');
      expect(role!.is_system).toBe(true);
    });

    it('should fetch member role by name', async () => {
      const role = await roleService.getRoleByName('member');

      expect(role).toBeDefined();
      expect(role!.name).toBe('member');
      expect(role!.is_system).toBe(true);
    });

    it('should return null if role not found', async () => {
      const role = await roleService.getRoleByName('non-existent-role');

      expect(role).toBeNull();
    });

    it('should be case-insensitive', async () => {
      const role1 = await roleService.getRoleByName('owner');
      const role2 = await roleService.getRoleByName('OWNER');

      expect(role1!.name).toBe(role2!.name);
    });
  });

  // ============================================================================
  // SERVICE TESTS - ROLE ASSIGNMENT
  // ============================================================================

  describe('assignRole', () => {
    it('should assign role to user in workspace', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: VALID_WORKSPACE_UUID,
        user_id: VALID_USER_UUID,
        role_id: '00000000-0000-0000-0000-000000000002', // Admin role
        invited_by: VALID_OWNER_UUID,
      };

      const assignment = await roleService.assignRole(assignData, VALID_OWNER_UUID);

      expect(assignment.workspace_id).toBe(VALID_WORKSPACE_UUID);
      expect(assignment.user_id).toBe(VALID_USER_UUID);
      expect(assignment.role_id).toBe('00000000-0000-0000-0000-000000000002');
      expect(assignment.invited_by).toBe(VALID_OWNER_UUID);
      expect(assignment.joined_at).toBeDefined();
    });

    it('should auto-set joined_at timestamp', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: 'workspace-timestamp',
        user_id: 'user-timestamp',
        role_id: '00000000-0000-0000-0000-000000000003', // Member role
        invited_by: 'owner-timestamp',
      };

      const assignment = await roleService.assignRole(assignData, 'owner-timestamp');

      expect(assignment.joined_at).toBeDefined();
      expect(new Date(assignment.joined_at).getTime()).toBeGreaterThan(0);
    });

    it('should fail if role does not exist', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: VALID_WORKSPACE_UUID,
        user_id: VALID_USER_UUID,
        role_id: '00000000-0000-0000-0000-999999999999',
        invited_by: VALID_OWNER_UUID,
      };

      await expect(async () => {
        await roleService.assignRole(assignData, VALID_OWNER_UUID);
      }).rejects.toThrow(/role|does not exist|foreign key/i);
    });

    it('should fail if workspace does not exist', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: '00000000-0000-0000-0000-999999999998',
        user_id: VALID_USER_UUID,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: VALID_OWNER_UUID,
      };

      await expect(async () => {
        await roleService.assignRole(assignData, VALID_OWNER_UUID);
      }).rejects.toThrow(/workspace|does not exist|foreign key/i);
    });

    it('should fail if user already member (unique constraint)', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: 'workspace-duplicate',
        user_id: 'user-duplicate',
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: 'owner-duplicate',
      };

      // First assignment (succeeds)
      await roleService.assignRole(assignData, 'owner-duplicate');

      // Duplicate assignment (fails)
      await expect(async () => {
        await roleService.assignRole(assignData, 'owner-duplicate');
      }).rejects.toThrow(/duplicate|unique|already a member/i);
    });

    it('should allow assigning same user to multiple workspaces', async () => {
      const userId = '33333333-0000-0000-0000-000000000001';

      const assign1: WorkspaceUserCreate = {
        workspace_id: '11111111-0000-0000-0000-000000000001',
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: '22222222-0000-0000-0000-000000000001',
      };

      const assign2: WorkspaceUserCreate = {
        workspace_id: '11111111-0000-0000-0000-000000000002',
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000002',
        invited_by: '22222222-0000-0000-0000-000000000002',
      };

      // Both assignments should succeed
      await roleService.assignRole(assign1, '22222222-0000-0000-0000-000000000001');
      await roleService.assignRole(assign2, '22222222-0000-0000-0000-000000000002');

      // User now member of 2 workspaces
      const membership1 = await roleService.getWorkspaceMembership(userId, '11111111-0000-0000-0000-000000000001');
      const membership2 = await roleService.getWorkspaceMembership(userId, '11111111-0000-0000-0000-000000000002');

      expect(membership1).toBeDefined();
      expect(membership2).toBeDefined();
    });

    it('should enforce RLS on INSERT (workspace membership required)', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: '11111111-0000-0000-0000-000000000003',
        user_id: '44444444-0000-0000-0000-000000000001',
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: VALID_ATTACKER_UUID, // Attacker not in workspace-b
      };

      // Attacker tries to add victim to workspace-b
      await expect(async () => {
        await roleService.assignRole(assignData, VALID_ATTACKER_UUID);
      }).rejects.toThrow(/policy|permission|not a member/i);
    });

    it('should use correct Supabase query', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: {
          workspace_id: VALID_WORKSPACE_UUID,
          user_id: VALID_USER_UUID,
          role_id: 'role-789',
          invited_by: VALID_OWNER_UUID,
          joined_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      await supabase
        .from('workspace_users')
        .insert({
          workspace_id: VALID_WORKSPACE_UUID,
          user_id: VALID_USER_UUID,
          role_id: 'role-789',
          invited_by: VALID_OWNER_UUID,
        })
        .single();

      expect(mocks.from).toHaveBeenCalledWith('workspace_users');
      expect(mocks.insert).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // SERVICE TESTS - UPDATE ROLE
  // ============================================================================

  describe('updateUserRole', () => {
    it('should update user role in workspace', async () => {
      const workspaceId = '00000000-0000-0000-0000-update';
      const userId = '11111111-1111-1111-1111-update';
      const ownerId = '22222222-2222-2222-2222-update';

      // Assign member role
      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003', // Member
        invited_by: ownerId,
      }, ownerId);

      // Update to admin role
      const updated = await roleService.updateUserRole(
        workspaceId,
        userId,
        { role_id: '00000000-0000-0000-0000-000000000002' }, // Admin
        ownerId
      );

      expect(updated.role_id).toBe('00000000-0000-0000-0000-000000000002');
      expect(updated.workspace_id).toBe(workspaceId);
      expect(updated.user_id).toBe(userId);
    });

    it('should not allow changing workspace_id', async () => {
      const workspaceId = '00000000-0000-0000-0000-immutable';
      const userId = '11111111-1111-1111-1111-immutable';
      const ownerId = '22222222-2222-2222-2222-immutable';

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      // Attempt to change workspace_id (should fail)
      await expect(async () => {
        await roleService.updateUserRole(
          workspaceId,
          userId,
          { workspace_id: 'different-workspace' } as any, // TypeScript should block
          ownerId
        );
      }).rejects.toThrow(/immutable|cannot change workspace/i);
    });

    it('should not allow changing user_id', async () => {
      const workspaceId = '00000000-0000-0000-0000-user-immutable';
      const userId = '11111111-1111-1111-1111-immutable';
      const ownerId = '22222222-2222-2222-2222-immutable';

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      // Attempt to change user_id (should fail)
      await expect(async () => {
        await roleService.updateUserRole(
          workspaceId,
          userId,
          { user_id: 'different-user' } as any, // TypeScript should block
          ownerId
        );
      }).rejects.toThrow(/immutable|cannot change user/i);
    });

    it('should enforce RLS (only workspace members can update)', async () => {
      const workspaceId = '00000000-0000-0000-0000-rls';
      const userId = '11111111-1111-1111-1111-rls';
      const ownerId = '22222222-2222-2222-2222-rls';
      const attackerId = '99999999-9999-9999-9999-rls';

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      // Attacker (not in workspace) tries to update role
      await expect(async () => {
        await roleService.updateUserRole(
          workspaceId,
          userId,
          { role_id: '00000000-0000-0000-0000-000000000001' }, // Owner role
          attackerId
        );
      }).rejects.toThrow(/policy|permission|not a member/i);
    });
  });

  // ============================================================================
  // SERVICE TESTS - REMOVE USER
  // ============================================================================

  describe('removeUserFromWorkspace', () => {
    it('should remove user from workspace', async () => {
      const workspaceId = '00000000-0000-0000-0000-remove';
      const userId = '11111111-1111-1111-1111-remove';
      const ownerId = '22222222-2222-2222-2222-remove';

      // Assign role
      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      // Remove user
      await roleService.removeUserFromWorkspace(workspaceId, userId, ownerId);

      // Verify removal
      const membership = await roleService.getWorkspaceMembership(userId, workspaceId);
      expect(membership).toBeNull();
    });

    it('should prevent removing owner from their workspace', async () => {
      const workspaceId = '00000000-0000-0000-0000-owner-protect';
      const ownerId = '22222222-2222-2222-2222-protect';

      // Owner is automatically a member when workspace created
      // Attempt to remove owner
      await expect(async () => {
        await roleService.removeUserFromWorkspace(workspaceId, ownerId, ownerId);
      }).rejects.toThrow(/cannot remove owner|protected|constraint/i);
    });

    it('should enforce RLS (only workspace members can remove)', async () => {
      const workspaceId = '00000000-0000-0000-0000-remove-rls';
      const userId = '11111111-1111-1111-1111-remove-rls';
      const ownerId = '22222222-2222-2222-2222-remove-rls';
      const attackerId = '99999999-9999-9999-9999-remove-rls';

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      // Attacker tries to remove user
      await expect(async () => {
        await roleService.removeUserFromWorkspace(workspaceId, userId, attackerId);
      }).rejects.toThrow(/policy|permission|not a member/i);
    });

    it('should throw if user not in workspace', async () => {
      await expect(async () => {
        await roleService.removeUserFromWorkspace(VALID_WORKSPACE_UUID, '99999999-0000-0000-0000-000000000001', VALID_OWNER_UUID);
      }).rejects.toThrow(/not found|not a member/i);
    });
  });

  // ============================================================================
  // SERVICE TESTS - GET MEMBERSHIP
  // ============================================================================

  describe('getWorkspaceMembership', () => {
    it('should fetch user membership in workspace', async () => {
      const workspaceId = '00000000-0000-0000-0000-membership';
      const userId = '11111111-1111-1111-1111-membership';
      const ownerId = '22222222-2222-2222-2222-membership';

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000002', // Admin
        invited_by: ownerId,
      }, ownerId);

      const membership = await roleService.getWorkspaceMembership(userId, workspaceId);

      expect(membership).toBeDefined();
      expect(membership!.workspace_id).toBe(workspaceId);
      expect(membership!.user_id).toBe(userId);
      expect(membership!.role_id).toBe('00000000-0000-0000-0000-000000000002');
    });

    it('should return null if user not in workspace', async () => {
      const membership = await roleService.getWorkspaceMembership('99999999-0000-0000-0000-000000000002', VALID_WORKSPACE_UUID);

      expect(membership).toBeNull();
    });

    it('should include joined_at timestamp', async () => {
      const workspaceId = '00000000-0000-0000-0000-joined';
      const userId = '11111111-1111-1111-1111-joined';
      const ownerId = '22222222-2222-2222-2222-joined';

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      const membership = await roleService.getWorkspaceMembership(userId, workspaceId);

      expect(membership!.joined_at).toBeDefined();
      expect(new Date(membership!.joined_at).getTime()).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SERVICE TESTS - LIST MEMBERS
  // ============================================================================

  describe('listWorkspaceMembers', () => {
    it('should return all members in workspace', async () => {
      const workspaceId = '00000000-0000-0000-0000-list';
      const ownerId = '22222222-2222-2222-2222-list';

      // Add multiple members
      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: '11111111-0000-0000-0000-000000000001',
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: ownerId,
      }, ownerId);

      await roleService.assignRole({
        workspace_id: workspaceId,
        user_id: '11111111-0000-0000-0000-000000000002',
        role_id: '00000000-0000-0000-0000-000000000002',
        invited_by: ownerId,
      }, ownerId);

      const members = await roleService.listWorkspaceMembers(workspaceId, ownerId);

      expect(members.length).toBeGreaterThanOrEqual(2);
      expect(members.some(m => m.user_id === '11111111-0000-0000-0000-000000000001')).toBe(true);
      expect(members.some(m => m.user_id === '11111111-0000-0000-0000-000000000002')).toBe(true);
    });

    it('should enforce RLS (only workspace members see list)', async () => {
      const workspaceId = '00000000-0000-0000-0000-list-rls';
      const ownerId = '22222222-2222-2222-2222-list-rls';
      const attackerId = '99999999-9999-9999-9999-list-rls';

      // Attacker (not a member) tries to list members
      const members = await roleService.listWorkspaceMembers(workspaceId, attackerId);

      // RLS blocks access (empty array)
      expect(members).toEqual([]);
    });

    it('should return empty array if workspace has no members', async () => {
      const workspaceId = '00000000-0000-0000-0000-empty';
      const ownerId = '22222222-2222-2222-2222-empty';

      const members = await roleService.listWorkspaceMembers(workspaceId, ownerId);

      expect(Array.isArray(members)).toBe(true);
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
        await roleService.getSystemRoles();
      }).rejects.toThrow(/connection|timeout/i);
    });

    it('should throw on FK constraint violations', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: '00000000-0000-0000-0000-999999999998',
        user_id: VALID_USER_UUID,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: VALID_OWNER_UUID,
      };

      await expect(async () => {
        await roleService.assignRole(assignData, VALID_OWNER_UUID);
      }).rejects.toThrow(/foreign key|constraint|does not exist/i);
    });

    it('should throw on unique constraint violations', async () => {
      const assignData: WorkspaceUserCreate = {
        workspace_id: VALID_WORKSPACE_UUID,
        user_id: VALID_USER_UUID,
        role_id: '00000000-0000-0000-0000-000000000003',
        invited_by: VALID_OWNER_UUID,
      };

      // First assignment
      await roleService.assignRole(assignData, VALID_OWNER_UUID);

      // Duplicate assignment
      await expect(async () => {
        await roleService.assignRole(assignData, VALID_OWNER_UUID);
      }).rejects.toThrow(/duplicate|unique|already a member/i);
    });

    it('should return proper error messages', async () => {
      try {
        await roleService.getRoleByName('');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // SYSTEM ROLE PROTECTION
  // ============================================================================

  describe('System Role Protection', () => {
    it('should prevent deleting system roles', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: null,
        error: {
          message: 'Cannot delete system role',
          code: '23503',
        },
      });

      await expect(async () => {
        await supabase
          .from('roles')
          .delete()
          .eq('name', 'owner');
      }).rejects.toBeDefined();
    });

    it('should prevent modifying system role is_system flag', async () => {
      await expect(async () => {
        // Attempt to change is_system flag
        // Service should prevent this or trigger/constraint should block
        const { supabase } = createSupabaseMock();
        await supabase
          .from('roles')
          .update({ is_system: false })
          .eq('name', 'owner');
      }).rejects.toThrow(/immutable|system role|constraint/i);
    });

    it('should allow updating system role description', async () => {
      const { supabase, mocks } = createSupabaseMock();

      mocks.single.mockResolvedValue({
        data: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'owner',
          description: 'Updated description',
          is_system: true,
          workspace_id: null,
        },
        error: null,
      });

      // Updating description is allowed
      await supabase
        .from('roles')
        .update({ description: 'Updated description' })
        .eq('name', 'owner')
        .single();

      expect(mocks.update).toHaveBeenCalledWith({ description: 'Updated description' });
    });
  });
});
