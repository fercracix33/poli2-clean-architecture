/**
 * MemberList Component
 *
 * Displays list of organization members with actions
 * Includes search, filter, and member management
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { OrganizationMember } from '@/features/organizations/entities';
import { UserProfile } from '@/features/auth/entities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleBadge } from './RoleBadge';
import { MoreVertical, Search, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MemberWithDetails extends OrganizationMember {
  user_profile: UserProfile;
  role: { name: string };
}

interface MemberListProps {
  members: MemberWithDetails[];
  currentUserId: string;
  canManageMembers: boolean;
  onRemoveMember?: (memberId: string, userName: string) => Promise<void>;
}

export function MemberList({
  members,
  currentUserId,
  canManageMembers,
  onRemoveMember
}: MemberListProps) {
  const t = useTranslations('organization.members');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user_profile.name.toLowerCase().includes(searchLower) ||
      member.user_profile.email.toLowerCase().includes(searchLower)
    );
  });

  const handleRemoveMember = async () => {
    if (!memberToRemove || !onRemoveMember) return;

    setIsRemoving(true);
    try {
      await onRemoveMember(memberToRemove.id, memberToRemove.name);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="member-search-input"
            />
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">{t('empty.title')}</p>
                <p className="text-sm">{t('empty.description')}</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  data-testid={`member-item-${member.user_id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.user_profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.user_profile.name}
                        {member.user_id === currentUserId && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.user_profile.email}
                      </p>
                    </div>

                    {/* Role Badge */}
                    <RoleBadge role={member.role.name} />

                    {/* Joined Date */}
                    <div className="hidden md:block text-sm text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  {canManageMembers && member.user_id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('actions.removeMember')}
                          data-testid={`member-actions-${member.user_id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setMemberToRemove({
                            id: member.user_id,
                            name: member.user_profile.name
                          })}
                          data-testid={`remove-member-${member.user_id}`}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {t('actions.removeMember')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('remove.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('remove.description', { name: memberToRemove?.name || '' })}
              <br />
              <br />
              {t('remove.warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              {t('remove.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-remove-member"
            >
              {isRemoving ? t('remove.removing') : t('remove.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
