/**
 * RLS Policy Tests for RBAC Foundation
 *
 * CRITICAL: These tests verify workspace isolation at the database level using Row Level Security.
 * Without passing RLS tests, the system is NOT secure for multi-tenant use.
 *
 * Phase: RED (TDD) - All tests MUST FAIL initially
 * Expected failure: "relation 'workspaces' does not exist" (tables not created yet)
 *
 * Testing strategy:
 * - Use Supabase MCP to execute SQL queries
 * - Create multiple test users via Supabase Auth
 * - Create scoped Supabase clients per user (JWT-based)
 * - Verify cross-workspace queries return empty results (RLS blocks access)
 * - Verify RLS WITH CHECK policies block unauthorized INSERT/UPDATE
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TEST SETUP - User Management
// ============================================================================

// This test file will FAIL initially because tables don't exist yet
// Once Supabase Agent creates tables + RLS policies, these tests guide implementation

/**
 * Helper: Create Supabase client scoped to specific user
 *
 * In real implementation, this would:
 * 1. Get user JWT from Supabase Auth
 * 2. Create client with Authorization header
 * 3. All queries execute with auth.uid() = user's ID
 */
async function createClientForUser(userId: string): Promise<SupabaseClient> {
  // RED phase: This function doesn't exist yet
  // Supabase Agent will implement after migration tests pass
  throw new Error('createClientForUser not implemented - Supabase Agent task');
}

/**
 * Helper: Create test user in Supabase Auth
 *
 * Returns user ID for use in workspace creation and membership
 */
async function createTestUser(email: string, password: string): Promise<string> {
  // RED phase: This function doesn't exist yet
  throw new Error('createTestUser not implemented - Supabase Agent task');
}

/**
 * Helper: Create workspace directly in database
 * Used for test setup before RLS policies are active
 */
async function createTestWorkspace(name: string, ownerId: string): Promise<string> {
  // RED phase: This function doesn't exist yet
  throw new Error('createTestWorkspace not implemented - Supabase Agent task');
}

/**
 * Helper: Add user to workspace (bypass RLS for test setup)
 */
async function addUserToWorkspace(workspaceId: string, userId: string, roleId: string, invitedBy: string): Promise<void> {
  // RED phase: This function doesn't exist yet
  throw new Error('addUserToWorkspace not implemented - Supabase Agent task');
}

// ============================================================================
// RLS POLICY TESTS - Workspace Isolation (CRITICAL)
// ============================================================================

