/**
 * Project Overview Page
 *
 * Project details page showing:
 * - Project header with navigation tabs
 * - Project statistics (members, created date, status)
 * - Description
 * - Recent activity placeholder
 * - Quick actions
 *
 * Route: /org/[slug]/projects/[projectSlug]
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useProjectBySlug } from '@/features/projects/hooks/useProject';
import { useProjectMembers } from '@/features/projects/hooks/useProjectMembers';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, Activity, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ProjectOverviewPage() {
  const t = useTranslations('projects');
  const params = useParams();
  const organizationSlug = params.slug as string;
  const projectSlug = params.projectSlug as string;

  // Fetch project data
  const { data: project, isLoading: projectLoading, error: projectError } = useProjectBySlug(organizationSlug, projectSlug);
  const { data: members, isLoading: membersLoading } = useProjectMembers(project?.id);

  if (projectLoading) {
    return <ProjectOverviewSkeleton />;
  }

  if (projectError || !project) {
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
          {projectError instanceof Error ? projectError.message : t('errors.notFound')}
        </p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <>
      {/* Project Header with Tabs */}
      <ProjectHeader project={project} organizationSlug={organizationSlug} />

      {/* Main Content */}
      <div className="container py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Members Count */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {membersLoading ? (
                          <Skeleton className="h-8 w-12" />
                        ) : (
                          members?.length || 0
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('overview.stats.members')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Created Date */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {formatRelativeDate(project.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('overview.stats.created')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Activity className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <Badge
                        variant={
                          project.status === 'active'
                            ? 'default'
                            : project.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {t(`card.status.${project.status}`)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('overview.stats.status')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {project.description && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('overview.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity (Placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.activity.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('overview.activity.noActivity')}</p>
                  <p className="text-sm mt-1">{t('overview.activity.placeholder')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('overview.quickActions.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link href={`/org/${organizationSlug}/projects/${projectSlug}/members`}>
                    <UserPlus className="h-4 w-4" />
                    {t('overview.quickActions.addMembers')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link href={`/org/${organizationSlug}/projects/${projectSlug}/settings`}>
                    <Settings className="h-4 w-4" />
                    {t('overview.quickActions.viewSettings')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" disabled>
                  <Activity className="h-4 w-4" />
                  {t('overview.quickActions.createTask')}
                </Button>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(project.created_at)}</p>
                </div>
                {project.updated_at && (
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{formatDate(project.updated_at)}</p>
                  </div>
                )}
                {project.archived_at && (
                  <div>
                    <p className="text-muted-foreground">Archived</p>
                    <p className="font-medium">{formatDate(project.archived_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Loading skeleton for project overview
 */
function ProjectOverviewSkeleton() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
