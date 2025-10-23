/**
 * createTask Use Case Tests
 *
 * Tests business logic for creating tasks with custom fields validation.
 * Mocks TaskService and CustomFieldService.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTask } from './createTask';
import type { TaskService } from '../services/task.service';
import type { CustomFieldService } from '../../custom-fields/services/custom-field.service';

// Mock service modules
vi.mock('../services/task.service');
vi.mock('../../custom-fields/services/custom-field.service');

describe('createTask', () => {
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

  describe('Basic Creation', () => {
    it('creates task with required fields only', async () => {
      // Arrange
      const taskData = {
        title: 'New Task',
        board_column_id: 'col-1',
      };

      const expectedTask = {
        id: 'task-1',
        ...taskData,
        description: null,
        assigned_to: null,
        priority: 'medium',
        custom_fields_values: {},
        position: 0,
        created_at: new Date('2025-01-22T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.create.mockResolvedValue(expectedTask);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result).toEqual(expectedTask);
      expect(mockTaskService.create).toHaveBeenCalledWith(
        expect.objectContaining(taskData)
      );
      expect(mockTaskService.create).toHaveBeenCalledTimes(1);
    });

    it('creates task with all optional fields', async () => {
      // Arrange
      const taskData = {
        title: 'Full Task',
        board_column_id: 'col-1',
        description: 'Task description',
        assigned_to: 'user-1',
        priority: 'high' as const,
        due_date: '2025-12-31',
        tags: ['frontend', 'urgent'],
      };

      const expectedTask = {
        id: 'task-1',
        ...taskData,
        custom_fields_values: {},
        position: 0,
        created_at: new Date('2025-01-22T00:00:00Z'),
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockTaskService.create.mockResolvedValue(expectedTask);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      const result = await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.create).toHaveBeenCalledWith(
        expect.objectContaining(taskData)
      );
      expect(result).toEqual(expectedTask);
    });

    it('sanitizes input data before creating', async () => {
      // Arrange
      const taskData = {
        title: '  Trimmed Task  ', // Has whitespace
        board_column_id: 'col-1',
        description: '  Description with spaces  ',
      };

      mockTaskService.create.mockResolvedValue({
        id: 'task-1',
        title: 'Trimmed Task',
        description: 'Description with spaces',
        board_column_id: 'col-1',
      } as any);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      // Act
      await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.create).toHaveBeenCalledWith({
        ...taskData,
        title: 'Trimmed Task', // Should be trimmed
        description: 'Description with spaces',
      });
    });
  });

  describe('Custom Fields Validation - CRITICAL', () => {
    it('validates custom field values against board field definitions', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-1',
          field_name: 'Story Points',
          field_type: 'number' as const,
          config: { min: 0, max: 100 },
          required: true,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Task with custom fields',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-1': 50, // Valid: within bounds
        },
      };

      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData } as any);

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).resolves.not.toThrow();
    });

    it('throws error when number field exceeds max', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-1',
          field_name: 'Story Points',
          field_type: 'number' as const,
          config: { min: 0, max: 100 },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Invalid task',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-1': 150, // Invalid: > max
        },
      };

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('throws error when number field below min', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-1',
          field_name: 'Story Points',
          field_type: 'number' as const,
          config: { min: 0, max: 100 },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Invalid task',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-1': -5, // Invalid: < min
        },
      };

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('throws error when select field has invalid option', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-2',
          field_name: 'Priority',
          field_type: 'select' as const,
          config: { options: ['P0', 'P1', 'P2'], multiple: false },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Invalid task',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-2': 'P99', // Invalid: not in options
        },
      };

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('validates multiple select field values', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-3',
          field_name: 'Labels',
          field_type: 'select' as const,
          config: { options: ['bug', 'feature', 'urgent'], multiple: true },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Task with multiple labels',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-3': ['bug', 'urgent'], // Valid
        },
      };

      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData } as any);

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).resolves.not.toThrow();
    });

    it('throws error when multiple select has invalid option', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-3',
          field_name: 'Labels',
          field_type: 'select' as const,
          config: { options: ['bug', 'feature', 'urgent'], multiple: true },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Invalid task',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-3': ['bug', 'invalid-option'], // Invalid
        },
      };

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('throws error when required field is missing', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-3',
          field_name: 'Sprint',
          field_type: 'text' as const,
          config: {},
          required: true, // Required!
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const taskData = {
        title: 'Task without required field',
        board_column_id: 'col-1',
        custom_fields_values: {}, // Missing field-3
      };

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('MISSING_REQUIRED_CUSTOM_FIELD');
    });

    it('validates date field against min date', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-4',
          field_name: 'Due Date',
          field_type: 'date' as const,
          config: {
            min_date: '2025-01-01',
            max_date: '2025-12-31',
          },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const invalidTaskData = {
        title: 'Task with invalid date',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-4': '2024-12-31', // Invalid: < min_date
        },
      };

      // Act & Assert
      await expect(
        createTask(invalidTaskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('validates date field against max date', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-4',
          field_name: 'Due Date',
          field_type: 'date' as const,
          config: {
            min_date: '2025-01-01',
            max_date: '2025-12-31',
          },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const invalidTaskData = {
        title: 'Task with invalid date',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-4': '2026-06-01', // Invalid: > max_date
        },
      };

      // Act & Assert
      await expect(
        createTask(invalidTaskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('validates text field max length', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-5',
          field_name: 'Description',
          field_type: 'text' as const,
          config: { max_length: 50 },
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const invalidTaskData = {
        title: 'Task with long text',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-5': 'x'.repeat(51), // Invalid: > max_length
        },
      };

      // Act & Assert
      await expect(
        createTask(invalidTaskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });

    it('validates checkbox field type', async () => {
      // Arrange
      const boardFieldDefs = [
        {
          id: 'field-6',
          field_name: 'Completed',
          field_type: 'checkbox' as const,
          config: {},
          required: false,
        },
      ];

      mockCustomFieldService.getByBoardId.mockResolvedValue(boardFieldDefs);

      const invalidTaskData = {
        title: 'Task with invalid checkbox',
        board_column_id: 'col-1',
        custom_fields_values: {
          'field-6': 'not-a-boolean', // Invalid: not boolean
        },
      };

      // Act & Assert
      await expect(
        createTask(invalidTaskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('INVALID_CUSTOM_FIELD_VALUE');
    });
  });

  describe('Position Assignment', () => {
    it('assigns position at end of column when not specified', async () => {
      // Arrange
      const existingTasks = [
        { id: 'task-1', position: 0 },
        { id: 'task-2', position: 1 },
        { id: 'task-3', position: 2 },
      ];

      mockTaskService.getByColumnId.mockResolvedValue(existingTasks);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      const taskData = {
        title: 'New task',
        board_column_id: 'col-1',
        // No position specified
      };

      const expectedTask = {
        ...taskData,
        position: 3, // Should be last
      };

      mockTaskService.create.mockResolvedValue({ id: 'task-4', ...expectedTask } as any);

      // Act
      await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.create).toHaveBeenCalledWith(
        expect.objectContaining({ position: 3 })
      );
    });

    it('assigns position 0 when column is empty', async () => {
      // Arrange
      mockTaskService.getByColumnId.mockResolvedValue([]);
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      const taskData = {
        title: 'First task',
        board_column_id: 'col-1',
      };

      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData, position: 0 } as any);

      // Act
      await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.create).toHaveBeenCalledWith(
        expect.objectContaining({ position: 0 })
      );
    });

    it('uses specified position when provided', async () => {
      // Arrange
      mockCustomFieldService.getByBoardId.mockResolvedValue([]);

      const taskData = {
        title: 'New task',
        board_column_id: 'col-1',
        position: 5,
      };

      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData } as any);

      // Act
      await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(mockTaskService.create).toHaveBeenCalledWith(
        expect.objectContaining({ position: 5 })
      );
    });
  });

  describe('Validation', () => {
    it('throws error when title is empty', async () => {
      // Arrange
      const invalidData = {
        title: '', // Invalid
        board_column_id: 'col-1',
      };

      // Act & Assert
      await expect(
        createTask(invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('Validation failed');
    });

    it('throws error when title exceeds max length', async () => {
      // Arrange
      const invalidData = {
        title: 'a'.repeat(256), // Assuming max 255
        board_column_id: 'col-1',
      };

      // Act & Assert
      await expect(
        createTask(invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('title must be at most 255 characters');
    });

    it('throws error when board_column_id is missing', async () => {
      // Arrange
      const invalidData = {
        title: 'Task without column',
        // Missing board_column_id
      } as any;

      // Act & Assert
      await expect(
        createTask(invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('board_column_id is required');
    });

    it('throws error when priority is invalid', async () => {
      // Arrange
      const invalidData = {
        title: 'Task',
        board_column_id: 'col-1',
        priority: 'super-mega-ultra-high' as any, // Invalid enum
      };

      // Act & Assert
      await expect(
        createTask(invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow();
    });

    it('throws error when due_date is invalid format', async () => {
      // Arrange
      const invalidData = {
        title: 'Task',
        board_column_id: 'col-1',
        due_date: 'not-a-date',
      };

      // Act & Assert
      await expect(
        createTask(invalidData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const taskData = {
        title: 'Test Task',
        board_column_id: 'col-1',
      };

      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow('Failed to create task');
    });

    it('handles unexpected service errors', async () => {
      // Arrange
      const taskData = {
        title: 'Test Task',
        board_column_id: 'col-1',
      };

      mockCustomFieldService.getByBoardId.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act & Assert
      await expect(
        createTask(taskData, mockTaskService, mockCustomFieldService)
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles unicode characters in title', async () => {
      // Arrange
      const taskData = {
        title: '你好世界 🌍',
        board_column_id: 'col-1',
      };

      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData } as any);

      // Act
      const result = await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.title).toBe('你好世界 🌍');
    });

    it('handles very long valid title', async () => {
      // Arrange
      const taskData = {
        title: 'x'.repeat(255), // At max length
        board_column_id: 'col-1',
      };

      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData } as any);

      // Act
      const result = await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.title).toHaveLength(255);
    });

    it('handles empty tags array', async () => {
      // Arrange
      const taskData = {
        title: 'Task',
        board_column_id: 'col-1',
        tags: [],
      };

      mockCustomFieldService.getByBoardId.mockResolvedValue([]);
      mockTaskService.create.mockResolvedValue({ id: 'task-1', ...taskData } as any);

      // Act
      const result = await createTask(taskData, mockTaskService, mockCustomFieldService);

      // Assert
      expect(result.tags).toEqual([]);
    });
  });
});
