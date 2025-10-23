/**
 * POST /api/tasks/:id/move API Route Tests
 *
 * Tests CRITICAL API endpoint for moving tasks.
 * Validates WIP limits enforcement at HTTP layer.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/features/tasks/use-cases/moveTask')
vi.mock('@/lib/supabase-server')

import { moveTask } from '@/features/tasks/use-cases/moveTask'
import { createClient } from '@/lib/supabase-server'

describe('POST /api/tasks/:id/move', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock authenticated user
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
          error: null,
        }),
      },
    } as any)
  })

  describe('authentication', () => {
    it('requires authentication', async () => {
      // Arrange
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      } as any)

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify({
            source_column_id: 'col-1',
            target_column_id: 'col-2',
            target_position: 0,
          }),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
    })
  })

  describe('validation', () => {
    it('moves task with valid data', async () => {
      // Arrange
      const validData = {
        source_column_id: '550e8400-e29b-41d4-a716-446655440001',
        target_column_id: '550e8400-e29b-41d4-a716-446655440002',
        target_position: 2,
      }

      const movedTask = {
        id: 'task-1',
        board_column_id: validData.target_column_id,
        position: validData.target_position,
        title: 'Test Task',
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(moveTask).mockResolvedValue(movedTask)

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ data: movedTask })
      expect(moveTask).toHaveBeenCalledWith(
        expect.objectContaining({
          task_id: 'task-1',
          ...validData,
        }),
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('rejects request with invalid JSON', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json',
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.code).toBe('INVALID_REQUEST')
    })

    it('validates request body with Zod schema', async () => {
      // Arrange - Missing required fields
      const invalidData = {
        source_column_id: 'col-1',
        // target_column_id missing
        target_position: 0,
      }

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.details).toBeDefined()
      expect(moveTask).not.toHaveBeenCalled()
    })

    it('rejects request with invalid UUID in task_id', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/not-a-uuid/move',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'not-a-uuid' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['task_id'],
          message: expect.stringContaining('uuid'),
        })
      )
    })

    it('rejects request with negative position', async () => {
      // Arrange
      const invalidData = {
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: -1, // Invalid
      }

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['target_position'],
        })
      )
    })
  })

  describe('WIP Limit Enforcement (CRITICAL)', () => {
    it('returns 409 CONFLICT when WIP limit exceeded', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-source',
        target_column_id: 'col-limited',
        target_position: 3,
      }

      // Mock use case throwing WIP_LIMIT_EXCEEDED error
      vi.mocked(moveTask).mockRejectedValue(
        new Error('WIP_LIMIT_EXCEEDED: Column "In Progress" has reached its limit of 3 tasks')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(409) // CONFLICT
      const data = await response.json()
      expect(data.error.code).toBe('WIP_LIMIT_EXCEEDED')
      expect(data.error.message).toContain('has reached its limit')
    })

    it('allows move when under WIP limit', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-source',
        target_column_id: 'col-limited',
        target_position: 2,
      }

      const movedTask = {
        id: 'task-1',
        board_column_id: 'col-limited',
        position: 2,
        title: 'Test Task',
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(moveTask).mockResolvedValue(movedTask)

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.position).toBe(2)
    })
  })

  describe('authorization', () => {
    it('allows move for user in board project', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      // Mock user belongs to board's project
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'user-123',
                user_metadata: { project_ids: ['proj-456'] },
              },
            },
            error: null,
          }),
        },
      } as any)

      vi.mocked(moveTask).mockResolvedValue({ id: 'task-1' } as any)

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(200)
    })

    it('rejects move for user not in board project', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      // Mock use case throwing authorization error
      vi.mocked(moveTask).mockRejectedValue(
        new Error('User not authorized to move tasks in this board')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error.code).toBe('FORBIDDEN')
    })
  })

  describe('error handling', () => {
    it('handles use case errors gracefully', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      vi.mocked(moveTask).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error.code).toBe('INTERNAL_ERROR')
      expect(data.error.message).toBe('Failed to move task')
    })

    it('returns 404 when task not found', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-1',
        target_column_id: 'col-2',
        target_position: 0,
      }

      vi.mocked(moveTask).mockRejectedValue(new Error('Task not found'))

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/non-existent/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'non-existent' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error.code).toBe('NOT_FOUND')
    })
  })

  describe('edge cases', () => {
    it('handles moving to same column', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-same',
        target_column_id: 'col-same', // Same column
        target_position: 2,
      }

      const movedTask = {
        id: 'task-1',
        board_column_id: 'col-same',
        position: 2,
        title: 'Test Task',
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(moveTask).mockResolvedValue(movedTask)

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(200)
    })

    it('handles moving to empty column', async () => {
      // Arrange
      const validData = {
        source_column_id: 'col-source',
        target_column_id: 'col-empty',
        target_position: 0,
      }

      const movedTask = {
        id: 'task-1',
        board_column_id: 'col-empty',
        position: 0,
        title: 'Test Task',
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(moveTask).mockResolvedValue(movedTask)

      const request = new NextRequest(
        'http://localhost:3000/api/tasks/task-1/move',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        }
      )

      const params = { params: { id: 'task-1' } }

      // Act
      const response = await POST(request, params)

      // Assert
      expect(response.status).toBe(200)
    })
  })
})
