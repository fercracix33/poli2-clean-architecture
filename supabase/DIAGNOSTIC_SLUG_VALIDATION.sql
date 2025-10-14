/**
 * DIAGNOSTIC QUERIES FOR SLUG VALIDATION ISSUE
 *
 * Purpose: Determine why isOrganizationSlugAvailable() is rejecting valid slugs
 * Agent: Supabase Data Specialist
 * Date: 2025-10-14
 *
 * INSTRUCTIONS:
 * 1. Run queries in order (Query 1 → Query 2 → Query 3)
 * 2. Document results of EACH query
 * 3. Identify which scenario applies (1, 2, or 3)
 * 4. Apply appropriate fix
 */

-- ============================================================================
-- QUERY 1: Check for Orphaned Organizations
-- ============================================================================
-- Purpose: Find organizations with 0 members (leftover from failed tests)
-- If this returns rows → Scenario 1 (Leftover Test Data)

SELECT
  o.id,
  o.name,
  o.slug,
  o.created_by,
  o.created_at,
  (SELECT COUNT(*)
   FROM organization_members om
   WHERE om.organization_id = o.id) as member_count
FROM organizations o
WHERE (SELECT COUNT(*)
       FROM organization_members om
       WHERE om.organization_id = o.id) = 0
ORDER BY o.created_at DESC;

-- INTERPRETATION:
-- - If rows returned: Organizations exist without members (orphaned from failed tests)
-- - If 0 rows: No orphaned organizations, move to Query 2

-- ============================================================================
-- QUERY 2: Check RLS Policies on Organizations Table
-- ============================================================================
-- Purpose: Verify if RLS is blocking SELECT queries for non-members
-- If SELECT policy is too restrictive → Scenario 2 (RLS Blocking SELECT)

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'organizations'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- INTERPRETATION:
-- Look for SELECT policies that:
-- - Require organization membership (restrictive)
-- - Block authenticated users from checking slug availability
-- - Expected: Should allow SELECT for slug availability checking

-- ============================================================================
-- QUERY 3: Test Slug Availability Query (Simulate Function)
-- ============================================================================
-- Purpose: Simulate what isOrganizationSlugAvailable() does

-- Test 3A: Unique slug (should be available)
SELECT id FROM organizations WHERE slug = 'unique-test-slug-123456789';
-- Expected: 0 rows (slug is available)

-- Test 3B: Check all existing slugs
SELECT slug, COUNT(*) as count
FROM organizations
GROUP BY slug
ORDER BY slug;
-- Expected: All counts should be 1 (unique constraint enforced)

-- Test 3C: Get specific slug user is trying (REPLACE WITH ACTUAL SLUG)
-- SELECT id FROM organizations WHERE slug = '[USER-ATTEMPTED-SLUG]';
-- Expected: If returns row, slug exists. If 0 rows, slug is available.

-- ============================================================================
-- QUERY 4: Check All Organizations (Context)
-- ============================================================================
-- Purpose: Get full picture of database state

SELECT
  o.id,
  o.name,
  o.slug,
  o.created_by,
  o.created_at,
  (SELECT COUNT(*)
   FROM organization_members om
   WHERE om.organization_id = o.id) AS member_count,
  (SELECT STRING_AGG(u.email, ', ')
   FROM organization_members om
   JOIN auth.users u ON om.user_id = u.id
   WHERE om.organization_id = o.id) AS members_emails
FROM organizations o
ORDER BY o.created_at DESC
LIMIT 20;

-- INTERPRETATION:
-- - Shows recent organizations with member counts
-- - Helps identify test data vs real data
-- - Check for patterns in orphaned organizations

-- ============================================================================
-- DECISION TREE
-- ============================================================================

/*
SCENARIO 1: Query 1 returns rows (orphaned organizations)
  → ACTION: Run FIX_SCENARIO_1.sql (delete orphaned organizations)

SCENARIO 2: Query 2 shows no SELECT policy OR restrictive SELECT policy
  → ACTION: Run FIX_SCENARIO_2.sql (create SELECT policy for slug checking)

SCENARIO 3: All queries work, slug actually exists
  → ACTION: No database fix needed (UX improvement only)
*/

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
1. Run Query 1 first
   - If returns rows → Apply Scenario 1 fix
   - If 0 rows → Continue to Query 2

2. Run Query 2
   - Check if SELECT policy exists and is permissive
   - If too restrictive or missing → Apply Scenario 2 fix
   - If policy looks OK → Continue to Query 3

3. Run Query 3
   - Test actual slug availability
   - Verify RLS is allowing the query
   - Document which slugs exist

4. Run Query 4
   - Get full context of database state
   - Identify any patterns or issues

5. Document findings and apply appropriate fix
*/
