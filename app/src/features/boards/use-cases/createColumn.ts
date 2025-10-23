/**
 * createColumn Use Case
 *
 * Business logic for creating a board column.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import { BoardColumnCreateSchema, type BoardColumnCreate, type BoardColumn } from '../entities';
import type { BoardService } from '../services/board.service';

/**
 * Creates a new board column.
 *
 * Business rules:
 * 1. Validates input using Zod schema
 * 2. Verifies board exists
 * 3. Assigns position at end if not specified
 * 4. Sanitizes strings (trim whitespace)
 * 5. Creates column in database
 *
 * @param data - Column creation data
 * @param boardService - Board data service
 * @returns Created column with metadata
 * @throws Error if validation fails, board not found, or database error
 */
export async function createColumn(
  data: BoardColumnCreate,
  boardService: BoardService
): Promise<BoardColumn> {
  // 1. Validate input
  const validationResult = BoardColumnCreateSchema.safeParse(data);

  if (!validationResult.success) {
    const errors = validationResult.error.errors;

    // Map Zod errors to user-friendly messages
    for (const error of errors) {
      const path = error.path.join('.');

      if (path === 'board_id') {
        if (error.code === 'invalid_type') {
          throw new Error('board_id is required');
        }
        if (error.code === 'invalid_string') {
          throw new Error('Invalid board_id format');
        }
      }

      if (path === 'name') {
        if (error.code === 'too_small') {
          throw new Error('Column name cannot be empty');
        }
        if (error.code === 'too_big') {
          throw new Error('Column name must be at most 50 characters');
        }
      }
    }

    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  const validData = validationResult.data;

  // 2. Verify board exists
  const board = await boardService.getById(validData.board_id);

  if (!board) {
    throw new Error('BOARD_NOT_FOUND');
  }

  // 3. Sanitize
  const sanitizedData = {
    ...validData,
    name: validData.name.trim(),
  };

  // 4. Create column
  const column = await boardService.createColumn(sanitizedData);

  if (!column) {
    throw new Error('COLUMN_CREATION_FAILED');
  }

  return column;
}
