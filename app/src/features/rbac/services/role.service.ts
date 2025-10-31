/**
 * Role Service Interface
 *
 * Data access layer for role and workspace membership operations.
 * This service will be implemented by the Supabase Agent.
 *
 * Phase 1: Interface stub only - Implementation by Supabase Agent
 */

import type {
  Role,
  RoleCreate,
  RoleUpdate,
  WorkspaceUser,
  WorkspaceUserCreate,
  WorkspaceUserUpdate,
} from '../entities';

/**
 * Role Service
 *
 * Pure CRUD operations for roles and workspace_users tables with RLS enforcement.
 */
export const roleService = {
  /**
   * Get all system roles (Owner, Admin, Member)
   * @returns Array of system roles
   */
  async getSystemRoles(): Promise<Role[]> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.getSystemRoles not implemented yet');
  },

  /**
   * Get role by name
   * @param name Role name ('owner', 'admin', 'member')
   * @returns Role or null if not found
   */
  async getRoleByName(name: string): Promise<Role | null> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.getRoleByName not implemented yet');
  },

  /**
   * Get role by ID
   * @param id Role UUID
   * @returns Role or null if not found
   */
  async getRoleById(id: string): Promise<Role | null> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.getRoleById not implemented yet');
  },

  /**
   * Assign role to user in workspace
   * @param input Role assignment data
   * @returns Workspace user assignment
   */
  async assignRole(input: WorkspaceUserCreate): Promise<WorkspaceUser> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.assignRole not implemented yet');
  },

  /**
   * Update user's role in workspace
   * @param workspaceId Workspace UUID
   * @param userId User UUID
   * @param input Role update (only role_id)
   * @returns Updated workspace user
   */
  async updateUserRole(
    workspaceId: string,
    userId: string,
    input: WorkspaceUserUpdate
  ): Promise<WorkspaceUser> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.updateUserRole not implemented yet');
  },

  /**
   * Remove user from workspace
   * @param workspaceId Workspace UUID
   * @param userId User UUID
   */
  async removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.removeUserFromWorkspace not implemented yet');
  },

  /**
   * Get user's membership in workspace
   * @param userId User UUID
   * @param workspaceId Workspace UUID
   * @returns Workspace user with role, or null if not a member
   */
  async getWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceUser | null> {
    // TODO: Supabase Agent will implement this
    throw new Error('roleService.getWorkspaceMembership not implemented yet');
  },
};
