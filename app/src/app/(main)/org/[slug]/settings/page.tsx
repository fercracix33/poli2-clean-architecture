/**
 * Organization Settings Page
 *
 * Manage organization settings:
 * - Edit organization details (name, slug, description)
 * - View and regenerate invite code
 * - Danger zone (leave/delete organization)
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OrganizationCreateSchema } from '@/features/organizations/entities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { AlertCircle, Copy, Check, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationSettingsPage() {
  const t = useTranslations('organization.settings');
  const tErrors = useTranslations('organization.errors');
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug as string;

  const [copiedCode, setCopiedCode] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  // Fetch organization via API route
  const { data: orgData, isLoading, error } = useQuery({
    queryKey: ['organization', slug],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${slug}/details`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch organization');
      }

      const orgDetails = await response.json();

      return {
        organization: orgDetails.organization,
        userId: orgDetails.organization.created_by, // Use creator ID from org
        isOwner: orgDetails.isOwner,
        isAdmin: orgDetails.isAdmin,
      };
    },
  });

  // Form for organization details
  const form = useForm<z.infer<typeof OrganizationCreateSchema>>({
    resolver: zodResolver(OrganizationCreateSchema),
    defaultValues: {
      name: orgData?.organization.name || '',
      slug: orgData?.organization.slug || '',
      description: orgData?.organization.description || '',
    },
  });

  // Update form when data loads
  if (orgData && !form.formState.isDirty) {
    form.reset({
      name: orgData.organization.name,
      slug: orgData.organization.slug,
      description: orgData.organization.description || '',
    });
  }

  // Update organization mutation via API route
  const updateOrgMutation = useMutation({
    mutationFn: async (data: z.infer<typeof OrganizationCreateSchema>) => {
      if (!orgData) throw new Error('Organization not loaded');

      const response = await fetch(`/api/organizations/${slug}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', slug] });
      toast.success(t('general.success'));
    },
    onError: (error: any) => {
      toast.error(t('general.error'), {
        description: error.message || tErrors('unknownError'),
      });
    },
  });

  // Copy invite code
  const handleCopyCode = async () => {
    if (!orgData) return;
    try {
      await navigator.clipboard.writeText(orgData.organization.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success(t('invite.copyCode'));
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Leave organization mutation via API route
  const leaveOrgMutation = useMutation({
    mutationFn: async () => {
      if (!orgData) throw new Error('Organization not loaded');

      const response = await fetch(`/api/organizations/${slug}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave organization');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('danger.leave.success'));
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(t('danger.leave.error'), {
        description: error.message || tErrors('unknownError'),
      });
    },
  });

  // Delete organization mutation via API route
  const deleteOrgMutation = useMutation({
    mutationFn: async () => {
      if (!orgData) throw new Error('Organization not loaded');

      const response = await fetch(`/api/organizations/${slug}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: deleteConfirmName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete organization');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('danger.delete.success'));
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(t('danger.delete.error'), {
        description: error.message || tErrors('unknownError'),
      });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Error state
  if (error || !orgData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tErrors('loadFailed')}</AlertTitle>
          <AlertDescription>
            {error?.message || tErrors('unknownError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const onSubmit = (data: z.infer<typeof OrganizationCreateSchema>) => {
    updateOrgMutation.mutate(data);
  };

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('general.title')}</CardTitle>
          {!orgData.isAdmin && (
            <Alert>
              <AlertDescription>
                {t('permissions.adminOnly')}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Organization Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('general.name.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('general.name.placeholder')}
                        disabled={!orgData.isAdmin}
                        data-testid="org-name-input"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('general.name.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organization Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('general.slug.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('general.slug.placeholder')}
                        disabled={!orgData.isAdmin}
                        data-testid="org-slug-input"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('general.slug.description')}
                      <br />
                      <span className="font-mono text-xs">
                        {t('general.slug.preview', { slug: field.value || 'your-org' })}
                      </span>
                    </FormDescription>
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
                    <FormLabel>{t('general.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('general.description.placeholder')}
                        disabled={!orgData.isAdmin}
                        rows={4}
                        data-testid="org-description-input"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('general.description.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              {orgData.isAdmin && (
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateOrgMutation.isPending || !form.formState.isDirty}
                    data-testid="save-org-settings"
                  >
                    {updateOrgMutation.isPending ? t('general.saving') : t('general.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={!form.formState.isDirty}
                  >
                    {t('general.cancel')}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Invite Code */}
      <Card>
        <CardHeader>
          <CardTitle>{t('invite.title')}</CardTitle>
          <CardDescription>
            {t('invite.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={orgData.organization.invite_code}
              readOnly
              className="font-mono text-lg"
              data-testid="org-invite-code"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleCopyCode}
              aria-label={copiedCode ? t('invite.copied') : t('invite.copyCode')}
            >
              {copiedCode ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t('danger.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leave Organization */}
          {!orgData.isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  data-testid="leave-org-button"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('danger.leave.button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('danger.leave.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('danger.leave.description', { orgName: orgData.organization.name })}
                    <br /><br />
                    {t('danger.leave.warning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('danger.leave.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => leaveOrgMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="confirm-leave-org"
                  >
                    {t('danger.leave.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Delete Organization (Owner Only) */}
          {orgData.isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  data-testid="delete-org-button"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('danger.delete.button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('danger.delete.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('danger.delete.description', { orgName: orgData.organization.name })}
                    <br /><br />
                    <strong>{t('danger.delete.warning')}</strong>
                    <br /><br />
                    {t('danger.delete.confirmText')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  placeholder={t('danger.delete.confirmPlaceholder')}
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  data-testid="delete-org-confirm-input"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmName('')}>
                    {t('danger.delete.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteOrgMutation.mutate()}
                    disabled={deleteConfirmName !== orgData.organization.name}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="confirm-delete-org"
                  >
                    {t('danger.delete.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
