# Implementer Agent Request: RBAC Foundation - Phase 1

**Feature:** RBAC Foundation
**Phase:** 1 - Backend Only
**Request ID:** rbac-001-implementer-request
**Date:** 2025-01-27
**Status:** Ready for Implementation

---

## Context

You are the **Implementer Agent**, responsible for implementing the business logic (use cases) that make the Test Agent's tests pass. This is **Phase 1: Backend Only - MINIMAL USE CASES ONLY**.

**CRITICAL:** Phase 1 focuses on FOUNDATION, not features. You will implement ONLY 2 use cases:
1. `createWorkspace` - Create workspace and auto-assign Owner role
2. `assignRole` - Assign role to user in workspace

**Phase 1 has NO:**
- ❌ CASL implementation (Phase 3) - CASL types are defined in entities.ts, but you do NOT implement `defineAbilityFor`
- ❌ Complex business logic (Phase 5+)
- ❌ Permission checking use cases (Phase 3)
- ❌ Feature-specific use cases (Phase 5+)

Your use cases orchestrate calls to data services (implemented by Supabase Agent) and validate inputs with Zod.

---

## Objectives

### Primary Objectives
1. **Implement `createWorkspace` use case**: Create workspace and auto-assign Owner role
2. **Implement `assignRole` use case**: Assign role to user in workspace
3. **Validate inputs**: Use Zod schemas from entities.ts
4. **Orchestrate services**: Call data services (do NOT implement them)
5. **Handle errors**: Proper error handling and propagation
6. **Pass all tests**: Make Test Agent's tests green

### Success Criteria
- ✅ All use case tests pass (>90% coverage)
- ✅ Use cases validate inputs with Zod before calling services
- ✅ Use cases orchestrate service calls (do NOT implement data access)
- ✅ Error handling is clear and specific
- ✅ No business logic in services (keep services pure CRUD)
- ✅ TypeScript compiles without errors
- ✅ No modification of entities.ts or test files

---

## Detailed Requirements

### 1. createWorkspace Use Case

**Purpose:** Create a new workspace and automatically assign the Owner role to the creator.

**File:** `app/src/features/rbac/use-cases/createWorkspace.ts`

#### 1.1 Function Signature

```typescript
import { WorkspaceCreate, Workspace } from '../entities';

/**
 * Create Workspace Use Case
 *
 * Creates a new workspace and automatically assigns the Owner role to the creator.
 *
 * Business Rules:
 * - Workspace name must be 1-100 characters
 * - Owner is automatically added to workspace_users with Owner role
 * - Owner cannot be removed from workspace
 *
 * @param input - Workspace creation data (name, owner_id)
 * @returns Created workspace with id and timestamps
 * @throws ZodError if validation fails
 * @throws Error if workspace creation or role assignment fails
 */
export async function createWorkspace(
  input: WorkspaceCreate
): Promise<Workspace>;
```

#### 1.2 Implementation Requirements

**Step 1: Validate Input**
```typescript
// Validate input with Zod
const validatedInput = WorkspaceCreateSchema.parse(input);
```

**Step 2: Create Workspace**
```typescript
// Call workspaceService to create workspace
const workspace = await workspaceService.createWorkspace(validatedInput);
```

**Step 3: Get Owner Role ID**
```typescript
// Get the system Owner role
const ownerRole = await roleService.getRoleByName(SYSTEM_ROLES.OWNER);

if (!ownerRole) {
  throw new Error('System role "owner" not found. Database may not be seeded.');
}
```

**Step 4: Auto-Assign Owner Role**
```typescript
// Assign Owner role to creator
await roleService.assignRole({
  workspace_id: workspace.id,
  user_id: workspace.owner_id,
  role_id: ownerRole.id,
  invited_by: workspace.owner_id, // Self-invited
});
```

**Step 5: Return Workspace**
```typescript
return workspace;
```

#### 1.3 Error Handling

