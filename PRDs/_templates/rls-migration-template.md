# RLS Migration Template

**Purpose**: Template for creating optimized, non-circular RLS policies for Supabase.

**Usage**: Copy this template when creating RLS policies for any feature. Follow the mandatory Context7 consultation workflow defined in the Supabase Agent.

---

## Migration File Template

Copy this SQL template for your RLS migration:

```sql
/**
 * ============================================================================
 * [FEATURE NAME] - Row Level Security Policies
 * ============================================================================
 *
 * Feature: [feature-name]
 * Table: [table_name]
 * Created by: Supabase Agent
 * Date: YYYY-MM-DD
 *
 * ============================================================================
 * CONTEXT7 CONSULTATION VERIFICATION
 * ============================================================================
 *
 * 🚨 MANDATORY: This section documents Context7 consultation (Step 0.3)
 *
 * Context7 Consultation Date: [YYYY-MM-DD]
 * Context7 Library: /supabase/supabase
 *
 * Key Findings from Context7:
 * 1. [Finding 1: e.g., "Use security definer functions for complex checks"]
 * 2. [Finding 2: e.g., "Avoid joins to source table in USING clause"]
 * 3. [Finding 3: e.g., "Always wrap auth.uid() in SELECT for performance"]
 * 4. [Finding 4: e.g., "Specify TO role to avoid evaluating all roles"]
 *
 * Anti-Patterns Explicitly Avoided:
 * - ❌ No circular joins to source table
 * - ❌ No missing TO role specification
 * - ❌ No unwrapped auth.uid() calls
 * - ❌ No policies without corresponding indexes
 * - ❌ No INSERT/UPDATE without WITH CHECK clause
 *
 * Performance Strategy:
 * - [Strategy 1: e.g., "Use IN (SELECT ...) pattern instead of EXISTS"]
 * - [Strategy 2: e.g., "Pre-fetch organization IDs via security definer function"]
 * - [Strategy 3: e.g., "Index all columns used in USING/WITH CHECK clauses"]
 *
 * ============================================================================
 */

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

/**
 * Helper function: Get user's accessible organization IDs
 *
 * Purpose: Avoid circular joins by pre-fetching organization access
 * Pattern: SECURITY DEFINER function for complex RLS checks
 *
 * Referenced from Context7: [link or finding reference]
 */
CREATE OR REPLACE FUNCTION get_user_organization_ids()
  RETURNS SETOF UUID
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  -- Return organization IDs the user has access to
  RETURN QUERY
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_organization_ids() TO authenticated;

/**
 * Helper function: Check if user can access specific organization
 *
 * Purpose: Optimize WITH CHECK clauses on INSERT/UPDATE
 * Pattern: Boolean check function for validation
 */
CREATE OR REPLACE FUNCTION can_access_organization(org_id UUID)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
      AND organization_id = org_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_access_organization(UUID) TO authenticated;

-- ============================================================================
-- SELECT POLICIES (READ)
-- ============================================================================

/**
 * Policy: Allow users to read records in their organizations
 *
 * Pattern: IN (SELECT security_definer_function())
 * Avoids: Circular join to source table
 * Performance: Uses idx_[table]_org_id index
 */
CREATE POLICY "[table]_select_own_org" ON [table_name]
  FOR SELECT
  TO authenticated
  USING (
    -- ✅ CORRECT: Pre-fetch organization IDs, no join to source table
    organization_id IN (SELECT get_user_organization_ids())
  );

-- ============================================================================
-- INSERT POLICIES (CREATE)
-- ============================================================================

/**
 * Policy: Allow users to create records in their organizations
 *
 * Pattern: WITH CHECK validates both organization access and user ownership
 * Avoids: Missing WITH CHECK clause
 * Performance: Uses idx_[table]_org_id and idx_[table]_user_id indexes
 */
CREATE POLICY "[table]_insert_own_org" ON [table_name]
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Verify user can access the organization
    (SELECT can_access_organization(organization_id))

    -- Verify user_id matches authenticated user
    AND (SELECT auth.uid()) = user_id
  );

-- ============================================================================
-- UPDATE POLICIES (MODIFY)
-- ============================================================================

/**
 * Policy: Allow users to update their own records
 *
 * Pattern: USING + WITH CHECK for both read and write validation
 * Avoids: Missing WITH CHECK on UPDATE
 * Performance: Uses idx_[table]_user_id and idx_[table]_org_id indexes
 */
CREATE POLICY "[table]_update_own" ON [table_name]
  FOR UPDATE
  TO authenticated
  USING (
    -- Can only see records they own in their organizations
    (SELECT auth.uid()) = user_id
    AND organization_id IN (SELECT get_user_organization_ids())
  )
  WITH CHECK (
    -- Cannot change ownership or move to different organization
    (SELECT auth.uid()) = user_id
    AND organization_id IN (SELECT get_user_organization_ids())
  );

-- ============================================================================
-- DELETE POLICIES (REMOVE)
-- ============================================================================

/**
 * Policy: Allow users to delete their own records
 *
 * Pattern: Simple ownership check
 * Avoids: Over-complicated delete logic
 * Performance: Uses idx_[table]_user_id index
 */
CREATE POLICY "[table]_delete_own" ON [table_name]
  FOR DELETE
  TO authenticated
  USING (
    -- Can only delete records they own
    (SELECT auth.uid()) = user_id
  );

-- ============================================================================
-- PERFORMANCE VERIFICATION (Development Only - Comment Out in Production)
-- ============================================================================

/**
 * Uncomment these queries in development to verify performance:
 */

-- Test 1: Verify index usage on SELECT
-- EXPLAIN ANALYZE
-- SELECT * FROM [table_name]
-- WHERE organization_id IN (SELECT get_user_organization_ids())
-- LIMIT 100;
-- Expected: Index Scan using idx_[table]_org_id

-- Test 2: Verify no circular dependencies
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   pg_get_expr(qual, oid) AS policy_condition
-- FROM pg_policies
-- WHERE tablename = '[table_name]';
-- Review: Ensure no joins back to [table_name] in conditions

-- Test 3: Verify query performance
-- SET client_min_messages = 'log';
-- SELECT * FROM [table_name] LIMIT 100;
-- Expected: Query time < 50ms

-- ============================================================================
-- POST-IMPLEMENTATION CHECKLIST
-- ============================================================================

/**
 * ✅ Pre-Flight Checklist (Before implementing):
 * - [ ] Consulted Context7 for latest RLS patterns
 * - [ ] Documented key findings above
 * - [ ] Identified anti-patterns to avoid
 * - [ ] Confirmed corresponding indexes exist
 *
 * ✅ Implementation Checklist:
 * - [ ] All policies specify TO role (authenticated/anon)
 * - [ ] auth.uid() wrapped in SELECT for performance
 * - [ ] No joins to source table in USING/WITH CHECK
 * - [ ] Security definer functions used for complex checks
 * - [ ] INSERT/UPDATE policies have WITH CHECK clause
 *
 * ✅ Validation Checklist (After implementing):
 * - [ ] Ran EXPLAIN ANALYZE to verify index usage
 * - [ ] Verified no circular dependencies (pg_policies check)
 * - [ ] Query performance < 50ms for simple selects
 * - [ ] Ran /validate-rls command and resolved issues
 * - [ ] All tests pass with RLS enabled
 */

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE [table_name] IS 'Multi-tenant table with organization-level RLS isolation';

-- Policy comments
COMMENT ON POLICY "[table]_select_own_org" ON [table_name] IS
  'Allows users to read records in their organizations. Uses security definer function to avoid circular joins.';

COMMENT ON POLICY "[table]_insert_own_org" ON [table_name] IS
  'Allows users to create records in their organizations. Validates organization access and ownership.';

COMMENT ON POLICY "[table]_update_own" ON [table_name] IS
  'Allows users to update their own records. Prevents ownership changes.';

COMMENT ON POLICY "[table]_delete_own" ON [table_name] IS
  'Allows users to delete their own records only.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * This migration implements RLS policies following Context7 best practices.
 *
 * Next steps:
 * 1. Run: /validate-rls to verify implementation
 * 2. Test: Run service tests with RLS enabled
 * 3. Verify: Check query performance in development
 * 4. Deploy: Apply migration to production
 *
 * Critical warnings:
 * - Do NOT modify these policies without re-consulting Context7
 * - Do NOT remove indexes used by these policies
 * - Do NOT skip WITH CHECK clauses on INSERT/UPDATE
 * - Do NOT create circular joins to source table
 */
```

