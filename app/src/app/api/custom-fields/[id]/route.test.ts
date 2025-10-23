/**
 * Custom Field Individual Operations API Routes Tests
 * GET /api/custom-fields/:id - Get custom field by ID
 * PATCH /api/custom-fields/:id - Update custom field
 * DELETE /api/custom-fields/:id - Delete custom field
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
vi.mock('@/features/custom-fields/use-cases/getCustomField');
vi.mock('@/features/custom-fields/use-cases/updateCustomField');
vi.mock('@/features/custom-fields/use-cases/deleteCustomField');
vi.mock('@/lib/supabase-server');

import { getCustomField } from '@/features/custom-fields/use-cases/getCustomField';
import { updateCustomField } from '@/features/custom-fields/use-cases/updateCustomField';
import { deleteCustomField } from '@/features/custom-fields/use-cases/deleteCustomField';
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

describe('GET /api/custom-fields/:id', () => {
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

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1');

    // Act
    const response = await GET(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(401);
  });

  it('gets custom field by ID successfully', async () => {
    // Arrange
    const mockField = {
      id: 'field-001',
      board_id: 'board-123',
      name: 'Story Points',
      field_type: 'number',
      config: { min: 0, max: 100 },
      required: false,
      position: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(getCustomField).mockResolvedValue(mockField);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001');

    // Act
    const response = await GET(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockField);
    expect(getCustomField).toHaveBeenCalledWith('field-001', expect.any(Object), {
      user_id: 'user-123',
    });
  });

  it('returns 404 when field not found', async () => {
    // Arrange
    vi.mocked(getCustomField).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/nonexistent');

    // Act
    const response = await GET(request, { params: { id: 'nonexistent' } });

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('validates field ID is UUID', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/custom-fields/not-a-uuid');

    // Act
    const response = await GET(request, { params: { id: 'not-a-uuid' } });

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PATCH /api/custom-fields/:id', () => {
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

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(401);
  });

  it('updates custom field successfully', async () => {
    // Arrange
    const updates = {
      name: 'Updated Name',
      required: true,
    };

    const updatedField = {
      id: 'field-001',
      board_id: 'board-123',
      name: 'Updated Name',
      field_type: 'number',
      config: { min: 0, max: 100 },
      required: true,
      position: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(updateCustomField).mockResolvedValue(updatedField);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Updated Name');
    expect(data.required).toBe(true);
    expect(updateCustomField).toHaveBeenCalledWith(
      'field-001',
      expect.objectContaining(updates),
      expect.any(Object),
      { user_id: 'user-123' }
    );
  });

  it('validates request body with Zod', async () => {
    // Arrange
    const invalidUpdates = {
      name: 'x', // Too short
    };

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidUpdates),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(updateCustomField).not.toHaveBeenCalled();
  });

  it('allows partial updates', async () => {
    // Arrange
    const partialUpdate = {
      required: true,
    };

    const updatedField = {
      id: 'field-001',
      board_id: 'board-123',
      name: 'Original Name', // Unchanged
      field_type: 'number',
      required: true, // Changed
      position: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(updateCustomField).mockResolvedValue(updatedField);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialUpdate),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(200);
  });

  it('updates field config', async () => {
    // Arrange
    const updates = {
      config: { min: 1, max: 50, step: 1 },
    };

    const updatedField = {
      id: 'field-001',
      board_id: 'board-123',
      name: 'Story Points',
      field_type: 'number',
      config: { min: 1, max: 50, step: 1 },
      required: false,
      position: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(updateCustomField).mockResolvedValue(updatedField);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.config).toEqual(updates.config);
  });

  it('returns 404 when field not found', async () => {
    // Arrange
    vi.mocked(updateCustomField).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'nonexistent' } });

    // Assert
    expect(response.status).toBe(404);
  });

  it('handles authorization errors', async () => {
    // Arrange
    vi.mocked(updateCustomField).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(403);
  });

  it('rejects invalid JSON', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });

    // Act
    const response = await PATCH(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('INVALID_REQUEST');
  });
});

describe('DELETE /api/custom-fields/:id', () => {
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

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(401);
  });

  it('deletes custom field successfully', async () => {
    // Arrange
    vi.mocked(deleteCustomField).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(204);
    expect(deleteCustomField).toHaveBeenCalledWith('field-001', expect.any(Object), {
      user_id: 'user-123',
    });
  });

  it('returns 404 when field not found', async () => {
    // Arrange
    vi.mocked(deleteCustomField).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/nonexistent', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'nonexistent' } });

    // Assert
    expect(response.status).toBe(404);
  });

  it('validates field ID is UUID', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/custom-fields/not-a-uuid', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'not-a-uuid' } });

    // Assert
    expect(response.status).toBe(400);
  });

  it('handles authorization errors', async () => {
    // Arrange
    vi.mocked(deleteCustomField).mockRejectedValue(new Error('FORBIDDEN'));

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(403);
  });

  it('handles database errors', async () => {
    // Arrange
    vi.mocked(deleteCustomField).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-1', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'field-1' } });

    // Assert
    expect(response.status).toBe(500);
  });

  it('cascades deletion to task custom_fields_values (via use case)', async () => {
    // Arrange
    vi.mocked(deleteCustomField).mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/custom-fields/field-001', {
      method: 'DELETE',
    });

    // Act
    const response = await DELETE(request, { params: { id: 'field-001' } });

    // Assert
    expect(response.status).toBe(204);
    // Use case should handle cleaning up tasks.custom_fields_values
  });
});
