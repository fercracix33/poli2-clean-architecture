/**
 * ProjectList Component
 *
 * Displays grid of project cards with loading and empty states
 * Handles filtering and search
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { ProjectWithStats } from '../entities';
import { ProjectCard } from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProjectListProps {
  projects?: ProjectWithStats[];
  organizationSlug: string;
  isLoading: boolean;
  onEdit?: (project: ProjectWithStats) => void;
  onArchive?: (projectId: string) => void;
  onUnarchive?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectList({
  projects,
  organizationSlug,
  isLoading,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ProjectListProps) {
  const t = useTranslations('projects');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{t('list.search.noResults')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('list.search.noResultsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="projects-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          organizationSlug={organizationSlug}
          onEdit={onEdit}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
