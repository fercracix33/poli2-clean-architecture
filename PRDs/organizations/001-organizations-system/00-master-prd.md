# Feature ID: organizations-001-multi-tenant-system
**Status**: 🔴 IMPLEMENTED BUT BLOCKED (RLS recursion issue)
**Created**: 2025-10-14
**Last Updated**: 2025-10-14
**Owner**: Architect Agent

---

## 1. Executive Summary

**Problem**: Organizations feature is fully implemented with excellent architecture but BLOCKED from production by a critical RLS policy recursion error that prevents organization creation.

**Current State**:
- ✅ Architecture: EXCELLENT (9.5/10 Clean Architecture compliance)
- ✅ Code Quality: 12 use cases, proper layer separation
- ✅ Security: XSS prevention, rate limiting, UUID validation
- ✅ i18n: Complete translations (en/es)
- ❌ Tests: 60/87 passing (27 failing due to mocking syntax issues)
- ❌ **CRITICAL BLOCKER**: RLS policy recursion prevents organization creation

**Impact**: Feature cannot be deployed to production. Users cannot create or join organizations. Multi-tenant system is non-functional.

---

## 2. Problem Statement

### Current State
The Organizations feature has been fully implemented following Clean Architecture principles. All 12 use cases have been developed, services are isolated in proper layers, and UI components have been refactored to remove direct database access. However, two critical issues prevent production deployment:

1. **RLS Recursion (CRITICAL BLOCKER)**: When a user attempts to create an organization, the system successfully creates the `organizations` record but fails when trying to add the creator as the first admin member. The RLS policy on `organization_members` creates an infinite recursion loop.

2. **Test Mocking Issues (MEDIUM)**: 27 tests are failing due to incorrect Vitest mocking syntax. Tests attempt to call `.mockResolvedValue()` directly on service functions instead of using `vi.mocked()` wrapper.

### Desired State
- Users can create organizations from the dashboard
- Creator is automatically added as admin member
- All 87 tests pass with >90% coverage
- Multi-tenant isolation is enforced via RLS policies
- Feature is production-ready

### User Pain Points
- **BLOCKING**: Cannot create organizations (error 42501 - RLS policy violation)
- **BLOCKING**: Cannot add first admin member to new organization
- Test failures create noise in CI/CD pipeline
- Development velocity slowed by inability to test organization features

---

## 3. Goals and Success Metrics

### Primary Goals
1. **Eliminate RLS recursion** that blocks organization creation
2. **Fix test mocking syntax** to achieve 100% test pass rate
3. **Maintain security** (multi-tenant isolation must remain intact)
4. **Enable production deployment** of organizations feature

### Success Metrics
- **Metric 1**: User can create organization successfully (0% success rate → 100%)
- **Metric 2**: Test pass rate (60/87 = 69% → 87/87 = 100%)
- **Metric 3**: Test coverage remains >90% for all layers
- **Metric 4**: RLS policies still enforce organization-level isolation
- **Metric 5**: Organization creation completes in <2 seconds

---

## 4. Current Implementation Review

### Architecture Assessment (9.5/10)

**Strengths:**
- ✅ Perfect Clean Architecture layer separation
- ✅ Pure entities with Zod schemas (no logic)
- ✅ Pure data services (no business logic)
- ✅ Business logic isolated in use cases
- ✅ Components use TanStack Query (no direct DB access)
- ✅ Proper dependency injection
- ✅ Clear interfaces between layers

**Implemented Features:**

#### ✅ 12 Use Cases (Complete)
1. `createOrganization` - Create org + assign creator as admin
2. `getUserOrganizations` - List user's organizations
3. `joinOrganization` - Join via invite code
4. `manageOrganizationMembers` - List members with pagination
5. `getUserPermissions` - Get user's permissions in org
6. `validateUserAccess` - Check user permissions
7. `getOrganizationDetails` - Get org info
8. `updateOrganizationDetails` - Update org name/description
9. `getOrganizationStats` - Get member counts
10. `regenerateInviteCode` - Generate new invite code
11. `leaveOrganization` - Member leaves org
12. `deleteOrganization` - Delete org (creator only)

#### ✅ Data Services (Complete)
- `organization.service.ts` - 23 pure CRUD functions
- Uses SECURITY DEFINER function for `getUserOrganizations` to avoid RLS recursion
- Proper error handling with Supabase error codes
- No business logic (pure data access)

#### ✅ UI Components (Complete)
- Dashboard with organization switcher
- Organization creation form
- Organization settings page
- Member management interface
- All components use TanStack Query
- Full i18n support (en/es)

#### ✅ Security Features
- XSS prevention (sanitization of names/descriptions)
- Rate limiting (5 org creations per hour per user)
- UUID validation on all inputs
- SQL injection prevention (parameterized queries)
- RLS policies for multi-tenant isolation

### Test Status (60/87 passing = 69%)

**Passing Tests (60 tests):**
- ✅ `leaveOrganization.test.ts` (11/11)
- ✅ `getOrganizationDetails.test.ts` (10/10)
- ✅ `updateOrganizationDetails.test.ts` (11/11)
- ✅ `deleteOrganization.test.ts` (12/12)
- ✅ `regenerateInviteCode.test.ts` (8/8)
- ✅ `getOrganizationStats.test.ts` (8/8)

