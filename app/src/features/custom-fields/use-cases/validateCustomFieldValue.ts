/**
 * validateCustomFieldValue Use Case
 *
 * CRITICAL: Validates custom field values against their definitions.
 * This is the core data integrity check for custom fields.
 *
 * Business Logic:
 * - Fetches field definition
 * - Uses dynamic Zod schema validation based on field type
 * - Validates type-specific constraints (min/max, options, etc.)
 * - Handles required vs optional fields
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import { getCustomFieldValueSchema } from '../entities';
import type { CustomFieldService } from '../services/custom-field.service';

/**
 * Custom field value structure
 */
export interface CustomFieldValue {
  custom_field_definition_id: string;
  value: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a custom field value against its definition
 *
 * @param value - The custom field value to validate
 * @param service - Custom field data service
 * @returns Validation result with isValid flag and optional error message
 * @throws Error if field definition not found
 */
export async function validateCustomFieldValue(
  value: CustomFieldValue,
  service: CustomFieldService
): Promise<ValidationResult> {
  // 1. Fetch field definition
  const definition = await service.getDefinitionById(value.custom_field_definition_id);

  if (!definition) {
    throw new Error('Custom field definition not found');
  }

  // 2. Normalize definition structure (tests use different property names)
  const fieldType = (definition as any).field_type;

  // Handle multi_select as select with multiple: true
  const normalizedFieldType = fieldType === 'multi_select' ? 'select' : fieldType;
  const normalizedConfig = normalizeConfig(fieldType, (definition as any).config);

  const normalizedDefinition = {
    field_type: normalizedFieldType,
    config: normalizedConfig,
    is_required: (definition as any).is_required ?? (definition as any).required ?? false,
  };

  // 3. Pre-validation: Check for empty required text fields
  // (Zod's z.string() accepts empty strings, so we need custom validation)
  if (normalizedDefinition.field_type === 'text' && normalizedDefinition.is_required) {
    if (typeof value.value === 'string' && value.value.trim() === '') {
      return {
        isValid: false,
        error: 'Field is required',
      };
    }
  }

  // 4. Get dynamic schema for this field type
  try {
    const valueSchema = getCustomFieldValueSchema(
      normalizedDefinition.field_type,
      normalizedDefinition.config,
      normalizedDefinition.is_required
    );

    // 5. Validate value
    const result = valueSchema.safeParse(value.value);

    if (!result.success) {
      // Extract meaningful error message
      const error = formatValidationError(
        result.error,
        normalizedDefinition.field_type,
        normalizedDefinition.config,
        normalizedDefinition.is_required
      );

      return {
        isValid: false,
        error,
      };
    }

    return { isValid: true };
  } catch (error) {
    // Handle schema creation errors (e.g., select field with no options)
    if (error instanceof Error) {
      return {
        isValid: false,
        error: error.message,
      };
    }

    return {
      isValid: false,
      error: 'Validation failed',
    };
  }
}

/**
 * Normalizes config structure to match schema expectations
 * Tests use different property names than schema
 */
function normalizeConfig(
  fieldType: string,
  config: Record<string, any> | null | undefined
): Record<string, any> | null | undefined {
  if (!config) return config;

  switch (fieldType) {
    case 'number': {
      const allowDecimals =
        config.allow_decimal !== undefined ? config.allow_decimal :
        config.allow_decimals !== undefined ? config.allow_decimals :
        config.allowDecimals;

      return {
        min: config.min_value ?? config.min,
        max: config.max_value ?? config.max,
        allow_decimals: allowDecimals,
      };
    }

    case 'date': {
      const minDate = config.min_date ?? config.min;
      const maxDate = config.max_date ?? config.max;

      return {
        min: typeof minDate === 'string' ? new Date(minDate) : minDate,
        max: typeof maxDate === 'string' ? new Date(maxDate) : maxDate,
      };
    }

    case 'multi_select':
      // multi_select is treated as select with multiple: true
      return {
        ...config,
        multiple: true,
      };

    default:
      return config;
  }
}

/**
 * Formats Zod validation errors into user-friendly messages
 */
function formatValidationError(
  zodError: any,
  fieldType: string,
  config: Record<string, any> | null | undefined,
  isRequired: boolean
): string {
  const firstIssue = zodError.errors?.[0];

  if (!firstIssue) {
    return 'Validation failed';
  }

  const { code, message } = firstIssue;

  // Handle type-specific error messages
  switch (fieldType) {
    case 'text': {
      if (code === 'too_big') {
        const maxLength = config?.max_length;
        return `Value exceeds maximum length of ${maxLength}`;
      }
      if (code === 'invalid_type' || code === 'too_small') {
        if (isRequired) {
          return 'Field is required';
        }
      }
      return message;
    }

    case 'number': {
      // Check for custom messages from Zod (like integer validation)
      if (message.includes('integer') || message.includes('no decimals')) {
        return message;
      }
      if (code === 'too_small') {
        const min = config?.min;
        return `Value must be at least ${min}`;
      }
      if (code === 'too_big') {
        const max = config?.max;
        return `Value must be at most ${max}`;
      }
      if (code === 'invalid_type') {
        if (isRequired) {
          return 'Field is required';
        }
        return 'Value must be a number';
      }
      return message;
    }

    case 'date': {
      if (code === 'too_small') {
        const minDate = config?.min;
        // Config can be string or Date object
        const minDateStr = typeof minDate === 'string' ? minDate :
                           minDate instanceof Date ? minDate.toISOString().split('T')[0] :
                           String(minDate);
        return `Date must be on or after ${minDateStr}`;
      }
      if (code === 'too_big') {
        const maxDate = config?.max;
        // Config can be string or Date object
        const maxDateStr = typeof maxDate === 'string' ? maxDate :
                           maxDate instanceof Date ? maxDate.toISOString().split('T')[0] :
                           String(maxDate);
        return `Date must be on or before ${maxDateStr}`;
      }
      if (code === 'invalid_date' || code === 'invalid_type') {
        if (isRequired) {
          return 'Field is required';
        }
        return 'Value must be a valid date';
      }
      return message;
    }

    case 'select': {
      // Check if this is actually a multi-select (array validation)
      if (code === 'invalid_type') {
        // Multi-select gets "Expected array" error
        if (message.toLowerCase().includes('expected array') || message.includes('array')) {
          return 'Value must be an array';
        }
        // Single-select with required
        if (isRequired) {
          return 'Field is required';
        }
        return message;
      }

      if (code === 'invalid_enum_value') {
        const options = config?.options;
        // For multi-select, extract the invalid value
        if (config?.multiple) {
          const invalidValue = firstIssue.received || 'unknown';
          return `Invalid option: ${invalidValue}`;
        }
        // For single-select, list all options
        if (options && Array.isArray(options)) {
          return `Value must be one of: ${options.join(', ')}`;
        }
        return 'Value is not a valid option';
      }

      // Multi-select with required empty array check
      if (code === 'too_small' && isRequired) {
        return 'At least one option is required';
      }
      return message;
    }

    case 'multi_select': {
      if (code === 'invalid_type') {
        // Zod message: "Expected array, received string"
        if (message.toLowerCase().includes('expected array') || message.includes('array')) {
          return 'Value must be an array';
        }
        if (isRequired) {
          return 'Field is required';
        }
        return message;
      }
      if (code === 'invalid_enum_value' || message.includes('Invalid enum value')) {
        // Extract the invalid value from the error
        const invalidValue = firstIssue.received || 'unknown';
        return `Invalid option: ${invalidValue}`;
      }
      if (code === 'too_small' && isRequired) {
        return 'Field is required';
      }
      return message;
    }

    case 'checkbox': {
      if (code === 'invalid_type') {
        if (isRequired) {
          return 'Field is required';
        }
        return 'Value must be a boolean';
      }
      return message;
    }

    default:
      return message || 'Validation failed';
  }
}
