# Supabase Agent Request: RBAC Foundation - Phase 1

**Feature:** RBAC Foundation
**Phase:** 1 - Backend Only
**Request ID:** rbac-001-supabase-agent-request
**Date:** 2025-01-27
**Status:** Ready for Implementation

---

## Context

You are the **Supabase Agent**, responsible for implementing the complete database foundation for the RBAC system. This is **Phase 1: Backend Only - DATABASE FOUNDATION**.

Your work is **CRITICAL** as it establishes:
- 6 core RBAC tables with proper schema
- Row Level Security (RLS) policies for workspace isolation
- Foreign keys with CASCADE rules
- Performance indexes
- System roles seeding
- Pure data services (CRUD operations)

**CRITICAL DATABASE CONTEXT:**

**Existing Supabase Project:**
- Project ID: `hegoubbxcbkpooqbvcph`
- Region: `eu-central-1`
- Database: PostgreSQL 17.4.1.074

**Existing Tables (PROTECTED):**
- `waitlist` - DO NOT MODIFY (email waitlist functionality)
  - Has RLS enabled
  - Policy: Allow all inserts

- `user_profiles` - MAY NEED MODIFICATION
  - Columns: id, email, name, avatar_url, created_at, updated_at
  - Foreign key: id → auth.users(id)
  - Decision: Analyze if workspace context needed (see Section 10)

**Existing RLS Patterns:**
- Uses `auth.uid()` for user identification
- Simple `id = auth.uid()` checks
- Insert policies use `WITH CHECK`
- Update/Delete use `USING`

You must follow these patterns and extend them for multi-tenant workspace isolation.

---

## Objectives

### Primary Objectives
1. **Create 6 RBAC tables**: workspaces, roles, features, permissions, workspace_users, role_permissions
2. **Implement RLS policies**: Complete workspace isolation at database level
3. **Create indexes**: Performance optimization for queries
4. **Seed system roles**: Owner, Admin, Member with fixed UUIDs
5. **Analyze user_profiles**: Determine if modification needed
6. **Implement data services**: Pure CRUD operations for use cases
7. **Pass all tests**: Make Test Agent's tests green

### Success Criteria
- ✅ All 6 tables created with correct schema
- ✅ All foreign keys defined with proper CASCADE rules
- ✅ All 7+ indexes created
- ✅ RLS enabled on all 6 tables
- ✅ RLS policies enforce workspace isolation (cross-workspace access blocked)
- ✅ 3 system roles seeded with fixed UUIDs
- ✅ Data services implemented (pure CRUD, no business logic)
- ✅ All Test Agent tests pass (migration tests, RLS tests, service tests)
- ✅ TypeScript compiles without errors
- ✅ `waitlist` table untouched
- ✅ `user_profiles` modification (if needed) documented and implemented

---

## Detailed Requirements

### 1. Database Migrations (9 Files)

**Migration Directory:** `supabase/migrations/`

**Naming Convention:** `YYYYMMDD_NNN_description.sql`

#### Migration 001: Create Workspaces Table

**File:** `supabase/migrations/20250127_001_create_workspaces.sql`

**Reference:** Analysis Document Appendix A.1

```sql
-- Migration 001: Create Workspaces Table
-- Purpose: Core table for workspace/organization multi-tenancy

CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for owner lookups
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see workspaces they're members of
CREATE POLICY select_workspaces ON workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only owners can update their workspaces
CREATE POLICY update_workspaces ON workspaces
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policy: Only owners can delete their workspaces
CREATE POLICY delete_workspaces ON workspaces
  FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policy: Anyone authenticated can create a workspace (becomes owner)
CREATE POLICY insert_workspaces ON workspaces
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces for RBAC system';
COMMENT ON COLUMN workspaces.owner_id IS 'User who owns this workspace (cannot be removed)';
```

#### Migration 002: Create Roles Table

**File:** `supabase/migrations/20250127_002_create_roles.sql`

