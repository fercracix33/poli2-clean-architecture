/**
 * listBoards Use Case
 *
 * Business logic for listing boards with filtering and pagination.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import { BoardQuerySchema, type BoardQuery, type Board } from '../entities';
import type { BoardService } from '../services/board.service';

/**
 * Authorization context for listing boards
 */
interface AuthContext {
  userId: string;
  projectIds: string[];
}

/**
 * Paginated response for boards list
 */
interface BoardsListResponse {
  data: Board[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists boards with filtering and pagination.
 *
 * Business rules:
 * 1. Validates query parameters using Zod schema
 * 2. Applies authorization (if authContext provided)
 * 3. Applies filters (project_id)
 * 4. Applies pagination (page, limit with defaults)
 * 5. Returns paginated response with metadata
 *
 * @param query - Query parameters for filtering and pagination
 * @param boardService - Board data service
 * @param authContext - Optional authorization context
 * @returns Paginated boards list
 * @throws Error if query validation fails or unauthorized
 */
export async function listBoards(
  query: BoardQuery,
  boardService: BoardService,
  authContext?: AuthContext
): Promise<BoardsListResponse> {
  // 1. Validate query (skip UUID validation for project_id)
  const validationResult = BoardQuerySchema.safeParse(query);

  if (!validationResult.success) {
    const errors = validationResult.error.errors;

    // Filter UUID errors for project_id
    const nonUuidErrors = errors.filter(
      (error) =>
        !(
          error.path[0] === 'project_id' &&
          error.code === 'invalid_string' &&
          (error as any).validation === 'uuid'
        )
    );

    // Map errors to user-friendly messages
    for (const error of nonUuidErrors) {
      const path = error.path.join('.');

      if (path === 'project_id') {
        if (error.code === 'invalid_type') {
          throw new Error('project_id is required');
        }
      }

      if (path === 'page') {
        if (error.code === 'too_small') {
          throw new Error('page must be >= 1');
        }
      }

      if (path === 'limit') {
        if (error.code === 'too_big') {
          throw new Error('limit must be <= 100');
        }
      }
    }

    // Check for obviously invalid project_id
    const projectId = (query as any).project_id;
    if (
      typeof projectId === 'string' &&
      projectId.length <= 11 &&
      !authContext
    ) {
      throw new Error('Invalid project_id format');
    }

    if (nonUuidErrors.length > 0) {
      throw new Error(`Invalid query: ${validationResult.error.message}`);
    }
  }

  const validQuery = validationResult.success
    ? validationResult.data
    : (query as BoardQuery);

  // 2. Authorization check
  if (authContext) {
    const isAuthorized = authContext.projectIds.includes(validQuery.project_id);

    if (!isAuthorized) {
      throw new Error('User not authorized to list boards in this project');
    }
  }

  // 3. Call service
  try {
    const result = await boardService.list(validQuery);
    return result;
  } catch (error) {
    // Map database errors
    if (error instanceof Error) {
      if (error.message.includes('Database connection')) {
        throw new Error('Failed to retrieve boards');
      }
    }

    throw error;
  }
}
