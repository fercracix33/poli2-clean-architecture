/**
 * Project Entities Tests
 *
 * Tests Zod schemas for data validation.
 * IMPORTANT: Uses .safeParse() for all validations (never .parse()).
 *
 * Created by: Test Agent
 * Date: 2025-10-15
 */

import { describe, it, expect } from 'vitest';
import {
  ProjectSchema,
  ProjectCreateSchema,
  ProjectUpdateSchema,
  ProjectFilterSchema,
  ProjectMemberSchema,
  ProjectMemberCreateSchema,
  ProjectWithStatsSchema,
  ProjectMemberWithUserSchema,
  isValidProjectStatus,
  isValidHexColor,
} from './entities';

// ============================================
// PROJECT SCHEMA TESTS
// ============================================

describe('ProjectSchema', () => {
  describe('valid data', () => {
    it('should accept valid complete project', () => {
      const validProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        description: 'This is a test project description',
        status: 'active' as const,
        color: '#3B82F6',
        icon: '📁',
        is_favorite: false,
        settings: { theme: 'dark' },
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
        archived_at: null,
      };

      const result = ProjectSchema.safeParse(validProject);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProject);
      }
    });

    it('should accept project with optional fields omitted', () => {
      const validProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Minimal Project',
        slug: 'minimal-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z'),
      };

      const result = ProjectSchema.safeParse(validProject);

      expect(result.success).toBe(true);
    });

    it('should accept project with archived_at populated', () => {
      const archivedProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Archived Project',
        slug: 'archived-project',
        status: 'archived' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
        archived_at: new Date('2024-01-02T00:00:00Z'),
      };

      const result = ProjectSchema.safeParse(archivedProject);

      expect(result.success).toBe(true);
    });

    it('should accept all valid status values', () => {
      const statuses = ['active', 'archived', 'completed', 'on_hold'] as const;

      statuses.forEach((status) => {
        const project = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          organization_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Project',
          slug: 'test-project',
          status,
          is_favorite: false,
          created_by: '550e8400-e29b-41d4-a716-446655440002',
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = ProjectSchema.safeParse(project);
        expect(result.success).toBe(true);
      });
    });

    it('should accept slug with hyphens and underscores', () => {
      const project = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project_2024',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(project);
      expect(result.success).toBe(true);
    });

    it('should accept valid HEX colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#3B82F6', '#abcdef'];

      colors.forEach((color) => {
        const project = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          organization_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Project',
          slug: 'test-project',
          status: 'active' as const,
          color,
          is_favorite: false,
          created_by: '550e8400-e29b-41d4-a716-446655440002',
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = ProjectSchema.safeParse(project);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid data', () => {
    it('should reject project with invalid UUID for id', () => {
      const invalidProject = {
        id: 'not-a-uuid',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
        expect(result.error.issues[0].validation).toBe('uuid');
        expect(result.error.issues[0].path).toEqual(['id']);
      }
    });

    it('should reject project with invalid UUID for organization_id', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: 'not-a-uuid',
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['organization_id']);
      }
    });

    it('should reject project with name too short', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'A', // Too short (min 2)
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject project with name too long', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'A'.repeat(101), // Too long (max 100)
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('100 characters');
      }
    });

    it('should reject project with slug too short', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'a', // Too short (min 2)
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject project with slug too long', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'a'.repeat(51), // Too long (max 50)
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject project with slug containing uppercase letters', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'Test-Project', // Contains uppercase
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
        expect(result.error.issues[0].validation).toEqual({ regex: {} });
        expect(result.error.issues[0].path).toEqual(['slug']);
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject project with slug containing spaces', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test project', // Contains spaces
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject project with slug containing special characters', () => {
      const invalidSlugs = ['test@project', 'test.project', 'test/project', 'test\\project'];

      invalidSlugs.forEach((slug) => {
        const invalidProject = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          organization_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Project',
          slug,
          status: 'active' as const,
          is_favorite: false,
          created_by: '550e8400-e29b-41d4-a716-446655440002',
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = ProjectSchema.safeParse(invalidProject);
        expect(result.success).toBe(false);
      });
    });

    it('should reject project with description too long', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        description: 'A'.repeat(1001), // Too long (max 1000)
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['description']);
        expect(result.error.issues[0].message).toContain('1000 characters');
      }
    });

    it('should reject project with invalid status', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        status: 'invalid_status', // Not in enum
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
        expect(result.error.issues[0].path).toEqual(['status']);
      }
    });

    it('should reject project with invalid HEX color format', () => {
      const invalidColors = ['#FF', '#GGGGGG', 'FF0000', '#FF00FF00', 'red'];

      invalidColors.forEach((color) => {
        const invalidProject = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          organization_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Project',
          slug: 'test-project',
          status: 'active' as const,
          color,
          is_favorite: false,
          created_by: '550e8400-e29b-41d4-a716-446655440002',
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = ProjectSchema.safeParse(invalidProject);
        expect(result.success).toBe(false);
      });
    });

    it('should reject project with icon too long', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        icon: 'A'.repeat(51), // Too long (max 50)
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
        expect(result.error.issues[0].path).toEqual(['icon']);
      }
    });

    it('should reject project with missing required field name', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        // name missing
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('should reject project with missing required field slug', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Project',
        // slug missing
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['slug']);
      }
    });

    it('should reject project with missing required field organization_id', () => {
      const invalidProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        // organization_id missing
        name: 'Test Project',
        slug: 'test-project',
        status: 'active' as const,
        is_favorite: false,
        created_by: '550e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = ProjectSchema.safeParse(invalidProject);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['organization_id']);
      }
    });
  });
});

