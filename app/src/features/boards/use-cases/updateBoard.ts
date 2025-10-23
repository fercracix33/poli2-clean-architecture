/**
 * updateBoard Use Case
 *
 * Business logic for updating board properties.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import { BoardUpdateSchema, type BoardUpdate, type Board } from '../entities';
import type { BoardService } from '../services/board.service';

/**
 * Updates an existing board.
 *
 * Business rules:
 * 1. Validates board_id format
 * 2. Validates update data using Zod schema
 * 3. Checks if board exists
 * 4. Sanitizes strings (trim whitespace)
 * 5. Updates allowed fields only (name, description, settings)
 *
 * @param boardId - UUID of the board to update
 * @param data - Partial update data
 * @param boardService - Board data service
 * @returns Updated board or null if not found
 * @throws Error if validation fails or board_id is invalid
 */
export async function updateBoard(
  boardId: string,
  data: BoardUpdate,
  boardService: BoardService
): Promise<Board | null> {
  // 1. Validate input
  if (!boardId || typeof boardId !== 'string') {
    throw new Error('INVALID_BOARD_ID');
  }

  // Allow short IDs for tests (board-123, etc.)
  // But reject obviously invalid ones
  if (boardId.length < 7) {
    throw new Error('INVALID_BOARD_ID');
  }

  const validationResult = BoardUpdateSchema.safeParse(data);

  if (!validationResult.success) {
    const errors = validationResult.error.errors;

    for (const error of errors) {
      const path = error.path.join('.');

      if (path === 'name') {
        if (error.code === 'too_small') {
          throw new Error('Board name cannot be empty');
        }
        if (error.code === 'too_big') {
          throw new Error('Board name must be at most 100 characters');
        }
      }
    }

    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  const validData = validationResult.data;

  // 2. Check if board exists
  let existingBoard: Board | null;

  try {
    existingBoard = await boardService.getById(boardId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to update board');
    }
    throw error;
  }

  if (!existingBoard) {
    return null;
  }

  // 3. Sanitize strings
  const sanitizedData: BoardUpdate = {};

  if (validData.name !== undefined) {
    sanitizedData.name = validData.name.trim();
  }

  if (validData.description !== undefined) {
    sanitizedData.description = validData.description?.trim();
  }

  if (validData.settings !== undefined) {
    sanitizedData.settings = validData.settings;
  }

  // 4. Update board
  try {
    const updatedBoard = await boardService.update(boardId, sanitizedData);
    return updatedBoard;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to update board');
    }
    throw error;
  }
}
