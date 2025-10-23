/**
 * Boards API Routes Tests
 *
 * Tests API endpoints for board creation and listing.
 * POST /api/boards - Create board with default columns
 * GET /api/boards - List boards by project
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock use cases
vi.mock('@/features/boards/use-cases/createBoard');
vi.mock('@/features/boards/use-cases/listBoards');
vi.mock('@/lib/supabase-server');

import { createBoard } from '@/features/boards/use-cases/createBoard';
import { listBoards } from '@/features/boards/use-cases/listBoards';
import { createClient } from '@/lib/supabase-server';

describe('POST /api/boards', () => {
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

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'Sprint 24',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });
  });

  describe('validation', () => {
    it('creates board successfully with valid data', async () => {
      // Arrange
      const mockCreatedBoard = {
        id: 'board-1',
        project_id: 'proj-1',
        name: 'Sprint 24',
        description: 'Board for sprint 24',
        created_by: 'user-123',
        created_at: new Date('2025-01-01T00:00:00Z'),
        updated_at: new Date('2025-01-01T00:00:00Z'),
      };

      vi.mocked(createBoard).mockResolvedValue(mockCreatedBoard);

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'Sprint 24',
          description: 'Board for sprint 24',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual({
        data: mockCreatedBoard,
      });
      expect(createBoard).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: 'proj-1',
          name: 'Sprint 24',
          description: 'Board for sprint 24',
        }),
        expect.any(Object)
      );
    });

    it('rejects request with invalid JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('rejects when name is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          // name missing
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('required'),
        })
      );
    });

    it('rejects when name is too short', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'a', // Too short (min 3)
        }),
      });

      // Act
      const response = await POST(request);

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

    it('rejects when name exceeds max length', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'x'.repeat(101), // Max is 100
        }),
      });

      // Act
      const response = await POST(request);

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

    it('rejects when project_id is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sprint 24',
          // project_id missing
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['project_id'],
          message: expect.stringContaining('required'),
        })
      );
    });

    it('rejects when project_id is invalid UUID', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'invalid-uuid',
          name: 'Sprint 24',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['project_id'],
          message: expect.stringContaining('uuid'),
        })
      );
    });

    it('accepts optional description', async () => {
      // Arrange
      const mockBoard = {
        id: 'board-1',
        project_id: 'proj-1',
        name: 'Sprint 24',
        description: null,
        created_by: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createBoard).mockResolvedValue(mockBoard);

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'Sprint 24',
          // description omitted
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });
  });

  describe('authorization', () => {
    it('allows creation when user has project permissions', async () => {
      // Arrange
      const mockBoard = {
        id: 'board-1',
        project_id: 'proj-1',
        name: 'Sprint 24',
        created_by: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createBoard).mockResolvedValue(mockBoard);

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'Sprint 24',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('rejects creation when user lacks project permissions', async () => {
      // Arrange
      vi.mocked(createBoard).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this project')
      );

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-other',
          name: 'Sprint 24',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('default columns', () => {
    it('creates board with default columns when none specified', async () => {
      // Arrange
      const mockBoard = {
        id: 'board-1',
        project_id: 'proj-1',
        name: 'New Board',
        created_by: 'user-123',
        columns: [
          { id: 'col-1', name: 'To Do', position: 0, wip_limit: null },
          { id: 'col-2', name: 'In Progress', position: 1, wip_limit: null },
          { id: 'col-3', name: 'Done', position: 2, wip_limit: null },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createBoard).mockResolvedValue(mockBoard);

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'New Board',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data.columns).toHaveLength(3);
      expect(data.data.columns[0].name).toBe('To Do');
      expect(data.data.columns[1].name).toBe('In Progress');
      expect(data.data.columns[2].name).toBe('Done');
    });
  });

  describe('error handling', () => {
    it('handles use case errors gracefully', async () => {
      // Arrange
      vi.mocked(createBoard).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'Sprint 24',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to create board');
    });

    it('handles duplicate board name', async () => {
      // Arrange
      vi.mocked(createBoard).mockRejectedValue(
        new Error('DUPLICATE_KEY: Board name already exists in project')
      );

      const request = new NextRequest('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 'proj-1',
          name: 'Existing Board',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error.code).toBe('DUPLICATE');
      expect(data.error.message).toContain('already exists');
    });
  });
});

describe('GET /api/boards', () => {
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
        'http://localhost:3000/api/boards?project_id=proj-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('validation', () => {
    it('lists boards for a project', async () => {
      // Arrange
      const mockBoards = [
        {
          id: 'board-1',
          project_id: 'proj-1',
          name: 'Sprint 24',
          description: null,
          created_at: new Date('2025-01-01'),
        },
        {
          id: 'board-2',
          project_id: 'proj-1',
          name: 'Backlog',
          description: 'Product backlog',
          created_at: new Date('2025-01-02'),
        },
      ];

      vi.mocked(listBoards).mockResolvedValue(mockBoards);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe('Sprint 24');
      expect(data.data[1].name).toBe('Backlog');
      expect(listBoards).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: 'proj-1',
        }),
        expect.any(Object)
      );
    });

    it('returns 400 when project_id is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/boards');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('project_id');
    });

    it('returns 400 when project_id is invalid UUID', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=invalid-uuid'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['project_id'],
          message: expect.stringContaining('uuid'),
        })
      );
    });

    it('returns empty array when no boards exist', async () => {
      // Arrange
      vi.mocked(listBoards).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-empty'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual([]);
    });
  });

  describe('pagination', () => {
    it('supports limit parameter', async () => {
      // Arrange
      vi.mocked(listBoards).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1&limit=10'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(listBoards).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
        }),
        expect.any(Object)
      );
    });

    it('supports offset parameter', async () => {
      // Arrange
      vi.mocked(listBoards).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1&offset=20'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(listBoards).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 20,
        }),
        expect.any(Object)
      );
    });

    it('supports both limit and offset', async () => {
      // Arrange
      vi.mocked(listBoards).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1&limit=10&offset=20'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(listBoards).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 20,
        }),
        expect.any(Object)
      );
    });

    it('applies default pagination values', async () => {
      // Arrange
      vi.mocked(listBoards).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(listBoards).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50, // Default
          offset: 0, // Default
        }),
        expect.any(Object)
      );
    });
  });

  describe('authorization', () => {
    it('only returns boards user has access to', async () => {
      // Arrange
      const mockBoards = [
        { id: 'board-1', project_id: 'proj-1', name: 'Board 1' },
      ];

      vi.mocked(listBoards).mockResolvedValue(mockBoards);

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(1);
    });

    it('returns 403 when user lacks project access', async () => {
      // Arrange
      vi.mocked(listBoards).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this project')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-other'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('error handling', () => {
    it('handles database errors gracefully', async () => {
      // Arrange
      vi.mocked(listBoards).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards?project_id=proj-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
