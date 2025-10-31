# Supabase RLS Patterns for Multi-Tenant Applications

Row Level Security (RLS) policy patterns for organization-based multi-tenancy, based on latest Supabase best practices from Context7.

---

## Core Principles

### 1. RLS is MANDATORY

**ALL tables MUST have RLS enabled:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**Why**:
- Without RLS, data is accessible to all authenticated users
- RLS enforces data isolation at the database level
- Provides defense-in-depth security

### 2. Multi-Tenant Isolation Pattern

**This project uses ORGANIZATION-BASED multi-tenancy:**

Every table with user data must include:
```sql
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
```

**Pattern**: Users can only access data from organizations they belong to.

### 3. Performance-First Design

**ALWAYS specify the target role** in policies:
```sql
CREATE POLICY "policy_name" ON table_name
  TO authenticated  -- ← CRITICAL: Specify role
  USING (...);
```

**Why**:
- Prevents unnecessary policy evaluation for `anon` users
- Improves query performance
- Makes security boundaries explicit

---

## Standard RLS Policy Set

### Enable RLS (Always First)

```sql
-- Step 1: Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Policy 1: SELECT (Read Access)

**Pattern**: Users can view records from their organizations

```sql
CREATE POLICY "Users can view own organization records"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

**Key components**:
- `FOR SELECT`: Only applies to read operations
- `TO authenticated`: Only authenticated users
- `auth.uid()`: Gets current user's ID from JWT
- Subquery checks user's organization membership

### Policy 2: INSERT (Create Access)

**Pattern**: Users can create records for their organizations

```sql
CREATE POLICY "Users can create records for own organization"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

**Difference from SELECT**:
- Uses `WITH CHECK` instead of `USING`
- `WITH CHECK`: Validates data BEING inserted
- `USING`: Validates data ALREADY in table

### Policy 3: UPDATE (Modify Access)

**Pattern**: Users can update their own records

```sql
CREATE POLICY "Users can update own records"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

**Two clauses**:
- `USING`: Can UPDATE records where `user_id = auth.uid()`
- `WITH CHECK`: Updated data must still satisfy `user_id = auth.uid()`

**Why both**:
- `USING`: "Can I modify this row?"
- `WITH CHECK`: "Is the new data still valid for me?"

### Policy 4: DELETE (Remove Access)

**Pattern**: Users can delete their own records

```sql
CREATE POLICY "Users can delete own records"
  ON table_name
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

**Note**: DELETE only uses `USING`, no `WITH CHECK`

---

## Advanced RLS Patterns

### Pattern 1: Role-Based Access

**Use case**: Admins can modify all org records, members only their own

```sql
-- SELECT: All org members can view
CREATE POLICY "Members can view org records"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Admins can update any, members only own
CREATE POLICY "Admins can update any, members update own"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING (
    -- Can update if: admin of org OR owner of record
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
    OR user_id = auth.uid()
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
    OR user_id = auth.uid()
  );
```

### Pattern 2: Public Read, Authenticated Write

**Use case**: Anyone can read, only authenticated users can write

```sql
-- Public read access
CREATE POLICY "Public records viewable by everyone"
  ON table_name
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated users can create"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Pattern 3: Restricted Delete (Creator Only)

**Use case**: Only the creator can delete, regardless of org membership

```sql
CREATE POLICY "Creator can delete own records"
  ON table_name
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
```

**Note**: Uses `created_by` instead of `user_id` for audit trail

### Pattern 4: Conditional Access Based on Status

**Use case**: Users can only modify non-archived records

```sql
CREATE POLICY "Users can update non-archived records"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status != 'archived'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status != 'archived'
  );
```

### Pattern 5: Using JWT Metadata

**Use case**: Access based on team membership stored in JWT

```sql
CREATE POLICY "User is in team"
  ON table_name
  TO authenticated
  USING (
    team_id IN (
      SELECT jsonb_array_elements_text(
        auth.jwt() -> 'app_metadata' -> 'teams'
      )::uuid
    )
  );
```

**When to use**:
- Team/role data stored in JWT `app_metadata`
- Avoid additional database queries
- Data doesn't change frequently

