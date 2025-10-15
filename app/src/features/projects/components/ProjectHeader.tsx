/**
 * ProjectHeader Component
 *
 * Header for project detail pages with:
 * - Breadcrumbs (Organization > Projects > Project Name)
 * - Project name and status badge
 * - Tabs (Overview, Members, Settings)
 * - Actions dropdown (Edit, Archive, Delete)
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import type { Project } from '../entities';
import { useState } from 'react';
import { EditProjectDialog } from './EditProjectDialog';
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
import { useArchiveProject, useUnarchiveProject, useDeleteProject } from '../hooks/useProjectMutations';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
  organizationSlug: string;
}

export function ProjectHeader({ project, organizationSlug }: ProjectHeaderProps) {
  const t = useTranslations('projects');
  const pathname = usePathname();
  const router = useRouter();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const archiveMutation = useArchiveProject();
  const unarchiveMutation = useUnarchiveProject();
  const deleteMutation = useDeleteProject();

  const isArchived = project.status === 'archived';

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.endsWith('/members')) return 'members';
    if (pathname.endsWith('/settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleArchive = async () => {
    await archiveMutation.mutateAsync(project.id);
    setArchiveDialogOpen(false);
  };

  const handleUnarchive = async () => {
    await unarchiveMutation.mutateAsync(project.id);
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== project.name) {
      return;
    }

    await deleteMutation.mutateAsync({
      id: project.id,
      organizationId: project.organization_id,
    });

    setDeleteDialogOpen(false);
    router.push(`/org/${organizationSlug}/projects`);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <div className="border-b bg-background">
      <div className="container py-4 space-y-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/org/${organizationSlug}`}>
                  {t('header.breadcrumbs.organization')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/org/${organizationSlug}/projects`}>
                  {t('header.breadcrumbs.projects')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Project Name and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.icon && <span className="text-3xl">{project.icon}</span>}
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge
                variant={
                  project.status === 'active'
                    ? 'default'
                    : project.status === 'completed'
                    ? 'secondary'
                    : 'outline'
                }
                className="mt-1"
              >
                {t(`card.status.${project.status}`)}
              </Badge>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Project actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                {t('actions.edit')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {isArchived ? (
                <DropdownMenuItem
                  onClick={handleUnarchive}
                  disabled={unarchiveMutation.isPending}
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  {unarchiveMutation.isPending
                    ? t('actions.unarchiving')
                    : t('actions.unarchive')}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setArchiveDialogOpen(true)}>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('actions.archive')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview" asChild>
              <Link href={`/org/${organizationSlug}/projects/${project.slug}`}>
                {t('header.tabs.overview')}
              </Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`/org/${organizationSlug}/projects/${project.slug}/members`}>
                {t('header.tabs.members')}
              </Link>
            </TabsTrigger>
            <TabsTrigger value="settings" asChild>
              <Link href={`/org/${organizationSlug}/projects/${project.slug}/settings`}>
                {t('header.tabs.settings')}
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <EditProjectDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Archive Confirmation */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmations.archive.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmations.archive.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirmations.archive.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('actions.archiving')}
                </>
              ) : (
                t('confirmations.archive.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmations.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmations.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label htmlFor="delete-confirm" className="text-sm font-medium text-muted-foreground">
              {t('confirmations.delete.warning')}
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={t('confirmations.delete.placeholder')}
              className="w-full mt-2 px-3 py-2 border rounded-md"
            />
            {deleteConfirmName && deleteConfirmName !== project.name && (
              <p className="text-sm text-destructive mt-2">
                {t('confirmations.delete.mismatch')}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirmations.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmName !== project.name || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('actions.deleting')}
                </>
              ) : (
                t('confirmations.delete.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
