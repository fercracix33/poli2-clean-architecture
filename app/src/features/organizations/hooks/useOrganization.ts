/**
 * useOrganization Hook
 *
 * TanStack Query hook for fetching organization details by slug
 * Returns organization data including UUID for dependent queries
 *
 * Created by: Bug Fixer Agent
 * Date: 2025-10-15
 * Purpose: Fix Bug #2 - Organization Slug vs ID Issue
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { OrganizationDetails } from '../use-cases/getOrganizationDetails';

/**
 * Fetch organization details from API
 */
async function fetchOrganization(slug: string): Promise<OrganizationDetails> {
  const response = await fetch(`/api/organizations/${slug}/details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch organization' }));
    throw new Error(error.error || 'Failed to fetch organization');
  }

  return response.json();
}

/**
 * Hook for fetching organization details by slug
 *
 * @param slug - Organization slug (e.g., "acme-corp")
 * @returns Organization details including UUID, user role, and permissions
 *
 * @example
 * const { data: org, isLoading } = useOrganization('acme-corp');
 * if (org) {
 *   const organizationId = org.organization.id; // UUID
 * }
 */
export function useOrganization(slug: string | undefined) {
  return useQuery({
    queryKey: ['organization', slug],
    queryFn: () => fetchOrganization(slug!),
    staleTime: 60000, // 60 seconds - organizations change infrequently
    enabled: !!slug, // Only run when slug is available
  });
}
