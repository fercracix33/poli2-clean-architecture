/**
 * ProjectMemberList Component
 *
 * Table displaying project members with:
 * - Name, email, role, joined date columns
 * - Role update dropdown
 * - Remove member action
 * - Empty state when no members
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ProjectMemberWithUser } from '../entities';
import {
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
} from '../hooks/useProjectMembers';

interface ProjectMemberListProps {
  members: ProjectMemberWithUser[];
  projectId: string;
  availableRoles?: Array<{ id: string; name: string }>;
}

export function ProjectMemberList({
  members,
  projectId,
  availableRoles = [
    { id: 'viewer', name: 'Viewer' },
    { id: 'member', name: 'Member' },
    { id: 'admin', name: 'Admin' },
  ],
}: ProjectMemberListProps) {
  const t = useTranslations('projects');
  const [removingMember, setRemovingMember] = useState<ProjectMemberWithUser | null>(null);

  const removeMutation = useRemoveProjectMember();
  const updateRoleMutation = useUpdateProjectMemberRole();

  const handleRemoveMember = async () => {
    if (!removingMember) return;

    await removeMutation.mutateAsync({
      projectId,
      userId: removingMember.user_id,
    });

    setRemovingMember(null);
  };

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    await updateRoleMutation.mutateAsync({
      projectId,
      userId,
      roleId: newRoleId,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (members.length === 0) {
    return (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">{t('members.empty.title')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('members.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">{t('members.table.name')}</TableHead>
              <TableHead>{t('members.table.email')}</TableHead>
              <TableHead className="w-[150px]">{t('members.table.role')}</TableHead>
              <TableHead className="w-[150px]">{t('members.table.joined')}</TableHead>
              <TableHead className="w-[100px] text-right">
                {t('members.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                {/* Name with Avatar */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user_avatar_url || undefined} />
                      <AvatarFallback>{getInitials(member.user_name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.user_name}</span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="text-muted-foreground">
                  {member.user_email}
                </TableCell>

                {/* Role Selector */}
                <TableCell>
                  <Select
                    value={member.role_id}
                    onValueChange={(value) => handleRoleChange(member.user_id, value)}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Joined Date */}
                <TableCell className="text-muted-foreground">
                  {formatDate(member.joined_at)}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRemovingMember(member)}
                    aria-label={t('actions.removeMember')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={!!removingMember}
        onOpenChange={(open) => !open && setRemovingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmations.removeMember.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {removingMember &&
                t('confirmations.removeMember.description', {
                  name: removingMember.user_name,
                })}
              <br />
              <span className="text-destructive font-medium mt-2 block">
                {t('confirmations.removeMember.warning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('confirmations.removeMember.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('actions.removeMember')}
                </>
              ) : (
                t('confirmations.removeMember.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
