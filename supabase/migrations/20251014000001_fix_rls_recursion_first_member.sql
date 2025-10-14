/**
 * Fix RLS Recursion for Organization Creation
 *
 * CRITICAL FIX: Resolves error 42501 when adding first member to new organization.
 *
 * Problem:
 * - When user creates organization, they must be added as first member
 * - RLS policy on organization_members checks if user is admin
 * - Admin check queries organization_members table
 * - Table is EMPTY (this is the first member!) → RECURSION/FAILURE
 *
 * Solution:
 * - Create SECURITY DEFINER function that bypasses RLS for first member ONLY
 * - Validates: user is creator, organization has 0 members
 * - Subsequent members use normal RLS (security maintained)
 *
 * Created by: Supabase Agent
 * Date: 2025-10-14
 * Status: 🔴 CRITICAL FIX
 */

-- ============================================================================
-- SECURITY DEFINER FUNCTION: Add First Organization Member
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_first_organization_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS for this function execution
SET search_path = public -- Security: prevents schema injection attacks
AS $$
DECLARE
  v_org_creator UUID;
  v_member_count INT;
  v_new_member_id UUID;
BEGIN
  -- ============================================================================
  -- VALIDATION 1: Verify organization exists and get creator
  -- ============================================================================
  SELECT created_by INTO v_org_creator
  FROM organizations
  WHERE id = p_organization_id;

  IF v_org_creator IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  -- ============================================================================
  -- VALIDATION 2: Verify caller is the organization creator
  -- ============================================================================
  -- CRITICAL: Only the creator can add the first member
  IF v_org_creator != p_user_id THEN
    RAISE EXCEPTION 'Only the organization creator can add the first member';
  END IF;

  -- ============================================================================
  -- VALIDATION 3: Verify organization has ZERO members (first member only)
  -- ============================================================================
  -- This function should ONLY be used for the initial member
  -- Subsequent members must use normal RLS-protected INSERT
  SELECT COUNT(*) INTO v_member_count
  FROM organization_members
  WHERE organization_id = p_organization_id;

  IF v_member_count > 0 THEN
    RAISE EXCEPTION 'Organization already has members. Use normal INSERT for additional members.';
  END IF;

  -- ============================================================================
  -- VALIDATION 4: Verify user is adding themselves
  -- ============================================================================
  -- Creator should only add themselves as first member
  IF p_user_id != (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Can only add yourself as first member';
  END IF;

  -- ============================================================================
  -- INSERT FIRST MEMBER (Bypasses RLS)
  -- ============================================================================
  -- All validations passed - safe to insert without RLS check
  INSERT INTO organization_members (organization_id, user_id, role_id)
  VALUES (p_organization_id, p_user_id, p_role_id)
  RETURNING id INTO v_new_member_id;

  -- Return the ID of the newly created member record
  RETURN v_new_member_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise any exceptions with context
    RAISE EXCEPTION 'Error adding first organization member: %', SQLERRM;
END;
$$;

-- ============================================================================
-- GRANT EXECUTION PERMISSIONS
-- ============================================================================

-- Only authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.add_first_organization_member(UUID, UUID, UUID)
TO authenticated;

-- Revoke from anonymous/public for security
REVOKE EXECUTE ON FUNCTION public.add_first_organization_member(UUID, UUID, UUID)
FROM anon, public;

-- ============================================================================
-- FUNCTION DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION public.add_first_organization_member IS
'SECURITY DEFINER function to add the first member to a new organization, bypassing RLS.

This function resolves the RLS recursion issue where adding the first member fails because
the RLS policy checks if the user is an admin (which requires querying an empty table).

Security Features:
- Validates user is the organization creator
- Validates organization has exactly 0 members (first member only)
- Validates user is adding themselves
- SET search_path prevents injection attacks
- Subsequent members use normal RLS (this is for first member ONLY)

Usage:
  SELECT add_first_organization_member(
    ''org-uuid''::uuid,
    ''user-uuid''::uuid,
    ''role-uuid''::uuid
  );
';

-- ============================================================================
-- VERIFICATION QUERIES (Run these to test the fix)
-- ============================================================================

-- Check function was created successfully
-- SELECT routine_name, security_type, routine_definition
-- FROM information_schema.routines
-- WHERE routine_name = 'add_first_organization_member';

-- Test the function (replace UUIDs with real values)
-- SELECT add_first_organization_member(
--   '[org-id]'::uuid,
--   '[user-id]'::uuid,
--   '[role-id]'::uuid
-- );
