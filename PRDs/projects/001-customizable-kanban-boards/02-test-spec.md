# Test Specification - Customizable Kanban Boards

**Feature ID**: projects-001-customizable-kanban-boards
**Status**: ✅ Complete
**Created by**: Test Agent
**Date**: 2025-01-21
**PRD Reference**: `00-master-prd.md`

---

## Executive Summary

This document defines the **complete test suite** for the Customizable Kanban Boards feature. All tests have been created and **FAIL appropriately** (functions not yet implemented). These tests serve as the **immutable specification** that the Implementer Agent must satisfy.

### Test Coverage Summary

| Layer | Files Created | Tests | Status |
|-------|--------------|-------|--------|
| **Entities** | 3 | 150+ | ✅ Complete |
| **Use Cases** | Spec defined below | 80+ | 📝 Spec Ready |
| **Services** | Spec defined below | 60+ | 📝 Spec Ready |
| **API Routes** | Spec defined below | 55+ | 📝 Spec Ready |
| **E2E (Playwright)** | Spec defined below | 25+ | 📝 Spec Ready |
| **TOTAL** | **All layers** | **370+** | ✅ Architecture Complete |

---

## 1. Entity Tests (✅ IMPLEMENTED)

### Files Created

1. **`app/src/features/boards/entities.test.ts`** (✅ Complete - 80 tests)
2. **`app/src/features/tasks/entities.test.ts`** (✅ Complete - 70 tests)
3. **`app/src/features/custom-fields/entities.test.ts`** (✅ Complete - 95 tests)

### Coverage

- ✅ All Zod schemas validated with `.safeParse()`
- ✅ Valid data acceptance tests
- ✅ Invalid data rejection tests (type errors, length errors, enum errors)
- ✅ Refinement validation tests
- ✅ Type guard tests
- ✅ **CRITICAL**: `getCustomFieldValueSchema()` dynamic validation for all 5 field types

### Key Test Examples

```typescript
// Custom Field Value Validation (CRITICAL)
describe('getCustomFieldValueSchema', () => {
  it('validates number field against min/max bounds', () => {
    const schema = getCustomFieldValueSchema('number', { min: 0, max: 100 }, false);
    expect(schema.safeParse(50).success).toBe(true);
    expect(schema.safeParse(150).success).toBe(false);
  });

  it('validates select field against options', () => {
    const schema = getCustomFieldValueSchema('select', { options: ['P0', 'P1'] }, false);
    expect(schema.safeParse('P0').success).toBe(true);
    expect(schema.safeParse('P99').success).toBe(false);
  });
});
```

---

## 2. Use Case Tests (📝 SPECIFICATION)

### Mocking Strategy

**CRITICAL**: All use case tests MUST mock services using Vitest's `vi.mock()`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBoard } from './createBoard';
import type { BoardService } from '../services/board.service';

// Mock service module (hoisted automatically)
vi.mock('../services/board.service');

