'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Upload, User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type ProfileUpdateData = {
  name: string;
  email: string;
};

export default function ProfileSettingsPage() {
  const t = useTranslations('settings');
  const tValidation = useTranslations('settings.validation');
  const tErrors = useTranslations('settings.errors');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Create Zod schema INSIDE component to access translations
  const profileUpdateSchema = z.object({
    name: z.string()
      .min(1, tValidation('name.required'))
      .min(2, tValidation('name.min'))
      .max(100, tValidation('name.max')),
    email: z.string()
      .min(1, tValidation('email.required'))
      .email(tValidation('email.invalid')),
  });

  // Fetch current profile
  const { data: currentProfile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      // Mock data for testing - replace with actual API call
      return {
        name: 'Current User',
        email: 'current@example.com',
        avatar: null
      };
    },
  });

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: currentProfile?.name || 'Current User',
      email: currentProfile?.email || 'current@example.com',
    },
    values: currentProfile ? {
      name: currentProfile.name,
      email: currentProfile.email,
    } : undefined,
    mode: 'onChange',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error(tErrors('serverError'));
        }
        const error = await response.json().catch(() => ({ error: tErrors('network') }));
        throw new Error(error.error || tErrors('network'));
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const onSubmit = async (data: ProfileUpdateData) => {
    // Validate name is not empty
    if (!data.name || data.name.trim() === '') {
      form.setError('name', { message: tValidation('name.required') });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfileMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetry = () => {
    updateProfileMutation.reset();
    form.handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card
        className="w-full mx-auto"
        style={{
          maxWidth: window.innerWidth < 768 ? '100%' : window.innerWidth < 1024 ? '600px' : '500px'
        }}
      >
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>
            {t('profile.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-testid="profile-form"
            role="form"
            className="space-y-6"
            style={{ width: '100%' }}
          >
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>{t('profile.avatar.label')}</Label>
              <div className="flex items-center space-x-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={t('profile.avatar.preview')}
                    data-testid="avatar-preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    data-testid="avatar-input"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('profile.avatar.upload')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('profile.name.label')}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('profile.name.placeholder')}
                data-testid="name-input"
                aria-label={t('profile.name.aria')}
                {...form.register('name')}
                disabled={isSubmitting}
                style={{ width: '100%' }}
              />
              {form.formState.errors.name && (
                <div
                  data-testid="error-message"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {form.formState.errors.name.message}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t('profile.email.label')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('profile.email.placeholder')}
                data-testid="email-input"
                aria-label={t('profile.email.aria')}
                {...form.register('email')}
                disabled={isSubmitting}
                style={{ width: '100%' }}
              />
              {form.formState.errors.email && (
                <div
                  data-testid="error-message"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {form.formState.errors.email.message}
                </div>
              )}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <Alert
                data-testid="success-message"
                className="border-green-500/20 bg-green-500/10"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {t('profile.success')}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {updateProfileMutation.error && (
              <Alert
                data-testid="error-message"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {updateProfileMutation.error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Update Button */}
            <Button
              type="submit"
              data-testid="update-button"
              aria-label={t('profile.submit')}
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    data-testid="loading-spinner"
                    variant="circle"
                    className="w-4 h-4 mr-2"
                  />
                  <span>{t('profile.submitting')}</span>
                </>
              ) : (
                <span>{t('profile.submit')}</span>
              )}
            </Button>

            {/* Retry Button */}
            {updateProfileMutation.error && (
              <Button
                type="button"
                variant="outline"
                data-testid="retry-button"
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('profile.retry')}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}