/**
 * updateColumn Use Case
 *
 * Business logic for updating board column properties.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import { BoardColumnUpdateSchema, type BoardColumnUpdate, type BoardColumn } from '../entities';
import type { BoardService } from '../services/board.service';

/**
 * Updates an existing board column.
 *
 * Business rules:
 * 1. Validates column_id format
 * 2. Validates update data using Zod schema
 * 3. Checks if column exists
 * 4. Sanitizes strings (trim whitespace)
 * 5. Updates allowed fields only (name, color, wip_limit)
 *
 * @param columnId - UUID of the column to update
 * @param data - Partial update data
 * @param boardService - Board data service
 * @returns Updated column or null if not found
 * @throws Error if validation fails or column_id is invalid
 */
export async function updateColumn(
  columnId: string,
  data: BoardColumnUpdate,
  boardService: BoardService
): Promise<BoardColumn | null> {
  // 1. Validate input
  if (!columnId || typeof columnId !== 'string') {
    throw new Error('INVALID_COLUMN_ID');
  }

  if (columnId.length < 5) {
    throw new Error('INVALID_COLUMN_ID');
  }

  const validationResult = BoardColumnUpdateSchema.safeParse(data);

  if (!validationResult.success) {
    const errors = validationResult.error.errors;

    for (const error of errors) {
      const path = error.path.join('.');

      if (path === 'name') {
        if (error.code === 'too_small') {
          throw new Error('Column name cannot be empty');
        }
        if (error.code === 'too_big') {
          throw new Error('Column name must be at most 50 characters');
        }
      }

      if (path === 'color') {
        if (error.code === 'invalid_string') {
          throw new Error('Invalid color format');
        }
      }

      if (path === 'wip_limit') {
        if (error.code === 'too_small') {
          throw new Error('WIP limit must be positive');
        }
      }
    }

    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  const validData = validationResult.data;

  // 2. Check if column exists
  let existingColumn: BoardColumn | null;

  try {
    existingColumn = await boardService.getColumnById(columnId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to update column');
    }
    throw error;
  }

  if (!existingColumn) {
    return null;
  }

  // 3. Sanitize
  const sanitizedData: BoardColumnUpdate = {};

  if (validData.name !== undefined) {
    sanitizedData.name = validData.name.trim();
  }

  if (validData.color !== undefined) {
    sanitizedData.color = validData.color;
  }

  if (validData.wip_limit !== undefined) {
    sanitizedData.wip_limit = validData.wip_limit;
  }

  // 4. Update column
  try {
    const updatedColumn = await boardService.updateColumn(columnId, sanitizedData);
    return updatedColumn;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to update column');
    }
    throw error;
  }
}