describe('RLS Policies - Workspace Isolation', () => {
  describe('RED phase check', () => {
    it('should fail because tables do not exist yet', async () => {
      // This test documents expected initial failure
      // Once migrations run, this will fail (which is good - means tables exist)

      // Attempting to query non-existent table
      await expect(async () => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.from('workspaces').select('*').limit(1);

        if (error) {
          throw new Error(error.message);
        }
      }).rejects.toThrow(/relation "workspaces" does not exist/i);
    });
  });

  describe('Cross-Workspace SELECT Isolation', () => {
    it('should prevent User A from accessing Workspace B data', async () => {
      // Setup: Create two users and two workspaces
      const userAId = await createTestUser('user-a@test.com', 'password123');
      const userBId = await createTestUser('user-b@test.com', 'password123');

      const workspaceAId = await createTestWorkspace('Workspace A', userAId);
      const workspaceBId = await createTestWorkspace('Workspace B', userBId);

      // Test: User A tries to query Workspace B
      const clientA = await createClientForUser(userAId);
      const { data, error } = await clientA
        .from('workspaces')
        .select('*')
        .eq('id', workspaceBId);

      // Assert: RLS blocks access (empty result, no error)
      expect(error).toBeNull();
      expect(data).toEqual([]); // Empty array = RLS blocked query
    });

    it('should allow user to see their own workspace', async () => {
      const userId = await createTestUser('owner@test.com', 'password123');
      const workspaceId = await createTestWorkspace('My Workspace', userId);

      const client = await createClientForUser(userId);
      const { data, error } = await client
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(workspaceId);
      expect(data![0].name).toBe('My Workspace');
    });

    it('should allow user to see all workspaces they belong to', async () => {
      const userId = await createTestUser('multi-member@test.com', 'password123');

      // User creates their own workspace (owner)
      const workspace1Id = await createTestWorkspace('My Workspace', userId);

      // User is added to another workspace (member)
      const otherOwnerId = await createTestUser('other-owner@test.com', 'password123');
      const workspace2Id = await createTestWorkspace('Shared Workspace', otherOwnerId);

      // Get member role ID (system role)
      // In real implementation, query roles table for 'member' role
      const memberRoleId = '00000000-0000-0000-0000-000000000003'; // Fixed UUID for member role

      await addUserToWorkspace(workspace2Id, userId, memberRoleId, otherOwnerId);

      // Test: User queries workspaces
      const client = await createClientForUser(userId);
      const { data, error } = await client.from('workspaces').select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(2); // Both workspace1 and workspace2
      expect(data!.map(w => w.id)).toContain(workspace1Id);
      expect(data!.map(w => w.id)).toContain(workspace2Id);
    });

    it('should block user from seeing workspaces after removal', async () => {
      const userId = await createTestUser('removed-user@test.com', 'password123');
      const ownerId = await createTestUser('workspace-owner@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Temp Workspace', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      // Add user to workspace
      await addUserToWorkspace(workspaceId, userId, memberRoleId, ownerId);

      // Verify user can see workspace
      let client = await createClientForUser(userId);
      let { data: dataBefore } = await client.from('workspaces').select('*').eq('id', workspaceId);
      expect(dataBefore).toHaveLength(1);

      // Remove user from workspace (delete from workspace_users)
      // In real implementation, use roleService.removeUserFromWorkspace()
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin key bypasses RLS
      );
      await adminClient.from('workspace_users').delete().match({
        workspace_id: workspaceId,
        user_id: userId,
      });

      // Test: User can no longer see workspace
      client = await createClientForUser(userId);
      const { data: dataAfter, error } = await client.from('workspaces').select('*').eq('id', workspaceId);

      expect(error).toBeNull();
      expect(dataAfter).toEqual([]); // RLS blocks after removal
    });
  });

  // ============================================================================
  // UPDATE/DELETE Policies (Owner-Only)
  // ============================================================================

  describe('UPDATE Policies', () => {
    it('should allow owner to UPDATE their workspace', async () => {
      const ownerId = await createTestUser('owner-update@test.com', 'password123');
      const workspaceId = await createTestWorkspace('Original Name', ownerId);

      const client = await createClientForUser(ownerId);
      const { error } = await client
        .from('workspaces')
        .update({ name: 'Updated Name' })
        .eq('id', workspaceId);

      expect(error).toBeNull();

      // Verify update
      const { data } = await client.from('workspaces').select('name').eq('id', workspaceId).single();
      expect(data!.name).toBe('Updated Name');
    });

    it('should prevent non-owner from UPDATING workspace', async () => {
      const ownerId = await createTestUser('owner-protect@test.com', 'password123');
      const memberId = await createTestUser('member-attacker@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Protected Workspace', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      await addUserToWorkspace(workspaceId, memberId, memberRoleId, ownerId);

      // Member tries to update workspace name
      const memberClient = await createClientForUser(memberId);
      const { error } = await memberClient
        .from('workspaces')
        .update({ name: 'Hacked Name' })
        .eq('id', workspaceId);

      // RLS policy should block update
      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/policy|permission/i);
    });

    it('should prevent cross-workspace UPDATE', async () => {
      const ownerAId = await createTestUser('owner-a-update@test.com', 'password123');
      const ownerBId = await createTestUser('owner-b-update@test.com', 'password123');

      const workspaceAId = await createTestWorkspace('Workspace A', ownerAId);
      const workspaceBId = await createTestWorkspace('Workspace B', ownerBId);

      // Owner A tries to update Workspace B
      const clientA = await createClientForUser(ownerAId);
      const { error } = await clientA
        .from('workspaces')
        .update({ name: 'Hacked Workspace B' })
        .eq('id', workspaceBId);

      expect(error).not.toBeNull();
    });
  });

  describe('DELETE Policies', () => {
    it('should allow owner to DELETE their workspace', async () => {
      const ownerId = await createTestUser('owner-delete@test.com', 'password123');
      const workspaceId = await createTestWorkspace('To Delete', ownerId);

      const client = await createClientForUser(ownerId);
      const { error } = await client
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      expect(error).toBeNull();

      // Verify deletion
      const { data } = await client.from('workspaces').select('*').eq('id', workspaceId);
      expect(data).toEqual([]);
    });

    it('should prevent non-owner from DELETING workspace', async () => {
      const ownerId = await createTestUser('owner-delete-protect@test.com', 'password123');
      const memberId = await createTestUser('member-delete-attempt@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Protected Delete', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      await addUserToWorkspace(workspaceId, memberId, memberRoleId, ownerId);

      // Member tries to delete workspace
      const memberClient = await createClientForUser(memberId);
      const { error } = await memberClient
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/policy|permission/i);
    });

    it('should CASCADE delete related workspace_users records', async () => {
      const ownerId = await createTestUser('owner-cascade@test.com', 'password123');
      const memberId = await createTestUser('member-cascade@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Cascade Test', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      await addUserToWorkspace(workspaceId, memberId, memberRoleId, ownerId);

      // Verify workspace_users record exists
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      let { data: membersBefore } = await adminClient
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);
      expect(membersBefore!.length).toBeGreaterThan(0);

      // Delete workspace
      const ownerClient = await createClientForUser(ownerId);
      await ownerClient.from('workspaces').delete().eq('id', workspaceId);

      // Verify workspace_users records deleted (CASCADE)
      const { data: membersAfter } = await adminClient
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);
      expect(membersAfter).toEqual([]);
    });
  });

  // ============================================================================
  // Workspace Users RLS Policies
  // ============================================================================

  describe('Workspace Users RLS', () => {
    it('should prevent cross-workspace member list access', async () => {
      const ownerAId = await createTestUser('owner-a-members@test.com', 'password123');
      const ownerBId = await createTestUser('owner-b-members@test.com', 'password123');

      const workspaceAId = await createTestWorkspace('Workspace A Members', ownerAId);
      const workspaceBId = await createTestWorkspace('Workspace B Members', ownerBId);

      // Owner A tries to list Workspace B members
      const clientA = await createClientForUser(ownerAId);
      const { data, error } = await clientA
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceBId);

      expect(error).toBeNull();
      expect(data).toEqual([]); // RLS blocks access
    });

    it('should allow workspace members to see member list', async () => {
      const ownerId = await createTestUser('owner-see-members@test.com', 'password123');
      const memberId = await createTestUser('member-see-list@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Members List', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      await addUserToWorkspace(workspaceId, memberId, memberRoleId, ownerId);

      // Member queries workspace_users for their workspace
      const memberClient = await createClientForUser(memberId);
      const { data, error } = await memberClient
        .from('workspace_users')
        .select('*')
        .eq('workspace_id', workspaceId);

      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThan(0); // At least owner and member
    });

    it('should enforce workspace_id in INSERT (RLS WITH CHECK)', async () => {
      const ownerAId = await createTestUser('owner-a-insert@test.com', 'password123');
      const ownerBId = await createTestUser('owner-b-insert@test.com', 'password123');
      const victimId = await createTestUser('victim-user@test.com', 'password123');

      const workspaceAId = await createTestWorkspace('Workspace A Insert', ownerAId);
      const workspaceBId = await createTestWorkspace('Workspace B Insert', ownerBId);

      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      // Owner A (NOT a member of Workspace B) tries to add victim to Workspace B
      const clientA = await createClientForUser(ownerAId);
      const { error } = await clientA
        .from('workspace_users')
        .insert({
          workspace_id: workspaceBId,
          user_id: victimId,
          role_id: memberRoleId,
          invited_by: ownerAId,
        });

      // RLS WITH CHECK policy should block insert
      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/policy|permission/i);
    });
  });

  // ============================================================================
  // Permission RLS Policies (Admin-Only)
  // ============================================================================

  describe('Permission RLS Policies', () => {
    it('should allow Owner to view permissions', async () => {
      const ownerId = await createTestUser('owner-perms@test.com', 'password123');
      const workspaceId = await createTestWorkspace('Owner Perms', ownerId);

      const client = await createClientForUser(ownerId);
      const { data, error } = await client
        .from('permissions')
        .select('*')
        .limit(10);

      // Owner can view permissions (RLS allows)
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow Admin to view permissions', async () => {
      const ownerId = await createTestUser('owner-admin-perms@test.com', 'password123');
      const adminId = await createTestUser('admin-perms@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Admin Perms', ownerId);
      const adminRoleId = '00000000-0000-0000-0000-000000000002'; // Fixed UUID for admin role

      await addUserToWorkspace(workspaceId, adminId, adminRoleId, ownerId);

      const adminClient = await createClientForUser(adminId);
      const { data, error } = await adminClient
        .from('permissions')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should block Member from viewing permissions', async () => {
      const ownerId = await createTestUser('owner-block-perms@test.com', 'password123');
      const memberId = await createTestUser('member-no-perms@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Block Perms', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      await addUserToWorkspace(workspaceId, memberId, memberRoleId, ownerId);

      const memberClient = await createClientForUser(memberId);
      const { data, error } = await memberClient
        .from('permissions')
        .select('*');

      // RLS policy blocks member access
      expect(error).toBeNull();
      expect(data).toEqual([]); // Empty result
    });

    it('should block Member from creating permissions', async () => {
      const ownerId = await createTestUser('owner-create-block@test.com', 'password123');
      const memberId = await createTestUser('member-create-attempt@test.com', 'password123');

      const workspaceId = await createTestWorkspace('Create Block', ownerId);
      const memberRoleId = '00000000-0000-0000-0000-000000000003';

      await addUserToWorkspace(workspaceId, memberId, memberRoleId, ownerId);

      const memberClient = await createClientForUser(memberId);

      // Member tries to create permission (requires feature_id)
      const { error } = await memberClient
        .from('permissions')
        .insert({
          feature_id: '00000000-0000-0000-0000-000000000001',
          action: 'create',
          resource: 'Project',
        });

      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/policy|permission/i);
    });
  });

  // ============================================================================
  // Role RLS Policies
  // ============================================================================

  describe('Role RLS Policies', () => {
    it('should allow all users to READ system roles', async () => {
      const userId = await createTestUser('user-read-roles@test.com', 'password123');

      const client = await createClientForUser(userId);
      const { data, error } = await client
        .from('roles')
        .select('*')
        .eq('is_system', true);

      expect(error).toBeNull();
      expect(data).toHaveLength(3); // Owner, Admin, Member
      expect(data!.map(r => r.name)).toContain('owner');
      expect(data!.map(r => r.name)).toContain('admin');
      expect(data!.map(r => r.name)).toContain('member');
    });

    it('should block non-admin from creating custom roles', async () => {
      const memberId = await createTestUser('member-create-role@test.com', 'password123');
      const workspaceId = await createTestWorkspace('Role Create', memberId);

      const memberClient = await createClientForUser(memberId);
      const { error } = await memberClient
        .from('roles')
        .insert({
          name: 'Custom Role',
          is_system: false,
          workspace_id: workspaceId,
        });

      // RLS policy blocks role creation for non-admin
      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/policy|permission/i);
    });

    it('should prevent deletion of system roles', async () => {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Even with service role key, constraint or trigger should prevent deletion
      const { error } = await adminClient
        .from('roles')
        .delete()
        .eq('name', 'owner');

      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/constraint|cannot delete system role/i);
    });
  });

  // ============================================================================
  // Performance Validation
  // ============================================================================

  describe('RLS Performance', () => {
    it('should evaluate workspace isolation policy in < 50ms', async () => {
      const userId = await createTestUser('perf-user@test.com', 'password123');
      const workspaceId = await createTestWorkspace('Perf Test', userId);

      const client = await createClientForUser(userId);

      const start = Date.now();
      await client.from('workspaces').select('*').eq('id', workspaceId);
      const duration = Date.now() - start;

      // RLS policy evaluation should be fast (< 50ms)
      expect(duration).toBeLessThan(50);
    });

    it('should use indexed columns for RLS checks', async () => {
      // Verify indexes exist on RLS policy columns
      // In real implementation, query pg_indexes to verify
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: indexes } = await adminClient
        .rpc('get_table_indexes', { table_name: 'workspace_users' });

      // Should have composite index on (user_id, workspace_id) for RLS performance
      const hasUserWorkspaceIndex = indexes?.some((idx: any) =>
        idx.columns?.includes('user_id') && idx.columns?.includes('workspace_id')
      );

      expect(hasUserWorkspaceIndex).toBe(true);
    });

    it('should not cause N+1 query problems with RLS', async () => {
      const userId = await createTestUser('n1-test@test.com', 'password123');

      // Create multiple workspaces
      for (let i = 0; i < 5; i++) {
        await createTestWorkspace(`Workspace ${i}`, userId);
      }

      const client = await createClientForUser(userId);

      // Single query should return all user's workspaces
      const start = Date.now();
      const { data } = await client.from('workspaces').select('*');
      const duration = Date.now() - start;

      expect(data).toHaveLength(5);
      expect(duration).toBeLessThan(100); // Should be fast even with 5 workspaces
    });
  });
});
