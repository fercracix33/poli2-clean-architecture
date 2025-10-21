/**
 * Custom Fields Feature - Entities
 *
 * Pure data contracts defined with Zod schemas.
 * NO business logic, NO external dependencies (except Zod).
 *
 * Created by: Architect Agent
 * Date: 2025-01-21
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { z } from 'zod';

// ============================================================================
// CUSTOM FIELD DEFINITION ENTITY
// ============================================================================

/**
 * Supported custom field types
 * Each type has specific configuration and validation rules
 */
export const CustomFieldTypeEnum = z.enum(['text', 'number', 'date', 'select', 'checkbox'], {
  errorMap: () => ({ message: 'Field type must be: text, number, date, select, or checkbox' })
});

// ============================================================================
// TYPE-SPECIFIC CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Configuration for select-type custom fields
 * Supports single or multiple selection
 */
export const SelectFieldConfigSchema = z.object({
  options: z.array(z.string().min(1).max(100))
    .min(1, 'Select field must have at least one option'),
  multiple: z.boolean().default(false), // true = multi-select
});

/**
 * Configuration for number-type custom fields
 * Optional min/max bounds and step increment
 */
export const NumberFieldConfigSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.min !== undefined && data.max !== undefined) {
      return data.min < data.max;
    }
    return true;
  },
  { message: 'Minimum value must be less than maximum value' }
);

/**
 * Configuration for text-type custom fields
 * Optional max length and multiline support
 */
export const TextFieldConfigSchema = z.object({
  max_length: z.number().int().positive().max(10000).optional(),
  multiline: z.boolean().default(false), // true = textarea, false = input
});

/**
 * Configuration for date-type custom fields
 * Optional min/max date bounds
 */
export const DateFieldConfigSchema = z.object({
  min: z.coerce.date().optional(),
  max: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.min && data.max) {
      return data.min < data.max;
    }
    return true;
  },
  { message: 'Minimum date must be before maximum date' }
);

/**
 * Configuration for checkbox-type custom fields
 * Optional default value
 */
export const CheckboxFieldConfigSchema = z.object({
  default: z.boolean().optional(),
});

// ============================================================================
// CUSTOM FIELD DEFINITION SCHEMA
// ============================================================================

/**
 * CustomFieldDefinition describes a user-defined metadata field.
 * Attached to a board, applies to all tasks in that board.
 *
 * The `config` field is type-specific and validated by the use case layer:
 * - text → TextFieldConfigSchema
 * - number → NumberFieldConfigSchema
 * - date → DateFieldConfigSchema
 * - select → SelectFieldConfigSchema
 * - checkbox → CheckboxFieldConfigSchema
 *
 * @example
 * const exampleField: CustomFieldDefinition = {
 *   id: "uuid-here",
 *   board_id: "board-uuid",
 *   name: "Story Points",
 *   field_type: "number",
 *   config: { min: 0, max: 100, step: 1 },
 *   required: false,
 *   position: 0,
 *   created_at: new Date(),
 *   updated_at: new Date(),
 * };
 */
export const CustomFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  board_id: z.string().uuid(),
  name: z.string()
    .min(2, 'Field name must be at least 2 characters')
    .max(100, 'Field name cannot exceed 100 characters'),
  field_type: CustomFieldTypeEnum,
  config: z.record(z.any()).optional().nullable(), // Type-specific config (validated by use case)
  required: z.boolean().default(false),
  position: z.number().int().nonnegative(), // Display order
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Schema for creating new CustomFieldDefinition
 * Position is auto-assigned by use case
 */
export const CustomFieldDefinitionCreateSchema = CustomFieldDefinitionSchema.omit({
  id: true,
  position: true, // Auto-assigned
  created_at: true,
  updated_at: true,
});

/**
 * Schema for updating existing CustomFieldDefinition
 * Only name, config, and required flag are editable
 */
export const CustomFieldDefinitionUpdateSchema = CustomFieldDefinitionSchema.pick({
  name: true,
  config: true,
  required: true,
}).partial();

/**
 * Schema for reordering custom fields (drag & drop in settings)
 */
export const CustomFieldDefinitionReorderSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
});

// ============================================================================
// CUSTOM FIELD VALUE VALIDATION
// ============================================================================