**Failing Tests (27 tests):**
- ❌ `organization.test.ts` (8/9 failing) - Mock syntax error
- ❌ `organization-membership.test.ts` (9/9 failing) - Mock syntax error
- ❌ `roles-permissions.test.ts` (3/3 failing) - Mock syntax error
- ❌ `security-rls.test.ts` (6/6 failing) - Mock syntax error

---

## 5. Critical Issues Identified

### 🔴 Issue 1: RLS Recursion (CRITICAL - BLOCKING PRODUCTION)

**Severity**: CRITICAL
**Status**: BLOCKING
**Priority**: P0 (Must fix before any deployment)

#### Error Details

**Error Code**: `42501`
**Error Message**: `new row violates row-level security policy for table "organization_members"`

**Full Error Context:**
```typescript
{
  code: '42501',
  message: 'new row violates row-level security policy for table "organization_members"',
  details: null,
  hint: null
}
```

#### Reproduction Steps
1. User navigates to dashboard
2. User clicks "Create Organization"
3. User fills form: name, slug, description
4. User submits form
5. ✅ `organizations` record created successfully
6. ❌ System attempts to add creator as admin member
7. ❌ INSERT to `organization_members` fails with RLS violation

#### Root Cause Analysis

**The Problem**: Circular dependency in RLS policy checks

When executing `addUserToOrganizationInDB()`:

```typescript
// Step 1: Try to INSERT into organization_members
await supabase
  .from('organization_members')
  .insert({
    organization_id: organizationId,
    user_id: userId,
    role_id: adminRoleId,
  });

// Step 2: RLS policy on organization_members checks:
// "Does this user have permission to add members to this org?"

// Step 3: Permission check queries organization_members:
// "SELECT * FROM organization_members WHERE user_id = X AND organization_id = Y"

// Step 4: RECURSION!
// We're trying to INSERT into organization_members
// But RLS policy READS from organization_members to check permission
// But there are NO records yet (this is the FIRST member)
// So permission check fails → INSERT rejected
```

**Why This Happens:**

The RLS policy likely looks like this (speculative - needs verification):

```sql
-- RLS Policy on organization_members (INSERT)
CREATE POLICY "Users can add members if they have manage permission"
  ON organization_members
  FOR INSERT
  WITH CHECK (
    -- Check if the current user has "organization_manage_members" permission
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND om.organization_id = organization_members.organization_id
        AND p.name = 'organization_manage_members'
    )
  );
```

**The Chicken-and-Egg Problem:**
- To INSERT first member → RLS checks if user has permission
- To check permission → RLS queries organization_members
- But organization_members is EMPTY (this is the first member!)
- So permission check returns FALSE → INSERT fails

#### Potential Solutions

**Option A: SECURITY DEFINER Function** (RECOMMENDED)
- Create a `add_first_organization_member()` function with SECURITY DEFINER
- Function runs with elevated privileges (bypasses RLS)
- Function internally validates that org was just created by this user
- Only allows adding first member if `created_by = auth.uid()`

**Option B: Modify RLS Policy**
- Add exception to INSERT policy: "Allow if user is creator AND no members exist yet"
- Requires policy to check `created_by` in organizations table
- More complex policy logic

**Option C: Separate "Creators" Table**
- Create `organization_creators` table with simpler RLS
- No circular dependency
- Track ownership separately from membership

**Option D: Temporary Policy Disable**
- Use `BEGIN; SET LOCAL row_security = OFF; ... COMMIT;` (NOT RECOMMENDED - security risk)

#### Recommended Fix: Option A (SECURITY DEFINER)

```sql
-- Migration: Add SECURITY DEFINER function
CREATE OR REPLACE FUNCTION add_first_organization_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
  v_org_creator UUID;
  v_member_count INT;
  v_member_id UUID;
BEGIN
  -- Verify the organization was created by this user
  SELECT created_by INTO v_org_creator
  FROM organizations
  WHERE id = p_organization_id;

  IF v_org_creator IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  IF v_org_creator != p_user_id THEN
    RAISE EXCEPTION 'Only the creator can add the first member';
  END IF;

  -- Verify this is the FIRST member (no existing members)
  SELECT COUNT(*) INTO v_member_count
  FROM organization_members
  WHERE organization_id = p_organization_id;

  IF v_member_count > 0 THEN
    RAISE EXCEPTION 'Organization already has members. Use normal add_member flow.';
  END IF;

  -- Insert the first member (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO organization_members (organization_id, user_id, role_id)
  VALUES (p_organization_id, p_user_id, p_role_id)
  RETURNING id INTO v_member_id;

  RETURN v_member_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION add_first_organization_member TO authenticated;
```

**Service Implementation:**
```typescript
// In organization.service.ts
export async function addFirstOrganizationMemberInDB(
  organizationId: string,
  userId: string,
  roleId: string
): Promise<OrganizationMember> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .rpc('add_first_organization_member', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_role_id: roleId,
      });

    if (error) {
      console.error('Error adding first organization member:', error);
      throw new Error('Could not add first organization member.');
    }

    // Fetch the created member record
    const { data: member, error: fetchError } = await supabase
      .from('organization_members')
      .select()
      .eq('id', data)
      .single();

    if (fetchError) {
      throw new Error('Could not fetch created member.');
    }

    return member;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not add first organization member.');
  }
}
```

**Use Case Update:**
```typescript
// In createOrganization.ts
// Replace this:
await addUserToOrganizationInDB(organization.id, userId, adminRole.id);

// With this:
await addFirstOrganizationMemberInDB(organization.id, userId, adminRole.id);
```

---

