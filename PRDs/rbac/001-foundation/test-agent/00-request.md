# Test Agent Request: RBAC Foundation - Phase 1

**Feature:** RBAC Foundation
**Phase:** 1 - Backend Only
**Request ID:** rbac-001-test-agent-request
**Date:** 2025-01-27
**Status:** Ready for Implementation

---

## Context

You are the **Test Agent**, responsible for creating the comprehensive failing test suite for the RBAC Foundation system. This is **Phase 1: Backend Only**, which means you will create tests for:
- Entity validation (Zod schemas)
- RLS policies (database-level security)
- Database migrations (schema integrity)
- Minimal use cases (createWorkspace, assignRole)
- Data services (pure CRUD operations)

**CRITICAL:** Phase 1 has **NO UI**, so you will NOT create:
- ❌ E2E tests (Playwright) - no pages exist
- ❌ Component tests (React Testing Library) - no components exist
- ❌ API endpoint tests - no API routes in Phase 1

Your tests become the **immutable specification** that Implementer and Supabase agents must make pass.

---

## Objectives

### Primary Objectives
1. **Entity Validation Tests**: Test all Zod schemas in `entities.ts` for correct validation and error handling
2. **RLS Policy Tests**: Verify workspace isolation and multi-tenant security at database level
3. **Migration Tests**: Ensure all tables, indexes, foreign keys, and RLS policies are created correctly
4. **Use Case Tests**: Define interfaces for minimal use cases (`createWorkspace`, `assignRole`)
5. **Service Tests**: Define interfaces for data services (workspace.service, role.service)

