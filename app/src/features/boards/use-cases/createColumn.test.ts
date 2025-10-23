/**
 * createColumn Use Case Tests
 *
 * Tests business logic for creating board columns.
 * Validates position management and WIP limits.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createColumn } from './createColumn'
import type { BoardService } from '../services/board.service'
import type { BoardColumnCreate } from '../entities'

vi.mock('../services/board.service')

describe('createColumn', () => {
  let mockBoardService: jest.Mocked<BoardService>

  beforeEach(() => {
    mockBoardService = {
      create: vi.fn(),
      getById: vi.fn(),
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      reorderColumns: vi.fn(),
    } as any
  })

  describe('happy path', () => {
    it('creates column with valid data', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Review',
        position: 2,
        wip_limit: 5,
      }

      const expectedColumn = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...columnData,
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z'),
      }

      mockBoardService.createColumn.mockResolvedValue(expectedColumn)

      // Act
      const result = await createColumn(columnData, mockBoardService)

      // Assert
      expect(result).toEqual(expectedColumn)
      expect(mockBoardService.createColumn).toHaveBeenCalledWith(columnData)
    })

    it('creates column with null WIP limit (unlimited)', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Backlog',
        position: 0,
        wip_limit: null,
      }

      mockBoardService.createColumn.mockResolvedValue({
        id: 'col-1',
        ...columnData,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createColumn(columnData, mockBoardService)

      // Assert
      expect(result.wip_limit).toBeNull()
    })

    it('auto-increments position if not provided', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: 'board-1',
        name: 'New Column',
      }

      const existingColumns = [
        { id: 'col-1', position: 0 },
        { id: 'col-2', position: 1 },
      ]

      mockBoardService.getById.mockResolvedValue({
        id: 'board-1',
        project_id: 'proj-1',
        name: 'Board',
        columns: existingColumns,
        created_at: new Date(),
        updated_at: new Date(),
      })

      mockBoardService.createColumn.mockResolvedValue({
        id: 'col-3',
        board_id: 'board-1',
        name: 'New Column',
        position: 2,
        wip_limit: null,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createColumn(columnData, mockBoardService)

      // Assert
      expect(result.position).toBe(2)
    })
  })

  describe('validation', () => {
    it('rejects column with empty name', async () => {
      // Arrange
      const invalidData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
        position: 0,
      }

      // Act & Assert
      await expect(
        createColumn(invalidData, mockBoardService)
      ).rejects.toThrow('Column name cannot be empty')

      expect(mockBoardService.createColumn).not.toHaveBeenCalled()
    })

    it('rejects column with name exceeding 50 characters', async () => {
      // Arrange
      const invalidData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'x'.repeat(51),
        position: 0,
      }

      // Act & Assert
      await expect(
        createColumn(invalidData, mockBoardService)
      ).rejects.toThrow('Column name must be at most 50 characters')

      expect(mockBoardService.createColumn).not.toHaveBeenCalled()
    })

    it('rejects column with negative WIP limit', async () => {
      // Arrange
      const invalidData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Invalid Column',
        position: 0,
        wip_limit: -1,
      }

      // Act & Assert
      await expect(
        createColumn(invalidData, mockBoardService)
      ).rejects.toThrow('WIP limit must be a positive integer or null')

      expect(mockBoardService.createColumn).not.toHaveBeenCalled()
    })

    it('rejects column with WIP limit of 0', async () => {
      // Arrange
      const invalidData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Column',
        position: 0,
        wip_limit: 0,
      }

      // Act & Assert
      await expect(
        createColumn(invalidData, mockBoardService)
      ).rejects.toThrow('WIP limit must be at least 1 or null')

      expect(mockBoardService.createColumn).not.toHaveBeenCalled()
    })

    it('rejects column with negative position', async () => {
      // Arrange
      const invalidData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Column',
        position: -1,
      }

      // Act & Assert
      await expect(
        createColumn(invalidData, mockBoardService)
      ).rejects.toThrow('Position must be a non-negative integer')

      expect(mockBoardService.createColumn).not.toHaveBeenCalled()
    })
  })

  describe('authorization', () => {
    it('allows column creation for user in board project', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: 'board-123',
        name: 'Testing',
        position: 1,
      }

      const existingBoard = {
        id: 'board-123',
        project_id: 'proj-456',
        name: 'Board',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-456'],
      }

      mockBoardService.getById.mockResolvedValue(existingBoard)
      mockBoardService.createColumn.mockResolvedValue({
        id: 'col-1',
        ...columnData,
        wip_limit: null,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createColumn(columnData, mockBoardService, authContext)

      // Assert
      expect(result).toBeDefined()
    })

    it('rejects column creation for user not in board project', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: 'board-123',
        name: 'Testing',
        position: 1,
      }

      const existingBoard = {
        id: 'board-123',
        project_id: 'proj-789',
        name: 'Board',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-456'],
      }

      mockBoardService.getById.mockResolvedValue(existingBoard)

      // Act & Assert
      await expect(
        createColumn(columnData, mockBoardService, authContext)
      ).rejects.toThrow('User not authorized to add columns to this board')

      expect(mockBoardService.createColumn).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Column',
        position: 0,
      }

      mockBoardService.createColumn.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        createColumn(columnData, mockBoardService)
      ).rejects.toThrow('Failed to create column')
    })

    it('handles foreign key constraint violation (board not found)', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: 'non-existent-board',
        name: 'Column',
        position: 0,
      }

      mockBoardService.createColumn.mockRejectedValue(
        new Error('Foreign key constraint violation')
      )

      // Act & Assert
      await expect(
        createColumn(columnData, mockBoardService)
      ).rejects.toThrow('Board does not exist')
    })
  })

  describe('edge cases', () => {
    it('handles unicode characters in column name', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: 'board-1',
        name: '进行中 ✓',
        position: 1,
      }

      mockBoardService.createColumn.mockResolvedValue({
        id: 'col-1',
        ...columnData,
        wip_limit: null,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createColumn(columnData, mockBoardService)

      // Assert
      expect(result.name).toBe('进行中 ✓')
    })

    it('handles very high WIP limit value', async () => {
      // Arrange
      const columnData: BoardColumnCreate = {
        board_id: 'board-1',
        name: 'High Capacity',
        position: 1,
        wip_limit: 999,
      }

      mockBoardService.createColumn.mockResolvedValue({
        id: 'col-1',
        ...columnData,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createColumn(columnData, mockBoardService)

      // Assert
      expect(result.wip_limit).toBe(999)
    })
  })
})
