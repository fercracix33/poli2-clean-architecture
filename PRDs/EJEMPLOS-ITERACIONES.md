# Ejemplos de Iteraciones - Sistema TDD v2.0

**Versión**: 2.0
**Fecha**: 2025-10-24
**Propósito**: Ejemplos prácticos de iteraciones reales

---

## 📋 Índice

1. [Ejemplo: Test Agent - Iteración Aprobada](#ejemplo-test-agent---iteración-aprobada)
2. [Ejemplo: Test Agent - Iteración Rechazada](#ejemplo-test-agent---iteración-rechazada)
3. [Ejemplo: Implementer - Con Handoff](#ejemplo-implementer---con-handoff)
4. [Ejemplo: Feedback Efectivo vs Inefectivo](#ejemplo-feedback-efectivo-vs-inefectivo)

---

## Ejemplo: Test Agent - Iteración Aprobada

### Contexto
Feature: Crear tareas
Agent: Test Agent
Iteración: 01 (primera iteración)

### Archivo: `test-agent/01-iteration.md`

```markdown
# Test Agent - Iteration 01

**Agent**: Test Agent
**Iteration Number**: 01
**Date**: 2025-10-24 10:30
**Status**: Ready for Review
**Based on**: 00-request.md

---

## Context and Scope

**What was requested**:
Create comprehensive test suite for "Create Task" feature including:
- Unit tests for createTask use case
- Integration tests for POST /api/tasks endpoint
- E2E tests for task creation flow
- All tests should fail appropriately (no implementation yet)

---

## Work Completed

### Summary
Created complete test suite covering all acceptance criteria from 00-request.md.
Total: 36 tests (25 unit, 8 integration, 3 E2E)

### Detailed Breakdown

#### Unit Tests - createTask Use Case
**File**: `app/src/features/tasks/use-cases/createTask.test.ts`
**Tests**: 25

Key tests:
- ✅ Should create task with valid input
- ✅ Should validate title (min 1, max 200 chars)
- ✅ Should reject due_date in the past
- ✅ Should check user has access to project
- ✅ Should throw error if user lacks permissions
- ✅ Should validate project_id is valid UUID

#### Integration Tests - API Endpoint
**File**: `app/src/app/api/tasks/route.test.ts`
**Tests**: 8

Key tests:
- ✅ POST should return 201 with valid data
- ✅ POST should return 400 with invalid input
- ✅ POST should return 403 without permissions
- ✅ POST should return 401 without auth

#### E2E Tests - UI Flow
**File**: `tests/e2e/create-task.spec.ts`
**Tests**: 3

Scenarios:
- ✅ User creates task successfully
- ✅ User sees validation errors
- ✅ User without permissions sees error

---

## Technical Decisions

### Decision 1: Mock Strategy for Supabase
**Context**: Need to mock Supabase client without coupling to implementation
**Decision**: Use vi.mock() with factory pattern
**Justification**: Allows tests to define behavior without implementation details

```typescript
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(),
    })),
  })),
}));
```

### Decision 2: Test Data Fixtures
**Context**: Need consistent test data across tests
**Decision**: Create fixtures file with factory functions
**Justification**: DRY principle, easier to maintain

```typescript
// fixtures/tasks.ts
export const createValidTaskInput = (overrides = {}) => ({
  title: 'Test Task',
  description: 'Test description',
  due_date: new Date('2025-12-31'),
  project_id: '123e4567-e89b-12d3-a456-426614174000',
  ...overrides,
});
```

---

## Artifacts and Deliverables

### Files Created
```
app/src/features/tasks/
├── use-cases/
│   └── createTask.test.ts (25 tests, 350 lines)
app/src/app/api/tasks/
└── route.test.ts (8 tests, 180 lines)
tests/e2e/
└── create-task.spec.ts (3 scenarios, 120 lines)
tests/fixtures/
└── tasks.ts (factory functions)
```

---

## Evidence and Validation

### Test Results
```
 FAIL  app/src/features/tasks/use-cases/createTask.test.ts
  createTask
    ✗ should create task with valid input (2ms)
      ReferenceError: createTask is not defined
    ✗ should validate title min length (1ms)
      ReferenceError: createTask is not defined
    ... (23 more)

 FAIL  app/src/app/api/tasks/route.test.ts
  POST /api/tasks
    ✗ should return 201 with valid data (5ms)
      TypeError: Cannot read property 'POST' of undefined
    ... (7 more)

 FAIL  tests/e2e/create-task.spec.ts
  Create Task Flow
    ✗ User creates task successfully (1500ms)
      Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/tasks/new
    ... (2 more)

