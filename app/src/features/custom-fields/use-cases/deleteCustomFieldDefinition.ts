/**
 * deleteCustomFieldDefinition Use Case
 *
 * Deletes a custom field definition with cleanup options.
 *
 * Business Logic:
 * - Validates field definition ID
 * - Verifies field exists
 * - Checks if field has values in tasks
 * - Optionally cleans up values from tasks
 * - Requires force flag to delete field with existing values
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { CustomFieldService } from '../services/custom-field.service';
import type { TaskService } from '../../tasks/services/task.service';

/**
 * Options for delete operation
 */
export interface DeleteOptions {
  cleanupTaskValues?: boolean; // Remove values from all tasks
  force?: boolean; // Delete even if field is required or has values
  authContext?: {
    userId: string;
    organizationIds: string[];
    role?: 'admin' | 'member';
  };
}

/**
 * Result of delete operation
 */
export interface DeleteResult {
  affectedTasksCount?: number;
}

/**
 * Deletes a custom field definition
 *
 * @param fieldDefinitionId - ID of field definition to delete
 * @param customFieldService - Custom field data service
 * @param taskService - Task data service (for cleanup)
 * @param options - Delete options
 * @throws Error if field not found or has values without force flag
 * @returns Delete result with affected tasks count
 */
export async function deleteCustomFieldDefinition(
  fieldDefinitionId: string,
  customFieldService: CustomFieldService,
  taskService?: TaskService,
  options?: DeleteOptions
): Promise<DeleteResult | void> {
  // 1. Validate field definition ID
  if (!fieldDefinitionId || typeof fieldDefinitionId !== 'string') {
    throw new Error('INVALID_FIELD_DEFINITION_ID');
  }

  // 2. Verify field definition exists
  const fieldDef = await customFieldService.getById(fieldDefinitionId);

  if (!fieldDef) {
    throw new Error('CUSTOM_FIELD_NOT_FOUND');
  }

  // 3. Authorization check
  if (options?.authContext) {
    const { organizationIds, role } = options.authContext;

    // Check organization access
    if (!organizationIds.includes(fieldDef.organization_id)) {
      throw new Error('UNAUTHORIZED');
    }

    // Only admins can delete custom fields
    if (role && role !== 'admin') {
      throw new Error('FORBIDDEN');
    }
  }

  // 4. Prevent deletion of required fields (unless force flag)
  if (fieldDef.required && !options?.force) {
    throw new Error('CANNOT_DELETE_REQUIRED_FIELD');
  }

  // 5. Check if field has values in tasks (if task service provided)
  let affectedTasksCount = 0;

  if (taskService) {
    const allTasks = await taskService.list({});
    const tasksWithField = allTasks.filter(
      (task) => task.custom_fields_values && fieldDefinitionId in task.custom_fields_values
    );

    affectedTasksCount = tasksWithField.length;

    // 6. Prevent deletion if field is in use (unless cleanupTaskValues or force)
    if (affectedTasksCount > 0 && !options?.cleanupTaskValues && !options?.force) {
      throw new Error('FIELD_IN_USE');
    }

    // 7. Cleanup values from tasks if requested
    if (options?.cleanupTaskValues && affectedTasksCount > 0) {
      for (const task of tasksWithField) {
        const updatedValues = { ...task.custom_fields_values };
        delete updatedValues[fieldDefinitionId];

        await taskService.update(task.id, {
          custom_fields_values: updatedValues,
        });
      }
    }
  }

  // 8. Delete field definition via service
  try {
    await customFieldService.delete(fieldDefinitionId);
  } catch (error) {
    throw new Error('Failed to delete custom field');
  }

  // 9. Return result with affected tasks count (if cleanup was performed)
  if (options?.cleanupTaskValues && affectedTasksCount > 0) {
    return { affectedTasksCount };
  }
}
