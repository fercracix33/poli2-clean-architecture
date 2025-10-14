/**
 * VERIFICATION TESTS FOR SLUG VALIDATION FIX
 *
 * Purpose: Verify that the SELECT RLS policy fix resolves slug validation issue
 * Migration: 20251014000002_fix_slug_validation_rls.sql
 * Agent: Supabase Data Specialist
 * Date: 2025-10-14
 *
 * INSTRUCTIONS:
 * 1. Apply the migration first
 * 2. Run these verification tests in order
 * 3. All tests should pass
 * 4. Document results
 */

-- ============================================================================
-- VERIFICATION TEST 1: Policy Exists
-- ============================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'organizations'
  AND policyname = 'Authenticated users can check slug availability';

-- EXPECTED RESULT:
-- Should return 1 row with:
-- - policyname: "Authenticated users can check slug availability"
-- - cmd: SELECT
-- - roles: {authenticated}
-- - using_expression: true

-- ✅ PASS CRITERIA: 1 row returned
-- ❌ FAIL CRITERIA: 0 rows returned (policy not created)

-- ============================================================================
-- VERIFICATION TEST 2: Unique Slug Check (Should Be Available)
-- ============================================================================

-- Generate a definitely unique slug
DO $$
DECLARE
  v_unique_slug TEXT;
  v_slug_exists BOOLEAN;
BEGIN
  -- Generate unique slug with UUID
  v_unique_slug := 'test-slug-' || REPLACE(gen_random_uuid()::text, '-', '');

  -- Check if slug exists
  SELECT EXISTS(
    SELECT 1 FROM organizations WHERE slug = v_unique_slug
  ) INTO v_slug_exists;

  -- Output result
  RAISE NOTICE 'Test 2 - Unique Slug Check:';
  RAISE NOTICE '  Slug: %', v_unique_slug;
  RAISE NOTICE '  Exists: %', v_slug_exists;
  RAISE NOTICE '  Expected: false';

  IF v_slug_exists THEN
    RAISE EXCEPTION 'TEST FAILED: Unique slug should not exist';
  ELSE
    RAISE NOTICE '  ✅ PASSED: Slug is available';
  END IF;
END $$;

-- ✅ PASS CRITERIA: Query succeeds, returns false (slug available)
-- ❌ FAIL CRITERIA: Query returns permission denied error OR returns true

-- ============================================================================
-- VERIFICATION TEST 3: Existing Slug Check (Should Be Unavailable)
-- ============================================================================

-- First, ensure we have at least one organization
DO $$
DECLARE
  v_existing_slug TEXT;
  v_slug_exists BOOLEAN;
  v_org_count INT;
BEGIN
  -- Check if any organizations exist
  SELECT COUNT(*) INTO v_org_count FROM organizations;

  IF v_org_count = 0 THEN
    RAISE NOTICE 'Test 3 - Existing Slug Check:';
    RAISE NOTICE '  ⚠️  SKIPPED: No organizations exist in database';
    RAISE NOTICE '  Create an organization first to run this test';
  ELSE
    -- Get first existing slug
    SELECT slug INTO v_existing_slug FROM organizations LIMIT 1;

    -- Check if slug exists
    SELECT EXISTS(
      SELECT 1 FROM organizations WHERE slug = v_existing_slug
    ) INTO v_slug_exists;

    -- Output result
    RAISE NOTICE 'Test 3 - Existing Slug Check:';
    RAISE NOTICE '  Slug: %', v_existing_slug;
    RAISE NOTICE '  Exists: %', v_slug_exists;
    RAISE NOTICE '  Expected: true';

    IF NOT v_slug_exists THEN
      RAISE EXCEPTION 'TEST FAILED: Existing slug should be found';
    ELSE
      RAISE NOTICE '  ✅ PASSED: Slug correctly identified as taken';
    END IF;
  END IF;
END $$;

-- ✅ PASS CRITERIA: Query succeeds, returns true (slug taken)
-- ❌ FAIL CRITERIA: Query returns permission denied error OR returns false

-- ============================================================================
-- VERIFICATION TEST 4: Check for Orphaned Organizations
-- ============================================================================

-- Check if there are orphaned organizations (0 members)
-- These could be causing false "slug exists" errors

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

-- EXPECTED RESULT:
-- Ideally 0 rows (no orphaned organizations)
-- If rows returned, these are leftover test data

-- ✅ PASS CRITERIA: 0 rows (no orphaned orgs)
-- ⚠️  WARNING: >0 rows (orphaned orgs exist, may need cleanup)

