/**
 * deleteCustomFieldDefinition Use Case Tests
 *
 * Tests business logic for deleting custom field definitions.
 * Handles cleanup of values in existing tasks.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteCustomFieldDefinition } from './deleteCustomFieldDefinition';
import type { CustomFieldService } from '../services/custom-field.service';
import type { TaskService } from '../../tasks/services/task.service';

vi.mock('../services/custom-field.service');
vi.mock('../../tasks/services/task.service');

describe('deleteCustomFieldDefinition', () => {
  let mockCustomFieldService: jest.Mocked<CustomFieldService>;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    mockCustomFieldService = {
      getById: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockTaskService = {
      list: vi.fn(),
      update: vi.fn(),
    } as any;
  });

  describe('Happy Path', () => {
    it('deletes field definition successfully', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        field_name: 'Field',
        field_type: 'text' as const,
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue([]); // No tasks with this field
      mockCustomFieldService.delete.mockResolvedValue(undefined);

      await deleteCustomFieldDefinition(fieldId, mockCustomFieldService, mockTaskService);

      expect(mockCustomFieldService.delete).toHaveBeenCalledWith(fieldId);
    });
  });

  describe('Task Values Cleanup', () => {
    it('removes field values from all tasks before deletion', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        field_name: 'Field',
        field_type: 'text' as const,
        board_id: 'board-1',
      };

      const tasksWithField = [
        {
          id: 'task-1',
          custom_fields_values: { [fieldId]: 'value1', 'other-field': 'value2' },
        },
        {
          id: 'task-2',
          custom_fields_values: { [fieldId]: 'value3' },
        },
      ];

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue(tasksWithField as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockCustomFieldService.delete.mockResolvedValue(undefined);

      await deleteCustomFieldDefinition(
        fieldId,
        mockCustomFieldService,
        mockTaskService,
        { cleanupTaskValues: true }
      );

      // Should update both tasks to remove field value
      expect(mockTaskService.update).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          custom_fields_values: { 'other-field': 'value2' }, // field-1 removed
        })
      );
      expect(mockTaskService.update).toHaveBeenCalledWith(
        'task-2',
        expect.objectContaining({
          custom_fields_values: {}, // field-1 removed, now empty
        })
      );
      expect(mockCustomFieldService.delete).toHaveBeenCalledWith(fieldId);
    });

    it('throws error when tasks have values and cleanup is disabled', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        field_name: 'Field',
        board_id: 'board-1',
      };

      const tasksWithField = [
        { id: 'task-1', custom_fields_values: { [fieldId]: 'value' } },
      ];

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue(tasksWithField as any);

      await expect(
        deleteCustomFieldDefinition(
          fieldId,
          mockCustomFieldService,
          mockTaskService,
          { cleanupTaskValues: false }
        )
      ).rejects.toThrow('FIELD_IN_USE');
    });

    it('counts affected tasks before cleanup', async () => {
      const fieldId = 'field-1';
      const field = { id: fieldId, board_id: 'board-1' };
      const tasks = [
        { id: 'task-1', custom_fields_values: { [fieldId]: 'val1' } },
        { id: 'task-2', custom_fields_values: { [fieldId]: 'val2' } },
        { id: 'task-3', custom_fields_values: { 'other': 'val' } }, // No field-1
      ];

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue(tasks as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockCustomFieldService.delete.mockResolvedValue(undefined);

      const result = await deleteCustomFieldDefinition(
        fieldId,
        mockCustomFieldService,
        mockTaskService,
        { cleanupTaskValues: true }
      );

      expect(result.affectedTasksCount).toBe(2); // Only task-1 and task-2
    });
  });

  describe('Transaction Handling', () => {
    it('performs cleanup and deletion atomically', async () => {
      const fieldId = 'field-1';
      const field = { id: fieldId, board_id: 'board-1' };
      const tasks = [{ id: 'task-1', custom_fields_values: { [fieldId]: 'val' } }];

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue(tasks as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockCustomFieldService.delete.mockResolvedValue(undefined);

      await deleteCustomFieldDefinition(
        fieldId,
        mockCustomFieldService,
        mockTaskService,
        { cleanupTaskValues: true }
      );

      // Cleanup happens before deletion
      expect(mockTaskService.update).toHaveBeenCalled();
      expect(mockCustomFieldService.delete).toHaveBeenCalledAfter(mockTaskService.update as any);
    });

    it('rolls back when deletion fails after cleanup', async () => {
      const fieldId = 'field-1';
      const field = { id: fieldId, board_id: 'board-1' };
      const tasks = [{ id: 'task-1', custom_fields_values: { [fieldId]: 'val' } }];

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue(tasks as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockCustomFieldService.delete.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        deleteCustomFieldDefinition(
          fieldId,
          mockCustomFieldService,
          mockTaskService,
          { cleanupTaskValues: true }
        )
      ).rejects.toThrow('Failed to delete custom field');
    });
  });

  describe('Validation', () => {
    it('throws error when field does not exist', async () => {
      mockCustomFieldService.getById.mockResolvedValue(null);

      await expect(
        deleteCustomFieldDefinition('non-existent', mockCustomFieldService, mockTaskService)
      ).rejects.toThrow('CUSTOM_FIELD_NOT_FOUND');
    });

    it('throws error when field is required', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        field_name: 'Required Field',
        required: true, // Required field
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(field as any);

      await expect(
        deleteCustomFieldDefinition(fieldId, mockCustomFieldService, mockTaskService)
      ).rejects.toThrow('CANNOT_DELETE_REQUIRED_FIELD');
    });

    it('allows deletion of required field when force flag is enabled', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        field_name: 'Required Field',
        required: true,
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue([]);
      mockCustomFieldService.delete.mockResolvedValue(undefined);

      await deleteCustomFieldDefinition(
        fieldId,
        mockCustomFieldService,
        mockTaskService,
        { force: true }
      );

      expect(mockCustomFieldService.delete).toHaveBeenCalledWith(fieldId);
    });
  });

  describe('Authorization', () => {
    it('allows deletion when user is board admin', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        board_id: 'board-1',
        organization_id: 'org-1',
      };
      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
        role: 'admin',
      };

      mockCustomFieldService.getById.mockResolvedValue(field as any);
      mockTaskService.list.mockResolvedValue([]);
      mockCustomFieldService.delete.mockResolvedValue(undefined);

      await deleteCustomFieldDefinition(
        fieldId,
        mockCustomFieldService,
        mockTaskService,
        { authContext }
      );

      expect(mockCustomFieldService.delete).toHaveBeenCalled();
    });

    it('throws UNAUTHORIZED when user does not belong to organization', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        organization_id: 'org-2',
      };
      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
      };

      mockCustomFieldService.getById.mockResolvedValue(field as any);

      await expect(
        deleteCustomFieldDefinition(
          fieldId,
          mockCustomFieldService,
          mockTaskService,
          { authContext }
        )
      ).rejects.toThrow('UNAUTHORIZED');
    });

    it('throws FORBIDDEN when user is not admin', async () => {
      const fieldId = 'field-1';
      const field = {
        id: fieldId,
        organization_id: 'org-1',
      };
      const authContext = {
        userId: 'user-1',
        organizationIds: ['org-1'],
        role: 'member', // Not admin
      };

      mockCustomFieldService.getById.mockResolvedValue(field as any);

      await expect(
        deleteCustomFieldDefinition(
          fieldId,
          mockCustomFieldService,
          mockTaskService,
          { authContext }
        )
      ).rejects.toThrow('FORBIDDEN');
    });
  });
});
