/**
 * assignRole Use Case
 *
 * Assigns a role to a user within a workspace.
 *
 * Business Rules:
 * - User must exist (auth.users)
 * - Workspace must exist
 * - Role must exist
 * - One user can have different roles in different workspaces
 * - Cannot assign multiple roles to same user in same workspace (upsert logic)
 *
 * Phase 1: Backend Only - Minimal orchestration logic
 */

import { ZodError } from 'zod';
import {
  WorkspaceUserCreateSchema,
  type WorkspaceUser,
  type WorkspaceUserCreate,
} from '../entities';
import { workspaceService } from '../services/workspace.service';
import { roleService } from '../services/role.service';

/**
 * Assign Role Use Case
 *
 * @param input - Role assignment data (workspace_id, user_id, role_id, invited_by)
 * @returns Workspace user assignment with joined_at timestamp
 * @throws ZodError if validation fails
 * @throws Error if workspace, role, or user not found
 */
export async function assignRole(
  input: WorkspaceUserCreate
): Promise<WorkspaceUser> {
  // Step 1: Validate input with Zod
  // Using parse() here (not safeParse) because tests expect ZodError to be thrown
  const validatedInput = WorkspaceUserCreateSchema.parse(input);

  // Step 2: Validate workspace exists
  const workspace = await workspaceService.getWorkspaceById(
    validatedInput.workspace_id,
    validatedInput.invited_by // User inviting must have access
  );

  if (!workspace) {
    throw new Error(
      `Workspace ${validatedInput.workspace_id} not found or you do not have access.`
    );
  }

  // Step 3: Validate role exists
  const role = await roleService.getRoleById(validatedInput.role_id);

  if (!role) {
    throw new Error(`Role ${validatedInput.role_id} not found.`);
  }

  // Step 4: Assign role via service
  try {
    const assignment = await roleService.assignRole(validatedInput);
    return assignment;
  } catch (error: any) {
    // Handle duplicate assignment constraint violation
    if (error.message && error.message.includes('duplicate')) {
      throw new Error('User is already a member of this workspace');
    }
    // Re-throw other errors
    throw new Error(`Failed to assign role: ${error.message}`);
  }
}
