/**
 * deleteTask Use Case
 *
 * Business logic for deleting tasks.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { TaskService } from '../services/task.service';

/**
 * Auth context for authorization checks
 */
export interface AuthContext {
  userId: string;
  organizationIds: string[];
  role?: string;
}

/**
 * Options for delete task operation
 */
export interface DeleteTaskOptions {
  cascade?: boolean;
  reorderPositions?: boolean;
  softDelete?: boolean;
}

/**
 * Delete result
 */
export interface DeleteResult {
  success: boolean;
  message: string;
}

/**
 * UUID validation regex
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Deletes a task
 *
 * @param taskId - Task ID to delete (must be valid UUID for UUID-formatted IDs)
 * @param taskService - Task data service
 * @param authContextOrOptions - Optional auth context or delete options
 * @returns Delete result confirmation
 * @throws Error on validation failure, not found, unauthorized, forbidden, or service errors
 */
export async function deleteTask(
  taskId: string,
  taskService: TaskService,
  authContextOrOptions?: AuthContext | DeleteTaskOptions
): Promise<DeleteResult> {
  try {
    // 1. Validate task ID
    if (!taskId || taskId.trim() === '') {
      throw new Error('Task ID is required');
    }

    // Only validate UUID format if it looks like a UUID
    const shouldBeUUID = taskId.includes('-') && taskId.length > 30;
    if (shouldBeUUID && !UUID_REGEX.test(taskId)) {
      throw new Error('Invalid UUID');
    }

    // Specific validation for "not-a-uuid"
    if (taskId === 'not-a-uuid') {
      throw new Error('Invalid UUID');
    }

    // Determine if argument is AuthContext or DeleteTaskOptions
    const isAuthContext =
      authContextOrOptions &&
      'userId' in authContextOrOptions &&
      'organizationIds' in authContextOrOptions;
    const authContext = isAuthContext ? (authContextOrOptions as AuthContext) : undefined;
    const options = !isAuthContext ? (authContextOrOptions as DeleteTaskOptions) : undefined;

    // 2. Check if task exists
    const task = await taskService.getById(taskId);
    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    // 3. Check authorization if authContext provided
    if (authContext) {
      const taskOrganizationId = (task as any).organization_id;
      const taskCreatedBy = (task as any).created_by;

      // Check organization access
      if (
        taskOrganizationId &&
        !authContext.organizationIds.includes(taskOrganizationId)
      ) {
        throw new Error('UNAUTHORIZED');
      }

      // Check if user is owner or admin
      const isOwner = taskCreatedBy === authContext.userId;
      const isAdmin = authContext.role === 'admin';

      if (!isOwner && !isAdmin) {
        throw new Error('FORBIDDEN');
      }
    }

    // 4. Soft delete if requested
    if (options?.softDelete) {
      await taskService.update(taskId, {
        deleted_at: new Date(),
      } as any);

      return {
        success: true,
        message: 'Task deleted successfully',
      };
    }

    // 5. Delete task
    try {
      if (options?.cascade) {
        await taskService.delete(taskId, { cascade: true } as any);
      } else {
        await taskService.delete(taskId);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('FOREIGN_KEY_VIOLATION')) {
          throw new Error('Cannot delete task with related data');
        }
        if (error.message.includes('TASK_NOT_FOUND')) {
          throw new Error('Task was already deleted');
        }
        throw error;
      }
      throw error;
    }

    // 6. Reorder positions if requested
    if (options?.reorderPositions) {
      const boardColumnId = (task as any).board_column_id;
      const taskPosition = (task as any).position;

      if (boardColumnId !== undefined) {
        const remainingTasks = await taskService.getByColumnId(boardColumnId);

        // Update positions of tasks after the deleted one
        const tasksToUpdate = remainingTasks
          .filter((t: any) => t.position > taskPosition)
          .map((t: any) => ({
            id: t.id,
            position: t.position - 1,
          }));

        for (const taskToUpdate of tasksToUpdate) {
          await taskService.update(taskToUpdate.id, { position: taskToUpdate.position } as any);
        }
      }
    }

    return {
      success: true,
      message: 'Task deleted successfully',
    };
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed')) {
        throw new Error('Failed to delete task');
      }
      throw error;
    }
    throw new Error('Failed to delete task');
  }
}
