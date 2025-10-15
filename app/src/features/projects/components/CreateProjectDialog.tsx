/**
 * CreateProjectDialog Component
 *
 * Dialog for creating a new project
 * Includes form validation, slug auto-generation, and preview
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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
import { Button } from '@/components/ui/button';
// Note: Select component needs to be installed via shadcn/ui
// Run: npx shadcn-ui@latest add select
// For now, using native select element
import { ProjectCreateSchema, type ProjectCreate } from '../entities';
import { useCreateProject } from '../hooks/useProjectMutations';
import { Loader2, Folder } from 'lucide-react';
import { z } from 'zod';

interface CreateProjectDialogProps {
  organizationId: string;
  organizationSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  organizationId,
  organizationSlug,
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const t = useTranslations('projects');
  const createMutation = useCreateProject();

  // Create schema with translated error messages
  const createSchema = z.object({
    organization_id: z.string().uuid(),
    name: z.string()
      .min(2, t('form.name.error.tooShort'))
      .max(100, t('form.name.error.tooLong')),
    slug: z.string()
      .min(2, t('form.slug.error.tooShort'))
      .max(50, t('form.slug.error.tooLong'))
      .regex(/^[a-z0-9\-_]+$/, t('form.slug.error.invalid')),
    description: z.string()
      .max(1000, t('form.description.error.tooLong'))
      .optional(),
    status: z.enum(['active', 'archived', 'completed', 'on_hold']).default('active'),
    color: z.string()
      .regex(/^#[0-9A-Fa-f]{6}$/, t('form.color.error'))
      .optional(),
    icon: z.string()
      .max(50, t('form.icon.error.tooLong'))
      .optional(),
    is_favorite: z.boolean().default(false),
    settings: z.record(z.any()).optional(),
  });

  const form = useForm<ProjectCreate>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      organization_id: organizationId,
      name: '',
      slug: '',
      description: '',
      status: 'active',
      color: '#6366f1',
      icon: '📁',
      is_favorite: false,
    },
  });

  // Auto-generate slug from name
  const name = form.watch('name');
  useEffect(() => {
    if (name && !form.formState.dirtyFields.slug) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      form.setValue('slug', generatedSlug);
    }
  }, [name, form]);

  const onSubmit = (data: ProjectCreate) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const slug = form.watch('slug');
  const color = form.watch('color');
  const icon = form.watch('icon');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('actions.create')}</DialogTitle>
          <DialogDescription>{t('form.name.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview */}
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: color || '#6366f1' }}
              >
                {icon || <Folder className="h-6 w-6 text-white" />}
              </div>
              <div>
                <div className="font-medium">{name || t('form.name.placeholder')}</div>
                {slug && (
                  <div className="text-sm text-muted-foreground">
                    /org/{organizationSlug}/projects/{slug}
                  </div>
                )}
              </div>
            </div>

            {/* Name Field */}
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
                      data-testid="project-name"
                    />
                  </FormControl>
                  <FormDescription>{t('form.name.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug Field */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.slug.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.slug.placeholder')}
                      {...field}
                      data-testid="project-slug"
                    />
                  </FormControl>
                  <FormDescription>{t('form.slug.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
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
                      rows={3}
                      data-testid="project-description"
                    />
                  </FormControl>
                  <FormDescription>{t('form.description.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color & Icon Row */}
            <div className="grid grid-cols-2 gap-4">
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
                          className="h-10 w-20"
                          data-testid="project-color"
                        />
                        <Input
                          type="text"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="#6366f1"
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
                        maxLength={50}
                        data-testid="project-icon"
                      />
                    </FormControl>
                    <FormDescription>{t('form.icon.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Field - Using native select until shadcn Select is installed */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.status.label')}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      data-testid="project-status"
                    >
                      <option value="active">{t('card.status.active')}</option>
                      <option value="on_hold">{t('card.status.on_hold')}</option>
                      <option value="completed">{t('card.status.completed')}</option>
                    </select>
                  </FormControl>
                  <FormDescription>{t('form.status.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="submit-create-project"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('actions.creating')}
                  </>
                ) : (
                  t('actions.create')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