Test Suites: 3 failed, 3 total
Tests:       36 failed, 0 passed, 36 total
Coverage:    0% (expected - no implementation)
```

**✅ All tests fail as expected (functions/endpoints don't exist yet)**

---

## Coverage Against Requirements

### Requirements from 00-request.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| Unit tests for createTask | ✅ Complete | 25 tests covering all cases |
| Integration tests for API | ✅ Complete | 8 tests for all HTTP scenarios |
| E2E tests for UI flow | ✅ Complete | 3 scenarios covering happy/error paths |
| Mock Supabase client | ✅ Complete | Factory pattern implemented |
| Test fixtures | ✅ Complete | Factory functions in fixtures/ |
| >90% coverage target | ✅ Complete | Plan achieves 95% coverage |

### Acceptance Criteria Met

- [x] All acceptance criteria from PRD covered
- [x] Tests fail appropriately (not syntax errors)
- [x] Function signatures clearly defined
- [x] Mocks configured correctly
- [x] E2E tests include accessibility checks

---

## Quality Checklist

- [x] All work from 00-request.md objectives is complete
- [x] All acceptance criteria met
- [x] Tests follow TDD best practices
- [x] Only canonical tech stack used (Vitest, Playwright)
- [x] Tests fail appropriately
- [x] Documentation is complete
- [x] Ready for Architect + User review

---

## Review Status

**Submitted for Review**: 2025-10-24 10:30

### Architect Review
**Date**: 2025-10-24 11:00
**Status**: Approved ✅
**Feedback**:
- Complete coverage of all requirements
- Test structure is clear and maintainable
- Mocks are well configured
- E2E tests cover critical user flows
- Ready for implementation phase

### User Review
**Date**: 2025-10-24 11:15
**Status**: Approved ✅
**Feedback**:
- Tests cover all business scenarios I care about
- E2E flows match real user workflows
- No critical cases missing
```

**Resultado**: ✅ APROBADO → Continuar a Fase 2 (Implementer)

---

## Ejemplo: Test Agent - Iteración Rechazada

### Contexto
Misma feature, pero con problemas detectados en revisión

### Archivo: `test-agent/01-iteration.md` (versión con rechazo)

```markdown
[... todo igual hasta Review Status ...]

## Review Status

**Submitted for Review**: 2025-10-24 10:30

### Architect Review
**Date**: 2025-10-24 11:00
**Status**: Rejected ❌
**Feedback**:

**Issues Found**:

1. **Missing validation test** (CRITICAL)
   - Location: `createTask.test.ts`
   - Missing: Test for due_date in the past
   - Required test:
     ```typescript
     it('should reject task with due_date in the past', async () => {
       const input = createValidTaskInput({
         due_date: new Date('2020-01-01')
       });
       await expect(createTask(input, 'user-123'))
         .rejects.toThrow('Due date cannot be in the past');
     });
     ```

2. **Incomplete E2E coverage** (HIGH)
   - Location: `create-task.spec.ts`
   - Missing: Scenario when user lacks permissions
   - Required scenario:
     ```typescript
     test('User without permissions sees error', async ({ page }) => {
       // 1. Login as user without permissions
       // 2. Navigate to /tasks/new
       // 3. Fill form and submit
       // 4. Assert error message appears
       // 5. Assert task is NOT created
     });
     ```

3. **Mock configuration issue** (MEDIUM)
   - Location: `__mocks__/supabase.ts`
   - Problem: Mock doesn't return errors correctly
   - Fix: Update factory to support error responses:
     ```typescript
     insert: vi.fn().mockReturnValue({
       data: null,
       error: { message: 'Test error' }
     })
     ```

**Action Required**:
Please create iteration 02 addressing these 3 issues.

### User Review
**Date**: Pending
**Status**: Waiting for corrections
**Feedback**: Will review after Architect approval
```

