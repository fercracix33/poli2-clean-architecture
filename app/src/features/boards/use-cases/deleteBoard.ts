/**
 * deleteBoard Use Case
 *
 * Business logic for deleting a board (soft delete by default).
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { BoardService } from '../services/board.service';

/**
 * Options for board deletion
 */
interface DeleteBoardOptions {
  force?: boolean; // Hard delete even if has tasks
  userId?: string; // For authorization
}

/**
 * Deletes a board (soft delete by default).
 *
 * Business rules:
 * 1. Validates board_id format
 * 2. Checks if board exists
 * 3. Performs soft delete by default
 *
 * @param boardId - UUID of the board to delete
 * @param boardService - Board data service
 * @param options - Optional deletion options
 * @throws Error if board not found or database error
 */
export async function deleteBoard(
  boardId: string,
  boardService: BoardService,
  options?: DeleteBoardOptions
): Promise<void> {
  // 1. Validate input
  if (!boardId || typeof boardId !== 'string') {
    throw new Error('INVALID_BOARD_ID');
  }

  if (boardId.length < 7) {
    throw new Error('INVALID_BOARD_ID');
  }

  // 2. Check if board exists
  let board;

  try {
    board = await boardService.getById(boardId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to delete board');
    }
    throw error;
  }

  if (!board) {
    throw new Error('BOARD_NOT_FOUND');
  }

  // 3. Delete board (soft delete by default)
  try {
    await boardService.delete(boardId, { soft: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to delete board');
    }
    throw error;
  }
}
