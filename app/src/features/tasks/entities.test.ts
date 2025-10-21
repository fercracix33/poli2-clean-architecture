/**
 * Tasks Feature - Entity Tests
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
  TaskSchema,
  TaskCreateSchema,
  TaskUpdateSchema,
  TaskMoveSchema,
  TaskQuerySchema,
  TaskPriorityEnum,
  isTask,
  isTaskCreate,
  isTaskMove,
  isValidTaskPriority,
} from './entities';

// ============================================================================
// TASK SCHEMA TESTS
// ============================================================================

describe('TaskSchema', () => {
  describe('valid data', () => {
    it('accepts valid complete task', () => {
      const validTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Implement drag & drop',
        description: 'Use dnd-kit for task movement between columns',
        assigned_to: '550e8400-e29b-41d4-a716-446655440003',
        priority: 'high',
        due_date: new Date('2025-02-01T00:00:00Z'),
        position: 0,
        custom_fields_values: {
          'story-points-field-id': 5,
          'sprint-field-id': 'Sprint 24',
        },
        created_by: '550e8400-e29b-41d4-a716-446655440004',
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      const result = TaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validTask);
      }
    });

    it('accepts task with all optional fields as null', () => {
      const validTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Minimal Task',
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
    });

    it('accepts task with custom_fields_values as empty object', () => {
      const validTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Task with no custom fields',
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: {},
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
    });

    it('accepts task with minimum title length (2 chars)', () => {
      const validTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'AB',
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('rejects task with invalid board_column_id uuid', () => {
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: 'not-a-uuid',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Test Task',
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
        expect(result.error.issues[0].validation).toBe('uuid');
        expect(result.error.issues[0].path).toEqual(['board_column_id']);
      }
    });

    it('rejects task with title too short (1 char)', () => {
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'A',
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('rejects task with title too long (201 chars)', () => {
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'x'.repeat(201),
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toContain('200 characters');
      }
    });

    it('rejects task with description too long (5001 chars)', () => {
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Test Task',
        description: 'x'.repeat(5001),
        assigned_to: null,
        priority: null,
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['description']);
        expect(result.error.issues[0].message).toContain('5000 characters');
      }
    });

    it('rejects task with invalid priority enum', () => {
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Test Task',
        description: null,
        assigned_to: null,
        priority: 'critical', // Not in enum
        due_date: null,
        position: 0,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
        expect(result.error.issues[0].path).toEqual(['priority']);
        expect(result.error.issues[0].options).toEqual(['low', 'medium', 'high', 'urgent']);
      }
    });

    it('rejects task with negative position', () => {
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        board_column_id: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Test Task',
        description: null,
        assigned_to: null,
        priority: null,
        due_date: null,
        position: -1,
        custom_fields_values: null,
        created_by: '550e8400-e29b-41d4-a716-446655440003',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = TaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['position']);
      }
    });
  });
});

describe('TaskPriorityEnum', () => {
  it('accepts valid priority values', () => {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    validPriorities.forEach((priority) => {
      const result = TaskPriorityEnum.safeParse(priority);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid priority value', () => {
    const result = TaskPriorityEnum.safeParse('critical');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('low, medium, high, or urgent');
    }
  });
});

describe('TaskCreateSchema', () => {
  it('accepts data without auto-generated fields', () => {
    const createData = {
      board_column_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'New Task',
      description: 'Task description',
      assigned_to: '550e8400-e29b-41d4-a716-446655440002',
      priority: 'medium',
      due_date: new Date('2025-03-01'),
      custom_fields_values: {
        'story-points': 3,
      },
    };

    const result = TaskCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
  });

  it('omits id field (auto-generated)', () => {
    const createData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      board_column_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'New Task',
    };

    const result = TaskCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('id');
    }
  });

  it('omits position field (auto-assigned)', () => {
    const createData = {
      board_column_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'New Task',
      position: 0, // Should be auto-assigned
    };

    const result = TaskCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('position');
    }
  });
});

describe('TaskUpdateSchema', () => {
  it('accepts partial data (only title)', () => {
    const updateData = {
      title: 'Updated Title',
    };

    const result = TaskUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = TaskUpdateSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('accepts updating custom_fields_values', () => {
    const updateData = {
      custom_fields_values: {
        'story-points': 5,
        'sprint': 'Sprint 25',
      },
    };

    const result = TaskUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('omits unrecognized fields (board_column_id)', () => {
    const updateData = {
      title: 'Updated',
      board_column_id: '550e8400-e29b-41d4-a716-446655440001', // Not allowed in update
    };

    const result = TaskUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('board_column_id');
      expect(result.data.title).toBe('Updated');
    }
  });
});

describe('TaskMoveSchema', () => {
  it('accepts valid move data', () => {
    const moveData = {
      task_id: '550e8400-e29b-41d4-a716-446655440000',
      target_column_id: '550e8400-e29b-41d4-a716-446655440001',
      target_position: 2,
    };

    const result = TaskMoveSchema.safeParse(moveData);

    expect(result.success).toBe(true);
  });

  it('accepts target_position of 0', () => {
    const moveData = {
      task_id: '550e8400-e29b-41d4-a716-446655440000',
      target_column_id: '550e8400-e29b-41d4-a716-446655440001',
      target_position: 0,
    };

    const result = TaskMoveSchema.safeParse(moveData);

    expect(result.success).toBe(true);
  });

  it('rejects move with negative target_position', () => {
    const moveData = {
      task_id: '550e8400-e29b-41d4-a716-446655440000',
      target_column_id: '550e8400-e29b-41d4-a716-446655440001',
      target_position: -1,
    };

    const result = TaskMoveSchema.safeParse(moveData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_small');
      expect(result.error.issues[0].path).toEqual(['target_position']);
    }
  });

  it('rejects move with invalid task_id uuid', () => {
    const moveData = {
      task_id: 'not-a-uuid',
      target_column_id: '550e8400-e29b-41d4-a716-446655440001',
      target_position: 0,
    };

    const result = TaskMoveSchema.safeParse(moveData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('invalid_string');
      expect(result.error.issues[0].validation).toBe('uuid');
      expect(result.error.issues[0].path).toEqual(['task_id']);
    }
  });
});

describe('TaskQuerySchema', () => {
  it('accepts valid query parameters with all filters', () => {
    const queryParams = {
      board_id: '550e8400-e29b-41d4-a716-446655440000',
      search: 'implement',
      assigned_to: ['550e8400-e29b-41d4-a716-446655440001'],
      priority: ['high', 'urgent'],
      column_id: '550e8400-e29b-41d4-a716-446655440002',
      date_range: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      view_type: 'kanban',
    };

    const result = TaskQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(true);
  });

  it('accepts query with only required board_id', () => {
    const queryParams = {
      board_id: '550e8400-e29b-41d4-a716-446655440000',
    };

    const result = TaskQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.view_type).toBe('kanban'); // Default
    }
  });

  it('accepts all valid view_type values', () => {
    const viewTypes = ['kanban', 'list', 'calendar', 'table'];

    viewTypes.forEach((view_type) => {
      const result = TaskQuerySchema.safeParse({
        board_id: '550e8400-e29b-41d4-a716-446655440000',
        view_type,
      });
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid view_type', () => {
    const queryParams = {
      board_id: '550e8400-e29b-41d4-a716-446655440000',
      view_type: 'grid', // Not in enum
    };

    const result = TaskQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('invalid_enum_value');
      expect(result.error.issues[0].path).toEqual(['view_type']);
    }
  });

  it('rejects invalid priority in array', () => {
    const queryParams = {
      board_id: '550e8400-e29b-41d4-a716-446655440000',
      priority: ['high', 'critical'], // 'critical' invalid
    };

    const result = TaskQuerySchema.safeParse(queryParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('invalid_enum_value');
      expect(result.error.issues[0].path[0]).toBe('priority');
    }
  });
});

// ============================================================================
// TYPE GUARDS TESTS
// ============================================================================

describe('Type Guards', () => {
  it('isTask returns true for valid task', () => {
    const validTask = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      board_column_id: '550e8400-e29b-41d4-a716-446655440001',
      organization_id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Test Task',
      description: null,
      assigned_to: null,
      priority: null,
      due_date: null,
      position: 0,
      custom_fields_values: null,
      created_by: '550e8400-e29b-41d4-a716-446655440003',
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(isTask(validTask)).toBe(true);
  });

  it('isTask returns false for invalid task', () => {
    const invalidTask = {
      id: 'not-a-uuid',
      title: 'Test',
    };

    expect(isTask(invalidTask)).toBe(false);
  });

  it('isTaskCreate returns true for valid create data', () => {
    const createData = {
      board_column_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'New Task',
    };

    expect(isTaskCreate(createData)).toBe(true);
  });

  it('isTaskMove returns true for valid move data', () => {
    const moveData = {
      task_id: '550e8400-e29b-41d4-a716-446655440000',
      target_column_id: '550e8400-e29b-41d4-a716-446655440001',
      target_position: 0,
    };

    expect(isTaskMove(moveData)).toBe(true);
  });

  it('isValidTaskPriority returns true for valid priorities', () => {
    expect(isValidTaskPriority('low')).toBe(true);
    expect(isValidTaskPriority('medium')).toBe(true);
    expect(isValidTaskPriority('high')).toBe(true);
    expect(isValidTaskPriority('urgent')).toBe(true);
  });

  it('isValidTaskPriority returns false for invalid priority', () => {
    expect(isValidTaskPriority('critical')).toBe(false);
    expect(isValidTaskPriority('normal')).toBe(false);
  });
});
