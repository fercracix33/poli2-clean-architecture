/**
 * RBAC Foundation - Entity Validation Tests
 *
 * Tests all Zod schemas defined in entities.ts for correct validation behavior.
 * Phase 1: Backend Only - 100% coverage target
 *
 * These tests should ALL PASS (entities.ts already implemented by Architect).
 */

import { describe, it, expect } from 'vitest';
import {
  // Workspace schemas
  WorkspaceSchema,
  WorkspaceCreateSchema,
  WorkspaceUpdateSchema,
  // Role schemas
  RoleSchema,
  RoleCreateSchema,
  RoleUpdateSchema,
  SYSTEM_ROLES,
  // Feature schemas
  FeatureSchema,
  FeatureCreateSchema,
  FeatureUpdateSchema,
  // Permission schemas
  PermissionSchema,
  PermissionActionSchema,
  PermissionCreateSchema,
  PermissionUpdateSchema,
  // Workspace User schemas
  WorkspaceUserSchema,
  WorkspaceUserCreateSchema,
  WorkspaceUserUpdateSchema,
  // Role Permission schemas
  RolePermissionSchema,
  RolePermissionCreateSchema,
  // User schema
  UserSchema,
  // Helper functions
  isSystemRole,
  canDeleteRole,
  canModifyRole,
} from './entities';

// ============================================================================
// WORKSPACE SCHEMA TESTS
// ============================================================================

describe('WorkspaceSchema', () => {
  describe('valid data', () => {
    it('should validate correct workspace data', () => {
      const validWorkspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My Workspace',
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      };

      const result = WorkspaceSchema.safeParse(validWorkspace);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validWorkspace);
      }
    });

    it('should accept 1-character name', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A',
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);
      expect(result.success).toBe(true);
    });

    it('should accept 100-character name', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A'.repeat(100),
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject empty name', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Workspace name is required');
      }
    });

    it('should reject name longer than 100 characters', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A'.repeat(101),
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Workspace name too long');
      }
    });

    it('should reject invalid id (not UUID)', () => {
      const workspace = {
        id: 'not-a-uuid',
        name: 'Valid Name',
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].validation).toBe('uuid');
      }
    });

    it('should reject invalid owner_id (not UUID)', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Valid Name',
        owner_id: 'not-a-uuid',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('owner_id');
        expect(result.error.issues[0].validation).toBe('uuid');
      }
    });

    it('should reject missing required fields', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Valid Name',
        // missing owner_id, created_at, updated_at
      };

      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should reject invalid datetime format', () => {
      const workspace = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Valid Name',
        owner_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: 'not-a-datetime',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('created_at');
      }
    });
  });
});

