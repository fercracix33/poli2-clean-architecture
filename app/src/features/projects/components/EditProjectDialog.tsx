/**
 * EditProjectDialog Component
 *
 * Modal dialog for editing existing projects
 * - Pre-populated with current values
 * - Slug is read-only (immutable)
 * - Uses useUpdateProject mutation
 * - Form validation with Zod
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectUpdateSchema, type ProjectUpdate, type Project } from '../entities';
import { useUpdateProject } from '../hooks/useProjectMutations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const t = useTranslations('projects');
  const updateMutation = useUpdateProject();

  // Create schema with translations inside component
  const createFormSchema = () => {
    return z.object({
      name: z
        .string()
        .min(2, t('form.name.error.tooShort'))
        .max(100, t('form.name.error.tooLong'))
        .optional(),
      description: z
        .string()
        .max(1000, t('form.description.error.tooLong'))
        .optional(),
      status: z.enum(['active', 'archived', 'completed', 'on_hold']).optional(),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, t('form.color.error'))
        .optional()
        .or(z.literal('')),
      icon: z
        .string()
        .max(50, t('form.icon.error.tooLong'))
        .optional(),
      is_favorite: z.boolean().optional(),
    });
  };

  const form = useForm<ProjectUpdate>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status,
      color: project.color || '',
      icon: project.icon || '',
      is_favorite: project.is_favorite,
    },
  });

  const onSubmit = async (data: ProjectUpdate) => {
    // Remove empty strings and convert to undefined
    const cleanedData: ProjectUpdate = {};
    if (data.name && data.name !== project.name) cleanedData.name = data.name;
    if (data.description !== undefined && data.description !== project.description) {
      cleanedData.description = data.description || undefined;
    }
    if (data.status && data.status !== project.status) cleanedData.status = data.status;
    if (data.color !== undefined && data.color !== project.color) {
      cleanedData.color = data.color || undefined;
    }
    if (data.icon !== undefined && data.icon !== project.icon) {
      cleanedData.icon = data.icon || undefined;
    }
    if (data.is_favorite !== undefined && data.is_favorite !== project.is_favorite) {
      cleanedData.is_favorite = data.is_favorite;
    }

    await updateMutation.mutateAsync({
      id: project.id,
      data: cleanedData,
    });

    onOpenChange(false);
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-project-description">
        <DialogHeader>
          <DialogTitle>{t('actions.edit')}</DialogTitle>
          <DialogDescription id="edit-project-description">
            {t('form.name.description')}
          </DialogDescription>
        </DialogHeader>

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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>{t('form.name.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug (Read-only) */}
            <FormItem>
              <FormLabel>{t('form.slug.label')}</FormLabel>
              <FormControl>
                <Input value={project.slug} disabled className="bg-muted" />
              </FormControl>
              <FormDescription>{t('form.slug.description')}</FormDescription>
            </FormItem>

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
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>{t('form.description.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.status.label')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('card.status.active')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t('card.status.active')}</SelectItem>
                      <SelectItem value="archived">{t('card.status.archived')}</SelectItem>
                      <SelectItem value="completed">{t('card.status.completed')}</SelectItem>
                      <SelectItem value="on_hold">{t('card.status.on_hold')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('form.status.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color and Icon (Optional) */}
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
                          disabled={isSubmitting}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          placeholder="#3B82F6"
                          {...field}
                          disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>{t('form.icon.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={isSubmitting}>
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
      </DialogContent>
    </Dialog>
  );
}