**⚠️ Warning**: `app_metadata` cannot be modified by users (secure)

---

## Performance Optimization Patterns

### Pattern 1: Security Definer Functions

**Problem**: Complex subqueries in RLS policies can be slow

**Solution**: Use `SECURITY DEFINER` functions to bypass RLS on joined tables

```sql
-- Create helper function
CREATE OR REPLACE FUNCTION has_org_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
      AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policy
CREATE POLICY "Users can view org records"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (has_org_access(organization_id));
```

**Benefits**:
- Single function call instead of repeated subqueries
- Bypasses RLS on `user_organizations` table
- Can be cached by Postgres

**⚠️ Security**: Function runs with owner's privileges, ensure it's secure!

### Pattern 2: Subquery Optimization

**❌ Slow pattern**:
```sql
USING (
  auth.uid() = user_id  -- Executes for every row
)
```

**✅ Optimized pattern**:
```sql
USING (
  (SELECT auth.uid()) = user_id  -- Executes once, cached
)
```

**Why**:
- Wrapping in `SELECT` allows Postgres to cache result
- Especially important for `auth.uid()` and `auth.jwt()`

### Pattern 3: Use Arrays Instead of Subqueries

**❌ Slower**:
```sql
USING (
  team_id IN (SELECT get_user_teams())
)
```

**✅ Faster**:
```sql
USING (
  team_id = ANY(ARRAY(SELECT get_user_teams()))
)
```

**Why**:
- `ANY(ARRAY(...))` is more efficient for `IN` operations
- Postgres optimizes array comparisons better

---

## Project-Specific RLS Templates

### Template 1: Standard Multi-Tenant Table

**For tables with organization_id and user_id:**

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT: View records from user's organizations
CREATE POLICY "Users can view own organization records"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- INSERT: Create records for user's organizations
CREATE POLICY "Users can create records for own organization"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- UPDATE: Modify own records
CREATE POLICY "Users can update own records"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- DELETE: Remove own records
CREATE POLICY "Users can delete own records"
  ON table_name
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

### Template 2: Org-Wide Resource (No User Ownership)

**For tables without user_id (org settings, etc.):**

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- All org members can view
CREATE POLICY "Org members can view settings"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Only admins can modify
CREATE POLICY "Admins can modify settings"
  ON table_name
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
        AND role = 'admin'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
        AND role = 'admin'
    )
  );
```

### Template 3: Public Read, Org Write

**For tables like public profiles, team pages:**

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Anyone can read (including anon)
CREATE POLICY "Profiles are publicly readable"
  ON table_name
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only org members can create
CREATE POLICY "Org members can create"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Only owner can modify
CREATE POLICY "Owner can modify"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

---

## Testing RLS Policies

### Test Setup

```sql
-- Create test users
INSERT INTO auth.users (id, email) VALUES
  ('user-1-uuid', 'user1@example.com'),
  ('user-2-uuid', 'user2@example.com');

-- Create test organizations
INSERT INTO organizations (id, name) VALUES
  ('org-1-uuid', 'Organization 1'),
  ('org-2-uuid', 'Organization 2');

-- Assign users to orgs
INSERT INTO user_organizations (user_id, organization_id, role) VALUES
  ('user-1-uuid', 'org-1-uuid', 'admin'),
  ('user-2-uuid', 'org-2-uuid', 'member');

-- Create test data
INSERT INTO table_name (id, user_id, organization_id, data) VALUES
  ('record-1', 'user-1-uuid', 'org-1-uuid', 'Data 1'),
  ('record-2', 'user-2-uuid', 'org-2-uuid', 'Data 2');
```

### Test Cases

**Test 1: User can only see own org data**
```sql
-- Set session to user-1
SET request.jwt.claims = '{"sub": "user-1-uuid"}'::jsonb;

-- Should return only record-1
SELECT * FROM table_name;
```

**Test 2: User cannot see other org data**
```sql
-- Set session to user-2
SET request.jwt.claims = '{"sub": "user-2-uuid"}'::jsonb;

