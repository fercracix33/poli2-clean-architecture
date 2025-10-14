import { createClient } from '@/lib/supabase-server';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectMember,
  ProjectMemberCreate,
  ProjectFilter,
  ProjectWithStats,
  ProjectMemberWithUser,
} from '../entities';

/**
 * Pure Data Service for Projects
 *
 * IMPORTANT: This service contains ONLY database access logic.
 * NO business logic, NO validations, NO authorization checks.
 * All business rules are handled in use cases.
 *
 * All functions assume RLS is enabled and enforced at database level.
 */

// ============================================
// PROJECT CRUD OPERATIONS
// ============================================

/**
 * Create a new project
 * RLS enforced: User must have 'project.create' permission
 */
export async function createProject(data: ProjectCreate & { created_by: string }): Promise<Project> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      organization_id: data.organization_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      status: data.status,
      color: data.color || null,
      icon: data.icon || null,
      is_favorite: data.is_favorite,
      settings: data.settings || {},
      created_by: data.created_by,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return {
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  };
}

/**
 * Get a single project by ID
 * RLS enforced: User must be in the project's organization
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get project: ${error.message}`);
  }

  return {
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  };
}

/**
 * Get a project by organization and slug
 * RLS enforced: User must be in the organization
 */
export async function getProjectBySlug(
  organizationId: string,
  slug: string
): Promise<Project | null> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get project by slug: ${error.message}`);
  }

  return {
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  };
}

/**
 * Get all projects in an organization with optional filters
 * RLS enforced: User sees only projects from their organizations
 */
export async function getProjects(filters: ProjectFilter): Promise<Project[]> {
  const supabase = await createClient();

  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', filters.organization_id)
    .order('created_at', { ascending: false });

  // Apply optional filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite);
  }

  if (filters.created_by) {
    query = query.eq('created_by', filters.created_by);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new Error(`Failed to get projects: ${error.message}`);
  }

  return projects.map((project) => ({
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  }));
}

/**
 * Get projects with member count and creator name
 * RLS enforced at database level
 */
export async function getProjectsWithStats(
  organizationId: string,
  filters?: Partial<ProjectFilter>
): Promise<ProjectWithStats[]> {
  const supabase = await createClient();

  let query = supabase
    .from('projects')
    .select(
      `
      *,
      member_count:project_members(count),
      creator:user_profiles!projects_created_by_fkey(name)
    `
    )
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new Error(`Failed to get projects with stats: ${error.message}`);
  }

  return projects.map((project) => ({
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
    member_count: project.member_count?.[0]?.count || 0,
    creator_name: project.creator?.name,
  }));
}

/**
 * Update an existing project
 * RLS enforced: User must have 'project.update' permission
 */
export async function updateProject(
  projectId: string,
  data: ProjectUpdate
): Promise<Project> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.is_favorite !== undefined && { is_favorite: data.is_favorite }),
      ...(data.settings !== undefined && { settings: data.settings }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return {
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  };
}

/**
 * Delete a project (hard delete)
 * RLS enforced: User must have 'project.delete' permission
 */
export async function deleteProject(projectId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

/**
 * Archive a project (soft delete)
 * Sets status to 'archived' and records archived_at timestamp
 */
export async function archiveProject(projectId: string): Promise<Project> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to archive project: ${error.message}`);
  }

  return {
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  };
}

/**
 * Unarchive a project
 * Sets status back to 'active' and clears archived_at
 */
export async function unarchiveProject(projectId: string): Promise<Project> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      status: 'active',
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unarchive project: ${error.message}`);
  }

  return {
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: null,
  };
}

// ============================================
// PROJECT MEMBER OPERATIONS
// ============================================

/**
 * Add a member to a project
 * RLS enforced: User must have 'project.manage_members' or 'project.invite' permission
 */
export async function addProjectMember(
  data: ProjectMemberCreate & { invited_by: string }
): Promise<ProjectMember> {
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from('project_members')
    .insert({
      project_id: data.project_id,
      user_id: data.user_id,
      role_id: data.role_id,
      invited_by: data.invited_by,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add project member: ${error.message}`);
  }

  return {
    ...member,
    joined_at: new Date(member.joined_at),
  };
}

/**
 * Remove a member from a project
 * RLS enforced: User must have 'project.remove_members' permission OR be removing themselves
 */
export async function removeProjectMember(
  projectId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to remove project member: ${error.message}`);
  }
}

/**
 * Get all members of a project
 * RLS enforced: User must be a member of the project
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get project members: ${error.message}`);
  }

  return members.map((member) => ({
    ...member,
    joined_at: new Date(member.joined_at),
  }));
}

/**
 * Get project members with user details
 * Includes user email, name, avatar, and role name
 */
export async function getProjectMembersWithDetails(
  projectId: string
): Promise<ProjectMemberWithUser[]> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('project_members')
    .select(
      `
      *,
      user:user_profiles!project_members_user_id_fkey(
        email,
        name,
        avatar_url
      ),
      role:roles!project_members_role_id_fkey(
        name
      )
    `
    )
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get project members with details: ${error.message}`);
  }

  return members.map((member) => ({
    ...member,
    joined_at: new Date(member.joined_at),
    user_email: member.user.email,
    user_name: member.user.name,
    user_avatar_url: member.user.avatar_url,
    role_name: member.role.name,
  }));
}

/**
 * Get all projects where a user is a member
 * RLS enforced at database level
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      project_members!inner(user_id)
    `
    )
    .eq('project_members.user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user projects: ${error.message}`);
  }

  return projects.map((project) => ({
    ...project,
    created_at: new Date(project.created_at),
    updated_at: new Date(project.updated_at),
    archived_at: project.archived_at ? new Date(project.archived_at) : null,
  }));
}

/**
 * Check if a user is a member of a project
 */
export async function isProjectMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return false; // Not found = not a member
    }
    throw new Error(`Failed to check project membership: ${error.message}`);
  }

  return data !== null;
}

/**
 * Update a project member's role
 * RLS enforced: User must have 'project.manage_members' permission
 */
export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  newRoleId: string
): Promise<ProjectMember> {
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from('project_members')
    .update({ role_id: newRoleId })
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project member role: ${error.message}`);
  }

  return {
    ...member,
    joined_at: new Date(member.joined_at),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get project count for an organization
 */
export async function getProjectCount(
  organizationId: string,
  status?: Project['status']
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to get project count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Check if a slug is available in an organization
 */
export async function isSlugAvailable(
  organizationId: string,
  slug: string,
  excludeProjectId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from('projects')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('slug', slug);

  if (excludeProjectId) {
    query = query.neq('id', excludeProjectId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return true; // Not found = slug is available
    }
    throw new Error(`Failed to check slug availability: ${error.message}`);
  }

  return data === null;
}
