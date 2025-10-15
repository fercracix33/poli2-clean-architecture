/**
 * useProjects Hook
 *
 * TanStack Query hook for fetching projects list
 * Handles loading, error states, and caching
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { ProjectFilter, ProjectWithStats } from '../entities';

/**
 * Fetch projects from API
 */
async function fetchProjects(filters: ProjectFilter): Promise<ProjectWithStats[]> {
  const params = new URLSearchParams();
  params.set('organization_id', filters.organization_id);
  params.set('include_stats', 'true');

  if (filters.status) params.set('status', filters.status);
  if (filters.is_favorite !== undefined) params.set('is_favorite', String(filters.is_favorite));
  if (filters.search) params.set('search', filters.search);
  if (filters.created_by) params.set('created_by', filters.created_by);

  const response = await fetch(`/api/projects?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Failed to fetch projects' } }));
    throw new Error(error.error?.message || 'Failed to fetch projects');
  }

  const data = await response.json();
  // API returns array directly, not wrapped in { data: [...] }
  return data;
}

/**
 * Hook for fetching projects with filters
 */
export function useProjects(filters: ProjectFilter) {
  return useQuery({
    queryKey: ['projects', filters.organization_id, filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 30000, // 30 seconds
    enabled: !!filters.organization_id,
  });
}