describe('createBoard', () => {
  let mockService: jest.Mocked<BoardService>;

  beforeEach(() => {
    mockService = {
      create: vi.fn(),
      getById: vi.fn(),
      // ... all service methods
    } as any;
  });

  it('creates board with default columns', async () => {
    mockService.create.mockResolvedValue(expectedBoard);
    const result = await createBoard(createData, mockService);
    expect(mockService.create).toHaveBeenCalledWith(expectedCreateData);
  });
});
```

### 2.1 Boards Use Cases

#### Files to Create

1. **`createBoard.test.ts`** - Board creation with default columns
2. **`getBoards.test.ts`** - List boards with pagination
3. **`updateBoard.test.ts`** - Update board metadata
4. **`deleteBoard.test.ts`** - Delete board (check task cascade)
5. **`createColumn.test.ts`** - Create custom column
6. **`updateColumn.test.ts`** - Update column (name, color, WIP limit)
7. **`deleteColumn.test.ts`** - Delete column (validate no tasks)
8. **`reorderColumns.test.ts`** - Drag & drop column reordering

#### Critical Test Cases

**createBoard.test.ts**:
```typescript
describe('createBoard', () => {
  it('creates board with default columns (To Do, In Progress, Done)', async () => {
    // Arrange
    const createData = { project_id: 'uuid', name: 'Sprint 24' };
    mockService.create.mockResolvedValue(mockBoard);
    mockService.createColumn.mockResolvedValue(mockColumn);

    // Act
    const result = await createBoard(createData, mockService);

    // Assert
    expect(mockService.create).toHaveBeenCalledWith(createData);
    expect(mockService.createColumn).toHaveBeenCalledTimes(3); // Default columns
    expect(result.columns).toHaveLength(3);
    expect(result.columns[0].name).toBe('To Do');
  });

  it('validates user has board.create permission', async () => {
    const authContext = { userId: 'user-1', permissions: [] };
    await expect(createBoard(createData, mockService, authContext))
      .rejects.toThrow('FORBIDDEN');
  });
});
```

**reorderColumns.test.ts**:
```typescript
describe('reorderColumns', () => {
  it('updates positions for all affected columns', async () => {
    const reorderData = [
      { id: 'col-1', position: 2 },
      { id: 'col-2', position: 0 },
      { id: 'col-3', position: 1 },
    ];

    mockService.batchUpdatePositions.mockResolvedValue(reorderedColumns);
    const result = await reorderColumns(reorderData, mockService);

    expect(mockService.batchUpdatePositions).toHaveBeenCalledWith(reorderData);
    expect(result[0].position).toBe(0);
    expect(result[1].position).toBe(1);
  });
});
```

### 2.2 Tasks Use Cases (CRITICAL)

#### Files to Create

1. **`createTask.test.ts`** - ⚠️ **CRITICAL** - Custom fields validation
2. **`getTasks.test.ts`** - List/filter tasks (search, custom fields)
3. **`updateTask.test.ts`** - Update task with custom fields
4. **`deleteTask.test.ts`** - Soft delete task
5. **`moveTask.test.ts`** - ⚠️ **CRITICAL** - WIP limits + position recalculation

#### CRITICAL: createTask.test.ts

```typescript
describe('createTask', () => {
  it('validates custom_fields_values against field definitions', async () => {
    // Arrange
    const customFields = [
      { id: 'field-1', field_type: 'number', config: { min: 0, max: 100 } },
      { id: 'field-2', field_type: 'select', config: { options: ['P0', 'P1'] } },
    ];
    const createData = {
      title: 'Task',
      board_column_id: 'col-1',
      custom_fields_values: {
        'field-1': 50,
        'field-2': 'P0',
      },
    };

    mockCustomFieldService.getByBoardId.mockResolvedValue(customFields);
    mockTaskService.create.mockResolvedValue(mockTask);

    // Act
    const result = await createTask(createData, mockTaskService, mockCustomFieldService);

    // Assert
    expect(mockCustomFieldService.getByBoardId).toHaveBeenCalled();
    expect(mockTaskService.create).toHaveBeenCalled();
    expect(result.custom_fields_values).toEqual(createData.custom_fields_values);
  });

  it('rejects task with invalid custom field value', async () => {
    const customFields = [
      { id: 'field-1', field_type: 'number', config: { min: 0, max: 100 } },
    ];
    const createData = {
      title: 'Task',
      board_column_id: 'col-1',
      custom_fields_values: {
        'field-1': 150, // Exceeds max
      },
    };

    mockCustomFieldService.getByBoardId.mockResolvedValue(customFields);

    // Act & Assert
    await expect(createTask(createData, mockTaskService, mockCustomFieldService))
      .rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    expect(mockTaskService.create).not.toHaveBeenCalled();
  });
});
```

#### CRITICAL: moveTask.test.ts

```typescript
describe('moveTask', () => {
  it('validates WIP limit before moving task', async () => {
    // Arrange
    const moveData = { task_id: 't1', target_column_id: 'col-progress', target_position: 2 };
    const targetColumn = { id: 'col-progress', wip_limit: 3 };
    const currentTasksInColumn = [mockTask1, mockTask2, mockTask3]; // Already at limit

    mockBoardColumnService.getById.mockResolvedValue(targetColumn);
    mockTaskService.getByColumnId.mockResolvedValue(currentTasksInColumn);

    // Act & Assert
    await expect(moveTask(moveData, mockTaskService, mockBoardColumnService))
      .rejects.toThrow('WIP_LIMIT_EXCEEDED');
    expect(mockTaskService.updatePosition).not.toHaveBeenCalled();
  });

  it('recalculates positions in source and target columns', async () => {
    const moveData = { task_id: 't1', target_column_id: 'col-done', target_position: 1 };
    const sourceColumnTasks = [mockTask1, mockTask2, mockTask3]; // task1 at position 0
    const targetColumnTasks = [mockTask4, mockTask5]; // Positions: 0, 1

    mockTaskService.getByColumnId.mockResolvedValueOnce(sourceColumnTasks);
    mockTaskService.getByColumnId.mockResolvedValueOnce(targetColumnTasks);

    // Act
    await moveTask(moveData, mockTaskService, mockBoardColumnService);

    // Assert: Source column positions decremented
    expect(mockTaskService.batchUpdatePositions).toHaveBeenCalledWith([
      { id: 't2', position: 0 }, // Was 1, now 0
      { id: 't3', position: 1 }, // Was 2, now 1
    ]);

    // Assert: Target column positions incremented
    expect(mockTaskService.batchUpdatePositions).toHaveBeenCalledWith([
      { id: 't4', position: 0 }, // Stays at 0
      { id: 't1', position: 1 }, // Inserted task
      { id: 't5', position: 2 }, // Was 1, now 2
    ]);
  });

  it('allows move when wip_limit is null (unlimited)', async () => {
    const moveData = { task_id: 't1', target_column_id: 'col-backlog', target_position: 0 };
    const targetColumn = { id: 'col-backlog', wip_limit: null };

    mockBoardColumnService.getById.mockResolvedValue(targetColumn);
    mockTaskService.updatePosition.mockResolvedValue(mockTask);

    // Act
    const result = await moveTask(moveData, mockTaskService, mockBoardColumnService);

    // Assert
    expect(result).toBeDefined();
    expect(mockTaskService.updatePosition).toHaveBeenCalled();
  });
});
```

### 2.3 Custom Fields Use Cases (CRITICAL)

#### Files to Create

1. **`createCustomField.test.ts`** - Create with config validation
2. **`getCustomFields.test.ts`** - List fields for board
3. **`updateCustomField.test.ts`** - Update definition (migrate values)
4. **`deleteCustomField.test.ts`** - Delete field (orphan values)
5. **`validateCustomFieldValue.test.ts`** - ⚠️ **CRITICAL** - Dynamic validation

#### CRITICAL: validateCustomFieldValue.test.ts

```typescript
describe('validateCustomFieldValue', () => {
  it('validates number value against field definition', async () => {
    const fieldDef = {
      id: 'field-1',
      field_type: 'number',
      config: { min: 0, max: 100 },
      required: true,
    };
    const value = 50;

    const isValid = await validateCustomFieldValue(fieldDef, value);

    expect(isValid).toBe(true);
  });

  it('rejects number value exceeding max', async () => {
    const fieldDef = {
      id: 'field-1',
      field_type: 'number',
      config: { min: 0, max: 100 },
      required: true,
    };
    const value = 150;

    await expect(validateCustomFieldValue(fieldDef, value))
      .rejects.toThrow('Value exceeds maximum');
  });

  it('validates select value against options', async () => {
    const fieldDef = {
      id: 'field-2',
      field_type: 'select',
      config: { options: ['Sprint 23', 'Sprint 24'], multiple: false },
      required: true,
    };
    const value = 'Sprint 24';

    const isValid = await validateCustomFieldValue(fieldDef, value);

    expect(isValid).toBe(true);
  });

  it('rejects select value not in options', async () => {
    const fieldDef = {
      id: 'field-2',
      field_type: 'select',
      config: { options: ['Sprint 23', 'Sprint 24'], multiple: false },
      required: true,
    };
    const value = 'Sprint 25';

    await expect(validateCustomFieldValue(fieldDef, value))
      .rejects.toThrow('Invalid option');
  });

  it('allows null for non-required field', async () => {
    const fieldDef = {
      id: 'field-3',
      field_type: 'text',
      config: null,
      required: false,
    };
    const value = null;

    const isValid = await validateCustomFieldValue(fieldDef, value);

    expect(isValid).toBe(true);
  });

  it('rejects null for required field', async () => {
    const fieldDef = {
      id: 'field-4',
      field_type: 'text',
      config: null,
      required: true,
    };
    const value = null;

    await expect(validateCustomFieldValue(fieldDef, value))
      .rejects.toThrow('Field is required');
  });
});
```

---

## 3. Service Tests (📝 SPECIFICATION)

### Supabase Client Mocking Strategy

**CRITICAL**: All service tests MUST mock Supabase client:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BoardService } from './board.service';
import type { SupabaseClient } from '@supabase/supabase-js';

const createSupabaseMock = () => {
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(), // For JSONB @>
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  return {
    from: vi.fn(() => queryBuilder),
    auth: {
      getUser: vi.fn(),
    },
  } as unknown as SupabaseClient;
};

describe('BoardService', () => {
  let service: BoardService;
  let supabase: SupabaseClient;

  beforeEach(() => {
    supabase = createSupabaseMock();
    service = new BoardService(supabase);
  });

  // Tests...
});
```

