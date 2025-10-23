/**
 * reorderColumns Use Case Tests
 *
 * Tests business logic for reordering board columns (drag & drop).
 * Validates position recalculation logic.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reorderColumns } from './reorderColumns';
import type { BoardService } from '../services/board.service';

vi.mock('../services/board.service');

describe('reorderColumns', () => {
  let mockBoardService: jest.Mocked<BoardService>;

  beforeEach(() => {
    mockBoardService = {
      getById: vi.fn(),
      getColumnById: vi.fn(),
      updateColumn: vi.fn(),
      reorderColumns: vi.fn(),
    } as any;
  });

  describe('Happy Path', () => {
    it('reorders columns with new positions', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { column_id: 'col-1', position: 2 },
        { column_id: 'col-2', position: 0 },
        { column_id: 'col-3', position: 1 },
      ];

      const board = { id: boardId, name: 'Board', organization_id: 'org-1' };
      const updatedColumns = [
        { id: 'col-2', position: 0 },
        { id: 'col-3', position: 1 },
        { id: 'col-1', position: 2 },
      ];

      mockBoardService.getById.mockResolvedValue(board as any);
      mockBoardService.reorderColumns.mockResolvedValue(updatedColumns as any);

      const result = await reorderColumns(boardId, reorderData, mockBoardService);

      expect(result).toEqual(updatedColumns);
      expect(mockBoardService.reorderColumns).toHaveBeenCalledWith(boardId, reorderData);
    });

    it('moves column from first to last position', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { column_id: 'col-1', position: 2 }, // Was 0, now 2 (last)
        { column_id: 'col-2', position: 0 }, // Was 1, now 0 (first)
        { column_id: 'col-3', position: 1 }, // Was 2, now 1 (middle)
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);
      mockBoardService.reorderColumns.mockResolvedValue([]);

      await reorderColumns(boardId, reorderData, mockBoardService);

      expect(mockBoardService.reorderColumns).toHaveBeenCalledWith(
        boardId,
        expect.arrayContaining([
          expect.objectContaining({ column_id: 'col-1', position: 2 }),
        ])
      );
    });

    it('swaps two adjacent columns', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { column_id: 'col-1', position: 1 }, // Swap with col-2
        { column_id: 'col-2', position: 0 },
        { column_id: 'col-3', position: 2 }, // Unchanged
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);
      mockBoardService.reorderColumns.mockResolvedValue([]);

      await reorderColumns(boardId, reorderData, mockBoardService);

      expect(mockBoardService.reorderColumns).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('throws error when board does not exist', async () => {
      const boardId = 'non-existent';
      const reorderData = [{ column_id: 'col-1', position: 0 }];

      mockBoardService.getById.mockResolvedValue(null);

      await expect(
        reorderColumns(boardId, reorderData, mockBoardService)
      ).rejects.toThrow('BOARD_NOT_FOUND');
    });

    it('throws error when positions are not sequential', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { column_id: 'col-1', position: 0 },
        { column_id: 'col-2', position: 2 }, // Gap! Should be 1
        { column_id: 'col-3', position: 3 },
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);

      await expect(
        reorderColumns(boardId, invalidData, mockBoardService)
      ).rejects.toThrow('Positions must be sequential starting from 0');
    });

    it('throws error when positions do not start at 0', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { column_id: 'col-1', position: 1 }, // Should start at 0
        { column_id: 'col-2', position: 2 },
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);

      await expect(
        reorderColumns(boardId, invalidData, mockBoardService)
      ).rejects.toThrow('Positions must start at 0');
    });

    it('throws error when duplicate positions exist', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { column_id: 'col-1', position: 0 },
        { column_id: 'col-2', position: 0 }, // Duplicate!
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);

      await expect(
        reorderColumns(boardId, invalidData, mockBoardService)
      ).rejects.toThrow('Duplicate positions detected');
    });

    it('throws error when column_id is invalid', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { column_id: '', position: 0 }, // Empty column_id
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);

      await expect(
        reorderColumns(boardId, invalidData, mockBoardService)
      ).rejects.toThrow('Invalid column_id');
    });

    it('throws error when reorder data is empty', async () => {
      const boardId = 'board-1';
      const emptyData: any[] = [];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);

      await expect(
        reorderColumns(boardId, emptyData, mockBoardService)
      ).rejects.toThrow('Reorder data cannot be empty');
    });

    it('validates all columns belong to the board', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { column_id: 'col-from-different-board', position: 0 },
      ];

      const board = { id: boardId, columns: [{ id: 'col-1' }] };

      mockBoardService.getById.mockResolvedValue(board as any);

      await expect(
        reorderColumns(boardId, invalidData, mockBoardService)
      ).rejects.toThrow('COLUMN_NOT_IN_BOARD');
    });
  });

  describe('Authorization', () => {
    it('allows reordering when user is board member', async () => {
      const boardId = 'board-1';
      const reorderData = [{ column_id: 'col-1', position: 0 }];
      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      mockBoardService.getById.mockResolvedValue({
        id: boardId,
        organization_id: 'org-1',
      } as any);
      mockBoardService.reorderColumns.mockResolvedValue([]);

      await reorderColumns(boardId, reorderData, mockBoardService, authContext);

      expect(mockBoardService.reorderColumns).toHaveBeenCalled();
    });

    it('throws UNAUTHORIZED when user does not belong to organization', async () => {
      const boardId = 'board-1';
      const reorderData = [{ column_id: 'col-1', position: 0 }];
      const authContext = { userId: 'user-1', organizationIds: ['org-2'] };

      mockBoardService.getById.mockResolvedValue({
        id: boardId,
        organization_id: 'org-1',
      } as any);

      await expect(
        reorderColumns(boardId, reorderData, mockBoardService, authContext)
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('Transaction Handling', () => {
    it('updates all column positions atomically', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { column_id: 'col-1', position: 2 },
        { column_id: 'col-2', position: 0 },
        { column_id: 'col-3', position: 1 },
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);
      mockBoardService.reorderColumns.mockResolvedValue([]);

      await reorderColumns(boardId, reorderData, mockBoardService);

      // Should be called once with all data (atomic transaction)
      expect(mockBoardService.reorderColumns).toHaveBeenCalledTimes(1);
    });

    it('rolls back on partial failure', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { column_id: 'col-1', position: 1 },
        { column_id: 'col-2', position: 0 },
      ];

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);
      mockBoardService.reorderColumns.mockRejectedValue(
        new Error('Database error during transaction')
      );

      await expect(
        reorderColumns(boardId, reorderData, mockBoardService)
      ).rejects.toThrow('Failed to reorder columns');
    });
  });

  describe('Performance', () => {
    it('handles large number of columns efficiently', async () => {
      const boardId = 'board-1';
      const reorderData = Array.from({ length: 100 }, (_, i) => ({
        column_id: `col-${i}`,
        position: 99 - i, // Reverse order
      }));

      mockBoardService.getById.mockResolvedValue({ id: boardId } as any);
      mockBoardService.reorderColumns.mockResolvedValue([]);

      await reorderColumns(boardId, reorderData, mockBoardService);

      expect(mockBoardService.reorderColumns).toHaveBeenCalledWith(
        boardId,
        expect.arrayContaining(reorderData)
      );
    });
  });
});