-- Should return only record-2 (not record-1)
SELECT * FROM table_name;
```

**Test 3: User cannot insert for other org**
```sql
-- As user-1, try to insert for org-2
INSERT INTO table_name (user_id, organization_id, data)
VALUES ('user-1-uuid', 'org-2-uuid', 'Malicious');
-- Should fail: policy violation
```

**Test 4: User cannot update others' records**
```sql
-- As user-2, try to update user-1's record
UPDATE table_name
SET data = 'Hacked'
WHERE id = 'record-1';
-- Should update 0 rows (no permission)
```

---

## Common RLS Mistakes

### ❌ Mistake 1: Forgetting to Enable RLS

```sql
-- ❌ Wrong: Policies defined but RLS not enabled
CREATE POLICY "..." ON table_name ...;
```

```sql
-- ✅ Correct: Enable RLS first
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON table_name ...;
```

### ❌ Mistake 2: Not Specifying Role

```sql
-- ❌ Slow: Applies to all roles
CREATE POLICY "..." ON table_name
  USING (...);
```

```sql
-- ✅ Fast: Specifies authenticated role
CREATE POLICY "..." ON table_name
  TO authenticated
  USING (...);
```

### ❌ Mistake 3: Using USING for INSERT

```sql
-- ❌ Wrong: USING doesn't apply to INSERT
CREATE POLICY "..." ON table_name
  FOR INSERT
  USING (...);
```

```sql
-- ✅ Correct: Use WITH CHECK for INSERT
CREATE POLICY "..." ON table_name
  FOR INSERT
  WITH CHECK (...);
```

### ❌ Mistake 4: Not Wrapping auth.uid() in SELECT

```sql
-- ❌ Less efficient
USING (auth.uid() = user_id)
```

```sql
-- ✅ More efficient (cached)
USING ((SELECT auth.uid()) = user_id)
```

### ❌ Mistake 5: Overly Permissive Policies

```sql
-- ❌ Dangerous: Anyone can do anything
CREATE POLICY "Allow all" ON table_name
  FOR ALL
  USING (true);
```

```sql
-- ✅ Secure: Specific permissions
CREATE POLICY "Org members only" ON table_name
  FOR SELECT
  TO authenticated
  USING (organization_id IN (...));
```

---

## RLS Policy Checklist

When creating RLS policies, verify:

- [ ] RLS enabled on table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policies for all operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] Target role specified (`TO authenticated`)
- [ ] Multi-tenant isolation via `organization_id`
- [ ] Uses `(SELECT auth.uid())` for performance
- [ ] `WITH CHECK` used for INSERT and UPDATE
- [ ] `USING` used for SELECT, UPDATE, DELETE
- [ ] No overly permissive policies (`USING (true)` only for public data)
- [ ] Tested with multiple users and organizations
- [ ] Performance acceptable (no slow queries)

---

## Migration Template

**File**: `supabase/migrations/YYYYMMDDHHMMSS_add_rls_to_table_name.sql`

```sql
-- Migration: Add RLS to table_name
-- Description: Implement organization-based multi-tenant isolation

-- Step 1: Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Step 2: Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_table_name_organization_id
  ON table_name(organization_id);

CREATE INDEX IF NOT EXISTS idx_table_name_user_id
  ON table_name(user_id);

-- Step 3: SELECT policy
CREATE POLICY "Users can view own organization records"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Step 4: INSERT policy
CREATE POLICY "Users can create records for own organization"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- Step 5: UPDATE policy
CREATE POLICY "Users can update own records"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Step 6: DELETE policy
CREATE POLICY "Users can delete own records"
  ON table_name
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Rollback instructions:
-- DROP POLICY "Users can view own organization records" ON table_name;
-- DROP POLICY "Users can create records for own organization" ON table_name;
-- DROP POLICY "Users can update own records" ON table_name;
-- DROP POLICY "Users can delete own records" ON table_name;
-- ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

---

## References

**Supabase RLS docs**: https://supabase.com/docs/guides/auth/row-level-security
**Context7 Supabase patterns**: `/supabase/supabase` (topic: "row level security policies multi-tenant")

**Latest patterns verified**: 2025-10-24

---

**Last Updated**: 2025-10-24