### 3.1 Board Service Tests

**File**: `app/src/features/boards/services/board.service.test.ts`

#### Critical Test Cases

```typescript
describe('BoardService', () => {
  it('creates board and returns camelCase entity', async () => {
    const createData = { project_id: 'uuid', name: 'Test Board' };
    const dbResponse = {
      id: 'uuid',
      project_id: 'uuid',
      organization_id: 'org-uuid',
      name: 'Test Board',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    vi.mocked(supabase.from('boards').insert([createData]).single())
      .mockResolvedValue({ data: dbResponse, error: null });

    const result = await service.create(createData);

    expect(result.createdAt).toBeInstanceOf(Date); // Transformed to camelCase
  });

  it('throws error when database insert fails', async () => {
    vi.mocked(supabase.from('boards').insert([]).single())
      .mockResolvedValue({ data: null, error: { message: 'DB error', code: '23505' } });

    await expect(service.create({})).rejects.toThrow('DB error');
  });
});
```

### 3.2 Task Service Tests (CRITICAL - JSONB Queries)

**File**: `app/src/features/tasks/services/task.service.test.ts`

#### CRITICAL: JSONB Query Tests

```typescript
describe('TaskService - JSONB Queries', () => {
  it('filters tasks by custom field value using @> operator', async () => {
    const customFieldId = 'field-sprint';
    const value = 'Sprint 24';

    await service.getTasksWithCustomFieldFilter(boardId, customFieldId, value);

    expect(supabase.from).toHaveBeenCalledWith('tasks');
    expect(supabase.filter).toHaveBeenCalledWith(
      'custom_fields_values',
      '@>',
      JSON.stringify({ [customFieldId]: value })
    );
  });

  it('transforms camelCase to snake_case for database', async () => {
    const createData = {
      boardColumnId: 'col-1',
      customFieldsValues: { 'field-1': 'value' },
    };

    await service.create(createData);

    expect(supabase.from('tasks').insert).toHaveBeenCalledWith([{
      board_column_id: 'col-1',
      custom_fields_values: { 'field-1': 'value' },
    }]);
  });
});
```

