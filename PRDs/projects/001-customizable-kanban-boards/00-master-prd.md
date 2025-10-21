# Feature ID: projects-001-customizable-kanban-boards

**Status**: 📝 Draft
**Created**: 2025-01-21
**Last Updated**: 2025-01-21
**Owner**: Architect Agent

---

## 1. Executive Summary

**Problem**: Projects lack a visual, flexible task management system that allows teams to organize work using customizable workflows and track progress intuitively.

**Solution**: Implement a fully customizable Kanban board system with drag-and-drop task management, user-defined columns, custom fields, multiple views, and advanced filtering capabilities.

**Impact**: This feature will transform project management by providing teams with a powerful, adaptable visual workflow tool that supports diverse methodologies (Kanban, Scrum, custom workflows) while maintaining multi-tenant security and role-based permissions.

---

## 2. Problem Statement

### Current State

Currently, the application has:
- ✅ Organizations with multi-tenant isolation
- ✅ Projects with basic CRUD operations
- ✅ RBAC system with granular permissions
- ❌ NO task management system
- ❌ NO visual workflow representation
- ❌ NO customizable fields or metadata for work items
- ❌ NO drag-and-drop user interface
- ❌ NO alternative views (list, calendar, table)

### Desired State

After implementing this feature, the system will provide:
- ✅ Complete task management with CRUD operations
- ✅ Customizable Kanban boards per project (multiple boards supported)
- ✅ Drag-and-drop task movement between columns with position persistence
- ✅ User-defined custom fields (text, number, date, select, checkbox) at board and task level
- ✅ Fully customizable columns (create, edit, delete, reorder, color-coding)
- ✅ WIP (Work In Progress) limits per column (optional)
- ✅ Advanced filtering and search
- ✅ Alternative views: List, Calendar, Table
- ✅ RLS-enforced multi-tenant isolation
- ✅ Real-time updates (future enhancement, not in MVP)

### User Pain Points

1. **Lack of Visual Workflow**: Teams cannot see work progress visually, leading to misalignment
2. **Rigid Structure**: Inability to adapt boards to team-specific workflows or methodologies
3. **No Custom Metadata**: Cannot track domain-specific information (e.g., "Story Points", "Sprint", "Priority Level")
4. **Manual Tracking**: No drag-and-drop interface forces manual status updates
5. **Limited Views**: Single representation doesn't fit all use cases (some prefer lists, others calendars)

---

## 3. Goals and Success Metrics

### Primary Goals

1. **Enable Visual Workflow Management**: Teams can create and manage Kanban boards with custom columns representing their workflow stages
2. **Support Maximum Flexibility**: Boards are fully customizable (columns, fields, colors) to adapt to any team's needs
3. **Maintain Architectural Integrity**: Solution follows Clean Architecture, TDD, and multi-tenant security patterns
4. **Deliver Intuitive UX**: Drag-and-drop interface with keyboard accessibility (WCAG 2.1 AA)
5. **Enable Data-Driven Decisions**: Filters and multiple views provide actionable insights

### Success Metrics

- **Adoption**: >80% of active projects create at least one Kanban board within 30 days of release
- **Usage**: Average of 15+ task movements per board per week
- **Customization**: >60% of boards use at least one custom field
- **Accessibility**: 100% keyboard navigable, passes WCAG 2.1 AA automated tests
- **Performance**: Drag-and-drop latency <100ms, board load time <1s for 500 tasks
- **Test Coverage**: >90% code coverage across all layers

---

## 4. User Stories

### User Story 1: Create Customizable Kanban Board

> **As a** Project Manager
> **I want to** create a new Kanban board with custom columns
> **So that** I can represent my team's specific workflow stages visually

**Acceptance Criteria**:
- [ ] MUST be able to create a new board within a project
- [ ] MUST be able to define custom column names (e.g., "Backlog", "In Progress", "Review", "Done")
- [ ] MUST be able to set column colors for visual distinction
- [ ] MUST be able to set WIP limits per column (optional)
- [ ] MUST validate that user has `board.create` permission
- [ ] MUST validate that board belongs to user's organization (RLS)
- [ ] MUST support multiple boards per project

### User Story 2: Drag and Drop Tasks Between Columns

> **As a** Team Member
> **I want to** drag tasks between columns
> **So that** I can update task status visually and efficiently

**Acceptance Criteria**:
- [ ] MUST support drag-and-drop of tasks between columns
- [ ] MUST persist task position within column (ordering)
- [ ] MUST update task's `board_column_id` on drop
- [ ] MUST recalculate positions for affected tasks
- [ ] MUST respect WIP limits (if configured) and prevent drop if limit exceeded
- [ ] MUST provide visual feedback during drag (drag overlay)
- [ ] MUST support keyboard navigation (arrow keys, Enter to select/move)
- [ ] MUST validate `task.update` permission before allowing movement

### User Story 3: Define Custom Fields for Tasks

> **As a** Product Owner
> **I want to** create custom fields for tasks (e.g., "Story Points", "Sprint")
> **So that** I can capture domain-specific metadata relevant to my workflow

**Acceptance Criteria**:
- [ ] MUST be able to create custom field definitions at the board level
- [ ] MUST support field types: text, number, date, single-select, checkbox
- [ ] MUST be able to configure field options (for select fields)
- [ ] MUST be able to mark fields as required or optional
- [ ] MUST be able to reorder custom fields
- [ ] MUST validate field values against field type
- [ ] MUST store custom field values in JSONB column for flexibility
- [ ] MUST validate `custom_field.create` permission

### User Story 4: Create Tasks Inline from Board

> **As a** Developer
> **I want to** quickly create tasks directly from the Kanban board
> **So that** I can capture new work without leaving the board view

**Acceptance Criteria**:
- [ ] MUST provide inline task creation at the bottom of each column
- [ ] MUST allow entering task title without opening full modal
- [ ] MUST auto-assign created task to the column where it was created
- [ ] MUST position new task at the bottom of the column
- [ ] MUST support pressing Enter to create and Escape to cancel
- [ ] MUST open full task modal if user needs to add more details
- [ ] MUST validate `task.create` permission

