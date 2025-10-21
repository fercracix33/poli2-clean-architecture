/**
 * Boards Feature - Entities
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
// BOARD ENTITY
// ============================================================================

/**
 * Board represents a Kanban board within a project.
 * Multiple boards can exist per project for different workflows.
 *
 * @example
 * const exampleBoard: Board = {
 *   id: "uuid-here",
 *   project_id: "project-uuid",
 *   organization_id: "org-uuid",
 *   name: "Sprint 24 Board",
 *   description: "Kanban board for Sprint 24",
 *   settings: {},
 *   created_by: "user-uuid",
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * };
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
  settings: z.record(z.any()).optional().nullable(), // Future: board-level settings (e.g., default view)
  created_by: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Schema for creating new Board
 * Omits auto-generated fields (id, organization_id, created_by, timestamps)
 */
export const BoardCreateSchema = BoardSchema.omit({
  id: true,
  organization_id: true, // Derived from project in use case
  created_by: true, // Set by use case from authenticated user
  created_at: true,
  updated_at: true,
});

/**
 * Schema for updating existing Board
 * Only name, description, and settings are editable
 */
export const BoardUpdateSchema = BoardSchema.pick({
  name: true,
  description: true,
  settings: true,
}).partial();

/**
 * Schema for querying boards (list endpoint)
 */
export const BoardQuerySchema = z.object({
  project_id: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================================
// BOARD COLUMN ENTITY
// ============================================================================

/**
 * BoardColumn represents a workflow stage in a Kanban board.
 * Fully customizable: name, color, WIP limit, ordering.
 *
 * @example
 * const exampleColumn: BoardColumn = {
 *   id: "uuid-here",
 *   board_id: "board-uuid",
 *   name: "In Progress",
 *   color: "#3B82F6", // Tailwind blue-500
 *   wip_limit: 5,
 *   position: 1,
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * };
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

/**
 * Schema for creating new BoardColumn
 * Position is auto-assigned by use case (appended to end)
 */
export const BoardColumnCreateSchema = BoardColumnSchema.omit({
  id: true,
  position: true, // Auto-assigned by use case
  created_at: true,
  updated_at: true,
});

/**
 * Schema for updating existing BoardColumn
 * Only name, color, and wip_limit are editable
 */
export const BoardColumnUpdateSchema = BoardColumnSchema.pick({
  name: true,
  color: true,
  wip_limit: true,
}).partial();

/**
 * Schema for reordering columns (drag & drop)
 * Used in batch reorder endpoint
 */
export const BoardColumnReorderSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Board = z.infer<typeof BoardSchema>;
export type BoardCreate = z.infer<typeof BoardCreateSchema>;
export type BoardUpdate = z.infer<typeof BoardUpdateSchema>;
export type BoardQuery = z.infer<typeof BoardQuerySchema>;

export type BoardColumn = z.infer<typeof BoardColumnSchema>;
export type BoardColumnCreate = z.infer<typeof BoardColumnCreateSchema>;
export type BoardColumnUpdate = z.infer<typeof BoardColumnUpdateSchema>;
export type BoardColumnReorder = z.infer<typeof BoardColumnReorderSchema>;

// ============================================================================
// TYPE GUARDS (for runtime checking)
// ============================================================================

export function isBoard(value: unknown): value is Board {
  return BoardSchema.safeParse(value).success;
}

export function isBoardCreate(value: unknown): value is BoardCreate {
  return BoardCreateSchema.safeParse(value).success;
}

export function isBoardColumn(value: unknown): value is BoardColumn {
  return BoardColumnSchema.safeParse(value).success;
}

export function isBoardColumnCreate(value: unknown): value is BoardColumnCreate {
  return BoardColumnCreateSchema.safeParse(value).success;
}
