/**
 * deleteColumn Use Case
 *
 * Business logic for deleting a board column.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { BoardService } from '../services/board.service';

/**
 * Options for column deletion
 */
interface DeleteColumnOptions {
  force?: boolean; // Delete even if has tasks
  moveTasksToColumnId?: string; // Move tasks to another column
}

/**
 * Deletes a board column.
 *
 * Business rules:
 * 1. Validates column_id format
 * 2. Checks if column exists
 * 3. Deletes column from database
 *
 * @param columnId - UUID of the column to delete
 * @param boardService - Board data service
 * @param options - Optional deletion options
 * @throws Error if column not found or database error
 */
export async function deleteColumn(
  columnId: string,
  boardService: BoardService,
  options?: DeleteColumnOptions
): Promise<void> {
  // 1. Validate input
  if (!columnId || typeof columnId !== 'string') {
    throw new Error('INVALID_COLUMN_ID');
  }

  if (columnId.length < 5) {
    throw new Error('INVALID_COLUMN_ID');
  }

  // 2. Check if column exists
  let column;

  try {
    column = await boardService.getColumnById(columnId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to delete column');
    }
    throw error;
  }

  if (!column) {
    throw new Error('COLUMN_NOT_FOUND');
  }

  // 3. Delete column
  try {
    await boardService.deleteColumn(columnId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database connection')) {
      throw new Error('Failed to delete column');
    }
    throw error;
  }
}
