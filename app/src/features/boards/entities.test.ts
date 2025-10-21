/**
 * Boards Feature - Entity Tests
 *
 * Tests Zod schemas for data validation.
 * IMPORTANT: Uses .safeParse() for all validations (never .parse()).
 *
 * Created by: Test Agent
 * Date: 2025-01-21
 * Feature: Customizable Kanban Boards (PRD: projects-001-customizable-kanban-boards)
 */

import { describe, it, expect } from 'vitest';
import {
  BoardSchema,
  BoardCreateSchema,
  BoardUpdateSchema,
  BoardQuerySchema,
  BoardColumnSchema,
  BoardColumnCreateSchema,
  BoardColumnUpdateSchema,
  BoardColumnReorderSchema,
  isBoard,
  isBoardCreate,
  isBoardColumn,
  isBoardColumnCreate,
} from './entities';

// ============================================================================
// BOARD SCHEMA TESTS
// ============================================================================

describe('BoardSchema', () => {
  describe('valid data', () => {
    it('accepts valid complete board', () => {
      const validBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Sprint 24 Board',
        description: 'Kanban board for Sprint 24',
        settings: {},
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      const result = BoardSchema.safeParse(validBoard);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validBoard);
      }
    });

    it('accepts board with optional fields as null', () => {
      const validBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Minimal Board',
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(validBoard);

      expect(result.success).toBe(true);
    });

    it('accepts board with minimum name length (2 chars)', () => {
      const validBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'AB',
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(validBoard);

      expect(result.success).toBe(true);
    });

    it('accepts board with maximum name length (100 chars)', () => {
      const validBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'x'.repeat(100),
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(validBoard);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('rejects board with invalid uuid', () => {
      const invalidBoard = {
        id: 'not-a-uuid',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Test Board',
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(invalidBoard);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].code).toBe('invalid_string');
        expect(result.error.issues[0].validation).toBe('uuid');
        expect(result.error.issues[0].path).toEqual(['id']);
      }
    });

    it('rejects board with missing required name', () => {
      const invalidBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        // name missing
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(invalidBoard);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects board with name too short (1 char)', () => {
      const invalidBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'A',
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(invalidBoard);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('rejects board with name too long (101 chars)', () => {
      const invalidBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'x'.repeat(101),
        description: null,
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(invalidBoard);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('100 characters');
      }
    });

    it('rejects board with description too long (1001 chars)', () => {
      const invalidBoard = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Test Board',
        description: 'x'.repeat(1001),
        settings: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardSchema.safeParse(invalidBoard);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['description']);
        expect(result.error.issues[0].message).toContain('1000 characters');
      }
    });
  });
});

describe('BoardCreateSchema', () => {
  it('accepts data without auto-generated fields', () => {
    const createData = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'New Board',
      description: 'A new kanban board',
      settings: {},
    };

    const result = BoardCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
  });

  it('omits id field (auto-generated)', () => {
    const createData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'New Board',
    };

    const result = BoardCreateSchema.safeParse(createData);

    // Zod omits the field, doesn't reject
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('id');
    }
  });

  it('omits created_at field (auto-generated)', () => {
    const createData = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'New Board',
      created_at: new Date(),
    };

    const result = BoardCreateSchema.safeParse(createData);

    // Zod omits the field, doesn't reject
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('created_at');
    }
  });
});

