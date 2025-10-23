/**
 * createBoard Use Case Tests
 *
 * Tests business logic for creating a Kanban board.
 * Validates board creation with default columns.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBoard } from './createBoard'
import type { BoardService } from '../services/board.service'
import type { BoardCreate } from '../entities'

// Mock the service module
vi.mock('../services/board.service')

describe('createBoard', () => {
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
    it('creates board with valid data', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Sprint 24 Board',
        description: 'Board for tracking sprint 24 tasks',
      }

      const expectedBoard = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...createData,
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z'),
      }

      mockBoardService.create.mockResolvedValue(expectedBoard)

      // Act
      const result = await createBoard(createData, mockBoardService)

      // Assert
      expect(result).toEqual(expectedBoard)
      expect(mockBoardService.create).toHaveBeenCalledWith(createData)
      expect(mockBoardService.create).toHaveBeenCalledTimes(1)
    })

    it('creates board with default columns (To Do, In Progress, Done)', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Board',
      }

      const mockBoard = {
        id: 'board-1',
        ...createData,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const mockColumns = [
        { id: 'col-1', board_id: 'board-1', name: 'To Do', position: 0, wip_limit: null },
        { id: 'col-2', board_id: 'board-1', name: 'In Progress', position: 1, wip_limit: 3 },
        { id: 'col-3', board_id: 'board-1', name: 'Done', position: 2, wip_limit: null },
      ]

      mockBoardService.create.mockResolvedValue(mockBoard)
      mockBoardService.createColumn.mockImplementation(async (columnData) => ({
        id: `col-${columnData.position}`,
        ...columnData,
        created_at: new Date(),
        updated_at: new Date(),
      }))

      // Act
      const result = await createBoard(createData, mockBoardService)

      // Assert
      expect(mockBoardService.createColumn).toHaveBeenCalledTimes(3)
      expect(mockBoardService.createColumn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'To Do', position: 0 })
      )
      expect(mockBoardService.createColumn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'In Progress', position: 1, wip_limit: 3 })
      )
      expect(mockBoardService.createColumn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Done', position: 2 })
      )
    })

    it('trims whitespace from board name', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: '  Sprint Board  ',
      }

      mockBoardService.create.mockResolvedValue({
        id: 'board-1',
        project_id: createData.project_id,
        name: 'Sprint Board',
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      await createBoard(createData, mockBoardService)

      // Assert
      expect(mockBoardService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sprint Board',
        })
      )
    })
  })

  describe('validation', () => {
    it('rejects creation with missing project_id', async () => {
      // Arrange
      const invalidData = {
        name: 'Board without project',
      } as any

      // Act & Assert
      await expect(
        createBoard(invalidData, mockBoardService)
      ).rejects.toThrow('project_id is required')

      expect(mockBoardService.create).not.toHaveBeenCalled()
    })

    it('rejects creation with empty name', async () => {
      // Arrange
      const invalidData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
      }

      // Act & Assert
      await expect(
        createBoard(invalidData, mockBoardService)
      ).rejects.toThrow('Board name cannot be empty')

      expect(mockBoardService.create).not.toHaveBeenCalled()
    })

    it('rejects creation with name exceeding 100 characters', async () => {
      // Arrange
      const invalidData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'x'.repeat(101),
      }

      // Act & Assert
      await expect(
        createBoard(invalidData, mockBoardService)
      ).rejects.toThrow('Board name must be at most 100 characters')

      expect(mockBoardService.create).not.toHaveBeenCalled()
    })

    it('rejects creation with invalid project_id format', async () => {
      // Arrange
      const invalidData: BoardCreate = {
        project_id: 'not-a-uuid',
        name: 'Valid Name',
      }

      // Act & Assert
      await expect(
        createBoard(invalidData, mockBoardService)
      ).rejects.toThrow('Invalid project_id format')

      expect(mockBoardService.create).not.toHaveBeenCalled()
    })
  })

  describe('authorization', () => {
    it('allows creation for user in project', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: 'proj-123',
        name: 'Authorized Board',
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-123', 'proj-456'],
      }

      mockBoardService.create.mockResolvedValue({
        id: 'board-1',
        ...createData,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createBoard(createData, mockBoardService, authContext)

      // Assert
      expect(result).toBeDefined()
      expect(mockBoardService.create).toHaveBeenCalled()
    })

    it('rejects creation for user not in project', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: 'proj-789',
        name: 'Unauthorized Board',
      }

      const authContext = {
        userId: 'user-123',
        projectIds: ['proj-123', 'proj-456'],
      }

      // Act & Assert
      await expect(
        createBoard(createData, mockBoardService, authContext)
      ).rejects.toThrow('User not authorized to create board in this project')

      expect(mockBoardService.create).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('handles database connection errors', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Board',
      }

      mockBoardService.create.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(
        createBoard(createData, mockBoardService)
      ).rejects.toThrow('Failed to create board')

      expect(mockBoardService.create).toHaveBeenCalled()
    })

    it('handles foreign key constraint violation', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: 'non-existent-project',
        name: 'Board for invalid project',
      }

      mockBoardService.create.mockRejectedValue(
        new Error('Foreign key constraint violation')
      )

      // Act & Assert
      await expect(
        createBoard(createData, mockBoardService)
      ).rejects.toThrow('Project does not exist')
    })

    it('rolls back board creation if default columns fail', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Board',
      }

      const mockBoard = {
        id: 'board-1',
        ...createData,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockBoardService.create.mockResolvedValue(mockBoard)
      mockBoardService.createColumn.mockRejectedValue(
        new Error('Failed to create column')
      )

      // Act & Assert
      await expect(
        createBoard(createData, mockBoardService)
      ).rejects.toThrow('Failed to create default columns')

      // Should attempt to delete the created board
      expect(mockBoardService.delete).toHaveBeenCalledWith('board-1')
    })
  })

  describe('edge cases', () => {
    it('handles unicode characters in board name', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: '看板 Sprint 24 🚀',
      }

      mockBoardService.create.mockResolvedValue({
        id: 'board-1',
        ...createData,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createBoard(createData, mockBoardService)

      // Assert
      expect(result.name).toBe('看板 Sprint 24 🚀')
    })

    it('handles board name at exact max length', async () => {
      // Arrange
      const createData: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'x'.repeat(100),
      }

      mockBoardService.create.mockResolvedValue({
        id: 'board-1',
        ...createData,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createBoard(createData, mockBoardService)

      // Assert
      expect(result.name).toHaveLength(100)
    })

    it('handles optional description field', async () => {
      // Arrange
      const createDataWithDescription: BoardCreate = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Board with description',
        description: 'Detailed board description',
      }

      mockBoardService.create.mockResolvedValue({
        id: 'board-1',
        ...createDataWithDescription,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Act
      const result = await createBoard(createDataWithDescription, mockBoardService)

      // Assert
      expect(result.description).toBe('Detailed board description')
    })
  })
})
