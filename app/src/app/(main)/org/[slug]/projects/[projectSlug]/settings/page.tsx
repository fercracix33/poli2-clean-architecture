/**
 * Project Settings Page
 *
 * Project configuration page:
 * - General settings form (name, description, color, icon)
 * - Advanced settings (JSON configuration)
 * - Danger zone (archive, delete project)
 *
 * Route: /org/[slug]/projects/[projectSlug]/settings
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useProjectBySlug } from '@/features/projects/hooks/useProject';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { ProjectSettings } from '@/features/projects/components/ProjectSettings';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectSettingsPage() {
  const t = useTranslations('projects');
  const params = useParams();
  const organizationSlug = params.slug as string;
  const projectSlug = params.projectSlug as string;

  // Fetch project
  const { data: project, isLoading, error } = useProjectBySlug(organizationSlug, projectSlug);

  if (isLoading) {
    return <ProjectSettingsPageSkeleton organizationSlug={organizationSlug} />;
  }

  if (error || !project) {
    return (
      <div className="container py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4 inline-block">
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
        <h3 className="text-lg font-semibold">{t('errors.loadProjectFailed')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : t('errors.notFound')}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Project Header with Tabs */}
      <ProjectHeader project={project} organizationSlug={organizationSlug} />

      {/* Main Content */}
      <div className="container py-8">
        <ProjectSettings project={project} organizationSlug={organizationSlug} />
      </div>
    </>
  );
}

/**
 * Loading skeleton for project settings page
 */
function ProjectSettingsPageSkeleton({ organizationSlug }: { organizationSlug: string }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="border-b bg-background">
        <div className="container py-4 space-y-4">
          <Skeleton className="h-6 w-64" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-10 rounded" />
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container py-8 space-y-6">
        {/* General Settings Card */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings Card */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Danger Zone Card */}
        <div className="border border-destructive rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
