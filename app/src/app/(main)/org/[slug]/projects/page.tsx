/**
 * Projects List Page
 *
 * Main projects page showing:
 * - List of all projects in the organization
 * - Search and filter controls
 * - Create project button
 * - Empty state for no projects
 *
 * Route: /org/[slug]/projects
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useOrganization } from '@/features/organizations/hooks/useOrganization';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { ProjectFilters } from '@/features/projects/components/ProjectFilters';
import { CreateProjectDialog } from '@/features/projects/components/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project } from '@/features/projects/entities';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const params = useParams();
  const organizationSlug = params.slug as string;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: Project['status'];
    favoritesOnly?: boolean;
  }>({});

  // Step 1: Fetch organization by slug to get UUID
  const { data: orgData, isLoading: isOrgLoading, error: orgError } = useOrganization(organizationSlug);
  const organizationId = orgData?.organization.id;

  // Step 2: Fetch projects using organization UUID (dependent query)
  const { data: projects, isLoading: isProjectsLoading, error: projectsError } = useProjects({
    organization_id: organizationId || '', // Will be enabled only when organizationId exists
  });

  // Combined loading state
  const isLoading = isOrgLoading || isProjectsLoading;
  const error = orgError || projectsError;

  // Apply filters
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(searchLower);
        const matchesDescription = project.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }

      // Status filter
      if (filters.status && project.status !== filters.status) {
        return false;
      }

      // Favorites filter
      if (filters.favoritesOnly && !project.is_favorite) {
        return false;
      }

      return true;
    });
  }, [projects, filters]);

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('list.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('list.subtitle')}</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          data-testid="create-project-button"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('list.createButton')}
        </Button>
      </div>

      {/* Filters */}
      <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <ProjectFilters onFilterChange={setFilters} />
      </div>

      {/* Content */}
      {isLoading ? (
        <ProjectListSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">{t('errors.loadFailed')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : t('errors.unknownError')}
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        filters.search || filters.status || filters.favoritesOnly ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">{t('list.search.noResults')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('list.search.noResultsDescription')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">{t('list.empty.title')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('list.empty.description')}
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
              data-testid="create-first-project-button"
            >
              {t('list.empty.action')}
            </Button>
          </div>
        )
      ) : (
        <>
          {/* Project Count */}
          <div className="text-sm text-muted-foreground">
            {filteredProjects.length}{' '}
            {filteredProjects.length === 1 ? 'project' : 'projects'}
            {filters.search || filters.status || filters.favoritesOnly
              ? ` (filtered from ${projects?.length || 0})`
              : ''}
          </div>

          {/* Project List */}
          <ProjectList projects={filteredProjects} organizationSlug={organizationSlug} isLoading={false} />
        </>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        organizationId={organizationId || ''} // Use actual organization UUID
        organizationSlug={organizationSlug}
      />
    </div>
  );
}

/**
 * Loading skeleton for project list
 */
function ProjectListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