### 🟡 Issue 2: Test Mocking Syntax (MEDIUM - NOT BLOCKING)

**Severity**: MEDIUM
**Status**: NON-BLOCKING (tests fail but don't prevent development)
**Priority**: P1 (Fix soon to restore CI/CD confidence)

#### Error Pattern

**Failing Tests**: 27 tests in 4 files

**Error Message**: `[Function name].mockResolvedValue is not a function`

**Root Cause**: Incorrect Vitest mocking syntax

#### Problem Code

```typescript
// ❌ WRONG - Current implementation
import * as authService from '../services/organization.service';

const isOrganizationSlugAvailable = vi.mocked(authService.isOrganizationSlugAvailable);

// Later in test:
isOrganizationSlugAvailable.mockResolvedValue(true); // ❌ FAILS
```

**Why It Fails:**
- `vi.mocked()` is called at module level (before mock is set up)
- At import time, `authService.isOrganizationSlugAvailable` is the REAL function
- `vi.mocked()` doesn't actually convert it to a mock
- Later calls to `.mockResolvedValue()` fail because it's not a mock

#### Correct Solution

```typescript
// ✅ CORRECT - Fixed implementation
import * as authService from '../services/organization.service';

// Don't call vi.mocked() at module level
// Instead, call it inside each test:

it('creates organization when slug is available', async () => {
  vi.mocked(authService.isOrganizationSlugAvailable).mockResolvedValue(true);
  vi.mocked(authService.createOrganizationInDB).mockResolvedValue(mockOrg);
  // ... rest of test
});
```

#### Files Requiring Fix

1. **`organization.test.ts`** (8 tests failing)
   - Lines 24-30: Remove module-level `vi.mocked()` calls
   - Lines 67, 89, 140, 154: Add `vi.mocked()` wrapper

2. **`organization-membership.test.ts`** (9 tests failing)
   - Similar pattern: wrap each mock call in `vi.mocked()`

3. **`roles-permissions.test.ts`** (3 tests failing)
   - Lines for `getUserPermissionsInOrganization` calls

4. **`security-rls.test.ts`** (6 tests failing)
   - Lines for service function mocks

#### Estimated Fix Time

- 1 hour (systematic find-replace across 4 files)
- Low risk (purely test infrastructure, no functional code changes)

---

## 6. Data Contracts (Current State)

**Location**: `app/src/features/organizations/entities.ts`

### 6.1 Organization Entity

```typescript
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Solo letras, números, espacios, guiones y guiones bajos"),
  slug: z.string()
    .min(2, "Identificador debe tener al menos 2 caracteres")
    .max(50, "Identificador no puede exceder 50 caracteres")
    .regex(/^[a-z0-9\-_]+$/, "Solo letras minúsculas, números, guiones y guiones bajos"),
  invite_code: z.string().length(8, "Código debe tener exactamente 8 caracteres"),
  description: z.string().max(500, "Descripción no puede exceder 500 caracteres").optional(),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

export const OrganizationCreateSchema = OrganizationSchema.omit({
  id: true,
  invite_code: true,
  created_by: true,
  created_at: true,
  updated_at: true,
});

export const OrganizationUpdateSchema = OrganizationSchema.pick({
  name: true,
  description: true,
}).partial();

export const OrganizationJoinSchema = z.object({
  slug: z.string().min(2).max(50),
  invite_code: z.string().length(8),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationUpdate = z.infer<typeof OrganizationUpdateSchema>;
export type OrganizationJoin = z.infer<typeof OrganizationJoinSchema>;
```

### 6.2 Organization Member Entity

```typescript
export const OrganizationMemberSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  joined_at: z.date(),
  invited_by: z.string().uuid().optional(),
});

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
```

### 6.3 Permission Entity

```typescript
export const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  resource: z.string().min(1).max(50), // "organization", "project", "task"
  action: z.string().min(1).max(50), // "create", "read", "update", "delete", "manage"
  created_at: z.date(),
});

export type Permission = z.infer<typeof PermissionSchema>;
```

### 6.4 Role Entity

```typescript
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organization_id: z.string().uuid().optional(), // null = system role
  is_system_role: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

export const RolePermissionSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
});

export type Role = z.infer<typeof RoleSchema>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
```

---

## 7. API Specifications (Current State)

### 7.1 POST /api/organizations

**Status**: ✅ Implemented, ❌ BLOCKED by RLS

**Purpose**: Create new organization

**Request**:
```typescript
{
  body: OrganizationCreateSchema
}
```

**Current Response** (FAILING):
```typescript
// 500 Internal Server Error
{
  error: {
    code: '42501',
    message: 'new row violates row-level security policy for table "organization_members"'
  }
}
```

**Expected Response** (after fix):
```typescript
// 201 Created
{
  data: Organization
}

// 400 Bad Request
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: ZodError
  }
}

// 409 Conflict
{
  error: {
    code: 'DUPLICATE_SLUG',
    message: 'Organization identifier already exists'
  }
}
```

### 7.2 GET /api/organizations/me

**Status**: ✅ Implemented and working

**Purpose**: Get current user's organizations

**Response**:
```typescript
// 200 OK
{
  data: Organization[]
}
```

### 7.3 POST /api/organizations/join

**Status**: ✅ Implemented and working

**Purpose**: Join organization via invite code

**Request**:
```typescript
{
  body: OrganizationJoinSchema
}
```

**Response**:
```typescript
// 200 OK
{
  data: OrganizationMember
}

// 404 Not Found
{
  error: {
    code: 'INVALID_INVITE',
    message: 'Invalid organization or invite code'
  }
}
```

---

## 8. Technical Architecture

### 8.1 Database Schema (Current State)

**Tables** (all implemented in Supabase):

```sql
-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  invite_code VARCHAR(8) NOT NULL UNIQUE,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(organization_id, user_id)
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, organization_id)
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Role permissions junction table
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

**Indexes**:
```sql
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_invite_code ON organizations(invite_code);
CREATE INDEX idx_roles_org_id ON roles(organization_id);
```

### 8.2 Row Level Security (RLS) Policies (Current State)

**CRITICAL**: These policies contain the recursion bug.

**Assumptions** (policies need to be inspected via Supabase MCP):

```sql
-- Organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they are members of
CREATE POLICY "Users can view own organizations"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Users can create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Organization members table (RECURSION BUG IS HERE)
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ❌ THIS POLICY CAUSES RECURSION
CREATE POLICY "Users can view organization members if they are members"
  ON organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ❌ THIS POLICY LIKELY CAUSES THE INSERT RECURSION
CREATE POLICY "Users with manage permission can add members"
  ON organization_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND om.organization_id = organization_members.organization_id
        AND p.name = 'organization_manage_members'
    )
  );