// ============================================
// PROJECT CREATE SCHEMA TESTS
// ============================================

describe('ProjectCreateSchema', () => {
  it('should accept valid creation data with all fields', () => {
    const createData = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'New Project',
      slug: 'new-project',
      description: 'A new project description',
      status: 'active' as const,
      color: '#3B82F6',
      icon: '📁',
      is_favorite: true,
      settings: { theme: 'dark' },
    };

    const result = ProjectCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should accept data without optional fields', () => {
    const createData = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Minimal Project',
      slug: 'minimal-project',
    };

    const result = ProjectCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
  });

  it('should apply default status of active', () => {
    const createData = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'test-project',
    };

    const result = ProjectCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should apply default is_favorite of false', () => {
    const createData = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'test-project',
    };

    const result = ProjectCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_favorite).toBe(false);
    }
  });

  it('should reject data with invalid organization_id', () => {
    const createData = {
      organization_id: 'not-a-uuid',
      name: 'Test Project',
      slug: 'test-project',
    };

    const result = ProjectCreateSchema.safeParse(createData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['organization_id']);
    }
  });

  it('should reject data with invalid slug format', () => {
    const createData = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'Invalid Slug', // Contains uppercase and space
    };

    const result = ProjectCreateSchema.safeParse(createData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['slug']);
    }
  });
});

// ============================================
// PROJECT UPDATE SCHEMA TESTS
// ============================================

describe('ProjectUpdateSchema', () => {
  it('should accept partial update data', () => {
    const updateData = {
      name: 'Updated Name',
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('should accept empty object (all fields optional)', () => {
    const updateData = {};

    const result = ProjectUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('should accept update with multiple fields', () => {
    const updateData = {
      name: 'Updated Name',
      description: 'Updated description',
      status: 'completed' as const,
      color: '#FF0000',
      icon: '✅',
      is_favorite: true,
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(true);
  });

  it('should reject update with invalid name length', () => {
    const updateData = {
      name: 'A', // Too short
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name']);
    }
  });

  it('should reject update with invalid status', () => {
    const updateData = {
      status: 'invalid' as any,
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['status']);
    }
  });

  it('should reject update with invalid color format', () => {
    const updateData = {
      color: 'not-a-color',
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['color']);
    }
  });

  it('should not allow updating organization_id', () => {
    const updateData = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test',
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    // organization_id should not be in the schema, so it should be stripped
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('organization_id');
    }
  });

  it('should not allow updating slug', () => {
    const updateData = {
      slug: 'new-slug',
      name: 'Test',
    };

    const result = ProjectUpdateSchema.safeParse(updateData);

    // slug should not be in the schema, so it should be stripped
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('slug');
    }
  });
});

// ============================================
// PROJECT FILTER SCHEMA TESTS
// ============================================

describe('ProjectFilterSchema', () => {
  it('should accept valid filter with all fields', () => {
    const filters = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      status: 'active' as const,
      is_favorite: true,
      search: 'test project',
      created_by: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = ProjectFilterSchema.safeParse(filters);

    expect(result.success).toBe(true);
  });

  it('should accept filter with only organization_id', () => {
    const filters = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = ProjectFilterSchema.safeParse(filters);

    expect(result.success).toBe(true);
  });

  it('should reject filter without organization_id', () => {
    const filters = {
      status: 'active' as const,
    };

    const result = ProjectFilterSchema.safeParse(filters);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['organization_id']);
    }
  });

  it('should reject filter with invalid organization_id', () => {
    const filters = {
      organization_id: 'not-a-uuid',
    };

    const result = ProjectFilterSchema.safeParse(filters);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['organization_id']);
    }
  });

  it('should reject filter with invalid status', () => {
    const filters = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      status: 'invalid' as any,
    };

    const result = ProjectFilterSchema.safeParse(filters);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['status']);
    }
  });

  it('should reject filter with invalid created_by UUID', () => {
    const filters = {
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      created_by: 'not-a-uuid',
    };

    const result = ProjectFilterSchema.safeParse(filters);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['created_by']);
    }
  });
});

