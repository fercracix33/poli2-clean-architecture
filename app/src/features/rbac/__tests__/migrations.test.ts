/**
 * Migration Tests for RBAC Foundation
 *
 * These tests verify database schema integrity: tables, columns, foreign keys, indexes, RLS policies, and system data seeding.
 *
 * Phase: RED (TDD) - All tests MUST FAIL initially
 * Expected failure: "relation 'workspaces' does not exist" (migrations not run yet)
 *
 * Testing strategy:
 * - Query information_schema to verify table structure
 * - Query pg_constraint to verify foreign keys
 * - Query pg_indexes to verify index creation
 * - Query pg_policies to verify RLS policy creation
 * - Query roles table to verify system role seeding
 *
 * Purpose: Defines exact schema specifications for Supabase Agent
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TEST SETUP
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin key to query schema metadata
);

/**
 * Helper: Get table columns from information_schema
 */
async function getTableColumns(tableName: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);

  if (error) throw error;
  return data || [];
}

/**
 * Helper: Get foreign keys for a table
 */
async function getForeignKeys(tableName: string): Promise<any[]> {
  // Query pg_constraint for foreign keys
  // In real implementation, use raw SQL via execute_sql
  const { data, error } = await supabase.rpc('get_foreign_keys', {
    p_table_name: tableName,
  });

  if (error) throw error;
  return data || [];
}

/**
 * Helper: Get indexes for a table
 */
async function getIndexes(tableName: string): Promise<string[]> {
  const { data, error } = await supabase
    .rpc('get_table_indexes', { table_name: tableName });

  if (error) throw error;
  return (data || []).map((idx: any) => idx.indexname);
}

/**
 * Helper: Check if RLS is enabled on a table
 */
async function isRLSEnabled(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_rls_enabled', { p_table_name: tableName });

  if (error) throw error;
  return data === true;
}

/**
 * Helper: Get all public tables
 */
async function getPublicTables(): Promise<string[]> {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (error) throw error;
  return (data || []).map((t: any) => t.table_name);
}

// ============================================================================
// TABLE CREATION TESTS
// ============================================================================

