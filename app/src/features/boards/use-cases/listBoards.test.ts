/**
 * listBoards Use Case Tests
 *
 * Tests business logic for listing boards.
 * Validates filtering, pagination, and authorization.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listBoards } from './listBoards'
import type { BoardService } from '../services/board.service'
import type { BoardQuery } from '../entities'

vi.mock('../services/board.service')

describe('listBoards', () => {
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
    it('retrieves paginated list of boards for a project', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-123',
        page: 1,
        limit: 20,
      }

      const mockBoards = [
        {
          id: 'board-1',
          project_id: 'proj-123',
          name: 'Sprint 24',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 'board-2',
          project_id: 'proj-123',
          name: 'Sprint 25',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15'),
        },
      ]

      mockBoardService.list.mockResolvedValue({
        data: mockBoards,
        total: 2,
        page: 1,
        limit: 20,
      })

      // Act
      const result = await listBoards(queryParams, mockBoardService)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(mockBoardService.list).toHaveBeenCalledWith(queryParams)
    })

    it('applies default pagination values', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-123',
      }

      mockBoardService.list.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      })

      // Act
      await listBoards(queryParams, mockBoardService)

      // Assert
      expect(mockBoardService.list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      )
    })

    it('returns boards sorted by creation date descending', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-123',
        sort_by: 'created_at',
        order: 'desc',
      }

      const mockBoards = [
        { id: 'board-2', created_at: new Date('2024-01-15') },
        { id: 'board-1', created_at: new Date('2024-01-01') },
      ]

      mockBoardService.list.mockResolvedValue({
        data: mockBoards,
        total: 2,
        page: 1,
        limit: 20,
      })

      // Act
      const result = await listBoards(queryParams, mockBoardService)

      // Assert
      expect(result.data[0].id).toBe('board-2')
      expect(result.data[1].id).toBe('board-1')
    })
  })

  describe('validation', () => {
    it('rejects query with invalid project_id format', async () => {
      // Arrange
      const invalidQuery = {
        project_id: 'not-a-uuid',
      } as any

      // Act & Assert
      await expect(
        listBoards(invalidQuery, mockBoardService)
      ).rejects.toThrow('Invalid project_id format')

      expect(mockBoardService.list).not.toHaveBeenCalled()
    })

    it('rejects query with page < 1', async () => {
      // Arrange
      const invalidQuery: BoardQuery = {
        project_id: 'proj-123',
        page: 0,
      }

      // Act & Assert
      await expect(
        listBoards(invalidQuery, mockBoardService)
      ).rejects.toThrow('Page must be at least 1')

      expect(mockBoardService.list).not.toHaveBeenCalled()
    })

    it('rejects query with limit exceeding maximum', async () => {
      // Arrange
      const invalidQuery: BoardQuery = {
        project_id: 'proj-123',
        limit: 150,
      }

      // Act & Assert
      await expect(
        listBoards(invalidQuery, mockBoardService)
      ).rejects.toThrow('Limit cannot exceed 100')

      expect(mockBoardService.list).not.toHaveBeenCalled()
    })
  })

  describe('authorization', () => {
    it('allows listing for user in project', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-123',
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-123', 'proj-456'],
      }

      mockBoardService.list.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      })

      // Act
      const result = await listBoards(queryParams, mockBoardService, authContext)

      // Assert
      expect(result).toBeDefined()
      expect(mockBoardService.list).toHaveBeenCalled()
    })

    it('rejects listing for user not in project', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-789',
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-123', 'proj-456'],
      }

      // Act & Assert
      await expect(
        listBoards(queryParams, mockBoardService, authContext)
      ).rejects.toThrow('User not authorized to view boards in this project')

      expect(mockBoardService.list).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-123',
      }

      mockBoardService.list.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        listBoards(queryParams, mockBoardService)
      ).rejects.toThrow('Failed to retrieve boards')
    })
  })

  describe('edge cases', () => {
    it('returns empty array when no boards exist', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-empty',
      }

      mockBoardService.list.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      })

      // Act
      const result = await listBoards(queryParams, mockBoardService)

      // Assert
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('handles pagination beyond available results', async () => {
      // Arrange
      const queryParams: BoardQuery = {
        project_id: 'proj-123',
        page: 10,
        limit: 20,
      }

      mockBoardService.list.mockResolvedValue({
        data: [],
        total: 5,
        page: 10,
        limit: 20,
      })

      // Act
      const result = await listBoards(queryParams, mockBoardService)

      // Assert
      expect(result.data).toEqual([])
      expect(result.total).toBe(5)
    })
  })
})