describe('BoardUpdateSchema', () => {
  it('accepts partial data (only name)', () => {
    const updateData = {
      name: 'Updated Board Name',
    };

    const result = BoardUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = BoardUpdateSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('omits unrecognized fields', () => {
    const updateData = {
      name: 'Updated Board',
      project_id: '550e8400-e29b-41d4-a716-446655440001', // Not in schema
    };

    const result = BoardUpdateSchema.safeParse(updateData);

    // Zod omits unknown fields, doesn't reject
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('project_id');
      expect(result.data.name).toBe('Updated Board');
    }
  });
});

describe('BoardQuerySchema', () => {
  it('accepts valid query parameters', () => {
    const queryParams = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      page: 1,
      limit: 20,
    };

    const result = BoardQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(true);
  });

  it('coerces string numbers to numbers', () => {
    const queryParams = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      page: '2',
      limit: '50',
    };

    const result = BoardQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('applies default values', () => {
    const queryParams = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = BoardQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('rejects limit exceeding maximum (101)', () => {
    const queryParams = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      limit: 101,
    };

    const result = BoardQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_big');
      expect(result.error.issues[0].maximum).toBe(100);
    }
  });
});

// ============================================================================
// BOARD COLUMN SCHEMA TESTS
// ============================================================================

describe('BoardColumnSchema', () => {
  describe('valid data', () => {
    it('accepts valid complete column', () => {
      const validColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'In Progress',
        color: '#3B82F6',
        wip_limit: 5,
        position: 1,
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      const result = BoardColumnSchema.safeParse(validColumn);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validColumn);
      }
    });

    it('accepts column with null wip_limit (no limit)', () => {
      const validColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'To Do',
        color: '#6B7280',
        wip_limit: null,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(validColumn);

      expect(result.success).toBe(true);
    });

    it('accepts column with default color', () => {
      const validColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Done',
        // color omitted (should use default)
        wip_limit: null,
        position: 2,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(validColumn);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBe('#6B7280');
      }
    });
  });

  describe('invalid data', () => {
    it('rejects column with invalid hex color', () => {
      const invalidColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Review',
        color: 'blue', // Invalid format
        wip_limit: null,
        position: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(invalidColumn);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
        expect(result.error.issues[0].validation).toBe('regex');
        expect(result.error.issues[0].path).toEqual(['color']);
        expect(result.error.issues[0].message).toContain('valid HEX');
      }
    });

    it('rejects column with non-positive wip_limit', () => {
      const invalidColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'In Progress',
        color: '#3B82F6',
        wip_limit: 0, // Must be positive
        position: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(invalidColumn);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['wip_limit']);
      }
    });

    it('rejects column with name too short (1 char)', () => {
      const invalidColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'A',
        color: '#6B7280',
        wip_limit: null,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(invalidColumn);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects column with name too long (51 chars)', () => {
      const invalidColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'x'.repeat(51),
        color: '#6B7280',
        wip_limit: null,
        position: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(invalidColumn);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects column with negative position', () => {
      const invalidColumn = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'To Do',
        color: '#6B7280',
        wip_limit: null,
        position: -1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = BoardColumnSchema.safeParse(invalidColumn);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['position']);
      }
    });
  });
});

describe('BoardColumnCreateSchema', () => {
  it('accepts data without auto-generated position', () => {
    const createData = {
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Blocked',
      color: '#EF4444',
      wip_limit: 3,
    };

    const result = BoardColumnCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
  });

  it('omits position field (auto-assigned)', () => {
    const createData = {
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Blocked',
      color: '#EF4444',
      position: 3, // Should be omitted
    };

    const result = BoardColumnCreateSchema.safeParse(createData);

    // Zod omits the field, doesn't reject
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('position');
    }
  });
});

describe('BoardColumnUpdateSchema', () => {
  it('accepts partial data (only wip_limit)', () => {
    const updateData = {
      wip_limit: 10,
    };

    const result = BoardColumnUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = BoardColumnUpdateSchema.safeParse({});

    expect(result.success).toBe(true);
  });
});

describe('BoardColumnReorderSchema', () => {
  it('accepts valid reorder data', () => {
    const reorderData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      position: 2,
    };

    const result = BoardColumnReorderSchema.safeParse(reorderData);

    expect(result.success).toBe(true);
  });

  it('rejects reorder with negative position', () => {
    const reorderData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      position: -1,
    };

    const result = BoardColumnReorderSchema.safeParse(reorderData);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TYPE GUARDS TESTS
// ============================================================================

describe('Type Guards', () => {
  it('isBoard returns true for valid board', () => {
    const validBoard = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      organization_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Test Board',
      description: null,
      settings: null,
      created_by: '550e8400-e29b-41d4-a716-446655440003',
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(isBoard(validBoard)).toBe(true);
  });

  it('isBoard returns false for invalid board', () => {
    const invalidBoard = {
      id: 'not-a-uuid',
      name: 'Test',
    };

    expect(isBoard(invalidBoard)).toBe(false);
  });

  it('isBoardCreate returns true for valid create data', () => {
    const createData = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'New Board',
    };

    expect(isBoardCreate(createData)).toBe(true);
  });

  it('isBoardColumn returns true for valid column', () => {
    const validColumn = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'To Do',
      color: '#6B7280',
      wip_limit: null,
      position: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(isBoardColumn(validColumn)).toBe(true);
  });

  it('isBoardColumnCreate returns true for valid create data', () => {
    const createData = {
      board_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Blocked',
      color: '#EF4444',
    };

    expect(isBoardColumnCreate(createData)).toBe(true);
  });
});