**Validation Errors:**
```typescript
try {
  const validatedInput = WorkspaceCreateSchema.parse(input);
} catch (error) {
  if (error instanceof ZodError) {
    throw new Error(`Invalid workspace data: ${error.message}`);
  }
  throw error;
}
```

**Service Errors:**
```typescript
try {
  const workspace = await workspaceService.createWorkspace(validatedInput);
} catch (error) {
  throw new Error(`Failed to create workspace: ${error.message}`);
}
```

**Owner Role Not Found:**
```typescript
if (!ownerRole) {
  throw new Error('System role "owner" not found. Database may not be seeded. Run migrations first.');
}
```

**Role Assignment Failure:**
```typescript
try {
  await roleService.assignRole({
    workspace_id: workspace.id,
    user_id: workspace.owner_id,
    role_id: ownerRole.id,
    invited_by: workspace.owner_id,
  });
} catch (error) {
  // Rollback? Or let it fail and cleanup manually?
  throw new Error(`Failed to assign Owner role: ${error.message}`);
}
```

#### 1.4 Test Compliance

**Tests to Pass (from Test Agent):**
- ✅ Should create workspace with owner
- ✅ Should auto-assign Owner role to creator
- ✅ Should validate workspace name with Zod
- ✅ Should validate owner_id is UUID
- ✅ Should reject name longer than 100 characters
- ✅ Should call workspaceService.createWorkspace
- ✅ Should call roleService.assignRole for Owner role

---

### 2. assignRole Use Case

**Purpose:** Assign a role to a user in a workspace.

**File:** `app/src/features/rbac/use-cases/assignRole.ts`

#### 2.1 Function Signature

```typescript
import { WorkspaceUserCreate, WorkspaceUser } from '../entities';

/**
 * Assign Role Use Case
 *
 * Assigns a role to a user within a workspace.
 *
 * Business Rules:
 * - User must exist (auth.users)
 * - Workspace must exist
 * - Role must exist
 * - One user can have different roles in different workspaces
 * - Cannot assign multiple roles to same user in same workspace (upsert logic)
 *
 * @param input - Role assignment data (workspace_id, user_id, role_id, invited_by)
 * @returns Workspace user assignment with joined_at timestamp
 * @throws ZodError if validation fails
 * @throws Error if workspace, role, or user not found
 */
export async function assignRole(
  input: WorkspaceUserCreate
): Promise<WorkspaceUser>;
```

#### 2.2 Implementation Requirements

**Step 1: Validate Input**
```typescript
// Validate input with Zod
const validatedInput = WorkspaceUserCreateSchema.parse(input);
```

**Step 2: Validate Workspace Exists**
```typescript
// Check if workspace exists
const workspace = await workspaceService.getWorkspaceById(
  validatedInput.workspace_id,
  validatedInput.invited_by // User inviting must have access
);

if (!workspace) {
  throw new Error(`Workspace ${validatedInput.workspace_id} not found or you do not have access.`);
}
```

**Step 3: Validate Role Exists**
```typescript
// Check if role exists (you'll need a roleService.getRoleById method)
const role = await roleService.getRoleById(validatedInput.role_id);

if (!role) {
  throw new Error(`Role ${validatedInput.role_id} not found.`);
}
```

**Step 4: Assign Role**
```typescript
// Call roleService to assign role
const assignment = await roleService.assignRole(validatedInput);

return assignment;
```

#### 2.3 Error Handling

**Validation Errors:**
```typescript
try {
  const validatedInput = WorkspaceUserCreateSchema.parse(input);
} catch (error) {
  if (error instanceof ZodError) {
    throw new Error(`Invalid role assignment data: ${error.message}`);
  }
  throw error;
}
```

**Workspace Not Found:**
```typescript
if (!workspace) {
  throw new Error(`Workspace ${validatedInput.workspace_id} not found or you do not have access to it.`);
}
```