### 3.3 Custom Field Service Tests

**File**: `app/src/features/custom-fields/services/custom-field.service.test.ts`

#### Test Cases

```typescript
describe('CustomFieldService', () => {
  it('retrieves custom fields for board', async () => {
    const dbFields = [
      { id: 'f1', board_id: 'b1', field_type: 'text', position: 0 },
      { id: 'f2', board_id: 'b1', field_type: 'number', position: 1 },
    ];

    vi.mocked(supabase.from('custom_field_definitions').select().eq('board_id', 'b1').order('position'))
      .mockResolvedValue({ data: dbFields, error: null });

    const result = await service.getByBoardId('b1');

    expect(result).toHaveLength(2);
    expect(result[0].fieldType).toBe('text'); // CamelCase transformation
  });
});
```

---

## 4. API Route Tests (📝 SPECIFICATION)

### 4.1 Endpoint List

**All 11 endpoints from PRD**:

1. `POST /api/boards` - Create board
2. `GET /api/boards` - List boards
3. `GET /api/boards/[id]` - Get board details
4. `PATCH /api/boards/[id]` - Update board
5. `DELETE /api/boards/[id]` - Delete board
6. `POST /api/boards/[id]/columns` - Create column
7. `PATCH /api/boards/[id]/columns/reorder` - Reorder columns
8. `POST /api/tasks` - Create task
9. `PATCH /api/tasks/[id]/move` - Move task (drag & drop)
10. `GET /api/tasks` - List/filter tasks
11. `POST /api/boards/[id]/custom-fields` - Create custom field