```

**The Problem**: The INSERT policy queries `organization_members` while trying to INSERT into `organization_members` → infinite recursion when table is empty.

---

## 9. Remediation Plan

### Phase 1: Fix Test Mocking (PARALLEL - Test Agent)

**Priority**: MEDIUM
**Agent**: Test Agent
**Time Estimate**: 1 hour
**Blocking**: NO (can run in parallel with Phase 2)

**Tasks**:
1. Update `organization.test.ts`:
   - Remove module-level `vi.mocked()` assignments
   - Wrap each mock call in `vi.mocked()` inside test blocks
   - Verify all 9 tests pass

2. Update `organization-membership.test.ts`:
   - Same pattern as above
   - Verify all 9 tests pass

3. Update `roles-permissions.test.ts`:
   - Same pattern
   - Verify all 3 tests pass

4. Update `security-rls.test.ts`:
   - Same pattern
   - Verify all 6 tests pass

5. Run full test suite:
   - Expected: 87/87 tests passing
   - Coverage should remain >90%

**Success Criteria**:
- [ ] All 87 tests passing
- [ ] No mocking errors in console
- [ ] Test coverage >90%
- [ ] CI/CD pipeline green

---

### Phase 2: Fix RLS Recursion (CRITICAL - Supabase Agent)

**Priority**: CRITICAL
**Agent**: Supabase Agent
**Time Estimate**: 2-3 hours
**Blocking**: YES (prevents organization creation)

**Step 1: Use Supabase MCP to Inspect Policies** (30 min)

```typescript
// Query all RLS policies on organizations table
supabase.execute_sql({
  query: `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('organizations', 'organization_members', 'roles', 'permissions', 'role_permissions')
    ORDER BY tablename, policyname;
  `
});

// Check for SECURITY DEFINER functions
supabase.execute_sql({
  query: `
    SELECT routine_name, routine_type, security_type
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND security_type = 'DEFINER';
  `
});

// Verify which policy is causing the recursion
// Look for INSERT policies on organization_members that query organization_members
```

**Step 2: Research Supabase RLS Best Practices** (30 min)

```typescript
// Use Context7 MCP to get latest patterns
context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "row level security circular dependencies multi-tenant",
  tokens: 3000
});

context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "security definer functions rls bypass",
  tokens: 3000
});

context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "organization membership first member pattern",
  tokens: 2000
});
```

**Step 3: Identify Root Cause Policy** (15 min)

Expected findings:
- Policy name: "Users with manage permission can add members" (or similar)
- Problem: WITH CHECK clause queries `organization_members` while INSERTing
- Trigger condition: First member insertion (table empty)

**Step 4: Implement SECURITY DEFINER Solution** (1 hour)

Create migration file:
```sql
-- Migration: 20251014_fix_rls_recursion.sql

-- Create SECURITY DEFINER function to add first member
CREATE OR REPLACE FUNCTION add_first_organization_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_creator UUID;
  v_member_count INT;
  v_member_id UUID;
BEGIN
  -- Verify organization exists and was created by this user
  SELECT created_by INTO v_org_creator
  FROM organizations
  WHERE id = p_organization_id;

  IF v_org_creator IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  IF v_org_creator != p_user_id THEN
    RAISE EXCEPTION 'Only the creator can add the first member';
  END IF;

  -- Verify this is the FIRST member
  SELECT COUNT(*) INTO v_member_count
  FROM organization_members
  WHERE organization_id = p_organization_id;

  IF v_member_count > 0 THEN
    RAISE EXCEPTION 'Organization already has members';
  END IF;

  -- Insert first member (bypasses RLS)
  INSERT INTO organization_members (organization_id, user_id, role_id)
  VALUES (p_organization_id, p_user_id, p_role_id)
  RETURNING id INTO v_member_id;

  RETURN v_member_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_first_organization_member TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION add_first_organization_member IS
  'Adds the first member (creator) to an organization, bypassing RLS to avoid circular dependency. Only callable by organization creator.';
```

**Step 5: Update Service Layer** (30 min)

```typescript
// Add to organization.service.ts

/**
 * Add first organization member (creator as admin)
 * Uses SECURITY DEFINER function to bypass RLS recursion
 */