**Resultado**: ❌ RECHAZADO → Test Agent debe crear `02-iteration.md`

---

### Archivo: `test-agent/02-iteration.md` (correcciones)

```markdown
# Test Agent - Iteration 02

**Agent**: Test Agent
**Iteration Number**: 02
**Date**: 2025-10-24 14:00
**Status**: Ready for Review
**Based on**: 01-iteration.md feedback

---

## Context and Scope

**What changed from previous iteration**:
Addressed all 3 issues from Architect feedback:
1. Added missing due_date validation test
2. Added missing E2E permissions scenario
3. Fixed Supabase mock error handling

---

## Work Completed

### Summary
- Fixed 3 issues from iteration 01 review
- Added 2 new tests (1 unit, 1 E2E)
- Updated mock configuration
- Total tests now: 38 (was 36)

### Detailed Changes

#### 1. Added Due Date Validation Test
**File**: `createTask.test.ts`
**Lines**: 156-165 (new)

```typescript
describe('date validations', () => {
  it('should reject task with due_date in the past', async () => {
    const input = createValidTaskInput({
      due_date: new Date('2020-01-01')
    });

    await expect(createTask(input, 'user-123'))
      .rejects.toThrow('Due date cannot be in the past');
  });
});
```

#### 2. Added Permissions E2E Test
**File**: `create-task.spec.ts`
**Lines**: 95-115 (new)

```typescript
test('User without permissions sees error', async ({ page }) => {
  // Login as user without project access
  await loginAs(page, 'user-no-permissions@test.com');

  // Navigate to create task page
  await page.goto('/tasks/new');

  // Fill and submit form
  await page.fill('[name="title"]', 'Test Task');
  await page.fill('[name="project_id"]', 'project-123');
  await page.click('button[type="submit"]');

  // Assert error appears
  await expect(page.locator('[role="alert"]'))
    .toContainText('You do not have permission');

  // Assert task was NOT created
  await page.goto('/tasks');
  await expect(page.locator('text=Test Task')).not.toBeVisible();
});
```

#### 3. Fixed Mock Configuration
**File**: `__mocks__/supabase.ts`
**Lines**: 45-52 (modified)

```typescript
// Before (broken)
insert: vi.fn().mockReturnValue({ data: [...] })

// After (fixed)
insert: vi.fn((data) => {
  // Can now simulate errors
  if (mockShouldFail) {
    return { data: null, error: { message: 'Mock error' } };
  }
  return { data: [data], error: null };
})
```

---

## Evidence and Validation

### Test Results (New)
```
 FAIL  app/src/features/tasks/use-cases/createTask.test.ts
  ... (25 previous tests still failing as expected)
  date validations
    ✗ should reject task with due_date in the past (2ms)
      ReferenceError: createTask is not defined

 FAIL  tests/e2e/create-task.spec.ts
  ... (3 previous scenarios)
  ✗ User without permissions sees error (1800ms)
    Error: page.goto: net::ERR_CONNECTION_REFUSED

Test Suites: 3 failed, 3 total
Tests:       38 failed, 0 passed, 38 total (was 36)
Coverage:    0% (expected)
```

**✅ New tests also fail appropriately**

---

## Coverage Against Feedback

| Issue from Review | Status | Evidence |
|-------------------|--------|----------|
| Missing due_date test | ✅ Fixed | Line 156-165 in createTask.test.ts |
| Missing permissions E2E | ✅ Fixed | Line 95-115 in create-task.spec.ts |
| Mock error handling | ✅ Fixed | Line 45-52 in __mocks__/supabase.ts |

---

## Quality Checklist

- [x] All feedback from iteration 01 addressed
- [x] New tests fail appropriately
- [x] No breaking changes to existing tests
- [x] Documentation updated
- [x] Ready for re-review

---

## Review Status

**Submitted for Review**: 2025-10-24 14:00

### Architect Review
**Date**: 2025-10-24 14:30
**Status**: Approved ✅
**Feedback**:
- All 3 issues resolved correctly
- New tests are well structured
- Mock fix is elegant and maintainable
- Ready for implementation phase

### User Review
**Date**: 2025-10-24 14:45
**Status**: Approved ✅
**Feedback**:
- Permissions scenario covers important business case
- All critical flows now tested
```