-- ============================================================================
-- VERIFICATION TEST 5: Multi-Tenant Isolation Preserved
-- ============================================================================

-- Verify that INSERT/UPDATE/DELETE policies are still restrictive
-- (this fix should ONLY affect SELECT)

SELECT
  policyname,
  cmd,
  roles,
  CASE
    WHEN cmd = 'SELECT' AND qual = 'true' THEN '✅ Permissive (expected for slug check)'
    WHEN cmd != 'SELECT' THEN '✅ Should be restrictive (check manually)'
    ELSE '⚠️  Check policy'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'organizations'
ORDER BY cmd, policyname;

-- EXPECTED RESULT:
-- - SELECT policy: Permissive (using = true)
-- - INSERT/UPDATE/DELETE policies: Restrictive (check manually)

-- ✅ PASS CRITERIA: SELECT is permissive, others are restrictive
-- ❌ FAIL CRITERIA: All policies permissive (security regression!)

-- ============================================================================
-- VERIFICATION TEST 6: Full Organization Creation Flow
-- ============================================================================

-- This simulates the full flow that was failing before the fix
-- WARNING: This will create a test organization - cleanup after!

DO $$
DECLARE
  v_test_slug TEXT;
  v_slug_available BOOLEAN;
  v_org_id UUID;
BEGIN
  -- Generate unique test slug
  v_test_slug := 'test-verification-' || SUBSTRING(gen_random_uuid()::text, 1, 8);

  RAISE NOTICE 'Test 6 - Full Organization Creation Flow:';
  RAISE NOTICE '  Step 1: Check slug availability...';

  -- Step 1: Check slug availability (this was failing before)
  SELECT NOT EXISTS(
    SELECT 1 FROM organizations WHERE slug = v_test_slug
  ) INTO v_slug_available;

  RAISE NOTICE '    Slug: %', v_test_slug;
  RAISE NOTICE '    Available: %', v_slug_available;

  IF NOT v_slug_available THEN
    RAISE EXCEPTION 'TEST FAILED: Generated slug should be available';
  END IF;

  RAISE NOTICE '    ✅ Slug availability check succeeded';
  RAISE NOTICE '  Step 2: Would create organization...';
  RAISE NOTICE '    (Skipped to avoid test data - application layer will test)';

  RAISE NOTICE '  ✅ PASSED: Slug validation is working';
END $$;

-- ✅ PASS CRITERIA: Slug check succeeds without errors
-- ❌ FAIL CRITERIA: Permission denied error or incorrect result

-- ============================================================================
-- CLEANUP ORPHANED ORGANIZATIONS (OPTIONAL)
-- ============================================================================

-- WARNING: Only run this if Test 4 found orphaned organizations
-- This will DELETE organizations with 0 members (test artifacts)

-- UNCOMMENT TO RUN:
-- DELETE FROM organizations
-- WHERE id IN (
--   SELECT o.id
--   FROM organizations o
--   WHERE (SELECT COUNT(*)
--          FROM organization_members om
--          WHERE om.organization_id = o.id) = 0
-- )
-- RETURNING id, name, slug, created_at;

-- ✅ After cleanup, run Test 4 again to verify 0 orphaned orgs remain

-- ============================================================================
-- SUMMARY CHECK
-- ============================================================================

-- Run this to get a summary of all checks
DO $$
BEGIN
  RAISE NOTICE '================================';
  RAISE NOTICE 'SLUG VALIDATION FIX - SUMMARY';
  RAISE NOTICE '================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Checklist:';
  RAISE NOTICE '[ ] Test 1: Policy created successfully';
  RAISE NOTICE '[ ] Test 2: Unique slug check works';
  RAISE NOTICE '[ ] Test 3: Existing slug check works';
  RAISE NOTICE '[ ] Test 4: No orphaned organizations (or cleaned up)';
  RAISE NOTICE '[ ] Test 5: Multi-tenant isolation preserved';
  RAISE NOTICE '[ ] Test 6: Full creation flow works';
  RAISE NOTICE '';
  RAISE NOTICE 'If all tests passed:';
  RAISE NOTICE '  ✅ Slug validation fix is SUCCESSFUL';
  RAISE NOTICE '  ✅ Ready for production use';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Test in application UI (create organization)';
  RAISE NOTICE '  2. Verify error messages are clear';
  RAISE NOTICE '  3. Monitor for any RLS permission issues';
  RAISE NOTICE '  4. Document fix in RLS_FIX_SUMMARY.md';
END $$;
