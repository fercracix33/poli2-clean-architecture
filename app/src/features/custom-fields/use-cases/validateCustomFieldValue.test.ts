/**
 * validateCustomFieldValue Use Case Tests
 *
 * Tests CRITICAL validation logic for custom field values.
 * Validates type-specific constraints and required/optional logic.
 *
 * THIS IS CORE FOR DATA INTEGRITY.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateCustomFieldValue } from './validateCustomFieldValue'
import type { CustomFieldService } from '../services/custom-field.service'
import type {
  CustomFieldDefinition,
  CustomFieldValue,
  CustomFieldType,
} from '../entities'

vi.mock('../services/custom-field.service')

describe('validateCustomFieldValue - CRITICAL TYPE VALIDATIONS', () => {
  let mockCustomFieldService: jest.Mocked<CustomFieldService>

  beforeEach(() => {
    mockCustomFieldService = {
      getDefinitionById: vi.fn(),
      listDefinitionsForProject: vi.fn(),
    } as any
  })

  describe('TEXT Field Validation', () => {
    it('accepts valid text within max length', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Description',
        field_type: 'text',
        is_required: false,
        config: { max_length: 500 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'Valid description text',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects text exceeding max length', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Short Text',
        field_type: 'text',
        is_required: false,
        config: { max_length: 100 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'x'.repeat(101),
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('exceeds maximum length of 100')
    })

    it('accepts empty string for optional text field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Optional Notes',
        field_type: 'text',
        is_required: false,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: '',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects empty string for required text field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Required Notes',
        field_type: 'text',
        is_required: true,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: '',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('is required')
    })
  })

  describe('NUMBER Field Validation', () => {
    it('accepts valid integer within range', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Story Points',
        field_type: 'number',
        is_required: false,
        config: { min_value: 1, max_value: 13 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 5,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('accepts decimal number when allowed', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Hours Estimated',
        field_type: 'number',
        is_required: false,
        config: { allow_decimal: true, min_value: 0, max_value: 100 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 4.5,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects decimal when only integers allowed', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Story Points',
        field_type: 'number',
        is_required: false,
        config: { allow_decimal: false },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 5.5,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be an integer')
    })

    it('rejects number below minimum', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Priority',
        field_type: 'number',
        is_required: false,
        config: { min_value: 1, max_value: 5 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 0,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be at least 1')
    })

    it('rejects number above maximum', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Priority',
        field_type: 'number',
        is_required: false,
        config: { min_value: 1, max_value: 5 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 10,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be at most 5')
    })

    it('rejects non-numeric value for number field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Count',
        field_type: 'number',
        is_required: false,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'not a number' as any,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be a number')
    })
  })

  describe('DATE Field Validation', () => {
    it('accepts valid ISO date string', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Due Date',
        field_type: 'date',
        is_required: false,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: '2024-12-31',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects invalid date format', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Due Date',
        field_type: 'date',
        is_required: false,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'invalid-date',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be a valid date')
    })

    it('rejects date before minimum', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Start Date',
        field_type: 'date',
        is_required: false,
        config: { min_date: '2024-01-01' },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: '2023-12-31',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be on or after 2024-01-01')
    })

    it('rejects date after maximum', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'End Date',
        field_type: 'date',
        is_required: false,
        config: { max_date: '2024-12-31' },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: '2025-01-01',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be on or before 2024-12-31')
    })
  })

  describe('SELECT Field Validation', () => {
    it('accepts valid option from allowed list', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Priority',
        field_type: 'select',
        is_required: false,
        config: { options: ['Low', 'Medium', 'High', 'Critical'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'High',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects option not in allowed list', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Priority',
        field_type: 'select',
        is_required: false,
        config: { options: ['Low', 'Medium', 'High'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'Invalid Option',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be one of: Low, Medium, High')
    })

    it('is case-sensitive for options', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Status',
        field_type: 'select',
        is_required: false,
        config: { options: ['Active', 'Inactive'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'active', // Lowercase
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be one of: Active, Inactive')
    })
  })

  describe('MULTI_SELECT Field Validation', () => {
    it('accepts valid array of options', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Tags',
        field_type: 'multi_select',
        is_required: false,
        config: { options: ['Frontend', 'Backend', 'Database', 'Testing'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: ['Frontend', 'Testing'],
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects if value is not an array', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Tags',
        field_type: 'multi_select',
        is_required: false,
        config: { options: ['Option1', 'Option2'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: 'Not an array' as any,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be an array')
    })

    it('rejects if any option is invalid', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Tags',
        field_type: 'multi_select',
        is_required: false,
        config: { options: ['Frontend', 'Backend', 'Database'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: ['Frontend', 'InvalidTag'],
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('InvalidTag')
    })

    it('accepts empty array for optional field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Tags',
        field_type: 'multi_select',
        is_required: false,
        config: { options: ['Option1', 'Option2'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: [],
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects empty array for required field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Required Tags',
        field_type: 'multi_select',
        is_required: true,
        config: { options: ['Option1', 'Option2'] },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: [],
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('is required')
    })
  })

  describe('Definition Lookup', () => {
    it('throws error when definition not found', async () => {
      // Arrange
      const value: CustomFieldValue = {
        custom_field_definition_id: 'non-existent',
        value: 'Some value',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        validateCustomFieldValue(value, mockCustomFieldService)
      ).rejects.toThrow('Custom field definition not found')
    })

    it('validates against correct field definition', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-specific',
        project_id: 'proj-1',
        field_name: 'Specific Field',
        field_type: 'text',
        is_required: false,
        config: { max_length: 50 },
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-specific',
        value: 'Valid text',
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(mockCustomFieldService.getDefinitionById).toHaveBeenCalledWith('field-specific')
      expect(result.isValid).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles null value for optional field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Optional Field',
        field_type: 'text',
        is_required: false,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: null as any,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(true)
    })

    it('rejects null value for required field', async () => {
      // Arrange
      const definition: CustomFieldDefinition = {
        id: 'field-1',
        project_id: 'proj-1',
        field_name: 'Required Field',
        field_type: 'text',
        is_required: true,
        config: {},
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const value: CustomFieldValue = {
        custom_field_definition_id: 'field-1',
        value: null as any,
      }

      mockCustomFieldService.getDefinitionById.mockResolvedValue(definition)

      // Act
      const result = await validateCustomFieldValue(value, mockCustomFieldService)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('is required')
    })
  })
})