/**
 * Validates a custom field value against a field definition
 * Returns Zod schema for the specific field type
 *
 * Use case layer will call this to validate task's custom_fields_values
 */
export function getCustomFieldValueSchema(
  fieldType: CustomFieldType,
  config: Record<string, any> | null | undefined,
  required: boolean
): z.ZodTypeAny {
  const baseSchema = (() => {
    switch (fieldType) {
      case 'text': {
        const textConfig = config as z.infer<typeof TextFieldConfigSchema> | undefined;
        let schema = z.string();
        if (textConfig?.max_length) {
          schema = schema.max(textConfig.max_length);
        }
        return schema;
      }
      case 'number': {
        const numberConfig = config as z.infer<typeof NumberFieldConfigSchema> | undefined;
        let schema = z.number();
        if (numberConfig?.min !== undefined) {
          schema = schema.min(numberConfig.min);
        }
        if (numberConfig?.max !== undefined) {
          schema = schema.max(numberConfig.max);
        }
        return schema;
      }
      case 'date': {
        const dateConfig = config as z.infer<typeof DateFieldConfigSchema> | undefined;
        let schema = z.coerce.date();
        if (dateConfig?.min) {
          schema = schema.min(dateConfig.min);
        }
        if (dateConfig?.max) {
          schema = schema.max(dateConfig.max);
        }
        return schema;
      }
      case 'select': {
        const selectConfig = config as z.infer<typeof SelectFieldConfigSchema> | undefined;
        if (!selectConfig || !selectConfig.options.length) {
          throw new Error('Select field must have options configured');
        }
        if (selectConfig.multiple) {
          // Multi-select: array of enum values
          return z.array(z.enum(selectConfig.options as [string, ...string[]]));
        } else {
          // Single-select: single enum value
          return z.enum(selectConfig.options as [string, ...string[]]);
        }
      }
      case 'checkbox': {
        return z.boolean();
      }
      default:
        throw new Error(`Unknown field type: ${fieldType}`);
    }
  })();

  // Make optional if not required
  return required ? baseSchema : baseSchema.optional().nullable();
}

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;
export type CustomFieldDefinitionCreate = z.infer<typeof CustomFieldDefinitionCreateSchema>;
export type CustomFieldDefinitionUpdate = z.infer<typeof CustomFieldDefinitionUpdateSchema>;
export type CustomFieldDefinitionReorder = z.infer<typeof CustomFieldDefinitionReorderSchema>;
export type CustomFieldType = z.infer<typeof CustomFieldTypeEnum>;

// Type-specific config types
export type SelectFieldConfig = z.infer<typeof SelectFieldConfigSchema>;
export type NumberFieldConfig = z.infer<typeof NumberFieldConfigSchema>;
export type TextFieldConfig = z.infer<typeof TextFieldConfigSchema>;
export type DateFieldConfig = z.infer<typeof DateFieldConfigSchema>;
export type CheckboxFieldConfig = z.infer<typeof CheckboxFieldConfigSchema>;

// ============================================================================
// TYPE GUARDS (for runtime checking)
// ============================================================================

export function isCustomFieldDefinition(value: unknown): value is CustomFieldDefinition {
  return CustomFieldDefinitionSchema.safeParse(value).success;
}

export function isCustomFieldDefinitionCreate(value: unknown): value is CustomFieldDefinitionCreate {
  return CustomFieldDefinitionCreateSchema.safeParse(value).success;
}

export function isValidCustomFieldType(type: string): type is CustomFieldType {
  return ['text', 'number', 'date', 'select', 'checkbox'].includes(type);
}

/**
 * Validates field configuration against field type
 * Returns true if config is valid for the given field type
 */
export function isValidCustomFieldConfig(
  fieldType: CustomFieldType,
  config: Record<string, any> | null | undefined
): boolean {
  if (!config) return true; // Config is optional for some types

  try {
    switch (fieldType) {
      case 'text':
        return TextFieldConfigSchema.safeParse(config).success;
      case 'number':
        return NumberFieldConfigSchema.safeParse(config).success;
      case 'date':
        return DateFieldConfigSchema.safeParse(config).success;
      case 'select':
        return SelectFieldConfigSchema.safeParse(config).success;
      case 'checkbox':
        return CheckboxFieldConfigSchema.safeParse(config).success;
      default:
        return false;
    }
  } catch {
    return false;
  }
}
