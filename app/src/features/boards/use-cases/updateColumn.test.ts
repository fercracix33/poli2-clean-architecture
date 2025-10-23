/**
 * updateColumn Use Case Tests
 *
 * Tests business logic for updating board columns (name, color, wip_limit).
 * Mocks BoardService.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateColumn } from './updateColumn';
import type { BoardService } from '../services/board.service';

// Mock service module
vi.mock('../services/board.service');

describe('updateColumn', () => {
  let mockBoardService: jest.Mocked<BoardService>;

  beforeEach(() => {
    // Create fresh mock for each test
    mockBoardService = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getColumnById: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      reorderColumns: vi.fn(),
    } as any;
  });

  describe('Basic Update', () => {
    it('updates column name', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        name: 'Updated Name',
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old Name',
        position: 0,
        wip_limit: null,
        color: null,
      };

      const updatedColumn = {
        ...existingColumn,
        ...updateData,
        updated_at: new Date('2025-01-22T00:00:00Z'),
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue(updatedColumn as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result).toEqual(updatedColumn);
      expect(mockBoardService.updateColumn).toHaveBeenCalledWith(
        columnId,
        expect.objectContaining(updateData)
      );
      expect(mockBoardService.updateColumn).toHaveBeenCalledTimes(1);
    });

    it('updates column color', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        color: '#FF5733',
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
        color: '#FFFFFF',
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        ...updateData,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result.color).toBe('#FF5733');
    });

    it('updates column wip_limit', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        wip_limit: 5,
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
        wip_limit: null,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        ...updateData,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result.wip_limit).toBe(5);
    });

    it('updates multiple fields at once', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        name: 'New Name',
        color: '#00FF00',
        wip_limit: 10,
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        ...updateData,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result.name).toBe('New Name');
      expect(result.color).toBe('#00FF00');
      expect(result.wip_limit).toBe(10);
    });

    it('allows partial update (all fields optional)', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {}; // Empty update

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Unchanged',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue(existingColumn as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result).toEqual(existingColumn);
    });
  });

  describe('WIP Limit Validation', () => {
    it('validates wip_limit against current task count', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        wip_limit: 3,
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
        task_count: 5, // Current tasks exceed new limit
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, updateData, mockBoardService, { validateWipLimit: true })
      ).rejects.toThrow('WIP_LIMIT_EXCEEDED');
    });

    it('allows wip_limit when task count is within limit', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        wip_limit: 10,
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
        task_count: 5, // Within new limit
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        ...updateData,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService, { validateWipLimit: true });

      // Assert
      expect(result.wip_limit).toBe(10);
    });

    it('allows removing wip_limit (set to null)', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        wip_limit: null,
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
        wip_limit: 5,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        wip_limit: null,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result.wip_limit).toBeNull();
    });

    it('throws error when wip_limit is negative', async () => {
      // Arrange
      const columnId = 'col-1';
      const invalidData = {
        wip_limit: -1, // Invalid
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, invalidData, mockBoardService)
      ).rejects.toThrow('wip_limit must be a positive integer');
    });

    it('throws error when wip_limit is zero', async () => {
      // Arrange
      const columnId = 'col-1';
      const invalidData = {
        wip_limit: 0, // Invalid
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, invalidData, mockBoardService)
      ).rejects.toThrow('wip_limit must be greater than 0');
    });
  });

  describe('Color Validation', () => {
    it('validates color is valid hex format', async () => {
      // Arrange
      const columnId = 'col-1';
      const invalidData = {
        color: 'not-a-hex-color', // Invalid
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, invalidData, mockBoardService)
      ).rejects.toThrow('Invalid color format');
    });

    it('accepts valid hex colors with hash', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        color: '#FF5733',
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        ...updateData,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result.color).toBe('#FF5733');
    });

    it('accepts null color (remove color)', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        color: null,
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Column',
        position: 0,
        color: '#FFFFFF',
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        color: null,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(result.color).toBeNull();
    });
  });

  describe('Validation', () => {
    it('throws error when column does not exist', async () => {
      // Arrange
      const columnId = 'non-existent';
      const updateData = { name: 'New Name' };

      mockBoardService.getColumnById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateColumn(columnId, updateData, mockBoardService)
      ).rejects.toThrow('COLUMN_NOT_FOUND');
    });

    it('throws error when column name is empty', async () => {
      // Arrange
      const columnId = 'col-1';
      const invalidData = { name: '' }; // Invalid

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, invalidData, mockBoardService)
      ).rejects.toThrow('Column name cannot be empty');
    });

    it('throws error when column name exceeds max length', async () => {
      // Arrange
      const columnId = 'col-1';
      const invalidData = { name: 'a'.repeat(101) }; // Max 100

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, invalidData, mockBoardService)
      ).rejects.toThrow('Column name must be at most 100 characters');
    });

    it('sanitizes column name before updating', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = {
        name: '  Trimmed  ', // Has whitespace
      };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        name: 'Trimmed',
      } as any);

      // Act
      await updateColumn(columnId, updateData, mockBoardService);

      // Assert
      expect(mockBoardService.updateColumn).toHaveBeenCalledWith(
        columnId,
        expect.objectContaining({ name: 'Trimmed' })
      );
    });
  });

  describe('Authorization', () => {
    it('allows update when user belongs to board organization', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = { name: 'New Name' };
      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
        organization_id: 'org-1',
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockResolvedValue({
        ...existingColumn,
        ...updateData,
      } as any);

      // Act
      const result = await updateColumn(columnId, updateData, mockBoardService, { authContext });

      // Assert
      expect(result.name).toBe('New Name');
    });

    it('throws UNAUTHORIZED when user does not belong to board organization', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = { name: 'New Name' };
      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
        organization_id: 'org-2', // Different org
      };

      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);

      // Act & Assert
      await expect(
        updateColumn(columnId, updateData, mockBoardService, { authContext })
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = { name: 'New Name' };

      const existingColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Old',
        position: 0,
      };

      mockBoardService.getColumnById.mockResolvedValue(existingColumn as any);
      mockBoardService.updateColumn.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        updateColumn(columnId, updateData, mockBoardService)
      ).rejects.toThrow('Failed to update column');
    });

    it('handles unexpected service errors', async () => {
      // Arrange
      const columnId = 'col-1';
      const updateData = { name: 'New Name' };

      mockBoardService.getColumnById.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act & Assert
      await expect(
        updateColumn(columnId, updateData, mockBoardService)
      ).rejects.toThrow();
    });
  });
});
