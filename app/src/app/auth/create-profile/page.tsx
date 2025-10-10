'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { createClient } from '@/lib/supabase';

type ProfileCreationData = {
  name: string;
};

export default function CreateProfilePage() {
  const t = useTranslations('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const queryClient = useQueryClient();
  const router = useRouter();

  // Zod schema INSIDE component to access translations
  const profileCreationSchema = z.object({
    name: z.string()
      .min(1, t('validation.name.required'))
      .min(2, t('validation.name.min'))
      .max(100, t('validation.name.max')),
  });

  const form = useForm<ProfileCreationData>({
    resolver: zodResolver(profileCreationSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  // Get user email from auth session
  useEffect(() => {
    const getUserEmail = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      } else {
        // If no user session, redirect to register
        router.push('/auth/register');
      }
    };
    getUserEmail();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileCreationData) => {
      let avatar_url: string | undefined;

      // Upload avatar if file exists
      if (avatarFile) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, {
              upsert: true,
              contentType: avatarFile.type
            });

          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
          } else if (uploadData) {
            // Get public URL for the avatar
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            avatar_url = urlData.publicUrl;
          }
        }
      }

      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          avatar_url,
        }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error(t('errors.serverError'));
        }
        const error = await response.json().catch(() => ({ error: t('errors.networkRetry') }));
        throw new Error(error.error || t('errors.networkRetry'));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setShowSuccess(true);

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    },
  });

  const onSubmit = async (data: ProfileCreationData) => {
    setIsSubmitting(true);
    try {
      await createProfileMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    createProfileMutation.reset();
    form.handleSubmit(onSubmit)();
  };

  // Check for empty name error
  const nameError = form.formState.errors.name?.message;

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-[500px]">
        <BackgroundGradient className="rounded-[22px] w-full p-1">
          <Card
            className="w-full"
            style={{ maxWidth: '500px' }}
          >
            <CardHeader className="text-center">
              <CardTitle>{t('createProfile.title')}</CardTitle>
              <CardDescription>
                {t('createProfile.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                role="form"
                data-testid="profile-form"
                className="space-y-6"
              >
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t('createProfile.name.label')}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('createProfile.name.placeholder')}
                    data-testid="name-input"
                    aria-label={t('createProfile.name.aria')}
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={form.formState.errors.name ? "name-error" : undefined}
                    {...form.register('name')}
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.name && (
                    <div
                      id="name-error"
                      data-testid="name-error"
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {nameError}
                    </div>
                  )}
                </div>

                {/* Avatar Upload Field */}
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="text-sm font-medium">
                    {t('createProfile.avatar.label')}
                  </Label>
                  <div className="space-y-4">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      data-testid="avatar-input"
                      aria-label={t('createProfile.avatar.aria')}
                      disabled={isSubmitting}
                      className="cursor-pointer"
                    />

                    {/* Avatar Preview */}
                    {avatarPreview && (
                      <div data-testid="avatar-preview" className="flex items-center justify-center">
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt={t('createProfile.avatar.preview')}
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                          />
                          <div className="absolute inset-0 w-24 h-24 rounded-full ring-2 ring-primary/20 animate-pulse"></div>
                        </div>
                      </div>
                    )}

                    {!avatarPreview && (
                      <div className="flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                  <Alert
                    data-testid="success-message"
                    role="alert"
                    className="border-green-500/20 bg-green-500/10"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {t('createProfile.success')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
                {createProfileMutation.error && (
                  <Alert
                    data-testid="error-message"
                    role="alert"
                    variant="destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {createProfileMutation.error.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  data-testid="submit-button"
                  aria-label={t('createProfile.submitAria')}
                  className="w-full h-11 min-h-[44px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        data-testid="loading-spinner"
                        variant="circle"
                        className="w-4 h-4 mr-2"
                      />
                      <span role="status" aria-live="polite">{t('createProfile.submitting')}</span>
                    </>
                  ) : (
                    <span>{t('createProfile.submit')}</span>
                  )}
                </Button>

                {/* Retry Button */}
                {createProfileMutation.error && (
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="retry-button"
                    onClick={handleRetry}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('createProfile.retry')}
                  </Button>
                )}
              </form>

              {/* Display user email */}
              {userEmail && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {t('createProfile.creatingFor')} <span className="font-medium">{userEmail}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </BackgroundGradient>
      </div>
    </div>
  );
}