'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, CheckCircle } from 'lucide-react';
import { MotionEffect } from '@/components/ui/motion-effect';
import BlurText from '@/components/ui/blur-text';
import { Spinner } from '@/components/ui/spinner';

type ProfileCreationData = {
  name: string;
  email: string;
};

interface ProfileCreationFormProps {
  onSuccess?: (profile: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ProfileCreationForm({
  onSuccess,
  onError,
  className = ''
}: ProfileCreationFormProps) {
  const t = useTranslations('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Zod schema INSIDE component to access translations
  const profileCreationSchema = z.object({
    name: z.string()
      .min(2, t('validation.name.min'))
      .max(100, t('validation.name.max'))
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, t('validation.name.format')),
    email: z.string()
      .email(t('validation.email.invalid'))
      .min(1, t('validation.email.required')),
  });

  const form = useForm<ProfileCreationData>({
    resolver: zodResolver(profileCreationSchema),
    defaultValues: {
      name: '',
      email: '',
    },
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
        const error = await response.json();
        throw new Error(error.error || t('errors.profileSaveFailed'));
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error.message);
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

  return (
    <MotionEffect
      fade={{ initialOpacity: 0, opacity: 1 }}
      slide={{ direction: 'up', offset: 30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-md mx-auto ${className}`}
    >
      <Card className="border-border/50 shadow-lg shadow-primary/5 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <MotionEffect
            zoom={{ initialScale: 0.8, scale: 1 }}
            delay={0.2}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
          </MotionEffect>
          
          <div className="space-y-2">
            <BlurText
              text={t('createProfile.title')}
              className="text-2xl font-semibold text-foreground"
              delay={100}
              animateBy="words"
            />
            <MotionEffect
              fade={{ initialOpacity: 0, opacity: 1 }}
              delay={0.4}
            >
              <CardDescription className="text-muted-foreground">
                {t('createProfile.subtitle')}
              </CardDescription>
            </MotionEffect>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo de Nombre */}
            <MotionEffect
              fade={{ initialOpacity: 0, opacity: 1 }}
              slide={{ direction: 'right', offset: 20 }}
              delay={0.5}
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  {t('createProfile.name.label')}
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('createProfile.name.placeholder')}
                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary group-hover:border-primary/50"
                    {...form.register('name')}
                    disabled={isSubmitting}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                </div>
                {form.formState.errors.name && (
                  <MotionEffect
                    fade={{ initialOpacity: 0, opacity: 1 }}
                    slide={{ direction: 'up', offset: 10 }}
                  >
                    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                      <AlertDescription className="text-sm">
                        {form.formState.errors.name.message}
                      </AlertDescription>
                    </Alert>
                  </MotionEffect>
                )}
              </div>
            </MotionEffect>

            {/* Campo de Email */}
            <MotionEffect
              fade={{ initialOpacity: 0, opacity: 1 }}
              slide={{ direction: 'right', offset: 20 }}
              delay={0.6}
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t('createProfile.email.label')}
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('createProfile.email.placeholder')}
                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary group-hover:border-primary/50"
                    {...form.register('email')}
                    disabled={isSubmitting}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                </div>
                {form.formState.errors.email && (
                  <MotionEffect
                    fade={{ initialOpacity: 0, opacity: 1 }}
                    slide={{ direction: 'up', offset: 10 }}
                  >
                    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                      <AlertDescription className="text-sm">
                        {form.formState.errors.email.message}
                      </AlertDescription>
                    </Alert>
                  </MotionEffect>
                )}
              </div>
            </MotionEffect>

            {/* Error general */}
            {createProfileMutation.error && (
              <MotionEffect
                fade={{ initialOpacity: 0, opacity: 1 }}
                slide={{ direction: 'up', offset: 10 }}
              >
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                  <AlertDescription>
                    {createProfileMutation.error.message}
                  </AlertDescription>
                </Alert>
              </MotionEffect>
            )}

            {/* Botón de envío */}
            <MotionEffect
              fade={{ initialOpacity: 0, opacity: 1 }}
              slide={{ direction: 'up', offset: 20 }}
              delay={0.7}
            >
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Spinner variant="circle" className="w-4 h-4 text-primary-foreground" />
                    <span>{t('createProfile.submitting')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('createProfile.submit')}</span>
                  </div>
                )}
              </Button>
            </MotionEffect>
          </form>

          {/* Indicador de progreso */}
          <MotionEffect
            fade={{ initialOpacity: 0, opacity: 1 }}
            delay={0.8}
          >
            <div className="pt-6 border-t border-border/50">
              <div className="flex items-center justify-center space-x-3 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                </div>
                <span>{t('createProfile.progress')}</span>
              </div>
            </div>
          </MotionEffect>
        </CardContent>
      </Card>
    </MotionEffect>
  );
}