### User Story 5: Filter and Search Tasks

> **As a** Team Lead
> **I want to** filter tasks by assignee, custom fields, or keywords
> **So that** I can focus on specific subsets of work

**Acceptance Criteria**:
- [ ] MUST provide search by task title and description (full-text)
- [ ] MUST filter by assignee (select dropdown)
- [ ] MUST filter by custom field values (dynamic based on field type)
- [ ] MUST filter by task dates (created, updated, due date)
- [ ] MUST combine multiple filters (AND logic)
- [ ] MUST persist filter state in URL query parameters
- [ ] MUST update board view in real-time as filters change
- [ ] MUST respect RLS policies (only show user's accessible tasks)

### User Story 6: Switch Between Views (List, Calendar, Table)

> **As a** Stakeholder
> **I want to** view tasks in different formats (Kanban, List, Calendar, Table)
> **So that** I can choose the representation that best fits my current need

**Acceptance Criteria**:
- [ ] MUST provide view switcher (tabs or dropdown)
- [ ] MUST support Kanban view (default)
- [ ] MUST support List view (grouped by column or flat)
- [ ] MUST support Calendar view (tasks by due date)
- [ ] MUST support Table view (spreadsheet-like with sortable columns)
- [ ] MUST persist view preference per board in local storage
- [ ] MUST maintain filters across view changes
- [ ] MUST validate `task.read` permission for all views

### User Story 7: Manage Board Columns

> **As a** Project Admin
> **I want to** add, edit, delete, and reorder columns
> **So that** I can adapt the board as the workflow evolves

**Acceptance Criteria**:
- [ ] MUST be able to create new columns with name, color, WIP limit
- [ ] MUST be able to edit existing column properties
- [ ] MUST be able to delete columns (with confirmation if tasks exist)
- [ ] MUST be able to reorder columns via drag-and-drop
- [ ] MUST cascade delete tasks when column is deleted (with warning)
- [ ] MUST validate `column.create`, `column.update`, `column.delete` permissions
- [ ] MUST persist column order in database

---

## 5. Functional Requirements

### 5.1 Create Board

- **Trigger**: User clicks "Create Board" button in project view
- **Input**:
  - `name` (string, 2-100 chars, required)
  - `description` (string, 0-1000 chars, optional)
  - `project_id` (UUID, required)
  - `initial_columns` (array of column names, optional, defaults to ["To Do", "In Progress", "Done"])
- **Validation**:
  - User is member of project's organization
  - User has `board.create` permission
  - Board name is unique within project
- **Output**: Created `Board` object with auto-generated columns
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission
  - `NOT_MEMBER`: User not in organization
  - `DUPLICATE_NAME`: Board name already exists in project

### 5.2 Create Board Column

- **Trigger**: User clicks "Add Column" in board settings
- **Input**:
  - `board_id` (UUID, required)
  - `name` (string, 2-50 chars, required)
  - `color` (hex color string, optional, default: "#6B7280")
  - `wip_limit` (integer, >0, optional, null = no limit)
  - `position` (integer, auto-assigned to end)
- **Validation**:
  - User has `column.create` permission for this board
  - Column name unique within board
  - Color is valid hex format
  - WIP limit is positive integer if provided
- **Output**: Created `BoardColumn` object
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission
  - `DUPLICATE_NAME`: Column name exists in board
  - `INVALID_COLOR`: Color not in hex format

### 5.3 Create Task

- **Trigger**: User clicks inline task creator or "New Task" button
- **Input**:
  - `title` (string, 2-200 chars, required)
  - `description` (text, optional)
  - `board_column_id` (UUID, required)
  - `assigned_to` (UUID, optional, null = unassigned)
  - `due_date` (date, optional)
  - `priority` (enum: 'low', 'medium', 'high', 'urgent', optional)
  - `custom_fields_values` (JSONB object, optional)
  - `position` (integer, auto-assigned to end of column)
- **Validation**:
  - User has `task.create` permission for board's project
  - `board_column_id` belongs to a column in current board
  - `assigned_to` user exists and is member of organization
  - `custom_fields_values` conform to board's custom field definitions
  - Due date is not in the past
- **Output**: Created `Task` object
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission
  - `INVALID_COLUMN`: Column doesn't exist or doesn't belong to board
  - `INVALID_ASSIGNEE`: Assignee not in organization
  - `INVALID_CUSTOM_FIELD`: Custom field value doesn't match definition

### 5.4 Move Task (Drag & Drop)

- **Trigger**: User drags task from one column to another and drops
- **Input**:
  - `task_id` (UUID, required)
  - `target_column_id` (UUID, required)
  - `target_position` (integer, required, 0-indexed)
- **Validation**:
  - User has `task.update` permission
  - Target column belongs to the same board
  - WIP limit of target column not exceeded (if configured)
  - Position is valid index
- **Processing**:
  1. If WIP limit exists and would be exceeded, return error
  2. Update task's `board_column_id` to target column
  3. Remove task from source column's positions (decrement positions > old_position)
  4. Insert task into target column at target_position (increment positions >= target_position)
  5. Update `updated_at` timestamp
- **Output**: Updated `Task` object with new position and column
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission
  - `WIP_LIMIT_EXCEEDED`: Target column at capacity
  - `INVALID_POSITION`: Position out of bounds

### 5.5 Define Custom Field

- **Trigger**: User opens board settings and clicks "Add Custom Field"
- **Input**:
  - `board_id` (UUID, required)
  - `name` (string, 2-100 chars, required)
  - `field_type` (enum: 'text', 'number', 'date', 'select', 'checkbox', required)
  - `config` (JSONB, type-specific configuration)
    - For `select`: `{ options: ['opt1', 'opt2'], multiple: false }`
    - For `number`: `{ min: 0, max: 100, step: 1 }`
    - For `text`: `{ max_length: 500 }`
  - `required` (boolean, default: false)
  - `position` (integer, auto-assigned)
- **Validation**:
  - User has `custom_field.create` permission
  - Field name unique within board
  - Config conforms to field_type requirements
- **Output**: Created `CustomFieldDefinition` object
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission
  - `DUPLICATE_NAME`: Field name exists
  - `INVALID_CONFIG`: Config doesn't match field type

### 5.6 Filter Tasks

- **Trigger**: User interacts with filter UI (search bar, dropdowns)
- **Input**:
  - `board_id` (UUID, required)
  - `search` (string, optional, searches title + description)
  - `assigned_to` (UUID array, optional)
  - `priority` (enum array, optional)
  - `custom_field_filters` (object, optional, `{ field_id: value }`)
  - `date_range` (object, optional, `{ start: date, end: date }`)
- **Validation**:
  - User has `task.read` permission
  - Custom field IDs exist in board's custom field definitions
- **Processing**:
  1. Build query with WHERE clauses for each active filter
  2. For search: `WHERE (title ILIKE '%search%' OR description ILIKE '%search%')`
  3. For custom fields: `WHERE custom_fields_values @> '{"field_id": "value"}'`
  4. Apply RLS policies automatically
  5. Return filtered tasks grouped by column
- **Output**: Filtered array of tasks with column grouping
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission
  - `INVALID_CUSTOM_FIELD`: Referenced custom field doesn't exist

### 5.7 Switch View

- **Trigger**: User clicks view tab (Kanban, List, Calendar, Table)
- **Input**:
  - `board_id` (UUID, required)
  - `view_type` (enum: 'kanban', 'list', 'calendar', 'table', required)
  - Active filters (inherited from current state)
- **Validation**:
  - User has `task.read` permission
- **Processing**:
  1. Fetch tasks with active filters
  2. Transform data for selected view:
     - **Kanban**: Group by column, order by position
     - **List**: Flat list sorted by created_at or custom sort
     - **Calendar**: Group by due_date, display in calendar grid
     - **Table**: Tabular format with all fields as columns
  3. Store view preference in localStorage
- **Output**: Transformed task data for selected view
- **Error Cases**:
  - `FORBIDDEN`: User lacks permission

---

## 6. Data Contracts (Entities & Zod Schemas)

### 6.1 Board Entity

**File Location**: `app/src/features/boards/entities.ts`

```typescript
import { z } from 'zod';

/**
 * Board represents a Kanban board within a project.
 * Multiple boards can exist per project.
 */
export const BoardSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  organization_id: z.string().uuid(), // Denormalized for RLS performance
  name: z.string()
    .min(2, 'Board name must be at least 2 characters')
    .max(100, 'Board name cannot exceed 100 characters'),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  settings: z.record(z.any()).optional().nullable(), // Future: board-level settings
  created_by: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const BoardCreateSchema = BoardSchema.omit({
  id: true,
  organization_id: true, // Derived from project
  created_by: true, // Set by use case
  created_at: true,
  updated_at: true,
});

export const BoardUpdateSchema = BoardSchema.pick({
  name: true,
  description: true,
  settings: true,
}).partial();

export type Board = z.infer<typeof BoardSchema>;
export type BoardCreate = z.infer<typeof BoardCreateSchema>;
export type BoardUpdate = z.infer<typeof BoardUpdateSchema>;
```

### 6.2 BoardColumn Entity

**File Location**: `app/src/features/boards/entities.ts`

```typescript
/**
 * BoardColumn represents a workflow stage in a Kanban board.
 * Fully customizable: name, color, WIP limit, ordering.
 */
export const BoardColumnSchema = z.object({
  id: z.string().uuid(),
  board_id: z.string().uuid(),
  name: z.string()
    .min(2, 'Column name must be at least 2 characters')
    .max(50, 'Column name cannot exceed 50 characters'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid HEX (#RRGGBB)')
    .default('#6B7280'), // Tailwind gray-500
  wip_limit: z.number()
    .int('WIP limit must be an integer')
    .positive('WIP limit must be positive')
    .optional()
    .nullable(), // null = no limit
  position: z.number().int().nonnegative(), // 0-indexed ordering
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const BoardColumnCreateSchema = BoardColumnSchema.omit({
  id: true,
  position: true, // Auto-assigned by use case
  created_at: true,
  updated_at: true,
});

export const BoardColumnUpdateSchema = BoardColumnSchema.pick({
  name: true,
  color: true,
  wip_limit: true,
}).partial();

export const BoardColumnReorderSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
});

export type BoardColumn = z.infer<typeof BoardColumnSchema>;
export type BoardColumnCreate = z.infer<typeof BoardColumnCreateSchema>;
export type BoardColumnUpdate = z.infer<typeof BoardColumnUpdateSchema>;
export type BoardColumnReorder = z.infer<typeof BoardColumnReorderSchema>;
```

### 6.3 Task Entity

**File Location**: `app/src/features/tasks/entities.ts`

```typescript
/**
 * Task represents a work item in a Kanban board.
 * Supports custom fields via JSONB for maximum flexibility.
 */
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'], {
  errorMap: () => ({ message: 'Priority must be: low, medium, high, or urgent' })
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  board_column_id: z.string().uuid(),
  organization_id: z.string().uuid(), // Denormalized for RLS
  title: z.string()
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title cannot exceed 200 characters'),
  description: z.string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  priority: TaskPriorityEnum.optional().nullable(),
  due_date: z.coerce.date().optional().nullable(),
  position: z.number().int().nonnegative(), // Position within column

  // JSONB for custom field values: { "custom_field_id": "value" }
  custom_fields_values: z.record(z.any()).optional().nullable(),

  created_by: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const TaskCreateSchema = TaskSchema.omit({
  id: true,
  organization_id: true, // Derived from board
  position: true, // Auto-assigned
  created_by: true,
  created_at: true,
  updated_at: true,
});

export const TaskUpdateSchema = TaskSchema.pick({
  title: true,
  description: true,
  assigned_to: true,
  priority: true,
  due_date: true,
  custom_fields_values: true,
}).partial();

export const TaskMoveSchema = z.object({
  task_id: z.string().uuid(),
  target_column_id: z.string().uuid(),
  target_position: z.number().int().nonnegative(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type TaskMove = z.infer<typeof TaskMoveSchema>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;
```

### 6.4 CustomFieldDefinition Entity

**File Location**: `app/src/features/custom-fields/entities.ts`

```typescript
/**
 * CustomFieldDefinition describes a user-defined metadata field.
 * Attached to a board, applies to all tasks in that board.
 */
export const CustomFieldTypeEnum = z.enum(['text', 'number', 'date', 'select', 'checkbox'], {
  errorMap: () => ({ message: 'Field type must be: text, number, date, select, or checkbox' })
});

// Type-specific configuration schemas
export const SelectFieldConfigSchema = z.object({
  options: z.array(z.string().min(1).max(100)).min(1, 'Select field must have at least one option'),
  multiple: z.boolean().default(false),
});

export const NumberFieldConfigSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
});

export const TextFieldConfigSchema = z.object({
  max_length: z.number().int().positive().max(10000).optional(),
  multiline: z.boolean().default(false),
});

export const CustomFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  board_id: z.string().uuid(),
  name: z.string()
    .min(2, 'Field name must be at least 2 characters')
    .max(100, 'Field name cannot exceed 100 characters'),
  field_type: CustomFieldTypeEnum,
  config: z.record(z.any()).optional().nullable(), // Type-specific config (validated by use case)
  required: z.boolean().default(false),
  position: z.number().int().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CustomFieldDefinitionCreateSchema = CustomFieldDefinitionSchema.omit({
  id: true,
  position: true,
  created_at: true,
  updated_at: true,
});

export const CustomFieldDefinitionUpdateSchema = CustomFieldDefinitionSchema.pick({
  name: true,
  config: true,
  required: true,
}).partial();

export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;
export type CustomFieldDefinitionCreate = z.infer<typeof CustomFieldDefinitionCreateSchema>;
export type CustomFieldDefinitionUpdate = z.infer<typeof CustomFieldDefinitionUpdateSchema>;
export type CustomFieldType = z.infer<typeof CustomFieldTypeEnum>;
```

### 6.5 Query Schemas

```typescript
// Board Query
export const BoardQuerySchema = z.object({
  project_id: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Task Query (with filters)
export const TaskQuerySchema = z.object({
  board_id: z.string().uuid(),
  search: z.string().optional(),
  assigned_to: z.array(z.string().uuid()).optional(),
  priority: z.array(TaskPriorityEnum).optional(),
  column_id: z.string().uuid().optional(),
  date_range: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).optional(),
  view_type: z.enum(['kanban', 'list', 'calendar', 'table']).default('kanban'),
});

export type BoardQuery = z.infer<typeof BoardQuerySchema>;
export type TaskQuery = z.infer<typeof TaskQuerySchema>;
```

### 6.6 Relationships

- **Board** belongs to **Project** (project_id)
- **Board** belongs to **Organization** (organization_id, denormalized for RLS)
- **Board** has many **BoardColumns** (board_id)
- **Board** has many **CustomFieldDefinitions** (board_id)
- **BoardColumn** belongs to **Board** (board_id)
- **BoardColumn** has many **Tasks** (board_column_id)
- **Task** belongs to **BoardColumn** (board_column_id)
- **Task** belongs to **Organization** (organization_id, denormalized)
- **Task** optionally belongs to **User** via assigned_to (assigned_to)
- **CustomFieldDefinition** belongs to **Board** (board_id)

---

## 7. API Specifications

### 7.1 POST /api/boards

**Purpose**: Create new Kanban board

**Request**:
```typescript
{
  body: BoardCreateSchema,
  headers: { Authorization: "Bearer <JWT>" }
}
```

**Response**:
```typescript
// 201 Created
{
  data: Board,
  default_columns: BoardColumn[] // Auto-generated columns
}

// 400 Bad Request
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: ZodError
  }
}

// 401 Unauthorized
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }
}

// 403 Forbidden
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions'
  }
}

// 409 Conflict
{
  error: {
    code: 'DUPLICATE_NAME',
    message: 'Board name already exists in this project'
  }
}
```

### 7.2 GET /api/boards

**Purpose**: List boards for a project

**Query Parameters**:
- `project_id` (UUID, required)
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response**:
```typescript
// 200 OK
{
  data: Board[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 7.3 GET /api/boards/[id]

**Purpose**: Get single board with columns and custom field definitions

**Response**:
```typescript
// 200 OK
{
  data: {
    board: Board,
    columns: BoardColumn[],
    custom_fields: CustomFieldDefinition[]
  }
}

// 404 Not Found
{
  error: {
    code: 'NOT_FOUND',
    message: 'Board not found'
  }
}
```

### 7.4 PATCH /api/boards/[id]

**Purpose**: Update board details

**Request**:
```typescript
{
  body: BoardUpdateSchema
}
```

**Response**:
```typescript
// 200 OK
{
  data: Board
}
```

### 7.5 DELETE /api/boards/[id]

**Purpose**: Delete board (cascades to columns, tasks, custom fields)

**Response**:
```typescript
// 204 No Content

// 409 Conflict
{
  error: {
    code: 'HAS_TASKS',
    message: 'Cannot delete board with existing tasks',
    task_count: number
  }
}
```

### 7.6 POST /api/boards/[id]/columns

**Purpose**: Create new column in board

**Request**:
```typescript
{
  body: BoardColumnCreateSchema
}
```

**Response**:
```typescript
// 201 Created
{
  data: BoardColumn
}
```

### 7.7 PATCH /api/boards/[id]/columns/reorder

**Purpose**: Reorder columns via drag & drop

**Request**:
```typescript
{
  body: {
    columns: BoardColumnReorder[] // Array of { id, position }
  }
}
```

**Response**:
```typescript
// 200 OK
{
  data: BoardColumn[] // Updated columns with new positions
}
```

### 7.8 POST /api/tasks

**Purpose**: Create new task

**Request**:
```typescript
{
  body: TaskCreateSchema
}
```

**Response**:
```typescript
// 201 Created
{
  data: Task
}
```

### 7.9 PATCH /api/tasks/[id]/move

**Purpose**: Move task to different column/position (drag & drop)

**Request**:
```typescript
{
  body: TaskMoveSchema
}
```

**Response**:
```typescript
// 200 OK
{
  data: Task
}

// 409 Conflict
{
  error: {
    code: 'WIP_LIMIT_EXCEEDED',
    message: 'Target column has reached its WIP limit',
    current_count: number,
    wip_limit: number
  }
}
```

### 7.10 GET /api/tasks

**Purpose**: List/filter tasks for a board

**Query Parameters**: `TaskQuerySchema` (search, filters, view_type)

**Response**:
```typescript
// 200 OK (Kanban view)
{
  data: {
    columns: {
      [column_id]: {
        column: BoardColumn,
        tasks: Task[]
      }
    }
  }
}

// 200 OK (List/Table view)
{
  data: Task[]
}

// 200 OK (Calendar view)
{
  data: {
    [date_string]: Task[] // Tasks grouped by due_date
  }
}
```

### 7.11 POST /api/boards/[id]/custom-fields

**Purpose**: Define custom field for board

**Request**:
```typescript
{
  body: CustomFieldDefinitionCreateSchema
}
```

**Response**:
```typescript
// 201 Created
{
  data: CustomFieldDefinition
}
```

---

## 8. Technical Architecture

### 8.1 Database Schema

#### Table: `boards`

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT boards_name_project_unique UNIQUE (project_id, name)
);

-- Indexes
CREATE INDEX idx_boards_project_id ON boards(project_id);
CREATE INDEX idx_boards_organization_id ON boards(organization_id);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);
```

#### Table: `board_columns`

```sql
CREATE TABLE board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- HEX color
  wip_limit INT CHECK (wip_limit > 0),
  position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT board_columns_name_board_unique UNIQUE (board_id, name),
  CONSTRAINT board_columns_position_board_unique UNIQUE (board_id, position)
);

-- Indexes
CREATE INDEX idx_board_columns_board_id ON board_columns(board_id);
CREATE INDEX idx_board_columns_position ON board_columns(board_id, position);
```

#### Table: `tasks`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_column_id UUID NOT NULL REFERENCES board_columns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  position INT NOT NULL,
  custom_fields_values JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT tasks_position_column_unique UNIQUE (board_column_id, position)
);

