/**
 * createCustomFieldDefinition Use Case Tests
 *
 * Tests business logic for creating custom field definitions.
 * Validates config based on field_type.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCustomFieldDefinition } from './createCustomFieldDefinition';
import type { CustomFieldService } from '../services/custom-field.service';

vi.mock('../services/custom-field.service');

describe('createCustomFieldDefinition', () => {
  let mockService: jest.Mocked<CustomFieldService>;

  beforeEach(() => {
    mockService = {
      create: vi.fn(),
      getById: vi.fn(),
      getByBoardId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;
  });

  describe('Text Field', () => {
    it('creates text field with max_length config', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Description',
        field_type: 'text' as const,
        config: { max_length: 500 },
        required: false,
      };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      const result = await createCustomFieldDefinition(fieldData, mockService);

      expect(result.field_type).toBe('text');
      expect(result.config.max_length).toBe(500);
    });

    it('throws error when max_length is negative for text field', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: 'Description',
        field_type: 'text' as const,
        config: { max_length: -1 },
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow('max_length must be positive');
    });
  });

  describe('Number Field', () => {
    it('creates number field with min/max config', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Story Points',
        field_type: 'number' as const,
        config: { min: 0, max: 100 },
        required: true,
      };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      const result = await createCustomFieldDefinition(fieldData, mockService);

      expect(result.config.min).toBe(0);
      expect(result.config.max).toBe(100);
    });

    it('throws error when min > max for number field', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: 'Points',
        field_type: 'number' as const,
        config: { min: 100, max: 10 },
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow('min cannot be greater than max');
    });
  });

  describe('Select Field', () => {
    it('creates select field with options', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Priority',
        field_type: 'select' as const,
        config: { options: ['P0', 'P1', 'P2'], multiple: false },
        required: false,
      };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      const result = await createCustomFieldDefinition(fieldData, mockService);

      expect(result.config.options).toEqual(['P0', 'P1', 'P2']);
    });

    it('throws error when select field has no options', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: 'Priority',
        field_type: 'select' as const,
        config: { options: [], multiple: false },
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow('Select field must have at least one option');
    });

    it('creates multi-select field', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Labels',
        field_type: 'select' as const,
        config: { options: ['bug', 'feature', 'urgent'], multiple: true },
      };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      const result = await createCustomFieldDefinition(fieldData, mockService);

      expect(result.config.multiple).toBe(true);
    });
  });

  describe('Date Field', () => {
    it('creates date field with min/max dates', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Due Date',
        field_type: 'date' as const,
        config: {
          min_date: '2025-01-01',
          max_date: '2025-12-31',
        },
      };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      const result = await createCustomFieldDefinition(fieldData, mockService);

      expect(result.config.min_date).toBe('2025-01-01');
      expect(result.config.max_date).toBe('2025-12-31');
    });

    it('throws error when min_date > max_date', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: 'Date',
        field_type: 'date' as const,
        config: {
          min_date: '2025-12-31',
          max_date: '2025-01-01',
        },
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow('min_date cannot be after max_date');
    });
  });

  describe('Checkbox Field', () => {
    it('creates checkbox field', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Is Blocked',
        field_type: 'checkbox' as const,
        config: {},
      };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      const result = await createCustomFieldDefinition(fieldData, mockService);

      expect(result.field_type).toBe('checkbox');
    });
  });

  describe('Validation', () => {
    it('throws error when field_name is empty', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: '',
        field_type: 'text' as const,
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow('Field name is required');
    });

    it('throws error when field_name exceeds max length', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: 'a'.repeat(101),
        field_type: 'text' as const,
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow('Field name must be at most 100 characters');
    });

    it('throws error when field_type is invalid', async () => {
      const invalidData = {
        board_id: 'board-1',
        field_name: 'Field',
        field_type: 'invalid' as any,
      };

      await expect(
        createCustomFieldDefinition(invalidData, mockService)
      ).rejects.toThrow();
    });
  });

  describe('Authorization', () => {
    it('allows creation when user belongs to board organization', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Field',
        field_type: 'text' as const,
        organization_id: 'org-1',
      };

      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      mockService.create.mockResolvedValue({ id: 'field-1', ...fieldData } as any);

      await createCustomFieldDefinition(fieldData, mockService, authContext);

      expect(mockService.create).toHaveBeenCalled();
    });

    it('throws UNAUTHORIZED when user does not belong to organization', async () => {
      const fieldData = {
        board_id: 'board-1',
        field_name: 'Field',
        field_type: 'text' as const,
        organization_id: 'org-2',
      };

      const authContext = { userId: 'user-1', organizationIds: ['org-1'] };

      await expect(
        createCustomFieldDefinition(fieldData, mockService, authContext)
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });
});
