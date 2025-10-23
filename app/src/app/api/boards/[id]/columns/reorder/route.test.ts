/**
 * Column Reorder API Routes Tests
 *
 * Tests API endpoint for reordering columns (drag & drop).
 * POST /api/boards/:id/columns/reorder - Reorder columns
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/features/boards/use-cases/reorderColumns');
vi.mock('@/lib/supabase-server');

import { reorderColumns } from '@/features/boards/use-cases/reorderColumns';
import { createClient } from '@/lib/supabase-server';

describe('POST /api/boards/:id/columns/reorder', () => {
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
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({ columnOrder: ['col-1', 'col-2'] }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(401);
    });
  });

  describe('success cases', () => {
    it('reorders columns successfully', async () => {
      const mockReorderedColumns = [
        { id: 'col-2', name: 'In Progress', position: 0 },
        { id: 'col-1', name: 'To Do', position: 1 },
        { id: 'col-3', name: 'Done', position: 2 },
      ];

      vi.mocked(reorderColumns).mockResolvedValue(mockReorderedColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            columnOrder: ['col-2', 'col-1', 'col-3'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveLength(3);
      expect(data.data[0].id).toBe('col-2');
      expect(data.data[1].id).toBe('col-1');
      expect(reorderColumns).toHaveBeenCalledWith(
        'board-1',
        ['col-2', 'col-1', 'col-3'],
        expect.any(Object)
      );
    });

    it('handles moving column to beginning', async () => {
      const mockReorderedColumns = [
        { id: 'col-3', position: 0 },
        { id: 'col-1', position: 1 },
        { id: 'col-2', position: 2 },
      ];

      vi.mocked(reorderColumns).mockResolvedValue(mockReorderedColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-3', 'col-1', 'col-2'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data[0].id).toBe('col-3');
      expect(data.data[0].position).toBe(0);
    });

    it('handles moving column to end', async () => {
      const mockReorderedColumns = [
        { id: 'col-2', position: 0 },
        { id: 'col-3', position: 1 },
        { id: 'col-1', position: 2 },
      ];

      vi.mocked(reorderColumns).mockResolvedValue(mockReorderedColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-2', 'col-3', 'col-1'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data[2].id).toBe('col-1');
    });
  });

  describe('validation', () => {
    it('rejects when columnOrder is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
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
          path: ['columnOrder'],
          message: expect.stringContaining('required'),
        })
      );
    });

    it('rejects when columnOrder is not an array', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: 'not-an-array',
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects when columnOrder is empty', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: [],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('at least one column');
    });

    it('rejects when columnOrder contains invalid UUID', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'invalid-uuid', 'col-3'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
    });

    it('rejects when columnOrder has duplicates', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'col-2', 'col-1'], // Duplicate col-1
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('duplicate');
    });
  });

  describe('authorization', () => {
    it('allows reordering when user has board access', async () => {
      const mockReorderedColumns = [
        { id: 'col-1', position: 0 },
        { id: 'col-2', position: 1 },
      ];

      vi.mocked(reorderColumns).mockResolvedValue(mockReorderedColumns);

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'col-2'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(200);
    });

    it('rejects when user lacks board access', async () => {
      vi.mocked(reorderColumns).mockRejectedValue(
        new Error('FORBIDDEN: User does not have access to this board')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-other/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'col-2'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-other' } });

      expect(response.status).toBe(403);
    });
  });

  describe('error handling', () => {
    it('returns 404 when board not found', async () => {
      vi.mocked(reorderColumns).mockRejectedValue(
        new Error('BOARD_NOT_FOUND')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/nonexistent/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'col-2'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'nonexistent' } });

      expect(response.status).toBe(404);
    });

    it('returns 400 when column IDs do not match board columns', async () => {
      vi.mocked(reorderColumns).mockRejectedValue(
        new Error('INVALID_COLUMN_IDS: Some columns do not belong to this board')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'col-from-other-board'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('do not belong');
    });

    it('handles database errors gracefully', async () => {
      vi.mocked(reorderColumns).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/boards/board-1/columns/reorder',
        {
          method: 'POST',
          body: JSON.stringify({
            columnOrder: ['col-1', 'col-2'],
          }),
        }
      );

      const response = await POST(request, { params: { id: 'board-1' } });

      expect(response.status).toBe(500);
    });
  });
});