-- Indexes
CREATE INDEX idx_tasks_board_column_id ON tasks(board_column_id);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_position ON tasks(board_column_id, position);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- GIN index for custom fields JSONB querying
CREATE INDEX idx_tasks_custom_fields ON tasks USING GIN (custom_fields_values);
```

#### Table: `custom_field_definitions`

```sql
CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'checkbox')),
  config JSONB DEFAULT '{}',
  required BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT custom_field_definitions_name_board_unique UNIQUE (board_id, name),
  CONSTRAINT custom_field_definitions_position_board_unique UNIQUE (board_id, position)
);

-- Indexes
CREATE INDEX idx_custom_field_definitions_board_id ON custom_field_definitions(board_id);
CREATE INDEX idx_custom_field_definitions_position ON custom_field_definitions(board_id, position);
```

### 8.2 Row Level Security (RLS) Policies

#### Boards RLS

```sql
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Users can view boards in their organization
CREATE POLICY "Users can view organization boards"
  ON boards
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create boards if they have permission
CREATE POLICY "Users can create boards with permission"
  ON boards
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'board'
        AND p.action = 'create'
    )
  );

-- Users can update boards they have permission for
CREATE POLICY "Users can update boards with permission"
  ON boards
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'board'
        AND p.action = 'update'
    )
  );

