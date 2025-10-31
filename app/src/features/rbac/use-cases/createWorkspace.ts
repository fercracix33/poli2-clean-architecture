/**
 * createWorkspace Use Case
 *
 * Creates a new workspace and automatically assigns the Owner role to the creator.
 *
 * Business Rules:
 * - Workspace name must be 1-100 characters
 * - Owner is automatically added to workspace_users with Owner role
 * - Owner cannot be removed from workspace
 *
 * Phase 1: Backend Only - Minimal orchestration logic
 */

import { z, ZodError } from 'zod';
import {
  WorkspaceCreateSchema,
  type Workspace,
  type WorkspaceCreate,
  SYSTEM_ROLES,
} from '../entities';
import { workspaceService } from '../services/workspace.service';
import { roleService } from '../services/role.service';

/**
 * Create Workspace Use Case
 *
 * @param input - Workspace creation data (name, owner_id)
 * @returns Created workspace with id and timestamps
 * @throws ZodError if validation fails
 * @throws Error if workspace creation or role assignment fails
 */
export async function createWorkspace(
  input: WorkspaceCreate
): Promise<Workspace> {
  // Step 1: Validate input with Zod
  // Using parse() here (not safeParse) because tests expect ZodError to be thrown
  const validatedInput = WorkspaceCreateSchema.parse(input);

  // Step 2: Trim whitespace from name (business logic)
  const trimmedInput = {
    ...validatedInput,
    name: validatedInput.name.trim(),
  };

  // Step 3: Create workspace via service
  const workspace = await workspaceService.createWorkspace(trimmedInput);

  // Step 4: Get system Owner role
  const ownerRole = await roleService.getRoleByName(SYSTEM_ROLES.OWNER);

  if (!ownerRole) {
    throw new Error(
      'System role "owner" not found. Database may not be seeded. Run migrations first.'
    );
  }

  // Step 5: Auto-assign Owner role to creator
  await roleService.assignRole({
    workspace_id: workspace.id,
    user_id: workspace.owner_id,
    role_id: ownerRole.id,
    invited_by: workspace.owner_id, // Self-invited
  });

  // Step 6: Return created workspace
  return workspace;
}
