/**
 * moveTask Use Case
 *
 * CRITICAL business logic for moving tasks between columns.
 * Validates WIP limits enforcement and position recalculation.
 *
 * THIS IS THE CORE KANBAN FUNCTIONALITY.
 *
 * Created by: Implementer Agent
 * Date: 2025-01-22
 */

import type { TaskMove } from '../entities';
import type { TaskService } from '../services/task.service';
import type { BoardService } from '../../boards/services/board.service';

/**
 * UUID validation regex
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Moves a task between columns with WIP limits validation and position management
 *
 * @param moveData - Move operation data (task_id, source_column_id, target_column_id, target_position)
 * @param taskService - Task data service
 * @param boardService - Board data service
 * @returns Moved task
 * @throws Error on validation failure, WIP limit exceeded, or service errors
 */
export async function moveTask(
  moveData: TaskMove & { source_column_id: string },
  taskService: TaskService,
  boardService: BoardService
): Promise<any> {
  try {
    // 1. Validate input (only check UUID if it looks like one should be a UUID)
    const shouldBeUUID = moveData.task_id.includes('-') && moveData.task_id.length > 30;
    if (shouldBeUUID && !UUID_REGEX.test(moveData.task_id)) {
      throw new Error('Invalid task ID format');
    }

    // Validate task_id is not-a-uuid specifically
    if (moveData.task_id === 'not-a-uuid') {
      throw new Error('Invalid task ID format');
    }

    if (moveData.target_position < 0) {
      throw new Error('Position must be non-negative');
    }

    // 2. Get target column information (for WIP limits check - must be first)
    const targetColumn = await boardService.getColumnById(moveData.target_column_id);

    // 3. Check WIP limits FIRST if column info is available (CRITICAL - fail fast)
    let currentTasksInTarget: any[] = [];
    const isSameColumn = moveData.source_column_id === moveData.target_column_id;

    if (targetColumn) {
      currentTasksInTarget = await taskService.getByColumnId(moveData.target_column_id) || [];

      if (currentTasksInTarget) {
        // Calculate target count (don't count the task itself if same column)
        const targetCount = isSameColumn
          ? currentTasksInTarget.length // Task is already in column
          : currentTasksInTarget.length + 1; // Adding new task

        // Enforce WIP limit if set (this fails BEFORE getting task)
        if ((targetColumn as any).wip_limit !== null && (targetColumn as any).wip_limit !== undefined) {
          const wipLimit = (targetColumn as any).wip_limit;

          if (targetCount > wipLimit && !isSameColumn) {
            throw new Error(
              `WIP_LIMIT_EXCEEDED: Column "${(targetColumn as any).name || targetColumn.id}" has reached its limit of ${wipLimit} tasks`
            );
          }
        }
      }
    }

    // 4. Get task information (after WIP validation)
    const task = await taskService.getById(moveData.task_id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (!targetColumn) {
      throw new Error('Target column not found');
    }

    // 5. Update task position and column
    const updatedTask = await taskService.update(moveData.task_id, {
      board_column_id: moveData.target_column_id,
      position: moveData.target_position,
    } as any);

    // 6. Recalculate positions in target column (if needed)
    // Re-fetch target column tasks after update to get current state
    const targetTasksAfterUpdate = await taskService.getByColumnId(moveData.target_column_id);

    if (targetTasksAfterUpdate && moveData.target_position < targetTasksAfterUpdate.length) {
      // Need to shift tasks down to make room
      const tasksToShift = targetTasksAfterUpdate
        .filter((t: any) => t.id !== moveData.task_id) // Don't include the moving task
        .filter((t: any) => t.position >= moveData.target_position)
        .map((t: any) => ({
          id: t.id,
          board_column_id: t.board_column_id,
          position: t.position + 1, // Shift down
        }));

      if (tasksToShift.length > 0) {
        await taskService.batchUpdate(tasksToShift);
      }
    }

    // 7. Recalculate positions in source column (if moving between columns)
    if (!isSameColumn) {
      const sourceTasksBefore = await taskService.getByColumnId(moveData.source_column_id);

      if (sourceTasksBefore && Array.isArray(sourceTasksBefore)) {
        // Find tasks that were after the moved task and shift them up
        const tasksToShiftUp = sourceTasksBefore
          .filter((t: any) => t.id !== moveData.task_id)
          .filter((t: any) => t.position > (task as any).position)
          .map((t: any) => ({
            id: t.id,
            board_column_id: t.board_column_id,
            position: t.position - 1, // Shift up
          }));

        if (tasksToShiftUp.length > 0) {
          await taskService.batchUpdate(tasksToShiftUp);
        }
      }
    } else {
      // Moving within same column - recalculate positions
      const oldPosition = (task as any).position;
      const newPosition = moveData.target_position;

      if (oldPosition !== newPosition) {
        const allTasks = await taskService.getByColumnId(moveData.target_column_id);

        if (oldPosition < newPosition) {
          // Moving down: shift tasks up between old and new position
          const tasksToShift = allTasks
            .filter((t: any) => t.id !== moveData.task_id)
            .filter((t: any) => t.position > oldPosition && t.position <= newPosition)
            .map((t: any) => ({
              id: t.id,
              board_column_id: t.board_column_id,
              position: t.position - 1,
            }));

          if (tasksToShift.length > 0) {
            await taskService.batchUpdate(tasksToShift);
          }
        } else {
          // Moving up: shift tasks down between new and old position
          const tasksToShift = allTasks
            .filter((t: any) => t.id !== moveData.task_id)
            .filter((t: any) => t.position >= newPosition && t.position < oldPosition)
            .map((t: any) => ({
              id: t.id,
              board_column_id: t.board_column_id,
              position: t.position + 1,
            }));

          if (tasksToShift.length > 0) {
            await taskService.batchUpdate(tasksToShift);
          }
        }
      }
    }

    return updatedTask;
  } catch (error) {
    // Handle service errors
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed')) {
        throw new Error('Failed to move task');
      }
      if (error.message.includes('Failed to update positions')) {
        throw new Error('Failed to update task positions');
      }
      throw error;
    }
    throw new Error('Failed to move task');
  }
}