-- Users can delete boards they have permission for
CREATE POLICY "Users can delete boards with permission"
  ON boards
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'board'
        AND p.action = 'delete'
    )
  );
```

#### Board Columns RLS

```sql
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;

-- Users can view columns if they can view the board
CREATE POLICY "Users can view columns of accessible boards"
  ON board_columns
  FOR SELECT
  USING (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Users can manage columns if they have column.create/update/delete permissions
CREATE POLICY "Users can create columns with permission"
  ON board_columns
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'column'
        AND p.action = 'create'
    )
  );

CREATE POLICY "Users can update columns with permission"
  ON board_columns
  FOR UPDATE
  USING (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'column'
        AND p.action = 'update'
    )
  );

CREATE POLICY "Users can delete columns with permission"
  ON board_columns
  FOR DELETE
  USING (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'column'
        AND p.action = 'delete'
    )
  );
```

#### Tasks RLS

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks in their organization
CREATE POLICY "Users can view organization tasks"
  ON tasks
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create tasks with permission
CREATE POLICY "Users can create tasks with permission"
  ON tasks
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'task'
        AND p.action = 'create'
    )
  );

-- Users can update tasks with permission
CREATE POLICY "Users can update tasks with permission"
  ON tasks
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'task'
        AND p.action = 'update'
    )
  );

-- Users can delete tasks with permission
CREATE POLICY "Users can delete tasks with permission"
  ON tasks
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'task'
        AND p.action = 'delete'
    )
  );
```