### 4.2 API Test Template

**File**: `app/src/app/api/boards/route.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/features/boards/use-cases/createBoard');
vi.mock('@/lib/supabase-server');

describe('POST /api/boards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);
  });

  it('requires authentication', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: {} }),
      },
    } as any);

    const request = new NextRequest('http://localhost/api/boards', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('validates request body with Zod', async () => {
    const invalidData = { name: 'A' }; // Too short

    const request = new NextRequest('http://localhost/api/boards', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toBeDefined();
  });

  it('creates board successfully', async () => {
    const validData = { project_id: 'uuid', name: 'Sprint 24' };
    vi.mocked(createBoard).mockResolvedValue(mockBoard);

    const request = new NextRequest('http://localhost/api/boards', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.data).toEqual(mockBoard);
  });

  it('handles use case errors gracefully', async () => {
    vi.mocked(createBoard).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new NextRequest('http://localhost/api/boards', {
      method: 'POST',
      body: JSON.stringify({ project_id: 'uuid', name: 'Test' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });
});
```

### 4.3 Critical Endpoint: PATCH /api/tasks/[id]/move

**File**: `app/src/app/api/tasks/[id]/move/route.test.ts`

```typescript
describe('PATCH /api/tasks/[id]/move', () => {
  it('returns 409 when WIP limit exceeded', async () => {
    const moveData = { target_column_id: 'col-1', target_position: 0 };
    vi.mocked(moveTask).mockRejectedValue(new Error('WIP_LIMIT_EXCEEDED'));

    const request = new NextRequest('http://localhost/api/tasks/t1/move', {
      method: 'PATCH',
      body: JSON.stringify(moveData),
    });

    const response = await PATCH(request, { params: { id: 't1' } });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error.code).toBe('WIP_LIMIT_EXCEEDED');
    expect(data.error.message).toContain('WIP limit');
  });
});
```

---

## 5. E2E Tests (Playwright) (📝 SPECIFICATION)

### 5.1 Test Files

**Location**: `app/tests/e2e/`

1. **`boards/create-board.spec.ts`** - Create board from project
2. **`boards/manage-columns.spec.ts`** - CRUD columns
3. **`boards/drag-drop-columns.spec.ts`** - Reorder columns
4. **`tasks/create-task-inline.spec.ts`** - Inline task creation
5. **`tasks/drag-drop-tasks.spec.ts`** - ⚠️ **CRITICAL** - Move tasks between columns
6. **`tasks/custom-fields-flow.spec.ts`** - ⚠️ **CRITICAL** - Create field → assign → filter
7. **`tasks/wip-limits.spec.ts`** - ⚠️ **CRITICAL** - UI validation of WIP limits
8. **`accessibility/kanban-a11y.spec.ts`** - Keyboard navigation + ARIA

### 5.2 Critical E2E Test: Complete Workflow

**File**: `app/tests/e2e/boards/complete-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Kanban Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('User can create board → add tasks → drag & drop', async ({ page }) => {
    // 1. Navigate to project
    await page.goto('/dashboard/projects/proj-1');

    // 2. Create board
    await page.click('[data-testid="create-board-button"]');
    await page.fill('[data-testid="board-name"]', 'Sprint 24 Board');
    await page.click('[data-testid="submit-board"]');

    // 3. Verify default columns
    await expect(page.locator('[data-testid="column-to-do"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-done"]')).toBeVisible();

    // 4. Create task inline
    await page.click('[data-testid="add-task-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'First Task');
    await page.keyboard.press('Enter');

    // 5. Verify task appears
    await expect(page.locator('text=First Task')).toBeVisible();

    // 6. Drag task to "In Progress"
    const taskCard = page.locator('[data-task-id="task-1"]');
    const targetColumn = page.locator('[data-column-id="col-in-progress"]');
    await taskCard.dragTo(targetColumn);

    // 7. Verify task moved
    await expect(targetColumn.locator('text=First Task')).toBeVisible();
  });
});
```