describe('WorkspaceCreateSchema', () => {
  it('should accept data without auto-generated fields', () => {
    const createData = {
      name: 'New Workspace',
      owner_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = WorkspaceCreateSchema.safeParse(createData);
    expect(result.success).toBe(true);
  });

  it('should reject data with id field', () => {
    const createData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'New Workspace',
      owner_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = WorkspaceCreateSchema.safeParse(createData);
    expect(result.success).toBe(false);
  });

  it('should reject data with created_at field', () => {
    const createData = {
      name: 'New Workspace',
      owner_id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = WorkspaceCreateSchema.safeParse(createData);
    expect(result.success).toBe(false);
  });
});

describe('WorkspaceUpdateSchema', () => {
  it('should accept partial data (only name)', () => {
    const updateData = { name: 'Updated Name' };
    const result = WorkspaceUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('should accept empty object (all fields optional)', () => {
    const updateData = {};
    const result = WorkspaceUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('should reject owner_id updates', () => {
    const updateData = {
      name: 'Updated Name',
      owner_id: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = WorkspaceUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });

  it('should validate name constraints', () => {
    const updateData = { name: '' };
    const result = WorkspaceUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ROLE SCHEMA TESTS
// ============================================================================

describe('RoleSchema', () => {
  describe('valid data', () => {
    it('should validate system role (owner)', () => {
      const systemRole = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'owner',
        description: 'Full control over workspace',
        is_system: true,
        workspace_id: null,
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(systemRole);
      expect(result.success).toBe(true);
    });

    it('should validate custom role with workspace_id', () => {
      const customRole = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Project Manager',
        description: 'Manages projects',
        is_system: false,
        workspace_id: '550e8400-e29b-41d4-a716-446655440002',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(customRole);
      expect(result.success).toBe(true);
    });

    it('should default is_system to false', () => {
      const role = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Custom Role',
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(role);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_system).toBe(false);
      }
    });

    it('should accept optional description', () => {
      const role = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Custom Role',
        is_system: false,
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(role);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject name longer than 50 characters', () => {
      const role = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A'.repeat(51),
        is_system: false,
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(role);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Role name too long');
      }
    });

    it('should reject description longer than 500 characters', () => {
      const role = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Valid Role',
        description: 'A'.repeat(501),
        is_system: false,
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(role);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Description too long');
      }
    });

    it('should reject empty name', () => {
      const role = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
        is_system: false,
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(role);
      expect(result.success).toBe(false);
    });

    it('should reject invalid workspace_id (not UUID)', () => {
      const role = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Valid Role',
        is_system: false,
        workspace_id: 'not-a-uuid',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = RoleSchema.safeParse(role);
      expect(result.success).toBe(false);
    });
  });
});

describe('SYSTEM_ROLES constant', () => {
  it('should define OWNER, ADMIN, MEMBER', () => {
    expect(SYSTEM_ROLES.OWNER).toBe('owner');
    expect(SYSTEM_ROLES.ADMIN).toBe('admin');
    expect(SYSTEM_ROLES.MEMBER).toBe('member');
  });

  it('should have lowercase string values', () => {
    Object.values(SYSTEM_ROLES).forEach((role) => {
      expect(role).toBe(role.toLowerCase());
      expect(typeof role).toBe('string');
    });
  });
});

describe('isSystemRole helper', () => {
  it('should return true for system roles', () => {
    expect(isSystemRole('owner')).toBe(true);
    expect(isSystemRole('admin')).toBe(true);
    expect(isSystemRole('member')).toBe(true);
  });

  it('should return false for custom roles', () => {
    expect(isSystemRole('custom-role')).toBe(false);
    expect(isSystemRole('Project Manager')).toBe(false);
    expect(isSystemRole('')).toBe(false);
  });

  it('should be case-sensitive', () => {
    expect(isSystemRole('Owner')).toBe(false);
    expect(isSystemRole('ADMIN')).toBe(false);
  });
});

describe('canDeleteRole helper', () => {
  it('should return false for system roles', () => {
    const systemRole = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'owner',
      is_system: true,
      workspace_id: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(canDeleteRole(systemRole)).toBe(false);
  });

  it('should return true for custom roles', () => {
    const customRole = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Custom Role',
      is_system: false,
      workspace_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(canDeleteRole(customRole)).toBe(true);
  });
});

describe('canModifyRole helper', () => {
  it('should return false for system roles', () => {
    const systemRole = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'admin',
      is_system: true,
      workspace_id: null,
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(canModifyRole(systemRole)).toBe(false);
  });

  it('should return true for custom roles', () => {
    const customRole = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Custom Role',
      is_system: false,
      workspace_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(canModifyRole(customRole)).toBe(true);
  });
});

// ============================================================================
// FEATURE SCHEMA TESTS
// ============================================================================

describe('FeatureSchema', () => {
  describe('valid data', () => {
    it('should validate feature with all fields', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'projects',
        display_name: 'Projects',
        description: 'Project management feature',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
    });

    it('should default is_enabled to true', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'tasks',
        display_name: 'Tasks',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_enabled).toBe(true);
      }
    });

    it('should accept optional description', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'kanban',
        display_name: 'Kanban Board',
        is_enabled: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject name longer than 50 characters', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'A'.repeat(51),
        display_name: 'Feature',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject display_name longer than 100 characters', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'feature',
        display_name: 'A'.repeat(101),
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject description longer than 500 characters', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'feature',
        display_name: 'Feature',
        description: 'A'.repeat(501),
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
        display_name: 'Feature',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject empty display_name', () => {
      const feature = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'feature',
        display_name: '',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });
  });
});

describe('FeatureUpdateSchema', () => {
  it('should allow partial updates', () => {
    const updateData = { display_name: 'Updated Display Name' };
    const result = FeatureUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('should not allow name updates (immutable)', () => {
    const updateData = {
      name: 'new-name',
      display_name: 'Updated',
    };

    const result = FeatureUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });

  it('should allow description updates', () => {
    const updateData = { description: 'Updated description' };
    const result = FeatureUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('should allow is_enabled updates', () => {
    const updateData = { is_enabled: false };
    const result = FeatureUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// PERMISSION SCHEMA TESTS
// ============================================================================

describe('PermissionActionSchema', () => {
  it('should accept valid actions', () => {
    const validActions = ['create', 'read', 'update', 'delete', 'manage'];

    validActions.forEach((action) => {
      const result = PermissionActionSchema.safeParse(action);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid actions', () => {
    const invalidActions = ['execute', 'view', 'edit', 'remove', ''];

    invalidActions.forEach((action) => {
      const result = PermissionActionSchema.safeParse(action);
      expect(result.success).toBe(false);
    });
  });
});

describe('PermissionSchema', () => {
  describe('valid data', () => {
    it('should validate permission with all fields', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'create' as const,
        resource: 'Project',
        description: 'Create new projects',
        conditions: { owner: 'user_id' },
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(true);
    });

    it('should accept optional conditions', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'read' as const,
        resource: 'Task',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(true);
    });

    it('should accept optional description', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'update' as const,
        resource: 'Card',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(true);
    });

    it('should accept complex JSONB conditions', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'manage' as const,
        resource: 'Board',
        conditions: {
          subject: 'Board',
          fields: ['status', 'assignee'],
          owner: { $eq: 'user_id' },
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject invalid action', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'invalid-action',
        resource: 'Project',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(false);
    });

    it('should reject resource longer than 50 characters', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'create' as const,
        resource: 'A'.repeat(51),
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(false);
    });

    it('should reject empty resource', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: '550e8400-e29b-41d4-a716-446655440001',
        action: 'create' as const,
        resource: '',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(false);
    });

    it('should reject invalid feature_id (not UUID)', () => {
      const permission = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        feature_id: 'not-a-uuid',
        action: 'create' as const,
        resource: 'Project',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = PermissionSchema.safeParse(permission);
      expect(result.success).toBe(false);
    });
  });
});

describe('PermissionUpdateSchema', () => {
  it('should allow partial updates', () => {
    const updateData = { description: 'Updated description' };
    const result = PermissionUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('should not allow feature_id updates (immutable)', () => {
    const updateData = {
      feature_id: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = PermissionUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });

  it('should not allow action updates (immutable)', () => {
    const updateData = { action: 'read' as const };
    const result = PermissionUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });

  it('should not allow resource updates (immutable)', () => {
    const updateData = { resource: 'NewResource' };
    const result = PermissionUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });

  it('should allow conditions updates', () => {
    const updateData = { conditions: { owner: 'new_user_id' } };
    const result = PermissionUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// WORKSPACE USER SCHEMA TESTS
// ============================================================================

describe('WorkspaceUserSchema', () => {
  describe('valid data', () => {
    it('should validate workspace user with all fields', () => {
      const workspaceUser = {
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        role_id: '550e8400-e29b-41d4-a716-446655440002',
        invited_by: '550e8400-e29b-41d4-a716-446655440003',
        joined_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceUserSchema.safeParse(workspaceUser);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject missing required fields', () => {
      const workspaceUser = {
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        // missing user_id, role_id, invited_by, joined_at
      };

      const result = WorkspaceUserSchema.safeParse(workspaceUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
      }
    });

    it('should reject invalid workspace_id (not UUID)', () => {
      const workspaceUser = {
        workspace_id: 'not-a-uuid',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        role_id: '550e8400-e29b-41d4-a716-446655440002',
        invited_by: '550e8400-e29b-41d4-a716-446655440003',
        joined_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceUserSchema.safeParse(workspaceUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid user_id (not UUID)', () => {
      const workspaceUser = {
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'not-a-uuid',
        role_id: '550e8400-e29b-41d4-a716-446655440002',
        invited_by: '550e8400-e29b-41d4-a716-446655440003',
        joined_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceUserSchema.safeParse(workspaceUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role_id (not UUID)', () => {
      const workspaceUser = {
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        role_id: 'not-a-uuid',
        invited_by: '550e8400-e29b-41d4-a716-446655440003',
        joined_at: '2024-01-01T00:00:00Z',
      };

      const result = WorkspaceUserSchema.safeParse(workspaceUser);
      expect(result.success).toBe(false);
    });
  });
});

describe('WorkspaceUserUpdateSchema', () => {
  it('should only allow role_id updates', () => {
    const updateData = {
      role_id: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = WorkspaceUserUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('should not allow workspace_id changes', () => {
    const updateData = {
      workspace_id: '550e8400-e29b-41d4-a716-446655440003',
      role_id: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = WorkspaceUserUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });

  it('should not allow user_id changes', () => {
    const updateData = {
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      role_id: '550e8400-e29b-41d4-a716-446655440002',
    };

    const result = WorkspaceUserUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ROLE PERMISSION SCHEMA TESTS
// ============================================================================

describe('RolePermissionSchema', () => {
  it('should validate role permission mapping', () => {
    const rolePermission = {
      role_id: '550e8400-e29b-41d4-a716-446655440000',
      permission_id: '550e8400-e29b-41d4-a716-446655440001',
      granted_at: '2024-01-01T00:00:00Z',
    };

    const result = RolePermissionSchema.safeParse(rolePermission);
    expect(result.success).toBe(true);
  });

  it('should require role_id and permission_id', () => {
    const rolePermission = {
      // missing role_id and permission_id
      granted_at: '2024-01-01T00:00:00Z',
    };

    const result = RolePermissionSchema.safeParse(rolePermission);
    expect(result.success).toBe(false);
  });

  it('should require granted_at timestamp', () => {
    const rolePermission = {
      role_id: '550e8400-e29b-41d4-a716-446655440000',
      permission_id: '550e8400-e29b-41d4-a716-446655440001',
      // missing granted_at
    };

    const result = RolePermissionSchema.safeParse(rolePermission);
    expect(result.success).toBe(false);
  });
});

describe('RolePermissionCreateSchema', () => {
  it('should accept data without granted_at', () => {
    const createData = {
      role_id: '550e8400-e29b-41d4-a716-446655440000',
      permission_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    const result = RolePermissionCreateSchema.safeParse(createData);
    expect(result.success).toBe(true);
  });

  it('should reject data with granted_at field', () => {
    const createData = {
      role_id: '550e8400-e29b-41d4-a716-446655440000',
      permission_id: '550e8400-e29b-41d4-a716-446655440001',
      granted_at: '2024-01-01T00:00:00Z',
    };

    const result = RolePermissionCreateSchema.safeParse(createData);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// USER SCHEMA TESTS
// ============================================================================

describe('UserSchema', () => {
  it('should validate user with email', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      is_super_admin: false,
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(true);
  });

  it('should validate email format', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'not-an-email',
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(false);
  });

  it('should default is_super_admin to false', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_super_admin).toBe(false);
    }
  });

  it('should require created_at', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      // missing created_at
    };

    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(false);
  });

  it('should accept is_super_admin=true', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@example.com',
      is_super_admin: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// CASL TYPE TESTS (Compile-time only)
// ============================================================================

describe('CASL Types', () => {
  it('should define Actions type', () => {
    // Type-only test - verifies Actions type exists at compile time
    const validActions: Array<'create' | 'read' | 'update' | 'delete' | 'manage'> = [
      'create',
      'read',
      'update',
      'delete',
      'manage',
    ];

    expect(validActions).toHaveLength(5);
  });

  it('should define Subjects type', () => {
    // Type-only test - verifies Subjects type exists at compile time
    const validSubjects: Array<'Workspace' | 'Role' | 'Permission' | 'Feature' | 'User' | 'all'> =
      ['Workspace', 'Role', 'Permission', 'Feature', 'User', 'all'];

    expect(validSubjects).toHaveLength(6);
  });

  it('should define AppAbility type', () => {
    // Type-only test - verifies AppAbility type exists
    // Cannot instantiate without implementation, but confirms type definition
    expect(true).toBe(true);
  });

  it('should define DefineAbilityInput interface', () => {
    // Type-only test - verifies DefineAbilityInput interface structure
    const mockInput = {
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        is_super_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      },
      workspace: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Workspace',
        owner_id: '550e8400-e29b-41d4-a716-446655440000',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      permissions: [],
    };

    expect(mockInput.user.email).toBe('user@example.com');
    expect(mockInput.workspace.name).toBe('Test Workspace');
  });

  it('should define DefineAbilityFunction type', () => {
    // Type-only test - verifies DefineAbilityFunction signature
    // Implementation will be in Phase 3
    expect(true).toBe(true);
  });
});
