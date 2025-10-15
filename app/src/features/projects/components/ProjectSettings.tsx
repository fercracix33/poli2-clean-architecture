/**
 * ProjectSettings Component
 *
 * Settings page content for a project with:
 * - General settings form (name, description, color, icon)
 * - Advanced settings (JSON configuration)
 * - Danger zone (archive, delete actions)
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Project, ProjectUpdate } from '../entities';
import { useUpdateProject, useArchiveProject, useDeleteProject } from '../hooks/useProjectMutations';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Archive, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectSettingsProps {
  project: Project;
  organizationSlug: string;
}

export function ProjectSettings({ project, organizationSlug }: ProjectSettingsProps) {
  const t = useTranslations('projects');
  const router = useRouter();

  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateMutation = useUpdateProject();
  const archiveMutation = useArchiveProject();
  const deleteMutation = useDeleteProject();

  const isArchived = project.status === 'archived';

  // Create form schema with translations
  const createFormSchema = () => {
    return z.object({
      name: z
        .string()
        .min(2, t('form.name.error.tooShort'))
        .max(100, t('form.name.error.tooLong')),
      description: z
        .string()
        .max(1000, t('form.description.error.tooLong'))
        .optional(),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, t('form.color.error'))
        .optional()
        .or(z.literal('')),
      icon: z
        .string()
        .max(50, t('form.icon.error.tooLong'))
        .optional(),
      settings: z.string().optional(), // JSON string
    });
  };

  const form = useForm<{
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    settings?: string;
  }>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      color: project.color || '',
      icon: project.icon || '',
      settings: project.settings ? JSON.stringify(project.settings, null, 2) : '',
    },
  });

  const onSubmit = async (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    settings?: string;
  }) => {
    // Parse JSON settings if provided
    let parsedSettings: Record<string, any> | undefined;
    if (data.settings) {
      try {
        parsedSettings = JSON.parse(data.settings);
      } catch (error) {
        form.setError('settings', {
          message: 'Invalid JSON format',
        });
        return;
      }
    }

    const updateData: ProjectUpdate = {
      name: data.name !== project.name ? data.name : undefined,
      description: data.description !== project.description ? data.description : undefined,
      color: data.color !== project.color ? data.color || undefined : undefined,
      icon: data.icon !== project.icon ? data.icon || undefined : undefined,
      settings: parsedSettings,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof ProjectUpdate] === undefined) {
        delete updateData[key as keyof ProjectUpdate];
      }
    });

    await updateMutation.mutateAsync({
      id: project.id,
      data: updateData,
    });
  };

  const handleArchive = async () => {
    await archiveMutation.mutateAsync(project.id);
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

  const isSubmitting = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.general.title')}</CardTitle>
          <CardDescription>{t('settings.general.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.name.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.name.placeholder')}
                        {...field}
                        disabled={isSubmitting || isArchived}
                      />
                    </FormControl>
                    <FormDescription>{t('form.name.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.description.placeholder')}
                        {...field}
                        disabled={isSubmitting || isArchived}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>{t('form.description.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color and Icon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.color.label')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            disabled={isSubmitting || isArchived}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            placeholder="#3B82F6"
                            {...field}
                            disabled={isSubmitting || isArchived}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>{t('form.color.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.icon.label')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.icon.placeholder')}
                          {...field}
                          disabled={isSubmitting || isArchived}
                        />
                      </FormControl>
                      <FormDescription>{t('form.icon.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || isArchived}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('actions.saving')}
                    </>
                  ) : (
                    t('actions.save')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.advanced.title')}</CardTitle>
          <CardDescription>{t('settings.advanced.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="settings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.settings.label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('settings.advanced.placeholder')}
                      {...field}
                      disabled={isSubmitting || isArchived}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>{t('form.settings.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('settings.danger.title')}</CardTitle>
          <CardDescription>{t('settings.danger.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Archive Button */}
          {!isArchived && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{t('actions.archive')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('confirmations.archive.description')}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Archive className="h-4 w-4" />
                    {t('settings.danger.archiveButton')}
                  </Button>
                </AlertDialogTrigger>
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
            </div>
          )}

          {/* Delete Button */}
          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium text-destructive">{t('actions.delete')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('confirmations.delete.description')}
              </p>
            </div>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t('settings.danger.deleteButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmations.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmations.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label htmlFor="delete-confirm-input" className="text-sm font-medium text-muted-foreground">
              {t('confirmations.delete.warning')}
            </label>
            <input
              id="delete-confirm-input"
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