**Role Not Found:**
```typescript
if (!role) {
  throw new Error(`Role ${validatedInput.role_id} not found.`);
}
```

**Service Errors:**
```typescript
try {
  const assignment = await roleService.assignRole(validatedInput);
  return assignment;
} catch (error) {
  throw new Error(`Failed to assign role: ${error.message}`);
}
```

#### 2.4 Test Compliance

**Tests to Pass (from Test Agent):**
- ✅ Should assign role to user in workspace
- ✅ Should validate all fields are UUIDs
- ✅ Should fail if workspace does not exist
- ✅ Should fail if role does not exist
- ✅ Should allow assigning same user to multiple workspaces
- ✅ Should call roleService.assignRole

---

### 3. Service Interfaces Expected

**You will CALL these services, NOT implement them. Supabase Agent implements them.**

#### 3.1 workspaceService Interface

```typescript
// app/src/features/rbac/services/workspace.service.ts
export const workspaceService = {
  /**
   * Create a new workspace in database
   * @param input Workspace data (name, owner_id)
   * @returns Created workspace with id and timestamps
   */
  createWorkspace(input: WorkspaceCreate): Promise<Workspace>;

  /**
   * Get workspace by ID with RLS enforcement
   * @param id Workspace UUID
   * @param userId User making the request (for RLS)
   * @returns Workspace or null if not found/no access
   */
  getWorkspaceById(id: string, userId: string): Promise<Workspace | null>;

  /**
   * Update workspace (owner only via RLS)
   * @param id Workspace UUID
   * @param input Update data (partial)
   * @param userId User making the request (for RLS)
   * @returns Updated workspace
   */
  updateWorkspace(
    id: string,
    input: WorkspaceUpdate,
    userId: string
  ): Promise<Workspace>;

  /**
   * Delete workspace (owner only via RLS, CASCADE all related data)
   * @param id Workspace UUID
   * @param userId User making the request (for RLS)
   */
  deleteWorkspace(id: string, userId: string): Promise<void>;
};
```

#### 3.2 roleService Interface

```typescript
// app/src/features/rbac/services/role.service.ts
export const roleService = {
  /**
   * Get all system roles (Owner, Admin, Member)
   * @returns Array of system roles
   */
  getSystemRoles(): Promise<Role[]>;

  /**
   * Get role by name
   * @param name Role name ('owner', 'admin', 'member')
   * @returns Role or null if not found
   */
  getRoleByName(name: string): Promise<Role | null>;

  /**
   * Get role by ID
   * @param id Role UUID
   * @returns Role or null if not found
   */
  getRoleById(id: string): Promise<Role | null>;

  /**
   * Assign role to user in workspace
   * @param input Role assignment data
   * @returns Workspace user assignment
   */
  assignRole(input: WorkspaceUserCreate): Promise<WorkspaceUser>;

  /**
   * Update user's role in workspace
   * @param workspaceId Workspace UUID
   * @param userId User UUID
   * @param input Role update (only role_id)
   * @returns Updated workspace user
   */
  updateUserRole(
    workspaceId: string,
    userId: string,
    input: WorkspaceUserUpdate
  ): Promise<WorkspaceUser>;

  /**
   * Remove user from workspace
   * @param workspaceId Workspace UUID
   * @param userId User UUID
   */
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;

  /**
   * Get user's membership in workspace
   * @param userId User UUID
   * @param workspaceId Workspace UUID
   * @returns Workspace user with role, or null if not a member
   */
  getWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceUser | null>;
};
```

**NOTE:** If `getRoleById` is missing, request Supabase Agent to add it in their iteration.

---

### 4. Directory Structure

**Use Cases Location:**
```
app/src/features/rbac/
├── use-cases/
│   ├── createWorkspace.ts       ← YOU implement this
│   ├── createWorkspace.test.ts  ← Test Agent created this (DO NOT MODIFY)
│   ├── assignRole.ts            ← YOU implement this
│   └── assignRole.test.ts       ← Test Agent created this (DO NOT MODIFY)
├── services/
│   ├── workspace.service.ts     ← Supabase Agent implements this
│   └── role.service.ts          ← Supabase Agent implements this
└── entities.ts                  ← Architect created this (DO NOT MODIFY)
```