```sql
-- Migration 002: Create Roles Table
-- Purpose: Define roles (system and custom) that can be assigned to users

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  description text CHECK (char_length(description) <= 500),
  is_system boolean NOT NULL DEFAULT false,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(name, workspace_id), -- Unique role names per workspace
  CHECK (
    (is_system = true AND workspace_id IS NULL) OR
    (is_system = false AND workspace_id IS NOT NULL)
  ) -- System roles have null workspace_id
);

-- Indexes
CREATE INDEX idx_roles_workspace ON roles(workspace_id);
CREATE INDEX idx_roles_system ON roles(is_system) WHERE is_system = true;

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read system roles
CREATE POLICY select_system_roles ON roles
  FOR SELECT
  USING (is_system = true);

-- RLS Policy: Workspace members can read custom roles for their workspace
CREATE POLICY select_custom_roles ON roles
  FOR SELECT
  USING (
    is_system = false AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only owners/admins can create custom roles
CREATE POLICY insert_roles ON roles
  FOR INSERT
  WITH CHECK (
    is_system = false AND
    workspace_id IN (
      SELECT wu.workspace_id
      FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- RLS Policy: Only owners/admins can update custom roles
CREATE POLICY update_roles ON roles
  FOR UPDATE
  USING (
    is_system = false AND
    workspace_id IN (
      SELECT wu.workspace_id
      FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- RLS Policy: Prevent deletion of system roles
CREATE POLICY delete_roles ON roles
  FOR DELETE
  USING (
    is_system = false AND
    workspace_id IN (
      SELECT wu.workspace_id
      FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name = 'owner' -- Only owner can delete roles
    )
  );

-- Comment
COMMENT ON TABLE roles IS 'Roles that can be assigned to users (system and custom)';
COMMENT ON COLUMN roles.is_system IS 'True for Owner/Admin/Member (immutable), false for custom roles';
COMMENT ON COLUMN roles.workspace_id IS 'NULL for system roles, workspace UUID for custom roles';
```

#### Migration 003: Create Features Table

**File:** `supabase/migrations/20250127_003_create_features.sql`

```sql
-- Migration 003: Create Features Table
-- Purpose: Define modular features that can have permissions (projects, tasks, etc.)

CREATE TABLE features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  display_name text NOT NULL CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100),
  description text CHECK (char_length(description) <= 500),
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for enabled features
CREATE INDEX idx_features_enabled ON features(is_enabled) WHERE is_enabled = true;

-- Enable RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read features
CREATE POLICY select_features ON features
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only super admins can manage features (future)
CREATE POLICY manage_features ON features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'is_super_admin' = 'true'
    )
  );

-- Comment
COMMENT ON TABLE features IS 'Modular features that can be enabled/disabled and have permissions';
COMMENT ON COLUMN features.name IS 'Unique identifier (e.g., "projects", "tasks")';
COMMENT ON COLUMN features.is_enabled IS 'Feature flag for enabling/disabling features globally';
```

#### Migration 004: Create Permissions Table

**File:** `supabase/migrations/20250127_004_create_permissions.sql`

**Reference:** Analysis Document Appendix A.2

```sql
-- Migration 004: Create Permissions Table
-- Purpose: Define granular permissions within features (create, read, update, delete, manage)

CREATE TYPE permission_action AS ENUM ('create', 'read', 'update', 'delete', 'manage');

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id uuid NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  action permission_action NOT NULL,
  resource text NOT NULL CHECK (char_length(resource) >= 1 AND char_length(resource) <= 50),
  description text CHECK (char_length(description) <= 500),
  conditions jsonb, -- CASL conditions for field-level permissions (optional)
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Unique constraint: one permission per feature+action+resource
  UNIQUE(feature_id, action, resource)
);

-- Indexes
CREATE INDEX idx_permissions_feature ON permissions(feature_id);
CREATE INDEX idx_permissions_lookup ON permissions(feature_id, action, resource);

-- Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read permissions
CREATE POLICY select_permissions ON permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only owners/admins can manage permissions
CREATE POLICY manage_permissions ON permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- Comment
COMMENT ON TABLE permissions IS 'Granular permissions for features (CRUD operations)';
COMMENT ON COLUMN permissions.action IS 'Permission action: create, read, update, delete, manage';
COMMENT ON COLUMN permissions.resource IS 'Resource being protected (e.g., "Project", "Task")';
COMMENT ON COLUMN permissions.conditions IS 'CASL conditions for field-level permissions (JSONB)';
```

#### Migration 005: Create Workspace Users Table

**File:** `supabase/migrations/20250127_005_create_workspace_users.sql`

