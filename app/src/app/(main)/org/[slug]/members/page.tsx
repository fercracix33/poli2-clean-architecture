/**
 * Organization Members Page
 *
 * Displays and manages organization members:
 * - List all members with search and filter
 * - Invite new members (show invite code)
 * - Remove members (with permissions)
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 * Refactored: Phase 3 - TDD Remediation (Clean Architecture compliance)
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { MemberList } from '@/features/organizations/components/MemberList';
import { InviteDialog } from '@/features/organizations/components/InviteDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationMembersPage() {
  const t = useTranslations('organization.members');
  const tErrors = useTranslations('organization.errors');
  const params = useParams();
  const queryClient = useQueryClient();
  const slug = params.slug as string;

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Fetch organization details via API route
  const { data: orgDetails, isLoading: isLoadingOrg } = useQuery({
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

  // Fetch members list (using service function - acceptable for data retrieval)
  const { data: members, isLoading: isLoadingMembers, error: membersError } = useQuery({
    queryKey: ['organization', slug, 'members'],
    queryFn: async () => {
      if (!orgDetails) return [];

      const supabase = await createClient();
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user_profile:user_profiles(*),
          role:roles(name)
        `)
        .eq('organization_id', orgDetails.organization.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgDetails?.organization.id,
  });

  // Remove member mutation via API route
  const removeMemberMutation = useMutation({
    mutationFn: async ({ memberId, userName }: { memberId: string; userName: string }) => {
      if (!orgDetails) throw new Error('Organization data not loaded');

      const response = await fetch(`/api/organizations/${slug}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      return userName;
    },
    onSuccess: (userName) => {
      queryClient.invalidateQueries({ queryKey: ['organization', slug, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats', orgDetails?.organization.id] });
      toast.success(t('remove.success'), {
        description: `${userName} has been removed from the organization`,
      });
    },
    onError: (error) => {
      toast.error(t('remove.error'), {
        description: error instanceof Error ? error.message : tErrors('unknownError'),
      });
    },
  });

  // Loading state
  if (isLoadingOrg || isLoadingMembers) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Error state
  if (membersError || !orgDetails || !members) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tErrors('loadFailed')}</AlertTitle>
          <AlertDescription>
            {membersError?.message || tErrors('unknownError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        {/* Use permission flag from use case instead of direct query */}
        {orgDetails.canManageMembers && (
          <Button
            onClick={() => setInviteDialogOpen(true)}
            data-testid="invite-members-button"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('inviteButton')}
          </Button>
        )}
      </div>

      {/* Members List */}
      <MemberList
        members={members}
        currentUserId={orgDetails.organization.created_by}
        canManageMembers={orgDetails.canManageMembers}
        onRemoveMember={async (memberId, userName) => {
          await removeMemberMutation.mutateAsync({ memberId, userName });
        }}
      />

      {/* Invite Dialog */}
      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        inviteCode={orgDetails.organization.invite_code}
        organizationSlug={orgDetails.organization.slug}
      />
    </div>
  );
}
