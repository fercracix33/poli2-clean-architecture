/**
 * Task Service Tests
 *
 * Tests pure data access layer for Tasks (CRUD + JSONB queries).
 * Mocks Supabase client.
 *
 * CRITICAL TESTS:
 * - JSONB @> operator for custom field filtering
 * - snake_case ↔ camelCase transformations
 * - Batch updates for position recalculation
 *
 * IMPORTANT: Services should be PURE - no business logic, only data access.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from './task.service';
import type { SupabaseClient } from '@supabase/supabase-js';

// Create comprehensive Supabase mock
const createSupabaseMock = () => {
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const eqMock = vi.fn();
  const filterMock = vi.fn();
  const orderMock = vi.fn();
  const rangeMock = vi.fn();
  const singleMock = vi.fn();
  const ilikeMock = vi.fn();
  const inMock = vi.fn();
  const gteMock = vi.fn();
  const lteMock = vi.fn();

  const queryBuilder = {
    select: selectMock.mockReturnThis(),
    insert: insertMock.mockReturnThis(),
    update: updateMock.mockReturnThis(),
    delete: deleteMock.mockReturnThis(),
    eq: eqMock.mockReturnThis(),
    filter: filterMock.mockReturnThis(),
    order: orderMock.mockReturnThis(),
    range: rangeMock.mockReturnThis(),
    single: singleMock.mockReturnThis(),
    ilike: ilikeMock.mockReturnThis(),
    in: inMock.mockReturnThis(),
    gte: gteMock.mockReturnThis(),
    lte: lteMock.mockReturnThis(),
  };

  const supabase = {
    from: vi.fn(() => queryBuilder),
    auth: {
      getUser: vi.fn(),
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    mocks: {
      selectMock,
      insertMock,
      updateMock,
      deleteMock,
      eqMock,
      filterMock,
      orderMock,
      rangeMock,
      singleMock,
      ilikeMock,
      inMock,
      gteMock,
      lteMock,
    },
  };
};

describe('TaskService', () => {
  let service: TaskService;
  let supabase: SupabaseClient;
  let mocks: ReturnType<typeof createSupabaseMock>['mocks'];

  beforeEach(() => {
    const mockSetup = createSupabaseMock();
    supabase = mockSetup.supabase;
    mocks = mockSetup.mocks;
    service = new TaskService(supabase);
  });

  describe('create', () => {
    it('inserts new task into database', async () => {
      // Arrange
      const createData = {
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Implement drag & drop',
        description: 'Use dnd-kit library',
        assigned_to: 'user-789',
        priority: 'high' as const,
        due_date: new Date('2025-02-01'),
        position: 0,
        created_by: 'user-789',
      };

      const dbResponse = {
        id: 'task-001',
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Implement drag & drop',
        description: 'Use dnd-kit library',
        assigned_to: 'user-789',
        priority: 'high',
        due_date: '2025-02-01T00:00:00.000Z',
        position: 0,
        custom_fields_values: null,
        created_by: 'user-789',
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.create(createData);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.insertMock).toHaveBeenCalledWith([createData]);
      expect(mocks.singleMock).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: 'task-001',
        board_column_id: 'col-123',
        title: 'Implement drag & drop',
      }));
    });

    it('transforms snake_case from DB to camelCase in response', async () => {
      // Arrange
      const createData = {
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Task',
        position: 0,
        created_by: 'user-789',
      };

      const dbResponse = {
        id: 'task-001',
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Task',
        position: 0,
        custom_fields_values: null,
        created_by: 'user-789',
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.create(createData);

      // Assert - Should have camelCase fields
      expect(result).toHaveProperty('boardColumnId', 'col-123');
      expect(result).toHaveProperty('organizationId', 'org-456');
      expect(result).toHaveProperty('customFieldsValues', null);
      expect(result).toHaveProperty('createdBy', 'user-789');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('throws error when database insert fails', async () => {
      // Arrange
      const createData = {
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Task',
        position: 0,
        created_by: 'user-789',
      };

      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Foreign key constraint violation',
          code: '23503',
        },
      });

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow('Foreign key constraint violation');
    });

    it('handles custom_fields_values in creation', async () => {
      // Arrange
      const createData = {
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Task with custom fields',
        position: 0,
        created_by: 'user-789',
        custom_fields_values: {
          'field-sprint': 'Sprint 24',
          'field-points': 8,
        },
      };

      const dbResponse = {
        id: 'task-001',
        ...createData,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.create(createData);

      // Assert
      expect(result.customFieldsValues).toEqual({
        'field-sprint': 'Sprint 24',
        'field-points': 8,
      });
    });
  });

  describe('getById', () => {
    it('retrieves task by id', async () => {
      // Arrange
      const taskId = 'task-001';
      const dbResponse = {
        id: taskId,
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Test Task',
        description: 'Test description',
        assigned_to: 'user-789',
        priority: 'high',
        due_date: '2025-02-01T00:00:00.000Z',
        position: 0,
        custom_fields_values: { 'field-1': 'value-1' },
        created_by: 'user-789',
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.getById(taskId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.selectMock).toHaveBeenCalled();
      expect(mocks.eqMock).toHaveBeenCalledWith('id', taskId);
      expect(mocks.singleMock).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: taskId,
        title: 'Test Task',
      }));
    });

    it('returns null when task not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found error code
      });

      // Act
      const result = await service.getById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('throws error for database errors', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Connection timeout',
          code: 'CONNECTION_ERROR',
        },
      });

      // Act & Assert
      await expect(service.getById('any-id')).rejects.toThrow('Connection timeout');
    });
  });

  describe('list', () => {
    it('retrieves paginated list of tasks', async () => {
      // Arrange
      const dbTasks = [
        {
          id: 'task-001',
          board_column_id: 'col-123',
          organization_id: 'org-456',
          title: 'First Task',
          position: 0,
          created_by: 'user-789',
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'task-002',
          board_column_id: 'col-123',
          organization_id: 'org-456',
          title: 'Second Task',
          position: 1,
          created_by: 'user-789',
          created_at: '2025-01-22T01:00:00.000Z',
          updated_at: '2025-01-22T01:00:00.000Z',
        },
      ];

      mocks.selectMock.mockResolvedValue({
        data: dbTasks,
        error: null,
        count: 2,
      });

      // Act
      const result = await service.list({
        board_id: 'board-1',
      });

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.selectMock).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 'task-001',
        title: 'First Task',
      }));
    });

    it('applies sorting by position ascending (default)', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        column_id: 'col-1',
      });

      // Assert
      expect(mocks.orderMock).toHaveBeenCalledWith('position', {
        ascending: true,
      });
    });

    it('applies pagination with limit and offset', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        limit: 10,
        offset: 20,
      });

      // Assert
      expect(mocks.rangeMock).toHaveBeenCalledWith(20, 29); // offset to offset+limit-1
    });

    it('filters by board_id', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
      });

      // Assert
      expect(mocks.eqMock).toHaveBeenCalledWith('board_id', 'board-1');
    });

    it('filters by column_id', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        column_id: 'col-1',
      });

      // Assert
      expect(mocks.eqMock).toHaveBeenCalledWith('board_column_id', 'col-1');
    });

    it('searches tasks by title (case-insensitive)', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        search: 'login',
      });

      // Assert
      expect(mocks.ilikeMock).toHaveBeenCalledWith('title', '%login%');
    });

    it('filters by assigned_to', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        assigned_to: 'user-1',
      });

      // Assert
      expect(mocks.eqMock).toHaveBeenCalledWith('assigned_to', 'user-1');
    });

    it('filters by priority', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        priority: 'high',
      });

      // Assert
      expect(mocks.eqMock).toHaveBeenCalledWith('priority', 'high');
    });

    it('filters by multiple assignees (OR logic)', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        assigned_to: ['user-1', 'user-2', 'user-3'],
      });

      // Assert
      expect(mocks.inMock).toHaveBeenCalledWith('assigned_to', ['user-1', 'user-2', 'user-3']);
    });

    it('filters by date range (due_date)', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Act
      await service.list({
        board_id: 'board-1',
        date_range: {
          start: startDate,
          end: endDate,
        },
      });

      // Assert
      expect(mocks.gteMock).toHaveBeenCalledWith('due_date', startDate.toISOString());
      expect(mocks.lteMock).toHaveBeenCalledWith('due_date', endDate.toISOString());
    });
  });

  describe('JSONB Queries (CRITICAL)', () => {
    it('filters tasks by custom field value using JSONB @> contains operator', async () => {
      // Arrange
      const customFieldId = 'field-sprint';
      const value = 'Sprint 24';

      const dbResponse = [
        {
          id: 'task-001',
          board_column_id: 'col-123',
          organization_id: 'org-456',
          title: 'Task 1',
          position: 0,
          custom_fields_values: { [customFieldId]: value },
          created_by: 'user-789',
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
      ];

      mocks.selectMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.getByCustomFieldValue(
        'board-1',
        customFieldId,
        value
      );

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.filterMock).toHaveBeenCalledWith(
        'custom_fields_values',
        '@>',
        JSON.stringify({ [customFieldId]: value })
      );
      expect(result).toHaveLength(1);
      expect(result[0].customFieldsValues).toEqual({ [customFieldId]: value });
    });

    it('filters tasks by multiple custom field values', async () => {
      // Arrange
      const filters = {
        'field-sprint': 'Sprint 24',
        'field-points': 8,
      };

      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.list({
        board_id: 'board-1',
        custom_field_filters: filters,
      });

      // Assert
      // Each filter should call filterMock with @> operator
      expect(mocks.filterMock).toHaveBeenCalledTimes(2);
      expect(mocks.filterMock).toHaveBeenCalledWith(
        'custom_fields_values',
        '@>',
        JSON.stringify({ 'field-sprint': 'Sprint 24' })
      );
      expect(mocks.filterMock).toHaveBeenCalledWith(
        'custom_fields_values',
        '@>',
        JSON.stringify({ 'field-points': 8 })
      );
    });

    it('handles null custom_fields_values gracefully', async () => {
      // Arrange
      const dbTasks = [
        {
          id: 'task-001',
          title: 'Task without custom fields',
          custom_fields_values: null,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'task-002',
          title: 'Task with empty custom fields',
          custom_fields_values: {},
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'task-003',
          title: 'Task with custom fields',
          custom_fields_values: { 'field-1': 'value' },
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
      ];

      mocks.selectMock.mockResolvedValue({
        data: dbTasks,
        error: null,
      });

      // Act
      const result = await service.list({ board_id: 'board-1' });

      // Assert - Should not throw, should handle null values
      expect(result).toHaveLength(3);
      expect(result[0].customFieldsValues).toBeNull();
      expect(result[1].customFieldsValues).toEqual({});
      expect(result[2].customFieldsValues).toEqual({ 'field-1': 'value' });
    });

    it('filters by custom field with number value', async () => {
      // Arrange
      const fieldId = 'field-points';
      const value = 8;

      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.getByCustomFieldValue('board-1', fieldId, value);

      // Assert
      expect(mocks.filterMock).toHaveBeenCalledWith(
        'custom_fields_values',
        '@>',
        JSON.stringify({ [fieldId]: value })
      );
    });

    it('filters by custom field with boolean value', async () => {
      // Arrange
      const fieldId = 'field-checkbox';
      const value = true;

      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.getByCustomFieldValue('board-1', fieldId, value);

      // Assert
      expect(mocks.filterMock).toHaveBeenCalledWith(
        'custom_fields_values',
        '@>',
        JSON.stringify({ [fieldId]: value })
      );
    });
  });

  describe('update', () => {
    it('updates task fields', async () => {
      // Arrange
      const taskId = 'task-001';
      const updates = {
        title: 'Updated Title',
        priority: 'urgent' as const,
      };

      const dbResponse = {
        id: taskId,
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Updated Title',
        priority: 'urgent',
        position: 0,
        created_by: 'user-789',
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T01:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.update(taskId, updates);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.updateMock).toHaveBeenCalledWith(updates);
      expect(mocks.eqMock).toHaveBeenCalledWith('id', taskId);
      expect(result).toEqual(expect.objectContaining({
        id: taskId,
        title: 'Updated Title',
        priority: 'urgent',
      }));
    });

    it('updates custom_fields_values', async () => {
      // Arrange
      const taskId = 'task-001';
      const updates = {
        custom_fields_values: {
          'field-sprint': 'Sprint 25',
          'field-points': 13,
        },
      };

      const dbResponse = {
        id: taskId,
        title: 'Task',
        custom_fields_values: updates.custom_fields_values,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T01:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.update(taskId, updates);

      // Assert
      expect(result?.customFieldsValues).toEqual({
        'field-sprint': 'Sprint 25',
        'field-points': 13,
      });
    });

    it('returns null when task not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Act
      const result = await service.update('nonexistent-id', { title: 'Test' });

      // Assert
      expect(result).toBeNull();
    });

    it('throws error when update fails', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Database error',
          code: 'DB_ERROR',
        },
      });

      // Act & Assert
      await expect(
        service.update('task-001', { title: 'Test' })
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('soft deletes task by setting deleted_at timestamp', async () => {
      // Arrange
      const taskId = 'task-001';

      mocks.singleMock.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      await service.delete(taskId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.updateMock).toHaveBeenCalledWith({
        deleted_at: expect.any(String), // ISO timestamp
      });
      expect(mocks.eqMock).toHaveBeenCalledWith('id', taskId);
    });

    it('throws error when task not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Act & Assert
      await expect(service.delete('nonexistent-id')).rejects.toThrow('Task not found');
    });

    it('throws error when delete fails', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Permission denied',
          code: 'PERMISSION_ERROR',
        },
      });

      // Act & Assert
      await expect(service.delete('task-001')).rejects.toThrow('Permission denied');
    });
  });

  describe('Batch Operations', () => {
    it('batch updates multiple tasks for position recalculation', async () => {
      // Arrange
      const updates = [
        { id: 'task-001', position: 0 },
        { id: 'task-002', position: 1 },
        { id: 'task-003', position: 2 },
      ];

      mocks.updateMock.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      await service.batchUpdate(updates);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mocks.updateMock).toHaveBeenCalledTimes(3);
      updates.forEach((update, index) => {
        expect(mocks.eqMock).toHaveBeenNthCalledWith(
          index + 1,
          'id',
          update.id
        );
      });
    });

    it('handles batch update failures gracefully', async () => {
      // Arrange
      const updates = [
        { id: 'task-001', position: 0 },
        { id: 'task-002', position: 1 },
      ];

      mocks.updateMock
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Update failed', code: 'ERROR' },
        });

      // Act & Assert
      await expect(service.batchUpdate(updates)).rejects.toThrow('Batch update failed');
    });

    it('skips empty batch updates', async () => {
      // Act
      await service.batchUpdate([]);

      // Assert
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('throws error when database connection fails', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Connection timeout',
          code: 'CONNECTION_ERROR',
        },
      });

      // Act & Assert
      await expect(
        service.list({ board_id: 'board-1' })
      ).rejects.toThrow('Connection timeout');
    });

    it('handles foreign key constraint violations', async () => {
      // Arrange
      const createData = {
        board_column_id: 'nonexistent-column',
        organization_id: 'org-456',
        title: 'Task',
        position: 0,
        created_by: 'user-789',
      };

      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Foreign key constraint violation',
          code: '23503',
        },
      });

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });
});