```sql
-- Migration 005: Create Workspace Users Table
-- Purpose: Many-to-many relationship between users and workspaces with roles

CREATE TABLE workspace_users (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (workspace_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspace_users_lookup ON workspace_users(user_id, workspace_id);
CREATE INDEX idx_workspace_users_role ON workspace_users(role_id);

-- Enable RLS
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see members of workspaces they belong to
CREATE POLICY select_workspace_users ON workspace_users
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only owners/admins can add members
CREATE POLICY insert_workspace_users ON workspace_users
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT wu.workspace_id
      FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- RLS Policy: Only owners/admins can update member roles
CREATE POLICY update_workspace_users ON workspace_users
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT wu.workspace_id
      FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- RLS Policy: Prevent owner removal (delete policy)
CREATE POLICY delete_workspace_users ON workspace_users
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT wu.workspace_id
      FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name = 'owner'
    )
    AND user_id != (SELECT owner_id FROM workspaces WHERE id = workspace_id)
  );

-- Comment
COMMENT ON TABLE workspace_users IS 'User membership in workspaces with assigned roles';
COMMENT ON COLUMN workspace_users.invited_by IS 'User who added this member to the workspace';
```

#### Migration 006: Create Role Permissions Table

**File:** `supabase/migrations/20250127_006_create_role_permissions.sql`

```sql
-- Migration 006: Create Role Permissions Table
-- Purpose: Many-to-many relationship between roles and permissions

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (role_id, permission_id)
);

-- Indexes
CREATE INDEX idx_role_permissions_lookup ON role_permissions(role_id, permission_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read role permissions
CREATE POLICY select_role_permissions ON role_permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policy: Only owners/admins can assign permissions to roles
CREATE POLICY manage_role_permissions ON role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_users wu
      JOIN roles r ON wu.role_id = r.id
      WHERE wu.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

-- Comment
COMMENT ON TABLE role_permissions IS 'Permissions assigned to roles';
```

#### Migration 007: Create Additional Indexes

**File:** `supabase/migrations/20250127_007_create_indexes.sql`

**Reference:** Analysis Document Section 11.3

```sql
-- Migration 007: Create Additional Performance Indexes
-- Purpose: Optimize query performance for common RLS and join patterns

-- Workspace membership lookup (critical for RLS)
CREATE INDEX idx_workspace_membership ON workspace_users(workspace_id, user_id)
  WHERE joined_at IS NOT NULL;

-- Workspaces by owner (for owner operations)
-- Already created in migration 001, included here for completeness

-- Feature lookups by name (common query)
CREATE INDEX idx_features_name ON features(name);

-- Permissions by resource (for CASL loading)
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- Roles by name (system role lookups)
CREATE INDEX idx_roles_name ON roles(name);

-- Comment
COMMENT ON INDEX idx_workspace_membership IS 'Critical index for RLS workspace isolation checks';
```

#### Migration 008: Seed System Roles

**File:** `supabase/migrations/20250127_008_seed_system_roles.sql`

**Reference:** Analysis Document Appendix A.3

```sql
-- Migration 008: Seed System Roles
-- Purpose: Create immutable system roles (Owner, Admin, Member)

-- Insert system roles with fixed UUIDs
INSERT INTO roles (id, name, description, is_system, workspace_id, created_at) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'owner',
    'Workspace owner with full control (bypass all permissions)',
    true,
    NULL,
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'admin',
    'Administrator with management permissions (some restrictions)',
    true,
    NULL,
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'member',
    'Basic member with limited access',
    true,
    NULL,
    now()
  )
ON CONFLICT (id) DO NOTHING; -- Idempotent

-- Verify seeding
DO $$
DECLARE
  role_count INT;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles WHERE is_system = true;

  IF role_count != 3 THEN
    RAISE EXCEPTION 'System roles seeding failed. Expected 3 roles, got %', role_count;
  END IF;

  RAISE NOTICE 'System roles seeded successfully: Owner, Admin, Member';
END $$;

-- Comment
COMMENT ON TABLE roles IS 'System roles (Owner, Admin, Member) are immutable and globally available';
```

#### Migration 009: Analyze and Modify user_profiles (If Needed)

**File:** `supabase/migrations/20250127_009_modify_user_profiles.sql`

**CRITICAL DECISION POINT:** Analyze if `user_profiles` needs modification for workspace support.