#### Custom Field Definitions RLS

```sql
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- Same pattern as board_columns (inherit from board's organization)
CREATE POLICY "Users can view custom fields of accessible boards"
  ON custom_field_definitions
  FOR SELECT
  USING (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create custom fields with permission"
  ON custom_field_definitions
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'custom_field'
        AND p.action = 'create'
    )
  );

CREATE POLICY "Users can update custom fields with permission"
  ON custom_field_definitions
  FOR UPDATE
  USING (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'custom_field'
        AND p.action = 'update'
    )
  );

CREATE POLICY "Users can delete custom fields with permission"
  ON custom_field_definitions
  FOR DELETE
  USING (
    board_id IN (
      SELECT b.id
      FROM boards b
      JOIN organization_members om ON b.organization_id = om.organization_id
      JOIN role_permissions rp ON om.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE om.user_id = auth.uid()
        AND p.resource = 'custom_field'
        AND p.action = 'delete'
    )
  );
```

### 8.3 Permissions Setup (Seed Data)

The following permissions must be inserted into the existing `permissions` table as part of the migration:

```sql
-- Board Permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('board.create', 'Create new Kanban boards', 'board', 'create'),
  ('board.read', 'View Kanban boards', 'board', 'read'),
  ('board.update', 'Update board details', 'board', 'update'),
  ('board.delete', 'Delete boards', 'board', 'delete'),

-- Column Permissions
  ('column.create', 'Create board columns', 'column', 'create'),
  ('column.read', 'View board columns', 'column', 'read'),
  ('column.update', 'Update column properties', 'column', 'update'),
  ('column.delete', 'Delete columns', 'column', 'delete'),
  ('column.reorder', 'Reorder columns via drag-drop', 'column', 'reorder'),

-- Task Permissions
  ('task.create', 'Create new tasks', 'task', 'create'),
  ('task.read', 'View tasks', 'task', 'read'),
  ('task.update', 'Update task details', 'task', 'update'),
  ('task.delete', 'Delete tasks', 'task', 'delete'),
  ('task.move', 'Move tasks between columns', 'task', 'move'),
  ('task.assign', 'Assign tasks to users', 'task', 'assign'),

-- Custom Field Permissions
  ('custom_field.create', 'Define custom fields for boards', 'custom_field', 'create'),
  ('custom_field.read', 'View custom field definitions', 'custom_field', 'read'),
  ('custom_field.update', 'Update custom field configurations', 'custom_field', 'update'),
  ('custom_field.delete', 'Delete custom fields', 'custom_field', 'delete');

-- Assign all permissions to Admin role (assuming Admin role exists)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'Admin' AND is_system_role = true LIMIT 1),
  id
FROM permissions
WHERE resource IN ('board', 'column', 'task', 'custom_field');

-- Assign read-only permissions to Member role (example)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'Member' AND is_system_role = true LIMIT 1),
  id
FROM permissions
WHERE resource IN ('board', 'column', 'task', 'custom_field')
  AND action = 'read';
```