---

### 5. Testing Requirements

#### 5.1 Run Tests

```bash
cd app && npm run test -- features/rbac/use-cases
```

**Expected Initial State:** All tests FAIL (functions not defined)

**Expected After Implementation:** All tests PASS

#### 5.2 Coverage Target

**Use Cases:** >90% coverage

```bash
cd app && npm run test:coverage -- features/rbac/use-cases
```

**Check Report:**
- createWorkspace.ts: >90%
- assignRole.ts: >90%

#### 5.3 Type Checking

```bash
cd app && npm run typecheck
```

**Expected:** No TypeScript errors in use-cases/

---

### 6. Strict TDD Workflow

**RED → GREEN → REFACTOR**

#### Step 1: RED (Tests Fail)
- Test Agent already created failing tests
- Run tests: All should fail with "function not defined"

#### Step 2: GREEN (Make Tests Pass)
- Implement `createWorkspace`
- Implement `assignRole`
- Run tests after each implementation
- Do NOT modify tests to make them pass

#### Step 3: REFACTOR (Improve Code)
- Refactor for readability
- Extract common validation logic if needed
- Keep tests green during refactoring

**CRITICAL:** If tests fail due to missing service methods, DO NOT implement services. Instead:
1. Mock services in tests (if allowed)
2. OR wait for Supabase Agent to implement services
3. Notify Architect if blockers occur

---

## Expected Deliverables

### Code Files to Create

**Use Cases:**
- ✅ `app/src/features/rbac/use-cases/createWorkspace.ts`
- ✅ `app/src/features/rbac/use-cases/assignRole.ts`

### Documentation

**Iteration Document:**
- ✅ `implementer/01-iteration.md`
  - Summary of implementation
  - Test results (all tests passing)
  - Coverage report
  - Decisions made
  - Blockers encountered (if any)
  - Code snippets (key parts)
  - Evidence (test output screenshots)

---

## Limitations

### What Implementer Agent CANNOT Do

**❌ Modify Test Files**
- Tests are immutable specification
- If tests are incorrect, notify Architect (do NOT modify)

**❌ Implement Data Services**
- Services are Supabase Agent's responsibility
- You CALL services, not implement them
- If service methods missing, notify Architect

**❌ Modify entities.ts**
- Entities are Architect's responsibility
- If schemas incorrect, notify Architect

**❌ Implement CASL defineAbilityFor**
- CASL implementation is Phase 3
- Phase 1 only has CASL types defined
- Do NOT create `abilities/defineAbility.ts`

**❌ Add Complex Business Logic**
- Phase 1 is MINIMAL
- Only orchestration logic (validate → call services)
- No complex rules, no permission checking

**❌ Read Other Agents' Folders**
- Only read `implementer/` folder
- Read `entities.ts` and `test files` for reference
- Architect coordinates info between agents

---

## Success Criteria

### Implementer Iteration 01 is APPROVED if:

- [ ] `createWorkspace` use case implemented and passing all tests
- [ ] `assignRole` use case implemented and passing all tests
- [ ] All inputs validated with Zod before calling services
- [ ] Use cases orchestrate service calls (no direct DB access)
- [ ] Error handling is clear and specific
- [ ] >90% test coverage on use cases
- [ ] TypeScript compiles without errors
- [ ] No tests modified
- [ ] No entities.ts modified
- [ ] No services implemented (only called)
- [ ] Iteration document complete with evidence

---

## Handoff to Next Agent

**After Implementer completes iteration 01:**

1. **Create** `implementer/01-iteration.md` documenting:
   - Use cases implemented
   - Test results (all green)
   - Coverage achieved
   - Service interfaces called
   - Decisions made
   - Blockers (if any)
   - Evidence (test output, coverage report)

