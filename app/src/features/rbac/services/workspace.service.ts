/**
 * Workspace Service Interface
 *
 * Data access layer for workspace operations.
 * This service will be implemented by the Supabase Agent.
 *
 * Phase 1: Interface stub only - Implementation by Supabase Agent
 */

import type { Workspace, WorkspaceCreate, WorkspaceUpdate } from '../entities';

/**
 * Workspace Service
 *
 * Pure CRUD operations for workspaces table with RLS enforcement.
 */
export const workspaceService = {
  /**
   * Create a new workspace in database
   * @param input Workspace data (name, owner_id)
   * @returns Created workspace with id and timestamps
   */
  async createWorkspace(input: WorkspaceCreate): Promise<Workspace> {
    // TODO: Supabase Agent will implement this
    // For now, return mock data to satisfy TypeScript
    throw new Error('workspaceService.createWorkspace not implemented yet');
  },

  /**
   * Get workspace by ID with RLS enforcement
   * @param id Workspace UUID
   * @param userId User making the request (for RLS)
   * @returns Workspace or null if not found/no access
   */
  async getWorkspaceById(id: string, userId: string): Promise<Workspace | null> {
    // TODO: Supabase Agent will implement this
    throw new Error('workspaceService.getWorkspaceById not implemented yet');
  },

  /**
   * Update workspace (owner only via RLS)
   * @param id Workspace UUID
   * @param input Update data (partial)
   * @param userId User making the request (for RLS)
   * @returns Updated workspace
   */
  async updateWorkspace(
    id: string,
    input: WorkspaceUpdate,
    userId: string
  ): Promise<Workspace> {
    // TODO: Supabase Agent will implement this
    throw new Error('workspaceService.updateWorkspace not implemented yet');
  },

  /**
   * Delete workspace (owner only via RLS, CASCADE all related data)
   * @param id Workspace UUID
   * @param userId User making the request (for RLS)
   */
  async deleteWorkspace(id: string, userId: string): Promise<void> {
    // TODO: Supabase Agent will implement this
    throw new Error('workspaceService.deleteWorkspace not implemented yet');
  },
};