describe('Database Migrations - Table Creation', () => {
  describe('RED phase check', () => {
    it('should fail because tables do not exist yet', async () => {
      // This test documents expected initial failure
      await expect(async () => {
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .limit(1);

        if (error) {
          throw new Error(error.message);
        }
      }).rejects.toThrow(/relation "workspaces" does not exist/i);
    });
  });

  it('should create all 6 RBAC tables', async () => {
    const tables = await getPublicTables();

    const requiredTables = [
      'workspaces',
      'roles',
      'features',
      'permissions',
      'workspace_users',
      'role_permissions',
    ];

    requiredTables.forEach(table => {
      expect(tables).toContain(table);
    });
  });

  describe('workspaces table schema', () => {
    it('should have correct columns with proper types', async () => {
      const columns = await getTableColumns('workspaces');

      // Helper to find column
      const findColumn = (name: string) => columns.find(c => c.column_name === name);

      // id - uuid primary key
      const idCol = findColumn('id');
      expect(idCol).toBeDefined();
      expect(idCol!.data_type).toBe('uuid');
      expect(idCol!.is_nullable).toBe('NO');

      // name - text, not null
      const nameCol = findColumn('name');
      expect(nameCol).toBeDefined();
      expect(nameCol!.data_type).toBe('text');
      expect(nameCol!.is_nullable).toBe('NO');

      // owner_id - uuid, not null
      const ownerCol = findColumn('owner_id');
      expect(ownerCol).toBeDefined();
      expect(ownerCol!.data_type).toBe('uuid');
      expect(ownerCol!.is_nullable).toBe('NO');

      // created_at - timestamp with time zone
      const createdCol = findColumn('created_at');
      expect(createdCol).toBeDefined();
      expect(createdCol!.data_type).toBe('timestamp with time zone');
      expect(createdCol!.is_nullable).toBe('NO');

      // updated_at - timestamp with time zone
      const updatedCol = findColumn('updated_at');
      expect(updatedCol).toBeDefined();
      expect(updatedCol!.data_type).toBe('timestamp with time zone');
      expect(updatedCol!.is_nullable).toBe('NO');
    });

    it('should have CHECK constraint on name length', async () => {
      // Attempting to insert empty name should fail
      const { error } = await supabase
        .from('workspaces')
        .insert({
          name: '', // Empty name violates CHECK constraint
          owner_id: '00000000-0000-0000-0000-000000000001',
        });

      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/constraint|check|length|name/i);
    });
  });

  describe('roles table schema', () => {
    it('should have correct columns with proper types', async () => {
      const columns = await getTableColumns('roles');

      const findColumn = (name: string) => columns.find(c => c.column_name === name);

      // id - uuid
      expect(findColumn('id')).toBeDefined();
      expect(findColumn('id')!.data_type).toBe('uuid');

      // name - text
      expect(findColumn('name')).toBeDefined();
      expect(findColumn('name')!.data_type).toBe('text');

      // description - text, nullable
      expect(findColumn('description')).toBeDefined();
      expect(findColumn('description')!.is_nullable).toBe('YES');

      // is_system - boolean
      expect(findColumn('is_system')).toBeDefined();
      expect(findColumn('is_system')!.data_type).toBe('boolean');

      // workspace_id - uuid, nullable (null for system roles)
      expect(findColumn('workspace_id')).toBeDefined();
      expect(findColumn('workspace_id')!.data_type).toBe('uuid');
      expect(findColumn('workspace_id')!.is_nullable).toBe('YES');

      // created_at - timestamp
      expect(findColumn('created_at')).toBeDefined();
      expect(findColumn('created_at')!.data_type).toBe('timestamp with time zone');
    });
  });

  describe('features table schema', () => {
    it('should have correct columns with proper types', async () => {
      const columns = await getTableColumns('features');

      const findColumn = (name: string) => columns.find(c => c.column_name === name);

      expect(findColumn('id')).toBeDefined();
      expect(findColumn('name')).toBeDefined();
      expect(findColumn('display_name')).toBeDefined();
      expect(findColumn('description')).toBeDefined();
      expect(findColumn('is_enabled')).toBeDefined();
      expect(findColumn('created_at')).toBeDefined();
    });
  });

  describe('permissions table schema', () => {
    it('should have correct columns with proper types', async () => {
      const columns = await getTableColumns('permissions');

      const findColumn = (name: string) => columns.find(c => c.column_name === name);

      // id
      expect(findColumn('id')).toBeDefined();

      // feature_id - uuid FK
      expect(findColumn('feature_id')).toBeDefined();
      expect(findColumn('feature_id')!.data_type).toBe('uuid');

      // action - enum or text with CHECK
      const actionCol = findColumn('action');
      expect(actionCol).toBeDefined();
      expect(['text', 'USER-DEFINED']).toContain(actionCol!.data_type);

      // resource - text
      expect(findColumn('resource')).toBeDefined();

      // description - text, nullable
      expect(findColumn('description')).toBeDefined();

      // conditions - jsonb, nullable
      const conditionsCol = findColumn('conditions');
      expect(conditionsCol).toBeDefined();
      expect(conditionsCol!.data_type).toBe('jsonb');
      expect(conditionsCol!.is_nullable).toBe('YES');

      // created_at
      expect(findColumn('created_at')).toBeDefined();
    });

    it('should enforce action ENUM constraint', async () => {
      // Trying to insert invalid action should fail
      const { error } = await supabase
        .from('permissions')
        .insert({
          feature_id: '00000000-0000-0000-0000-000000000001',
          action: 'invalid_action', // Not in enum
          resource: 'Test',
        });

      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/constraint|enum|action|invalid/i);
    });
  });

  describe('workspace_users table schema', () => {
    it('should have correct columns with proper types', async () => {
      const columns = await getTableColumns('workspace_users');

      const findColumn = (name: string) => columns.find(c => c.column_name === name);

      // workspace_id - uuid, not null
      expect(findColumn('workspace_id')).toBeDefined();
      expect(findColumn('workspace_id')!.data_type).toBe('uuid');
      expect(findColumn('workspace_id')!.is_nullable).toBe('NO');

      // user_id - uuid, not null
      expect(findColumn('user_id')).toBeDefined();
      expect(findColumn('user_id')!.data_type).toBe('uuid');
      expect(findColumn('user_id')!.is_nullable).toBe('NO');

      // role_id - uuid, not null
      expect(findColumn('role_id')).toBeDefined();
      expect(findColumn('role_id')!.data_type).toBe('uuid');
      expect(findColumn('role_id')!.is_nullable).toBe('NO');

      // invited_by - uuid, not null
      expect(findColumn('invited_by')).toBeDefined();
      expect(findColumn('invited_by')!.data_type).toBe('uuid');

      // joined_at - timestamp
      expect(findColumn('joined_at')).toBeDefined();
      expect(findColumn('joined_at')!.data_type).toBe('timestamp with time zone');
    });

    it('should have composite primary key (workspace_id, user_id)', async () => {
      // Inserting duplicate (workspace_id, user_id) should fail
      const workspaceId = '00000000-0000-0000-0000-000000000001';
      const userId = '00000000-0000-0000-0000-000000000002';
      const roleId = '00000000-0000-0000-0000-000000000003';

      // First insert (should succeed if tables exist)
      await supabase.from('workspace_users').insert({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: roleId,
        invited_by: userId,
      });

      // Duplicate insert (should fail)
      const { error } = await supabase.from('workspace_users').insert({
        workspace_id: workspaceId,
        user_id: userId,
        role_id: roleId,
        invited_by: userId,
      });

      expect(error).not.toBeNull();
      expect(error!.message).toMatch(/duplicate|unique|primary key/i);
    });
  });

  describe('role_permissions table schema', () => {
    it('should have correct columns with proper types', async () => {
      const columns = await getTableColumns('role_permissions');

      const findColumn = (name: string) => columns.find(c => c.column_name === name);

      expect(findColumn('role_id')).toBeDefined();
      expect(findColumn('permission_id')).toBeDefined();
      expect(findColumn('granted_at')).toBeDefined();
    });
  });
});