### Success Criteria
- ✅ All tests FAIL initially with "function not defined" or "table does not exist"
- ✅ Entity tests achieve 100% coverage on Zod schemas
- ✅ RLS tests verify cross-workspace isolation with multiple test users
- ✅ Migration tests validate all 6 tables + indexes + RLS policies
- ✅ Use case tests define clear function signatures
- ✅ Service tests define clear data access interfaces
- ✅ No test modifies `entities.ts` (Architect's responsibility)

---

## Detailed Requirements

### 1. Entity Validation Tests

**File:** `app/src/features/rbac/entities.test.ts`

**Test All Schemas:**

#### 1.1 WorkspaceSchema Tests
```typescript
describe('WorkspaceSchema', () => {
  it('should validate correct workspace data');
  it('should reject empty name');
  it('should reject name longer than 100 characters');
  it('should reject invalid owner_id (not UUID)');
  it('should require created_at and updated_at');
  it('should parse ISO 8601 datetime strings');
});

describe('WorkspaceCreateSchema', () => {
  it('should omit id, created_at, updated_at');
  it('should require name and owner_id');
  it('should validate name constraints');
});

describe('WorkspaceUpdateSchema', () => {
  it('should allow partial updates');
  it('should only allow name updates (not owner_id)');
  it('should validate updated name constraints');
});
```

#### 1.2 RoleSchema Tests
```typescript
describe('RoleSchema', () => {
  it('should validate system role (owner)');
  it('should validate system role with null workspace_id');
  it('should validate custom role with workspace_id');
  it('should reject name longer than 50 characters');
  it('should allow optional description up to 500 chars');
  it('should default is_system to false');
});

describe('SYSTEM_ROLES constant', () => {
  it('should define OWNER, ADMIN, MEMBER');
  it('should have lowercase string values');
});

describe('isSystemRole helper', () => {
  it('should return true for system roles');
  it('should return false for custom roles');
});

describe('canDeleteRole helper', () => {
  it('should return false for system roles');
  it('should return true for custom roles');
});

describe('canModifyRole helper', () => {
  it('should return false for system roles');
  it('should return true for custom roles');
});
```

#### 1.3 FeatureSchema Tests
```typescript
describe('FeatureSchema', () => {
  it('should validate feature with all fields');
  it('should enforce name length (1-50 chars)');
  it('should enforce display_name length (1-100 chars)');
  it('should allow optional description up to 500 chars');
  it('should default is_enabled to true');
});

describe('FeatureUpdateSchema', () => {
  it('should allow partial updates');
  it('should not allow name updates (immutable)');
  it('should allow display_name and description updates');
});
```

#### 1.4 PermissionSchema Tests
```typescript
describe('PermissionActionSchema', () => {
  it('should accept valid actions: create, read, update, delete, manage');
  it('should reject invalid actions');
});

describe('PermissionSchema', () => {
  it('should validate permission with action enum');
  it('should validate resource name (1-50 chars)');
  it('should allow optional conditions JSONB');
  it('should allow optional description');
  it('should require feature_id');
});

describe('PermissionUpdateSchema', () => {
  it('should allow partial updates');
  it('should not allow feature_id, action, or resource updates (immutable)');
  it('should allow description and conditions updates');
});
```

#### 1.5 WorkspaceUserSchema Tests
```typescript
describe('WorkspaceUserSchema', () => {
  it('should validate workspace user with all fields');
  it('should require workspace_id, user_id, role_id, invited_by');
  it('should validate UUIDs for all ID fields');
  it('should require joined_at timestamp');
});

describe('WorkspaceUserUpdateSchema', () => {
  it('should only allow role_id updates');
  it('should not allow workspace_id or user_id changes');
});
```

#### 1.6 RolePermissionSchema Tests
```typescript
describe('RolePermissionSchema', () => {
  it('should validate role permission mapping');
  it('should require role_id and permission_id');
  it('should require granted_at timestamp');
});
```

#### 1.7 UserSchema Tests
```typescript
describe('UserSchema', () => {
  it('should validate user with email');
  it('should validate email format');
  it('should default is_super_admin to false');
  it('should require created_at');
});
```

#### 1.8 CASL Type Tests (Type-Only)
```typescript
describe('CASL Types', () => {
  it('should define Actions type');
  it('should define Subjects type');
  it('should define AppAbility type');
  it('should define DefineAbilityInput interface');
  it('should define DefineAbilityFunction type');

  // Note: These are TypeScript compile-time tests, not runtime tests
  // Use type assertions to validate structure
});
```

**Expected Outcome:** All entity tests pass (entities.ts already implemented by Architect)

---

### 2. RLS Policy Tests

**File:** `app/src/features/rbac/services/rls-policies.test.ts`

**CRITICAL:** These tests verify workspace isolation at database level using Supabase MCP.

#### 2.1 Workspace Isolation Tests
```typescript
describe('Workspace RLS Policies', () => {
  beforeEach(async () => {
    // Setup: Create 2 workspaces, 2 users
    // User A in Workspace 1
    // User B in Workspace 2
  });

  it('should prevent cross-workspace SELECT access', async () => {
    // User A tries to SELECT workspace B's data
    const userAClient = createClientForUser('user-a-id');

    const { data, error } = await userAClient
      .from('workspaces')
      .select()
      .eq('id', 'workspace-b-id');

    expect(data).toEqual([]); // RLS blocks access
    expect(error).toBeNull(); // No error, just empty result
  });

  it('should allow user to see their own workspace', async () => {
    const userAClient = createClientForUser('user-a-id');

    const { data, error } = await userAClient
      .from('workspaces')
      .select()
      .eq('id', 'workspace-a-id');

    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('workspace-a-id');
  });

  it('should allow user to see all workspaces they belong to', async () => {
    // Add user A to workspace B
    await addUserToWorkspace('user-a-id', 'workspace-b-id', 'member-role-id');

    const userAClient = createClientForUser('user-a-id');
    const { data } = await userAClient.from('workspaces').select();

    expect(data).toHaveLength(2); // Both workspace A and B
  });

  it('should allow owner to UPDATE their workspace', async () => {
    const ownerClient = createClientForUser('owner-a-id');

    const { error } = await ownerClient
      .from('workspaces')
      .update({ name: 'Updated Name' })
      .eq('id', 'workspace-a-id');

    expect(error).toBeNull();
  });

  it('should prevent non-owner from UPDATING workspace', async () => {
    const memberClient = createClientForUser('member-a-id');

    const { error } = await memberClient
      .from('workspaces')
      .update({ name: 'Hacked Name' })
      .eq('id', 'workspace-a-id');

    expect(error).not.toBeNull(); // RLS blocks update
  });

  it('should allow owner to DELETE their workspace', async () => {
    const ownerClient = createClientForUser('owner-a-id');

    const { error } = await ownerClient
      .from('workspaces')
      .delete()
      .eq('id', 'workspace-a-id');

    expect(error).toBeNull();
  });

  it('should prevent non-owner from DELETING workspace', async () => {
    const memberClient = createClientForUser('member-a-id');

    const { error } = await memberClient
      .from('workspaces')
      .delete()
      .eq('id', 'workspace-a-id');

    expect(error).not.toBeNull(); // RLS blocks delete
  });
});
```

#### 2.2 Workspace Users RLS Tests
```typescript
describe('Workspace Users RLS Policies', () => {
  it('should prevent cross-workspace member list access', async () => {
    const userAClient = createClientForUser('user-a-id');

    const { data } = await userAClient
      .from('workspace_users')
      .select()
      .eq('workspace_id', 'workspace-b-id');

    expect(data).toEqual([]); // RLS blocks access
  });

  it('should allow workspace members to see member list', async () => {
    const userAClient = createClientForUser('user-a-id');

    const { data } = await userAClient
      .from('workspace_users')
      .select()
      .eq('workspace_id', 'workspace-a-id');

    expect(data.length).toBeGreaterThan(0);
  });

  it('should enforce workspace_id in INSERT', async () => {
    const userAClient = createClientForUser('user-a-id');

    // User A tries to add someone to workspace B (not a member)
    const { error } = await userAClient
      .from('workspace_users')
      .insert({
        workspace_id: 'workspace-b-id',
        user_id: 'some-user-id',
        role_id: 'member-role-id',
        invited_by: 'user-a-id',
      });

    expect(error).not.toBeNull(); // RLS blocks insert
  });
});
```

#### 2.3 Permission RLS Tests (Admin-Only Access)
```typescript
describe('Permission RLS Policies', () => {
  it('should allow Owner to manage permissions', async () => {
    const ownerClient = createClientForUser('owner-id');

    const { data, error } = await ownerClient
      .from('permissions')
      .select();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should allow Admin to manage permissions', async () => {
    const adminClient = createClientForUser('admin-id');

    const { data, error } = await adminClient
      .from('permissions')
      .select();

    expect(error).toBeNull();
  });

  it('should block Member from viewing permissions', async () => {
    const memberClient = createClientForUser('member-id');

    const { data, error } = await memberClient
      .from('permissions')
      .select();

    expect(data).toEqual([]); // RLS blocks access
  });

  it('should block Member from creating permissions', async () => {
    const memberClient = createClientForUser('member-id');

    const { error } = await memberClient
      .from('permissions')
      .insert({
        feature_id: 'feature-id',
        action: 'create',
        resource: 'Project',
      });

    expect(error).not.toBeNull(); // RLS blocks insert
  });
});
```

#### 2.4 Role Protection Tests
```typescript
describe('Role RLS Policies', () => {
  it('should allow all users to READ system roles', async () => {
    const anyUserClient = createClientForUser('any-user-id');

    const { data, error } = await anyUserClient
      .from('roles')
      .select()
      .eq('is_system', true);

    expect(error).toBeNull();
    expect(data).toHaveLength(3); // Owner, Admin, Member
  });

  it('should block non-admin from creating custom roles', async () => {
    const memberClient = createClientForUser('member-id');

    const { error } = await memberClient
      .from('roles')
      .insert({
        name: 'Custom Role',
        is_system: false,
        workspace_id: 'workspace-id',
      });

    expect(error).not.toBeNull(); // RLS blocks insert
  });

  it('should prevent deletion of system roles', async () => {
    const ownerClient = createClientForUser('owner-id');

    const { error } = await ownerClient
      .from('roles')
      .delete()
      .eq('name', 'owner');

    expect(error).not.toBeNull(); // DB constraint or RLS blocks
  });
});
```

**Expected Outcome:** All RLS tests FAIL initially (tables/policies don't exist). Supabase Agent makes them pass.

---

### 3. Migration Tests

**File:** `app/src/features/rbac/migrations/migrations.test.ts`

**Objective:** Verify all database schema elements are created correctly.

#### 3.1 Table Creation Tests
```typescript
describe('Database Migrations - Table Creation', () => {
  it('should create workspaces table with correct schema', async () => {
    const columns = await getTableColumns('workspaces');

    expect(columns).toContainEqual({
      column_name: 'id',
      data_type: 'uuid',
      is_nullable: 'NO',
    });
    expect(columns).toContainEqual({
      column_name: 'name',
      data_type: 'text',
      is_nullable: 'NO',
    });
    expect(columns).toContainEqual({
      column_name: 'owner_id',
      data_type: 'uuid',
      is_nullable: 'NO',
    });
    expect(columns).toContainEqual({
      column_name: 'created_at',
      data_type: 'timestamp with time zone',
      is_nullable: 'NO',
    });
    expect(columns).toContainEqual({
      column_name: 'updated_at',
      data_type: 'timestamp with time zone',
      is_nullable: 'NO',
    });
  });

  it('should create roles table with correct schema');
  it('should create features table with correct schema');
  it('should create permissions table with correct schema');
  it('should create workspace_users table with correct schema');
  it('should create role_permissions table with correct schema');

  it('should create all 6 tables', async () => {
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
});
```

#### 3.2 Foreign Key Tests
```typescript
describe('Database Migrations - Foreign Keys', () => {
  it('should create FK: workspaces.owner_id → auth.users.id', async () => {
    const fks = await getForeignKeys('workspaces');

    expect(fks).toContainEqual({
      source_column: 'owner_id',
      target_table: 'users',
      target_schema: 'auth',
      target_column: 'id',
    });
  });

  it('should create FK: workspace_users.workspace_id → workspaces.id with CASCADE');
  it('should create FK: workspace_users.user_id → auth.users.id');
  it('should create FK: workspace_users.role_id → roles.id');
  it('should create FK: permissions.feature_id → features.id with CASCADE');
  it('should create FK: role_permissions.role_id → roles.id with CASCADE');
  it('should create FK: role_permissions.permission_id → permissions.id with CASCADE');

  it('should have ON DELETE CASCADE for workspace_users', async () => {
    const fk = await getForeignKeyRule('workspace_users', 'workspace_id');
    expect(fk.on_delete).toBe('CASCADE');
  });
});
```

#### 3.3 Index Tests
```typescript
describe('Database Migrations - Indexes', () => {
  it('should create index on workspaces.owner_id', async () => {
    const indexes = await getIndexes('workspaces');
    expect(indexes).toContain('idx_workspaces_owner');
  });

  it('should create composite index on workspace_users(user_id, workspace_id)', async () => {
    const indexes = await getIndexes('workspace_users');
    expect(indexes).toContain('idx_workspace_users_lookup');
  });

  it('should create index on role_permissions(role_id, permission_id)');
  it('should create index on permissions(feature_id, action, resource)');

  it('should have at least 7 indexes total', async () => {
    const allIndexes = await getAllIndexes();
    expect(allIndexes.length).toBeGreaterThanOrEqual(7);
  });
});
```

#### 3.4 RLS Enablement Tests
```typescript
describe('Database Migrations - RLS Enablement', () => {
  it('should enable RLS on workspaces table', async () => {
    const rlsEnabled = await isRLSEnabled('workspaces');
    expect(rlsEnabled).toBe(true);
  });

  it('should enable RLS on roles table');
  it('should enable RLS on features table');
  it('should enable RLS on permissions table');
  it('should enable RLS on workspace_users table');
  it('should enable RLS on role_permissions table');

  it('should have RLS enabled on all 6 tables', async () => {
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
```

#### 3.5 System Role Seeding Tests
```typescript
describe('Database Migrations - System Roles Seeding', () => {
  it('should seed Owner system role', async () => {
    const { data } = await supabase
      .from('roles')
      .select()
      .eq('name', 'owner')
      .single();

    expect(data).toBeDefined();
    expect(data.is_system).toBe(true);
    expect(data.workspace_id).toBeNull();
  });

  it('should seed Admin system role', async () => {
    const { data } = await supabase
      .from('roles')
      .select()
      .eq('name', 'admin')
      .single();

    expect(data).toBeDefined();
    expect(data.is_system).toBe(true);
  });

  it('should seed Member system role', async () => {
    const { data } = await supabase
      .from('roles')
      .select()
      .eq('name', 'member')
      .single();

    expect(data).toBeDefined();
    expect(data.is_system).toBe(true);
  });

  it('should seed exactly 3 system roles', async () => {
    const { data } = await supabase
      .from('roles')
      .select()
      .eq('is_system', true);

    expect(data).toHaveLength(3);
  });

  it('should use fixed UUIDs for system roles', async () => {
    const { data } = await supabase
      .from('roles')
      .select()
      .eq('name', 'owner')
      .single();

    expect(data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});
```

#### 3.6 Constraint Tests
```typescript
describe('Database Migrations - Constraints', () => {
  it('should enforce workspace name length CHECK constraint', async () => {
    const { error } = await supabase
      .from('workspaces')
      .insert({
        name: '', // Empty name
        owner_id: 'user-id',
      });

    expect(error).not.toBeNull();
    expect(error.message).toContain('constraint');
  });

  it('should enforce permission action ENUM constraint', async () => {
    const { error } = await supabase
      .from('permissions')
      .insert({
        feature_id: 'feature-id',
        action: 'invalid-action', // Not in enum
        resource: 'Project',
      });

    expect(error).not.toBeNull();
  });

  it('should enforce system roles have null workspace_id');
  it('should prevent deletion of system roles (CHECK constraint)');
});
```

**Expected Outcome:** All migration tests FAIL initially. Supabase Agent makes them pass.

---

### 4. Use Case Tests (MINIMAL)

**Phase 1 has ONLY 2 use cases:** `createWorkspace` and `assignRole`

#### 4.1 createWorkspace Use Case Tests

**File:** `app/src/features/rbac/use-cases/createWorkspace.test.ts`

```typescript
describe('createWorkspace', () => {
  it('should create workspace with owner', async () => {
    const workspace = await createWorkspace({
      name: 'My Workspace',
      owner_id: 'user-123',
    });

    expect(workspace.id).toBeDefined();
    expect(workspace.name).toBe('My Workspace');
    expect(workspace.owner_id).toBe('user-123');
  });

  it('should auto-assign Owner role to creator', async () => {
    const workspace = await createWorkspace({
      name: 'My Workspace',
      owner_id: 'user-123',
    });

    // Check workspace_users table
    const membership = await getWorkspaceMembership('user-123', workspace.id);

    expect(membership).toBeDefined();
    expect(membership.role.name).toBe('owner');
    expect(membership.user_id).toBe('user-123');
    expect(membership.workspace_id).toBe(workspace.id);
  });

  it('should validate workspace name with Zod', async () => {
    await expect(
      createWorkspace({
        name: '', // Invalid: empty
        owner_id: 'user-123',
      })
    ).rejects.toThrow(ZodError);
  });

  it('should validate owner_id is UUID', async () => {
    await expect(
      createWorkspace({
        name: 'Valid Name',
        owner_id: 'not-a-uuid', // Invalid
      })
    ).rejects.toThrow(ZodError);
  });

  it('should reject name longer than 100 characters', async () => {
    const longName = 'a'.repeat(101);

    await expect(
      createWorkspace({
        name: longName,
        owner_id: 'user-123',
      })
    ).rejects.toThrow();
  });

  it('should call workspaceService.createWorkspace', async () => {
    const spy = vi.spyOn(workspaceService, 'createWorkspace');

    await createWorkspace({
      name: 'My Workspace',
      owner_id: 'user-123',
    });

    expect(spy).toHaveBeenCalledWith({
      name: 'My Workspace',
      owner_id: 'user-123',
    });
  });

  it('should call roleService.assignRole for Owner role', async () => {
    const spy = vi.spyOn(roleService, 'assignRole');

    const workspace = await createWorkspace({
      name: 'My Workspace',
      owner_id: 'user-123',
    });

    expect(spy).toHaveBeenCalledWith({
      workspace_id: workspace.id,
      user_id: 'user-123',
      role_id: expect.stringMatching(/owner-role-id/), // System role ID
      invited_by: 'user-123', // Self-invited
    });
  });
});
```

**Expected Function Signature (to be implemented by Implementer):**
```typescript
export async function createWorkspace(
  input: WorkspaceCreate
): Promise<Workspace>;
```

#### 4.2 assignRole Use Case Tests

**File:** `app/src/features/rbac/use-cases/assignRole.test.ts`

```typescript
describe('assignRole', () => {
  it('should assign role to user in workspace', async () => {
    const assignment = await assignRole({
      workspace_id: 'workspace-123',
      user_id: 'user-456',
      role_id: 'admin-role-id',
      invited_by: 'owner-123',
    });

    expect(assignment.workspace_id).toBe('workspace-123');
    expect(assignment.user_id).toBe('user-456');
    expect(assignment.role_id).toBe('admin-role-id');
    expect(assignment.invited_by).toBe('owner-123');
  });

  it('should validate all fields are UUIDs', async () => {
    await expect(
      assignRole({
        workspace_id: 'not-uuid',
        user_id: 'user-456',
        role_id: 'admin-role-id',
        invited_by: 'owner-123',
      })
    ).rejects.toThrow(ZodError);
  });

  it('should fail if workspace does not exist', async () => {
    await expect(
      assignRole({
        workspace_id: 'non-existent-workspace',
        user_id: 'user-456',
        role_id: 'admin-role-id',
        invited_by: 'owner-123',
      })
    ).rejects.toThrow();
  });

  it('should fail if role does not exist', async () => {
    await expect(
      assignRole({
        workspace_id: 'workspace-123',
        user_id: 'user-456',
        role_id: 'non-existent-role',
        invited_by: 'owner-123',
      })
    ).rejects.toThrow();
  });

  it('should allow assigning same user to multiple workspaces', async () => {
    await assignRole({
      workspace_id: 'workspace-1',
      user_id: 'user-123',
      role_id: 'member-role-id',
      invited_by: 'owner-1',
    });

    await assignRole({
      workspace_id: 'workspace-2',
      user_id: 'user-123',
      role_id: 'admin-role-id',
      invited_by: 'owner-2',
    });

    // Should succeed (user can be in multiple workspaces)
  });

  it('should call roleService.assignRole', async () => {
    const spy = vi.spyOn(roleService, 'assignRole');

    await assignRole({
      workspace_id: 'workspace-123',
      user_id: 'user-456',
      role_id: 'admin-role-id',
      invited_by: 'owner-123',
    });

    expect(spy).toHaveBeenCalledWith({
      workspace_id: 'workspace-123',
      user_id: 'user-456',
      role_id: 'admin-role-id',
      invited_by: 'owner-123',
    });
  });
});
```

**Expected Function Signature (to be implemented by Implementer):**
```typescript
export async function assignRole(
  input: WorkspaceUserCreate
): Promise<WorkspaceUser>;
```

**Expected Outcome:** All use case tests FAIL initially with "function not defined". Implementer makes them pass.

---

### 5. Service Tests (DATA LAYER)

**Phase 1 has MINIMAL services:** workspace.service and role.service

#### 5.1 Workspace Service Tests

**File:** `app/src/features/rbac/services/workspace.service.test.ts`

```typescript
describe('WorkspaceService', () => {
  describe('createWorkspace', () => {
    it('should insert workspace into database', async () => {
      const workspace = await workspaceService.createWorkspace({
        name: 'Test Workspace',
        owner_id: 'user-123',
      });

      expect(workspace.id).toBeDefined();
      expect(workspace.name).toBe('Test Workspace');
      expect(workspace.owner_id).toBe('user-123');
      expect(workspace.created_at).toBeDefined();
      expect(workspace.updated_at).toBeDefined();
    });

    it('should use Supabase client for insert', async () => {
      const spy = vi.spyOn(supabase, 'from');

      await workspaceService.createWorkspace({
        name: 'Test Workspace',
        owner_id: 'user-123',
      });

      expect(spy).toHaveBeenCalledWith('workspaces');
    });

    it('should enforce RLS policies on insert', async () => {
      // User A tries to create workspace with User B as owner
      const userAClient = createClientForUser('user-a-id');

      const { error } = await userAClient
        .from('workspaces')
        .insert({
          name: 'Hacked Workspace',
          owner_id: 'user-b-id', // Different user
        });

      expect(error).not.toBeNull(); // RLS WITH CHECK fails
    });
  });

  describe('getWorkspaceById', () => {
    it('should fetch workspace by ID', async () => {
      const created = await workspaceService.createWorkspace({
        name: 'Test Workspace',
        owner_id: 'user-123',
      });

      const fetched = await workspaceService.getWorkspaceById(
        created.id,
        'user-123'
      );

      expect(fetched.id).toBe(created.id);
      expect(fetched.name).toBe('Test Workspace');
    });

    it('should enforce RLS on SELECT', async () => {
      // User A creates workspace
      const workspace = await workspaceService.createWorkspace({
        name: 'User A Workspace',
        owner_id: 'user-a-id',
      });

      // User B tries to fetch (not a member)
      await expect(
        workspaceService.getWorkspaceById(workspace.id, 'user-b-id')
      ).rejects.toThrow(); // RLS blocks
    });

    it('should return null if workspace not found', async () => {
      const result = await workspaceService.getWorkspaceById(
        'non-existent-id',
        'user-123'
      );

      expect(result).toBeNull();
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace name', async () => {
      const workspace = await workspaceService.createWorkspace({
        name: 'Original Name',
        owner_id: 'user-123',
      });

      const updated = await workspaceService.updateWorkspace(
        workspace.id,
        { name: 'Updated Name' },
        'user-123'
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated.updated_at).not.toBe(workspace.updated_at);
    });

    it('should enforce RLS on UPDATE', async () => {
      // Only owner can update
      const workspace = await workspaceService.createWorkspace({
        name: 'Test Workspace',
        owner_id: 'owner-id',
      });

      // Member tries to update
      await expect(
        workspaceService.updateWorkspace(
          workspace.id,
          { name: 'Hacked Name' },
          'member-id'
        )
      ).rejects.toThrow(); // RLS blocks
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete workspace and CASCADE related data', async () => {
      const workspace = await workspaceService.createWorkspace({
        name: 'To Delete',
        owner_id: 'user-123',
      });

      await workspaceService.deleteWorkspace(workspace.id, 'user-123');

      const fetched = await workspaceService.getWorkspaceById(
        workspace.id,
        'user-123'
      );

      expect(fetched).toBeNull();
    });

    it('should enforce RLS on DELETE (owner only)', async () => {
      const workspace = await workspaceService.createWorkspace({
        name: 'Protected Workspace',
        owner_id: 'owner-id',
      });

      // Non-owner tries to delete
      await expect(
        workspaceService.deleteWorkspace(workspace.id, 'member-id')
      ).rejects.toThrow(); // RLS blocks
    });
  });
});
```

**Expected Service Interface (to be implemented by Supabase Agent):**
```typescript
export const workspaceService = {
  createWorkspace(input: WorkspaceCreate): Promise<Workspace>;
  getWorkspaceById(id: string, userId: string): Promise<Workspace | null>;
  updateWorkspace(id: string, input: WorkspaceUpdate, userId: string): Promise<Workspace>;
  deleteWorkspace(id: string, userId: string): Promise<void>;
};
```

#### 5.2 Role Service Tests

**File:** `app/src/features/rbac/services/role.service.test.ts`

```typescript
describe('RoleService', () => {
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
        expect(role.workspace_id).toBeNull();
      });
    });
  });

  describe('getRoleByName', () => {
    it('should fetch owner role by name', async () => {
      const role = await roleService.getRoleByName('owner');

      expect(role.name).toBe('owner');
      expect(role.is_system).toBe(true);
    });

    it('should return null if role not found', async () => {
      const role = await roleService.getRoleByName('non-existent-role');

      expect(role).toBeNull();
    });
  });

  describe('assignRole', () => {
    it('should assign role to user in workspace', async () => {
      const assignment = await roleService.assignRole({
        workspace_id: 'workspace-123',
        user_id: 'user-456',
        role_id: 'admin-role-id',
        invited_by: 'owner-123',
      });

      expect(assignment.workspace_id).toBe('workspace-123');
      expect(assignment.user_id).toBe('user-456');
      expect(assignment.role_id).toBe('admin-role-id');
      expect(assignment.joined_at).toBeDefined();
    });

    it('should enforce RLS on INSERT (workspace membership required)', async () => {
      // User A tries to add someone to Workspace B (not a member)
      const userAClient = createClientForUser('user-a-id');

      const { error } = await userAClient
        .from('workspace_users')
        .insert({
          workspace_id: 'workspace-b-id',
          user_id: 'user-c-id',
          role_id: 'member-role-id',
          invited_by: 'user-a-id',
        });

      expect(error).not.toBeNull(); // RLS blocks
    });
  });

  describe('updateUserRole', () => {
    it('should update user role in workspace', async () => {
      // Assign member role
      await roleService.assignRole({
        workspace_id: 'workspace-123',
        user_id: 'user-456',
        role_id: 'member-role-id',
        invited_by: 'owner-123',
      });

      // Update to admin role
      const updated = await roleService.updateUserRole(
        'workspace-123',
        'user-456',
        { role_id: 'admin-role-id' }
      );

      expect(updated.role_id).toBe('admin-role-id');
    });

    it('should not allow changing workspace_id', async () => {
      // WorkspaceUserUpdateSchema only allows role_id
      await expect(
        roleService.updateUserRole(
          'workspace-123',
          'user-456',
          { workspace_id: 'different-workspace' } as any
        )
      ).rejects.toThrow();
    });
  });

  describe('removeUserFromWorkspace', () => {
    it('should remove user from workspace', async () => {
      await roleService.assignRole({
        workspace_id: 'workspace-123',
        user_id: 'user-456',
        role_id: 'member-role-id',
        invited_by: 'owner-123',
      });

      await roleService.removeUserFromWorkspace('workspace-123', 'user-456');

      const membership = await roleService.getWorkspaceMembership(
        'user-456',
        'workspace-123'
      );

      expect(membership).toBeNull();
    });

    it('should prevent removing owner from their workspace', async () => {
      // RLS policy should block this
      await expect(
        roleService.removeUserFromWorkspace('workspace-123', 'owner-123')
      ).rejects.toThrow(); // RLS blocks
    });
  });

  describe('getWorkspaceMembership', () => {
    it('should fetch user membership in workspace', async () => {
      await roleService.assignRole({
        workspace_id: 'workspace-123',
        user_id: 'user-456',
        role_id: 'admin-role-id',
        invited_by: 'owner-123',
      });

      const membership = await roleService.getWorkspaceMembership(
        'user-456',
        'workspace-123'
      );

      expect(membership).toBeDefined();
      expect(membership.role.name).toBe('admin');
    });

    it('should return null if user not in workspace', async () => {
      const membership = await roleService.getWorkspaceMembership(
        'non-member-id',
        'workspace-123'
      );

      expect(membership).toBeNull();
    });
  });
});
```

**Expected Service Interface (to be implemented by Supabase Agent):**
```typescript
export const roleService = {
  getSystemRoles(): Promise<Role[]>;
  getRoleByName(name: string): Promise<Role | null>;
  assignRole(input: WorkspaceUserCreate): Promise<WorkspaceUser>;
  updateUserRole(workspaceId: string, userId: string, input: WorkspaceUserUpdate): Promise<WorkspaceUser>;
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
  getWorkspaceMembership(userId: string, workspaceId: string): Promise<WorkspaceUser | null>;
};
```

**Expected Outcome:** All service tests FAIL initially with "function not defined". Supabase Agent makes them pass.

---

## Expected Deliverables

### Test Files to Create

**Entity Tests:**
- ✅ `app/src/features/rbac/entities.test.ts` (comprehensive Zod validation)

**RLS Policy Tests:**
- ✅ `app/src/features/rbac/services/rls-policies.test.ts` (workspace isolation)

**Migration Tests:**
- ✅ `app/src/features/rbac/migrations/migrations.test.ts` (schema integrity)

**Use Case Tests:**
- ✅ `app/src/features/rbac/use-cases/createWorkspace.test.ts`
- ✅ `app/src/features/rbac/use-cases/assignRole.test.ts`

**Service Tests:**
- ✅ `app/src/features/rbac/services/workspace.service.test.ts`
- ✅ `app/src/features/rbac/services/role.service.test.ts`

### Test Utilities (if needed)

**Supabase Test Helpers:**
```typescript
// test/helpers/supabase-helpers.ts
export function createClientForUser(userId: string): SupabaseClient;
export async function getTableColumns(tableName: string): Promise<Column[]>;
export async function getForeignKeys(tableName: string): Promise<FK[]>;
export async function getIndexes(tableName: string): Promise<string[]>;
export async function isRLSEnabled(tableName: string): Promise<boolean>;
export async function getPublicTables(): Promise<string[]>;
```

### Coverage Report

**Expected Coverage:**
- Entity validation: 100%
- RLS policies: 100% (all isolation scenarios)
- Migrations: 100% (all schema elements)
- Use cases: >90%
- Services: >85%

**Generate Report:**
```bash
cd app && npm run test:coverage
```

---

## Limitations

### What Test Agent CANNOT Do

**❌ Modify entities.ts**
- Entities are Architect's responsibility
- If schemas are incorrect, notify Architect

**❌ Implement functional code**
- Tests define interfaces, not implementation
- Use mocks for services in use case tests

**❌ Modify tests after approval**
- Tests become immutable specification
- If changes needed, request new iteration with Architect approval

**❌ Create E2E tests**
- No UI in Phase 1
- Playwright tests in Phase 4

**❌ Create API endpoint tests**
- No API routes in Phase 1
- API tests in Phase 2

**❌ Read other agents' folders**
- Only read `test-agent/` folder and `entities.ts`
- Architect coordinates info between agents

---

## Success Criteria

### Test Agent Iteration 01 is APPROVED if:

- [ ] All entity schemas have comprehensive validation tests
- [ ] RLS policies tested with multiple users/workspaces
- [ ] Cross-workspace isolation verified (User A cannot access Workspace B data)
- [ ] Migration scripts tested for schema correctness (tables, indexes, FKs, RLS)
- [ ] System roles seeding verified (3 roles with fixed UUIDs)
- [ ] Use case tests define clear function signatures
- [ ] Service tests define clear data access interfaces
- [ ] All tests FAIL appropriately (functions not defined, tables don't exist)
- [ ] Test fixtures/helpers created for reusability
- [ ] Coverage targets met (100% entities, >90% use cases, >85% services)
- [ ] No `any` types in test code (type-safe)
- [ ] Test documentation clear (comments explain complex scenarios)

---

## Handoff to Next Agent

**After Test Agent completes iteration 01:**

1. **Create** `test-agent/01-iteration.md` documenting:
   - All test files created
   - Test coverage achieved
   - Function signatures defined
   - Decisions made
   - Blockers encountered (if any)
   - Evidence (test output screenshots)

2. **Notify** Architect: "Test Agent iteration 01 complete, ready for review"

3. **Architect reviews** with Usuario, then:
   - **If APPROVED**: Architect prepares `implementer/00-request.md`
   - **If REJECTED**: Architect provides specific feedback, Test Agent creates `02-iteration.md`

**Do NOT advance without Architect approval.**

---

## References

- **Master PRD:** `PRDs/rbac/001-foundation/architect/00-master-prd.md`
- **entities.ts:** `app/src/features/rbac/entities.ts`
- **Analysis Document:** `PRDs/_analysis/rbac-implementation-analysis.md`
  - Section 12: Testing Strategy
  - Appendix A: Example Migrations (SQL reference)
- **Test Agent Skill:** `.claude/skills/test-agent-skill/SKILL.md`

---

**END OF TEST AGENT REQUEST**

**Prepared by:** Architect Agent
**Date:** 2025-01-27
**Status:** Ready for Implementation
**Next Agent:** Test Agent (awaiting approval to start)
