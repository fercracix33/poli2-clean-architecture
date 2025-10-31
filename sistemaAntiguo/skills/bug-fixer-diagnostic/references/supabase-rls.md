# Supabase RLS Debugging Reference

**Purpose**: Patterns for diagnosing and fixing Row Level Security policy issues.

**When to Consult**: Data access denied, RLS policy errors, permission issues, circular policy references.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "RLS policies debugging performance circular references auth",
  tokens: 4000
})
```

---

## Common RLS Issues

### 1. Circular Policy References

**Symptoms**: `infinite recursion detected in policy` or queries hang indefinitely

**Diagnosis**:
```sql
-- Check policy definitions
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE tablename = 'tasks';

-- Look for policies that reference the same table they're on
```

**Context7 Best Practice**:
```sql
-- ❌ BAD: Circular reference (tasks policy queries tasks)
CREATE POLICY "users_see_own_tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM tasks  -- Circular! Policy checks tasks to allow tasks
      WHERE organization_id = (SELECT auth.uid())
    )
  );

-- ✅ GOOD: Use direct comparison (no subquery on same table)
CREATE POLICY "users_see_own_tasks" ON tasks
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ✅ GOOD: Reference different table for multi-tenant
CREATE POLICY "org_members_see_tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );
```

**Fix**:
```sql
-- BEFORE (circular reference causing hang)
CREATE POLICY "project_members_access" ON tasks
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT t.project_id
      FROM tasks t  -- Circular!
      JOIN projects p ON t.project_id = p.id
      WHERE p.organization_id = current_organization_id()
    )
  );

-- AFTER (no circular reference)
CREATE POLICY "project_members_access" ON tasks
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id
      FROM projects
      WHERE organization_id IN (
        SELECT organization_id
        FROM user_organizations
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );
```

---

### 2. Permission Denied Errors

**Symptoms**: `new row violates row-level security policy` or `permission denied for table`

**Diagnosis**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'tasks';

-- Check policies for operation type
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tasks';

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-uuid-here';
SELECT * FROM tasks WHERE id = 1;
```

**Context7 Best Practice**:
```sql
-- ✅ GOOD: Separate policies for different operations
CREATE POLICY "users_read_own_tasks" ON tasks
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users_insert_own_tasks" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users_update_own_tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users_delete_own_tasks" ON tasks
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ❌ BAD: Single policy for all operations (confusing)
CREATE POLICY "users_all_operations" ON tasks
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
```

**Fix**:
```typescript
// BEFORE (permission denied on insert)
// Missing WITH CHECK clause!
CREATE POLICY "insert_tasks" ON tasks
  FOR INSERT TO authenticated
  USING (organization_id = current_organization_id());
  -- No WITH CHECK! Insert fails!

// AFTER (insert allowed)
CREATE POLICY "insert_tasks" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );
```

---

### 3. Performance Issues (N+1 Queries)

**Symptoms**: Slow queries, high CPU usage, timeouts

**Diagnosis**:
```sql
-- Enable query logging
SET log_min_duration_statement = 0;

-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 'current-user-id';

-- Look for sequential scans or nested loops
```

**Context7 Best Practice**:
```sql
-- ✅ GOOD: Use indexes for RLS columns
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(organization_id);

-- ✅ GOOD: Avoid expensive functions in policies
-- BEFORE (slow: scans all organizations)
CREATE POLICY "slow_policy" ON tasks
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- AFTER (fast: uses function with proper indexing)
CREATE OR REPLACE FUNCTION user_organizations_ids()
RETURNS SETOF uuid AS $$
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = (SELECT auth.uid())
$$ LANGUAGE SQL STABLE;

CREATE POLICY "fast_policy" ON tasks
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT user_organizations_ids()));

-- ❌ BAD: No indexes (sequential scan)
CREATE POLICY "no_index_policy" ON tasks
  FOR SELECT TO authenticated
  USING (metadata->>'owner_id' = auth.uid()::text);  -- JSONB not indexed!
```

**Fix**:
```sql
-- BEFORE (slow: N+1 queries)
CREATE POLICY "slow_member_access" ON tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (SELECT auth.uid())
        AND organization_id = tasks.organization_id
        AND role IN ('admin', 'member')
    )
  );
-- No index on user_roles (user_id, organization_id)!

-- AFTER (fast: indexed lookup)
-- 1. Add composite index
CREATE INDEX idx_user_roles_lookup
  ON user_roles(user_id, organization_id);

-- 2. Use function with proper caching
CREATE OR REPLACE FUNCTION user_has_org_access(org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT auth.uid())
      AND organization_id = org_id
      AND role IN ('admin', 'member')
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE POLICY "fast_member_access" ON tasks
  FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));
```

---

### 4. Auth UID Not Working

**Symptoms**: `auth.uid() returns null` or policy always denies access

**Diagnosis**:
```sql
-- Check if user is authenticated
SELECT auth.uid();  -- Should return UUID, not null

-- Check JWT claims
SELECT auth.jwt();

-- Verify role
SELECT current_user;  -- Should be 'authenticated' not 'anon'
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Create authenticated Supabase client (server-side)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// ✅ GOOD: Verify authentication before query
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  throw new Error('Unauthorized')
}

const { data, error } = await supabase
  .from('tasks')
  .select('*')
// RLS policies automatically apply with user context

// ❌ BAD: Using anon client (no user context)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)
// auth.uid() returns null! RLS policies fail!
```

**Fix**:
```typescript
// BEFORE (auth.uid() returns null)
// Using client-side Supabase without authentication
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getTasks() {
  const { data } = await supabase.from('tasks').select('*')
  // RLS policy uses auth.uid() but no user is authenticated!
  return data  // Empty or error
}

// AFTER (proper authentication)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getTasks() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Now auth.uid() works in RLS policies
  const { data, error } = await supabase.from('tasks').select('*')
  if (error) throw error

  return data
}
```

---

## Debugging Tools

### 1. RLS Policy Inspector
```sql
-- List all policies on a table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tasks';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 2. Test Policies as User
```sql
-- Impersonate user for testing
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-uuid-here';

-- Test queries
SELECT * FROM tasks;
INSERT INTO tasks (title, user_id) VALUES ('Test', 'user-uuid-here');

ROLLBACK;  -- Don't commit test data
```

### 3. Query Performance Analysis
```sql
-- Enable timing
\timing

-- Analyze query plan
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM tasks
WHERE organization_id = 'org-uuid-here';

-- Look for:
-- - Seq Scan (bad, needs index)
-- - Index Scan (good)
-- - Nested Loop (can be slow with many rows)
```

---

## Common Fixes Checklist

- [ ] Remove circular references (policy queries same table)
- [ ] Add `WITH CHECK` clause for INSERT/UPDATE policies
- [ ] Create indexes on RLS filter columns (`user_id`, `organization_id`)
- [ ] Use `STABLE` functions for expensive policy checks
- [ ] Verify `auth.uid()` returns UUID (check authentication)
- [ ] Separate policies by operation (SELECT, INSERT, UPDATE, DELETE)
- [ ] Use composite indexes for multi-column policies
- [ ] Test policies with `EXPLAIN ANALYZE`
- [ ] Avoid JSONB queries in policies (not indexed)
- [ ] Use `SECURITY DEFINER` functions for complex checks

---

**Update Policy**: Refresh when Supabase releases new RLS features or patterns emerge from Context7.
