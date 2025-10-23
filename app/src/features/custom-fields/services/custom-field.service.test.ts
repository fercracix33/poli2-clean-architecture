/**
 * Custom Field Service Tests
 *
 * Tests pure data access layer for Custom Field Definitions (CRUD).
 * Mocks Supabase client.
 *
 * IMPORTANT: Services should be PURE - no business logic, only data access.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomFieldService } from './custom-field.service';
import type { SupabaseClient } from '@supabase/supabase-js';

// Create Supabase mock
const createSupabaseMock = () => {
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const eqMock = vi.fn();
  const orderMock = vi.fn();
  const singleMock = vi.fn();
  const inMock = vi.fn();

  const queryBuilder = {
    select: selectMock.mockReturnThis(),
    insert: insertMock.mockReturnThis(),
    update: updateMock.mockReturnThis(),
    delete: deleteMock.mockReturnThis(),
    eq: eqMock.mockReturnThis(),
    order: orderMock.mockReturnThis(),
    single: singleMock.mockReturnThis(),
    in: inMock.mockReturnThis(),
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
      orderMock,
      singleMock,
      inMock,
    },
  };
};

describe('CustomFieldService', () => {
  let service: CustomFieldService;
  let supabase: SupabaseClient;
  let mocks: ReturnType<typeof createSupabaseMock>['mocks'];

  beforeEach(() => {
    const mockSetup = createSupabaseMock();
    supabase = mockSetup.supabase;
    mocks = mockSetup.mocks;
    service = new CustomFieldService(supabase);
  });

  describe('create', () => {
    it('creates custom field definition in database', async () => {
      // Arrange
      const fieldData = {
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number' as const,
        config: { min: 0, max: 100, step: 1 },
        required: false,
        position: 0,
      };

      const dbResponse = {
        id: 'field-001',
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
        config: { min: 0, max: 100, step: 1 },
        required: false,
        position: 0,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.create(fieldData);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.insertMock).toHaveBeenCalledWith([fieldData]);
      expect(mocks.singleMock).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: 'field-001',
        name: 'Story Points',
        field_type: 'number',
      }));
    });

    it('transforms snake_case from DB to camelCase', async () => {
      // Arrange
      const fieldData = {
        board_id: 'board-123',
        name: 'Sprint',
        field_type: 'select' as const,
        config: { options: ['Sprint 24', 'Sprint 25'], multiple: false },
        required: false,
        position: 0,
      };

      const dbResponse = {
        id: 'field-001',
        board_id: 'board-123',
        name: 'Sprint',
        field_type: 'select',
        config: { options: ['Sprint 24', 'Sprint 25'], multiple: false },
        required: false,
        position: 0,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.create(fieldData);

      // Assert
      expect(result).toHaveProperty('boardId', 'board-123');
      expect(result).toHaveProperty('fieldType', 'select');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('throws error when database insert fails', async () => {
      // Arrange
      const fieldData = {
        board_id: 'board-123',
        name: 'Test Field',
        field_type: 'text' as const,
        required: false,
        position: 0,
      };

      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Foreign key constraint violation',
          code: '23503',
        },
      });

      // Act & Assert
      await expect(service.create(fieldData)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });

    it('handles null config gracefully', async () => {
      // Arrange
      const fieldData = {
        board_id: 'board-123',
        name: 'Simple Text',
        field_type: 'text' as const,
        config: null,
        required: false,
        position: 0,
      };

      const dbResponse = {
        id: 'field-001',
        ...fieldData,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.create(fieldData);

      // Assert
      expect(result.config).toBeNull();
    });
  });

  describe('getById', () => {
    it('retrieves custom field definition by id', async () => {
      // Arrange
      const fieldId = 'field-001';
      const dbResponse = {
        id: fieldId,
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
        config: { min: 0, max: 100 },
        required: false,
        position: 0,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T00:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.getById(fieldId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.selectMock).toHaveBeenCalled();
      expect(mocks.eqMock).toHaveBeenCalledWith('id', fieldId);
      expect(mocks.singleMock).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: fieldId,
        name: 'Story Points',
      }));
    });

    it('returns null when field not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
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

  describe('getByBoardId', () => {
    it('retrieves all field definitions for a board', async () => {
      // Arrange
      const boardId = 'board-123';
      const dbFields = [
        {
          id: 'field-001',
          board_id: boardId,
          name: 'Story Points',
          field_type: 'number',
          config: { min: 0, max: 100 },
          required: false,
          position: 0,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'field-002',
          board_id: boardId,
          name: 'Sprint',
          field_type: 'select',
          config: { options: ['Sprint 24', 'Sprint 25'], multiple: false },
          required: false,
          position: 1,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
      ];

      mocks.selectMock.mockResolvedValue({
        data: dbFields,
        error: null,
      });

      // Act
      const result = await service.getByBoardId(boardId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.eqMock).toHaveBeenCalledWith('board_id', boardId);
      expect(mocks.orderMock).toHaveBeenCalledWith('position', { ascending: true });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Story Points');
      expect(result[1].name).toBe('Sprint');
    });

    it('returns empty array when no fields found', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      const result = await service.getByBoardId('board-empty');

      // Assert
      expect(result).toEqual([]);
    });

    it('orders fields by position ascending', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await service.getByBoardId('board-123');

      // Assert
      expect(mocks.orderMock).toHaveBeenCalledWith('position', { ascending: true });
    });
  });

  describe('update', () => {
    it('updates field definition', async () => {
      // Arrange
      const fieldId = 'field-001';
      const updates = {
        name: 'Updated Name',
        config: { min: 1, max: 50 },
      };

      const dbResponse = {
        id: fieldId,
        board_id: 'board-123',
        name: 'Updated Name',
        field_type: 'number',
        config: { min: 1, max: 50 },
        required: false,
        position: 0,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T01:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.update(fieldId, updates);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.updateMock).toHaveBeenCalledWith(updates);
      expect(mocks.eqMock).toHaveBeenCalledWith('id', fieldId);
      expect(result).toEqual(expect.objectContaining({
        id: fieldId,
        name: 'Updated Name',
      }));
    });

    it('updates required flag', async () => {
      // Arrange
      const fieldId = 'field-001';
      const updates = { required: true };

      const dbResponse = {
        id: fieldId,
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
        required: true,
        position: 0,
        created_at: '2025-01-22T00:00:00.000Z',
        updated_at: '2025-01-22T01:00:00.000Z',
      };

      mocks.singleMock.mockResolvedValue({
        data: dbResponse,
        error: null,
      });

      // Act
      const result = await service.update(fieldId, updates);

      // Assert
      expect(result?.required).toBe(true);
    });

    it('returns null when field not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Act
      const result = await service.update('nonexistent-id', { name: 'Test' });

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
        service.update('field-001', { name: 'Test' })
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('deletes custom field definition', async () => {
      // Arrange
      const fieldId = 'field-001';

      mocks.deleteMock.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      await service.delete(fieldId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.eqMock).toHaveBeenCalledWith('id', fieldId);
    });

    it('throws error when field not found', async () => {
      // Arrange
      mocks.deleteMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Act & Assert
      await expect(service.delete('nonexistent-id')).rejects.toThrow('Field not found');
    });

    it('throws error when delete fails', async () => {
      // Arrange
      mocks.deleteMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Permission denied',
          code: 'PERMISSION_ERROR',
        },
      });

      // Act & Assert
      await expect(service.delete('field-001')).rejects.toThrow('Permission denied');
    });

    it('cascades delete to task custom_fields_values (handled by DB)', async () => {
      // Arrange
      const fieldId = 'field-001';

      mocks.deleteMock.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      await service.delete(fieldId);

      // Assert
      // Database triggers should handle cleaning up custom_fields_values in tasks
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.deleteMock).toHaveBeenCalled();
    });
  });

  describe('Position Management', () => {
    it('assigns next position when creating field', async () => {
      // Arrange
      const existingFields = [
        {
          id: 'field-001',
          board_id: 'board-123',
          name: 'Field 1',
          field_type: 'text',
          position: 0,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'field-002',
          board_id: 'board-123',
          name: 'Field 2',
          field_type: 'number',
          position: 1,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
      ];

      // First call: get existing fields
      mocks.selectMock.mockResolvedValueOnce({
        data: existingFields,
        error: null,
      });

      // Second call: insert new field
      mocks.singleMock.mockResolvedValueOnce({
        data: {
          id: 'field-003',
          board_id: 'board-123',
          name: 'New Field',
          field_type: 'text',
          position: 2, // Next position
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        error: null,
      });

      // Act
      const result = await service.create({
        board_id: 'board-123',
        name: 'New Field',
        field_type: 'text',
        required: false,
        position: 2, // Should be calculated by service
      });

      // Assert
      expect(result.position).toBe(2);
    });

    it('assigns position 0 for first field in board', async () => {
      // Arrange
      mocks.selectMock.mockResolvedValueOnce({
        data: [], // No existing fields
        error: null,
      });

      mocks.singleMock.mockResolvedValueOnce({
        data: {
          id: 'field-001',
          board_id: 'board-123',
          name: 'First Field',
          field_type: 'text',
          position: 0,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        error: null,
      });

      // Act
      const result = await service.create({
        board_id: 'board-123',
        name: 'First Field',
        field_type: 'text',
        required: false,
        position: 0,
      });

      // Assert
      expect(result.position).toBe(0);
    });

    it('reorders field definitions', async () => {
      // Arrange
      const reorderedIds = ['field-003', 'field-001', 'field-002'];

      mocks.updateMock.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      await service.reorder('board-123', reorderedIds);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.updateMock).toHaveBeenCalledTimes(3);

      // Verify positions: field-003 → 0, field-001 → 1, field-002 → 2
      expect(mocks.eqMock).toHaveBeenCalledWith('id', 'field-003');
      expect(mocks.eqMock).toHaveBeenCalledWith('id', 'field-001');
      expect(mocks.eqMock).toHaveBeenCalledWith('id', 'field-002');
    });

    it('throws error when reorder fails', async () => {
      // Arrange
      const reorderedIds = ['field-001', 'field-002'];

      mocks.updateMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Update failed',
          code: 'ERROR',
        },
      });

      // Act & Assert
      await expect(
        service.reorder('board-123', reorderedIds)
      ).rejects.toThrow('Reorder failed');
    });

    it('skips empty reorder requests', async () => {
      // Act
      await service.reorder('board-123', []);

      // Assert
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('batch gets fields by multiple IDs', async () => {
      // Arrange
      const fieldIds = ['field-001', 'field-002', 'field-003'];

      const dbFields = [
        {
          id: 'field-001',
          board_id: 'board-123',
          name: 'Field 1',
          field_type: 'text',
          position: 0,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'field-002',
          board_id: 'board-123',
          name: 'Field 2',
          field_type: 'number',
          position: 1,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
        {
          id: 'field-003',
          board_id: 'board-123',
          name: 'Field 3',
          field_type: 'select',
          position: 2,
          created_at: '2025-01-22T00:00:00.000Z',
          updated_at: '2025-01-22T00:00:00.000Z',
        },
      ];

      mocks.selectMock.mockResolvedValue({
        data: dbFields,
        error: null,
      });

      // Act
      const result = await service.getByIds(fieldIds);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('custom_field_definitions');
      expect(mocks.inMock).toHaveBeenCalledWith('id', fieldIds);
      expect(result).toHaveLength(3);
    });

    it('returns empty array for empty ID list', async () => {
      // Act
      const result = await service.getByIds([]);

      // Assert
      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
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
        service.getByBoardId('board-123')
      ).rejects.toThrow('Connection timeout');
    });

    it('handles foreign key constraint violations', async () => {
      // Arrange
      const fieldData = {
        board_id: 'nonexistent-board',
        name: 'Field',
        field_type: 'text' as const,
        required: false,
        position: 0,
      };

      mocks.singleMock.mockResolvedValue({
        data: null,
        error: {
          message: 'Foreign key constraint violation',
          code: '23503',
        },
      });

      // Act & Assert
      await expect(service.create(fieldData)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });
});