export async function addFirstOrganizationMemberInDB(
  organizationId: string,
  userId: string,
  roleId: string
): Promise<OrganizationMember> {
  const supabase = await createClient();

  try {
    const { data: memberId, error } = await supabase
      .rpc('add_first_organization_member', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_role_id: roleId,
      });

    if (error) {
      console.error('Error adding first organization member:', error);
      throw new Error('Could not add first organization member.');
    }

    // Fetch the created member record
    const { data: member, error: fetchError } = await supabase
      .from('organization_members')
      .select()
      .eq('id', memberId)
      .single();

    if (fetchError) {
      throw new Error('Could not fetch created member.');
    }

    return member;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not add first organization member.');
  }
}
```

**Step 6: Update Use Case** (15 min)

```typescript
// In createOrganization.ts, line 80
// Replace:
await addUserToOrganizationInDB(organization.id, userId, adminRole.id);

// With:
await addFirstOrganizationMemberInDB(organization.id, userId, adminRole.id);
```

**Step 7: Test Organization Creation** (30 min)

Manual testing:
1. Start dev server
2. Login to dashboard
3. Click "Create Organization"
4. Fill form: name="Test Org", slug="test-org", description="Testing"
5. Submit form
6. Expected: Success! Organization created and user is admin member
7. Verify in Supabase UI:
   - `organizations` table has new record
   - `organization_members` table has new record
   - No errors in logs

Automated testing:
```bash
cd app
npm test -- --run createOrganization
# Expected: All tests pass
```

**Success Criteria**:
- [ ] User can create organization from dashboard
- [ ] Creator is automatically added as admin member
- [ ] No RLS policy violations in logs
- [ ] Multi-tenant isolation still enforced:
  - [ ] User A cannot see User B's organizations
  - [ ] User A cannot modify User B's organization members
- [ ] SECURITY DEFINER function only allows creator to add first member
- [ ] Function rejects attempts to add members after first member exists

---

## 10. Acceptance Criteria

### Phase 1 Complete When:
- [ ] All 27 failing tests now pass
- [ ] Total test pass rate: 87/87 (100%)
- [ ] Test coverage remains >90%
- [ ] No mocking errors in CI/CD pipeline
- [ ] No changes to functional code (tests only)

### Phase 2 Complete When:
- [ ] User can create organization from dashboard form
- [ ] Creator is automatically added as admin member with admin role
- [ ] No RLS policy violations (error 42501) in logs
- [ ] Multi-tenant isolation still enforced (security verification):
  - [ ] User in Org A cannot see Org B's data
  - [ ] User in Org A cannot modify Org B's members
  - [ ] RLS policies still block unauthorized access
- [ ] SECURITY DEFINER function validates creator:
  - [ ] Only creator can call function for their org
  - [ ] Function rejects non-creators
  - [ ] Function rejects if members already exist
- [ ] Organization creation completes in <2 seconds
- [ ] Logs show successful member addition

### Feature Production-Ready When:
- [ ] Both Phase 1 AND Phase 2 complete
- [ ] E2E tests pass:
  - [ ] Create organization flow
  - [ ] Join organization flow
  - [ ] Member management flow
- [ ] Lighthouse audit >90 for dashboard page
- [ ] No console errors in browser
- [ ] i18n working for both en/es locales
- [ ] Security review passed:
  - [ ] XSS prevention verified
  - [ ] Rate limiting functional
  - [ ] UUID validation enforced
  - [ ] RLS policies enforce isolation

---

## 11. Testing Strategy

### 11.1 Unit Tests (Vitest)

**Current Status**: 60/87 passing

**Post-Fix Target**: 87/87 passing (100%)

**Test Coverage**:
- ✅ Entities: Zod schema validation
- ✅ Use Cases: Business logic with mocked services (POST-FIX)
- ✅ Services: Data layer tests with mocked Supabase (POST-FIX)
- ✅ API Routes: Endpoint tests

**Files**:
- `entities.test.ts` - N/A (entities have no tests, only schemas)
- `organization.test.ts` - 9 tests (8 failing → 0 failing)
- `organization-membership.test.ts` - 9 tests (9 failing → 0 failing)
- `roles-permissions.test.ts` - 3 tests (3 failing → 0 failing)
- `security-rls.test.ts` - 6 tests (6 failing → 0 failing)
- `getOrganizationDetails.test.ts` - 10 tests (passing ✅)
- `updateOrganizationDetails.test.ts` - 11 tests (passing ✅)
- `deleteOrganization.test.ts` - 12 tests (passing ✅)
- `leaveOrganization.test.ts` - 11 tests (passing ✅)
- `regenerateInviteCode.test.ts` - 8 tests (passing ✅)
- `getOrganizationStats.test.ts` - 8 tests (passing ✅)

### 11.2 Integration Tests

**Status**: ⏳ Pending (blocked by RLS issue)

**Required Tests**:
- [ ] Create organization + add member (full flow)
- [ ] Join organization with valid invite code
- [ ] Reject invalid invite codes
- [ ] Verify multi-tenant isolation

### 11.3 E2E Tests (Playwright)

**Status**: ⏳ Pending (blocked by RLS issue)

**Required Tests**:
- [ ] User creates organization from dashboard
- [ ] User joins organization via invite code
- [ ] Admin manages organization members
- [ ] User leaves organization
- [ ] Admin deletes organization

**Files**:
- `tests/e2e/organizations/organization-dashboard.spec.ts` (created, not run)
- `tests/e2e/organizations/organization-members.spec.ts` (created, not run)
- `tests/e2e/organizations/organization-navigation.spec.ts` (created, not run)
- `tests/e2e/organizations/organization-settings.spec.ts` (created, not run)

---

## 12. Security Considerations

### 12.1 Authentication
- ✅ All endpoints require Supabase Auth
- ✅ JWT tokens validated on each request
- ✅ auth.uid() used in RLS policies

### 12.2 Authorization
- ✅ Row Level Security (RLS) enforces data isolation
- ✅ Organization-level access control
- ❌ **CRITICAL BUG**: RLS recursion prevents organization creation
- ✅ Permission-based actions (manage members, update org, etc.)

### 12.3 Input Validation
- ✅ All inputs validated with Zod schemas
- ✅ XSS prevention via sanitization:
  - Organization names: regex validation
  - Descriptions: `<` and `>` encoded
  - Slugs: lowercase alphanumeric only
- ✅ SQL injection prevention: parameterized queries
- ✅ UUID validation on all ID inputs

### 12.4 Rate Limiting
- ✅ Organization creation: 5 per hour per user
- ✅ Implemented in use case layer
- ⚠️ **TODO**: Add rate limiting to API routes (Express middleware)

### 12.5 Security Definer Function Risks

**Risk**: SECURITY DEFINER functions bypass RLS (elevated privileges)

**Mitigation**:
- ✅ Function validates creator ownership
- ✅ Function only works for FIRST member (count check)
- ✅ Function rejects non-creators
- ✅ SET search_path = public (prevents schema injection)
- ✅ GRANT EXECUTE only to authenticated users
- ⚠️ **TODO**: Add audit logging for SECURITY DEFINER calls

---

## 13. Dependencies & Prerequisites

### Technical Dependencies
- ✅ Supabase database access (working)
- ✅ Existing `auth.users` table (working)
- ✅ System roles (`organization_admin`, `organization_member`) (working)
- ✅ shadcn/ui components installed (working)
- ✅ TanStack Query configured (working)
- ✅ i18n setup (en/es) (working)

### Agent Dependencies

1. **Test Agent** (Phase 1 - PARALLEL)
   - Task: Fix 27 failing tests
   - Input: PRD Section 5 (Issue 2: Test Mocking)
   - Output: 87/87 tests passing
   - Blocks: Nothing (runs in parallel)

2. **Supabase Agent** (Phase 2 - CRITICAL PATH)
   - Task: Fix RLS recursion
   - Input: PRD Section 5 (Issue 1: RLS Recursion)
   - MCPs Required: Supabase MCP, Context7 MCP
   - Output: SECURITY DEFINER function + updated service + working org creation
   - Blocks: Production deployment

3. **UI/UX Agent** (Phase 3 - AFTER PHASE 2)
   - Task: Run E2E tests
   - Input: Working organization creation
   - Output: Passing E2E test suite
   - Blocks: Production deployment

---

## 14. Timeline Estimate

- **Test Agent** (Phase 1): 1 hour (parallel)
- **Supabase Agent** (Phase 2): 2-3 hours (critical path)
  - Inspect policies: 30 min
  - Research solutions: 30 min
  - Implement SECURITY DEFINER: 1 hour
  - Update service layer: 30 min
  - Update use case: 15 min
  - Test & verify: 30 min
- **UI/UX Agent** (Phase 3): 1-2 hours (after Phase 2)
  - Run E2E tests
  - Fix any UI issues

**Total Estimate**: 3-4 hours (critical path)

**Critical Path**: Supabase Agent must complete before UI/UX Agent

---

## 15. Out of Scope

**Explicitly NOT included in this remediation:**

- ❌ Adding new organization features (profile pictures, billing, etc.)
- ❌ Implementing project-level permissions (future feature)
- ❌ Organization analytics dashboard
- ❌ Bulk member import
- ❌ Custom role creation (only system roles supported)
- ❌ Organization templates
- ❌ SSO integration
- ❌ Audit log UI (logging exists, UI does not)

---

## 16. Reference Files

### Key Implementation Files

**Entities:**
- `app/src/features/organizations/entities.ts` (Zod schemas, types)

**Use Cases:**
- `app/src/features/organizations/use-cases/createOrganization.ts` ⚠️ Needs update (line 80)
- `app/src/features/organizations/use-cases/joinOrganization.ts` ✅
- `app/src/features/organizations/use-cases/getUserOrganizations.ts` ✅
- `app/src/features/organizations/use-cases/manageOrganizationMembers.ts` ✅
- `app/src/features/organizations/use-cases/getUserPermissions.ts` ✅
- `app/src/features/organizations/use-cases/validateUserAccess.ts` ✅
- `app/src/features/organizations/use-cases/getOrganizationDetails.ts` ✅
- `app/src/features/organizations/use-cases/updateOrganizationDetails.ts` ✅
- `app/src/features/organizations/use-cases/getOrganizationStats.ts` ✅
- `app/src/features/organizations/use-cases/regenerateInviteCode.ts` ✅
- `app/src/features/organizations/use-cases/leaveOrganization.ts` ✅
- `app/src/features/organizations/use-cases/deleteOrganization.ts` ✅

**Services:**
- `app/src/features/organizations/services/organization.service.ts` ⚠️ Needs new function

**API Routes:**
- `app/src/app/api/organizations/route.ts` (POST, GET)
- `app/src/app/api/organizations/me/route.ts` (GET)
- `app/src/app/api/organizations/join/route.ts` (POST)

**UI Components:**
- `app/src/components/organizations/CreateOrganizationForm.tsx`
- `app/src/app/(main)/org/page.tsx` (organization selection)
- `app/src/app/(main)/dashboard/page.tsx` (dashboard with org context)
- `app/src/components/layout/GlobalHeader.tsx` (org switcher)

**Tests:**
- `app/src/features/organizations/use-cases/organization.test.ts` ⚠️ Needs fix
- `app/src/features/organizations/use-cases/organization-membership.test.ts` ⚠️ Needs fix
- `app/src/features/organizations/use-cases/roles-permissions.test.ts` ⚠️ Needs fix
- `app/src/features/organizations/use-cases/security-rls.test.ts` ⚠️ Needs fix

---

## 17. Agent Handoff Instructions

### For Test Agent (Phase 1 - PARALLEL)

**Status**: ⏳ READY TO START

**Context**: Read PRD Section 5 (Issue 2: Test Mocking Syntax)

**Your Task**: Fix 27 failing tests by correcting Vitest mocking syntax

**Files to Modify** (4 files):
1. `app/src/features/organizations/use-cases/organization.test.ts`
2. `app/src/features/organizations/use-cases/organization-membership.test.ts`
3. `app/src/features/organizations/use-cases/roles-permissions.test.ts`
4. `app/src/features/organizations/use-cases/security-rls.test.ts`

**Pattern to Fix**:
```typescript
// ❌ REMOVE module-level vi.mocked() assignments
const isOrganizationSlugAvailable = vi.mocked(authService.isOrganizationSlugAvailable);