**Analysis Questions:**
1. Should `user_profiles` have a `current_workspace_id` field?
2. Should workspace context come from `workspace_users` table only?
3. Do we need `default_workspace_id`?

**Recommendation (from Analysis Document Section 14.2):**
- User profiles are **workspace-agnostic**
- Workspace context comes from `workspace_users` table
- **NO modification needed** to `user_profiles`

**Implementation:**

```sql
-- Migration 009: Analyze user_profiles Table
-- Purpose: Determine if user_profiles needs workspace context

-- Option A: NO MODIFICATION (Recommended)
-- Workspace context is managed entirely through workspace_users table
-- user_profiles remains simple: id, email, name, avatar_url, timestamps

-- Rationale:
-- 1. user_profiles is for global user data (name, avatar)
-- 2. workspace_users handles workspace membership and roles
-- 3. Cleaner separation of concerns
-- 4. No breaking changes to existing data

-- If later needed, can add:
-- ALTER TABLE user_profiles ADD COLUMN current_workspace_id uuid REFERENCES workspaces(id);
-- But NOT required for Phase 1

RAISE NOTICE 'user_profiles analysis complete: No modification needed for Phase 1';

-- Option B: ADD CURRENT WORKSPACE (If User Explicitly Requests)
-- Uncomment if needed:
-- ALTER TABLE user_profiles ADD COLUMN current_workspace_id uuid REFERENCES workspaces(id);
-- CREATE INDEX idx_user_profiles_workspace ON user_profiles(current_workspace_id);

-- DECISION: Defer to implementation phase based on use case requirements
```

**⚠️ IMPORTANT:** If you determine modification IS needed, document the rationale clearly in your iteration document.

---

### 2. Data Services Implementation

**Location:** `app/src/features/rbac/services/`

**CRITICAL:** Data services must be **pure CRUD** with NO business logic.

#### 2.1 Workspace Service

**File:** `app/src/features/rbac/services/workspace.service.ts`

```typescript
/**
 * Workspace Service
 *
 * Pure CRUD operations for workspaces table.
 * NO business logic (use cases handle orchestration).
 */

import { createClient } from '@/lib/supabase';
import type { WorkspaceCreate, Workspace, WorkspaceUpdate } from '../entities';

export const workspaceService = {
  /**
   * Create a new workspace
   * RLS: WITH CHECK ensures owner_id = auth.uid()
   */
  async createWorkspace(input: WorkspaceCreate): Promise<Workspace> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspaces')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workspace: ${error.message}`);
    }

    return data;
  },

  /**
   * Get workspace by ID
   * RLS: USING ensures user is a member
   *
   * @param id Workspace UUID
   * @param userId User making request (for RLS context)
   * @returns Workspace or null if not found/no access
   */
  async getWorkspaceById(id: string, userId: string): Promise<Workspace | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspaces')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch workspace: ${error.message}`);
    }

    return data;
  },

  /**
   * Update workspace (owner only via RLS)
   */
  async updateWorkspace(
    id: string,
    input: WorkspaceUpdate,
    userId: string
  ): Promise<Workspace> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspaces')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update workspace: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete workspace (owner only via RLS, CASCADE all related data)
   */
  async deleteWorkspace(id: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }
  },

  /**
   * Get all workspaces for a user
   * RLS: USING ensures user sees only workspaces they're members of
   */
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspaces')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user workspaces: ${error.message}`);
    }

    return data || [];
  },
};
```

#### 2.2 Role Service

**File:** `app/src/features/rbac/services/role.service.ts`

```typescript
/**
 * Role Service
 *
 * Pure CRUD operations for roles and workspace_users tables.
 * NO business logic (use cases handle orchestration).
 */

import { createClient } from '@/lib/supabase';
import type {
  Role,
  WorkspaceUserCreate,
  WorkspaceUser,
  WorkspaceUserUpdate,
} from '../entities';

