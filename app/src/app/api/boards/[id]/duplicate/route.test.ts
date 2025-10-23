/**
 * Board Duplication API Routes Tests
 *
 * Tests API endpoint for duplicating boards.
 * POST /api/boards/:id/duplicate - Duplicate board with all columns
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/features/boards/use-cases/duplicateBoard');
vi.mock('@/lib/supabase-server');

import { duplicateBoard } from '@/features/boards/use-cases/duplicateBoard';
import { createClient } from '@/lib/supabase-server';

describe('POST /api/boards/:id/duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
    } as any);
  });

  describe('authentication', () => {
    it('requires authentication', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy of Sprint 24' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('duplicates board with new name', async () => {
      const mockDuplicatedBoard = {
        id: 'board-new',
        project_id: 'proj-1',
        name: 'Copy of Sprint 24',
        description: 'Board for sprint 24',
        created_by: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
        columns: [
          { id: 'col-new-1', name: 'To Do', position: 0, color: '#3b82f6' },
          { id: 'col-new-2', name: 'In Progress', position: 1, color: '#eab308', wip_limit: 3 },
          { id: 'col-new-3', name: 'Done', position: 2, color: '#22c55e' },
        ],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockDuplicatedBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Copy of Sprint 24',
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data.id).toBe('board-new');
      expect(data.data.name).toBe('Copy of Sprint 24');
      expect(data.data.columns).toHaveLength(3);
      expect(duplicateBoard).toHaveBeenCalledWith(
        'board-1',
        expect.objectContaining({
          name: 'Copy of Sprint 24',
        }),
        expect.any(Object)
      );
    });

    it('duplicates board with all column properties', async () => {
      const mockDuplicatedBoard = {
        id: 'board-new',
        name: 'Copy',
        columns: [
          {
            id: 'col-new-1',
            name: 'To Do',
            position: 0,
            color: '#3b82f6',
            wip_limit: null,
          },
          {
            id: 'col-new-2',
            name: 'In Progress',
            position: 1,
            color: '#eab308',
            wip_limit: 3, // WIP limit preserved
          },
        ],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockDuplicatedBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      const data = await response.json();
      expect(data.data.columns[1].wip_limit).toBe(3);
      expect(data.data.columns[1].color).toBe('#eab308');
    });

    it('generates unique IDs for duplicated board and columns', async () => {
      const mockDuplicatedBoard = {
        id: 'board-new-unique',
        name: 'Copy',
        columns: [
          { id: 'col-new-unique-1', name: 'To Do' },
          { id: 'col-new-unique-2', name: 'Done' },
        ],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockDuplicatedBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      const data = await response.json();
      // IDs should be different from original
      expect(data.data.id).not.toBe('board-1');
      expect(data.data.columns[0].id).not.toBe('col-1');
    });

    it('preserves description when duplicating', async () => {
      const mockDuplicatedBoard = {
        id: 'board-new',
        name: 'Copy',
        description: 'Original description',
        columns: [],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockDuplicatedBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Copy',
            includeDescription: true,
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      const data = await response.json();
      expect(data.data.description).toBe('Original description');
    });
  });

  describe('validation', () => {
    it('rejects when name is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

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
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'ab' }), // Min 3
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

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
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'x'.repeat(101) }), // Max 100
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
    });

    it('rejects invalid JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: 'invalid json',
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
    });
  });

  describe('authorization', () => {
    it('allows duplication when user has board access', async () => {
      const mockBoard = {
        id: 'board-new',
        name: 'Copy',
        columns: [],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(201);
    });

    it('rejects when user lacks board access', async () => {
      vi.mocked(duplicateBoard).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this board')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-other/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-other' } });

      expect(response.status).toBe(403);
    });
  });

  describe('error handling', () => {
    it('returns 404 when original board not found', async () => {
      vi.mocked(duplicateBoard).mockRejectedValue(
        new Error('BOARD_NOT_FOUND')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/nonexistent/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'nonexistent' } });

      expect(response.status).toBe(404);
    });

    it('returns 409 when name conflicts with existing board', async () => {
      vi.mocked(duplicateBoard).mockRejectedValue(
        new Error('DUPLICATE_KEY: Board name already exists in project')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Existing Board' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error.message).toContain('already exists');
    });

    it('handles database errors gracefully', async () => {
      vi.mocked(duplicateBoard).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(500);
    });
  });

  describe('tasks handling', () => {
    it('does not duplicate tasks by default', async () => {
      const mockDuplicatedBoard = {
        id: 'board-new',
        name: 'Copy',
        columns: [
          { id: 'col-1', name: 'To Do', tasks: [] }, // Empty tasks
        ],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockDuplicatedBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Copy' }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      const data = await response.json();
      // Columns duplicated but tasks not included
      expect(data.data.columns).toBeDefined();
    });

    it('optionally duplicates tasks when requested', async () => {
      const mockDuplicatedBoard = {
        id: 'board-new',
        name: 'Copy with tasks',
        columns: [
          {
            id: 'col-1',
            name: 'To Do',
            tasks: [
              { id: 'task-new-1', title: 'Task 1' },
              { id: 'task-new-2', title: 'Task 2' },
            ],
          },
        ],
      };

      vi.mocked(duplicateBoard).mockResolvedValue(mockDuplicatedBoard);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Copy with tasks',
            includeTasks: true,
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      const data = await response.json();
      expect(data.data.columns[0].tasks).toHaveLength(2);
    });
  });
});
