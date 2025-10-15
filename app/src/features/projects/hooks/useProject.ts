/**
 * useProject Hook
 *
 * TanStack Query hook for fetching a single project
 * Handles loading, error states, and caching
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Project } from '../entities';

/**
 * Fetch project by ID from API
 */
async function fetchProjectById(projectId: string): Promise<Project> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Failed to fetch project' } }));
    throw new Error(error.error?.message || 'Failed to fetch project');
  }

  const data = await response.json();
  // API returns project object directly, not wrapped in { data: {...} }
  return data;
}

/**
 * Fetch project by slug from API
 * Uses path parameters matching the API route: /api/projects/slug/[organizationId]/[slug]
 */
async function fetchProjectBySlug(organizationId: string, slug: string): Promise<Project> {
  const response = await fetch(`/api/projects/slug/${organizationId}/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Failed to fetch project' } }));
    throw new Error(error.error?.message || 'Failed to fetch project');
  }

  const data = await response.json();
  // API returns project object directly, not wrapped in { data: {...} }
  return data;
}

/**
 * Hook for fetching project by ID
 */
export function useProject(projectId?: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectById(projectId!),
    enabled: !!projectId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook for fetching project by slug
 */
export function useProjectBySlug(organizationId: string, slug?: string) {
  return useQuery({
    queryKey: ['project', 'slug', organizationId, slug],
    queryFn: () => fetchProjectBySlug(organizationId, slug!),
    enabled: !!organizationId && !!slug,
    staleTime: 30000, // 30 seconds
  });
}