export const roleService = {
  /**
   * Get all system roles (Owner, Admin, Member)
   */
  async getSystemRoles(): Promise<Role[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('roles')
      .select()
      .eq('is_system', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch system roles: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('roles')
      .select()
      .eq('name', name)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch role by name: ${error.message}`);
    }

    return data;
  },

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('roles')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch role by ID: ${error.message}`);
    }

    return data;
  },

  /**
   * Assign role to user in workspace
   * RLS: WITH CHECK ensures user has permission to add members
   */
  async assignRole(input: WorkspaceUserCreate): Promise<WorkspaceUser> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspace_users')
      .insert(input)
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    return data;
  },

  /**
   * Update user's role in workspace
   */
  async updateUserRole(
    workspaceId: string,
    userId: string,
    input: WorkspaceUserUpdate
  ): Promise<WorkspaceUser> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspace_users')
      .update(input)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    return data;
  },

  /**
   * Remove user from workspace
   * RLS: USING prevents removing owner
   */
  async removeUserFromWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('workspace_users')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove user from workspace: ${error.message}`);
    }
  },

  /**
   * Get user's membership in a workspace
   */
  async getWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceUser | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspace_users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch workspace membership: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all members of a workspace
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceUser[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('workspace_users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('workspace_id', workspaceId)
      .order('joined_at');

    if (error) {
      throw new Error(`Failed to fetch workspace members: ${error.message}`);
    }

    return data || [];
  },
};
```

---

### 3. Supabase MCP Integration

**You have access to Supabase MCP tools for executing migrations:**

```typescript
// Execute migration SQL
mcp__supabase__execute_sql({
  project_id: 'hegoubbxcbkpooqbvcph',
  query: '-- SQL here'
});

// Check tables
mcp__supabase__list_tables({
  project_id: 'hegoubbxcbkpooqbvcph',
  schemas: ['public']
});

// Run advisors (security, performance)
mcp__supabase__get_advisors({
  project_id: 'hegoubbxcbkpooqbvcph',
  type: 'security' // or 'performance'
});
```

**Workflow:**
1. Write migration SQL files
2. Execute each migration using `execute_sql`
3. Verify tables created using `list_tables`
4. Run advisors to check for issues
5. Implement data services

---

### 4. Testing Requirements

#### 4.1 Migration Tests (from Test Agent)

**Test Agent will verify:**
- All 6 tables created
- All columns with correct data types
- All foreign keys with CASCADE rules
- All indexes created
- RLS enabled on all tables
- 3 system roles seeded with fixed UUIDs

**Run migration tests:**
```bash
cd app && npm run test -- features/rbac/migrations
```

#### 4.2 RLS Policy Tests (from Test Agent)

**Test Agent will verify:**
- Cross-workspace isolation (User A cannot access Workspace B)
- Workspace members can see workspace
- Only owner can update/delete workspace
- Only owner/admin can add members
- Owner cannot be removed from workspace

**Run RLS tests:**
```bash
cd app && npm run test -- features/rbac/services/rls-policies
```

#### 4.3 Service Tests (from Test Agent)

**Test Agent will verify:**
- workspaceService CRUD operations
- roleService CRUD operations
- RLS enforcement in services
- Error handling

**Run service tests:**
```bash
cd app && npm run test -- features/rbac/services
```

#### 4.4 Coverage Target

**Services:** >85% coverage

```bash
cd app && npm run test:coverage -- features/rbac/services
```

---

### 5. Performance Validation

#### 5.1 RLS Performance Test

**Target:** < 50ms for RLS policy evaluation (P95)

**Test Query:**
```sql
-- Measure workspace isolation check
EXPLAIN ANALYZE
SELECT * FROM workspaces
WHERE id IN (
  SELECT workspace_id FROM workspace_users WHERE user_id = 'test-user-id'
);
```

**Expected:**
- Uses `idx_workspace_users_lookup` index
- Execution time < 50ms

#### 5.2 Index Usage Verification

**Check indexes are used:**
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM workspace_users WHERE user_id = 'test-user-id';

-- Should show Index Scan using idx_workspace_users_lookup
```

---

### 6. Security Validation

#### 6.1 Run Supabase Advisors

```typescript
// Security advisor
const security = await mcp__supabase__get_advisors({
  project_id: 'hegoubbxcbkpooqbvcph',
  type: 'security'
});