---

## Usage Instructions

### 1. Copy Template
When creating RLS policies for a new feature:
1. Copy this entire SQL template
2. Replace all `[placeholders]` with actual values
3. Ensure you've completed Context7 consultation (Step 0.3)

### 2. Mandatory Replacements

Replace these placeholders:

- `[FEATURE NAME]`: Feature name (e.g., "TASKS")
- `[feature-name]`: Feature slug (e.g., "tasks")
- `[table_name]`: Actual table name (e.g., "tasks")
- `[table]`: Short table prefix (e.g., "tasks")
- `[YYYY-MM-DD]`: Current date
- Context7 findings: Fill with actual findings from consultation

### 3. Context7 Consultation (MANDATORY)

Before filling this template, you MUST:

```typescript
// 1. Consult Context7 for RLS patterns
await mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "RLS row level security policies performance joins security definer circular",
  tokens: 3000
})

// 2. Consult Context7 for schema patterns
await mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "schema design indexes foreign keys constraints multi-tenancy organization",
  tokens: 2500
})
```

Document your findings in the "CONTEXT7 CONSULTATION VERIFICATION" section.

### 4. Verify Prerequisites

Before creating this migration, ensure:

- [ ] ✅ Schema migration exists with table structure
- [ ] ✅ Indexes created on all RLS columns (user_id, organization_id)
- [ ] ✅ Foreign keys exist for relationships
- [ ] ✅ Context7 consultation completed and documented

