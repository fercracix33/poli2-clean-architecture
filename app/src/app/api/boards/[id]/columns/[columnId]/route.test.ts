/**
 * Column Operations API Routes Tests
 *
 * Tests API endpoints for individual column operations.
 * PATCH /api/boards/:id/columns/:columnId - Update column
 * DELETE /api/boards/:id/columns/:columnId - Delete column
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/features/boards/use-cases/updateColumn');
vi.mock('@/features/boards/use-cases/deleteColumn');
vi.mock('@/lib/supabase-server');

import { updateColumn } from '@/features/boards/use-cases/updateColumn';
import { deleteColumn } from '@/features/boards/use-cases/deleteColumn';
import { createClient } from '@/lib/supabase-server';

describe('PATCH /api/boards/:id/columns/:columnId', () => {
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

  it('updates column name', async () => {
    const mockUpdated = {
      id: 'col-1',
      board_id: 'board-1',
      name: 'Blocked',
      position: 1,
      color: '#ef4444',
      wip_limit: null,
    };

    vi.mocked(updateColumn).mockResolvedValue(mockUpdated);

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Blocked' }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.name).toBe('Blocked');
  });

  it('updates column wip_limit', async () => {
    const mockUpdated = {
      id: 'col-1',
      name: 'In Progress',
      wip_limit: 5,
    };

    vi.mocked(updateColumn).mockResolvedValue(mockUpdated);

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ wip_limit: 5 }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    const data = await response.json();
    expect(data.data.wip_limit).toBe(5);
  });

  it('removes wip_limit when set to null', async () => {
    const mockUpdated = {
      id: 'col-1',
      name: 'Done',
      wip_limit: null,
    };

    vi.mocked(updateColumn).mockResolvedValue(mockUpdated);

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ wip_limit: null }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    const data = await response.json();
    expect(data.data.wip_limit).toBeNull();
  });

  it('updates column color', async () => {
    const mockUpdated = {
      id: 'col-1',
      name: 'Testing',
      color: '#f59e0b',
    };

    vi.mocked(updateColumn).mockResolvedValue(mockUpdated);

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ color: '#f59e0b' }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    const data = await response.json();
    expect(data.data.color).toBe('#f59e0b');
  });

  it('rejects invalid color format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ color: 'blue' }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    expect(response.status).toBe(400);
  });

  it('returns 404 when column not found', async () => {
    vi.mocked(updateColumn).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/nonexistent',
      {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test' }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'nonexistent' },
    });

    expect(response.status).toBe(404);
  });

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
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test' }),
      }
    );

    const response = await PATCH(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    expect(response.status).toBe(401);
  });
});

describe('DELETE /api/boards/:id/columns/:columnId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);
  });

  it('deletes column successfully', async () => {
    vi.mocked(deleteColumn).mockResolvedValue(undefined);

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    expect(response.status).toBe(204);
    expect(deleteColumn).toHaveBeenCalledWith(
      'board-1',
      'col-1',
      expect.any(Object)
    );
  });

  it('returns 409 when column has tasks', async () => {
    vi.mocked(deleteColumn).mockRejectedValue(
      new Error('COLUMN_HAS_TASKS')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error.message).toContain('has tasks');
  });

  it('returns 404 when column not found', async () => {
    vi.mocked(deleteColumn).mockRejectedValue(
      new Error('COLUMN_NOT_FOUND')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/nonexistent',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: { id: 'board-1', columnId: 'nonexistent' },
    });

    expect(response.status).toBe(404);
  });

  it('returns 403 when user lacks permission', async () => {
    vi.mocked(deleteColumn).mockRejectedValue(
      new Error('FORBIDDEN')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/boards/board-1/columns/col-1',
      { method: 'DELETE' }
    );

    const response = await DELETE(request, {
      params: { id: 'board-1', columnId: 'col-1' },
    });

    expect(response.status).toBe(403);
  });
});
