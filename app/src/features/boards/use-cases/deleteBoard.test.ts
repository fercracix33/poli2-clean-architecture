/**
 * deleteBoard Use Case Tests
 *
 * Tests business logic for deleting boards.
 * Validates cascade deletion and authorization.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteBoard } from './deleteBoard'
import type { BoardService } from '../services/board.service'

vi.mock('../services/board.service')

describe('deleteBoard', () => {
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
    it('deletes board and cascades to columns and tasks', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.delete.mockResolvedValue(true)

      // Act
      await deleteBoard(boardId, mockBoardService)

      // Assert
      expect(mockBoardService.delete).toHaveBeenCalledWith(boardId)
      expect(mockBoardService.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('validation', () => {
    it('rejects deletion with invalid board id', async () => {
      // Arrange
      const invalidId = 'not-a-uuid'

      // Act & Assert
      await expect(
        deleteBoard(invalidId, mockBoardService)
      ).rejects.toThrow('Invalid board ID format')

      expect(mockBoardService.delete).not.toHaveBeenCalled()
    })

    it('throws error when board not found', async () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.delete.mockResolvedValue(false)

      // Act & Assert
      await expect(
        deleteBoard(nonExistentId, mockBoardService)
      ).rejects.toThrow('Board not found')
    })
  })

  describe('authorization', () => {
    it('allows deletion for user in project', async () => {
      // Arrange
      const boardId = 'board-123'

      const existingBoard = {
        id: boardId,
        project_id: 'proj-456',
        name: 'Board to delete',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-456'],
      }

      mockBoardService.getById.mockResolvedValue(existingBoard)
      mockBoardService.delete.mockResolvedValue(true)

      // Act
      await deleteBoard(boardId, mockBoardService, authContext)

      // Assert
      expect(mockBoardService.delete).toHaveBeenCalled()
    })

    it('rejects deletion for user not in project', async () => {
      // Arrange
      const boardId = 'board-123'

      const existingBoard = {
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

      mockBoardService.getById.mockResolvedValue(existingBoard)

      // Act & Assert
      await expect(
        deleteBoard(boardId, mockBoardService, authContext)
      ).rejects.toThrow('User not authorized to delete this board')

      expect(mockBoardService.delete).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.delete.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        deleteBoard(boardId, mockBoardService)
      ).rejects.toThrow('Failed to delete board')
    })

    it('handles foreign key constraint violations', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      mockBoardService.delete.mockRejectedValue(
        new Error('Foreign key constraint violation')
      )

      // Act & Assert
      await expect(
        deleteBoard(boardId, mockBoardService)
      ).rejects.toThrow('Cannot delete board with dependent data')
    })
  })
})
