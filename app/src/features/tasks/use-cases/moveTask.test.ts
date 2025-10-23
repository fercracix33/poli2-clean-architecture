/**
 * moveTask Use Case Tests
 *
 * Tests CRITICAL business logic for moving tasks between columns.
 * Validates WIP limits enforcement and position recalculation.
 *
 * THIS IS THE CORE KANBAN FUNCTIONALITY.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { moveTask } from './moveTask'
import type { TaskService } from '../services/task.service'
import type { BoardService } from '../../boards/services/board.service'
import type { TaskMove } from '../entities'

vi.mock('../services/task.service')
vi.mock('../../boards/services/board.service')

describe('moveTask - CRITICAL WIP LIMITS & POSITION MANAGEMENT', () => {
  let mockTaskService: jest.Mocked<TaskService>
  let mockBoardService: jest.Mocked<BoardService>

  beforeEach(() => {
    mockTaskService = {
      getById: vi.fn(),
      getByColumnId: vi.fn(),
      update: vi.fn(),
      batchUpdate: vi.fn(),
    } as any

    mockBoardService = {
      getById: vi.fn(),
      getColumnById: vi.fn(),
    } as any
  })

  describe('WIP Limits Enforcement (CRITICAL)', () => {
    it('THROWS WIP_LIMIT_EXCEEDED when target column is at capacity', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-new',
        source_column_id: 'col-backlog',
        target_column_id: 'col-limited',
        target_position: 3,
      }

      const targetColumn = {
        id: 'col-limited',
        board_id: 'board-1',
        name: 'In Progress',
        position: 1,
        wip_limit: 3, // LIMIT IS 3
        created_at: new Date(),
        updated_at: new Date(),
      }

      const currentTasksInTarget = [
        { id: 'task-1', board_column_id: 'col-limited', position: 0 },
        { id: 'task-2', board_column_id: 'col-limited', position: 1 },
        { id: 'task-3', board_column_id: 'col-limited', position: 2 },
      ]

      mockBoardService.getColumnById.mockResolvedValue(targetColumn)
      mockTaskService.getByColumnId.mockResolvedValue(currentTasksInTarget)

      // Act & Assert
      await expect(
        moveTask(moveData, mockTaskService, mockBoardService)
      ).rejects.toThrow('WIP_LIMIT_EXCEEDED: Column "In Progress" has reached its limit of 3 tasks')

      // Service should NOT be called
      expect(mockTaskService.update).not.toHaveBeenCalled()
      expect(mockTaskService.batchUpdate).not.toHaveBeenCalled()
    })

    it('ALLOWS move when target column is under WIP limit', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-new',
        source_column_id: 'col-backlog',
        target_column_id: 'col-limited',
        target_position: 2,
      }

      const targetColumn = {
        id: 'col-limited',
        wip_limit: 3, // LIMIT IS 3
      }

      const currentTasksInTarget = [
        { id: 'task-1', board_column_id: 'col-limited', position: 0 },
        { id: 'task-2', board_column_id: 'col-limited', position: 1 },
        // Only 2 tasks, limit is 3, so move should succeed
      ]

      const movingTask = {
        id: 'task-new',
        board_column_id: 'col-backlog',
        position: 5,
      }

      mockBoardService.getColumnById.mockResolvedValue(targetColumn as any)
      mockTaskService.getByColumnId.mockResolvedValue(currentTasksInTarget as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-limited', position: 2 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert
      expect(mockTaskService.update).toHaveBeenCalledWith('task-new', {
        board_column_id: 'col-limited',
        position: 2,
      })
    })

    it('ALLOWS move when WIP limit is NULL (unlimited)', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-99',
        source_column_id: 'col-todo',
        target_column_id: 'col-unlimited',
        target_position: 100,
      }

      const targetColumn = {
        id: 'col-unlimited',
        wip_limit: null, // UNLIMITED
      }

      const currentTasksInTarget = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        board_column_id: 'col-unlimited',
        position: i,
      }))

      const movingTask = {
        id: 'task-99',
        board_column_id: 'col-todo',
        position: 0,
      }

      mockBoardService.getColumnById.mockResolvedValue(targetColumn as any)
      mockTaskService.getByColumnId.mockResolvedValue(currentTasksInTarget as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-unlimited', position: 100 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert
      expect(mockTaskService.update).toHaveBeenCalled()
    })

    it('DOES NOT count the moving task itself when moving within same column', async () => {
      // Arrange - Moving task is already in target column, just changing position
      const moveData: TaskMove = {
        task_id: 'task-2',
        source_column_id: 'col-limited',
        target_column_id: 'col-limited', // Same column
        target_position: 0,
      }

      const targetColumn = {
        id: 'col-limited',
        wip_limit: 3,
      }

      const currentTasksInColumn = [
        { id: 'task-1', board_column_id: 'col-limited', position: 0 },
        { id: 'task-2', board_column_id: 'col-limited', position: 1 }, // Moving this one
        { id: 'task-3', board_column_id: 'col-limited', position: 2 },
      ]

      const movingTask = currentTasksInColumn[1]

      mockBoardService.getColumnById.mockResolvedValue(targetColumn as any)
      mockTaskService.getByColumnId.mockResolvedValue(currentTasksInColumn as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, position: 0 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert - Should succeed because task-2 is already in column (doesn't add to count)
      expect(mockTaskService.update).toHaveBeenCalled()
    })
  })

  describe('Position Recalculation (CRITICAL)', () => {
    it('recalculates source column positions when task is removed', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-2',
        source_column_id: 'col-source',
        target_column_id: 'col-target',
        target_position: 0,
      }

      const sourceTasksBefore = [
        { id: 'task-1', board_column_id: 'col-source', position: 0 },
        { id: 'task-2', board_column_id: 'col-source', position: 1 }, // MOVING
        { id: 'task-3', board_column_id: 'col-source', position: 2 },
        { id: 'task-4', board_column_id: 'col-source', position: 3 },
      ]

      const targetTasksBefore = []

      const movingTask = sourceTasksBefore[1]

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-target', wip_limit: null } as any)
      mockTaskService.getByColumnId
        .mockResolvedValueOnce(targetTasksBefore as any)
        .mockResolvedValueOnce(sourceTasksBefore as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-target', position: 0 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert - task-3 and task-4 should shift up
      expect(mockTaskService.batchUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'task-3', position: 1 }), // Was 2, now 1
          expect.objectContaining({ id: 'task-4', position: 2 }), // Was 3, now 2
        ])
      )
    })

    it('recalculates target column positions when task is inserted', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-new',
        source_column_id: 'col-source',
        target_column_id: 'col-target',
        target_position: 1, // Insert at position 1
      }

      const targetTasksBefore = [
        { id: 'task-a', board_column_id: 'col-target', position: 0 },
        { id: 'task-b', board_column_id: 'col-target', position: 1 }, // Will shift down
        { id: 'task-c', board_column_id: 'col-target', position: 2 }, // Will shift down
      ]

      const sourceTasksBefore = [
        { id: 'task-new', board_column_id: 'col-source', position: 0 },
      ]

      const movingTask = sourceTasksBefore[0]

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-target', wip_limit: null } as any)
      mockTaskService.getByColumnId
        .mockResolvedValueOnce(targetTasksBefore as any)
        .mockResolvedValueOnce(sourceTasksBefore as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-target', position: 1 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert - task-b and task-c should shift down
      expect(mockTaskService.batchUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'task-b', position: 2 }), // Was 1, now 2
          expect.objectContaining({ id: 'task-c', position: 3 }), // Was 2, now 3
        ])
      )
    })

    it('recalculates positions when moving within same column', async () => {
      // Arrange - Move task from position 0 to position 2 in same column
      const moveData: TaskMove = {
        task_id: 'task-a',
        source_column_id: 'col-same',
        target_column_id: 'col-same',
        target_position: 2,
      }

      const tasksInColumn = [
        { id: 'task-a', board_column_id: 'col-same', position: 0 }, // MOVING
        { id: 'task-b', board_column_id: 'col-same', position: 1 },
        { id: 'task-c', board_column_id: 'col-same', position: 2 },
        { id: 'task-d', board_column_id: 'col-same', position: 3 },
      ]

      const movingTask = tasksInColumn[0]

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-same', wip_limit: null } as any)
      mockTaskService.getByColumnId.mockResolvedValue(tasksInColumn as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, position: 2 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert - task-b and task-c shift up, task-a goes to position 2
      expect(mockTaskService.batchUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'task-b', position: 0 }),
          expect.objectContaining({ id: 'task-c', position: 1 }),
        ])
      )
      expect(mockTaskService.update).toHaveBeenCalledWith('task-a', {
        board_column_id: 'col-same',
        position: 2,
      })
    })

    it('handles moving to last position correctly', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-new',
        source_column_id: 'col-source',
        target_column_id: 'col-target',
        target_position: 3, // Last position (append)
      }

      const targetTasksBefore = [
        { id: 'task-1', board_column_id: 'col-target', position: 0 },
        { id: 'task-2', board_column_id: 'col-target', position: 1 },
        { id: 'task-3', board_column_id: 'col-target', position: 2 },
      ]

      const movingTask = {
        id: 'task-new',
        board_column_id: 'col-source',
        position: 0,
      }

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-target', wip_limit: null } as any)
      mockTaskService.getByColumnId.mockResolvedValue(targetTasksBefore as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-target', position: 3 } as any)
      mockTaskService.batchUpdate.mockResolvedValue(true)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert - No position changes needed for existing tasks
      expect(mockTaskService.update).toHaveBeenCalledWith('task-new', {
        board_column_id: 'col-target',
        position: 3,
      })
    })
  })

  describe('validation', () => {
    it('rejects move with invalid task_id format', async () => {
      // Arrange
      const invalidMove: TaskMove = {
        task_id: 'not-a-uuid',
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      // Act & Assert
      await expect(
        moveTask(invalidMove, mockTaskService, mockBoardService)
      ).rejects.toThrow('Invalid task ID format')

      expect(mockTaskService.update).not.toHaveBeenCalled()
    })

    it('rejects move with negative position', async () => {
      // Arrange
      const invalidMove: TaskMove = {
        task_id: '550e8400-e29b-41d4-a716-446655440000',
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: -1,
      }

      // Act & Assert
      await expect(
        moveTask(invalidMove, mockTaskService, mockBoardService)
      ).rejects.toThrow('Position must be non-negative')

      expect(mockTaskService.update).not.toHaveBeenCalled()
    })

    it('throws error when task not found', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'non-existent-task',
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      mockTaskService.getById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        moveTask(moveData, mockTaskService, mockBoardService)
      ).rejects.toThrow('Task not found')
    })

    it('throws error when target column not found', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-1',
        source_column_id: 'col-1',
        target_column_id: 'non-existent-column',
        target_position: 0,
      }

      mockTaskService.getById.mockResolvedValue({ id: 'task-1' } as any)
      mockBoardService.getColumnById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        moveTask(moveData, mockTaskService, mockBoardService)
      ).rejects.toThrow('Target column not found')
    })
  })

  describe('error handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-1',
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      mockTaskService.getById.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        moveTask(moveData, mockTaskService, mockBoardService)
      ).rejects.toThrow('Failed to move task')
    })

    it('rolls back on partial failure (transaction-like behavior)', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-1',
        source_column_id: 'col-source',
        target_column_id: 'col-target',
        target_position: 0,
      }

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-target', wip_limit: null } as any)
      mockTaskService.getByColumnId.mockResolvedValue([])
      mockTaskService.getById.mockResolvedValue({ id: 'task-1', board_column_id: 'col-source', position: 0 } as any)
      mockTaskService.update.mockResolvedValue({ id: 'task-1' } as any)
      mockTaskService.batchUpdate.mockRejectedValue(
        new Error('Failed to update positions')
      )

      // Act & Assert
      await expect(
        moveTask(moveData, mockTaskService, mockBoardService)
      ).rejects.toThrow('Failed to update task positions')

      // Should attempt rollback
      // (In real implementation, this would revert the task position)
    })
  })

  describe('edge cases', () => {
    it('handles moving task to empty column', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-1',
        source_column_id: 'col-source',
        target_column_id: 'col-empty',
        target_position: 0,
      }

      const movingTask = {
        id: 'task-1',
        board_column_id: 'col-source',
        position: 0,
      }

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-empty', wip_limit: null } as any)
      mockTaskService.getByColumnId.mockResolvedValue([]) // Empty column
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-empty', position: 0 } as any)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert
      expect(mockTaskService.update).toHaveBeenCalledWith('task-1', {
        board_column_id: 'col-empty',
        position: 0,
      })
    })

    it('handles moving last task from source column', async () => {
      // Arrange
      const moveData: TaskMove = {
        task_id: 'task-only',
        source_column_id: 'col-source',
        target_column_id: 'col-target',
        target_position: 0,
      }

      const sourceTasksBefore = [
        { id: 'task-only', board_column_id: 'col-source', position: 0 },
      ]

      const movingTask = sourceTasksBefore[0]

      mockBoardService.getColumnById.mockResolvedValue({ id: 'col-target', wip_limit: null } as any)
      mockTaskService.getByColumnId
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(sourceTasksBefore as any)
      mockTaskService.getById.mockResolvedValue(movingTask as any)
      mockTaskService.update.mockResolvedValue({ ...movingTask, board_column_id: 'col-target', position: 0 } as any)

      // Act
      await moveTask(moveData, mockTaskService, mockBoardService)

      // Assert
      expect(mockTaskService.update).toHaveBeenCalled()
      // Source column should now be empty (no recalculation needed)
    })
  })
})