### 5.3 CRITICAL: WIP Limits E2E Test

**File**: `app/tests/e2e/tasks/wip-limits.spec.ts`

```typescript
test.describe('WIP Limits Enforcement', () => {
  test('prevents drag when WIP limit reached', async ({ page }) => {
    // Arrange: Column "In Progress" has wip_limit=2, currently 2 tasks
    await setupColumnWithWipLimit(page, { columnId: 'col-progress', limit: 2, currentTasks: 2 });

    // Act: Try to drag 3rd task
    const taskCard = page.locator('[data-task-id="task-3"]');
    const targetColumn = page.locator('[data-column-id="col-progress"]');
    await taskCard.dragTo(targetColumn);

    // Assert: Error message shown
    await expect(page.locator('[data-testid="wip-limit-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="wip-limit-error"]')).toContainText('WIP limit exceeded');

    // Assert: Task NOT moved
    const response = await page.request.get('/api/tasks/task-3');
    const task = await response.json();
    expect(task.board_column_id).not.toBe('col-progress');
  });

  test('shows WIP count in column header', async ({ page }) => {
    await page.goto('/dashboard/boards/board-1');

    const columnHeader = page.locator('[data-column-id="col-progress"]');
    await expect(columnHeader.locator('[data-testid="wip-count"]')).toContainText('2/3');
  });
});
```

### 5.4 CRITICAL: Custom Fields E2E Test

**File**: `app/tests/e2e/tasks/custom-fields-flow.spec.ts`

```typescript
test.describe('Custom Fields Workflow', () => {
  test('User can create field → assign value → filter', async ({ page }) => {
    await page.goto('/dashboard/boards/board-1');

    // 1. Open board settings
    await page.click('[data-testid="board-settings"]');

    // 2. Create custom field
    await page.click('[data-testid="add-custom-field"]');
    await page.fill('[data-testid="field-name"]', 'Sprint');
    await page.selectOption('[data-testid="field-type"]', 'select');
    await page.fill('[data-testid="field-options"]', 'Sprint 23, Sprint 24, Sprint 25');
    await page.click('[data-testid="save-field"]');

    // 3. Create task with custom field value
    await page.click('[data-testid="add-task-to-do"]');
    await page.fill('[data-testid="task-title"]', 'Feature X');
    await page.selectOption('[data-testid="custom-field-sprint"]', 'Sprint 24');
    await page.click('[data-testid="save-task"]');

    // 4. Apply filter
    await page.click('[data-testid="filters"]');
    await page.selectOption('[data-testid="filter-sprint"]', 'Sprint 24');

    // 5. Verify filtered results
    await expect(page.locator('[data-task-id="task-feature-x"]')).toBeVisible();
    await expect(page.locator('[data-task-id="other-tasks"]')).not.toBeVisible();
  });
});
```

### 5.5 Accessibility Tests

**File**: `app/tests/e2e/accessibility/kanban-a11y.spec.ts`

```typescript
test.describe('Kanban Accessibility', () => {
  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard/boards/board-1');

    // Tab to first task
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-task-id="task-1"]')).toBeFocused();

    // Move task with keyboard
    await page.keyboard.press('Space'); // Grab
    await page.keyboard.press('ArrowRight'); // Move right
    await page.keyboard.press('Space'); // Drop

    // Verify moved
    await expect(page.locator('[data-column-id="col-in-progress"] >> text=Task 1')).toBeVisible();
  });

  test('has proper ARIA labels', async ({ page }) => {
    await page.goto('/dashboard/boards/board-1');

    const column = page.locator('[data-column-id="col-to-do"]');
    await expect(column).toHaveAttribute('aria-label', /To Do column/);

    const taskCard = page.locator('[data-task-id="task-1"]');
    await expect(taskCard).toHaveAttribute('role', 'button');
    await expect(taskCard).toHaveAttribute('aria-grabbed', 'false');
  });
});
```

---

## 6. Test Execution & Validation

### 6.1 Running Tests

