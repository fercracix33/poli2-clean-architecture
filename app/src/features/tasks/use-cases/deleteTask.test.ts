/**
 * deleteTask Use Case Tests
 *
 * Tests business logic for deleting tasks.
 * Mocks TaskService.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteTask } from './deleteTask';
import type { TaskService } from '../services/task.service';

// Mock service module
vi.mock('../services/task.service');

describe('deleteTask', () => {
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    // Create fresh mock for each test
    mockTaskService = {
      create: vi.fn(),
      getById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByColumnId: vi.fn(),
    } as any;
  });

  describe('Happy Path', () => {
    it('deletes task successfully', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440000';
      const existingTask = {
        id: taskId,
        title: 'Task to delete',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService);

      // Assert
      expect(mockTaskService.delete).toHaveBeenCalledWith(taskId);
      expect(mockTaskService.delete).toHaveBeenCalledTimes(1);
    });

    it('returns confirmation after successful deletion', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      const result = await deleteTask(taskId, mockTaskService);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Task deleted successfully',
      });
    });
  });

  describe('Validation', () => {
    it('throws error when task id is empty', async () => {
      // Arrange
      const invalidId = '';

      // Act & Assert
      await expect(
        deleteTask(invalidId, mockTaskService)
      ).rejects.toThrow('Task ID is required');
    });

    it('throws error when task id is not a valid UUID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act & Assert
      await expect(
        deleteTask(invalidId, mockTaskService)
      ).rejects.toThrow('Invalid UUID');
    });

    it('throws error when task does not exist', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440000';
      mockTaskService.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService)
      ).rejects.toThrow('TASK_NOT_FOUND');
    });
  });

  describe('Authorization', () => {
    it('allows deletion when user belongs to task organization', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-1',
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService, authContext);

      // Assert
      expect(mockTaskService.delete).toHaveBeenCalledWith(taskId);
    });

    it('throws UNAUTHORIZED when user does not belong to task organization', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-2', // Different org
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'], // User not in org-2
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService, authContext)
      ).rejects.toThrow('UNAUTHORIZED');

      // Service should not be called
      expect(mockTaskService.delete).not.toHaveBeenCalled();
    });

    it('throws FORBIDDEN when user is not task owner or admin', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-1',
        created_by: 'user-2', // Different user
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
        role: 'member', // Not admin
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService, authContext)
      ).rejects.toThrow('FORBIDDEN');

      expect(mockTaskService.delete).not.toHaveBeenCalled();
    });

    it('allows deletion when user is admin', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-1',
        created_by: 'user-2', // Different user
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
        role: 'admin', // Admin can delete
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService, authContext);

      // Assert
      expect(mockTaskService.delete).toHaveBeenCalledWith(taskId);
    });

    it('allows deletion when user is task owner', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-1',
        created_by: 'user-1', // Same user
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
        role: 'member',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService, authContext);

      // Assert
      expect(mockTaskService.delete).toHaveBeenCalledWith(taskId);
    });
  });

  describe('Cascade Deletion', () => {
    it('deletes task comments when task is deleted', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task with comments',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService, { cascade: true });

      // Assert
      expect(mockTaskService.delete).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({ cascade: true })
      );
    });

    it('throws error when task has related data and cascade is false', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task with data',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockRejectedValue(
        new Error('FOREIGN_KEY_VIOLATION')
      );

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService)
      ).rejects.toThrow('Cannot delete task with related data');
    });
  });

  describe('Position Reordering', () => {
    it('reorders remaining tasks after deletion', async () => {
      // Arrange
      const taskId = 'task-2'; // Middle task
      const existingTask = {
        id: taskId,
        title: 'Task 2',
        board_column_id: 'col-1',
        position: 1,
      };

      const remainingTasks = [
        { id: 'task-1', position: 0 },
        { id: 'task-3', position: 2 },
      ];

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);
      mockTaskService.getByColumnId.mockResolvedValue(remainingTasks as any);

      // Act
      await deleteTask(taskId, mockTaskService, { reorderPositions: true });

      // Assert
      expect(mockTaskService.update).toHaveBeenCalledWith(
        'task-3',
        expect.objectContaining({ position: 1 }) // Decreased from 2 to 1
      );
    });

    it('does not reorder when reorderPositions is false', async () => {
      // Arrange
      const taskId = 'task-2';
      const existingTask = {
        id: taskId,
        title: 'Task 2',
        board_column_id: 'col-1',
        position: 1,
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService, { reorderPositions: false });

      // Assert
      expect(mockTaskService.update).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService)
      ).rejects.toThrow('Failed to delete task');
    });

    it('handles unexpected service errors', async () => {
      // Arrange
      const taskId = 'task-1';
      mockTaskService.getById.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService)
      ).rejects.toThrow();
    });

    it('handles task already deleted scenario', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockRejectedValue(
        new Error('TASK_NOT_FOUND')
      );

      // Act & Assert
      await expect(
        deleteTask(taskId, mockTaskService)
      ).rejects.toThrow('Task was already deleted');
    });
  });

  describe('Soft Delete', () => {
    it('marks task as deleted instead of hard delete', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        deleted_at: null,
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue({
        ...existingTask,
        deleted_at: new Date('2025-01-22T00:00:00Z'),
      } as any);

      // Act
      await deleteTask(taskId, mockTaskService, { softDelete: true });

      // Assert
      expect(mockTaskService.update).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({
          deleted_at: expect.any(Date),
        })
      );
      expect(mockTaskService.delete).not.toHaveBeenCalled();
    });

    it('hard deletes when softDelete is false', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.delete.mockResolvedValue(undefined);

      // Act
      await deleteTask(taskId, mockTaskService, { softDelete: false });

      // Assert
      expect(mockTaskService.delete).toHaveBeenCalledWith(taskId);
      expect(mockTaskService.update).not.toHaveBeenCalled();
    });
  });
});
