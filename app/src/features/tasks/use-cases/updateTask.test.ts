/**
 * updateTask Use Case Tests
 *
 * Tests business logic for updating tasks with partial data and custom fields validation.
 * Mocks TaskService and CustomFieldService.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTask } from './updateTask';
import type { TaskService } from '../services/task.service';
import type { CustomFieldService } from '../../custom-fields/services/custom-field.service';

// Mock service modules
vi.mock('../services/task.service');
vi.mock('../../custom-fields/services/custom-field.service');

describe('updateTask', () => {
  let mockTaskService: jest.Mocked<TaskService>;
  let mockCustomFieldService: jest.Mocked<CustomFieldService>;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockTaskService = {
      create: vi.fn(),
      getById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByColumnId: vi.fn(),
    } as any;

    mockCustomFieldService = {
      getByBoardId: vi.fn(),
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;
  });

  describe('Basic Update', () => {
    it('updates task with single field', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = {
        title: 'Updated Title',
      };

      const existingTask = {
        id: taskId,
        title: 'Original Title',
        board_column_id: 'col-1',
      };

      const updatedTask = {
        ...existingTask,
        ...updateData,
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue(updatedTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockTaskService.update).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining(updateData)
      );
      expect(mockTaskService.update).toHaveBeenCalledTimes(1);
    });

    it('updates task with multiple fields', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = {
        title: 'New Title',
        description: 'New description',
        priority: 'high' as const,
        due_date: '2025-12-31',
      };

      const existingTask = {
        id: taskId,
        title: 'Old Title',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue({ ...existingTask, ...updateData } as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.update).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining(updateData)
      );
    });

    it('allows partial update (all fields optional)', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = {}; // Empty update

      const existingTask = {
        id: taskId,
        title: 'Unchanged',
        board_column_id: 'col-1',
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue(existingTask as any);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result).toEqual(existingTask);
    });

    it('sanitizes input data before updating', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = {
        title: '  Trimmed  ', // Has whitespace
        description: '  Description  ',
      };

      const existingTask = { id: taskId, title: 'Old', board_column_id: 'col-1' };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.update).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({
          title: 'Trimmed', // Should be trimmed
          description: 'Description',
        })
      );
    });
  });

  describe('Custom Fields Update', () => {
    it('updates custom field values', async () => {
      // Arrange
      const taskId = 'task-1';
      const boardFieldDefs = [
        {
          id: 'field-1',
          field_name: 'Story Points',
          field_type: 'number' as const,
          config: { min: 0, max: 100 },
          required: false,
        },
      ];

      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        custom_fields_values: { 'field-1': 30 },
      };

      const updateData = {
        custom_fields_values: { 'field-1': 50 }, // Update value
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);
      mockTaskService.update.mockResolvedValue({
        ...existingTask,
        ...updateData,
      } as any);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.custom_fields_values).toEqual({ 'field-1': 50 });
    });

    it('validates updated custom field values', async () => {
      // Arrange
      const taskId = 'task-1';
      const boardFieldDefs = [
        {
          id: 'field-1',
          field_name: 'Story Points',
          field_type: 'number' as const,
          config: { min: 0, max: 100 },
          required: false,
        },
      ];

      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        custom_fields_values: { 'field-1': 30 },
      };

      const invalidUpdateData = {
        custom_fields_values: { 'field-1': 150 }, // Invalid: > max
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      // Act & Assert
      await expect(
        updateTask(taskId, invalidUpdateData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('merges custom field values (partial update)', async () => {
      // Arrange
      const taskId = 'task-1';
      const boardFieldDefs = [
        {
          id: 'field-1',
          field_name: 'Story Points',
          field_type: 'number' as const,
          config: {},
          required: false,
        },
        {
          id: 'field-2',
          field_name: 'Sprint',
          field_type: 'text' as const,
          config: {},
          required: false,
        },
      ];

      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-1': 30,
          'field-2': 'Sprint 23',
        },
      };

      const updateData = {
        custom_fields_values: { 'field-1': 50 }, // Only update field-1
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);
      mockTaskService.update.mockResolvedValue({
        ...existingTask,
        custom_fields_values: {
          'field-1': 50, // Updated
          'field-2': 'Sprint 23', // Preserved
        },
      } as any);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.custom_fields_values).toEqual({
        'field-1': 50,
        'field-2': 'Sprint 23', // Not overwritten
      });
    });

    it('removes custom field value when set to null', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        custom_fields_values: { 'field-1': 30 },
      };

      const updateData = {
        custom_fields_values: { 'field-1': null }, // Remove value
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.update.mockResolvedValue({
        ...existingTask,
        custom_fields_values: {},
      } as any);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.custom_fields_values).toEqual({});
    });
  });

  describe('Assignment Update', () => {
    it('updates assigned_to user', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        assigned_to: 'user-1',
      };

      const updateData = {
        assigned_to: 'user-2', // Reassign
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue({ ...existingTask, ...updateData } as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.assigned_to).toBe('user-2');
    });

    it('unassigns task when assigned_to is null', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Task',
        board_column_id: 'col-1',
        assigned_to: 'user-1',
      };

      const updateData = {
        assigned_to: null, // Unassign
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue({ ...existingTask, assigned_to: null } as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.assigned_to).toBeNull();
    });
  });

  describe('Validation', () => {
    it('throws error when task does not exist', async () => {
      // Arrange
      const taskId = 'non-existent';
      const updateData = { title: 'New Title' };

      mockTaskService.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateTask(taskId, updateData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('TASK_NOT_FOUND');
    });

    it('throws error when title is empty', async () => {
      // Arrange
      const taskId = 'task-1';
      const invalidData = { title: '' }; // Invalid

      const existingTask = { id: taskId, title: 'Old', board_column_id: 'col-1' };
      mockTaskService.getById.mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(
        updateTask(taskId, invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('Validation failed');
    });

    it('throws error when title exceeds max length', async () => {
      // Arrange
      const taskId = 'task-1';
      const invalidData = { title: 'a'.repeat(256) }; // Exceeds max

      const existingTask = { id: taskId, title: 'Old', board_column_id: 'col-1' };
      mockTaskService.getById.mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(
        updateTask(taskId, invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('title must be at most 255 characters');
    });

    it('throws error when priority is invalid', async () => {
      // Arrange
      const taskId = 'task-1';
      const invalidData = { priority: 'invalid' as any };

      const existingTask = { id: taskId, title: 'Task', board_column_id: 'col-1' };
      mockTaskService.getById.mockResolvedValue(existingTask as any);

      // Act & Assert
      await expect(
        updateTask(taskId, invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow();
    });
  });

  describe('Authorization', () => {
    it('allows update when user belongs to task organization', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = { title: 'New Title' };
      const existingTask = {
        id: taskId,
        title: 'Old Title',
        board_column_id: 'col-1',
        organization_id: 'org-1',
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockTaskService.update.mockResolvedValue({ ...existingTask, ...updateData } as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService, authContext);

      // Assert
      expect(result.title).toBe('New Title');
    });

    it('throws UNAUTHORIZED when user does not belong to task organization', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = { title: 'New Title' };
      const existingTask = {
        id: taskId,
        title: 'Old Title',
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
        updateTask(taskId, updateData, mockTaskService, mockCustomFieldService, authContext)
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = { title: 'New Title' };

      const existingTask = { id: taskId, title: 'Old', board_column_id: 'col-1' };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.update.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        updateTask(taskId, updateData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('Failed to update task');
    });

    it('handles unexpected service errors', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = { title: 'New Title' };

      mockTaskService.getById.mockRejectedValue(new Error('Unexpected error'));

      // Act & Assert
      await expect(
        updateTask(taskId, updateData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles unicode characters in updated title', async () => {
      // Arrange
      const taskId = 'task-1';
      const updateData = { title: '你好世界 🌍' };

      const existingTask = { id: taskId, title: 'Old', board_column_id: 'col-1' };

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.update.mockResolvedValue({ ...existingTask, ...updateData } as any);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.title).toBe('你好世界 🌍');
    });

    it('preserves unchanged fields', async () => {
      // Arrange
      const taskId = 'task-1';
      const existingTask = {
        id: taskId,
        title: 'Original',
        description: 'Original description',
        priority: 'medium' as const,
        board_column_id: 'col-1',
      };

      const updateData = { title: 'Updated' }; // Only title changed

      mockTaskService.getById.mockResolvedValue(existingTask as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.update.mockResolvedValue({
        ...existingTask,
        title: 'Updated',
      } as any);

      // Act
      const result = await updateTask(taskId, updateData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.description).toBe('Original description'); // Preserved
      expect(result.priority).toBe('medium'); // Preserved
    });
  });
});
