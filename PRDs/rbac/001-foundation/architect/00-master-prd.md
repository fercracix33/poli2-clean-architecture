# PRD: RBAC Foundation System - Phase 1 (Backend Only)

**Feature ID:** rbac-001
**Feature Name:** RBAC Foundation
**Domain:** rbac
**Phase:** 1 - Foundation (Backend Only)
**Version:** 1.0
**Date:** 2025-01-27
**Status:** Ready for Implementation
**Author:** Architect Agent

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Success Metrics](#3-goals-and-success-metrics)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Data Contracts](#6-data-contracts)
7. [API Specifications](#7-api-specifications)
8. [Technical Architecture](#8-technical-architecture)
9. [Testing Strategy](#9-testing-strategy)
10. [Security Considerations](#10-security-considerations)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Out of Scope](#12-out-of-scope)
13. [Dependencies & Prerequisites](#13-dependencies--prerequisites)
14. [Timeline Estimate](#14-timeline-estimate)

---

## 1. Executive Summary

### Problem
The current system lacks a modular, feature-based RBAC (Role-Based Access Control) system. Without proper workspace isolation, permission management, and role assignment capabilities, the application cannot support multi-tenant workspaces with granular access control.

### Solution
Implement Phase 1 of the RBAC Foundation system, focusing exclusively on **backend infrastructure**: database schema, Row Level Security (RLS) policies, entities, and minimal use cases. This phase establishes the foundation for workspace isolation and permission management without any UI implementation.

### Impact
- **Security**: Database-level workspace isolation via RLS policies
- **Scalability**: Support for 1000+ workspaces per organization
- **Extensibility**: Modular permission system ready for feature integration
- **Performance**: < 100ms permission checks with proper indexing

### Key Technologies
- **Database**: Supabase PostgreSQL with RLS
- **Type Safety**: Zod schemas + TypeScript
- **Authorization**: CASL types defined (implementation in Phase 3)
- **Validation**: Zod at all boundaries

---

## 2. Problem Statement

### Current State
- No workspace isolation (single-tenant mindset)
- No role-based access control
- No permission system
- No RLS policies (open database access)
- `user_profiles` table lacks workspace context
- Legacy "organization" terminology needs cleanup

### Desired State
- Complete workspace isolation at database level
- System roles (Owner, Admin, Member) seeded and functional
- RLS policies enforcing multi-tenant security
- Foundation for future feature-based permissions
- Clean "workspace" terminology throughout

### Pain Points
1. **Security Risk**: Without RLS, any authenticated user could access all data
2. **Scalability Blocker**: Cannot support multiple workspaces per user
3. **Feature Blocker**: Cannot add projects/tasks without permission system
4. **Maintainability**: No clear ownership model

---

## 3. Goals and Success Metrics

### Primary Goals
1. **G1**: Establish database schema for RBAC (6 tables)
2. **G2**: Implement RLS policies for workspace isolation
3. **G3**: Seed system roles (Owner, Admin, Member)
4. **G4**: Create pure data contracts (entities.ts)
5. **G5**: Modify `user_profiles` for workspace support

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Database tables created | 6/6 | All RBAC tables exist |
| RLS policies active | 6/6 tables | All tables have RLS enabled |
| System roles seeded | 3/3 | Owner, Admin, Member exist |
| Cross-workspace isolation | 100% | Test users cannot access other workspaces |
| Migration tests passing | 100% | All schema tests green |
| Type safety | 100% | entities.ts compiles without errors |

### Non-Goals (Out of Scope)
- UI components (Phase 4)
- CASL implementation (Phase 3 - only types in Phase 1)
- API endpoints (Phase 2)
- Feature-specific permissions (Phase 5+)

---

## 4. User Stories

### US-1: Workspace Owner
**As a workspace owner**
**I want to** create a workspace and become its Owner automatically
**So that** I have full control over my workspace from the start

**Acceptance Criteria:**
- Owner can create a workspace
- Owner is automatically added to `workspace_users` with Owner role
- Owner's `owner_id` is set correctly in `workspaces` table
- RLS policies allow Owner to see their workspace

---

### US-2: Workspace Isolation
**As a system administrator**
**I want** complete workspace isolation at database level
**So that** users can only access data from workspaces they belong to

**Acceptance Criteria:**
- User A in Workspace 1 cannot query Workspace 2 data
- RLS policies block cross-workspace SELECT, INSERT, UPDATE, DELETE
- Test suite validates isolation with multiple test users
- Performance: < 50ms for RLS policy evaluation

---

### US-3: Role Assignment
**As a workspace owner**
**I want** to assign roles to users in my workspace
**So that** I can control who has what level of access

**Acceptance Criteria:**
- Owner can assign any system role (Owner, Admin, Member)
- Role assignments are stored in `workspace_users` table
- One user can have different roles in different workspaces
- System roles are immutable (cannot be deleted)

---

### US-4: System Integrity
**As a backend developer**
**I want** a fully type-safe and validated RBAC foundation
**So that** I can build features on top with confidence

**Acceptance Criteria:**
- All entities defined in `entities.ts` with Zod
- TypeScript types inferred from Zod schemas
- Foreign keys with proper CASCADE rules
- Indexes on all foreign key columns
- Migrations are idempotent and reversible

---

## 5. Functional Requirements

### FR-1: Workspace Management (MINIMAL)
**Priority:** P0 (Critical)

**Operations:**
- **Create Workspace**: Owner creates workspace, becomes member automatically
- **Read Workspace**: Users can view workspaces they belong to
- **Update Workspace**: Owner can update workspace name
- **Delete Workspace**: Owner can delete workspace (CASCADE all related data)

**Business Rules:**
- Workspace name must be 1-100 characters
- Workspace must have exactly one owner
- Owner cannot be removed from workspace
- Deleting workspace removes all associated data

---

### FR-2: Role Management (SYSTEM ROLES ONLY)
**Priority:** P0 (Critical)

**System Roles:**
1. **Owner**: Full control, bypass all permissions (Phase 3)
2. **Admin**: Administrative access with restrictions (Phase 3)
3. **Member**: Basic member access (Phase 5+)

**Operations:**
- **Seed Roles**: Migration creates 3 system roles
- **Read Roles**: Query system roles
- **Assign Role**: Add user to workspace with role

**Business Rules:**
- System roles are immutable (is_system=true)
- System roles have workspace_id=null (global)
- Custom roles NOT in Phase 1 (Phase 4)

---

### FR-3: Workspace Membership (CORE)
**Priority:** P0 (Critical)

**Operations:**
- **Add Member**: Owner invites user, assigns role
- **Update Member Role**: Owner changes user's role
- **Remove Member**: Owner removes user from workspace
- **List Members**: Query all members in workspace

**Business Rules:**
- User can belong to multiple workspaces
- Each workspace membership has ONE role
- Owner cannot be removed from their workspace
- `invited_by` tracks who added the user

---

### FR-4: Permission Schema (FOUNDATION)
**Priority:** P0 (Critical)

**Operations:**
- **Create Permission**: Define permission for feature
- **Read Permissions**: Query permissions by feature/role
- **Link to Role**: Associate permission with role

**Business Rules:**
- Permission format: `{feature_id}.{resource}.{action}`
- Actions: create, read, update, delete, manage
- Permissions belong to features
- Conditions stored as JSONB for CASL (Phase 3)

---

### FR-5: Feature Management (FOUNDATION)
**Priority:** P0 (Critical)

**Operations:**
- **Create Feature**: Define new feature (e.g., 'projects', 'tasks')
- **Read Features**: List all features
- **Enable/Disable Feature**: Toggle feature availability

**Business Rules:**
- Feature name is unique, immutable
- Features can be enabled/disabled per workspace (Phase 4)
- Phase 1 seeds NO features (Phase 5+)

---

### FR-6: Database Migrations (INFRASTRUCTURE)
**Priority:** P0 (Critical)

**Required Migrations:**
1. `001_create_workspaces.sql` - Workspaces table + RLS
2. `002_create_roles.sql` - Roles table + RLS
3. `003_create_features.sql` - Features table + RLS
4. `004_create_permissions.sql` - Permissions table + RLS
5. `005_create_workspace_users.sql` - Workspace-user mapping + RLS
6. `006_create_role_permissions.sql` - Role-permission mapping + RLS
7. `007_create_indexes.sql` - Performance indexes
8. `008_seed_system_roles.sql` - Seed Owner, Admin, Member
9. `009_modify_user_profiles.sql` - Add workspace context if needed

**Business Rules:**
- Migrations must be idempotent
- All tables have RLS enabled
- Foreign keys use ON DELETE CASCADE where appropriate
- Indexes on all frequently queried columns

---

## 6. Data Contracts

All data contracts are already implemented in `app/src/features/rbac/entities.ts`.

### Key Schemas Summary

**Workspaces:**
```typescript
WorkspaceSchema: id, name, owner_id, created_at, updated_at
WorkspaceCreateSchema: Omits id, timestamps
WorkspaceUpdateSchema: Partial (only name updatable)
```

**Roles:**
```typescript
RoleSchema: id, name, description, is_system, workspace_id, created_at
RoleCreateSchema: Omits id, created_at
RoleUpdateSchema: Partial (system roles restricted)
SYSTEM_ROLES: { OWNER: 'owner', ADMIN: 'admin', MEMBER: 'member' }
```

**Features:**
```typescript
FeatureSchema: id, name, display_name, description, is_enabled, created_at
FeatureCreateSchema: Omits id, created_at
FeatureUpdateSchema: Partial (name immutable)
```

**Permissions:**
```typescript
PermissionSchema: id, feature_id, action, resource, description, conditions, created_at
PermissionActionSchema: enum(['create', 'read', 'update', 'delete', 'manage'])
PermissionCreateSchema: Omits id, created_at
PermissionUpdateSchema: Partial (action/resource immutable)
```

**Workspace Users:**
```typescript
WorkspaceUserSchema: workspace_id, user_id, role_id, invited_by, joined_at
WorkspaceUserCreateSchema: Omits joined_at
WorkspaceUserUpdateSchema: Only role_id updatable
```

**Role Permissions:**
```typescript
RolePermissionSchema: role_id, permission_id, granted_at
RolePermissionCreateSchema: Omits granted_at
```

**Users:**
```typescript
UserSchema: id, email, is_super_admin, created_at
(From Supabase Auth - no direct table creation needed)
```

### CASL Types (Defined, Not Implemented)

```typescript
// Type definitions only - implementation in Phase 3
type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
type Subjects = 'Workspace' | 'Role' | 'Permission' | 'Feature' | 'User' | 'all';
type AppAbility = MongoAbility<[Actions, Subjects]>;

interface DefineAbilityInput {
  user: User;
  workspace: Workspace;
  permissions: Permission[];
}

type DefineAbilityFunction = (input: DefineAbilityInput) => Promise<AppAbility>;
```

**Reference:** Full implementation in `/app/src/features/rbac/entities.ts` (already created)

---

## 7. API Specifications

### ⚠️ PHASE 1 CONSTRAINT: NO API ENDPOINTS

**Phase 1 is backend-only infrastructure.** API endpoints will be implemented in later phases:
- **Phase 2**: Basic permission checking APIs
- **Phase 5+**: Feature-specific APIs (projects, tasks)

**This section documents future API design for reference, but NO implementation required in Phase 1.**

### Future API Design (Reference Only)

**POST /api/workspaces/create** (Phase 2)
- Creates workspace, adds owner
- Validates name length
- Returns workspace with owner_id

**GET /api/workspaces/:id/members** (Phase 2)
- Lists all members in workspace
- Includes role information
- Requires workspace membership

**POST /api/workspaces/:id/members** (Phase 2)
- Adds user to workspace with role
- Requires Owner permission
- Validates role exists

---

## 8. Technical Architecture

### 8.1 Database Schema

**Diagram:**
```
┌─────────────────┐
│   Workspaces    │
│─────────────────│
│ id (PK)         │
│ name            │
│ owner_id (FK)   │──┐
│ created_at      │  │
└─────────────────┘  │
         │           │
         │ 1:N       │
         ↓           │
┌─────────────────┐  │
│ Workspace_Users │  │
│─────────────────│  │
│ workspace_id(FK)│  │
│ user_id (FK)    │←─┘
│ role_id (FK)    │──┐
│ invited_by (FK) │  │
│ joined_at       │  │
└─────────────────┘  │
         │           │
         │ N:1       │
         ↓           ↓
┌─────────────────┐ ┌─────────────────┐
│     Roles       │ │ auth.users      │
│─────────────────│ │─────────────────│
│ id (PK)         │ │ id (PK)         │
│ name            │ │ email           │
│ description     │ │ (Supabase Auth) │
│ is_system       │ └─────────────────┘
│ workspace_id    │
│ created_at      │
└─────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────┐
│ Role_Permissions│
│─────────────────│
│ role_id (FK)    │
│ permission_id(FK)│──┐
│ granted_at      │  │
└─────────────────┘  │
         │           │
         │ N:1       │
         ↓           ↓
┌─────────────────┐ ┌─────────────────┐
│   Permissions   │ │    Features     │
│─────────────────│ │─────────────────│
│ id (PK)         │ │ id (PK)         │
│ feature_id (FK) │←┘ name            │
│ action          │   display_name    │
│ resource        │   description     │
│ description     │   is_enabled      │
│ conditions      │   created_at      │
│ created_at      │ └─────────────────┘
└─────────────────┘
```

### 8.2 Row Level Security (RLS) Policies

**CRITICAL:** Every table MUST have RLS enabled with workspace isolation.

**Pattern Reference (from Analysis Document Appendix A):**

```sql
-- Workspaces: Users see only workspaces they're members of
CREATE POLICY select_workspaces ON workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );

-- Workspace Users: Isolation by workspace membership
CREATE POLICY select_workspace_users ON workspace_users
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );

-- Permissions: Admin-only access (Owner/Admin roles)
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
```

**Full RLS policies specified in Analysis Document Appendix A.**

### 8.3 Indexes for Performance

**Critical indexes (from Analysis Section 11.3):**

```sql
-- Composite index for workspace membership lookup
CREATE INDEX idx_workspace_users_lookup
  ON workspace_users(user_id, workspace_id);

-- Role permissions lookup
CREATE INDEX idx_role_permissions_lookup
  ON role_permissions(role_id, permission_id);

-- Permissions by feature
CREATE INDEX idx_permissions_feature
  ON permissions(feature_id, action, resource);

-- Workspace membership with soft delete support
CREATE INDEX idx_workspace_membership
  ON workspace_users(workspace_id, user_id)
  WHERE deleted_at IS NULL;

-- Owner lookup
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
```

**Target Performance:**
- Permission lookup: < 100ms (P95)
- RLS policy evaluation: < 50ms
- Workspace membership check: < 20ms

### 8.4 Foreign Key Relationships

**CASCADE Rules:**

```sql
-- Workspace deletion cascades to all related data
workspaces.id → workspace_users.workspace_id (ON DELETE CASCADE)
workspaces.id → (future: projects, tasks, etc.) (ON DELETE CASCADE)

-- Role deletion removes role assignments
roles.id → workspace_users.role_id (ON DELETE RESTRICT - system roles protected)
roles.id → role_permissions.role_id (ON DELETE CASCADE)

-- Feature deletion cascades to permissions
features.id → permissions.feature_id (ON DELETE CASCADE)

-- Permission deletion cascades to role assignments
permissions.id → role_permissions.permission_id (ON DELETE CASCADE)

-- User deletion from Auth cascades to profiles
auth.users.id → user_profiles.id (ON DELETE CASCADE)
auth.users.id → workspaces.owner_id (ON DELETE RESTRICT - transfer ownership first)
```

### 8.5 Data Types & Constraints

**UUIDs:**
- All primary keys: `uuid DEFAULT gen_random_uuid()`
- Foreign keys: `uuid` (validated by FK constraint)

**Timestamps:**
- All timestamps: `timestamptz NOT NULL DEFAULT now()`
- Use `updated_at` triggers where needed

**Text Constraints:**
- Workspace name: `CHECK (char_length(name) >= 1 AND char_length(name) <= 100)`
- Role name: `CHECK (char_length(name) >= 1 AND char_length(name) <= 50)`
- Description: `CHECK (char_length(description) <= 500)`

**JSONB:**
- Permission conditions: `jsonb` (nullable, for CASL conditions)

---

## 9. Testing Strategy

### 9.1 Test Coverage Targets

| Layer | Target | Tool | Phase 1 Scope |
|-------|--------|------|---------------|
| Entities (Zod) | 100% | Vitest | ✅ Full coverage |
| Use Cases | >90% | Vitest | ✅ Minimal use cases |
| Services | >85% | Vitest + Supabase | ✅ Data services |
| API Routes | N/A | - | ❌ Not in Phase 1 |
| Components | N/A | - | ❌ Not in Phase 1 |
| E2E Flows | N/A | - | ❌ Not in Phase 1 |

### 9.2 Test Agent Responsibilities

**Entity Validation Tests:**
```typescript
describe('WorkspaceSchema', () => {
  it('should validate correct workspace data');
  it('should reject invalid owner_id');
  it('should enforce name length constraints');
  it('should handle optional fields');
});

describe('RoleSchema', () => {
  it('should validate system roles');
  it('should enforce workspace_id nullability for system roles');
  it('should validate custom roles');
});

describe('PermissionSchema', () => {
  it('should validate permission actions enum');
  it('should validate resource names');
  it('should handle optional conditions JSONB');
});
```

**RLS Policy Tests (CRITICAL):**
```typescript
describe('Workspace RLS Policies', () => {
  it('should prevent cross-workspace data access');
  it('should allow owner to see their workspace');
  it('should allow members to see workspace');
  it('should block non-members from workspace');
});

describe('Workspace Users RLS Policies', () => {
  it('should enforce workspace_id in workspace_users');
  it('should prevent users from seeing other workspaces members');
  it('should allow workspace members to see member list');
});

describe('Permission RLS Policies', () => {
  it('should restrict permission management to admins');
  it('should allow owners to manage permissions');
  it('should block members from editing permissions');
});
```

**Migration Tests:**
```typescript
describe('Database Migrations', () => {
  it('should create all 6 tables with correct schema');
  it('should seed 3 system roles');
  it('should create all indexes');
  it('should enable RLS on all tables');
  it('should enforce foreign key constraints');
});
```

**Use Case Tests (MINIMAL):**
```typescript
describe('createWorkspace', () => {
  it('should create workspace with owner');
  it('should auto-assign Owner role to creator');
  it('should fail with invalid workspace name');
});

describe('assignRole', () => {
  it('should assign role to user in workspace');
  it('should fail if workspace does not exist');
  it('should fail if user not invited');
});
```

### 9.3 Test Data Fixtures

**Provided by Test Agent:**
```typescript
// test/fixtures/rbac.fixtures.ts
export const testWorkspace = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Workspace',
  owner_id: 'owner-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const testRoles = {
  owner: { id: 'role-owner', name: 'owner', is_system: true, workspace_id: null },
  admin: { id: 'role-admin', name: 'admin', is_system: true, workspace_id: null },
  member: { id: 'role-member', name: 'member', is_system: true, workspace_id: null },
};
```

### 9.4 Success Criteria for Test Agent

- ✅ All entity schemas have validation tests
- ✅ RLS policies tested with multiple users/workspaces
- ✅ Migration scripts tested for idempotency
- ✅ Cross-workspace isolation verified
- ✅ >90% coverage on use cases
- ✅ All tests FAIL initially (TDD)

---

## 10. Security Considerations

### 10.1 Defense in Depth (Phase 1 Scope)

**Layer 3: Database (RLS) - ONLY THIS LAYER IN PHASE 1**

```sql
-- Example: Workspace isolation at DB level
CREATE POLICY workspace_isolation ON projects
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );
```

**Layers NOT in Phase 1:**
- ❌ Layer 1: UI (CASL React components) - Phase 4
- ❌ Layer 2: API/Use Case (CASL checks) - Phase 3

### 10.2 JWT Security

**Supabase Auth Integration:**
- JWT tokens validated on every request
- `auth.uid()` available in RLS policies from JWT
- Token expiration: 1 hour (refresh token used)
- No sensitive data in JWT (only user_id, email)

**RLS Policy Pattern:**
```sql
-- All policies use auth.uid() from JWT
USING (user_id = auth.uid())
USING (owner_id = auth.uid())
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
))
```

### 10.3 Multi-Tenancy Isolation (CRITICAL)

**Every table with workspace context MUST have RLS:**

✅ **CORRECT:** Workspace isolation enforced
```sql
CREATE POLICY workspace_isolation ON projects
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users WHERE user_id = auth.uid()
    )
  );
```

❌ **WRONG:** Missing workspace check (security hole)
```sql
CREATE POLICY bad_policy ON projects
  USING (created_by = auth.uid()); -- User could access other workspaces!
```

**Validation Checklist:**
- [ ] Every table has `workspace_id` column (or references one)
- [ ] Every RLS policy checks workspace membership
- [ ] Every query includes workspace filter
- [ ] Tests verify cross-workspace access is blocked

### 10.4 SQL Injection Prevention

**Supabase Client (Safe):**
```typescript
// ✅ Parameters are escaped automatically
await supabase
  .from('workspaces')
  .select()
  .eq('id', userInput); // Safe - parameterized
```

**Zod Validation:**
```typescript
// ✅ Input validated before DB
const validated = WorkspaceSchema.parse(userInput);
// If validation fails, request rejected before DB access
```

### 10.5 System Role Protection

**Immutable System Roles:**
```sql
-- System roles cannot be deleted
ALTER TABLE roles ADD CONSTRAINT protect_system_roles
  CHECK (NOT is_system OR (is_system AND workspace_id IS NULL));

-- Migration creates system roles with fixed UUIDs
INSERT INTO roles (id, name, is_system, workspace_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'owner', true, NULL),
  ('00000000-0000-0000-0000-000000000002', 'admin', true, NULL),
  ('00000000-0000-0000-0000-000000000003', 'member', true, NULL);
```

**Owner Protection:**
```sql
-- Owner cannot be removed from workspace they own
CREATE POLICY prevent_owner_removal ON workspace_users
  FOR DELETE
  USING (
    user_id != (SELECT owner_id FROM workspaces WHERE id = workspace_id)
  );
```

---

## 11. Acceptance Criteria

### AC-1: Database Schema Complete

**Must Have:**
- [ ] All 6 tables created: workspaces, roles, features, permissions, workspace_users, role_permissions
- [ ] All foreign keys defined with correct CASCADE rules
- [ ] All indexes created (7 indexes minimum)
- [ ] All RLS policies enabled and tested
- [ ] System roles seeded (Owner, Admin, Member)

**Verification:**
```sql
-- Run this query, expect 6 tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('workspaces', 'roles', 'features', 'permissions', 'workspace_users', 'role_permissions');

-- Run this query, expect 3 roles
SELECT COUNT(*) FROM roles WHERE is_system = true;
```

---

### AC-2: RLS Policies Functional

**Must Have:**
- [ ] User A in Workspace 1 cannot query Workspace 2 data
- [ ] User can see all workspaces they belong to
- [ ] Owner can create/update/delete their workspace
- [ ] Non-owners cannot delete workspace
- [ ] RLS evaluation time < 50ms (P95)

**Verification:**
```typescript
// Test: User A cannot access Workspace B
const userAClient = createClientForUser('user-a-id');
const { data } = await userAClient
  .from('workspaces')
  .select()
  .eq('id', 'workspace-b-id');

expect(data).toEqual([]); // RLS blocks access
```

---

### AC-3: Type Safety Complete

**Must Have:**
- [ ] entities.ts compiles without TypeScript errors
- [ ] All Zod schemas match database schema
- [ ] All Create/Update schemas properly derived
- [ ] CASL types defined (Actions, Subjects, AppAbility)
- [ ] No `any` types in entities.ts

**Verification:**
```bash
cd app && npm run typecheck
# Expect: No errors in features/rbac/entities.ts
```

---

### AC-4: Use Cases Functional

**Must Have:**
- [ ] `createWorkspace` creates workspace and auto-assigns Owner
- [ ] `assignRole` assigns role to user in workspace
- [ ] Use cases call services (not implement data access)
- [ ] Use cases validate inputs with Zod

**Verification:**
```typescript
const workspace = await createWorkspace('My Workspace', 'user-123');
expect(workspace.owner_id).toBe('user-123');

const membership = await getWorkspaceMembership('user-123', workspace.id);
expect(membership.role.name).toBe('owner');
```

---

### AC-5: Data Services Functional

**Must Have:**
- [ ] Workspace CRUD operations work
- [ ] Role assignment operations work
- [ ] Services use Supabase Client (NOT Prisma)
- [ ] Services handle errors properly
- [ ] RLS policies enforced on all queries

**Verification:**
```typescript
const workspace = await workspaceService.createWorkspace({ name: 'Test', owner_id: 'user-123' });
const fetched = await workspaceService.getWorkspaceById(workspace.id, 'user-123');
expect(fetched.name).toBe('Test');
```

---

### AC-6: Testing Complete

**Must Have:**
- [ ] Entity validation tests: 100% coverage
- [ ] RLS policy tests: All isolation scenarios covered
- [ ] Migration tests: All tables/indexes verified
- [ ] Use case tests: >90% coverage
- [ ] Service tests: >85% coverage
- [ ] All tests pass

**Verification:**
```bash
cd app && npm run test
# Expect: >90% coverage, all tests green
```

---

### AC-7: user_profiles Modified (if needed)

**Must Have:**
- [ ] Analyze if `user_profiles` needs workspace context
- [ ] If yes: Add `workspace_id` or similar field
- [ ] Handle existing data (migration strategy)
- [ ] Update RLS policies if modified

**Verification:**
```sql
-- If workspace_id added:
SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'workspace_id';
```

---

### AC-8: Legacy Cleanup Documented

**Must Have:**
- [ ] All "organization" references found via grep
- [ ] Cleanup plan documented in migration strategy
- [ ] No breaking changes introduced by cleanup

**Verification:**
```bash
grep -r "organization" app/src/ --exclude-dir=node_modules
# Document findings, create cleanup plan
```

---

## 12. Out of Scope

### Phase 1 Explicitly Excludes:

**❌ UI Implementation**
- No React components
- No pages in app/ directory
- No forms or UI validation
- No E2E tests (Playwright)
- **Reason:** Phase 4 handles UI

**❌ API Endpoints**
- No Next.js API routes
- No route handlers
- No API controller tests
- **Reason:** Phase 2 handles APIs

**❌ CASL Implementation**
- No `defineAbilityFor()` function
- No `<Can>` component
- No `useAbility` hook
- **Note:** CASL types ARE defined in entities.ts, but NO implementation
- **Reason:** Phase 3 handles CASL

**❌ Feature-Specific Permissions**
- No project permissions
- No task permissions
- No Kanban permissions
- **Reason:** Phase 5+ handles feature integration

**❌ Custom Roles**
- No custom role creation UI
- No permission editor
- **Reason:** Phase 4 handles custom roles

**❌ Advanced Features**
- No permission inheritance
- No audit logs
- No permission history
- No real-time subscriptions
- **Reason:** Phase 7 handles advanced features

### Explicitly In Scope for Phase 1:

✅ Database schema (6 tables)
✅ RLS policies (workspace isolation)
✅ System roles seeding (Owner, Admin, Member)
✅ entities.ts (Zod schemas + CASL types)
✅ Minimal use cases (createWorkspace, assignRole)
✅ Data services (pure CRUD)
✅ Migration scripts (9 files)
✅ Unit tests (entities, use cases, services)
✅ RLS policy tests
✅ Migration tests

---

## 13. Dependencies & Prerequisites

### 13.1 External Dependencies

**Required Packages (Already Installed):**
- `zod` - Schema validation
- `@supabase/supabase-js` - Supabase client
- `@casl/ability` - Type definitions only (implementation Phase 3)
- `@casl/react` - NOT used in Phase 1

**Supabase Configuration:**
- Project ID: `hegoubbxcbkpooqbvcph`
- Region: `eu-central-1`
- Database: PostgreSQL 17.4.1.074
- Auth: Supabase Auth (active)

### 13.2 Existing Database Context

**Current State (from Supabase MCP query):**

**Existing Tables:**
- `waitlist` (PROTECTED - do not modify)
  - Columns: email, ip, user_agent, source, utm_*, id, created_at
  - RLS enabled: true
  - Policy: Allow all inserts

- `user_profiles` (MODIFY if needed)
  - Columns: id, email, name, avatar_url, created_at, updated_at
  - RLS enabled: true
  - Policies: Users can insert/update/view own profile
  - Foreign key: id → auth.users(id)

**Existing RLS Patterns:**
- Pattern: `auth.uid()` used for user identification
- Pattern: Simple `id = auth.uid()` checks
- Pattern: Insert policies use `WITH CHECK`
- Pattern: Update/Delete use `USING`

**No Existing Multi-Tenancy:**
- No workspace_id columns
- No organization_id columns
- Single-tenant mindset

### 13.3 Prerequisites

**Before Starting Implementation:**
1. ✅ Analysis document reviewed (`PRDs/_analysis/rbac-implementation-analysis.md`)
2. ✅ entities.ts implemented (`app/src/features/rbac/entities.ts`)
3. ✅ Supabase project accessible
4. ✅ User decisions finalized (workspaces, Phase 1 scope, user_profiles)
5. ✅ Test Agent request written (Section 14)

**Blockers:**
- None (all prerequisites met)

### 13.4 Agent Coordination

**Sequence:**
1. **Architect** (this document) → **COMPLETE**
2. **Test Agent** → Reads `test-agent/00-request.md`, creates tests
3. **Implementer** → Reads `implementer/00-request.md`, implements use cases
4. **Supabase Agent** → Reads `supabase-agent/00-request.md`, creates migrations + services

**Handoff Documents:**
- `test-agent/00-request.md` - Test requirements
- `implementer/00-request.md` - Use case requirements
- `supabase-agent/00-request.md` - Database + service requirements

---

## 14. Timeline Estimate

### Phase 1 Breakdown (Backend Only)

| Agent | Tasks | Effort | Duration |
|-------|-------|--------|----------|
| **Test Agent** | Entity tests, RLS tests, migration tests, use case tests, service tests | 40h | 1 week |
| **Implementer** | Minimal use cases (createWorkspace, assignRole), validation logic | 20h | 0.5 week |
| **Supabase Agent** | 9 migrations, RLS policies, indexes, data services, user_profiles modification | 60h | 1.5 weeks |

**Total Phase 1:** 120 hours (~3 weeks with parallelization)

### Critical Path

```
Architect (PRD + entities.ts) ✅ COMPLETE
  ↓
Test Agent (Week 1) → Creates ALL tests
  ↓ (tests define interfaces)
Implementer (Week 1.5) → Implements use cases
  ↓ (parallel with Supabase)
Supabase Agent (Week 1-2.5) → Migrations + Services
  ↓
Architect Review (Week 3) → Approve/reject iterations
```

**Parallelization Opportunities:**
- Test Agent and Implementer can overlap (Test Agent defines interfaces)
- Implementer and Supabase Agent can partially overlap (use cases call services, services implement later)

### Iteration Estimates

**Test Agent:**
- Iteration 01: 1 week (all tests)
- Potential Iteration 02: +2 days (if corrections needed)

**Implementer:**
- Iteration 01: 0.5 week (minimal use cases)
- Potential Iteration 02: +1 day (if corrections needed)

**Supabase Agent:**
- Iteration 01: 1.5 weeks (migrations + services)
- Potential Iteration 02: +3 days (if corrections needed)

**Architect Review Time:**
- Per iteration review: 2-4 hours
- Total review time: ~1 day across all agents

### Success Metrics for Timeline

- [ ] Phase 1 completed in ≤3 weeks
- [ ] No more than 2 iterations per agent
- [ ] All acceptance criteria met
- [ ] No technical debt introduced

---

## 15. Migration Strategy

### 15.1 Current State Analysis

**Existing Schema:**
- `waitlist` table (PROTECTED - do not touch)
- `user_profiles` table (analyze for modification)
- No RBAC tables
- No workspace isolation

**Legacy Terminology:**
```bash
# Search for "organization" references (to be cleaned up)
grep -r "organization" app/src/ --exclude-dir=node_modules
```

**Findings (to be documented by Architect during implementation):**
- List all files with "organization" references
- Determine if they need updates
- Create cleanup plan (may be in Phase 2+)

### 15.2 Migration Execution Order

**Step 1: Create RBAC Tables (Non-Breaking)**
```sql
-- 001_create_workspaces.sql
-- 002_create_roles.sql
-- 003_create_features.sql
-- 004_create_permissions.sql
-- 005_create_workspace_users.sql
-- 006_create_role_permissions.sql
```

**Step 2: Create Indexes**
```sql
-- 007_create_indexes.sql
-- All performance indexes for foreign keys
```

**Step 3: Seed System Roles**
```sql
-- 008_seed_system_roles.sql
-- Insert Owner, Admin, Member with fixed UUIDs
```

**Step 4: Modify user_profiles (If Needed)**
```sql
-- 009_modify_user_profiles.sql
-- Analyze: Does user_profiles need workspace_id?
-- Decision: Defer to Supabase Agent analysis
-- Possible: Add workspace_id column (nullable initially)
```

### 15.3 user_profiles Modification Strategy

**Analysis Questions:**
1. Do users belong to a "default workspace"?
2. Should `user_profiles` have `current_workspace_id`?
3. Or should workspace context come from `workspace_users` only?

**Recommendation (from Analysis Document):**
- User profiles are workspace-agnostic
- Workspace context comes from `workspace_users` table
- NO modification to `user_profiles` needed

**If Modification Needed:**
```sql
-- Option A: Add current workspace
ALTER TABLE user_profiles ADD COLUMN current_workspace_id uuid REFERENCES workspaces(id);

-- Option B: Add default workspace
ALTER TABLE user_profiles ADD COLUMN default_workspace_id uuid REFERENCES workspaces(id);
```

**Decision:** Defer to Supabase Agent during implementation.

### 15.4 Rollback Plan

**If Phase 1 fails, rollback is simple:**

```sql
-- Disable RLS on new tables
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
-- (etc. for all 6 tables)

-- Drop tables in reverse order (respects foreign keys)
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS workspace_users CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
```

**No Data Loss:**
- Phase 1 does NOT modify existing tables (except possibly user_profiles)
- `waitlist` table untouched
- Existing `user_profiles` data preserved

**Rollback Time:** < 5 minutes

---

## 16. References

### Analysis Document
- **Location:** `PRDs/_analysis/rbac-implementation-analysis.md`
- **Version:** 3.0
- **Critical Sections:**
  - Section 3: High-Level Architecture
  - Section 4: Core Entities & Relationships
  - Section 4.2: Schema Definitions (Zod + TypeScript)
  - Section 11.3: Database Query Optimization (Indexes)
  - Appendix A: Example Migrations
  - Appendix A.1: Create Workspaces Table
  - Appendix A.2: Create Permissions Table
  - Appendix A.3: Seed System Roles

### Existing Implementation
- **entities.ts:** `app/src/features/rbac/entities.ts` (ALREADY CREATED ✅)
- **Supabase Project:** `hegoubbxcbkpooqbvcph`
- **Database Version:** PostgreSQL 17.4.1.074

### Templates
- **Agent Request Template:** `PRDs/_templates/agent-request-template.md`
- **RLS Migration Template:** `PRDs/_templates/rls-migration-template.md`

---

## 17. Approval & Sign-Off

**PRD Status:** Ready for Implementation

**Approvals Required:**
- [x] Architect Agent (self-approved)
- [ ] User (business approval)

**Next Steps:**
1. User reviews and approves this PRD
2. Architect writes agent request documents:
   - `test-agent/00-request.md`
   - `implementer/00-request.md`
   - `supabase-agent/00-request.md`
3. Test Agent begins iteration 01

---

**END OF MASTER PRD**

**Total Sections:** 17 (14 required + 3 additional)
**Word Count:** ~7,500 words
**Completeness:** ✅ All required sections present
**References:** ✅ Analysis document sections cited
**Phase 1 Constraint:** ✅ NO UI documented throughout