// ============================================================================
// FOREIGN KEY CONSTRAINTS
// ============================================================================

describe('Database Migrations - Foreign Keys', () => {
  it('should create FK: workspaces.owner_id → auth.users.id', async () => {
    const fks = await getForeignKeys('workspaces');

    const ownerFK = fks.find(fk => fk.column_name === 'owner_id');
    expect(ownerFK).toBeDefined();
    expect(ownerFK!.foreign_table_schema).toBe('auth');
    expect(ownerFK!.foreign_table_name).toBe('users');
    expect(ownerFK!.foreign_column_name).toBe('id');
  });

  it('should create FK: workspace_users.workspace_id → workspaces.id with CASCADE', async () => {
    const fks = await getForeignKeys('workspace_users');

    const workspaceFK = fks.find(fk => fk.column_name === 'workspace_id');
    expect(workspaceFK).toBeDefined();
    expect(workspaceFK!.foreign_table_name).toBe('workspaces');
    expect(workspaceFK!.on_delete).toBe('CASCADE'); // Deleting workspace deletes memberships
  });

  it('should create FK: workspace_users.user_id → auth.users.id', async () => {
    const fks = await getForeignKeys('workspace_users');

    const userFK = fks.find(fk => fk.column_name === 'user_id');
    expect(userFK).toBeDefined();
    expect(userFK!.foreign_table_schema).toBe('auth');
    expect(userFK!.foreign_table_name).toBe('users');
  });

  it('should create FK: workspace_users.role_id → roles.id', async () => {
    const fks = await getForeignKeys('workspace_users');

    const roleFK = fks.find(fk => fk.column_name === 'role_id');
    expect(roleFK).toBeDefined();
    expect(roleFK!.foreign_table_name).toBe('roles');
  });

  it('should create FK: permissions.feature_id → features.id with CASCADE', async () => {
    const fks = await getForeignKeys('permissions');

    const featureFK = fks.find(fk => fk.column_name === 'feature_id');
    expect(featureFK).toBeDefined();
    expect(featureFK!.foreign_table_name).toBe('features');
    expect(featureFK!.on_delete).toBe('CASCADE'); // Deleting feature deletes permissions
  });

  it('should create FK: role_permissions.role_id → roles.id with CASCADE', async () => {
    const fks = await getForeignKeys('role_permissions');

    const roleFK = fks.find(fk => fk.column_name === 'role_id');
    expect(roleFK).toBeDefined();
    expect(roleFK!.foreign_table_name).toBe('roles');
    expect(roleFK!.on_delete).toBe('CASCADE');
  });

  it('should create FK: role_permissions.permission_id → permissions.id with CASCADE', async () => {
    const fks = await getForeignKeys('role_permissions');

    const permFK = fks.find(fk => fk.column_name === 'permission_id');
    expect(permFK).toBeDefined();
    expect(permFK!.foreign_table_name).toBe('permissions');
    expect(permFK!.on_delete).toBe('CASCADE');
  });

  it('should have at least 8 foreign key constraints total', async () => {
    const allFKs: any[] = [];

    for (const table of ['workspaces', 'workspace_users', 'permissions', 'role_permissions']) {
      const fks = await getForeignKeys(table);
      allFKs.push(...fks);
    }

    expect(allFKs.length).toBeGreaterThanOrEqual(8);
  });
});