### 5. Validation After Creation

After creating the migration:

```bash
# Run validation command
/validate-rls

# Check for issues
- No circular policies
- All policies have TO role
- All auth.uid() wrapped in SELECT
- Indexes exist for all RLS columns
- WITH CHECK present on INSERT/UPDATE
```

---

## Common Patterns

### Pattern 1: Organization-Based Access

For multi-tenant features with organization isolation:

```sql
-- Security definer function
CREATE FUNCTION get_user_organization_ids() RETURNS SETOF UUID ...

-- SELECT policy
CREATE POLICY "select_own_org" ON table
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT get_user_organization_ids()));

-- Requires: CREATE INDEX idx_table_org_id ON table(organization_id);
```

### Pattern 2: User Ownership

For user-specific records:

```sql
-- SELECT/UPDATE/DELETE policy
CREATE POLICY "access_own" ON table
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Requires: CREATE INDEX idx_table_user_id ON table(user_id);
```

### Pattern 3: Role-Based Access (Optional)

For role-based authorization:

```sql
-- Security definer function
CREATE FUNCTION has_role(required_role TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy
CREATE POLICY "admin_all" ON table
  FOR ALL TO authenticated
  USING (has_role('admin'));
```

---

## Anti-Patterns to Avoid

### ❌ NEVER: Circular Join

```sql
-- ❌ WRONG: Joins back to source table
CREATE POLICY "circular" ON tasks
  USING (
    team_id IN (
      SELECT team_id FROM team_user
      WHERE team_user.team_id = tasks.team_id  -- CIRCULAR!
    )
  );
```

### ❌ NEVER: Missing TO Role

```sql
-- ❌ WRONG: No TO role (slow)
CREATE POLICY "slow" ON tasks
  USING ((SELECT auth.uid()) = user_id);
```

### ❌ NEVER: Unwrapped auth.uid()

```sql
-- ❌ WRONG: auth.uid() not wrapped
CREATE POLICY "bad" ON tasks
  TO authenticated
  USING (auth.uid() = user_id);  -- Should be (SELECT auth.uid())
```

### ❌ NEVER: Missing WITH CHECK

```sql
-- ❌ WRONG: INSERT without WITH CHECK
CREATE POLICY "unsafe" ON tasks
  FOR INSERT TO authenticated
  USING (organization_id IN (SELECT get_user_organization_ids()));
  -- Missing: WITH CHECK clause!
```

### ❌ NEVER: Missing Index

```sql
-- ❌ WRONG: Policy without corresponding index
CREATE POLICY "slow" ON tasks
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
-- Missing: CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

---

## References

- **Supabase Agent**: [.claude/agents/supabase-data-specialist.md](file:///c:/Users/Usuario/Desktop/programación/poli2/.claude/agents/supabase-data-specialist.md)
- **Validation Command**: `/validate-rls`
- **Project Rules**: `.trae/rules/project_rules.md`
- **Context7 MCP**: Use for latest Supabase best practices

---

## Template Checklist

When using this template, verify:

- [ ] ✅ Context7 consultation completed
- [ ] ✅ All findings documented in header
- [ ] ✅ All placeholders replaced
- [ ] ✅ Security definer functions included
- [ ] ✅ All policies specify TO role
- [ ] ✅ auth.uid() wrapped in SELECT
- [ ] ✅ WITH CHECK on INSERT/UPDATE
- [ ] ✅ No circular joins
- [ ] ✅ Performance verification queries uncommented for testing
- [ ] ✅ Policy comments added
- [ ] ✅ Post-implementation checklist completed
- [ ] ✅ `/validate-rls` executed and passed

---

**Version**: 1.0
**Last Updated**: 2025-10-16
**Maintained by**: Supabase Agent
