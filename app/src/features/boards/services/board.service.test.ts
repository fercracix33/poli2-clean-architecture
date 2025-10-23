/**
 * BoardService Tests
 *
 * Tests pure data access layer for boards.
 * Mocks Supabase client.
 *
 * IMPORTANT: Services should be PURE - no business logic, only data access.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BoardService } from './board.service'
import type { SupabaseClient } from '@supabase/supabase-js'

// Create Supabase mock
const createSupabaseMock = () => {
  const selectMock = vi.fn()
  const eqMock = vi.fn()
  const singleMock = vi.fn()
  const insertMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()
  const orderMock = vi.fn()
  const rangeMock = vi.fn()

  const queryBuilder = {
    select: selectMock.mockReturnThis(),
    eq: eqMock.mockReturnThis(),
    single: singleMock.mockReturnThis(),
    insert: insertMock.mockReturnThis(),
    update: updateMock.mockReturnThis(),
    delete: deleteMock.mockReturnThis(),
    order: orderMock.mockReturnThis(),
    range: rangeMock.mockReturnThis(),
  }

  const supabase = {
    from: vi.fn(() => queryBuilder),
    auth: {
      getUser: vi.fn(),
    },
  } as unknown as SupabaseClient

  return {
    supabase,
    mocks: {
      selectMock,
      eqMock,
      singleMock,
      insertMock,
      updateMock,
      deleteMock,
      orderMock,
      rangeMock,
    },
  }
}

describe('BoardService', () => {
  let service: BoardService
  let supabase: SupabaseClient
  let mocks: ReturnType<typeof createSupabaseMock>['mocks']

  beforeEach(() => {
    const mockSetup = createSupabaseMock()
    supabase = mockSetup.supabase
    mocks = mockSetup.mocks
    service = new BoardService(supabase)
  })

  describe('create', () => {
    it('inserts new board into database', async () => {
      // Arrange
      const createData = {
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Sprint 24 Board',
        description: 'Board for sprint 24',
      }

      const createdBoard = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        project_id: createData.project_id,
        name: createData.name,
        description: createData.description,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mocks.singleMock.mockResolvedValue({
        data: createdBoard,
        error: null,
      })

      // Act
      const result = await service.create(createData)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('boards')
      expect(mocks.insertMock).toHaveBeenCalledWith([createData])
      expect(mocks.singleMock).toHaveBeenCalled()
      expect(result).toEqual(
        expect.objectContaining({
          id: createdBoard.id,
          projectId: createData.project_id,
          name: createData.name,
        })
      )
    })

    it('transforms snake_case from DB to camelCase', async () => {
      // Arrange
      const createData = {
        project_id: 'proj-123',
        name: 'Test Board',
      }

      mocks.singleMock.mockResolvedValue({
        data: {
          id: 'board-1',
          project_id: 'proj-123',
          name: 'Test Board',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      })

      // Act
      const result = await service.create(createData)

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          projectId: 'proj-123',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      )
    })

    it('throws error when database insert fails', async () => {
      // Arrange
      const createData = {
        project_id: 'proj-123',
        name: 'Test',
      }

      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '23503' },
      })

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow('Database error')
    })
  })

  describe('getById', () => {
    it('retrieves board by id', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const dbBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Test Board',
        description: 'Description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mocks.singleMock.mockResolvedValue({
        data: dbBoard,
        error: null,
      })

      // Act
      const result = await service.getById(boardId)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('boards')
      expect(mocks.selectMock).toHaveBeenCalled()
      expect(mocks.eqMock).toHaveBeenCalledWith('id', boardId)
      expect(mocks.singleMock).toHaveBeenCalled()
      expect(result).toEqual(
        expect.objectContaining({
          id: boardId,
          projectId: 'proj-123',
          name: 'Test Board',
        })
      )
    })

    it('retrieves board with columns when requested', async () => {
      // Arrange
      const boardId = 'board-1'
      const dbBoard = {
        id: boardId,
        project_id: 'proj-1',
        name: 'Board',
        board_columns: [
          {
            id: 'col-1',
            board_id: boardId,
            name: 'To Do',
            position: 0,
            wip_limit: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mocks.singleMock.mockResolvedValue({
        data: dbBoard,
        error: null,
      })

      // Act
      const result = await service.getById(boardId, { includeColumns: true })

      // Assert
      expect(mocks.selectMock).toHaveBeenCalledWith('*, board_columns(*)')
      expect(result.columns).toBeDefined()
      expect(result.columns).toHaveLength(1)
      expect(result.columns[0]).toEqual(
        expect.objectContaining({
          id: 'col-1',
          boardId: boardId,
          name: 'To Do',
          wipLimit: null,
        })
      )
    })

    it('returns null when board not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Act
      const result = await service.getById('non-existent-id')

      // Assert
      expect(result).toBeNull()
    })

    it('throws error for database errors', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { message: 'Connection error', code: 'CONNECTION_ERROR' },
      })

      // Act & Assert
      await expect(service.getById('any-id')).rejects.toThrow('Connection error')
    })
  })

  describe('list', () => {
    it('retrieves paginated list of boards', async () => {
      // Arrange
      const dbBoards = [
        {
          id: '1',
          project_id: 'proj-123',
          name: 'Board 1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          project_id: 'proj-123',
          name: 'Board 2',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ]

      mocks.rangeMock.mockResolvedValue({
        data: dbBoards,
        error: null,
        count: 2,
      })

      // Act
      const result = await service.list({
        project_id: 'proj-123',
        page: 1,
        limit: 20,
      })

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('boards')
      expect(mocks.selectMock).toHaveBeenCalled()
      expect(mocks.eqMock).toHaveBeenCalledWith('project_id', 'proj-123')
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('applies sorting', async () => {
      // Arrange
      mocks.rangeMock.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      // Act
      await service.list({
        project_id: 'proj-123',
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        order: 'desc',
      })

      // Assert
      expect(mocks.orderMock).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })
    })

    it('applies pagination with range', async () => {
      // Arrange
      mocks.rangeMock.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      // Act
      await service.list({
        project_id: 'proj-123',
        page: 2,
        limit: 10,
      })

      // Assert
      expect(mocks.rangeMock).toHaveBeenCalledWith(10, 19) // page 2, limit 10
    })
  })

  describe('update', () => {
    it('updates board fields', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'
      const updateData = {
        name: 'Updated Name',
      }

      const updatedBoard = {
        id: boardId,
        project_id: 'proj-123',
        name: 'Updated Name',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      mocks.singleMock.mockResolvedValue({
        data: updatedBoard,
        error: null,
      })

      // Act
      const result = await service.update(boardId, updateData)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('boards')
      expect(mocks.updateMock).toHaveBeenCalledWith(updateData)
      expect(mocks.eqMock).toHaveBeenCalledWith('id', boardId)
      expect(result).toEqual(
        expect.objectContaining({
          id: boardId,
          name: 'Updated Name',
        })
      )
    })

    it('returns null when board not found', async () => {
      // Arrange
      mocks.singleMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Act
      const result = await service.update('non-existent-id', { name: 'Test' })

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('deletes board by id', async () => {
      // Arrange
      const boardId = '550e8400-e29b-41d4-a716-446655440000'

      mocks.deleteMock.mockResolvedValue({
        data: { id: boardId },
        error: null,
      })

      // Act
      const result = await service.delete(boardId)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('boards')
      expect(mocks.deleteMock).toHaveBeenCalled()
      expect(mocks.eqMock).toHaveBeenCalledWith('id', boardId)
      expect(result).toBe(true)
    })

    it('returns false when board not found', async () => {
      // Arrange
      mocks.deleteMock.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Act
      const result = await service.delete('non-existent-id')

      // Assert
      expect(result).toBe(false)
    })

    it('throws error for database constraint violations', async () => {
      // Arrange
      mocks.deleteMock.mockResolvedValue({
        data: null,
        error: { code: '23503', message: 'Foreign key violation' },
      })

      // Act & Assert
      await expect(service.delete('board-id')).rejects.toThrow('Foreign key violation')
    })
  })

  describe('createColumn', () => {
    it('inserts new column into board_columns table', async () => {
      // Arrange
      const columnData = {
        board_id: 'board-1',
        name: 'In Progress',
        position: 1,
        wip_limit: 3,
      }

      const createdColumn = {
        id: 'col-1',
        ...columnData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mocks.singleMock.mockResolvedValue({
        data: createdColumn,
        error: null,
      })

      // Act
      const result = await service.createColumn(columnData)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('board_columns')
      expect(mocks.insertMock).toHaveBeenCalledWith([columnData])
      expect(result).toEqual(
        expect.objectContaining({
          id: 'col-1',
          boardId: 'board-1',
          name: 'In Progress',
          wipLimit: 3,
        })
      )
    })
  })

  describe('updateColumn', () => {
    it('updates column fields', async () => {
      // Arrange
      const columnId = 'col-1'
      const updateData = {
        name: 'Updated Name',
        wip_limit: 5,
      }

      const updatedColumn = {
        id: columnId,
        board_id: 'board-1',
        name: 'Updated Name',
        position: 1,
        wip_limit: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      mocks.singleMock.mockResolvedValue({
        data: updatedColumn,
        error: null,
      })

      // Act
      const result = await service.updateColumn(columnId, updateData)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('board_columns')
      expect(mocks.updateMock).toHaveBeenCalledWith(updateData)
      expect(result.wipLimit).toBe(5)
    })
  })

  describe('deleteColumn', () => {
    it('deletes column by id', async () => {
      // Arrange
      const columnId = 'col-1'

      mocks.deleteMock.mockResolvedValue({
        data: { id: columnId },
        error: null,
      })

      // Act
      const result = await service.deleteColumn(columnId)

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('board_columns')
      expect(mocks.deleteMock).toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })

  describe('reorderColumns', () => {
    it('batch updates column positions', async () => {
      // Arrange
      const reorderData = [
        { id: 'col-1', position: 1 },
        { id: 'col-2', position: 0 },
      ]

      mocks.updateMock.mockResolvedValue({
        data: reorderData.map((col) => ({ ...col, board_id: 'board-1' })),
        error: null,
      })

      // Act
      const result = await service.reorderColumns(reorderData)

      // Assert
      expect(result).toBe(true)
      expect(mocks.updateMock).toHaveBeenCalled()
    })
  })
})
