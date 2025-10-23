/**
 * reorderCustomFieldDefinitions Use Case
 *
 * Reorders custom field definitions for display in UI.
 *
 * Business Logic:
 * - Validates reorder data (field_id + position pairs)
 * - Verifies board exists
 * - Validates positions are sequential (0, 1, 2, ...)
 * - Verifies all field IDs exist and belong to board
 * - Executes reorder operation via service
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import { z } from 'zod';
import type { CustomFieldService } from '../services/custom-field.service';
import type { CustomFieldDefinition } from '../entities';

/**
 * Schema for individual reorder item
 */
export const ReorderItemSchema = z.object({
  field_id: z.string().min(1),
  position: z.number().int().min(0),
});

export type ReorderItem = z.infer<typeof ReorderItemSchema>;

/**
 * Options for reorder operation
 */
export interface ReorderOptions {
  authContext?: {
    userId: string;
    organizationIds: string[];
  };
}

/**
 * Reorders custom field definitions
 *
 * @param boardId - Board ID
 * @param reorderData - Array of {field_id, position} pairs
 * @param service - Custom field data service
 * @param authContext - Authorization context (optional)
 * @returns Updated field definitions
 * @throws Error if validation fails, board not found, or positions invalid
 */
export async function reorderCustomFieldDefinitions(
  boardId: string,
  reorderData: ReorderItem[],
  service: CustomFieldService,
  authContext?: { userId: string; organizationIds: string[] }
): Promise<CustomFieldDefinition[]> {
  // 1. Validate board ID
  if (!boardId || typeof boardId !== 'string') {
    throw new Error('Invalid board_id');
  }

  // 2. Validate reorder data is not empty
  if (!reorderData || reorderData.length === 0) {
    throw new Error('Reorder data cannot be empty');
  }

  // 3. Validate each reorder item
  for (const item of reorderData) {
    const itemValidation = ReorderItemSchema.safeParse(item);

    if (!itemValidation.success) {
      // Check if it's a field_id error
      const fieldIdError = itemValidation.error.errors.find(
        (err) => err.path[0] === 'field_id'
      );

      if (fieldIdError) {
        throw new Error('Invalid field_id');
      }

      const firstError = itemValidation.error.errors[0];
      throw new Error(firstError?.message || 'Invalid position');
    }
  }

  // 4. Get current field definitions for this board
  const currentFields = await service.getByBoardId(boardId);

  if (currentFields.length === 0) {
    throw new Error('BOARD_HAS_NO_FIELDS');
  }

  // 5. Authorization check (if provided)
  if (authContext && currentFields.length > 0) {
    const { organizationIds } = authContext;
    const firstField = currentFields[0];

    if (!organizationIds.includes(firstField.organization_id)) {
      throw new Error('UNAUTHORIZED');
    }
  }

  // 6. Validate all field IDs exist and belong to this board
  const currentFieldIds = new Set(currentFields.map((field) => field.id));

  for (const item of reorderData) {
    if (!currentFieldIds.has(item.field_id)) {
      throw new Error('FIELD_NOT_IN_BOARD');
    }
  }

  // 7. Validate count matches (all fields must be included in reorder)
  if (reorderData.length !== currentFields.length) {
    throw new Error('Must provide positions for all fields');
  }

  // 8. Validate positions are sequential starting at 0
  const positions = reorderData.map((item) => item.position).sort((a, b) => a - b);

  // Check for duplicates
  const uniquePositions = new Set(positions);
  if (uniquePositions.size !== positions.length) {
    throw new Error('Duplicate positions detected');
  }

  // Check they start at 0
  if (positions[0] !== 0) {
    throw new Error('Positions must start at 0');
  }

  // Check they are sequential (0, 1, 2, ...)
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] !== i) {
      throw new Error('Positions must be sequential starting from 0');
    }
  }

  // 9. Execute reorder operation via service
  try {
    const updatedFields = await service.reorder(boardId, reorderData);
    return updatedFields;
  } catch (error) {
    throw new Error('Failed to reorder custom fields');
  }
}
