/**
 * Create Project Page
 *
 * Dedicated page for creating a new project
 * Uses a full-page form instead of a dialog
 *
 * Route: /org/[slug]/projects/create
 *
 * Created by: Bug Fixer Agent
 * Date: 2025-10-15
 * Fix: Bug #5 - Separate create route from dynamic [projectSlug]
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useOrganization } from '@/features/organizations/hooks/useOrganization';
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
import { ProjectCreateSchema, type ProjectCreate } from '@/features/projects/entities';
import { useCreateProject } from '@/features/projects/hooks/useProjectMutations';
import { Loader2, Folder, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import Link from 'next/link';

export default function CreateProjectPage() {
  const t = useTranslations('projects');
  const params = useParams();
  const router = useRouter();
  const organizationSlug = params.slug as string;

  // Fetch organization by slug to get UUID
  const { data: orgData, isLoading: isOrgLoading, error: orgError } = useOrganization(organizationSlug);
  const organizationId = orgData?.organization.id;

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
      organization_id: organizationId || '',
      name: '',
      slug: '',
      description: '',
      status: 'active',
      color: '#6366f1',
      icon: '📁',
      is_favorite: false,
    },
  });

  // Update organization_id when it loads
  useEffect(() => {
    if (organizationId) {
      form.setValue('organization_id', organizationId);
    }
  }, [organizationId, form]);

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
      onSuccess: (newProject) => {
        // Redirect to the new project's page
        router.push(`/org/${organizationSlug}/projects/${newProject.slug}`);
      },
    });
  };

  const slug = form.watch('slug');
  const color = form.watch('color');
  const icon = form.watch('icon');

  if (isOrgLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orgError || !organizationId) {
    return (
      <div className="container py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4 inline-block">
          <svg
            className="h-6 w-6 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">{t('errors.loadFailed')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {orgError instanceof Error ? orgError.message : t('errors.unknownError')}
        </p>
        <Button asChild className="mt-4">
          <Link href={`/org/${organizationSlug}/projects`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('actions.back')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-slide-in-up">
        <Link href={`/org/${organizationSlug}/projects`} className="hover:text-foreground transition-colors duration-200">
          {t('list.title')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t('actions.create')}</span>
      </div>

      {/* Page Header */}
      <div className="animate-slide-in-up" style={{ animationDelay: '50ms' }}>
        <h1 className="text-3xl font-bold text-foreground">{t('actions.create')}</h1>
        <p className="text-muted-foreground mt-1">{t('form.name.description')}</p>
      </div>

      {/* Create Form */}
      <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-foreground">{t('form.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('form.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
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

              {/* Status Field */}
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
                  onClick={() => router.push(`/org/${organizationSlug}/projects`)}
                  disabled={createMutation.isPending}
                  className="hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="submit-create-project"
                  className="hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      {t('actions.creating')}
                    </>
                  ) : (
                    t('actions.create')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
