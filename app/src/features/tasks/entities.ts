/**
 * Tasks Feature - Entities
 *
 * Pure data contracts defined with Zod schemas.
 * NO business logic, NO external dependencies (except Zod).
 *
 * Created by: Architect Agent
 * Date: 2025-01-21
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { z } from 'zod';

// ============================================================================
// TASK ENTITY
// ============================================================================

/**
 * Priority levels for tasks (ordered by urgency)
 */
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'], {
  errorMap: () => ({ message: 'Priority must be: low, medium, high, or urgent' })
});

/**
 * Task represents a work item in a Kanban board.
 * Supports custom fields via JSONB for maximum flexibility.
 *
 * Hybrid Architecture:
 * - Known fields (title, description, assigned_to, priority, due_date) → Dedicated columns
 * - User-defined custom fields → JSONB (custom_fields_values)
 *
 * @example
 * const exampleTask: Task = {
 *   id: "uuid-here",
 *   board_column_id: "column-uuid",
 *   organization_id: "org-uuid",
 *   title: "Implement drag & drop",
 *   description: "Use dnd-kit for task movement",
 *   assigned_to: "user-uuid",
 *   priority: "high",
 *   due_date: new Date("2025-02-01"),
 *   position: 0,
 *   custom_fields_values: {
 *     "story-points-field-id": 5,
 *     "sprint-field-id": "Sprint 24"
 *   },
 *   created_by: "user-uuid",
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * };
 */
export const TaskSchema = z.object({
  id: z.string().uuid(),
  board_column_id: z.string().uuid(),
  organization_id: z.string().uuid(), // Denormalized for RLS performance
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
  position: z.number().int().nonnegative(), // Position within column (0-indexed)

  // JSONB for custom field values: { "custom_field_id": "value" }
  // Values validated against CustomFieldDefinition by use case
  custom_fields_values: z.record(z.any()).optional().nullable(),

  created_by: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Schema for creating new Task
 * Omits auto-generated fields
 */
export const TaskCreateSchema = TaskSchema.omit({
  id: true,
  organization_id: true, // Derived from board's organization
  position: true, // Auto-assigned (appended to end of column)
  created_by: true, // Set by use case from authenticated user
  created_at: true,
  updated_at: true,
});

/**
 * Schema for updating existing Task
 * All editable fields are optional (partial update)
 */
export const TaskUpdateSchema = TaskSchema.pick({
  title: true,
  description: true,
  assigned_to: true,
  priority: true,
  due_date: true,
  custom_fields_values: true,
}).partial();

/**
 * Schema for moving task between columns (drag & drop)
 * This is a specialized operation separate from general update
 */
export const TaskMoveSchema = z.object({
  task_id: z.string().uuid(),
  target_column_id: z.string().uuid(),
  target_position: z.number().int().nonnegative(),
});

/**
 * Schema for querying/filtering tasks
 * Supports search, assignee filter, priority filter, custom field filters, date ranges
 */
export const TaskQuerySchema = z.object({
  board_id: z.string().uuid(),

  // Search (full-text in title + description)
  search: z.string().optional(),

  // Filters
  assigned_to: z.array(z.string().uuid()).optional(), // Multiple assignees (OR logic)
  priority: z.array(TaskPriorityEnum).optional(), // Multiple priorities (OR logic)
  column_id: z.string().uuid().optional(), // Filter by specific column

  // Date range filter (for due_date or created_at)
  date_range: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).optional(),

  // View type (determines data transformation)
  view_type: z.enum(['kanban', 'list', 'calendar', 'table']).default('kanban'),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Task = z.infer<typeof TaskSchema>;
export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type TaskMove = z.infer<typeof TaskMoveSchema>;
export type TaskQuery = z.infer<typeof TaskQuerySchema>;
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

// ============================================================================
// TYPE GUARDS (for runtime checking)
// ============================================================================

export function isTask(value: unknown): value is Task {
  return TaskSchema.safeParse(value).success;
}

export function isTaskCreate(value: unknown): value is TaskCreate {
  return TaskCreateSchema.safeParse(value).success;
}

export function isTaskMove(value: unknown): value is TaskMove {
  return TaskMoveSchema.safeParse(value).success;
}

/**
 * Type guard for valid task priority
 */
export function isValidTaskPriority(priority: string): priority is TaskPriority {
  return ['low', 'medium', 'high', 'urgent'].includes(priority);
}
