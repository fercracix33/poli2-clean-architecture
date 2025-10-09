'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Upload, User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

// Schema de validación para el formulario
const profileUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Name cannot be empty')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export default function ProfileSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

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
          throw new Error('Something went wrong. Please try again later.');
        }
        const error = await response.json().catch(() => ({ error: 'Network error. Please try again.' }));
        throw new Error(error.error || 'Network error. Please try again.');
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
      form.setError('name', { message: 'Name cannot be empty' });
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
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your profile information
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
              <Label>Profile Picture</Label>
              <div className="flex items-center space-x-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
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
                    Upload Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                data-testid="name-input"
                aria-label="Full name"
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
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                data-testid="email-input"
                aria-label="Email address"
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
                  Profile updated successfully
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
              aria-label="Update profile"
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
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Profile</span>
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
                Retry
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}