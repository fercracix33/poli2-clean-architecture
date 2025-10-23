/**
 * Board Columns API Routes Tests
 *
 * Tests API endpoints for column operations on a board.
 * POST /api/boards/:id/columns - Create column
 * GET /api/boards/:id/columns - List columns
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock use cases
vi.mock('@/features/boards/use-cases/createColumn');
vi.mock('@/features/boards/use-cases/listColumns');
vi.mock('@/lib/supabase-server');

import { createColumn } from '@/features/boards/use-cases/createColumn';
import { listColumns } from '@/features/boards/use-cases/listColumns';
import { createClient } from '@/lib/supabase-server';

describe('POST /api/boards/:id/columns', () => {
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

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'In Review' }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('creates column successfully', async () => {
      // Arrange
      const mockColumn = {
        id: 'col-new',
        board_id: 'board-1',
        name: 'In Review',
        position: 3,
        color: '#8b5cf6',
        wip_limit: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createColumn).mockResolvedValue(mockColumn);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'In Review',
            color: '#8b5cf6',
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data).toEqual(mockColumn);
      expect(createColumn).toHaveBeenCalledWith(
        'board-1',
        expect.objectContaining({
          name: 'In Review',
          color: '#8b5cf6',
        }),
        expect.any(Object)
      );
    });

    it('creates column with WIP limit', async () => {
      // Arrange
      const mockColumn = {
        id: 'col-new',
        board_id: 'board-1',
        name: 'Testing',
        position: 4,
        color: '#f59e0b',
        wip_limit: 5,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createColumn).mockResolvedValue(mockColumn);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Testing',
            color: '#f59e0b',
            wip_limit: 5,
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data.wip_limit).toBe(5);
    });

    it('auto-assigns position at end', async () => {
      // Arrange
      const mockColumn = {
        id: 'col-new',
        board_id: 'board-1',
        name: 'Archive',
        position: 10, // Last position
        color: '#6b7280',
        wip_limit: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createColumn).mockResolvedValue(mockColumn);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Archive',
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data.position).toBe(10);
    });
  });

  describe('validation', () => {
    it('rejects when name is missing', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: '#3b82f6',
            // name missing
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('required'),
        })
      );
    });

    it('rejects when name is too short', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'a', // Min 2
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('at least 2'),
        })
      );
    });

    it('rejects when name exceeds max length', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'x'.repeat(51), // Max 50
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('at most 50'),
        })
      );
    });

    it('rejects when color is invalid format', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'In Review',
            color: 'blue', // Must be hex
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['color'],
          message: expect.stringContaining('hex'),
        })
      );
    });

    it('rejects when wip_limit is negative', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Testing',
            wip_limit: -5,
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['wip_limit'],
          message: expect.stringContaining('at least 0'),
        })
      );
    });

    it('rejects when wip_limit exceeds maximum', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Testing',
            wip_limit: 1001, // Max 1000
          }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['wip_limit'],
          message: expect.stringContaining('at most 1000'),
        })
      );
    });
  });

  describe('authorization', () => {
    it('allows creation when user has board access', async () => {
      // Arrange
      const mockColumn = {
        id: 'col-new',
        board_id: 'board-1',
        name: 'Ready',
        position: 0,
      };

      vi.mocked(createColumn).mockResolvedValue(mockColumn);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Ready' }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(201);
    });

    it('rejects when user lacks board access', async () => {
      // Arrange
      vi.mocked(createColumn).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this board')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-other/columns',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Ready' }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-other' } });

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('error handling', () => {
    it('returns 404 when board not found', async () => {
      // Arrange
      vi.mocked(createColumn).mockRejectedValue(
        new Error('BOARD_NOT_FOUND')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/nonexistent/columns',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Ready' }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'nonexistent' } });

      // Assert
      expect(response.status).toBe(404);
    });

    it('returns 409 when column name already exists', async () => {
      // Arrange
      vi.mocked(createColumn).mockRejectedValue(
        new Error('DUPLICATE_COLUMN_NAME')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'To Do' }), // Already exists
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error.message).toContain('already exists');
    });

    it('handles database errors gracefully', async () => {
      // Arrange
      vi.mocked(createColumn).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Ready' }),
        }
      );

      // Act
      const response = await POST(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(500);
    });
  });
});

describe('GET /api/boards/:id/columns', () => {
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

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('lists columns for a board', async () => {
      // Arrange
      const mockColumns = [
        {
          id: 'col-1',
          board_id: 'board-1',
          name: 'To Do',
          position: 0,
          color: '#3b82f6',
          wip_limit: null,
        },
        {
          id: 'col-2',
          board_id: 'board-1',
          name: 'In Progress',
          position: 1,
          color: '#eab308',
          wip_limit: 3,
        },
        {
          id: 'col-3',
          board_id: 'board-1',
          name: 'Done',
          position: 2,
          color: '#22c55e',
          wip_limit: null,
        },
      ];

      vi.mocked(listColumns).mockResolvedValue(mockColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(3);
      expect(data.data[0].name).toBe('To Do');
      expect(data.data[1].name).toBe('In Progress');
      expect(data.data[2].name).toBe('Done');
      expect(listColumns).toHaveBeenCalledWith('board-1', expect.any(Object));
    });

    it('returns columns ordered by position', async () => {
      // Arrange
      const mockColumns = [
        { id: 'col-1', name: 'To Do', position: 0 },
        { id: 'col-2', name: 'In Progress', position: 1 },
        { id: 'col-3', name: 'Done', position: 2 },
      ];

      vi.mocked(listColumns).mockResolvedValue(mockColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      const data = await response.json();
      expect(data.data[0].position).toBe(0);
      expect(data.data[1].position).toBe(1);
      expect(data.data[2].position).toBe(2);
    });

    it('returns empty array when board has no columns', async () => {
      // Arrange
      vi.mocked(listColumns).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-empty/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-empty' } });

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual([]);
    });
  });

  describe('authorization', () => {
    it('only returns columns user has access to', async () => {
      // Arrange
      const mockColumns = [
        { id: 'col-1', name: 'To Do', position: 0 },
      ];

      vi.mocked(listColumns).mockResolvedValue(mockColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(200);
    });

    it('returns 403 when user lacks board access', async () => {
      // Arrange
      vi.mocked(listColumns).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this board')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-other/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-other' } });

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('error handling', () => {
    it('returns 404 when board not found', async () => {
      // Arrange
      vi.mocked(listColumns).mockRejectedValue(
        new Error('BOARD_NOT_FOUND')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/nonexistent/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'nonexistent' } });

      // Assert
      expect(response.status).toBe(404);
    });

    it('handles database errors gracefully', async () => {
      // Arrange
      vi.mocked(listColumns).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns'
      );

      // Act
      const response = await GET(request, { params: { id: 'board-1' } });

      // Assert
      expect(response.status).toBe(500);
    });
  });
});
