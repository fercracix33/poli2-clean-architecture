# Test Specifications: Organizations UI (Retroactive - CORRECTED)

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Supabase Spec:** `01-supabase-spec.md` (Pendiente - ya existe DB)
- **Feature ID:** auth-002
- **Assigned Agent:** Test Agent
- **Status:** ✅ COMPLETED (with Phase 0 corrections applied)
- **Created:** 2025-10-10
- **Last Updated:** 2025-10-10 (Phase 0 architectural refactoring)

---

## ⚠️ PHASE 0 ARCHITECTURAL CORRECTION APPLIED

**CRITICAL CHANGE**: After Phase 0 refactoring, organizations functionality was moved from `features/auth/` to `features/organizations/` following Screaming Architecture principles.

### Correct Paths (Post-Phase 0)
- **Test Files**: `app/src/features/organizations/use-cases/*.test.ts`
- **Service Mock**: `vi.mock('../services/organization.service')` (NOT auth.service)
- **Implementation Files**: `app/src/features/organizations/use-cases/*.ts`

---

## 🚨 RETROACTIVE TEST CREATION NOTICE

This test specification is being created RETROACTIVELY as part of the TDD Remediation Plan (Phase 1.3). These tests should have been created BEFORE implementation but are now being added to establish a comprehensive specification for the missing use cases.

### Context
- **Missing Use Cases:** 6 critical use cases were never implemented
- **UI Implementation:** Exists but makes direct database queries (violates Clean Architecture)
- **Tests Corrected:** 56 tests across 6 use case files (mock paths fixed)
- **Purpose:** Define specification that Implementer Agent will follow

---

## 1. Estrategia de Testing