// Performance advisor
const performance = await mcp__supabase__get_advisors({
  project_id: 'hegoubbxcbkpooqbvcph',
  type: 'performance'
});
```

**Expected:**
- No missing RLS policies
- No missing indexes on foreign keys
- No unvalidated foreign keys

#### 6.2 Manual Security Checklist

- [ ] All tables have RLS enabled
- [ ] Every RLS policy checks workspace membership
- [ ] No policies allow cross-workspace access
- [ ] Owner protection policies in place
- [ ] System roles cannot be deleted
- [ ] Foreign keys use appropriate CASCADE rules

---

## Expected Deliverables

### Migration Files (9 files)

- ✅ `001_create_workspaces.sql`
- ✅ `002_create_roles.sql`
- ✅ `003_create_features.sql`
- ✅ `004_create_permissions.sql`
- ✅ `005_create_workspace_users.sql`
- ✅ `006_create_role_permissions.sql`
- ✅ `007_create_indexes.sql`
- ✅ `008_seed_system_roles.sql`
- ✅ `009_modify_user_profiles.sql` (analysis + implementation if needed)

### Service Files (2 files)

- ✅ `workspace.service.ts`
- ✅ `role.service.ts`

### Test Files (3 files from Test Agent - DO NOT MODIFY)

- `migrations.test.ts`
- `rls-policies.test.ts`
- `workspace.service.test.ts`
- `role.service.test.ts`

### Documentation

**Iteration Document:**
- ✅ `supabase-agent/01-iteration.md`
  - Migration execution log
  - Tables created confirmation
  - RLS policies verification
  - System roles seeding confirmation
  - Service implementation summary
  - Performance metrics (RLS timing, index usage)
  - Security advisor results
  - Test results (all passing)
  - `user_profiles` modification decision
  - Decisions made
  - Blockers (if any)
  - Evidence (SQL output, test screenshots, advisor reports)

---

## Limitations

### What Supabase Agent CANNOT Do

**❌ Implement Business Logic**
- Services are pure CRUD only
- No validation logic (use cases handle that)
- No orchestration (use cases handle that)

**❌ Modify entities.ts**
- Entities are Architect's responsibility
- If schemas don't match DB, notify Architect

**❌ Modify Test Files**
- Tests are immutable specification
- If tests incorrect, notify Architect

**❌ Touch waitlist Table**
- PROTECTED table
- Any modification to `waitlist` is CRITICAL ERROR

**❌ Implement CASL**
- CASL is Phase 3
- Do NOT create `abilities/` folder
- Do NOT implement `defineAbilityFor`

**❌ Read Other Agents' Folders**
- Only read `supabase-agent/` folder
- Read `entities.ts` for schemas
- Architect coordinates info

---

## Success Criteria

### Supabase Agent Iteration 01 is APPROVED if:

- [ ] All 9 migration files created and executed successfully
- [ ] All 6 tables exist with correct schema (verified via `list_tables`)
- [ ] All foreign keys defined with proper CASCADE rules
- [ ] All 7+ indexes created
- [ ] RLS enabled on all 6 tables
- [ ] RLS policies enforce workspace isolation (cross-workspace blocked)
- [ ] 3 system roles seeded with fixed UUIDs
- [ ] `user_profiles` modification decision documented and implemented (if needed)
- [ ] `waitlist` table untouched
- [ ] workspaceService implemented (pure CRUD)
- [ ] roleService implemented (pure CRUD)
- [ ] All migration tests passing
- [ ] All RLS tests passing
- [ ] All service tests passing
- [ ] >85% service test coverage
- [ ] RLS performance < 50ms (P95)
- [ ] Security advisor shows no critical issues
- [ ] Performance advisor shows proper index usage
- [ ] TypeScript compiles without errors
- [ ] Iteration document complete with evidence

---

## Handoff from Other Agents

**You may receive handoff from Implementer Agent (if parallelism enabled):**

Architect may provide `implementer/handoff-001.md` with:
- Service interfaces Implementer expects
- Expected service behavior
- Mock data structures

**Coordination:**
- Ensure your service interfaces match Implementer's expectations
- If discrepancies, notify Architect
- Final integration test when both complete

---

## Common Mistakes to Avoid

**❌ Adding Business Logic to Services**
```typescript
// WRONG
export async function createWorkspace(input: WorkspaceCreate) {
  // Validating in service
  if (input.name.length < 1) throw new Error('Invalid name');

  // Business logic in service
  const ownerRole = await getRoleByName('owner');
  await assignRole({ ... });

  return workspace;
}
```

```typescript
// CORRECT
export async function createWorkspace(input: WorkspaceCreate) {
  // Pure CRUD - just insert
  const { data, error } = await supabase
    .from('workspaces')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`Failed to create workspace: ${error.message}`);
  return data;
}
```

**❌ Missing RLS Policies**
```sql
-- WRONG
CREATE TABLE workspaces (...);
-- Forgot to enable RLS!
```

```sql
-- CORRECT
CREATE TABLE workspaces (...);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_workspaces ON workspaces FOR SELECT USING (...);
```

**❌ Weak RLS Policies (Security Hole)**
```sql
-- WRONG - User could access other workspaces
CREATE POLICY bad_policy ON workspaces
  FOR SELECT
  USING (owner_id = auth.uid());
  -- Problem: Only owner sees workspace, not members!
