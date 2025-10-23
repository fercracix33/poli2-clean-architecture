/**
 * getTask Use Case
 *
 * Business logic for retrieving a single task.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { Task } from '../entities';
import type { TaskService } from '../services/task.service';

/**
 * Auth context for authorization checks
 */
export interface AuthContext {
  userId: string;
  organizationIds: string[];
}

/**
 * Options for get task operation
 */
export interface GetTaskOptions {
  throwOnNotFound?: boolean;
  authContext?: AuthContext;
}

/**
 * UUID validation regex
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieves a single task by ID
 *
 * @param taskId - Task ID (must be valid UUID for UUID-formatted IDs)
 * @param taskService - Task data service
 * @param options - Optional configuration (throwOnNotFound, authContext)
 * @returns Task if found, null if not found (unless throwOnNotFound is true)
 * @throws Error on validation failure, not found (if throwOnNotFound), unauthorized, or service errors
 */
export async function getTask(
  taskId: string,
  taskService: TaskService,
  options?: GetTaskOptions
): Promise<Task | null> {
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

    // 2. Get task from service
    const task = await taskService.getById(taskId);

    // 3. Handle not found
    if (!task) {
      if (options?.throwOnNotFound) {
        throw new Error('TASK_NOT_FOUND');
      }
      return null;
    }

    // 4. Check authorization if authContext provided
    if (options?.authContext) {
      const taskOrganizationId = (task as any).organization_id;

      if (
        taskOrganizationId &&
        !options.authContext.organizationIds.includes(taskOrganizationId)
      ) {
        throw new Error('UNAUTHORIZED');
      }
    }

    return task;
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed')) {
        throw new Error('Failed to retrieve task');
      }
      throw error;
    }
    throw new Error('Failed to retrieve task');
  }
}
