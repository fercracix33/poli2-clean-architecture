/**
 * Tasks API Routes Tests
 * POST /api/tasks - Create task
 * GET /api/tasks - List tasks (with filters)
 *
 * Tests API endpoints (controllers).
 * Mocks use cases and authentication.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/features/tasks/use-cases/createTask');
vi.mock('@/features/tasks/use-cases/listTasks');
vi.mock('@/lib/supabase-server');

import { createTask } from '@/features/tasks/use-cases/createTask';
import { listTasks } from '@/features/tasks/use-cases/listTasks';
import { createClient } from '@/lib/supabase-server';

describe('POST /api/tasks', () => {
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

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          board_column_id: 'col-1',
          title: 'Test Task',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('validation', () => {
    it('creates task with valid data', async () => {
      // Arrange
      const validData = {
        board_column_id: 'col-123',
        title: 'Implement feature X',
        description: 'Detailed description here',
        priority: 'high',
      };

      const createdTask = {
        id: 'task-001',
        board_column_id: 'col-123',
        organization_id: 'org-456',
        title: 'Implement feature X',
        description: 'Detailed description here',
        priority: 'high',
        position: 0,
        created_by: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createTask).mockResolvedValue(createdTask);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(createdTask);
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining(validData),
        expect.any(Object),
        { user_id: 'user-123' }
      );
    });

    it('rejects request with invalid JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/tasks', {
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

    it('validates request body with Zod', async () => {
      // Arrange
      const invalidData = {
        board_column_id: 'col-123',
        title: 'x', // Too short (min 2 chars)
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['title'],
          message: expect.stringContaining('at least 2'),
        })
      );
      expect(createTask).not.toHaveBeenCalled();
    });

    it('rejects request with missing required field', async () => {
      // Arrange
      const invalidData = {
        // board_column_id missing
        title: 'Test Task',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['board_column_id'],
          message: expect.stringContaining('required'),
        })
      );
    });

    it('validates title does not exceed max length', async () => {
      // Arrange
      const invalidData = {
        board_column_id: 'col-123',
        title: 'x'.repeat(201), // Exceeds 200 char limit
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['title'],
          message: expect.stringContaining('200'),
        })
      );
    });

    it('validates priority enum value', async () => {
      // Arrange
      const invalidData = {
        board_column_id: 'col-123',
        title: 'Test Task',
        priority: 'super-urgent', // Not in enum
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.details).toContainEqual(
        expect.objectContaining({
          path: ['priority'],
        })
      );
    });

    it('accepts optional fields', async () => {
      // Arrange
      const minimalData = {
        board_column_id: 'col-123',
        title: 'Minimal Task',
      };

      const createdTask = {
        id: 'task-001',
        ...minimalData,
        organization_id: 'org-456',
        position: 0,
        created_by: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createTask).mockResolvedValue(createdTask);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });
  });

  describe('authorization', () => {
    it('allows creation in authorized organization', async () => {
      // Arrange
      const validData = {
        board_column_id: 'col-123',
        title: 'Test Task',
      };

      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'user-123',
                user_metadata: { organization_ids: ['org-456'] },
              },
            },
            error: null,
          }),
        },
      } as any);

      vi.mocked(createTask).mockResolvedValue({ id: 'task-001' } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('rejects creation in unauthorized organization', async () => {
      // Arrange
      const validData = {
        board_column_id: 'col-unauthorized',
        title: 'Test Task',
      };

      vi.mocked(createTask).mockRejectedValue(new Error('FORBIDDEN'));

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('error handling', () => {
    it('handles use case errors gracefully', async () => {
      // Arrange
      const validData = {
        board_column_id: 'col-123',
        title: 'Test Task',
      };

      vi.mocked(createTask).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to create task');
    });
  });
});

describe('GET /api/tasks', () => {
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

      const request = new NextRequest('http://localhost:3000/api/tasks?board_id=board-1');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('query parameters', () => {
    it('lists tasks with board_id filter', async () => {
      // Arrange
      const mockTasks = [
        {
          id: 'task-001',
          board_column_id: 'col-123',
          title: 'Task 1',
          position: 0,
        },
        {
          id: 'task-002',
          board_column_id: 'col-123',
          title: 'Task 2',
          position: 1,
        },
      ];

      vi.mocked(listTasks).mockResolvedValue(mockTasks);

      const request = new NextRequest('http://localhost:3000/api/tasks?board_id=board-1');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(2);
      expect(listTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          board_id: 'board-1',
        }),
        expect.any(Object)
      );
    });

    it('validates board_id is required', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/tasks');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('filters by column_id', async () => {
      // Arrange
      vi.mocked(listTasks).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?board_id=board-1&column_id=col-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(listTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          board_id: 'board-1',
          column_id: 'col-1',
        }),
        expect.any(Object)
      );
    });

    it('filters by assigned_to', async () => {
      // Arrange
      vi.mocked(listTasks).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?board_id=board-1&assigned_to=user-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(listTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          board_id: 'board-1',
          assigned_to: 'user-1',
        }),
        expect.any(Object)
      );
    });

    it('searches by text', async () => {
      // Arrange
      vi.mocked(listTasks).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?board_id=board-1&search=login'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(listTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          board_id: 'board-1',
          search: 'login',
        }),
        expect.any(Object)
      );
    });

    it('supports pagination', async () => {
      // Arrange
      vi.mocked(listTasks).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/tasks?board_id=board-1&page=2&limit=20'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect(listTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          board_id: 'board-1',
          page: 2,
          limit: 20,
        }),
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('handles use case errors', async () => {
      // Arrange
      vi.mocked(listTasks).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/tasks?board_id=board-1');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
    });
  });
});