// ============================================
// PROJECT MEMBER SCHEMA TESTS
// ============================================

describe('ProjectMemberSchema', () => {
  it('should accept valid member data', () => {
    const memberData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date('2024-01-01T00:00:00Z'),
      invited_by: '550e8400-e29b-41d4-a716-446655440004',
    };

    const result = ProjectMemberSchema.safeParse(memberData);

    expect(result.success).toBe(true);
  });

  it('should accept member without invited_by', () => {
    const memberData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date('2024-01-01T00:00:00Z'),
    };

    const result = ProjectMemberSchema.safeParse(memberData);

    expect(result.success).toBe(true);
  });

  it('should reject member with invalid UUID', () => {
    const memberData = {
      id: 'not-a-uuid',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date(),
    };

    const result = ProjectMemberSchema.safeParse(memberData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['id']);
    }
  });

  it('should reject member with missing required field', () => {
    const memberData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      // user_id missing
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date(),
    };

    const result = ProjectMemberSchema.safeParse(memberData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['user_id']);
    }
  });
});

// ============================================
// PROJECT MEMBER CREATE SCHEMA TESTS
// ============================================

describe('ProjectMemberCreateSchema', () => {
  it('should accept valid member creation data', () => {
    const createData = {
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
    };

    const result = ProjectMemberCreateSchema.safeParse(createData);

    expect(result.success).toBe(true);
  });

  it('should reject creation without project_id', () => {
    const createData = {
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
    };

    const result = ProjectMemberCreateSchema.safeParse(createData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['project_id']);
    }
  });

  it('should reject creation with invalid UUIDs', () => {
    const createData = {
      project_id: 'not-a-uuid',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
    };

    const result = ProjectMemberCreateSchema.safeParse(createData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['project_id']);
    }
  });
});

// ============================================
// PROJECT WITH STATS SCHEMA TESTS
// ============================================

describe('ProjectWithStatsSchema', () => {
  it('should accept project with stats fields', () => {
    const projectWithStats = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'test-project',
      status: 'active' as const,
      is_favorite: false,
      created_by: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date(),
      updated_at: new Date(),
      member_count: 5,
      creator_name: 'John Doe',
    };

    const result = ProjectWithStatsSchema.safeParse(projectWithStats);

    expect(result.success).toBe(true);
  });

  it('should accept project with member_count zero', () => {
    const projectWithStats = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'test-project',
      status: 'active' as const,
      is_favorite: false,
      created_by: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date(),
      updated_at: new Date(),
      member_count: 0,
    };

    const result = ProjectWithStatsSchema.safeParse(projectWithStats);

    expect(result.success).toBe(true);
  });

  it('should reject project with negative member_count', () => {
    const projectWithStats = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'test-project',
      status: 'active' as const,
      is_favorite: false,
      created_by: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date(),
      updated_at: new Date(),
      member_count: -1,
    };

    const result = ProjectWithStatsSchema.safeParse(projectWithStats);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['member_count']);
    }
  });

  it('should reject project with non-integer member_count', () => {
    const projectWithStats = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      organization_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Project',
      slug: 'test-project',
      status: 'active' as const,
      is_favorite: false,
      created_by: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date(),
      updated_at: new Date(),
      member_count: 5.5,
    };

    const result = ProjectWithStatsSchema.safeParse(projectWithStats);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['member_count']);
    }
  });
});