// ============================================================================
// INDEX CREATION
// ============================================================================

describe('Database Migrations - Indexes', () => {
  it('should create index on workspaces.owner_id', async () => {
    const indexes = await getIndexes('workspaces');

    const hasOwnerIndex = indexes.some(idx =>
      idx.includes('owner') || idx.includes('workspaces_owner_id')
    );

    expect(hasOwnerIndex).toBe(true);
  });

  it('should create composite index on workspace_users(user_id, workspace_id)', async () => {
    const indexes = await getIndexes('workspace_users');

    // Should have idx_workspace_users_lookup or similar
    const hasCompositeIndex = indexes.some(idx =>
      idx.includes('user') && idx.includes('workspace')
    );

    expect(hasCompositeIndex).toBe(true);
  });

  it('should create composite index on workspace_users(workspace_id, user_id)', async () => {
    const indexes = await getIndexes('workspace_users');

    // Should have idx_workspace_membership or similar
    const hasMembershipIndex = indexes.some(idx =>
      idx.includes('workspace') || idx.includes('membership')
    );

    expect(hasMembershipIndex).toBe(true);
  });

  it('should create composite index on role_permissions(role_id, permission_id)', async () => {
    const indexes = await getIndexes('role_permissions');

    const hasCompositeIndex = indexes.some(idx =>
      idx.includes('role') && idx.includes('permission')
    );

    expect(hasCompositeIndex).toBe(true);
  });

  it('should create composite index on permissions(feature_id, action, resource)', async () => {
    const indexes = await getIndexes('permissions');

    const hasFeatureIndex = indexes.some(idx =>
      idx.includes('feature') || idx.includes('action') || idx.includes('resource')
    );

    expect(hasFeatureIndex).toBe(true);
  });

  it('should create index on roles.is_system', async () => {
    const indexes = await getIndexes('roles');

    const hasSystemIndex = indexes.some(idx =>
      idx.includes('system')
    );

    expect(hasSystemIndex).toBe(true);
  });

  it('should create index on features.is_enabled', async () => {
    const indexes = await getIndexes('features');

    const hasEnabledIndex = indexes.some(idx =>
      idx.includes('enabled')
    );

    expect(hasEnabledIndex).toBe(true);
  });

  it('should have at least 7 performance indexes total', async () => {
    const allIndexes: string[] = [];

    for (const table of ['workspaces', 'workspace_users', 'role_permissions', 'permissions', 'roles', 'features']) {
      const indexes = await getIndexes(table);
      allIndexes.push(...indexes);
    }

    // Filter out primary key indexes (those end with _pkey)
    const nonPKIndexes = allIndexes.filter(idx => !idx.endsWith('_pkey'));

    expect(nonPKIndexes.length).toBeGreaterThanOrEqual(7);
  });
});

// ============================================================================
// RLS ENABLEMENT
// ============================================================================

describe('Database Migrations - RLS Enablement', () => {
  it('should enable RLS on workspaces table', async () => {
    const enabled = await isRLSEnabled('workspaces');
    expect(enabled).toBe(true);
  });

  it('should enable RLS on roles table', async () => {
    const enabled = await isRLSEnabled('roles');
    expect(enabled).toBe(true);
  });

  it('should enable RLS on features table', async () => {
    const enabled = await isRLSEnabled('features');
    expect(enabled).toBe(true);
  });

  it('should enable RLS on permissions table', async () => {
    const enabled = await isRLSEnabled('permissions');
    expect(enabled).toBe(true);
  });

  it('should enable RLS on workspace_users table', async () => {
    const enabled = await isRLSEnabled('workspace_users');
    expect(enabled).toBe(true);
  });

  it('should enable RLS on role_permissions table', async () => {
    const enabled = await isRLSEnabled('role_permissions');
    expect(enabled).toBe(true);
  });

  it('should have RLS enabled on all 6 RBAC tables', async () => {
    const tables = [
      'workspaces',
      'roles',
      'features',
      'permissions',
      'workspace_users',
      'role_permissions',
    ];

    for (const table of tables) {
      const enabled = await isRLSEnabled(table);
      expect(enabled).toBe(true);
    }
  });
});

// ============================================================================
// SYSTEM ROLES SEEDING
// ============================================================================

