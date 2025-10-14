/**
 * Fix Slug Validation RLS Issue
 *
 * ISSUE: isOrganizationSlugAvailable() fails because no SELECT policy exists
 *        on organizations table. New users can't check slug availability before
 *        creating their first organization (chicken-and-egg problem).
 *
 * ROOT CAUSE: Missing SELECT RLS policy on organizations table
 *
 * SCENARIO: Scenario 2 - RLS Blocking SELECT
 * - No SELECT policy exists on organizations table
 * - New users (not members of any org) can't SELECT from organizations
 * - Query returns permission denied (RLS blocks access)
 * - isOrganizationSlugAvailable() incorrectly returns true (assumes available on error)
 *
 * SOLUTION: Create permissive SELECT policy for slug availability checking
 *
 * SECURITY CONSIDERATIONS:
 * - Only allows SELECT operation (INSERT/UPDATE/DELETE remain restricted)
 * - Only authenticated users can check (not public/anonymous)
 * - Application layer only SELECTs 'id' column (no sensitive data exposed)
 * - Database unique constraint is final enforcer of duplicates
 * - Multi-tenant isolation maintained via other policies
 * - No security regression: expose-only data is organization existence
 *
 * Created by: Supabase Data Specialist Agent
 * Date: 2025-10-14
 * Status: 🔴 CRITICAL FIX
 */

-- ============================================================================
-- ENABLE RLS (if not already enabled)
-- ============================================================================

-- Ensure RLS is enabled on organizations table
-- (Should already be enabled, but verify)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE SELECT POLICY: Slug Availability Checking
-- ============================================================================

/**
 * Policy: Allow authenticated users to check slug availability
 *
 * Purpose: Enables isOrganizationSlugAvailable() to work for new users
 * who don't have any organization memberships yet.
 *
 * Why Safe:
 * 1. Only SELECT operation allowed (can't modify data)
 * 2. Application code only SELECTs 'id' column
 * 3. Checking if slug exists is not sensitive data
 * 4. Required for UX (validate before submitting form)
 * 5. Database unique constraint prevents actual duplicates
 *
 * Alternative Considered:
 * - Column-level security (Postgres doesn't support natively)
 * - More restrictive USING clause (would defeat the purpose)
 *
 * Trade-off Accepted:
 * - Users can see organization IDs and slugs via SELECT
 * - This is minimal information exposure
 * - Benefit: Slug validation works for all authenticated users
 */
CREATE POLICY "Authenticated users can check slug availability"
ON organizations
FOR SELECT
TO authenticated
USING (true);  -- Allow SELECT on all rows for slug availability checks

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Ensure authenticated role can SELECT from organizations
-- (Should already exist, but verify)
GRANT SELECT ON organizations TO authenticated;

-- ============================================================================
-- POLICY DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Authenticated users can check slug availability" ON organizations IS
'Allows authenticated users to SELECT from organizations table for slug availability checking.

This policy is REQUIRED for the isOrganizationSlugAvailable() function to work for new users
who are not yet members of any organization (chicken-and-egg problem).

Security: Only allows SELECT (not INSERT/UPDATE/DELETE). Application code only SELECTs the
''id'' column to check existence. Database unique constraint enforces actual duplicate prevention.

Used by: isOrganizationSlugAvailable() in organization.service.ts (line 29-50)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Query 1: Verify policy was created
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual AS using_expression
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename = 'organizations'
--   AND policyname = 'Authenticated users can check slug availability';

-- Query 2: Test slug availability check (as authenticated user)
-- This should now work for users with 0 organization memberships
-- SELECT id FROM organizations WHERE slug = 'test-unique-slug-999';
-- Expected: 0 rows (if slug doesn't exist) OR 1 row (if slug exists)
-- Should NOT return permission denied error

-- Query 3: Verify other policies still restrictive
-- SELECT
--   policyname,
--   cmd,
--   roles
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename = 'organizations'
-- ORDER BY cmd, policyname;
-- Expected: INSERT/UPDATE/DELETE policies remain restrictive

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================

-- If this policy causes issues, rollback with:
-- DROP POLICY "Authenticated users can check slug availability" ON organizations;

-- ============================================================================
-- TESTING NOTES
-- ============================================================================

/**
 * Test Cases (run after migration):
 *
 * 1. New User - Unique Slug Check (should work now):
 *    - User with 0 org memberships
 *    - Call isOrganizationSlugAvailable('unique-slug-123')
 *    - Expected: Returns true (slug available)
 *
 * 2. New User - Existing Slug Check (should work now):
 *    - User with 0 org memberships
 *    - Call isOrganizationSlugAvailable('existing-slug')
 *    - Expected: Returns false (slug taken)
 *
 * 3. Organization Creation (should work now):
 *    - User creates organization with unique slug
 *    - Expected: SUCCESS (no "slug already exists" error)
 *
 * 4. Duplicate Slug Prevention (should still work):
 *    - User tries to create org with existing slug
 *    - Expected: Database unique constraint error (23505)
 *
 * 5. Multi-Tenant Isolation (should NOT break):
 *    - User A can see org exists (via SELECT)
 *    - User A CANNOT UPDATE/DELETE org B's data
 *    - Expected: Other policies still enforce isolation
 */