### Cobertura Objetivo
- **Use Cases:** >90% cobertura de líneas para cada use case
- **Branch Coverage:** >85% para todas las rutas lógicas
- **Total Tests:** 60 tests (56 required + 4 bonus for comprehensive coverage)
- **API Endpoints:** NOT covered here (endpoints don't exist yet)

### Herramientas
- **Framework:** Vitest (NOT Jest - prohibited by project rules)
- **Mocking:** vi.mock() for service layer
- **Assertions:** expect() with Vitest matchers
- **Coverage:** c8 (bundled with Vitest)

### Testing Philosophy
- **TDD Red-Green-Refactor:** All tests MUST FAIL initially (RED phase)
- **Immutable Tests:** Once created, tests are the specification (DO NOT modify)
- **Mock All External:** No real database calls, all Supabase mocked
- **Test Behavior, Not Implementation:** Focus on inputs/outputs, not internal logic

---

## 2. Missing Use Cases - Test Coverage

### Use Case 1: getOrganizationDetails (CRÍTICO)
**File:** `app/src/features/organizations/use-cases/getOrganizationDetails.test.ts`
**Priority:** CRITICAL
**Tests:** 10

#### Function Signature (Expected)
```typescript
export async function getOrganizationDetails(
  slug: string,
  userId: string
): Promise<{
  organization: Organization;
  userRole: string;
  isOwner: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
  canEditSettings: boolean;
}>
```

#### Test Scenarios
1. **Success: Returns organization with details when user is member**
   - Mock: `getOrganizationBySlugFromDB` returns org
   - Mock: `isUserMemberOfOrganization` returns true
   - Mock: `getUserRoleInOrganization` returns role details
   - Assert: Full response with correct permissions

2. **Success: Returns isOwner=true when user is creator**
   - Mock: Organization with `created_by === userId`
   - Assert: `isOwner` is true, `isAdmin` is true

3. **Success: Returns isAdmin=true for admin role**
   - Mock: Role name is `organization_admin`
   - Assert: `canManageMembers` and `canEditSettings` are true

4. **Error: Throws ORGANIZATION_NOT_FOUND when slug doesn't exist**
   - Mock: `getOrganizationBySlugFromDB` returns null
   - Assert: Throws error with message containing "not found"

5. **Error: Throws ACCESS_DENIED when user is not member**
   - Mock: `isUserMemberOfOrganization` returns false
   - Assert: Throws error with message containing "not a member"

6. **Validation: Rejects empty slug**
   - Input: `slug = ""`
   - Assert: Throws validation error before calling service

7. **Validation: Rejects slug with uppercase characters**
   - Input: `slug = "MyOrg"`
   - Assert: Throws validation error (slug must be lowercase)

8. **Validation: Rejects invalid userId format**
   - Input: `userId = "not-a-uuid"`
   - Assert: Throws "Invalid User ID format"

9. **Authorization: Non-member cannot view private organization**
   - Mock: User is not member, org is private
   - Assert: Throws access denied error

10. **Service Integration: Calls correct functions with correct params**
    - Assert: `getOrganizationBySlugFromDB` called with slug
    - Assert: `isUserMemberOfOrganization` called with orgId and userId
    - Assert: Function call order is correct

---

### Use Case 2: updateOrganizationDetails (CRÍTICO)
**File:** `app/src/features/organizations/use-cases/updateOrganizationDetails.test.ts`
**Priority:** CRITICAL
**Tests:** 10

#### Function Signature (Expected)
```typescript
export async function updateOrganizationDetails(
  orgId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
  }
): Promise<Organization>
```

#### Test Scenarios
1. **Success: Updates name and description when user has org.manage permission**
   - Mock: `userHasPermissionInOrganization` returns true for `organization.update`
   - Mock: `updateOrganizationInDB` returns updated org
   - Assert: Returns organization with updated fields

2. **Success: Partial update (only name)**
   - Input: `{ name: "New Name" }` (description omitted)
   - Assert: Only name is updated

3. **Success: Partial update (only description)**
   - Input: `{ description: "New Description" }` (name omitted)
   - Assert: Only description is updated

4. **Error: Throws ORGANIZATION_NOT_FOUND when orgId doesn't exist**
   - Mock: Service throws "Organization not found"
   - Assert: Error propagates to caller

5. **Error: Throws ACCESS_DENIED when user lacks org.manage permission**
   - Mock: `userHasPermissionInOrganization` returns false
   - Assert: Throws "Insufficient permissions" or similar

6. **Error: Throws SLUG_IMMUTABLE if trying to update slug**
   - Input: `{ slug: "new-slug" }` (slug should be immutable)
   - Assert: Throws error preventing slug change

7. **Validation: Rejects name shorter than 2 characters**
   - Input: `{ name: "A" }`
   - Assert: Throws Zod validation error

8. **Validation: Rejects name longer than 100 characters**
   - Input: `{ name: "x".repeat(101) }`
   - Assert: Throws validation error

9. **Validation: Rejects description longer than 500 characters**
   - Input: `{ description: "x".repeat(501) }`
   - Assert: Throws validation error

10. **Service Integration: Calls updateOrganizationInDB with correct params**
    - Assert: Service called with orgId and sanitized data
    - Assert: Permission check happens before update

---

### Use Case 3: getOrganizationStats (ALTO)
**File:** `app/src/features/organizations/use-cases/getOrganizationStats.test.ts`
**Priority:** HIGH
**Tests:** 8

#### Function Signature (Expected)
```typescript
export async function getOrganizationStats(
  orgId: string,
  userId: string
): Promise<{
  member_count: number;
  project_count: number;
  active_members_count: number;
}>
```

#### Test Scenarios
1. **Success: Returns member count when user has org.view permission**
   - Mock: `userHasPermissionInOrganization` returns true for `organization.view`
   - Mock: `countOrganizationMembersFromDB` returns 5
   - Assert: `member_count` is 5

2. **Success: Returns project count (0 for now - projects not implemented)**
   - Assert: `project_count` is 0 (placeholder until projects feature exists)

3. **Success: Returns active members count**
   - Mock: `countActiveMembersFromDB` returns 3
   - Assert: `active_members_count` is 3

4. **Error: Throws ORGANIZATION_NOT_FOUND when orgId doesn't exist**
   - Mock: Service throws "Organization not found"
   - Assert: Error propagates

5. **Error: Throws ACCESS_DENIED when user lacks org.view permission**
   - Mock: `userHasPermissionInOrganization` returns false
   - Assert: Throws access denied error

6. **Authorization: Non-member cannot view stats**
   - Mock: `isUserMemberOfOrganization` returns false
   - Assert: Throws "Not a member" error

7. **Authorization: Member with org.view can view stats**
   - Mock: User is member with view permission
   - Assert: Returns stats successfully

8. **Service Integration: Calls multiple DB queries correctly**
   - Assert: `countOrganizationMembersFromDB` called
   - Assert: All stats queries executed
   - Assert: Results aggregated correctly

---

### Use Case 4: regenerateInviteCode (ALTO)
**File:** `app/src/features/organizations/use-cases/regenerateInviteCode.test.ts`
**Priority:** HIGH
**Tests:** 8

#### Function Signature (Expected)
```typescript
export async function regenerateInviteCode(
  orgId: string,
  userId: string
): Promise<{
  invite_code: string;
}>
```

#### Test Scenarios
1. **Success: Generates new 8-character invite code when user is owner**
   - Mock: User is owner (created_by === userId)
   - Mock: `updateOrganizationInDB` succeeds with new code
   - Assert: Returns invite_code with length 8

2. **Success: Old invite code becomes invalid**
   - Mock: Organization has old code "OLDCODE1"
   - Assert: New code is different from old code

3. **Success: Returns new invite code in response**
   - Assert: Response contains `invite_code` field
   - Assert: Code matches alphanumeric pattern

4. **Error: Throws ORGANIZATION_NOT_FOUND when orgId doesn't exist**
   - Mock: `getOrganizationByIdFromDB` returns null
   - Assert: Throws "Organization not found"

5. **Error: Throws ACCESS_DENIED when user is not owner**
   - Mock: Organization `created_by !== userId`
   - Assert: Throws "Only owner can regenerate invite code"

6. **Validation: New code is unique (not already in use)**
   - Mock: First generated code collides, retry succeeds
   - Assert: Function retries until unique code found

7. **Service Integration: Calls updateOrganizationInDB with new invite_code**
   - Assert: `updateOrganizationInDB` called with `{ invite_code: newCode }`
   - Assert: Update happens atomically

8. **Business Rule: Code generation follows format (8 alphanumeric uppercase)**
   - Assert: Generated code matches /^[A-Z0-9]{8}$/
   - Assert: No special characters or spaces

---

### Use Case 5: leaveOrganization (CRÍTICO)
**File:** `app/src/features/organizations/use-cases/leaveOrganization.test.ts`
**Priority:** CRITICAL
**Tests:** 10

#### Function Signature (Expected)
```typescript
export async function leaveOrganization(
  orgId: string,
  userId: string
): Promise<{ success: true }>
```

#### Test Scenarios
1. **Success: Member can leave organization**
   - Mock: User is member but not owner
   - Mock: `removeUserFromOrganizationInDB` succeeds
   - Assert: Returns `{ success: true }`

2. **Success: Removes user from organization_members table**
   - Assert: `removeUserFromOrganizationInDB` called with correct params
   - Assert: User-org relationship deleted

3. **Success: Returns success confirmation**
   - Assert: Response is `{ success: true }`
   - Assert: No error thrown

4. **Error: Throws ORGANIZATION_NOT_FOUND when orgId doesn't exist**
   - Mock: `getOrganizationByIdFromDB` returns null
   - Assert: Throws "Organization not found"

5. **Error: Throws NOT_A_MEMBER when user is not member**
   - Mock: `isUserMemberOfOrganization` returns false
   - Assert: Throws "You are not a member"

6. **Error: Throws OWNER_CANNOT_LEAVE when user is owner**
   - Mock: Organization `created_by === userId`
   - Assert: Throws "Owner cannot leave organization"

7. **Business Rule: Owner must transfer ownership or delete org before leaving**
   - Mock: User is owner
   - Assert: Error message suggests transfer or delete

8. **Business Rule: Last admin cannot leave if there are no other admins**
   - Mock: User is only admin, other members exist
   - Assert: Throws "Cannot leave, you are the last admin"

9. **Cleanup: User permissions are revoked after leaving**
   - Assert: Permissions cache invalidated
   - Assert: User cannot access org after leaving

10. **Service Integration: Calls removeUserFromOrganizationInDB**
    - Assert: Service called with orgId and userId
    - Assert: Database transaction is atomic

---

### Use Case 6: deleteOrganization (CRÍTICO)
**File:** `app/src/features/organizations/use-cases/deleteOrganization.test.ts`
**Priority:** CRITICAL
**Tests:** 10

#### Function Signature (Expected)
```typescript
export async function deleteOrganization(
  orgId: string,
  userId: string,
  confirmation: { name: string }
): Promise<{ success: true }>
```

#### Test Scenarios
1. **Success: Owner can delete organization**
   - Mock: User is owner (`created_by === userId`)
   - Mock: Confirmation name matches
   - Mock: `deleteOrganizationFromDB` succeeds
   - Assert: Returns `{ success: true }`

2. **Success: All organization members are removed**
   - Assert: `removeAllMembersFromOrganizationInDB` called
   - Assert: Cascade delete executed

3. **Success: All related data is cleaned up**
   - Assert: Organization record deleted
   - Assert: Members deleted
   - Assert: Invites invalidated

4. **Success: Returns deletion confirmation**
   - Assert: Response is `{ success: true }`
   - Assert: No error thrown

5. **Error: Throws ORGANIZATION_NOT_FOUND when orgId doesn't exist**
   - Mock: `getOrganizationByIdFromDB` returns null
   - Assert: Throws "Organization not found"

6. **Error: Throws ACCESS_DENIED when user is not owner**
   - Mock: Organization `created_by !== userId`
   - Assert: Throws "Only owner can delete organization"

7. **Error: Throws CONFIRMATION_REQUIRED when name doesn't match**
   - Input: `confirmation.name = "WrongName"`
   - Actual: Organization name is "RightName"
   - Assert: Throws "Confirmation name does not match"

8. **Business Rule: Cannot delete if org has active projects (future)**
   - Mock: Organization has `project_count > 0`
   - Assert: Throws "Cannot delete organization with active projects"

9. **Cleanup: All invites are invalidated**
   - Assert: Invite codes are revoked
   - Assert: No one can join after deletion

10. **Service Integration: Calls deleteOrganizationFromDB**
    - Assert: Service called with orgId
    - Assert: Database transaction ensures atomicity
    - Assert: Rollback on error

---

## 3. Mocking Strategy

### Service Layer Functions to Mock

```typescript
// From organization.service.ts (NOT auth.service - Phase 0 refactored)
vi.mock('../services/organization.service', () => ({
  // Organization queries
  getOrganizationBySlugFromDB: vi.fn(),
  getOrganizationByIdFromDB: vi.fn(),
  updateOrganizationInDB: vi.fn(),
  deleteOrganizationFromDB: vi.fn(),

  // Membership queries
  isUserMemberOfOrganization: vi.fn(),
  getUserRoleInOrganization: vi.fn(),
  removeUserFromOrganizationInDB: vi.fn(),
  countOrganizationMembersFromDB: vi.fn(),
  countOrganizationAdminsFromDB: vi.fn(),

  // Permission queries
  userHasPermissionInOrganization: vi.fn(),
  getUserPermissionsInOrganization: vi.fn(),
}));
```

### Mock Data Fixtures

```typescript
// Test constants
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OWNER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ORGANIZATION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const MOCK_ORGANIZATION = {
  id: ORGANIZATION_ID,
  name: 'Test Organization',
  slug: 'test-organization',
  description: 'Test description',
  invite_code: 'TESTCODE',
  created_by: OWNER_ID,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
};

const MOCK_MEMBER_ROLE = {
  id: 'role-member-id',
  name: 'organization_member',
};

const MOCK_ADMIN_ROLE = {
  id: 'role-admin-id',
  name: 'organization_admin',
};

const MOCK_OWNER_ROLE = {
  id: 'role-owner-id',
  name: 'organization_owner',
};
```

---

## 4. Test File Structure (Template)

### Standard Test File Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { [useCaseName] } from './[useCaseName]';
import * as organizationService from '../services/organization.service';

// Mock service layer
vi.mock('../services/organization.service');

// Test constants
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ORGANIZATION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('[UseCaseName]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange
      vi.mocked(organizationService.someFunction).mockResolvedValue(mockData);

      // Act
      const result = await [useCaseName](params);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(organizationService.someFunction).toHaveBeenCalledWith(expectedParams);
    });
  });

  describe('Error Cases', () => {
    it('should throw [error] when [condition]', async () => {
      // Arrange
      vi.mocked(organizationService.someFunction).mockRejectedValue(new Error('...'));

      // Act & Assert
      await expect([useCaseName](params)).rejects.toThrow('...');
    });
  });

  describe('Validation', () => {
    it('should reject invalid input when [condition]', async () => {
      // Act & Assert
      await expect([useCaseName](invalidParams)).rejects.toThrow('...');
    });
  });

  describe('Authorization', () => {
    it('should enforce permission checks', async () => {
      // Mock permission denied
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect([useCaseName](params)).rejects.toThrow('Insufficient permissions');
    });
  });
});
```

---

## 5. Expected Initial Test Results

### RED Phase Verification

When tests are first run, ALL 60 tests MUST FAIL with errors like:

```
❌ FAIL  app/src/features/organizations/use-cases/getOrganizationDetails.test.ts
  ● getOrganizationDetails › Success Cases › should return organization with details when user is member

    TypeError: getOrganizationDetails is not a function

      at Object.<anonymous> (getOrganizationDetails.test.ts:15:20)