// ✅ ADD vi.mocked() wrapper inside each test
it('test name', async () => {
  vi.mocked(authService.isOrganizationSlugAvailable).mockResolvedValue(true);
  // ... rest of test
});
```

**Steps**:
1. Read test file
2. Identify module-level mock assignments (lines 24-30 typically)
3. Remove those assignments
4. Find each `.mockResolvedValue()` or `.mockRejectedValue()` call
5. Wrap the function reference in `vi.mocked()`
6. Run tests: `npm test -- --run [filename]`
7. Verify all tests pass
8. Move to next file

**Verification**:
```bash
cd app
npm test -- --run organizations
# Expected: 87/87 tests passing
```

**Success Criteria**:
- [ ] `organization.test.ts`: 9/9 tests passing
- [ ] `organization-membership.test.ts`: 9/9 tests passing
- [ ] `roles-permissions.test.ts`: 3/3 tests passing
- [ ] `security-rls.test.ts`: 6/6 tests passing
- [ ] No console errors
- [ ] Coverage remains >90%

**After Completion**:
- Update `_status.md` with Phase 1 complete
- Notify human that tests are fixed

---

### For Supabase Agent (Phase 2 - CRITICAL PATH)

**Status**: ⏳ READY TO START

**Context**: Read PRD Section 5 (Issue 1: RLS Recursion)

**Your Task**: Fix RLS policy recursion that prevents organization creation

**Problem Summary**:
When creating an organization, the system successfully creates the `organizations` record but fails when trying to add the creator as the first admin member. Error: `new row violates row-level security policy for table "organization_members"` (code 42501).

**Root Cause**: RLS policy on `organization_members` checks if user has permission by querying `organization_members`. This creates circular dependency when table is empty (first member insertion).

**Required MCPs**:
1. **Supabase MCP**: Inspect current RLS policies
2. **Context7 MCP**: Research Supabase RLS best practices

**Step-by-Step Plan**:

**Step 1: Inspect RLS Policies** (30 min)

Use Supabase MCP to query all RLS policies:

```typescript
// Query RLS policies on all organization tables
supabase.execute_sql({
  query: `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('organizations', 'organization_members', 'roles', 'permissions', 'role_permissions')
    ORDER BY tablename, policyname;
  `
});

