/**
 * Task Individual Operations API Routes Tests
 * GET /api/tasks/:id - Get task by ID
 * PATCH /api/tasks/:id - Update task
 * DELETE /api/tasks/:id - Delete task
 *
 * Tests API endpoints (controllers).
 * Mocks use cases and authentication.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/features/tasks/use-cases/getTask');
vi.mock('@/features/tasks/use-cases/updateTask');
vi.mock('@/features/tasks/use-cases/deleteTask');
vi.mock('@/lib/supabase-server');

import { getTask } from '@/features/tasks/use-cases/getTask';
import { updateTask } from '@/features/tasks/use-cases/updateTask';
import { deleteTask } from '@/features/tasks/use-cases/deleteTask';
import { createClient } from '@/lib/supabase-server';

const mockAuthUser = () => {
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
};

describe('GET /api/tasks/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
  });

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

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1');

    // Act
    const response = await GET(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(401);
  });

  it('gets task by ID successfully', async () => {
    // Arrange
    const mockTask = {
      id: 'task-001',
      board_column_id: 'col-123',
      organization_id: 'org-456',
      title: 'Test Task',
      description: 'Description here',
      position: 0,
      created_by: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(getTask).mockResolvedValue(mockTask);

    const request = new NextRequest('http://localhost:3000/api/tasks/task-001');

    // Act
    const response = await GET(request, { params: { id: 'task-001' } });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockTask);
    expect(getTask).toHaveBeenCalledWith('task-001', expect.any(Object), {
      user_id: 'user-123',
    });
  });

  it('returns 404 when task not found', async () => {
    // Arrange
    vi.mocked(getTask).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent');

    // Act
    const response = await GET(request, { params: { id: 'nonexistent' } });

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('validates task ID is UUID', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/tasks/not-a-uuid');

    // Act
    const response = await GET(request, { params: { id: 'not-a-uuid' } });

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('handles authorization errors', async () => {
    // Arrange
    vi.mocked(getTask).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1');

    // Act
    const response = await GET(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(403);
  });
});

describe('PATCH /api/tasks/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
  });

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

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated' }),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(401);
  });

  it('updates task successfully', async () => {
    // Arrange
    const updates = {
      title: 'Updated Title',
      priority: 'urgent',
    };

    const updatedTask = {
      id: 'task-001',
      board_column_id: 'col-123',
      organization_id: 'org-456',
      title: 'Updated Title',
      priority: 'urgent',
      position: 0,
      created_by: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(updateTask).mockResolvedValue(updatedTask);

    const request = new NextRequest('http://localhost:3000/api/tasks/task-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-001' } });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Updated Title');
    expect(updateTask).toHaveBeenCalledWith(
      'task-001',
      expect.objectContaining(updates),
      expect.any(Object),
      { user_id: 'user-123' }
    );
  });

  it('validates request body with Zod', async () => {
    // Arrange
    const invalidUpdates = {
      title: 'x', // Too short
    };

    const request = new NextRequest('http://localhost:3000/api/tasks/task-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidUpdates),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-001' } });

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('allows partial updates', async () => {
    // Arrange
    const partialUpdate = {
      priority: 'high',
    };

    const updatedTask = {
      id: 'task-001',
      board_column_id: 'col-123',
      organization_id: 'org-456',
      title: 'Original Title',
      priority: 'high', // Only this changed
      position: 0,
      created_by: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(updateTask).mockResolvedValue(updatedTask);

    const request = new NextRequest('http://localhost:3000/api/tasks/task-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialUpdate),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-001' } });

    // Assert
    expect(response.status).toBe(200);
  });

  it('updates custom_fields_values', async () => {
    // Arrange
    const updates = {
      custom_fields_values: {
        'field-sprint': 'Sprint 25',
        'field-points': 13,
      },
    };

    const updatedTask = {
      id: 'task-001',
      title: 'Task',
      custom_fields_values: updates.custom_fields_values,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(updateTask).mockResolvedValue(updatedTask as any);

    const request = new NextRequest('http://localhost:3000/api/tasks/task-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-001' } });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.custom_fields_values).toEqual(updates.custom_fields_values);
  });

  it('returns 404 when task not found', async () => {
    // Arrange
    vi.mocked(updateTask).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated' }),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'nonexistent' } });

    // Assert
    expect(response.status).toBe(404);
  });

  it('handles authorization errors', async () => {
    // Arrange
    vi.mocked(updateTask).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated' }),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(403);
  });

  it('rejects invalid JSON', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });

    // Act
    const response = await PATCH(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('INVALID_REQUEST');
  });
});

describe('DELETE /api/tasks/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
  });

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

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(401);
  });

  it('deletes task successfully', async () => {
    // Arrange
    vi.mocked(deleteTask).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/tasks/task-001', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'task-001' } });

    // Assert
    expect(response.status).toBe(204);
    expect(deleteTask).toHaveBeenCalledWith('task-001', expect.any(Object), {
      user_id: 'user-123',
    });
  });

  it('returns 404 when task not found', async () => {
    // Arrange
    vi.mocked(deleteTask).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'nonexistent' } });

    // Assert
    expect(response.status).toBe(404);
  });

  it('validates task ID is UUID', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/tasks/not-a-uuid', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'not-a-uuid' } });

    // Assert
    expect(response.status).toBe(400);
  });

  it('handles authorization errors', async () => {
    // Arrange
    vi.mocked(deleteTask).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(403);
  });

  it('handles database errors', async () => {
    // Arrange
    vi.mocked(deleteTask).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'task-1' } });

    // Assert
    expect(response.status).toBe(500);
  });
});