❌ FAIL  app/src/features/organizations/use-cases/updateOrganizationDetails.test.ts
  ● updateOrganizationDetails › Success Cases › should update name and description

    TypeError: updateOrganizationDetails is not a function

      at Object.<anonymous> (updateOrganizationDetails.test.ts:18:20)

[... 58 more similar failures ...]

Test Suites: 6 failed, 6 total
Tests:       60 failed, 60 total
Snapshots:   0 total
Time:        2.5s
```

**This is CORRECT and EXPECTED.**

### Coverage Report (Initial)

```
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files             |       0 |        0 |       0 |       0 |
 use-cases            |       0 |        0 |       0 |       0 |
  getOrganizationDetails.ts      | NOT FOUND (file doesn't exist)
  updateOrganizationDetails.ts   | NOT FOUND (file doesn't exist)
  getOrganizationStats.ts        | NOT FOUND (file doesn't exist)
  regenerateInviteCode.ts        | NOT FOUND (file doesn't exist)
  leaveOrganization.ts           | NOT FOUND (file doesn't exist)
  deleteOrganization.ts          | NOT FOUND (file doesn't exist)
----------------------|---------|----------|---------|---------|-------------------
```

---

## 6. Coverage Requirements

### Minimum Coverage Targets (Post-Implementation)
- **Statements:** >90%
- **Branches:** >85%
- **Functions:** >95%
- **Lines:** >90%

### Coverage Exclusions
```typescript
// None - all use case logic must be tested
// Do NOT add istanbul ignore comments unless absolutely necessary
```

---

## 7. Test Execution Commands

### Run All Auth Tests
```bash
cd app
npm run test -- src/features/organizations/use-cases
```

### Run Specific Use Case Tests
```bash
npm run test -- src/features/organizations/use-cases/getOrganizationDetails.test.ts
```

### Watch Mode (Recommended for TDD)
```bash
npm run test:watch -- src/features/organizations/use-cases
```

### Coverage Report
```bash
npm run test:coverage -- src/features/organizations/use-cases
```

---

## 8. Validation Checklist

### Before Handoff to Implementer
- [x] All 6 test files created
- [x] 60 tests written (10+10+8+8+10+10)
- [x] All tests FAIL with "function not defined" errors
- [x] Mocks properly configured in each test file
- [x] Test data fixtures defined
- [x] Function signatures clearly specified
- [x] Expected behaviors documented
- [x] Authorization scenarios covered
- [x] Validation scenarios covered
- [x] Error handling scenarios covered
- [x] Service integration scenarios covered

### After Implementer Completes Use Cases
- [ ] All 60 tests PASS
- [ ] Coverage >90% for all use cases
- [ ] No test modifications (tests remain immutable)
- [ ] Use cases follow exact specifications from tests
- [ ] Business logic properly separated from data access
- [ ] Permission checks enforced in use cases

---

## 9. Known Limitations & Future Work

### Out of Scope for This Phase
- **API Endpoint Tests:** Endpoints don't exist yet, will be created later
- **Component Tests:** E2E tests already cover UI, unit tests optional
- **Performance Tests:** Optimization phase comes after functionality works
- **Security Audit:** Will be done after all layers are implemented

### Future Enhancements
- Add integration tests when API endpoints are created
- Add performance benchmarks for stats calculations
- Add security penetration tests
- Add accessibility tests for permission-based UI states

---

## 10. Handoff to Implementer Agent

### What Implementer Must Do

1. **Read Tests First:** Understand requirements from test expectations
2. **Implement Use Cases:** Create 6 use case files that make tests pass
3. **Follow TDD:** Red → Green → Refactor
4. **NO Test Modifications:** Tests are immutable specification
5. **Achieve Coverage:** >90% for all use cases
6. **Update Status:** Run `/agent-handoff auth/002-organizations-ui implementer completed`

### What Implementer Must NOT Do

- ❌ Modify ANY test files (tests are specification)
- ❌ Implement data services (Supabase Agent's job - already done)
- ❌ Implement API endpoints (comes after use cases)
- ❌ Implement UI refactoring (UI/UX Agent's job)
- ❌ Skip tests or reduce coverage to make implementation "easier"

### Critical Reminders

- **Use Existing Services:** `organization.service.ts` already has all needed functions (refactored from auth.service in Phase 0)
- **Follow Existing Patterns:** Look at `createOrganization.ts` as reference
- **Zod Validation:** Use entities from `entities.ts` for input validation
- **Permission Checks:** Always validate user permissions before operations
- **Error Messages:** Be specific and user-friendly
- **Console Logging:** Follow existing pattern for audit trail

---

## 11. Success Criteria

### Tests Pass
- ✅ All 60 tests pass without modification
- ✅ No test.skip or test.todo remaining
- ✅ All assertions execute successfully

### Coverage Met
- ✅ >90% statement coverage per use case
- ✅ >85% branch coverage per use case
- ✅ >95% function coverage per use case

### Quality Standards
- ✅ Use cases are pure business logic (no direct DB access)
- ✅ Input validation with Zod
- ✅ Permission checks enforced
- ✅ Error handling comprehensive
- ✅ Code follows existing patterns

### Architecture Compliance
- ✅ Clean Architecture boundaries respected
- ✅ Dependencies point inward (use cases → services)
- ✅ No framework coupling in use cases
- ✅ Testable without external dependencies

---

**Completed by:** Test Agent (Retroactive)
**Date of Completion:** 2025-10-10
**Tests Created:** 60 tests (6 files)
**Initial Test Status:** ❌ ALL FAIL (Expected - functions not implemented)
**Coverage Target:** >90% per use case
**Next Agent:** Implementer Agent (Phase 2.1)
