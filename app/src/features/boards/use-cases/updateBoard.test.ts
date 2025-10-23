/**
 * updateBoard Use Case Tests
 *
 * Tests business logic for updating board metadata.
 * Validates partial updates and authorization.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateBoard } from './updateBoard'
import type { BoardService } from '../services/board.service'
import type { BoardUpdate } from '../entities'

vi.mock('../services/board.service')

describe('updateBoard', () => {
  let mockBoardService: jest.Mocked<BoardService>

  beforeEach(() => {
    mockBoardService = {
      create: vi.fn(),
      getById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any
  })

  describe('happy path', () => {
    it('updates board name', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: 'Updated Sprint 25',
      }

      const mockUpdatedBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Updated Sprint 25',
        description: 'Old description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-22'),
      }

      mockBoardService.update.mockResolvedValue(mockUpdatedBoard)

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result).toEqual(mockUpdatedBoard)
      expect(mockBoardService.update).toHaveBeenCalledWith(boardId, updateData)
    })

    it('updates board description only', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        description: 'New detailed description',
      }

      mockBoardService.update.mockResolvedValue({
        id: boardId,
        project_id: 'proj-123',
        name: 'Sprint 24',
        description: 'New detailed description',
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result.description).toBe('New detailed description')
      expect(mockBoardService.update).toHaveBeenCalledWith(boardId, updateData)
    })

    it('updates both name and description', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: 'Q1 2024 Board',
        description: 'Board for Q1 objectives',
      }

      mockBoardService.update.mockResolvedValue({
        id: boardId,
        project_id: 'proj-123',
        ...updateData,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result.name).toBe('Q1 2024 Board')
      expect(result.description).toBe('Board for Q1 objectives')
    })

    it('trims whitespace from updated name', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: '  Trimmed Name  ',
      }

      mockBoardService.update.mockResolvedValue({
        id: boardId,
        project_id: 'proj-123',
        name: 'Trimmed Name',
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(mockBoardService.update).toHaveBeenCalledWith(
        boardId,
        expect.objectContaining({
          name: 'Trimmed Name',
        })
      )
    })
  })

  describe('validation', () => {
    it('rejects update with invalid board id', async () => {
      // Arrange
      const invalidId = 'not-a-uuid'
      const updateData: BoardUpdate = {
        name: 'Valid Name',
      }

      // Act & Assert
      await expect(
        updateBoard(invalidId, updateData, mockBoardService)
      ).rejects.toThrow('Invalid board ID format')

      expect(mockBoardService.update).not.toHaveBeenCalled()
    })

    it('rejects update with empty name', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: '',
      }

      // Act & Assert
      await expect(
        updateBoard(boardId, updateData, mockBoardService)
      ).rejects.toThrow('Board name cannot be empty')

      expect(mockBoardService.update).not.toHaveBeenCalled()
    })

    it('rejects update with name exceeding 100 characters', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: 'x'.repeat(101),
      }

      // Act & Assert
      await expect(
        updateBoard(boardId, updateData, mockBoardService)
      ).rejects.toThrow('Board name must be at most 100 characters')

      expect(mockBoardService.update).not.toHaveBeenCalled()
    })

    it('accepts empty update object (no changes)', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {}

      mockBoardService.update.mockResolvedValue({
        id: boardId,
        project_id: 'proj-123',
        name: 'Unchanged',
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result).toBeDefined()
      expect(mockBoardService.update).toHaveBeenCalledWith(boardId, {})
    })
  })

  describe('authorization', () => {
    it('allows update for user in project', async () => {
      // Arrange
      const boardId = 'board-123'
      const updateData: BoardUpdate = {
        name: 'Updated Board',
      }

      const existingBoard = {
        id: boardId,
        project_id: 'proj-456',
        name: 'Old Name',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-456'],
      }

      mockBoardService.getById.mockResolvedValue(existingBoard)
      mockBoardService.update.mockResolvedValue({
        ...existingBoard,
        ...updateData,
      })

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService, authContext)

      // Assert
      expect(result).toBeDefined()
    })

    it('rejects update for user not in project', async () => {
      // Arrange
      const boardId = 'board-123'
      const updateData: BoardUpdate = {
        name: 'Updated Board',
      }

      const existingBoard = {
        id: boardId,
        project_id: 'proj-789',
        name: 'Old Name',
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
        updateBoard(boardId, updateData, mockBoardService, authContext)
      ).rejects.toThrow('User not authorized to update this board')

      expect(mockBoardService.update).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns null when board not found', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: 'Updated Name',
      }

      mockBoardService.update.mockResolvedValue(null)

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result).toBeNull()
    })

    it('handles database connection errors', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: 'Updated Name',
      }

      mockBoardService.update.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        updateBoard(boardId, updateData, mockBoardService)
      ).rejects.toThrow('Failed to update board')
    })
  })

  describe('edge cases', () => {
    it('handles unicode characters in updated name', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: '更新的看板 🎯',
      }

      mockBoardService.update.mockResolvedValue({
        id: boardId,
        project_id: 'proj-123',
        name: '更新的看板 🎯',
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result.name).toBe('更新的看板 🎯')
    })

    it('updates updated_at timestamp', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData: BoardUpdate = {
        name: 'Updated Name',
      }

      const oldTimestamp = new Date('2024-01-01')
      const newTimestamp = new Date('2024-01-22')

      mockBoardService.update.mockResolvedValue({
        id: boardId,
        project_id: 'proj-123',
        name: 'Updated Name',
        created_at: oldTimestamp,
        updated_at: newTimestamp,
      })

      // Act
      const result = await updateBoard(boardId, updateData, mockBoardService)

      // Assert
      expect(result.updated_at).toEqual(newTimestamp)
      expect(result.updated_at).not.toEqual(result.created_at)
    })
  })
})
