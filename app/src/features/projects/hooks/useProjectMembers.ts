/**
 * useProjectMembers Hooks
 *
 * TanStack Query hooks for project member operations
 * Handles fetching members, adding, removing, updating roles
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectMemberWithUser, ProjectMemberCreate, ProjectMember } from '../entities';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Fetch project members from API
 */
async function fetchProjectMembers(projectId: string): Promise<ProjectMemberWithUser[]> {
  const response = await fetch(`/api/projects/${projectId}/members?include_details=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Failed to fetch members' } }));
    throw new Error(error.error?.message || 'Failed to fetch members');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Hook for fetching project members
 */
export function useProjectMembers(projectId?: string) {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => fetchProjectMembers(projectId!),
    enabled: !!projectId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Add project member mutation
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async (data: Omit<ProjectMemberCreate, 'project_id'> & { projectId: string }): Promise<ProjectMember> => {
      const { projectId, user_id, role_id } = data;

      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, role_id }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to add member' } }));
        throw new Error(error.error?.message || 'Failed to add member');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(t('success.memberAdded', { name: 'Member' }));
    },
    onError: (error: Error) => {
      toast.error(t('errors.addMemberFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Remove project member mutation
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }): Promise<void> => {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to remove member' } }));
        throw new Error(error.error?.message || 'Failed to remove member');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(t('success.memberRemoved', { name: 'Member' }));
    },
    onError: (error: Error) => {
      toast.error(t('errors.removeMemberFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Update project member role mutation
 */
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async ({ projectId, userId, roleId }: { projectId: string; userId: string; roleId: string }): Promise<ProjectMember> => {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to update role' } }));
        throw new Error(error.error?.message || 'Failed to update role');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
      toast.success(t('success.roleUpdated'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.updateRoleFailed'), {
        description: error.message,
      });
    },
  });
}
