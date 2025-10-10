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
import { Building2, Mail, Lock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
              <h1 className="text-2xl font-bold mb-2">{t('login.title')}</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('login.subtitle')}
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
                <AlertDescription>{t('login.success')}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email.label')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    data-testid="email-input"
                    aria-label={t('login.email.aria')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('login.password.label')}</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('login.password.placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    data-testid="password-input"
                    aria-label={t('login.password.aria')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="submit-button"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" data-testid="loading-spinner" />
                    {t('login.submitting')}
                  </>
                ) : (
                  t('login.submit')
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {t('login.noAccount')}{" "}
              </span>
              <Link href="/auth/register" className="text-blue-500 hover:text-blue-600 font-medium">
                {t('login.signUp')}
              </Link>
            </div>
          </div>
        </BackgroundGradient>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
            {t('login.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}