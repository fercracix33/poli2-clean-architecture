/**
 * listTasks Use Case Tests
 *
 * Tests business logic for listing tasks with filters, search, and pagination.
 * Mocks TaskService.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTasks } from './listTasks';
import type { TaskService } from '../services/task.service';

// Mock service module
vi.mock('../services/task.service');

describe('listTasks', () => {
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

  describe('Basic Listing', () => {
    it('lists all tasks in a board', async () => {
      // Arrange
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', board_column_id: 'col-1', position: 0 },
        { id: 'task-2', title: 'Task 2', board_column_id: 'col-2', position: 0 },
      ];

      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      const result = await listTasks({ board_id: 'board-1' }, mockTaskService);

      // Assert
      expect(result).toEqual(mockTasks);
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ board_id: 'board-1' })
      );
      expect(mockTaskService.list).toHaveBeenCalledTimes(1);
    });

    it('lists tasks in a specific column', async () => {
      // Arrange
      const mockTasks = [{ id: 'task-1', title: 'Task 1', board_column_id: 'col-1' }];

      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      const result = await listTasks({ board_column_id: 'col-1' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ board_column_id: 'col-1' })
      );
      expect(result).toEqual(mockTasks);
    });

    it('returns empty array when no tasks found', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      const result = await listTasks({ board_id: 'board-1' }, mockTaskService);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Search', () => {
    it('searches tasks by title', async () => {
      // Arrange
      const mockTasks = [{ id: 'task-1', title: 'Fix bug in login' }];

      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      await listTasks({ search: 'login' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'login' })
      );
    });

    it('searches tasks by description', async () => {
      // Arrange
      const mockTasks = [{ id: 'task-1', description: 'Authentication issue' }];

      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      await listTasks({ search: 'authentication' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'authentication' })
      );
    });

    it('handles empty search query', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ search: '' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: '' })
      );
    });

    it('sanitizes search query before searching', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ search: '  login  ' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'login' }) // Trimmed
      );
    });
  });

  describe('Filters', () => {
    it('filters by assigned user', async () => {
      // Arrange
      const mockTasks = [{ id: 'task-1', assigned_to: 'user-1' }];
      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      await listTasks({ assigned_to: 'user-1' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ assigned_to: 'user-1' })
      );
    });

    it('filters by priority', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ priority: 'high' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'high' })
      );
    });

    it('filters by single tag', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ tags: ['frontend'] }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['frontend'] })
      );
    });

    it('filters by multiple tags', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ tags: ['frontend', 'bug'] }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['frontend', 'bug'] })
      );
    });

    it('filters by due date range', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        {
          due_date_from: '2025-01-01',
          due_date_to: '2025-12-31',
        },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          due_date_from: '2025-01-01',
          due_date_to: '2025-12-31',
        })
      );
    });

    it('filters by custom field values', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        {
          custom_field_filters: {
            'field-1': 'Sprint 24',
            'field-2': 50,
          },
        },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          custom_field_filters: {
            'field-1': 'Sprint 24',
            'field-2': 50,
          },
        })
      );
    });

    it('combines multiple filters', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        {
          board_id: 'board-1',
          assigned_to: 'user-1',
          priority: 'high',
          tags: ['urgent'],
        },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          board_id: 'board-1',
          assigned_to: 'user-1',
          priority: 'high',
          tags: ['urgent'],
        })
      );
    });

    it('filters unassigned tasks', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ unassigned: true }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ unassigned: true })
      );
    });

    it('filters overdue tasks', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ overdue: true }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ overdue: true })
      );
    });
  });

  describe('Sorting', () => {
    it('sorts by position ascending (default)', async () => {
      // Arrange
      const mockTasks = [
        { id: 'task-1', position: 0 },
        { id: 'task-2', position: 1 },
        { id: 'task-3', position: 2 },
      ];

      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      await listTasks({ board_id: 'board-1' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'position',
          sort_order: 'asc',
        })
      );
    });

    it('sorts by due_date descending', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        { board_id: 'board-1', sort_by: 'due_date', sort_order: 'desc' },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'due_date',
          sort_order: 'desc',
        })
      );
    });

    it('sorts by created_at ascending', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        { board_id: 'board-1', sort_by: 'created_at', sort_order: 'asc' },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'created_at',
          sort_order: 'asc',
        })
      );
    });

    it('sorts by updated_at descending', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        { board_id: 'board-1', sort_by: 'updated_at', sort_order: 'desc' },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'updated_at',
          sort_order: 'desc',
        })
      );
    });

    it('sorts by priority', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks(
        { board_id: 'board-1', sort_by: 'priority' },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'priority',
        })
      );
    });
  });

  describe('Pagination', () => {
    it('supports pagination with limit and offset', async () => {
      // Arrange
      const mockTasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
      }));

      mockTaskService.list.mockResolvedValue(mockTasks as any);

      // Act
      await listTasks(
        { board_id: 'board-1', limit: 10, offset: 20 },
        mockTaskService
      );

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 20 })
      );
    });

    it('uses default limit when not specified', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ board_id: 'board-1' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 }) // Default limit
      );
    });

    it('uses default offset when not specified', async () => {
      // Arrange
      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ board_id: 'board-1' }, mockTaskService);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0 }) // Default offset
      );
    });

    it('validates limit does not exceed maximum', async () => {
      // Arrange
      const invalidParams = {
        board_id: 'board-1',
        limit: 150, // Max is 100
      };

      // Act & Assert
      await expect(
        listTasks(invalidParams, mockTaskService)
      ).rejects.toThrow('limit must not exceed 100');
    });
  });

  describe('Authorization', () => {
    it('filters tasks by user organization', async () => {
      // Arrange
      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockTaskService.list.mockResolvedValue([]);

      // Act
      await listTasks({ board_id: 'board-1' }, mockTaskService, authContext);

      // Assert
      expect(mockTaskService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: 'org-1', // Automatically filtered
        })
      );
    });
  });

  describe('Validation', () => {
    it('throws error when both board_id and board_column_id are missing', async () => {
      // Arrange
      const invalidParams = {};

      // Act & Assert
      await expect(
        listTasks(invalidParams, mockTaskService)
      ).rejects.toThrow('Either board_id or board_column_id is required');
    });

    it('throws error when sort_by is invalid', async () => {
      // Arrange
      const invalidParams = {
        board_id: 'board-1',
        sort_by: 'invalid_field' as any,
      };

      // Act & Assert
      await expect(
        listTasks(invalidParams, mockTaskService)
      ).rejects.toThrow();
    });

    it('throws error when sort_order is invalid', async () => {
      // Arrange
      const invalidParams = {
        board_id: 'board-1',
        sort_order: 'invalid_order' as any,
      };

      // Act & Assert
      await expect(
        listTasks(invalidParams, mockTaskService)
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      mockTaskService.list.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        listTasks({ board_id: 'board-1' }, mockTaskService)
      ).rejects.toThrow('Failed to list tasks');
    });

    it('handles unexpected service errors', async () => {
      // Arrange
      mockTaskService.list.mockRejectedValue(new Error('Unexpected error'));

      // Act & Assert
      await expect(
        listTasks({ board_id: 'board-1' }, mockTaskService)
      ).rejects.toThrow();
    });
  });
});
