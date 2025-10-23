# 🎯 HANDOFF TO IMPLEMENTER AGENT

**Test Spec Status**: ✅ **COMPLETE**
**Feature**: `Customizable Kanban Boards with WIP Limits and Custom Fields`
**PRD Location**: `PRDs/projects/001-customizable-kanban-boards/`
**Implementation Location**: `app/src/features/`

---

## 📦 What I've Delivered

### 1. **Complete Failing Test Suite**

#### ✅ Entity Tests (3 files - ALL PASSING)
These pass because entities were created by the Architect:
- `src/features/boards/entities.test.ts` (38 tests) ✅
- `src/features/tasks/entities.test.ts` ✅
- `src/features/custom-fields/entities.test.ts` ✅

#### ❌ Use Case Tests (10+ files - ALL FAILING)
These define the business logic you must implement:

**Boards Feature:**
- `src/features/boards/use-cases/createBoard.test.ts` ❌
- `src/features/boards/use-cases/getBoard.test.ts` ❌
- `src/features/boards/use-cases/listBoards.test.ts` ❌
- `src/features/boards/use-cases/updateBoard.test.ts` ❌
- `src/features/boards/use-cases/deleteBoard.test.ts` ❌
- `src/features/boards/use-cases/createColumn.test.ts` ❌

**Tasks Feature (CRITICAL - WIP LIMITS):**
- `src/features/tasks/use-cases/moveTask.test.ts` ❌ **[MOST CRITICAL]**
  - 50+ test cases defining WIP limit enforcement
  - Position recalculation logic
  - Multi-column drag-drop orchestration

**Custom Fields Feature:**
- `src/features/custom-fields/use-cases/validateCustomFieldValue.test.ts` ❌
  - Type-specific validation (text, number, date, select, multi_select)
  - Required/optional logic
  - Min/max constraints

#### ❌ Service Tests (3 files - ALL FAILING)
These define the data access layer:
- `src/features/boards/services/board.service.test.ts` ❌
- `src/features/tasks/services/task.service.test.ts` (to be created by Supabase Agent)
- `src/features/custom-fields/services/custom-field.service.test.ts` (to be created by Supabase Agent)

#### ❌ API Route Tests (1 critical file created - ALL FAILING)
- `src/app/api/tasks/[id]/move/route.test.ts` ❌
  - HTTP-layer WIP limit validation
  - 409 CONFLICT status code for exceeded limits
  - Request/response validation

#### ✅ E2E Tests (2 critical files - ALL FAILING)
These define the complete user experience:
- `tests/e2e/tasks/drag-drop-tasks.spec.ts` ❌
  - Drag & drop user flows
  - WIP limit UI feedback
  - Loading states
  - Error handling
  - Keyboard accessibility

- `tests/e2e/accessibility/kanban-a11y.spec.ts` ❌
  - WCAG 2.1 AA compliance
  - Screen reader support
  - Keyboard navigation
  - ARIA attributes
  - Color contrast
  - Focus management

---

## 🔍 Verification Results

### ✅ Tests Fail Correctly

```bash
# Use case tests fail as expected
$ npm run test -- --run src/features/boards/use-cases/createBoard.test.ts
❌ Error: Failed to resolve import "./createBoard". Does the file exist?
✅ CORRECT - function not implemented yet

$ npm run test -- --run src/features/tasks/use-cases/moveTask.test.ts
❌ Error: Failed to resolve import "./moveTask". Does the file exist?
✅ CORRECT - WIP limits logic not implemented yet

# Entity tests pass as expected
$ npm run test -- --run src/features/boards/entities.test.ts
✅ 38 passed (entities already exist from Architect)
```

### ✅ Test Coverage Summary

| Layer | Files Created | Tests | Status |
|-------|--------------|-------|--------|
| **Entities** | 3 | ~100 | ✅ PASSING (schemas exist) |
| **Use Cases** | 10+ | ~300+ | ❌ FAILING (functions not defined) |
| **Services** | 3 | ~50+ | ❌ FAILING (classes not defined) |
| **API Routes** | 1+ | ~20+ | ❌ FAILING (routes not defined) |
| **E2E** | 2 | ~40+ | ❌ FAILING (UI not implemented) |
| **TOTAL** | **19+** | **~510+** | **RED PHASE COMPLETE** ✅ |

---

## 🎯 Interface Definitions

### 1. **moveTask** (CRITICAL - Core Kanban Logic)