**Resultado**: ✅ APROBADO en iteración 02 → Continuar a Fase 2

---

## Ejemplo: Implementer - Con Handoff

### Contexto
Implementer trabaja en paralelo mientras Test Agent itera

### Archivo: `test-agent/handoff-001.md`

```markdown
# Handoff - Test Agent to Implementer

**From**: Test Agent
**To**: Implementer
**Date**: 2025-10-24 11:30
**Purpose**: Enable Implementer to start while Test Agent is in iteration 02

---

## Important Notice

This handoff is based on Test Agent iteration 01.
**Status**: Test Agent is currently working on iteration 02 (corrections)

**What this means**:
- Core interfaces are stable (won't change)
- Some test details may be updated in iteration 02
- Check with Architect before relying on specific test implementations

---

## Information Transfer

### Function Signature (STABLE)

```typescript
// This signature is FINAL - do not change
export async function createTask(
  input: CreateTaskInput,
  userId: string
): Promise<Task>;
```

### Input/Output Contracts (STABLE)

```typescript
// From entities.ts (approved by Architect)
interface CreateTaskInput {
  title: string;          // min 1, max 200
  description?: string;   // max 5000
  due_date?: Date;
  project_id: string;     // UUID
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: Date | null;
  project_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
```

### Expected Service Interface

```typescript
// You will need these from Supabase Agent (not implemented yet)
// For now, just define the interface and call it

interface TaskService {
  create(data: {
    title: string;
    description?: string;
    due_date?: Date;
    project_id: string;
    created_by: string;
  }): Promise<Task>;

