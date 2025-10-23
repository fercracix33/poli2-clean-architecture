/**
 * Board by ID API Routes Tests
 *
 * Tests API endpoints for individual board operations.
 * GET /api/boards/:id - Get board with columns
 * PATCH /api/boards/:id - Update board
 * DELETE /api/boards/:id - Delete board
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock use cases
vi.mock('@/features/boards/use-cases/getBoard');
vi.mock('@/features/boards/use-cases/updateBoard');
vi.mock('@/features/boards/use-cases/deleteBoard');
vi.mock('@/lib/supabase-server');

import { getBoard } from '@/features/boards/use-cases/getBoard';
import { updateBoard } from '@/features/boards/use-cases/updateBoard';
import { deleteBoard } from '@/features/boards/use-cases/deleteBoard';
import { createClient } from '@/lib/supabase-server';

describe('GET /api/boards/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
    } as any);
  });

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
      } as any);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1');

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('gets board by id with columns', async () => {
      // Arrange
      const mockBoard = {
        id: 'board-1',
        project_id: 'proj-1',
        name: 'Sprint 24',
        description: 'Board for sprint 24',
        created_by: 'user-123',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
        columns: [
          {
            id: 'col-1',
            name: 'To Do',
            position: 0,
            color: '#3b82f6',
            wip_limit: null,
          },
          {
            id: 'col-2',
            name: 'In Progress',
            position: 1,
            color: '#eab308',
            wip_limit: 3,
          },
          {
            id: 'col-3',
            name: 'Done',
            position: 2,
            color: '#22c55e',
            wip_limit: null,
          },
        ],
      };

      vi.mocked(getBoard).mockResolvedValue(mockBoard);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1');

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual(mockBoard);
      expect(data.data.columns).toHaveLength(3);
      expect(getBoard).toHaveBeenCalledWith('board-1', expect.any(Object));
    });

    it('includes column details in response', async () => {
      // Arrange
      const mockBoard = {
        id: 'board-1',
        name: 'Sprint 24',
        columns: [
          {
            id: 'col-1',
            name: 'To Do',
            position: 0,
            color: '#3b82f6',
            wip_limit: null,
          },
          {
            id: 'col-2',
            name: 'Done',
            position: 1,
            color: '#22c55e',
            wip_limit: 10,
          },
        ],
      };

      vi.mocked(getBoard).mockResolvedValue(mockBoard);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1');

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data.columns).toHaveLength(2);
      expect(data.data.columns[0]).toHaveProperty('color');
      expect(data.data.columns[0]).toHaveProperty('wip_limit');
      expect(data.data.columns[0]).toHaveProperty('position');
    });
  });

  describe('error cases', () => {
    it('returns 404 when board not found', async () => {
      // Arrange
      vi.mocked(getBoard).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/boards/nonexistent');

      // Act
      const response = await GET(request, { params: { id: 'nonexistent' } });

      // Assert
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toContain('Board not found');
    });

    it('returns 400 when id is invalid UUID', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards/invalid-id');

      // Act
      const response = await GET(request, { params: { id: 'invalid-id' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 403 when user lacks access', async () => {
      // Arrange
      vi.mocked(getBoard).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this board')
      );

      const request = new NextRequest('http://localhost:3000/api/boards/board-1');

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(403);
    });
  });
});

describe('PATCH /api/boards/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
    } as any);
  });

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
      } as any);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('updates board name', async () => {
      // Arrange
      const mockUpdatedBoard = {
        id: 'board-1',
        project_id: 'proj-1',
        name: 'Updated Name',
        description: 'Original description',
        created_by: 'user-123',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-02'),
      };

      vi.mocked(updateBoard).mockResolvedValue(mockUpdatedBoard);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).toBe('Updated Name');
      expect(updateBoard).toHaveBeenCalledWith(
        'board-1',
        expect.objectContaining({
          name: 'Updated Name',
        }),
        expect.any(Object)
      );
    });

    it('updates board description', async () => {
      // Arrange
      const mockUpdatedBoard = {
        id: 'board-1',
        name: 'Board',
        description: 'New description',
        updated_at: new Date(),
      };

      vi.mocked(updateBoard).mockResolvedValue(mockUpdatedBoard);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'New description' }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data.description).toBe('New description');
    });

    it('updates both name and description', async () => {
      // Arrange
      const mockUpdatedBoard = {
        id: 'board-1',
        name: 'New Name',
        description: 'New description',
        updated_at: new Date(),
      };

      vi.mocked(updateBoard).mockResolvedValue(mockUpdatedBoard);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Name',
          description: 'New description',
        }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data.name).toBe('New Name');
      expect(data.data.description).toBe('New description');
    });

    it('allows clearing description', async () => {
      // Arrange
      const mockUpdatedBoard = {
        id: 'board-1',
        name: 'Board',
        description: null,
        updated_at: new Date(),
      };

      vi.mocked(updateBoard).mockResolvedValue(mockUpdatedBoard);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: null }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data.description).toBeNull();
    });
  });

  describe('validation', () => {
    it('rejects invalid JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
    });

    it('rejects name that is too short', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'ab' }), // Min 3
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('at least 3'),
        })
      );
    });

    it('rejects name that exceeds max length', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'x'.repeat(101) }), // Max 100
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('at most 100'),
        })
      );
    });

    it('rejects empty update', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // No fields to update
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('at least one field');
    });
  });

  describe('error cases', () => {
    it('returns 404 when board not found', async () => {
      // Arrange
      vi.mocked(updateBoard).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/boards/nonexistent', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'nonexistent' } });

      // Assert
      expect(response.status).toBe(404);
    });

    it('returns 403 when user lacks permission', async () => {
      // Arrange
      vi.mocked(updateBoard).mockRejectedValue(
        new Error('FORBIDDEN: User cannot modify this board')
      );

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      });

      // Act
      const response = await PATCH(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(403);
    });
  });
});

describe('DELETE /api/boards/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
    } as any);
  });

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
      } as any);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('deletes board successfully', async () => {
      // Arrange
      vi.mocked(deleteBoard).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(204);
      expect(deleteBoard).toHaveBeenCalledWith('board-1', expect.any(Object));
    });

    it('returns no content on successful deletion', async () => {
      // Arrange
      vi.mocked(deleteBoard).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(204);
      const text = await response.text();
      expect(text).toBe('');
    });
  });

  describe('error cases', () => {
    it('returns 404 when board not found', async () => {
      // Arrange
      vi.mocked(deleteBoard).mockRejectedValue(
        new Error('BOARD_NOT_FOUND')
      );

      const request = new NextRequest('http://localhost:3000/api/boards/nonexistent', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'nonexistent' } });

      // Assert
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('returns 409 when board has tasks', async () => {
      // Arrange
      vi.mocked(deleteBoard).mockRejectedValue(
        new Error('BOARD_HAS_TASKS: Cannot delete board with tasks')
      );

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error.code).toBe('CONFLICT');
      expect(data.error.message).toContain('has tasks');
    });

    it('returns 403 when user lacks permission', async () => {
      // Arrange
      vi.mocked(deleteBoard).mockRejectedValue(
        new Error('FORBIDDEN: User cannot delete this board')
      );

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(403);
    });

    it('handles database errors gracefully', async () => {
      // Arrange
      vi.mocked(deleteBoard).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      });

      // Act
      const response = await DELETE(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