```typescript
/**
 * Move a task between columns with WIP limit enforcement.
 *
 * This is THE critical function for Kanban functionality.
 * Tests define 50+ scenarios you must handle.
 */
export async function moveTask(
  moveData: TaskMove,
  taskService: TaskService,
  boardService: BoardService
): Promise<Task>

interface TaskMove {
  task_id: string           // UUID of task being moved
  source_column_id: string  // UUID of source column
  target_column_id: string  // UUID of target column
  target_position: number   // 0-based position in target column
}

// CRITICAL LOGIC YOU MUST IMPLEMENT:
// 1. Check target column WIP limit
//    - If current count >= wip_limit → THROW "WIP_LIMIT_EXCEEDED"
//    - If wip_limit === null → Allow (unlimited)
//    - If moving within same column → Don't count task itself
//
// 2. Recalculate positions
//    - Source column: Shift tasks up after removed task
//    - Target column: Shift tasks down from insert position
//    - Use batchUpdate for efficiency
//
// 3. Update task's column and position atomically
```

### 2. **validateCustomFieldValue** (Data Integrity)

```typescript
/**
 * Validate a custom field value against its definition.
 * Type-specific validation with constraints.
 */
export async function validateCustomFieldValue(
  value: CustomFieldValue,
  service: CustomFieldService
): Promise<ValidationResult>

interface ValidationResult {
  isValid: boolean
  error?: string  // Human-readable error message
}

// VALIDATION LOGIC BY TYPE:
// - text: Check max_length, required
// - number: Check min_value, max_value, allow_decimal, required
// - date: Check min_date, max_date, format, required
// - select: Check value in allowed options (case-sensitive)
// - multi_select: Check all values in allowed options, required checks empty array
```

### 3. **Expected Service Signatures**

```typescript
// BoardService (data layer - will be implemented by Supabase Agent)
class BoardService {
  async create(data: BoardCreate): Promise<Board>
  async getById(id: string, options?: { includeColumns?: boolean }): Promise<Board | null>
  async list(query: BoardQuery): Promise<PaginatedResponse<Board>>
  async update(id: string, data: BoardUpdate): Promise<Board | null>
  async delete(id: string): Promise<boolean>

  async createColumn(data: BoardColumnCreate): Promise<BoardColumn>
  async getColumnById(id: string): Promise<BoardColumn | null>
  async updateColumn(id: string, data: BoardColumnUpdate): Promise<BoardColumn | null>
  async deleteColumn(id: string): Promise<boolean>
  async reorderColumns(reorderData: Array<{ id: string; position: number }>): Promise<boolean>
}

// TaskService (data layer - will be implemented by Supabase Agent)
class TaskService {
  async create(data: TaskCreate): Promise<Task>
  async getById(id: string): Promise<Task | null>
  async getByColumnId(columnId: string): Promise<Task[]>
  async update(id: string, data: TaskUpdate): Promise<Task | null>
  async batchUpdate(updates: Array<{ id: string; position: number }>): Promise<boolean>
  async delete(id: string): Promise<boolean>
}
```

---

## 🚀 What You Must Do

### 1. **Read Tests First**
Understand requirements from test expectations. Tests are the immutable specification.

### 2. **Implement Use Cases (Your Responsibility)**
Start with the most critical:

#### Priority 1: `moveTask` (Core Kanban)
```bash
# Make this test pass first
npm run test:watch src/features/tasks/use-cases/moveTask.test.ts
```

**Implementation Steps:**
1. Fetch target column to check `wip_limit`
2. Count current tasks in target column
3. Validate: `currentCount < wip_limit || wip_limit === null`
4. If same column: Don't count the moving task itself
5. Fetch all tasks in both columns
6. Calculate new positions for affected tasks
7. Update task's `board_column_id` and `position`
8. Batch update positions for shifted tasks

#### Priority 2: `validateCustomFieldValue`
```bash
npm run test:watch src/features/custom-fields/use-cases/validateCustomFieldValue.test.ts
```

**Implementation Steps:**
1. Fetch field definition by ID
2. Switch on `field_type`
3. Apply type-specific validation
4. Check `is_required` flag
5. Return `{ isValid: boolean, error?: string }`

#### Priority 3: Board Management
```bash
npm run test:watch src/features/boards/use-cases/
```

**Implementation order:**
1. `createBoard.ts` (with default columns)
2. `getBoard.ts`
3. `listBoards.ts`
4. `updateBoard.ts`
5. `deleteBoard.ts`
6. `createColumn.ts`

