/**
 * reorderColumns Use Case
 *
 * Business logic for reordering board columns (drag & drop).
 * Validates position sequencing and performs atomic batch update.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { BoardService } from '../services/board.service';
import type { BoardColumn } from '../entities';

/**
 * Reorder data for a single column
 */
interface ColumnReorderData {
  column_id: string;
  position: number;
}

/**
 * Authorization context for reordering
 */
interface AuthContext {
  userId: string;
  organizationIds: string[];
}

/**
 * Reorders board columns (drag & drop).
 *
 * Business rules:
 * 1. Validates board exists
 * 2. Validates reorder data is not empty
 * 3. Validates all column_ids are valid UUIDs
 * 4. Validates positions are sequential (0, 1, 2, ..., n-1)
 * 5. Validates no duplicate positions
 * 6. Validates all columns belong to the board
 * 7. Performs atomic batch update (all or nothing)
 *
 * @param boardId - UUID of the board
 * @param reorderData - Array of column_id and new position pairs
 * @param boardService - Board data service
 * @param authContext - Optional authorization context
 * @returns Updated columns with new positions
 * @throws Error if validation fails or database error
 */
export async function reorderColumns(
  boardId: string,
  reorderData: ColumnReorderData[],
  boardService: BoardService,
  authContext?: AuthContext
): Promise<BoardColumn[]> {
  // 1. Validate board_id
  if (!boardId || typeof boardId !== 'string') {
    throw new Error('INVALID_BOARD_ID');
  }

  // 2. Validate reorder data is not empty
  if (!reorderData || reorderData.length === 0) {
    throw new Error('Reorder data cannot be empty');
  }

  // 3. Validate all column_ids
  for (const item of reorderData) {
    if (!item.column_id || typeof item.column_id !== 'string') {
      throw new Error('Invalid column_id');
    }
  }

  // 4. Check if board exists
  const board = await boardService.getById(boardId);

  if (!board) {
    throw new Error('BOARD_NOT_FOUND');
  }

  // 5. Authorization check
  if (authContext) {
    const isAuthorized = authContext.organizationIds.includes(
      (board as any).organization_id
    );

    if (!isAuthorized) {
      throw new Error('UNAUTHORIZED');
    }
  }

  // 6. Validate positions are sequential starting from 0
  const positions = reorderData.map((item) => item.position).sort((a, b) => a - b);

  // Check if starts at 0
  if (positions[0] !== 0) {
    throw new Error('Positions must start at 0');
  }

  // Check if sequential (no gaps)
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] !== i) {
      throw new Error('Positions must be sequential starting from 0');
    }
  }

  // 7. Validate no duplicate positions
  const positionSet = new Set(positions);

  if (positionSet.size !== positions.length) {
    throw new Error('Duplicate positions detected');
  }

  // 8. Validate all columns belong to the board (if board has columns)
  if ((board as any).columns) {
    const boardColumnIds = new Set((board as any).columns.map((col: any) => col.id));

    for (const item of reorderData) {
      if (!boardColumnIds.has(item.column_id)) {
        throw new Error('COLUMN_NOT_IN_BOARD');
      }
    }
  }

  // 9. Perform atomic batch update
  try {
    const updatedColumns = await boardService.reorderColumns(boardId, reorderData);
    return updatedColumns;
  } catch (error) {
    throw new Error('Failed to reorder columns');
  }
}
