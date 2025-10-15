/**
 * AddProjectMemberDialog Component
 *
 * Modal dialog for adding members to a project
 * - User selector (from organization members)
 * - Role selector
 * - Filters out existing project members
 * - Uses useAddProjectMember mutation
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAddProjectMember } from '../hooks/useProjectMembers';
import type { ProjectMemberWithUser } from '../entities';

interface OrganizationMember {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
}

interface AddProjectMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  organizationMembers: OrganizationMember[];
  existingMembers: ProjectMemberWithUser[];
  availableRoles?: Array<{ id: string; name: string }>;
}

export function AddProjectMemberDialog({
  open,
  onOpenChange,
  projectId,
  organizationMembers,
  existingMembers,
  availableRoles = [
    { id: 'viewer', name: 'Viewer' },
    { id: 'member', name: 'Member' },
    { id: 'admin', name: 'Admin' },
  ],
}: AddProjectMemberDialogProps) {
  const t = useTranslations('projects');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('member');

  const addMemberMutation = useAddProjectMember();

  // Filter out members already in the project
  const existingMemberUserIds = new Set(existingMembers.map((m) => m.user_id));
  const availableMembers = organizationMembers.filter(
    (member) => !existingMemberUserIds.has(member.user_id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedRoleId) {
      return;
    }

    await addMemberMutation.mutateAsync({
      projectId,
      user_id: selectedUserId,
      role_id: selectedRoleId,
    });

    // Reset form and close dialog
    setSelectedUserId('');
    setSelectedRoleId('member');
    onOpenChange(false);
  };

  const isSubmitting = addMemberMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="add-member-description">
        <DialogHeader>
          <DialogTitle>{t('members.addDialog.title')}</DialogTitle>
          <DialogDescription id="add-member-description">
            {t('members.addDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {availableMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('members.addDialog.noMembers')}</p>
              <p className="text-sm mt-1">{t('members.addDialog.alreadyMember')}</p>
            </div>
          ) : (
            <>
              {/* User Selector */}
              <div className="space-y-2">
                <Label htmlFor="member-select">{t('members.addDialog.userLabel')}</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="member-select">
                    <SelectValue placeholder={t('members.addDialog.userPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {member.user_email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role-select">{t('members.addDialog.roleLabel')}</Label>
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder={t('members.addDialog.rolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t('actions.cancel')}
                </Button>
                <Button type="submit" disabled={!selectedUserId || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('actions.addMember')}
                    </>
                  ) : (
                    t('actions.addMember')
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
