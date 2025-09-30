'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { BackgroundGradient } from '@/components/ui/background-gradient';

// Schema de validación para el formulario
const profileCreationSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
});

type ProfileCreationData = z.infer<typeof profileCreationSchema>;

export default function CreateProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<ProfileCreationData>({
    resolver: zodResolver(profileCreationSchema),
    defaultValues: {
      name: '',
      email: '',
    },
    mode: 'onChange',
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileCreationData) => {
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
  const nameError = form.formState.errors.name?.message === 'Name is required'
    ? 'Name cannot be empty'
    : form.formState.errors.name?.message;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-[500px]">
        <BackgroundGradient className="rounded-[22px] w-full p-1">
          <Card
            data-testid="profile-form"
            className="w-full"
            style={{ maxWidth: '500px' }}
          >
            <CardHeader className="text-center">
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>
                Complete your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                role="form"
                className="space-y-6"
              >
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
                />
                {form.formState.errors.name && (
                  <div
                    data-testid="name-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {nameError}
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
                />
                {form.formState.errors.email && (
                  <div
                    data-testid="email-error"
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
                    Profile created successfully
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {createProfileMutation.error && (
                <Alert
                  data-testid="error-message"
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
                aria-label="Create profile"
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Profile</span>
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
                  Retry
                </Button>
              )}
              </form>
            </CardContent>
          </Card>
        </BackgroundGradient>
      </div>
    </div>
  );
}