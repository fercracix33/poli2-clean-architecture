/**
 * updateCustomFieldDefinition Use Case
 *
 * Updates an existing custom field definition with impact analysis.
 *
 * Business Logic:
 * - Validates input using Zod schema
 * - Verifies field definition exists
 * - Validates config if changing field_type or config
 * - Analyzes impact on existing task values (optional)
 * - Prevents field_type changes when data exists
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import {
  CustomFieldDefinitionUpdateSchema,
  type CustomFieldDefinitionUpdate,
  type CustomFieldDefinition,
  TextFieldConfigSchema,
  NumberFieldConfigSchema,
  DateFieldConfigSchema,
  SelectFieldConfigSchema,
  CheckboxFieldConfigSchema,
} from '../entities';
import type { CustomFieldService } from '../services/custom-field.service';
import type { TaskService } from '../../tasks/services/task.service';

/**
 * Options for update operation
 */
export interface UpdateOptions {
  validateImpact?: boolean; // Check if update breaks existing values (deprecated)
  validateExistingValues?: boolean; // Check if existing values are valid with new config
  clearInvalidValues?: boolean; // Clear invalid values when config changes
  authContext?: {
    userId: string;
    organizationIds: string[];
  };
}

/**
 * Updates a custom field definition
 *
 * @param fieldDefinitionId - ID of field definition to update
 * @param data - Update data
 * @param customFieldService - Custom field data service
 * @param taskService - Task data service (for impact analysis)
 * @param options - Update options
 * @returns Updated field definition or null if not found
 * @throws Error if validation fails or update would break existing data
 */
export async function updateCustomFieldDefinition(
  fieldDefinitionId: string,
  data: CustomFieldDefinitionUpdate,
  customFieldService: CustomFieldService,
  taskService?: TaskService,
  options?: UpdateOptions
): Promise<CustomFieldDefinition | null> {
  // 1. Validate field definition ID
  if (!fieldDefinitionId || typeof fieldDefinitionId !== 'string') {
    throw new Error('INVALID_FIELD_DEFINITION_ID');
  }

  // 2. Validate input using Zod schema
  const validationResult = CustomFieldDefinitionUpdateSchema.safeParse(data);

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new Error(firstError?.message || 'Validation failed');
  }

  const validData = validationResult.data;

  // 3. Get existing field definition
  const existingField = await customFieldService.getById(fieldDefinitionId);

  if (!existingField) {
    throw new Error('CUSTOM_FIELD_NOT_FOUND');
  }

  // 4. Authorization check
  if (options?.authContext) {
    const { organizationIds } = options.authContext;

    if (!organizationIds.includes(existingField.organization_id)) {
      throw new Error('UNAUTHORIZED');
    }
  }

  // 5. Prevent field_type changes (ALWAYS PROHIBITED)
  if (validData.field_type && validData.field_type !== existingField.field_type) {
    throw new Error('CANNOT_CHANGE_FIELD_TYPE');
  }

  // 6. Validate config if changing config
  if (validData.field_type || validData.config) {
    const finalFieldType = validData.field_type || existingField.field_type;
    const finalConfig = validData.config
      ? { ...existingField.config, ...validData.config }
      : existingField.config;

    const configValidation = validateConfigForFieldType(finalFieldType, finalConfig);

    if (!configValidation.success) {
      throw new Error(configValidation.error);
    }
  }

  // 7. Validate existing values or clear invalid ones (if enabled)
  if ((options?.validateExistingValues || options?.clearInvalidValues) && taskService) {
    const tasksWithField = await taskService.list({});
    const affectedTasks = tasksWithField.filter(
      (task) => task.custom_fields_values && fieldDefinitionId in task.custom_fields_values
    );

    if (affectedTasks.length > 0) {
      const finalConfig = validData.config
        ? { ...existingField.config, ...validData.config }
        : existingField.config;

      // Check for invalid values based on new config
      if (existingField.field_type === 'number' && finalConfig?.max !== undefined) {
        const invalidTasks = affectedTasks.filter((task) => {
          const value = task.custom_fields_values[fieldDefinitionId];
          return typeof value === 'number' && value > finalConfig.max;
        });

        if (invalidTasks.length > 0 && options.validateExistingValues) {
          throw new Error('EXISTING_VALUES_INVALID');
        }
      }

      // Clear invalid select option values
      if (
        existingField.field_type === 'select' &&
        finalConfig?.options &&
        options.clearInvalidValues
      ) {
        const validOptions = new Set(finalConfig.options);

        for (const task of affectedTasks) {
          const value = task.custom_fields_values[fieldDefinitionId];
          if (typeof value === 'string' && !validOptions.has(value)) {
            // Remove invalid value
            const updatedValues = { ...task.custom_fields_values };
            delete updatedValues[fieldDefinitionId];

            await taskService.update(task.id, {
              custom_fields_values: updatedValues,
            });
          }
        }
      }
    }
  }

  // 6. Sanitize data
  const sanitizedData: CustomFieldDefinitionUpdate = {};

  if (validData.name !== undefined) {
    sanitizedData.name = validData.name.trim();
  }

  if (validData.config !== undefined) {
    sanitizedData.config = validData.config;
  }

  if (validData.required !== undefined) {
    sanitizedData.required = validData.required;
  }

  // 7. Update field definition via service
  const updatedField = await customFieldService.update(fieldDefinitionId, sanitizedData);

  return updatedField;
}

/**
 * Validates configuration object against field type
 */
function validateConfigForFieldType(
  fieldType: 'text' | 'number' | 'date' | 'select' | 'checkbox',
  config: Record<string, any> | null | undefined
): { success: boolean; error?: string } {
  if (!config) {
    return { success: true };
  }

  try {
    switch (fieldType) {
      case 'text': {
        const result = TextFieldConfigSchema.safeParse(config);
        if (!result.success) {
          return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid text field config',
          };
        }
        return { success: true };
      }

      case 'number': {
        const result = NumberFieldConfigSchema.safeParse(config);
        if (!result.success) {
          return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid number field config',
          };
        }
        return { success: true };
      }

      case 'date': {
        const result = DateFieldConfigSchema.safeParse(config);
        if (!result.success) {
          return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid date field config',
          };
        }
        return { success: true };
      }

      case 'select': {
        const result = SelectFieldConfigSchema.safeParse(config);
        if (!result.success) {
          return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid select field config',
          };
        }
        return { success: true };
      }

      case 'checkbox': {
        const result = CheckboxFieldConfigSchema.safeParse(config);
        if (!result.success) {
          return {
            success: false,
            error: result.error.errors[0]?.message || 'Invalid checkbox field config',
          };
        }
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown field type: ${fieldType}` };
    }
  } catch (error) {
    return { success: false, error: 'Config validation failed' };
  }
}
