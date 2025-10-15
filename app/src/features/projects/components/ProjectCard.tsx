/**
 * ProjectCard Component
 *
 * Card displaying project information with actions
 * Used in project listings
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectWithStats } from '../entities';
import { Users, MoreVertical, Star, StarOff, Edit, Archive, ArchiveRestore, Trash2, Folder } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToggleFavorite } from '../hooks/useProjectMutations';
import Link from 'next/link';

interface ProjectCardProps {
  project: ProjectWithStats;
  organizationSlug: string;
  onEdit?: (project: ProjectWithStats) => void;
  onArchive?: (projectId: string) => void;
  onUnarchive?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  organizationSlug,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ProjectCardProps) {
  const t = useTranslations('projects');
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate({ id: project.id, isFavorite: project.is_favorite });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'archived':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'on_hold':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Link href={`/org/${organizationSlug}/projects/${project.slug}`}>
      <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Project Icon/Color */}
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: project.color || '#6366f1' }}
              >
                {project.icon || <Folder className="h-5 w-5 text-white" />}
              </div>

              {/* Project Title */}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={handleToggleFavorite}
                aria-label={project.is_favorite ? t('card.unfavorite') : t('card.favorite')}
                data-testid={`favorite-${project.id}`}
              >
                {project.is_favorite ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  aria-label="Actions"
                  data-testid={`project-actions-${project.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(project);
                    }}
                    data-testid={`edit-project-${project.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('actions.edit')}
                  </DropdownMenuItem>
                )}

                {project.status === 'archived' && onUnarchive && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUnarchive(project.id);
                    }}
                    data-testid={`unarchive-project-${project.id}`}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    {t('actions.unarchive')}
                  </DropdownMenuItem>
                )}

                {project.status !== 'archived' && onArchive && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onArchive(project.id);
                    }}
                    data-testid={`archive-project-${project.id}`}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {t('actions.archive')}
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(project.id);
                      }}
                      data-testid={`delete-project-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {project.description && (
            <CardDescription className="line-clamp-2 mt-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Status Badge */}
          <div>
            <Badge className={getStatusColor(project.status)}>
              {t(`card.status.${project.status}`)}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t('card.members', { count: project.member_count })}</span>
            </div>

            {project.creator_name && (
              <div className="text-xs truncate max-w-[150px]">
                {t('card.createdBy', { name: project.creator_name })}
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="text-xs text-muted-foreground">
            {new Date(project.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