### 8.4 Feature Directory Structure

```
app/src/features/
├── boards/
│   ├── entities.ts                 # ← Architect implements (Board, BoardColumn schemas)
│   ├── use-cases/                  # ← Implementer Agent
│   │   ├── createBoard.ts
│   │   ├── createBoard.test.ts     # ← Test Agent
│   │   ├── getBoards.ts
│   │   ├── getBoards.test.ts
│   │   ├── updateBoard.ts
│   │   ├── updateBoard.test.ts
│   │   ├── deleteBoard.ts
│   │   ├── deleteBoard.test.ts
│   │   ├── createColumn.ts
│   │   ├── createColumn.test.ts
│   │   ├── reorderColumns.ts
│   │   └── reorderColumns.test.ts
│   ├── services/                   # ← Supabase Agent
│   │   ├── board.service.ts
│   │   └── board.service.test.ts
│   └── components/                 # ← UI/UX Expert Agent
│       ├── BoardCard.tsx
│       ├── BoardList.tsx
│       ├── BoardSettings.tsx
│       ├── ColumnManager.tsx
│       └── CreateBoardModal.tsx
│
├── tasks/
│   ├── entities.ts                 # ← Architect implements (Task schema)
│   ├── use-cases/
│   │   ├── createTask.ts
│   │   ├── createTask.test.ts
│   │   ├── getTasks.ts
│   │   ├── getTasks.test.ts
│   │   ├── updateTask.ts
│   │   ├── updateTask.test.ts
│   │   ├── deleteTask.ts
│   │   ├── deleteTask.test.ts
│   │   ├── moveTask.ts             # Drag & drop logic
│   │   └── moveTask.test.ts
│   ├── services/
│   │   ├── task.service.ts
│   │   └── task.service.test.ts
│   └── components/
│       ├── TaskCard.tsx            # Draggable task card
│       ├── TaskList.tsx
│       ├── TaskCalendar.tsx
│       ├── TaskTable.tsx
│       ├── TaskFilters.tsx
│       ├── CreateTaskInline.tsx
│       └── TaskDetailModal.tsx
│
└── custom-fields/
    ├── entities.ts                 # ← Architect implements (CustomFieldDefinition schema)
    ├── use-cases/
    │   ├── createCustomField.ts
    │   ├── createCustomField.test.ts
    │   ├── updateCustomField.ts
    │   ├── updateCustomField.test.ts
    │   ├── deleteCustomField.ts
    │   ├── deleteCustomField.test.ts
    │   ├── validateCustomFieldValue.ts # Validates task's custom_fields_values
    │   └── validateCustomFieldValue.test.ts
    ├── services/
    │   ├── custom-field.service.ts
    │   └── custom-field.service.test.ts
    └── components/
        ├── CustomFieldEditor.tsx
        ├── CustomFieldInput.tsx    # Dynamic input based on field_type
        └── CustomFieldList.tsx
```

### 8.5 Technology Integration

#### dnd-kit (Drag & Drop)

**Installation**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Integration Pattern** (from Context7):

```typescript
// app/src/features/boards/components/KanbanBoard.tsx
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function KanbanBoard({ board, columns, tasks }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Call moveTask use case
    await moveTaskMutation.mutateAsync({
      task_id: active.id as string,
      target_column_id: over.id as string,
      target_position: calculatePosition(over),
    });

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {columns.map(column => (
        <SortableContext
          key={column.id}
          items={tasks[column.id].map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <BoardColumn column={column} tasks={tasks[column.id]} />
        </SortableContext>
      ))}

      <DragOverlay>
        {activeId && <TaskCard task={findTaskById(activeId)} />}
      </DragOverlay>
    </DndContext>
  );
}
```

#### JSONB Querying (Custom Fields)

**Service Layer** (from Context7):