// Check for existing SECURITY DEFINER functions
supabase.execute_sql({
  query: `
    SELECT routine_name, routine_type, security_type
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
    ORDER BY routine_name;
  `
});
```

Document findings:
- Which policy on `organization_members` handles INSERT?
- Does it query `organization_members` in WITH CHECK clause?
- Are there existing SECURITY DEFINER functions?

**Step 2: Research Solutions** (30 min)

Use Context7 MCP to research best practices:

```typescript
context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "row level security circular dependencies avoiding recursion",
  tokens: 3000
});

context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "security definer functions bypass rls postgres",
  tokens: 3000
});
```

Evaluate solutions:
- SECURITY DEFINER function (recommended)
- Policy modification (complex, risky)
- Separate creators table (requires schema change)

**Step 3: Implement SECURITY DEFINER Function** (1 hour)

Create migration file: `supabase/migrations/20251014_fix_rls_recursion.sql`

```sql
-- Function to add first organization member (bypasses RLS)
CREATE OR REPLACE FUNCTION add_first_organization_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_creator UUID;
  v_member_count INT;
  v_member_id UUID;
BEGIN
  -- Verify organization exists and was created by this user
  SELECT created_by INTO v_org_creator
  FROM organizations
  WHERE id = p_organization_id;

  IF v_org_creator IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  IF v_org_creator != p_user_id THEN
    RAISE EXCEPTION 'Only the creator can add the first member';
  END IF;

  -- Verify this is the FIRST member (no existing members)
  SELECT COUNT(*) INTO v_member_count
  FROM organization_members
  WHERE organization_id = p_organization_id;

  IF v_member_count > 0 THEN
    RAISE EXCEPTION 'Organization already has members. Use normal add_member flow.';
  END IF;

  -- Insert first member (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO organization_members (organization_id, user_id, role_id)
  VALUES (p_organization_id, p_user_id, p_role_id)
  RETURNING id INTO v_member_id;

  RETURN v_member_id;
END;
$$;

GRANT EXECUTE ON FUNCTION add_first_organization_member TO authenticated;

COMMENT ON FUNCTION add_first_organization_member IS
  'Adds the first member (creator) to an organization, bypassing RLS to avoid circular dependency. Only callable by organization creator when no members exist yet.';
```

Apply migration via Supabase dashboard or CLI.

**Step 4: Update Service Layer** (30 min)

Add new function to `app/src/features/organizations/services/organization.service.ts`:

```typescript
/**
 * Add first organization member (creator as admin)
 * Uses SECURITY DEFINER function to bypass RLS recursion
 */
export async function addFirstOrganizationMemberInDB(
  organizationId: string,
  userId: string,
  roleId: string
): Promise<OrganizationMember> {
  const supabase = await createClient();

  try {
    const { data: memberId, error } = await supabase
      .rpc('add_first_organization_member', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_role_id: roleId,
      });

    if (error) {
      console.error('Error adding first organization member:', error);
      throw new Error('Could not add first organization member.');
    }

    // Fetch the created member record
    const { data: member, error: fetchError } = await supabase
      .from('organization_members')
      .select()
      .eq('id', memberId)
      .single();

    if (fetchError) {
      throw new Error('Could not fetch created member.');
    }

    return member;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not add first organization member.');
  }
}
```

**Step 5: Update Use Case** (15 min)

Modify `app/src/features/organizations/use-cases/createOrganization.ts`:

```typescript
// Line 1: Add import
import {
  createOrganizationInDB,
  isOrganizationSlugAvailable,
  getRoleByNameFromDB,
  addFirstOrganizationMemberInDB  // ← ADD THIS
} from '../services/organization.service';

