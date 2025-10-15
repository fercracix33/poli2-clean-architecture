/**
 * Project Members Page
 *
 * Manage project members:
 * - List of current members with roles
 * - Add new members from organization
 * - Update member roles
 * - Remove members
 *
 * Route: /org/[slug]/projects/[projectSlug]/members
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useProjectBySlug } from '@/features/projects/hooks/useProject';
import { useProjectMembers } from '@/features/projects/hooks/useProjectMembers';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { ProjectMemberList } from '@/features/projects/components/ProjectMemberList';
import { AddProjectMemberDialog } from '@/features/projects/components/AddProjectMemberDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus } from 'lucide-react';

export default function ProjectMembersPage() {
  const t = useTranslations('projects');
  const params = useParams();
  const organizationSlug = params.slug as string;
  const projectSlug = params.projectSlug as string;

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  // Fetch project and members
  const { data: project, isLoading: projectLoading, error: projectError } = useProjectBySlug(organizationSlug, projectSlug);
  const { data: members, isLoading: membersLoading } = useProjectMembers(project?.id);

  // TODO: Fetch organization members for the add member dialog
  // For now, using mock data - in production, this would come from an API
  const organizationMembers: Array<{
    id: string;
    user_id: string;
    user_email: string;
    user_name: string;
  }> = [
    // Mock data - replace with actual organization members query
  ];

  if (projectLoading) {
    return <ProjectMembersPageSkeleton organizationSlug={organizationSlug} />;
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

  return (
    <>
      {/* Project Header with Tabs */}
      <ProjectHeader project={project} organizationSlug={organizationSlug} />

      {/* Main Content */}
      <div className="container py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('members.title')}</h2>
            <p className="text-muted-foreground mt-1">{t('members.subtitle')}</p>
            {members && (
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            )}
          </div>
          <Button
            onClick={() => setAddMemberDialogOpen(true)}
            className="gap-2"
            data-testid="add-member-button"
          >
            <UserPlus className="h-4 w-4" />
            {t('members.addButton')}
          </Button>
        </div>

        {/* Members List */}
        {membersLoading ? (
          <MembersListSkeleton />
        ) : (
          <ProjectMemberList
            members={members || []}
            projectId={project.id}
            availableRoles={[
              { id: 'viewer', name: 'Viewer' },
              { id: 'member', name: 'Member' },
              { id: 'admin', name: 'Admin' },
            ]}
          />
        )}
      </div>

      {/* Add Member Dialog */}
      <AddProjectMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        projectId={project.id}
        organizationMembers={organizationMembers}
        existingMembers={members || []}
        availableRoles={[
          { id: 'viewer', name: 'Viewer' },
          { id: 'member', name: 'Member' },
          { id: 'admin', name: 'Admin' },
        ]}
      />
    </>
  );
}

/**
 * Loading skeleton for project members page
 */
function ProjectMembersPageSkeleton({ organizationSlug }: { organizationSlug: string }) {
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <MembersListSkeleton />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for members list
 */
function MembersListSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
