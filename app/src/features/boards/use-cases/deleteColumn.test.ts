/**
 * deleteColumn Use Case Tests
 *
 * Tests business logic for deleting board columns.
 * Validates that tasks are handled before deletion.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteColumn } from './deleteColumn';
import type { BoardService } from '../services/board.service';
import type { TaskService } from '../../tasks/services/task.service';

vi.mock('../services/board.service');
vi.mock('../../tasks/services/task.service');

describe('deleteColumn', () => {
  let mockBoardService: jest.Mocked<BoardService>;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    mockBoardService = {
      getColumnById: vi.fn(),
      deleteColumn: vi.fn(),
      reorderColumns: vi.fn(),
    } as any;

    mockTaskService = {
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;
  });

  describe('Happy Path', () => {
    it('deletes column when it has no tasks', async () => {
      const columnId = 'col-1';
      const column = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(column as any);
      mockTaskService.list.mockResolvedValue([]); // No tasks
      mockBoardService.deleteColumn.mockResolvedValue(undefined);

      await deleteColumn(columnId, mockBoardService, mockTaskService);

      expect(mockBoardService.deleteColumn).toHaveBeenCalledWith(columnId);
    });
  });

  describe('Task Handling', () => {
    it('throws error when column has tasks and no target column specified', async () => {
      const columnId = 'col-1';
      const column = { id: columnId, board_id: 'board-1', name: 'Column', position: 0 };
      const tasks = [{ id: 'task-1', board_column_id: columnId }];

      mockBoardService.getColumnById.mockResolvedValue(column as any);
      mockTaskService.list.mockResolvedValue(tasks as any);

      await expect(
        deleteColumn(columnId, mockBoardService, mockTaskService)
      ).rejects.toThrow('COLUMN_HAS_TASKS');
    });

    it('moves tasks to target column before deletion', async () => {
      const columnId = 'col-1';
      const targetColumnId = 'col-2';
      const column = { id: columnId, board_id: 'board-1', name: 'Column', position: 0 };
      const tasks = [
        { id: 'task-1', board_column_id: columnId },
        { id: 'task-2', board_column_id: columnId },
      ];

      mockBoardService.getColumnById.mockResolvedValue(column as any);
      mockTaskService.list.mockResolvedValue(tasks as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockBoardService.deleteColumn.mockResolvedValue(undefined);

      await deleteColumn(columnId, mockBoardService, mockTaskService, { targetColumnId });

      expect(mockTaskService.update).toHaveBeenCalledTimes(2);
      expect(mockTaskService.update).toHaveBeenCalledWith('task-1', { board_column_id: targetColumnId });
      expect(mockTaskService.update).toHaveBeenCalledWith('task-2', { board_column_id: targetColumnId });
      expect(mockBoardService.deleteColumn).toHaveBeenCalledWith(columnId);
    });

    it('deletes tasks when force delete option is enabled', async () => {
      const columnId = 'col-1';
      const column = { id: columnId, board_id: 'board-1', name: 'Column', position: 0 };
      const tasks = [{ id: 'task-1' }, { id: 'task-2' }];

      mockBoardService.getColumnById.mockResolvedValue(column as any);
      mockTaskService.list.mockResolvedValue(tasks as any);
      mockTaskService.delete.mockResolvedValue(undefined);
      mockBoardService.deleteColumn.mockResolvedValue(undefined);

      await deleteColumn(columnId, mockBoardService, mockTaskService, { forceDelete: true });

      expect(mockTaskService.delete).toHaveBeenCalledTimes(2);
      expect(mockBoardService.deleteColumn).toHaveBeenCalledWith(columnId);
    });
  });

  describe('Position Reordering', () => {
    it('reorders remaining columns after deletion', async () => {
      const columnId = 'col-2';
      const column = { id: columnId, board_id: 'board-1', position: 1 };
      const remainingColumns = [
        { id: 'col-1', position: 0 },
        { id: 'col-3', position: 2 },
      ];

      mockBoardService.getColumnById.mockResolvedValue(column as any);
      mockTaskService.list.mockResolvedValue([]);
      mockBoardService.deleteColumn.mockResolvedValue(undefined);
      mockBoardService.reorderColumns.mockResolvedValue(remainingColumns as any);

      await deleteColumn(columnId, mockBoardService, mockTaskService, { reorderPositions: true });

      expect(mockBoardService.reorderColumns).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('throws error when column does not exist', async () => {
      mockBoardService.getColumnById.mockResolvedValue(null);

      await expect(
        deleteColumn('non-existent', mockBoardService, mockTaskService)
      ).rejects.toThrow('COLUMN_NOT_FOUND');
    });

    it('prevents deletion of last column in board', async () => {
      const columnId = 'col-1';
      const column = { id: columnId, board_id: 'board-1', is_last_column: true };

      mockBoardService.getColumnById.mockResolvedValue(column as any);

      await expect(
        deleteColumn(columnId, mockBoardService, mockTaskService)
      ).rejects.toThrow('CANNOT_DELETE_LAST_COLUMN');
    });
  });

  describe('Authorization', () => {
    it('allows deletion when user is board admin', async () => {
      const columnId = 'col-1';
      const column = { id: columnId, board_id: 'board-1', organization_id: 'org-1' };
      const authContext = { userId: 'user-1', organizationIds: ['org-1'], role: 'admin' };

      mockBoardService.getColumnById.mockResolvedValue(column as any);
      mockTaskService.list.mockResolvedValue([]);
      mockBoardService.deleteColumn.mockResolvedValue(undefined);

      await deleteColumn(columnId, mockBoardService, mockTaskService, { authContext });

      expect(mockBoardService.deleteColumn).toHaveBeenCalled();
    });

    it('throws UNAUTHORIZED when user does not belong to organization', async () => {
      const columnId = 'col-1';
      const column = { id: columnId, board_id: 'board-1', organization_id: 'org-2' };
      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      mockBoardService.getColumnById.mockResolvedValue(column as any);

      await expect(
        deleteColumn(columnId, mockBoardService, mockTaskService, { authContext })
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });
});
