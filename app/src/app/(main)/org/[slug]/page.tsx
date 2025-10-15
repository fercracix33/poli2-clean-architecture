/**
 * Organization Dashboard Page
 *
 * Main dashboard for an organization showing:
 * - Welcome message with user role
 * - Organization statistics
 * - Quick actions
 * - Recent activity
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 * Refactored: Phase 3 - TDD Remediation (Clean Architecture compliance)
 */

'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '@/features/organizations/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  FolderKanban,
  Plus,
  UserPlus,
  Settings,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function OrganizationDashboard() {
  const t = useTranslations('organization');
  const tErrors = useTranslations('organization');
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch organization details via API route
  const { data: orgDetails, isLoading: isLoadingOrg, error: orgError } = useQuery({
    queryKey: ['organization', slug],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${slug}/details`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch organization');
      }

      return await response.json();
    },
  });

  // Fetch organization stats via API route
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['organization-stats', orgDetails?.organization.id],
    queryFn: async () => {
      if (!orgDetails?.organization.id) throw new Error('Organization not loaded');

      const response = await fetch(`/api/organizations/${slug}/stats`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch stats');
      }

      return await response.json();
    },
    enabled: !!orgDetails?.organization.id,
  });

  // Extract stats with defaults
  const memberCount = stats?.member_count || 0;
  const projectCount = stats?.project_count || 0;

  // Loading state
  if (isLoadingOrg || isLoadingStats) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      </div>
    );
  }

  // Error state
  if (orgError || !orgDetails) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tErrors('loadFailed')}</AlertTitle>
          <AlertDescription>
            {orgError?.message || tErrors('unknownError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { organization, userRole } = orgDetails;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome', { orgName: organization.name })}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.yourRole', { role: userRole })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title={t('dashboard.stats.membersTitle')}
          value={memberCount}
          icon={Users}
          description={t('dashboard.stats.members', { count: memberCount })}
        />
        <StatsCard
          title={t('dashboard.stats.projectsTitle')}
          value={projectCount}
          icon={FolderKanban}
          description={t('dashboard.stats.projects', { count: projectCount })}
        />
        <StatsCard
          title={t('dashboard.stats.activity')}
          value="0"
          icon={TrendingUp}
          description={t('dashboard.recentActivity.noActivity')}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={() => router.push(`/org/${slug}/projects/create`)}
            data-testid="create-project-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('dashboard.quickActions.createProject')}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/org/${slug}/members`)}
            data-testid="invite-members-button"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('dashboard.quickActions.inviteMembers')}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/org/${slug}/settings`)}
            data-testid="view-settings-button"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('dashboard.quickActions.viewSettings')}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.recentActivity.noActivity')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('dashboard.recentActivity.noActivity')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty State - No Projects */}
      {projectCount === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t('dashboard.empty.noProjects')}</CardTitle>
            <CardDescription>
              {t('dashboard.empty.noProjectsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(`/org/${slug}/projects/create`)}
              data-testid="create-first-project-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.empty.createFirstProject')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