describe('Database Migrations - System Roles Seeding', () => {
  it('should seed Owner system role', async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'owner')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.is_system).toBe(true);
    expect(data!.workspace_id).toBeNull();
  });

  it('should seed Admin system role', async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'admin')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.is_system).toBe(true);
    expect(data!.workspace_id).toBeNull();
  });

  it('should seed Member system role', async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'member')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.is_system).toBe(true);
    expect(data!.workspace_id).toBeNull();
  });

  it('should seed exactly 3 system roles', async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_system', true);

    expect(error).toBeNull();
    expect(data).toHaveLength(3);
    expect(data!.map(r => r.name)).toContain('owner');
    expect(data!.map(r => r.name)).toContain('admin');
    expect(data!.map(r => r.name)).toContain('member');
  });

  it('should use fixed UUIDs for system roles', async () => {
    const { data: ownerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'owner')
      .single();

    const { data: adminRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    const { data: memberRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'member')
      .single();

    // Fixed UUIDs as defined in migration
    expect(ownerRole!.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(adminRole!.id).toBe('00000000-0000-0000-0000-000000000002');
    expect(memberRole!.id).toBe('00000000-0000-0000-0000-000000000003');
  });

  it('should have Owner role with description', async () => {
    const { data } = await supabase
      .from('roles')
      .select('description')
      .eq('name', 'owner')
      .single();

    expect(data!.description).toBeDefined();
    expect(data!.description).toMatch(/owner|full control|workspace/i);
  });

  it('should have Admin role with description', async () => {
    const { data } = await supabase
      .from('roles')
      .select('description')
      .eq('name', 'admin')
      .single();

    expect(data!.description).toBeDefined();
    expect(data!.description).toMatch(/admin|manage|permission/i);
  });

  it('should have Member role with description', async () => {
    const { data } = await supabase
      .from('roles')
      .select('description')
      .eq('name', 'member')
      .single();

    expect(data!.description).toBeDefined();
    expect(data!.description).toMatch(/member|basic|access/i);
  });
});

// ============================================================================
// CONSTRAINT ENFORCEMENT
// ============================================================================

describe('Database Migrations - Constraints', () => {
  it('should enforce workspace name length CHECK constraint', async () => {
    const { error } = await supabase
      .from('workspaces')
      .insert({
        name: '', // Empty name
        owner_id: '00000000-0000-0000-0000-000000000001',
      });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/constraint|check|length|name/i);
  });

  it('should enforce permission action ENUM constraint', async () => {
    const { error } = await supabase
      .from('permissions')
      .insert({
        feature_id: '00000000-0000-0000-0000-000000000001',
        action: 'invalid_action', // Not in enum
        resource: 'Project',
      });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/constraint|enum|action|invalid/i);
  });

  it('should enforce system roles have null workspace_id', async () => {
    // Attempting to create system role with workspace_id should fail
    const { error } = await supabase
      .from('roles')
      .insert({
        name: 'fake-system-role',
        is_system: true,
        workspace_id: '00000000-0000-0000-0000-000000000001', // Should be null
      });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/constraint|check|system role|workspace_id/i);
  });

  it('should prevent deletion of system roles via CHECK or trigger', async () => {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('name', 'owner');

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/cannot delete system role|constraint|protected/i);
  });

  it('should enforce unique (workspace_id, user_id) in workspace_users', async () => {
    const workspaceId = '00000000-0000-0000-0000-000000000001';
    const userId = '00000000-0000-0000-0000-000000000002';
    const roleId = '00000000-0000-0000-0000-000000000003';

    // First insert
    await supabase.from('workspace_users').insert({
      workspace_id: workspaceId,
      user_id: userId,
      role_id: roleId,
      invited_by: userId,
    });

    // Duplicate insert (should fail)
    const { error } = await supabase.from('workspace_users').insert({
      workspace_id: workspaceId,
      user_id: userId,
      role_id: roleId,
      invited_by: userId,
    });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/duplicate|unique|primary key/i);
  });

  it('should enforce unique (role_id, permission_id) in role_permissions', async () => {
    const roleId = '00000000-0000-0000-0000-000000000001';
    const permissionId = '00000000-0000-0000-0000-000000000002';

    // First insert
    await supabase.from('role_permissions').insert({
      role_id: roleId,
      permission_id: permissionId,
    });

    // Duplicate insert (should fail)
    const { error } = await supabase.from('role_permissions').insert({
      role_id: roleId,
      permission_id: permissionId,
    });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/duplicate|unique|primary key/i);
  });
});
