/**
 * Custom Fields Feature - Entity Tests
 *
 * Tests Zod schemas for data validation.
 * IMPORTANT: Uses .safeParse() for all validations (never .parse()).
 *
 * Created by: Test Agent
 * Date: 2025-01-21
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { describe, it, expect } from 'vitest';
import {
  CustomFieldDefinitionSchema,
  CustomFieldDefinitionCreateSchema,
  CustomFieldDefinitionUpdateSchema,
  CustomFieldDefinitionReorderSchema,
  CustomFieldTypeEnum,
  SelectFieldConfigSchema,
  NumberFieldConfigSchema,
  TextFieldConfigSchema,
  DateFieldConfigSchema,
  CheckboxFieldConfigSchema,
  getCustomFieldValueSchema,
  isCustomFieldDefinition,
  isCustomFieldDefinitionCreate,
  isValidCustomFieldType,
  isValidCustomFieldConfig,
} from './entities';

// ============================================================================
// CUSTOM FIELD TYPE ENUM TESTS
// ============================================================================

describe('CustomFieldTypeEnum', () => {
  it('accepts all valid field types', () => {
    const validTypes = ['text', 'number', 'date', 'select', 'checkbox'];

    validTypes.forEach((type) => {
      const result = CustomFieldTypeEnum.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid field type', () => {
    const result = CustomFieldTypeEnum.safeParse('boolean');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('text, number, date, select, or checkbox');
    }
  });
});

// ============================================================================
// CONFIG SCHEMA TESTS
// ============================================================================

describe('SelectFieldConfigSchema', () => {
  it('accepts valid select config with options', () => {
    const validConfig = {
      options: ['Option 1', 'Option 2', 'Option 3'],
      multiple: false,
    };

    const result = SelectFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('accepts select config with multiple: true', () => {
    const validConfig = {
      options: ['Red', 'Green', 'Blue'],
      multiple: true,
    };

    const result = SelectFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('applies default multiple: false', () => {
    const validConfig = {
      options: ['Yes', 'No'],
    };

    const result = SelectFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.multiple).toBe(false);
    }
  });

  it('rejects select config with empty options array', () => {
    const invalidConfig = {
      options: [],
      multiple: false,
    };

    const result = SelectFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_small');
      expect(result.error.issues[0].path).toEqual(['options']);
      expect(result.error.issues[0].message).toContain('at least one option');
    }
  });

  it('rejects select config with option exceeding max length', () => {
    const invalidConfig = {
      options: ['Valid', 'x'.repeat(101)],
      multiple: false,
    };

    const result = SelectFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_big');
      expect(result.error.issues[0].path[0]).toBe('options');
    }
  });
});

describe('NumberFieldConfigSchema', () => {
  it('accepts valid number config with min and max', () => {
    const validConfig = {
      min: 0,
      max: 100,
      step: 1,
    };

    const result = NumberFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('accepts number config with only min', () => {
    const validConfig = {
      min: 0,
    };

    const result = NumberFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('accepts number config with only max', () => {
    const validConfig = {
      max: 100,
    };

    const result = NumberFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('rejects number config where min >= max', () => {
    const invalidConfig = {
      min: 100,
      max: 50,
    };

    const result = NumberFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Minimum value must be less than maximum value');
    }
  });

  it('rejects number config with non-positive step', () => {
    const invalidConfig = {
      min: 0,
      max: 100,
      step: 0,
    };

    const result = NumberFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_small');
      expect(result.error.issues[0].path).toEqual(['step']);
    }
  });
});

describe('TextFieldConfigSchema', () => {
  it('accepts valid text config', () => {
    const validConfig = {
      max_length: 500,
      multiline: true,
    };

    const result = TextFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('applies default multiline: false', () => {
    const validConfig = {
      max_length: 100,
    };

    const result = TextFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.multiline).toBe(false);
    }
  });

  it('rejects text config with max_length exceeding 10000', () => {
    const invalidConfig = {
      max_length: 10001,
    };

    const result = TextFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_big');
      expect(result.error.issues[0].path).toEqual(['max_length']);
    }
  });

  it('rejects text config with non-positive max_length', () => {
    const invalidConfig = {
      max_length: 0,
    };

    const result = TextFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_small');
      expect(result.error.issues[0].path).toEqual(['max_length']);
    }
  });
});

describe('DateFieldConfigSchema', () => {
  it('accepts valid date config with min and max', () => {
    const validConfig = {
      min: new Date('2025-01-01'),
      max: new Date('2025-12-31'),
    };

    const result = DateFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('rejects date config where min >= max', () => {
    const invalidConfig = {
      min: new Date('2025-12-31'),
      max: new Date('2025-01-01'),
    };

    const result = DateFieldConfigSchema.safeParse(invalidConfig);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Minimum date must be before maximum date');
    }
  });

  it('coerces string dates to Date objects', () => {
    const validConfig = {
      min: '2025-01-01',
      max: '2025-12-31',
    };

    const result = DateFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.min).toBeInstanceOf(Date);
      expect(result.data.max).toBeInstanceOf(Date);
    }
  });
});

describe('CheckboxFieldConfigSchema', () => {
  it('accepts valid checkbox config with default', () => {
    const validConfig = {
      default: true,
    };

    const result = CheckboxFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });

  it('accepts empty checkbox config', () => {
    const validConfig = {};

    const result = CheckboxFieldConfigSchema.safeParse(validConfig);

    expect(result.success).toBe(true);
  });
});

// ============================================================================
// CUSTOM FIELD DEFINITION SCHEMA TESTS
// ============================================================================

describe('CustomFieldDefinitionSchema', () => {
  describe('valid data', () => {
    it('accepts valid select-type field', () => {
      const validField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Priority',
        field_type: 'select',
        config: {
          options: ['P0', 'P1', 'P2', 'P3'],
          multiple: false,
        },
        required: false,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = CustomFieldDefinitionSchema.safeParse(validField);

      expect(result.success).toBe(true);
    });

    it('accepts valid number-type field', () => {
      const validField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Story Points',
        field_type: 'number',
        config: {
          min: 0,
          max: 100,
          step: 1,
        },
        required: true,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = CustomFieldDefinitionSchema.safeParse(validField);

      expect(result.success).toBe(true);
    });

    it('accepts field with config as null', () => {
      const validField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Simple Checkbox',
        field_type: 'checkbox',
        config: null,
        required: false,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = CustomFieldDefinitionSchema.safeParse(validField);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('rejects field with name too short (1 char)', () => {
      const invalidField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'A',
        field_type: 'text',
        config: null,
        required: false,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = CustomFieldDefinitionSchema.safeParse(invalidField);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects field with name too long (101 chars)', () => {
      const invalidField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'x'.repeat(101),
        field_type: 'text',
        config: null,
        required: false,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = CustomFieldDefinitionSchema.safeParse(invalidField);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects field with invalid field_type', () => {
      const invalidField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Field',
        field_type: 'dropdown', // Invalid type
        config: null,
        required: false,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = CustomFieldDefinitionSchema.safeParse(invalidField);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
        expect(result.error.issues[0].path).toEqual(['field_type']);
      }
    });
  });
});

describe('CustomFieldDefinitionCreateSchema', () => {
  it('accepts data without auto-generated position', () => {
    const createData = {
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Sprint',
      field_type: 'select',
      config: {
        options: ['Sprint 23', 'Sprint 24', 'Sprint 25'],
        multiple: false,
      },
      required: false,
    };

    const result = CustomFieldDefinitionCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
  });

  it('omits position field (auto-assigned)', () => {
    const createData = {
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Sprint',
      field_type: 'select',
      config: {},
      position: 0, // Should be auto-assigned
    };

    const result = CustomFieldDefinitionCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('position');
    }
  });
});

describe('CustomFieldDefinitionUpdateSchema', () => {
  it('accepts partial data (only name)', () => {
    const updateData = {
      name: 'Updated Field Name',
    };

    const result = CustomFieldDefinitionUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = CustomFieldDefinitionUpdateSchema.safeParse({});

    expect(result.success).toBe(true);
  });
});

describe('CustomFieldDefinitionReorderSchema', () => {
  it('accepts valid reorder data', () => {
    const reorderData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      position: 2,
    };

    const result = CustomFieldDefinitionReorderSchema.safeParse(reorderData);

    expect(result.success).toBe(true);
  });

  it('rejects reorder with negative position', () => {
    const reorderData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      position: -1,
    };

    const result = CustomFieldDefinitionReorderSchema.safeParse(reorderData);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// GET CUSTOM FIELD VALUE SCHEMA TESTS (CRITICAL)
// ============================================================================

describe('getCustomFieldValueSchema', () => {
  describe('text field', () => {
    it('returns schema that accepts valid text', () => {
      const schema = getCustomFieldValueSchema('text', { max_length: 100 }, false);
      const result = schema.safeParse('Valid text');

      expect(result.success).toBe(true);
    });

    it('returns schema that rejects text exceeding max_length', () => {
      const schema = getCustomFieldValueSchema('text', { max_length: 10 }, false);
      const result = schema.safeParse('x'.repeat(11));

      expect(result.success).toBe(false);
    });

    it('returns optional schema when required is false', () => {
      const schema = getCustomFieldValueSchema('text', null, false);
      const result = schema.safeParse(null);

      expect(result.success).toBe(true);
    });
  });

  describe('number field', () => {
    it('returns schema that accepts valid number', () => {
      const schema = getCustomFieldValueSchema('number', { min: 0, max: 100 }, false);
      const result = schema.safeParse(50);

      expect(result.success).toBe(true);
    });

    it('returns schema that rejects number below min', () => {
      const schema = getCustomFieldValueSchema('number', { min: 0, max: 100 }, false);
      const result = schema.safeParse(-1);

      expect(result.success).toBe(false);
    });

    it('returns schema that rejects number above max', () => {
      const schema = getCustomFieldValueSchema('number', { min: 0, max: 100 }, false);
      const result = schema.safeParse(101);

      expect(result.success).toBe(false);
    });

    it('returns required schema when required is true', () => {
      const schema = getCustomFieldValueSchema('number', null, true);
      const result = schema.safeParse(null);

      expect(result.success).toBe(false);
    });
  });

  describe('date field', () => {
    it('returns schema that accepts valid date', () => {
      const schema = getCustomFieldValueSchema(
        'date',
        {
          min: new Date('2025-01-01'),
          max: new Date('2025-12-31'),
        },
        false
      );
      const result = schema.safeParse(new Date('2025-06-15'));

      expect(result.success).toBe(true);
    });

    it('returns schema that rejects date before min', () => {
      const schema = getCustomFieldValueSchema(
        'date',
        {
          min: new Date('2025-01-01'),
          max: new Date('2025-12-31'),
        },
        false
      );
      const result = schema.safeParse(new Date('2024-12-31'));

      expect(result.success).toBe(false);
    });

    it('returns schema that rejects date after max', () => {
      const schema = getCustomFieldValueSchema(
        'date',
        {
          min: new Date('2025-01-01'),
          max: new Date('2025-12-31'),
        },
        false
      );
      const result = schema.safeParse(new Date('2026-01-01'));

      expect(result.success).toBe(false);
    });
  });

  describe('select field (single)', () => {
    it('returns schema that accepts valid option', () => {
      const schema = getCustomFieldValueSchema(
        'select',
        {
          options: ['P0', 'P1', 'P2'],
          multiple: false,
        },
        false
      );
      const result = schema.safeParse('P1');

      expect(result.success).toBe(true);
    });

    it('returns schema that rejects invalid option', () => {
      const schema = getCustomFieldValueSchema(
        'select',
        {
          options: ['P0', 'P1', 'P2'],
          multiple: false,
        },
        false
      );
      const result = schema.safeParse('P99');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('throws error when select config has no options', () => {
      expect(() => {
        getCustomFieldValueSchema('select', { options: [] }, false);
      }).toThrow('Select field must have options configured');
    });
  });

  describe('select field (multiple)', () => {
    it('returns schema that accepts array of valid options', () => {
      const schema = getCustomFieldValueSchema(
        'select',
        {
          options: ['Red', 'Green', 'Blue'],
          multiple: true,
        },
        false
      );
      const result = schema.safeParse(['Red', 'Blue']);

      expect(result.success).toBe(true);
    });

    it('returns schema that rejects array with invalid option', () => {
      const schema = getCustomFieldValueSchema(
        'select',
        {
          options: ['Red', 'Green', 'Blue'],
          multiple: true,
        },
        false
      );
      const result = schema.safeParse(['Red', 'Yellow']);

      expect(result.success).toBe(false);
    });
  });

  describe('checkbox field', () => {
    it('returns schema that accepts boolean', () => {
      const schema = getCustomFieldValueSchema('checkbox', null, false);

      const result1 = schema.safeParse(true);
      const result2 = schema.safeParse(false);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('returns schema that rejects non-boolean', () => {
      const schema = getCustomFieldValueSchema('checkbox', null, false);
      const result = schema.safeParse('true');

      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// TYPE GUARDS TESTS
// ============================================================================

describe('Type Guards', () => {
  it('isCustomFieldDefinition returns true for valid field', () => {
    const validField = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Story Points',
      field_type: 'number',
      config: null,
      required: false,
      position: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(isCustomFieldDefinition(validField)).toBe(true);
  });

  it('isCustomFieldDefinition returns false for invalid field', () => {
    const invalidField = {
      id: 'not-a-uuid',
      name: 'Test',
    };

    expect(isCustomFieldDefinition(invalidField)).toBe(false);
  });

  it('isCustomFieldDefinitionCreate returns true for valid create data', () => {
    const createData = {
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Priority',
      field_type: 'select',
      config: { options: ['P0', 'P1'] },
    };

    expect(isCustomFieldDefinitionCreate(createData)).toBe(true);
  });

  it('isValidCustomFieldType returns true for valid types', () => {
    expect(isValidCustomFieldType('text')).toBe(true);
    expect(isValidCustomFieldType('number')).toBe(true);
    expect(isValidCustomFieldType('date')).toBe(true);
    expect(isValidCustomFieldType('select')).toBe(true);
    expect(isValidCustomFieldType('checkbox')).toBe(true);
  });

  it('isValidCustomFieldType returns false for invalid type', () => {
    expect(isValidCustomFieldType('dropdown')).toBe(false);
  });

  it('isValidCustomFieldConfig validates text config', () => {
    const validConfig = { max_length: 500, multiline: true };
    const invalidConfig = { max_length: 10001 };

    expect(isValidCustomFieldConfig('text', validConfig)).toBe(true);
    expect(isValidCustomFieldConfig('text', invalidConfig)).toBe(false);
  });

  it('isValidCustomFieldConfig validates number config', () => {
    const validConfig = { min: 0, max: 100 };
    const invalidConfig = { min: 100, max: 50 };

    expect(isValidCustomFieldConfig('number', validConfig)).toBe(true);
    expect(isValidCustomFieldConfig('number', invalidConfig)).toBe(false);
  });

  it('isValidCustomFieldConfig validates select config', () => {
    const validConfig = { options: ['A', 'B'], multiple: false };
    const invalidConfig = { options: [], multiple: false };

    expect(isValidCustomFieldConfig('select', validConfig)).toBe(true);
    expect(isValidCustomFieldConfig('select', invalidConfig)).toBe(false);
  });
});
