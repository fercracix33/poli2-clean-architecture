/**
 * getTask Use Case Tests
 *
 * Tests business logic for retrieving a single task.
 * Mocks TaskService.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTask } from './getTask';
import type { TaskService } from '../services/task.service';

// Mock service module
vi.mock('../services/task.service');

describe('getTask', () => {
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
    it('retrieves task by id', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440000';
      const expectedTask = {
        id: taskId,
        title: 'Test Task',
        board_column_id: 'col-1',
        description: 'Task description',
        assigned_to: 'user-1',
        priority: 'high' as const,
        custom_fields_values: {},
        position: 0,
        created_at: new Date('2025-01-22T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.getById.mockResolvedValue(expectedTask);

      // Act
      const result = await getTask(taskId, mockTaskService);

      // Assert
      expect(result).toEqual(expectedTask);
      expect(mockTaskService.getById).toHaveBeenCalledWith(taskId);
      expect(mockTaskService.getById).toHaveBeenCalledTimes(1);
    });

    it('retrieves task with custom fields values', async () => {
      // Arrange
      const taskId = 'task-1';
      const expectedTask = {
        id: taskId,
        title: 'Task with custom fields',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-1': 50,
          'field-2': 'Sprint 24',
          'field-3': true,
        },
        position: 0,
        created_at: new Date('2025-01-22T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.getById.mockResolvedValue(expectedTask);

      // Act
      const result = await getTask(taskId, mockTaskService);

      // Assert
      expect(result).toEqual(expectedTask);
      expect(result.custom_fields_values).toEqual({
        'field-1': 50,
        'field-2': 'Sprint 24',
        'field-3': true,
      });
    });
  });

  describe('Validation', () => {
    it('throws error when task id is empty', async () => {
      // Arrange
      const invalidId = '';

      // Act & Assert
      await expect(
        getTask(invalidId, mockTaskService)
      ).rejects.toThrow('Task ID is required');
    });

    it('throws error when task id is not a valid UUID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act & Assert
      await expect(
        getTask(invalidId, mockTaskService)
      ).rejects.toThrow('Invalid UUID');
    });
  });

  describe('Not Found', () => {
    it('returns null when task does not exist', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440000';
      mockTaskService.getById.mockResolvedValue(null);

      // Act
      const result = await getTask(taskId, mockTaskService);

      // Assert
      expect(result).toBeNull();
      expect(mockTaskService.getById).toHaveBeenCalledWith(taskId);
    });

    it('throws NOT_FOUND error when task does not exist', async () => {
      // Arrange
      const taskId = '550e8400-e29b-41d4-a716-446655440000';
      mockTaskService.getById.mockResolvedValue(null);

      // Act & Assert (alternative approach - throw instead of return null)
      await expect(
        getTask(taskId, mockTaskService, { throwOnNotFound: true })
      ).rejects.toThrow('TASK_NOT_FOUND');
    });
  });

  describe('Authorization', () => {
    it('allows access when user belongs to task organization', async () => {
      // Arrange
      const taskId = 'task-1';
      const task = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-1',
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockTaskService.getById.mockResolvedValue(task as any);

      // Act
      const result = await getTask(taskId, mockTaskService, { authContext });

      // Assert
      expect(result).toEqual(task);
    });

    it('throws UNAUTHORIZED when user does not belong to task organization', async () => {
      // Arrange
      const taskId = 'task-1';
      const task = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        organization_id: 'org-2', // Different org
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'], // User not in org-2
      };

      mockTaskService.getById.mockResolvedValue(task as any);

      // Act & Assert
      await expect(
        getTask(taskId, mockTaskService, { authContext })
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const taskId = 'task-1';
      mockTaskService.getById.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        getTask(taskId, mockTaskService)
      ).rejects.toThrow('Failed to retrieve task');
    });

    it('handles unexpected service errors', async () => {
      // Arrange
      const taskId = 'task-1';
      mockTaskService.getById.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act & Assert
      await expect(
        getTask(taskId, mockTaskService)
      ).rejects.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('returns task with null description when not set', async () => {
      // Arrange
      const taskId = 'task-1';
      const task = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        description: null, // Explicitly null
        custom_fields_values: {},
        position: 0,
        created_at: new Date('2025-01-22T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.getById.mockResolvedValue(task);

      // Act
      const result = await getTask(taskId, mockTaskService);

      // Assert
      expect(result?.description).toBeNull();
    });

    it('returns task with empty custom_fields_values when none set', async () => {
      // Arrange
      const taskId = 'task-1';
      const task = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        custom_fields_values: {}, // Empty object
        position: 0,
        created_at: new Date('2025-01-22T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.getById.mockResolvedValue(task);

      // Act
      const result = await getTask(taskId, mockTaskService);

      // Assert
      expect(result?.custom_fields_values).toEqual({});
    });

    it('preserves all task fields without modification', async () => {
      // Arrange
      const taskId = 'task-1';
      const task = {
        id: taskId,
        title: 'Original Title',
        board_column_id: 'col-1',
        description: 'Original description',
        assigned_to: 'user-1',
        priority: 'low' as const,
        due_date: '2025-12-31',
        tags: ['tag1', 'tag2'],
        custom_fields_values: { 'field-1': 'value1' },
        position: 5,
        created_at: new Date('2025-01-01T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.getById.mockResolvedValue(task);

      // Act
      const result = await getTask(taskId, mockTaskService);

      // Assert
      expect(result).toEqual(task); // Exact match
    });
  });
});
