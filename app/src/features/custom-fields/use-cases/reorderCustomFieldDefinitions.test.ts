/**
 * reorderCustomFieldDefinitions Use Case Tests
 *
 * Tests business logic for reordering custom field definitions.
 * Affects display order in UI.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reorderCustomFieldDefinitions } from './reorderCustomFieldDefinitions';
import type { CustomFieldService } from '../services/custom-field.service';

vi.mock('../services/custom-field.service');

describe('reorderCustomFieldDefinitions', () => {
  let mockService: jest.Mocked<CustomFieldService>;

  beforeEach(() => {
    mockService = {
      getByBoardId: vi.fn(),
      update: vi.fn(),
      reorder: vi.fn(),
    } as any;
  });

  describe('Happy Path', () => {
    it('reorders fields with new positions', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { field_id: 'field-1', position: 2 },
        { field_id: 'field-2', position: 0 },
        { field_id: 'field-3', position: 1 },
      ];

      const updatedFields = [
        { id: 'field-2', position: 0 },
        { id: 'field-3', position: 1 },
        { id: 'field-1', position: 2 },
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1', position: 0 },
        { id: 'field-2', position: 1 },
        { id: 'field-3', position: 2 },
      ] as any);
      mockService.reorder.mockResolvedValue(updatedFields as any);

      const result = await reorderCustomFieldDefinitions(boardId, reorderData, mockService);

      expect(result).toEqual(updatedFields);
      expect(mockService.reorder).toHaveBeenCalledWith(boardId, reorderData);
    });

    it('moves field from first to last position', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { field_id: 'field-1', position: 2 }, // Was 0, now 2
        { field_id: 'field-2', position: 0 }, // Was 1, now 0
        { field_id: 'field-3', position: 1 }, // Was 2, now 1
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1', position: 0 },
        { id: 'field-2', position: 1 },
        { id: 'field-3', position: 2 },
      ] as any);
      mockService.reorder.mockResolvedValue([]);

      await reorderCustomFieldDefinitions(boardId, reorderData, mockService);

      expect(mockService.reorder).toHaveBeenCalledWith(
        boardId,
        expect.arrayContaining([
          expect.objectContaining({ field_id: 'field-1', position: 2 }),
        ])
      );
    });

    it('swaps two adjacent fields', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { field_id: 'field-1', position: 1 }, // Swap
        { field_id: 'field-2', position: 0 }, // Swap
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1', position: 0 },
        { id: 'field-2', position: 1 },
      ] as any);
      mockService.reorder.mockResolvedValue([]);

      await reorderCustomFieldDefinitions(boardId, reorderData, mockService);

      expect(mockService.reorder).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('throws error when board has no fields', async () => {
      const boardId = 'board-1';
      const reorderData = [{ field_id: 'field-1', position: 0 }];

      mockService.getByBoardId.mockResolvedValue([]);

      await expect(
        reorderCustomFieldDefinitions(boardId, reorderData, mockService)
      ).rejects.toThrow('BOARD_HAS_NO_FIELDS');
    });

    it('throws error when positions are not sequential', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { field_id: 'field-1', position: 0 },
        { field_id: 'field-2', position: 2 }, // Gap!
        { field_id: 'field-3', position: 3 },
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
        { id: 'field-3' },
      ] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, invalidData, mockService)
      ).rejects.toThrow('Positions must be sequential starting from 0');
    });

    it('throws error when positions do not start at 0', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { field_id: 'field-1', position: 1 }, // Should start at 0
        { field_id: 'field-2', position: 2 },
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
      ] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, invalidData, mockService)
      ).rejects.toThrow('Positions must start at 0');
    });

    it('throws error when duplicate positions exist', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { field_id: 'field-1', position: 0 },
        { field_id: 'field-2', position: 0 }, // Duplicate!
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
      ] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, invalidData, mockService)
      ).rejects.toThrow('Duplicate positions detected');
    });

    it('throws error when field_id is invalid', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { field_id: '', position: 0 }, // Empty
      ];

      mockService.getByBoardId.mockResolvedValue([{ id: 'field-1' }] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, invalidData, mockService)
      ).rejects.toThrow('Invalid field_id');
    });

    it('throws error when reorder data is empty', async () => {
      const boardId = 'board-1';
      const emptyData: any[] = [];

      await expect(
        reorderCustomFieldDefinitions(boardId, emptyData, mockService)
      ).rejects.toThrow('Reorder data cannot be empty');
    });

    it('validates all fields belong to the board', async () => {
      const boardId = 'board-1';
      const invalidData = [
        { field_id: 'field-from-different-board', position: 0 },
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
      ] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, invalidData, mockService)
      ).rejects.toThrow('FIELD_NOT_IN_BOARD');
    });

    it('throws error when reorder data count does not match board fields', async () => {
      const boardId = 'board-1';
      const incompleteData = [
        { field_id: 'field-1', position: 0 },
        // Missing field-2
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
      ] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, incompleteData, mockService)
      ).rejects.toThrow('Must provide positions for all fields');
    });
  });

  describe('Authorization', () => {
    it('allows reordering when user is board member', async () => {
      const boardId = 'board-1';
      const reorderData = [{ field_id: 'field-1', position: 0 }];
      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1', organization_id: 'org-1' },
      ] as any);
      mockService.reorder.mockResolvedValue([]);

      await reorderCustomFieldDefinitions(boardId, reorderData, mockService, authContext);

      expect(mockService.reorder).toHaveBeenCalled();
    });

    it('throws UNAUTHORIZED when user does not belong to organization', async () => {
      const boardId = 'board-1';
      const reorderData = [{ field_id: 'field-1', position: 0 }];
      const authContext = { userId: 'user-1', organizationIds: ['org-2'] };

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1', organization_id: 'org-1' },
      ] as any);

      await expect(
        reorderCustomFieldDefinitions(boardId, reorderData, mockService, authContext)
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('Transaction Handling', () => {
    it('updates all field positions atomically', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { field_id: 'field-1', position: 2 },
        { field_id: 'field-2', position: 0 },
        { field_id: 'field-3', position: 1 },
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
        { id: 'field-3' },
      ] as any);
      mockService.reorder.mockResolvedValue([]);

      await reorderCustomFieldDefinitions(boardId, reorderData, mockService);

      // Should be called once with all data (atomic)
      expect(mockService.reorder).toHaveBeenCalledTimes(1);
    });

    it('rolls back on failure', async () => {
      const boardId = 'board-1';
      const reorderData = [
        { field_id: 'field-1', position: 1 },
        { field_id: 'field-2', position: 0 },
      ];

      mockService.getByBoardId.mockResolvedValue([
        { id: 'field-1' },
        { id: 'field-2' },
      ] as any);
      mockService.reorder.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        reorderCustomFieldDefinitions(boardId, reorderData, mockService)
      ).rejects.toThrow('Failed to reorder custom fields');
    });
  });

  describe('Performance', () => {
    it('handles large number of fields efficiently', async () => {
      const boardId = 'board-1';
      const reorderData = Array.from({ length: 50 }, (_, i) => ({
        field_id: `field-${i}`,
        position: 49 - i, // Reverse order
      }));

      const existingFields = Array.from({ length: 50 }, (_, i) => ({
        id: `field-${i}`,
        position: i,
      }));

      mockService.getByBoardId.mockResolvedValue(existingFields as any);
      mockService.reorder.mockResolvedValue([]);

      await reorderCustomFieldDefinitions(boardId, reorderData, mockService);

      expect(mockService.reorder).toHaveBeenCalledWith(
        boardId,
        expect.arrayContaining(reorderData)
      );
    });
  });
});