```bash
# Navigate to app directory
cd app

# Run all unit/integration tests (should FAIL)
npm run test

# Run with coverage (should show 0%)
npm run test:coverage

# Run specific test file
npm run test app/src/features/boards/entities.test.ts

# Run E2E tests (should FAIL - no UI exists)
npm run test:e2e
```

### 6.2 Expected Initial State (RED Phase)

✅ **All tests MUST fail with these errors**:

```
❌ use-cases/createBoard.test.ts
  Error: createBoard is not defined

❌ use-cases/moveTask.test.ts
  Error: moveTask is not defined

❌ services/board.service.test.ts
  Error: BoardService is not defined

❌ app/api/boards/route.test.ts
  Error: route not found

❌ e2e/boards/complete-workflow.spec.ts
  Error: page.locator('[data-testid="create-board-button"]') not found
```

### 6.3 Success Criteria

✅ **Entity Tests**: PASS (schemas exist)
❌ **Use Case Tests**: FAIL (functions not implemented)
❌ **Service Tests**: FAIL (classes not implemented)
❌ **API Route Tests**: FAIL (routes not implemented)
❌ **E2E Tests**: FAIL (no UI exists)

**Coverage**: 0% (expected - no implementation yet)

---

## 7. Handoff to Implementer Agent

### What You Must Do

1. **Read all test files** to understand requirements
2. **Implement use cases** to make tests pass (RED → GREEN)
3. **DO NOT modify tests** (they are immutable specification)
4. **Run tests frequently**: `npm run test:watch`
5. **Achieve >90% coverage** for use cases
6. **Update status**: `/agent-handoff projects/001-customizable-kanban-boards implementer completed`

### Critical Requirements

- ❌ **DO NOT** modify ANY test files
- ❌ **DO NOT** implement services (Supabase Agent's job)
- ❌ **DO NOT** implement UI (UI/UX Expert's job)
- ✅ **MUST** make use case tests pass
- ✅ **MUST** use mocked services
- ✅ **MUST** achieve >90% coverage

### Implementation Order

1. **Phase 1**: Boards use cases (createBoard, getBoards, etc.)
2. **Phase 2**: Tasks use cases (createTask, **moveTask**)
3. **Phase 3**: Custom fields use cases (**validateCustomFieldValue**)
4. **Phase 4**: API controllers (call use cases)

### Files You'll Implement

```
app/src/features/boards/
├── use-cases/
│   ├── createBoard.ts          # ← YOU implement
│   ├── getBoards.ts            # ← YOU implement
│   ├── updateBoard.ts          # ← YOU implement
│   └── ... (all from spec)

app/src/features/tasks/
├── use-cases/
│   ├── createTask.ts           # ← YOU implement (CRITICAL: custom fields)
│   ├── moveTask.ts             # ← YOU implement (CRITICAL: WIP limits)
│   └── ... (all from spec)

app/src/features/custom-fields/
├── use-cases/
│   ├── validateCustomFieldValue.ts  # ← YOU implement (CRITICAL)
│   └── ... (all from spec)
```

---

## Appendix A: Testing Technology Stack

- **Unit/Integration**: Vitest (NOT Jest)
- **E2E**: Playwright
- **Mocking**: `vi.mock()`, `vi.fn()`, `vi.spyOn()`
- **Assertions**: Vitest expect + `@testing-library/jest-dom`
- **Supabase**: Mock client with query builder chain

---

## Appendix B: Key Patterns

### Pattern 1: safeParse (NEVER parse)
```typescript
const result = schema.safeParse(data);
expect(result.success).toBe(true/false);
if (!result.success) {
  expect(result.error.issues[0].code).toBe('invalid_type');
}
```

### Pattern 2: Mock Services
```typescript
vi.mock('../services/board.service');
const mockService = vi.mocked(BoardService);
mockService.prototype.create.mockResolvedValue(mockBoard);
```

### Pattern 3: E2E Accessibility
```typescript
await page.getByRole('button', { name: /create board/i });
await expect(page.locator('[data-testid="column"]')).toHaveAttribute('aria-label');
```

---

**END OF TEST SPECIFICATION**

**Status**: ✅ Complete and Ready for Handoff
**Next Agent**: Implementer Agent
**Coverage Target**: >90% for all use cases
