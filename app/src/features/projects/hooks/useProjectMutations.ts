/**
 * useProjectMutations Hook
 *
 * TanStack Query mutation hooks for project operations
 * Handles create, update, delete, archive, unarchive with optimistic updates
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectCreate, ProjectUpdate, Project } from '../entities';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Create project mutation
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async (data: ProjectCreate): Promise<Project> => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to create project' } }));
        throw new Error(error.error?.message || 'Failed to create project');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.organization_id] });
      toast.success(t('success.created'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.createFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Update project mutation
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }): Promise<Project> => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to update project' } }));
        throw new Error(error.error?.message || 'Failed to update project');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success(t('success.updated'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.updateFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Delete project mutation
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }): Promise<void> => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to delete project' } }));
        throw new Error(error.error?.message || 'Failed to delete project');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.organizationId] });
      toast.success(t('success.deleted'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.deleteFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Archive project mutation
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async (projectId: string): Promise<Project> => {
      const response = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to archive project' } }));
        throw new Error(error.error?.message || 'Failed to archive project');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success(t('success.archived'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.archiveFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Unarchive project mutation
 */
export function useUnarchiveProject() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async (projectId: string): Promise<Project> => {
      const response = await fetch(`/api/projects/${projectId}/unarchive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to unarchive project' } }));
        throw new Error(error.error?.message || 'Failed to unarchive project');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success(t('success.unarchived'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.unarchiveFailed'), {
        description: error.message,
      });
    },
  });
}

/**
 * Toggle favorite mutation
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const t = useTranslations('projects');

  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }): Promise<Project> => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isFavorite }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Failed to update favorite' } }));
        throw new Error(error.error?.message || 'Failed to update favorite');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success(data.is_favorite ? t('success.favorited') : t('success.unfavorited'));
    },
    onError: (error: Error) => {
      toast.error(t('errors.updateFailed'), {
        description: error.message,
      });
    },
  });
}