  checkUserCanAccessProject(
    userId: string,
    projectId: string
  ): Promise<boolean>;
}
```

### Business Rules to Implement

From tests, these validations are required:

1. **Input validation**: Use CreateTaskInputSchema.parse()
2. **Due date validation**: Reject if due_date < now
3. **Permission check**: Call checkUserCanAccessProject()
4. **Error handling**: Throw descriptive errors

---

## What Implementer Can Do

### Safe to Implement Now

```typescript
// app/src/features/tasks/use-cases/createTask.ts

import { CreateTaskInputSchema, type Task } from '../entities';
import { taskService } from '../services/task.service'; // Won't exist yet

export async function createTask(
  input: unknown,
  userId: string
): Promise<Task> {
  // 1. Validate input (SAFE - schema is approved)
  const validatedInput = CreateTaskInputSchema.parse(input);

  // 2. Business validations (SAFE - from tests)
  if (validatedInput.due_date && validatedInput.due_date < new Date()) {
    throw new Error('Due date cannot be in the past');
  }

  // 3. Check permissions (SAFE - interface is stable)
  const canAccess = await taskService.checkUserCanAccessProject(
    userId,
    validatedInput.project_id
  );

  if (!canAccess) {
    throw new Error('User does not have access to this project');
  }

  // 4. Create task (SAFE - interface is stable)
  const task = await taskService.create({
    ...validatedInput,
    created_by: userId,
  });

  return task;
}
```

---

## Constraints

**DO**:
- ✅ Implement function with exact signature above
- ✅ Use CreateTaskInputSchema for validation
- ✅ Call taskService methods (define interface)
- ✅ Implement business validations from tests

**DO NOT**:
- ❌ Change function signature
- ❌ Implement taskService (Supabase Agent will do it)
- ❌ Read test-agent/01-iteration.md directly
- ❌ Skip validations to make tests pass faster

---

## Coordination

**If Test Agent iteration 02 changes interfaces** (unlikely):
- Architect will create handoff-002.md
- Architect will notify you
- You'll adjust your code accordingly

**Current status**: Interfaces are stable, safe to proceed

---

**Prepared by**: Architect Agent
**Date**: 2025-10-24 11:30
```

### Archivo: `implementer/01-iteration.md` (usando handoff)

```markdown
# Implementer - Iteration 01

**Based on**:
- implementer/00-request.md
- test-agent/handoff-001.md

**Date**: 2025-10-24 12:00

---

## Context

Started implementation using stable interfaces from Test Agent handoff.
Test Agent is still in iteration 02, but core contracts are final.

---

## Work Completed

### createTask Use Case

**File**: `app/src/features/tasks/use-cases/createTask.ts`

Implemented following handoff interfaces exactly.

```typescript
import { CreateTaskInputSchema, type Task } from '../entities';
import { taskService } from '../services/task.service';

export async function createTask(
  input: unknown,
  userId: string
): Promise<Task> {
  // Validation
  const validatedInput = CreateTaskInputSchema.parse(input);

  // Business rules
  if (validatedInput.due_date && validatedInput.due_date < new Date()) {
    throw new Error('Due date cannot be in the past');
  }

  // Authorization
  const canAccess = await taskService.checkUserCanAccessProject(
    userId,
    validatedInput.project_id
  );

  if (!canAccess) {
    throw new Error('User does not have access to this project');
  }

  // Delegation to service
  return await taskService.create({
    ...validatedInput,
    created_by: userId,
  });
}
```

---

## Evidence

### Tests Passing

```
 PASS  app/src/features/tasks/use-cases/createTask.test.ts
  createTask
    ✓ should create task with valid input (15ms)
    ✓ should validate title min length (8ms)
    ✓ should reject due_date in the past (12ms)
    ✓ should check user has access (10ms)
    ... (21 more passing)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Coverage:    95% (use case layer)
```

**✅ All use case tests passing**

[... resto de iteración ...]
```

---

## Ejemplo: Feedback Efectivo vs Inefectivo

### ❌ Feedback Inefectivo

```
"Los tests no están bien"
"Falta algo importante"
"Hazlo mejor"
"Hay problemas de calidad"
"No cumple los requisitos"
```

**Problema**: Agente no sabe QUÉ corregir ni CÓMO

---

### ✅ Feedback Efectivo

```
**Issue 1**: Missing validation test
**Severity**: CRITICAL
**Location**: createTask.test.ts (expected around line 150)
**Problem**: No test validates that due_date cannot be in the past
**Required fix**:
  Add test case:
  it('should reject task with due_date in the past', async () => {
    const input = createValidTaskInput({
      due_date: new Date('2020-01-01')
    });
    await expect(createTask(input, 'user-123'))
      .rejects.toThrow('Due date cannot be in the past');
  });

**Issue 2**: E2E test missing permissions scenario
**Severity**: HIGH
**Location**: create-task.spec.ts (add as new scenario)
**Problem**: No test covers user without permissions trying to create task
**Required fix**:
  Add E2E scenario:
  1. Login as user WITHOUT project access
  2. Navigate to /tasks/new
  3. Fill form with valid data
  4. Submit form
  5. Assert error message appears: "You do not have permission"
  6. Assert task was NOT created (check /tasks page)
```

**Ventaja**: Agente sabe EXACTAMENTE qué hacer

---

## Resumen de Patrones

### Patrón de Iteración Exitosa

1. Agente lee 00-request.md
2. Agente trabaja y documenta en 01-iteration.md
3. Agente notifica completitud
4. Arquitecto + Usuario revisan
5. ✅ APROBADO → Siguiente fase

---

### Patrón de Iteración con Correcciones

1. Agente lee 00-request.md
2. Agente trabaja y documenta en 01-iteration.md
3. Agente notifica completitud
4. Arquitecto + Usuario revisan
5. ❌ RECHAZADO con feedback específico
6. Agente lee feedback
7. Agente crea 02-iteration.md con correcciones
8. Agente notifica completitud de iteración 02
9. ✅ APROBADO en iteración 02 → Siguiente fase

---

### Patrón de Handoff para Paralelismo

1. Test Agent trabaja en 01-iteration.md
2. Arquitecto decide habilitar paralelismo
3. Arquitecto prepara test-agent/handoff-001.md
4. Implementer empieza trabajo usando handoff
5. Test Agent corrige en 02-iteration.md (paralelo)
6. Si interfaces cambian: Arquitecto actualiza handoff-002.md
7. Ambos terminan y son aprobados

---

**Versión**: 2.0
**Última Actualización**: 2025-10-24
**Mantenedor**: Architect Agent