// Line 80: Replace function call
// BEFORE:
await addUserToOrganizationInDB(organization.id, userId, adminRole.id);

// AFTER:
await addFirstOrganizationMemberInDB(organization.id, userId, adminRole.id);
```

**Step 6: Test Organization Creation** (30 min)

**Manual Testing**:
1. Start dev server: `npm run dev`
2. Login to dashboard
3. Navigate to organization selection page
4. Click "Create Organization"
5. Fill form:
   - Name: "Test Organization"
   - Slug: "test-org"
   - Description: "Testing RLS fix"
6. Submit form
7. **Expected**: Success! Redirected to dashboard
8. **Verify in Supabase UI**:
   - `organizations` table has new record with your user_id as created_by
   - `organization_members` table has new record linking you to org with admin role
   - No errors in browser console
   - No errors in server logs

**Automated Testing**:
```bash
cd app
npm test -- --run createOrganization
# Expected: All tests pass (may need to update test to use new function)
```

**Security Verification**:
Test that multi-tenant isolation still works:
1. Create org as User A
2. Login as User B (different account)
3. Try to view User A's organization
4. **Expected**: 403 Forbidden or empty list (RLS blocks access)

**Step 7: Document & Handoff** (15 min)

Update `_status.md`:
- Phase 2: ✅ COMPLETE
- Document solution implemented (SECURITY DEFINER)
- Note any gotchas or edge cases discovered

**Success Criteria**:
- [ ] User can create organization from dashboard
- [ ] Creator is automatically added as admin member
- [ ] No RLS policy violations (error 42501) in logs
- [ ] Multi-tenant isolation still enforced (User A cannot see User B's orgs)
- [ ] SECURITY DEFINER function validates:
  - [ ] Only creator can call function
  - [ ] Only works when organization has 0 members
  - [ ] Rejects non-creators with clear error
- [ ] Organization creation completes in <2 seconds
- [ ] Tests still pass (may need minor updates)

**After Completion**:
- Update `_status.md` with Phase 2 complete
- Notify Architect Agent that RLS recursion is fixed
- Prepare for UI/UX Agent to run E2E tests

---

## Appendix A: References

- **Project Rules**: `.trae/rules/project_rules.md`
- **CLAUDE.md**: Root directory
- **PRD Templates**: `PRDs/_templates/`
- **Architecture Review**: (referenced in user's message - architecture scored 9.5/10)
- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **Vitest Mocking Docs**: https://vitest.dev/api/vi.html#vi-mocked

---

## Appendix B: Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-14 | Architect Agent | Initial PRD creation - retroactive documentation of implemented feature |
| 2025-10-14 | Architect Agent | Documented critical RLS recursion bug (error 42501) |
| 2025-10-14 | Architect Agent | Documented test mocking syntax issues (27 failing tests) |
| 2025-10-14 | Architect Agent | Proposed SECURITY DEFINER solution for RLS recursion |
| 2025-10-14 | Architect Agent | Created detailed agent handoff instructions for Test Agent and Supabase Agent |

---

## Appendix C: Error Logs

**RLS Recursion Error** (from production attempt):

```json
{
  "code": "42501",
  "message": "new row violates row-level security policy for table \"organization_members\"",
  "details": null,
  "hint": null
}
```

**Test Mocking Error** (from CI/CD):

```
Error: isOrganizationSlugAvailable.mockResolvedValue is not a function
    at Object.<anonymous> (organization.test.ts:67:38)
```

---

**END OF PRD**
