/**
 * Custom Fields API Routes Tests
 * POST /api/custom-fields - Create custom field definition
 * GET /api/custom-fields - List custom fields for board
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
vi.mock('@/features/custom-fields/use-cases/createCustomField');
vi.mock('@/features/custom-fields/use-cases/listCustomFields');
vi.mock('@/lib/supabase-server');

import { createCustomField } from '@/features/custom-fields/use-cases/createCustomField';
import { listCustomFields } from '@/features/custom-fields/use-cases/listCustomFields';
import { createClient } from '@/lib/supabase-server';

describe('POST /api/custom-fields', () => {
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

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
        method: 'POST',
        body: JSON.stringify({
          board_id: 'board-1',
          name: 'Story Points',
          field_type: 'number',
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
    it('creates number field with valid data', async () => {
      // Arrange
      const validData = {
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
        config: { min: 0, max: 100, step: 1 },
        required: false,
      };

      const createdField = {
        id: 'field-001',
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
        config: { min: 0, max: 100, step: 1 },
        required: false,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createCustomField).mockResolvedValue(createdField);

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(createdField);
      expect(createCustomField).toHaveBeenCalledWith(
        expect.objectContaining(validData),
        expect.any(Object),
        { user_id: 'user-123' }
      );
    });

    it('creates select field with options', async () => {
      // Arrange
      const validData = {
        board_id: 'board-123',
        name: 'Sprint',
        field_type: 'select',
        config: { options: ['Sprint 24', 'Sprint 25', 'Sprint 26'], multiple: false },
        required: false,
      };

      const createdField = {
        id: 'field-002',
        ...validData,
        position: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createCustomField).mockResolvedValue(createdField);

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('creates text field with max_length config', async () => {
      // Arrange
      const validData = {
        board_id: 'board-123',
        name: 'Notes',
        field_type: 'text',
        config: { max_length: 500, multiline: true },
        required: false,
      };

      const createdField = {
        id: 'field-003',
        ...validData,
        position: 2,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(createCustomField).mockResolvedValue(createdField);

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('rejects request with invalid JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
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
        board_id: 'board-123',
        name: 'x', // Too short (min 2 chars)
        field_type: 'number',
      };

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
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
          path: ['name'],
          message: expect.stringContaining('at least 2'),
        })
      );
      expect(createCustomField).not.toHaveBeenCalled();
    });

    it('rejects request with missing required field', async () => {
      // Arrange
      const invalidData = {
        board_id: 'board-123',
        // name missing
        field_type: 'number',
      };

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
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
          path: ['name'],
          message: expect.stringContaining('required'),
        })
      );
    });

    it('validates field_type enum', async () => {
      // Arrange
      const invalidData = {
        board_id: 'board-123',
        name: 'Custom Field',
        field_type: 'invalid_type', // Not in enum
      };

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
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
          path: ['field_type'],
        })
      );
    });

    it('validates name does not exceed max length', async () => {
      // Arrange
      const invalidData = {
        board_id: 'board-123',
        name: 'x'.repeat(101), // Exceeds 100 char limit
        field_type: 'text',
      };

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
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
          path: ['name'],
          message: expect.stringContaining('100'),
        })
      );
    });
  });

  describe('authorization', () => {
    it('allows creation in authorized board', async () => {
      // Arrange
      const validData = {
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
      };

      vi.mocked(createCustomField).mockResolvedValue({ id: 'field-001' } as any);

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
    });

    it('rejects creation in unauthorized board', async () => {
      // Arrange
      const validData = {
        board_id: 'board-unauthorized',
        name: 'Story Points',
        field_type: 'number',
      };

      vi.mocked(createCustomField).mockRejectedValue(new Error('FORBIDDEN'));

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
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
        board_id: 'board-123',
        name: 'Story Points',
        field_type: 'number',
      };

      vi.mocked(createCustomField).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/custom-fields', {
        method: 'POST',
        body: JSON.stringify(validData),
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to create custom field');
    });
  });
});

describe('GET /api/custom-fields', () => {
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
        'http://localhost:3000/api/custom-fields?board_id=board-1'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('query parameters', () => {
    it('lists custom fields for board', async () => {
      // Arrange
      const mockFields = [
        {
          id: 'field-001',
          board_id: 'board-123',
          name: 'Story Points',
          field_type: 'number',
          position: 0,
        },
        {
          id: 'field-002',
          board_id: 'board-123',
          name: 'Sprint',
          field_type: 'select',
          position: 1,
        },
      ];

      vi.mocked(listCustomFields).mockResolvedValue(mockFields as any);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-fields?board_id=board-123'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Story Points');
      expect(data[1].name).toBe('Sprint');
      expect(listCustomFields).toHaveBeenCalledWith(
        'board-123',
        expect.any(Object),
        { user_id: 'user-123' }
      );
    });

    it('validates board_id is required', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/custom-fields');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('validates board_id is UUID', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/custom-fields?board_id=not-a-uuid'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
    });

    it('returns empty array for board with no fields', async () => {
      // Arrange
      vi.mocked(listCustomFields).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-fields?board_id=board-empty'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([]);
    });
  });

  describe('authorization', () => {
    it('allows listing in authorized board', async () => {
      // Arrange
      vi.mocked(listCustomFields).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-fields?board_id=board-123'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
    });

    it('rejects listing in unauthorized board', async () => {
      // Arrange
      vi.mocked(listCustomFields).mockRejectedValue(new Error('FORBIDDEN'));

      const request = new NextRequest(
        'http://localhost:3000/api/custom-fields?board_id=board-unauthorized'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('error handling', () => {
    it('handles use case errors', async () => {
      // Arrange
      vi.mocked(listCustomFields).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        'http://localhost:3000/api/custom-fields?board_id=board-123'
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
    });
  });
});
