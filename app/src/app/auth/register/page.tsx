"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = t('validation.email.invalid');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('validation.email.invalid');
    }

    if (!formData.password) {
      errors.password = t('validation.password.min');
    } else if (formData.password.length < 8) {
      errors.password = t('validation.password.min');
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('validation.confirmPassword.match');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('validation.confirmPassword.match');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Sign up the user - no name field anymore!
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        // Handle duplicate email error
        if (signUpError.message.includes("already registered")) {
          setError(t('errors.alreadyRegistered'));
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (authData.user) {
        setSuccess(true);
        // Redirect to profile creation after successful registration
        setTimeout(() => {
          router.push("/auth/create-profile");
        }, 2000);
      }
    } catch (err) {
      // Network error handling
      if (err instanceof Error && err.message.includes("fetch")) {
        setError(t('errors.network'));
      } else {
        setError(err instanceof Error ? err.message : t('errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Building2 className="h-10 w-10 text-blue-500" />
          <span className="text-2xl font-bold">PoliOrganizaT</span>
        </div>

        <BackgroundGradient className="rounded-[22px] p-8 bg-white dark:bg-neutral-900">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{t('register.title')}</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('register.subtitle')}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" data-testid="error-message">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200" data-testid="success-message">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {t('register.success')}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form" role="form">
              <div className="space-y-2">
                <Label htmlFor="email">{t('register.email.label')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('register.email.placeholder')}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    data-testid="email-input"
                    aria-label={t('register.email.aria')}
                    aria-invalid={!!validationErrors.email}
                    aria-describedby={validationErrors.email ? "email-error" : undefined}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-red-500" id="email-error" data-testid="email-error">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('register.password.label')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('register.password.placeholder')}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    data-testid="password-input"
                    aria-label={t('register.password.aria')}
                    aria-invalid={!!validationErrors.password}
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500" id="password-error" data-testid="password-error">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword.label')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('register.confirmPassword.placeholder')}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    data-testid="confirm-password-input"
                    aria-label={t('register.confirmPassword.aria')}
                    aria-invalid={!!validationErrors.confirmPassword}
                    aria-describedby={validationErrors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500" id="confirm-password-error" data-testid="confirm-password-error">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full min-h-[44px]"
                disabled={isLoading}
                data-testid="submit-button"
                aria-label={t('register.submitAria')}
              >
                {isLoading ? (
                  <>
                    <div data-testid="loading-spinner">
                      <Spinner className="mr-2 inline" />
                    </div>
                    <span role="status" aria-live="polite">{t('register.submitting')}</span>
                  </>
                ) : (
                  t('register.submit')
                )}
              </Button>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                {t('register.terms')}
              </p>
            </form>

            <div className="text-center text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {t('register.haveAccount')}{" "}
              </span>
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium">
                {t('register.signIn')}
              </Link>
            </div>
          </div>
        </BackgroundGradient>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
            {t('register.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}