// ============================================
// PROJECT MEMBER WITH USER SCHEMA TESTS
// ============================================

describe('ProjectMemberWithUserSchema', () => {
  it('should accept member with user details', () => {
    const memberWithUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date(),
      invited_by: '550e8400-e29b-41d4-a716-446655440004',
      user_email: 'test@example.com',
      user_name: 'Test User',
      user_avatar_url: 'https://example.com/avatar.jpg',
      role_name: 'Project Admin',
    };

    const result = ProjectMemberWithUserSchema.safeParse(memberWithUser);

    expect(result.success).toBe(true);
  });

  it('should accept member without user_avatar_url', () => {
    const memberWithUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date(),
      user_email: 'test@example.com',
      user_name: 'Test User',
      role_name: 'Project Admin',
    };

    const result = ProjectMemberWithUserSchema.safeParse(memberWithUser);

    expect(result.success).toBe(true);
  });

  it('should reject member with invalid email', () => {
    const memberWithUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date(),
      user_email: 'not-an-email',
      user_name: 'Test User',
      role_name: 'Project Admin',
    };

    const result = ProjectMemberWithUserSchema.safeParse(memberWithUser);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['user_email']);
    }
  });

  it('should reject member with invalid avatar URL', () => {
    const memberWithUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      role_id: '550e8400-e29b-41d4-a716-446655440003',
      joined_at: new Date(),
      user_email: 'test@example.com',
      user_name: 'Test User',
      user_avatar_url: 'not-a-url',
      role_name: 'Project Admin',
    };

    const result = ProjectMemberWithUserSchema.safeParse(memberWithUser);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['user_avatar_url']);
    }
  });
});

// ============================================
// TYPE GUARDS TESTS
// ============================================

describe('isValidProjectStatus', () => {
  it('should return true for all valid statuses', () => {
    expect(isValidProjectStatus('active')).toBe(true);
    expect(isValidProjectStatus('archived')).toBe(true);
    expect(isValidProjectStatus('completed')).toBe(true);
    expect(isValidProjectStatus('on_hold')).toBe(true);
  });

  it('should return false for invalid statuses', () => {
    expect(isValidProjectStatus('invalid')).toBe(false);
    expect(isValidProjectStatus('')).toBe(false);
    expect(isValidProjectStatus('ACTIVE')).toBe(false);
    expect(isValidProjectStatus('pending')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidProjectStatus(null as any)).toBe(false);
    expect(isValidProjectStatus(undefined as any)).toBe(false);
    expect(isValidProjectStatus(123 as any)).toBe(false);
  });
});

describe('isValidHexColor', () => {
  it('should return true for valid HEX colors', () => {
    expect(isValidHexColor('#FF0000')).toBe(true);
    expect(isValidHexColor('#00FF00')).toBe(true);
    expect(isValidHexColor('#0000FF')).toBe(true);
    expect(isValidHexColor('#3B82F6')).toBe(true);
    expect(isValidHexColor('#abcdef')).toBe(true);
    expect(isValidHexColor('#ABCDEF')).toBe(true);
    expect(isValidHexColor('#123456')).toBe(true);
  });

  it('should return false for invalid HEX colors', () => {
    expect(isValidHexColor('#FF')).toBe(false); // Too short
    expect(isValidHexColor('#GGGGGG')).toBe(false); // Invalid characters
    expect(isValidHexColor('FF0000')).toBe(false); // Missing #
    expect(isValidHexColor('#FF00FF00')).toBe(false); // Too long
    expect(isValidHexColor('red')).toBe(false); // Color name
    expect(isValidHexColor('')).toBe(false); // Empty
    expect(isValidHexColor('#12345')).toBe(false); // Too short
    expect(isValidHexColor('#1234567')).toBe(false); // Too long
  });

  it('should return false for non-string values', () => {
    expect(isValidHexColor(null as any)).toBe(false);
    expect(isValidHexColor(undefined as any)).toBe(false);
    expect(isValidHexColor(123456 as any)).toBe(false);
  });
});
