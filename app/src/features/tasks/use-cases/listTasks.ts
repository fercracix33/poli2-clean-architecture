/**
 * listTasks Use Case
 *
 * Business logic for listing tasks with filters, search, and pagination.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { Task } from '../entities';
import type { TaskService } from '../services/task.service';

/**
 * Query parameters for listing tasks
 */
export interface TaskQueryParams {
  board_id?: string;
  board_column_id?: string;
  search?: string;
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  due_date_from?: string;
  due_date_to?: string;
  custom_field_filters?: Record<string, any>;
  unassigned?: boolean;
  overdue?: boolean;
  sort_by?: 'position' | 'due_date' | 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Auth context for filtering by organization
 */
export interface AuthContext {
  userId: string;
  organizationIds: string[];
}

/**
 * Lists tasks with filtering, search, sorting, and pagination
 *
 * @param query - Query parameters
 * @param taskService - Task data service
 * @param authContext - Optional auth context for organization filtering
 * @returns Array of tasks matching the query
 * @throws Error on validation failure or service errors
 */
export async function listTasks(
  query: TaskQueryParams,
  taskService: TaskService,
  authContext?: AuthContext
): Promise<Task[]> {
  try {
    // 1. Validate query
    // board_id or board_column_id is required UNLESS there's a search query or other filters
    const hasSearch = query.search !== undefined && query.search !== null;
    const hasBoardFilter = query.board_id || query.board_column_id;
    const hasOtherFilters = query.assigned_to || query.priority || query.tags?.length ||
                            query.custom_field_filters || query.unassigned !== undefined ||
                            query.overdue !== undefined || query.due_date_from || query.due_date_to;

    // If no board filter and no search/filters, throw the expected error message
    if (!hasBoardFilter && !hasSearch && !hasOtherFilters) {
      throw new Error('Either board_id or board_column_id is required');
    }

    // Validate sort_by
    const validSortFields = ['position', 'due_date', 'created_at', 'updated_at', 'priority'];
    if (query.sort_by && !validSortFields.includes(query.sort_by)) {
      throw new Error(`Invalid sort_by field: ${query.sort_by}`);
    }

    // Validate sort_order
    if (query.sort_order && !['asc', 'desc'].includes(query.sort_order)) {
      throw new Error(`Invalid sort_order: ${query.sort_order}`);
    }

    // Validate limit
    if (query.limit !== undefined && query.limit > 100) {
      throw new Error('limit must not exceed 100');
    }

    // 2. Sanitize search query
    let sanitizedQuery = { ...query };
    if (sanitizedQuery.search !== undefined) {
      sanitizedQuery.search = sanitizedQuery.search.trim();
    }

    // 3. Set defaults
    const finalQuery = {
      ...sanitizedQuery,
      sort_by: sanitizedQuery.sort_by || 'position',
      sort_order: sanitizedQuery.sort_order || 'asc',
      limit: sanitizedQuery.limit ?? 50,
      offset: sanitizedQuery.offset ?? 0,
    };

    // 4. Add organization filter if authContext provided
    if (authContext && authContext.organizationIds.length > 0) {
      finalQuery.organization_id = authContext.organizationIds[0];
    }

    // 5. Call service
    const tasks = await taskService.list(finalQuery as any);

    return tasks;
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed')) {
        throw new Error('Failed to list tasks');
      }
      throw error;
    }
    throw new Error('Failed to list tasks');
  }
}
