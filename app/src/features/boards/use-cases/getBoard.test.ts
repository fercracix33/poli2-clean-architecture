/**
 * getBoard Use Case Tests
 *
 * Tests business logic for retrieving a single board.
 * Validates authorization and data retrieval.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBoard } from './getBoard'
import type { BoardService } from '../services/board.service'

vi.mock('../services/board.service')

describe('getBoard', () => {
  let mockBoardService: jest.Mocked<BoardService>

  beforeEach(() => {
    mockBoardService = {
      create: vi.fn(),
      getById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      reorderColumns: vi.fn(),
    } as any
  })

  describe('happy path', () => {
    it('retrieves board by id with columns', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      const mockBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Sprint 24',
        description: 'Sprint board',
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z'),
        columns: [
          {
            id: 'col-1',
            board_id: boardId,
            name: 'To Do',
            position: 0,
            wip_limit: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'col-2',
            board_id: boardId,
            name: 'In Progress',
            position: 1,
            wip_limit: 3,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      }

      mockBoardService.getById.mockResolvedValue(mockBoard)

      // Act
      const result = await getBoard(boardId, mockBoardService)

      // Assert
      expect(result).toEqual(mockBoard)
      expect(mockBoardService.getById).toHaveBeenCalledWith(boardId, {
        includeColumns: true,
      })
      expect(mockBoardService.getById).toHaveBeenCalledTimes(1)
    })

    it('retrieves board without columns when not requested', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      const mockBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Sprint 24',
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockBoardService.getById.mockResolvedValue(mockBoard)

      // Act
      const result = await getBoard(boardId, mockBoardService, {
        includeColumns: false,
      })

      // Assert
      expect(result).toEqual(mockBoard)
      expect(result.columns).toBeUndefined()
    })
  })

  describe('validation', () => {
    it('rejects request with invalid board id format', async () => {
      // Arrange
      const invalidId = 'not-a-uuid'

      // Act & Assert
      await expect(
        getBoard(invalidId, mockBoardService)
      ).rejects.toThrow('Invalid board ID format')

      expect(mockBoardService.getById).not.toHaveBeenCalled()
    })

    it('returns null when board not found', async () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.getById.mockResolvedValue(null)

      // Act
      const result = await getBoard(nonExistentId, mockBoardService)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('authorization', () => {
    it('allows retrieval for user in project', async () => {
      // Arrange
      const boardId = 'board-123'

      const mockBoard = {
        id: boardId,
        project_id: 'proj-456',
        name: 'Board',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-456'],
      }

      mockBoardService.getById.mockResolvedValue(mockBoard)

      // Act
      const result = await getBoard(boardId, mockBoardService, {}, authContext)

      // Assert
      expect(result).toEqual(mockBoard)
    })

    it('rejects retrieval for user not in project', async () => {
      // Arrange
      const boardId = 'board-123'

      const mockBoard = {
        id: boardId,
        project_id: 'proj-789',
        name: 'Board',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-456'],
      }

      mockBoardService.getById.mockResolvedValue(mockBoard)

      // Act & Assert
      await expect(
        getBoard(boardId, mockBoardService, {}, authContext)
      ).rejects.toThrow('User not authorized to view this board')
    })
  })

  describe('error handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.getById.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        getBoard(boardId, mockBoardService)
      ).rejects.toThrow('Failed to retrieve board')
    })

    it('handles unexpected service errors', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.getById.mockRejectedValue(
        new Error('Unexpected error')
      )

      // Act & Assert
      await expect(
        getBoard(boardId, mockBoardService)
      ).rejects.toThrow()
    })
  })

  describe('edge cases', () => {
    it('handles board with no columns', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      const mockBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Empty Board',
        created_at: new Date(),
        updated_at: new Date(),
        columns: [],
      }

      mockBoardService.getById.mockResolvedValue(mockBoard)

      // Act
      const result = await getBoard(boardId, mockBoardService)

      // Assert
      expect(result.columns).toEqual([])
    })

    it('returns columns sorted by position', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      const mockBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Board',
        created_at: new Date(),
        updated_at: new Date(),
        columns: [
          { id: 'col-3', position: 2, name: 'Done' },
          { id: 'col-1', position: 0, name: 'To Do' },
          { id: 'col-2', position: 1, name: 'In Progress' },
        ],
      }

      mockBoardService.getById.mockResolvedValue(mockBoard)

      // Act
      const result = await getBoard(boardId, mockBoardService)

      // Assert
      expect(result.columns[0].position).toBe(0)
      expect(result.columns[1].position).toBe(1)
      expect(result.columns[2].position).toBe(2)
    })
  })
})