```

```sql
-- CORRECT - Workspace membership check
CREATE POLICY select_workspaces ON workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );
```

**❌ Missing Indexes on Foreign Keys**
```sql
-- WRONG
CREATE TABLE workspace_users (
  workspace_id uuid REFERENCES workspaces(id),
  user_id uuid REFERENCES auth.users(id),
  ...
);
-- No indexes! RLS will be slow!
```

```sql
-- CORRECT
CREATE TABLE workspace_users (...);
CREATE INDEX idx_workspace_users_lookup ON workspace_users(user_id, workspace_id);
```

**❌ Modifying waitlist Table**
```sql
-- CRITICAL ERROR - DO NOT DO THIS
ALTER TABLE waitlist ADD COLUMN workspace_id uuid;
```

---

## 10. user_profiles Modification Decision Framework

**CRITICAL DECISION:** Determine if `user_profiles` needs workspace context.

### Analysis Process

**Step 1: Understand Current Schema**
```sql
-- Current user_profiles schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Step 2: Analyze Use Cases**
- Do use cases need to know "current workspace" at profile level?
- Should users have a "default workspace"?
- Is workspace context always derived from `workspace_users`?

**Step 3: Evaluate Options**

**Option A: NO MODIFICATION (Recommended)**
- Pros:
  - Clean separation: profiles = user data, workspace_users = workspace context
  - No breaking changes
  - Simpler schema
  - Current workspace can be stored in client state (Zustand) or URL params
- Cons:
  - Need to track current workspace in frontend state

**Option B: ADD current_workspace_id**
- Pros:
  - Persistent current workspace across sessions
  - Simpler frontend state
- Cons:
  - Adds complexity to user_profiles
  - Need RLS policies on workspace_id column
  - What if user leaves workspace that is current?

**Option C: ADD default_workspace_id**
- Pros:
  - Users have a "home" workspace
  - Good UX for workspace switching
- Cons:
  - Similar to Option B
  - Need to handle workspace deletion

### Recommended Decision

**Use Option A (No Modification):**
- Workspace context comes from `workspace_users` table ONLY
- Frontend tracks current workspace in URL or client state
- Keep `user_profiles` simple and focused

**If Modification Needed (Document Clearly):**
```sql
-- Only if explicitly required
ALTER TABLE user_profiles ADD COLUMN current_workspace_id uuid REFERENCES workspaces(id);
CREATE INDEX idx_user_profiles_workspace ON user_profiles(current_workspace_id);

-- RLS: Users can only set their own current_workspace_id
CREATE POLICY update_user_profiles_workspace ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

**Document Decision in Iteration:**
- Rationale for choice
- Pros/cons considered
- Implementation (if modified)
- Future migration path (if needed later)

---

## References

- **Master PRD:** `PRDs/rbac/001-foundation/architect/00-master-prd.md`
  - Section 8: Technical Architecture (Database Schema, RLS Policies)
  - Section 15: Migration Strategy
- **entities.ts:** `app/src/features/rbac/entities.ts`
- **Analysis Document:** `PRDs/_analysis/rbac-implementation-analysis.md`
  - Section 4.1: Entity Diagram
  - Section 11.3: Database Query Optimization
  - Appendix A: Example Migrations
  - Appendix A.1: Create Workspaces Table
  - Appendix A.2: Create Permissions Table
  - Appendix A.3: Seed System Roles
- **Supabase Skill:** `.claude/skills/supabase-expert-skill/SKILL.md`

---

**END OF SUPABASE AGENT REQUEST**

**Prepared by:** Architect Agent
**Date:** 2025-01-27
**Status:** Ready for Implementation
**Next Agent:** Supabase Agent (awaiting Test Agent + Implementer completion)