```typescript
// Filter tasks by custom field value
export async function getTasksWithCustomFieldFilter(
  boardId: string,
  customFieldId: string,
  value: any
): Promise<Task[]> {
  const supabase = await createClient();

  // Use @> operator for JSONB contains
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_column_id', columnId)
    .filter('custom_fields_values', '@>', JSON.stringify({ [customFieldId]: value }));

  if (error) throw new Error('Failed to fetch tasks');
  return data;
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

**Test Agent will create**:

1. **entities.test.ts** (each feature):
   - Validate all Zod schemas (Board, Task, CustomField)
   - Test edge cases (max lengths, invalid enums, optional fields)
   - Test refinements and transformations

2. **use-cases/*.test.ts**:
   - Mock all service layer calls
   - Test business logic in isolation:
     - `createBoard`: Validates permissions, creates board + default columns
     - `moveTask`: Validates WIP limits, recalculates positions
     - `createCustomField`: Validates config based on field_type
     - `validateCustomFieldValue`: Ensures task values match field definitions
   - Test error cases (FORBIDDEN, WIP_LIMIT_EXCEEDED, INVALID_CUSTOM_FIELD)

3. **services/*.test.ts**:
   - Mock Supabase client
   - Test pure CRUD operations
   - Test JSONB queries (custom field filtering)
   - Test RLS policy enforcement (via mocked queries)

**Coverage Target**: >90% for all layers

### 9.2 Integration Tests (Vitest)

**Test Agent will create**:

- API endpoint tests (`route.test.ts` for each API route)
- Full flow tests:
  - Create board → Create columns → Create tasks → Move task (drag & drop flow)
  - Create custom field → Create task with custom values → Filter by custom value
  - Create board → Delete board (cascade deletion)
- Permission enforcement tests (verify RLS via API calls)

### 9.3 E2E Tests (Playwright)

**UI/UX Agent will create**:

1. **User Journey: Complete Kanban Workflow**
   - Navigate to project → Create board → Add columns → Create task inline
   - Drag task from "To Do" to "In Progress"
   - Verify task appears in correct column
   - Filter tasks by assignee
   - Switch to List view, Calendar view, Table view

2. **User Journey: Custom Fields**
   - Create board → Open board settings
   - Add custom field (select type "select", add options)
   - Create task → Fill custom field
   - Filter tasks by custom field value
   - Verify filtered results

3. **Accessibility Tests**:
   - Keyboard navigation: Tab through tasks, Enter to edit, Arrow keys to navigate
   - ARIA labels: Verify drag handles, dropzones, inputs have proper labels
   - Screen reader announcements: Verify drag events announce correctly

4. **Error Handling**:
   - Try to create board without permission → Verify error message
   - Try to move task to WIP-limited column → Verify error toast

---

## 10. Security Considerations

### 10.1 Authentication

- All endpoints require authentication via Supabase Auth
- JWT tokens validated on each request
- `auth.uid()` used in RLS policies

### 10.2 Authorization

- RBAC system with granular permissions per resource (board, column, task, custom_field)
- RLS policies enforce organization-level isolation
- Permission checks in use cases before data operations:
  ```typescript
  const permissions = await getUserPermissionsInOrganization(userId, organizationId);
  if (!permissions.includes('board.create')) {
    throw new Error('FORBIDDEN');
  }
  ```

### 10.3 Input Validation

- All inputs validated with Zod schemas
- XSS prevention via React's built-in escaping
- SQL injection prevention via Supabase parameterized queries
- Custom field values validated against field definitions:
  - Number fields: Check min/max bounds
  - Select fields: Ensure value is in options array
  - Date fields: Validate format

### 10.4 Data Isolation

- `organization_id` denormalized in `boards` and `tasks` for RLS performance
- RLS policies enforce multi-tenant isolation at database level
- No cross-organization data leakage possible

### 10.5 Rate Limiting

- API rate limiting: 100 requests per minute per user (configured at Supabase level)
- Drag & drop operations debounced on client side (prevent spam)

---

## 11. Acceptance Criteria

### Must Have (MVP)

- [ ] User can create multiple Kanban boards per project
- [ ] User can create, edit, delete, reorder columns with custom colors
- [ ] User can create tasks with title, description, assignee, priority, due date
- [ ] User can drag and drop tasks between columns (position persisted)
- [ ] User can create tasks inline (quick add from board)
- [ ] User can define custom fields (text, number, date, select, checkbox)
- [ ] User can filter tasks by search, assignee, priority, custom fields
- [ ] User can switch between Kanban, List, Calendar, Table views
- [ ] WIP limits enforced on columns (configurable, optional)
- [ ] All data isolated by organization (RLS enforced)
- [ ] All operations respect RBAC permissions
- [ ] All tests passing (>90% coverage)
- [ ] E2E tests passing
- [ ] WCAG 2.1 AA compliance (keyboard navigation, ARIA labels)
- [ ] Performance: Drag latency <100ms, board load <1s for 500 tasks

### Should Have (Post-MVP)

- [ ] Real-time updates (WebSocket via Supabase Realtime)
- [ ] Task dependencies (blocker/blocked by relationships)
- [ ] Swimlanes (horizontal grouping by assignee or custom field)
- [ ] Export board to CSV/JSON
- [ ] Archive boards (soft delete)
- [ ] Task templates (predefined task structures)
- [ ] Bulk operations (multi-select tasks → assign, move, delete)

### Could Have (Future)

- [ ] Automation rules (e.g., auto-assign when moved to column)
- [ ] Time tracking per task
- [ ] Sprint planning integration (burn-down charts)
- [ ] AI-powered task suggestions
- [ ] Mobile app with touch gestures

---

## 12. Out of Scope

Explicitly NOT included in this PRD:

- **Real-time collaboration** (WebSocket updates): Deferred to post-MVP
- **Comments/Activity feed on tasks**: Separate feature
- **File attachments to tasks**: Requires storage integration (separate PRD)
- **Email notifications**: Separate notification system PRD
- **Task recurrence**: Not in MVP scope
- **Board templates**: Deferred to post-MVP
- **Public boards** (non-authenticated access): Security concern, not supported

---

## 13. Dependencies & Prerequisites

### Technical Dependencies

- ✅ Supabase database access (already configured)
- ✅ Existing `organizations`, `organization_members`, `projects` tables
- ✅ Existing `roles`, `permissions`, `role_permissions` tables (RBAC system)
- ✅ shadcn/ui components installed
- ✅ TanStack Query configured for server state
- ✅ Next.js 14+ with App Router
- ⚠️ **NEW**: dnd-kit library (must be installed)

### Agent Dependencies

1. **Architect** (YOU) → Create PRD + entities + structure
2. **Test Agent** → Create all tests (failing initially)
3. **Implementer** → Implement use cases (pass tests)
4. **Supabase Agent** → Implement services + DB schema + RLS + migrations
5. **UI/UX Expert** → Create components (pass E2E tests)

### Migration Order

1. Create `permissions` seed data (insert board/column/task/custom_field permissions)
2. Create `boards` table
3. Create `board_columns` table
4. Create `tasks` table
5. Create `custom_field_definitions` table
6. Enable RLS on all tables + create policies
7. Assign permissions to default roles (Admin, Member)

---

## 14. Timeline Estimate

- **Architect** (YOU): 4 hours
  - PRD creation: 2 hours
  - Entities implementation: 1 hour
  - Directory structure: 0.5 hours
  - Context7 research + handoff: 0.5 hours

- **Test Agent**: 8 hours
  - Entity tests: 1 hour
  - Use case tests (boards, tasks, custom fields): 4 hours
  - Service tests: 2 hours
  - E2E test specs: 1 hour

- **Implementer**: 12 hours
  - Board use cases: 3 hours
  - Task use cases (including moveTask logic): 4 hours
  - Custom field use cases + validation: 3 hours
  - API controllers: 2 hours

- **Supabase Agent**: 10 hours
  - Database schema + indexes: 2 hours
  - RLS policies: 3 hours
  - Data services (boards, tasks, custom fields): 4 hours
  - Migration files + seed data: 1 hour

- **UI/UX Expert**: 16 hours
  - Board components (KanbanBoard, BoardColumn, BoardCard): 4 hours
  - Task components (TaskCard, inline creator, modals): 4 hours
  - dnd-kit integration: 3 hours
  - Filters + view switcher: 2 hours
  - Custom field inputs (dynamic rendering): 2 hours
  - E2E tests implementation: 1 hour

**Total Estimate**: 50 hours (~6-7 working days)

---

## 15. Internationalization (i18n)

### Required Namespaces

**Create new namespace**: `boards.json` in `locales/en/` and `locales/es/`

**Critical**: Must update `app/src/i18n/request.ts` to import and merge this namespace:

```typescript
const boardsMessages = (await import(`@/locales/${locale}/boards.json`)).default;