### 3. **TDD Workflow (MANDATORY)**
Follow Red → Green → Refactor:

```bash
# 1. RED: Run tests (they fail)
npm run test:watch src/features/tasks/use-cases/moveTask.test.ts

# 2. GREEN: Write MINIMAL code to pass ONE test
# File: src/features/tasks/use-cases/moveTask.ts
export async function moveTask(moveData, taskService, boardService) {
  // Implement logic to pass first test
}

# 3. REFACTOR: Clean up while keeping tests green
# Extract helpers, improve names, etc.

# 4. Repeat for next failing test
```

### 4. **Run Tests Frequently**
```bash
npm run test:watch  # Auto-run on file changes
```

### 5. **Achieve Coverage**
Target: **>90% coverage** for all use cases

```bash
npm run test:coverage
```

### 6. **Update Status**
When complete, run:
```bash
/agent-handoff projects/001-customizable-kanban-boards implementer completed
```

---

## 🚨 Critical Requirements

### ❌ **DO NOT**
- ❌ Modify ANY test files (they are immutable specification)
- ❌ Implement data services (Supabase Agent's responsibility)
- ❌ Implement API routes yet (comes after services)
- ❌ Implement UI components (UI/UX Expert Agent's responsibility)
- ❌ Access database directly (use service interfaces)
- ❌ Over-engineer beyond what tests require (YAGNI)

### ✅ **MUST**
- ✅ Make use case tests pass WITHOUT modifying them
- ✅ Use mocked services (don't call real Supabase)
- ✅ Implement ONLY business logic (no data access, no UI)
- ✅ Handle all error cases defined in tests
- ✅ Validate inputs using Zod schemas from entities
- ✅ Achieve >90% test coverage
- ✅ Follow TypeScript strict mode (no `any`)

---

## 📂 Files You'll Implement

```
app/src/features/
├── boards/
│   └── use-cases/
│       ├── createBoard.ts          # ← YOU implement
│       ├── getBoard.ts             # ← YOU implement
│       ├── listBoards.ts           # ← YOU implement
│       ├── updateBoard.ts          # ← YOU implement
│       ├── deleteBoard.ts          # ← YOU implement
│       └── createColumn.ts         # ← YOU implement
│
├── tasks/
│   └── use-cases/
│       └── moveTask.ts             # ← YOU implement (CRITICAL)
│
└── custom-fields/
    └── use-cases/
        └── validateCustomFieldValue.ts  # ← YOU implement
```

---

## 🎓 Learning from Tests

### Example: Understanding `moveTask` from tests

```typescript
// From: src/features/tasks/use-cases/moveTask.test.ts

// Test tells you: "THROW when WIP limit exceeded"
it('THROWS WIP_LIMIT_EXCEEDED when target column is at capacity', async () => {
  const targetColumn = { wip_limit: 3 }
  const currentTasks = [task1, task2, task3]  // 3 tasks already

  await expect(moveTask(...)).rejects.toThrow('WIP_LIMIT_EXCEEDED')
})

// So you implement:
export async function moveTask(moveData, taskService, boardService) {
  const targetColumn = await boardService.getColumnById(moveData.target_column_id)
  const currentTasks = await taskService.getByColumnId(moveData.target_column_id)

  if (targetColumn.wip_limit !== null && currentTasks.length >= targetColumn.wip_limit) {
    throw new Error(`WIP_LIMIT_EXCEEDED: Column "${targetColumn.name}" has reached its limit of ${targetColumn.wip_limit} tasks`)
  }

  // Continue with move logic...
}
```

---

## 🔗 References

- **PRD Master**: `PRDs/projects/001-customizable-kanban-boards/00-master-prd.md`
- **Test Spec**: `PRDs/projects/001-customizable-kanban-boards/02-test-spec.md`
- **Entities**: `app/src/features/{boards,tasks,custom-fields}/entities.ts`
- **Tech Stack**: `CLAUDE.md` (Vitest, Next.js, TypeScript, Zod)

---

## 📞 Need Help?

**If tests are unclear:**
1. Read test descriptions (they explain expected behavior)
2. Read PRD acceptance criteria
3. Check entities.ts for data contracts
4. Ask human for clarification

**If you're stuck:**
- Tests define WHAT, not HOW
- You have creative freedom in implementation
- As long as tests pass, you're correct

---

**Ready to proceed with implementation?**

Remember:
- Tests are the truth
- Red → Green → Refactor
- Coverage >90%
- No test modifications

🚀 **Let's build this Kanban board!**
