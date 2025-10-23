/**
 * updateCustomFieldDefinition Use Case Tests
 *
 * Tests business logic for updating custom field definitions.
 * Validates impact on existing task values.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCustomFieldDefinition } from './updateCustomFieldDefinition';
import type { CustomFieldService } from '../services/custom-field.service';
import type { TaskService } from '../../tasks/services/task.service';

vi.mock('../services/custom-field.service');
vi.mock('../../tasks/services/task.service');

describe('updateCustomFieldDefinition', () => {
  let mockCustomFieldService: jest.Mocked<CustomFieldService>;
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    mockCustomFieldService = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockTaskService = {
      list: vi.fn(),
      update: vi.fn(),
    } as any;
  });

  describe('Basic Update', () => {
    it('updates field name', async () => {
      const fieldId = 'field-1';
      const updateData = { field_name: 'Updated Name' };
      const existingField = {
        id: fieldId,
        field_name: 'Old Name',
        field_type: 'text' as const,
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        ...updateData,
      } as any);

      const result = await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService
      );

      expect(result.field_name).toBe('Updated Name');
    });

    it('updates required flag', async () => {
      const fieldId = 'field-1';
      const updateData = { required: true };
      const existingField = {
        id: fieldId,
        field_name: 'Field',
        field_type: 'text' as const,
        required: false,
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        required: true,
      } as any);

      const result = await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService
      );

      expect(result.required).toBe(true);
    });
  });

  describe('Config Update Validation', () => {
    it('validates updated number field min/max', async () => {
      const fieldId = 'field-1';
      const updateData = { config: { min: 0, max: 50 } };
      const existingField = {
        id: fieldId,
        field_name: 'Points',
        field_type: 'number' as const,
        config: { min: 0, max: 100 },
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        ...updateData,
      } as any);

      const result = await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService
      );

      expect(result.config.max).toBe(50);
    });

    it('throws error when updated min > max for number field', async () => {
      const fieldId = 'field-1';
      const invalidUpdate = { config: { min: 100, max: 10 } };
      const existingField = {
        id: fieldId,
        field_type: 'number' as const,
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);

      await expect(
        updateCustomFieldDefinition(fieldId, invalidUpdate, mockCustomFieldService, mockTaskService)
      ).rejects.toThrow('min cannot be greater than max');
    });

    it('validates updated select field options', async () => {
      const fieldId = 'field-1';
      const updateData = { config: { options: ['P0', 'P1', 'P2', 'P3'] } };
      const existingField = {
        id: fieldId,
        field_type: 'select' as const,
        config: { options: ['P0', 'P1', 'P2'] },
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        ...updateData,
      } as any);

      const result = await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService
      );

      expect(result.config.options).toHaveLength(4);
    });
  });

  describe('Impact on Existing Task Values', () => {
    it('warns when narrowing number field range affects existing values', async () => {
      const fieldId = 'field-1';
      const updateData = { config: { min: 0, max: 50 } }; // Narrowing from 100 to 50
      const existingField = {
        id: fieldId,
        field_type: 'number' as const,
        config: { min: 0, max: 100 },
        board_id: 'board-1',
      };

      const affectedTasks = [
        { id: 'task-1', custom_fields_values: { [fieldId]: 75 } }, // > 50
      ];

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockTaskService.list.mockResolvedValue(affectedTasks as any);

      await expect(
        updateCustomFieldDefinition(
          fieldId,
          updateData,
          mockCustomFieldService,
          mockTaskService,
          { validateExistingValues: true }
        )
      ).rejects.toThrow('EXISTING_VALUES_INVALID');
    });

    it('allows update when no existing values are affected', async () => {
      const fieldId = 'field-1';
      const updateData = { config: { min: 0, max: 50 } };
      const existingField = {
        id: fieldId,
        field_type: 'number' as const,
        config: { min: 0, max: 100 },
        board_id: 'board-1',
      };

      const tasks = [
        { id: 'task-1', custom_fields_values: { [fieldId]: 25 } }, // Within new range
      ];

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockTaskService.list.mockResolvedValue(tasks as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        ...updateData,
      } as any);

      const result = await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService,
        { validateExistingValues: true }
      );

      expect(result.config.max).toBe(50);
    });

    it('removes invalid select options and clears affected task values', async () => {
      const fieldId = 'field-1';
      const updateData = { config: { options: ['P0', 'P1'] } }; // Removed P2
      const existingField = {
        id: fieldId,
        field_type: 'select' as const,
        config: { options: ['P0', 'P1', 'P2'] },
        board_id: 'board-1',
      };

      const affectedTasks = [
        { id: 'task-1', custom_fields_values: { [fieldId]: 'P2' } }, // No longer valid
      ];

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockTaskService.list.mockResolvedValue(affectedTasks as any);
      mockTaskService.update.mockResolvedValue({} as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        ...updateData,
      } as any);

      await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService,
        { clearInvalidValues: true }
      );

      expect(mockTaskService.update).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          custom_fields_values: expect.not.objectContaining({ [fieldId]: 'P2' }),
        })
      );
    });
  });

  describe('Field Type Change', () => {
    it('prevents changing field type', async () => {
      const fieldId = 'field-1';
      const invalidUpdate = { field_type: 'number' as const };
      const existingField = {
        id: fieldId,
        field_type: 'text' as const,
        board_id: 'board-1',
      };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);

      await expect(
        updateCustomFieldDefinition(fieldId, invalidUpdate, mockCustomFieldService, mockTaskService)
      ).rejects.toThrow('CANNOT_CHANGE_FIELD_TYPE');
    });
  });

  describe('Validation', () => {
    it('throws error when field does not exist', async () => {
      mockCustomFieldService.getById.mockResolvedValue(null);

      await expect(
        updateCustomFieldDefinition('non-existent', {}, mockCustomFieldService, mockTaskService)
      ).rejects.toThrow('CUSTOM_FIELD_NOT_FOUND');
    });
  });

  describe('Authorization', () => {
    it('allows update when user belongs to organization', async () => {
      const fieldId = 'field-1';
      const updateData = { field_name: 'New Name' };
      const existingField = {
        id: fieldId,
        field_name: 'Old',
        field_type: 'text' as const,
        organization_id: 'org-1',
        board_id: 'board-1',
      };
      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);
      mockCustomFieldService.update.mockResolvedValue({
        ...existingField,
        ...updateData,
      } as any);

      await updateCustomFieldDefinition(
        fieldId,
        updateData,
        mockCustomFieldService,
        mockTaskService,
        { authContext }
      );

      expect(mockCustomFieldService.update).toHaveBeenCalled();
    });

    it('throws UNAUTHORIZED when user does not belong to organization', async () => {
      const fieldId = 'field-1';
      const existingField = {
        id: fieldId,
        organization_id: 'org-2',
        board_id: 'board-1',
      };
      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      mockCustomFieldService.getById.mockResolvedValue(existingField as any);

      await expect(
        updateCustomFieldDefinition(
          fieldId,
          {},
          mockCustomFieldService,
          mockTaskService,
          { authContext }
        )
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });
});