const messages = {
  ...commonMessages,
  auth: authMessages,
  dashboard: dashboardMessages,
  projects: projectsMessages,
  boards: boardsMessages, // ← ADD THIS
};
```

### Translation Structure

```json
{
  "boards": {
    "title": "Kanban Boards",
    "create": {
      "title": "Create Board",
      "name": {
        "label": "Board Name",
        "placeholder": "e.g., Sprint 24 Board",
        "error": "Board name must be at least 2 characters"
      },
      "description": {
        "label": "Description",
        "placeholder": "Describe the purpose of this board..."
      },
      "button": "Create Board"
    },
    "columns": {
      "add": "Add Column",
      "edit": "Edit Column",
      "delete": "Delete Column",
      "wipLimit": "WIP Limit",
      "colorLabel": "Column Color"
    },
    "tasks": {
      "create": {
        "inline": "Add task...",
        "modal": "New Task"
      },
      "priority": {
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "urgent": "Urgent"
      },
      "filters": {
        "search": "Search tasks...",
        "assignee": "Assignee",
        "priority": "Priority"
      }
    },
    "customFields": {
      "add": "Add Custom Field",
      "types": {
        "text": "Text",
        "number": "Number",
        "date": "Date",
        "select": "Dropdown",
        "checkbox": "Checkbox"
      }
    },
    "views": {
      "kanban": "Kanban",
      "list": "List",
      "calendar": "Calendar",
      "table": "Table"
    },
    "errors": {
      "wipLimitExceeded": "This column has reached its WIP limit ({limit})",
      "forbidden": "You don't have permission to perform this action",
      "duplicateName": "A board with this name already exists"
    }
  }
}
```

---

## Appendix A: References

- Project Rules: `.trae/rules/project_rules.md`
- CLAUDE.md: Root directory
- PRD Templates: `PRDs/_templates/`
- Similar Features: None (this is the first board/task management feature)
- Context7 Research:
  - dnd-kit documentation: `/clauderic/dnd-kit`
  - Supabase JSONB best practices: `/supabase/supabase`
  - Supabase RLS patterns: `/supabase/supabase`

---

## Appendix B: Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-01-21 | Architect Agent | Initial PRD creation with complete specifications |

---

## Appendix C: WIP (Work In Progress) Limits Explanation

**What is WIP?**

WIP (Work In Progress) limits are constraints placed on the maximum number of tasks allowed in a specific workflow stage (column) at any given time.

**Why Use WIP Limits?**

1. **Prevent Overload**: Stops teams from starting too many tasks simultaneously
2. **Identify Bottlenecks**: If a column consistently hits its limit, it signals a process bottleneck
3. **Improve Flow**: Forces completion of in-progress work before starting new tasks
4. **Enhance Focus**: Reduces context-switching by limiting concurrent work

**How It Works in This System:**

- **Optional**: Columns can have a `wip_limit` (null = no limit)
- **Enforcement**: When a user tries to move a task to a column, the system checks:
  ```typescript
  const currentTaskCount = await getTaskCountInColumn(targetColumnId);
  if (column.wip_limit && currentTaskCount >= column.wip_limit) {
    throw new Error('WIP_LIMIT_EXCEEDED');
  }
  ```
- **UI Feedback**: Column headers display current count vs limit (e.g., "3/5")
- **Visual Warning**: Column turns red when at capacity

**Example Use Case:**

A Kanban board with columns:
- "To Do" (no WIP limit)
- "In Progress" (WIP limit: 3)
- "Review" (WIP limit: 2)
- "Done" (no WIP limit)

If "In Progress" already has 3 tasks and a developer tries to drag a 4th task into it, the system prevents the move and shows an error: "This column has reached its WIP limit (3)".

---

**END OF PRD**