2. **Notify** Architect: "Implementer iteration 01 complete, ready for review"

3. **Architect reviews** with Usuario, then:
   - **If APPROVED**: Architect prepares handoff info for Supabase Agent (may work in parallel)
   - **If REJECTED**: Architect provides specific feedback, Implementer creates `02-iteration.md`

**Do NOT advance without Architect approval.**

---

## Optional Handoff to Supabase Agent (Parallelism)

**If Architect enables parallelism:**

Architect may create `implementer/handoff-001.md` with:
- Service interfaces you defined/called
- Expected service behavior
- Mock data structures

This allows Supabase Agent to start implementing services while you finish use cases.

**Coordination:**
- If service interfaces change, Architect updates handoff
- You and Supabase Agent may iterate together
- Final integration test when both complete

---

## References

- **Master PRD:** `PRDs/rbac/001-foundation/architect/00-master-prd.md`
  - Section 5: Functional Requirements
  - Section 6: Data Contracts
- **entities.ts:** `app/src/features/rbac/entities.ts`
- **Test Files:**
  - `app/src/features/rbac/use-cases/createWorkspace.test.ts`
  - `app/src/features/rbac/use-cases/assignRole.test.ts`
- **Analysis Document:** `PRDs/_analysis/rbac-implementation-analysis.md`
  - Section 3.1: High-Level Architecture (Use Case Layer)
- **Implementer Skill:** `.claude/skills/implementer-agent-skill/SKILL.md`

---

## Common Mistakes to Avoid

**❌ Implementing Data Access in Use Cases**
```typescript
// WRONG
export async function createWorkspace(input: WorkspaceCreate) {
  const supabase = createClient();
  const { data } = await supabase.from('workspaces').insert(input);
  return data;
}
```

```typescript
// CORRECT
export async function createWorkspace(input: WorkspaceCreate) {
  const validatedInput = WorkspaceCreateSchema.parse(input);
  const workspace = await workspaceService.createWorkspace(validatedInput);
  // ... rest of orchestration
  return workspace;
}
```

**❌ Modifying Tests to Make Them Pass**
```typescript
// WRONG - Changing test expectations
it('should validate owner_id is UUID', async () => {
  // Modified test to accept non-UUID
  expect(createWorkspace({ name: 'Test', owner_id: 'not-uuid' })).resolves.toBeDefined();
});
```

**❌ Adding Business Logic Beyond Phase 1 Scope**
```typescript
// WRONG - CASL logic in Phase 1
export async function createWorkspace(input: WorkspaceCreate) {
  const ability = await defineAbilityFor(user, workspace); // Phase 3
  if (!ability.can('create', 'Workspace')) throw new Error('Unauthorized');
  // ...
}
```

```typescript
// CORRECT - Minimal orchestration only
export async function createWorkspace(input: WorkspaceCreate) {
  const validatedInput = WorkspaceCreateSchema.parse(input);
  const workspace = await workspaceService.createWorkspace(validatedInput);
  const ownerRole = await roleService.getRoleByName(SYSTEM_ROLES.OWNER);
  await roleService.assignRole({ ... });
  return workspace;
}
```

**❌ Not Validating Inputs**
```typescript
// WRONG - Skipping validation
export async function createWorkspace(input: any) {
  return await workspaceService.createWorkspace(input); // Unsafe
}
```

```typescript
// CORRECT - Always validate
export async function createWorkspace(input: WorkspaceCreate) {
  const validatedInput = WorkspaceCreateSchema.parse(input);
  return await workspaceService.createWorkspace(validatedInput);
}
```

---

**END OF IMPLEMENTER AGENT REQUEST**

**Prepared by:** Architect Agent
**Date:** 2025-01-27
**Status:** Ready for Implementation
**Next Agent:** Implementer (awaiting Test Agent completion + approval)
