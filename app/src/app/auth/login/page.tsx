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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Building2 className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-foreground">PoliOrganizaT</span>
        </div>

        <BackgroundGradient className="rounded-[22px] p-8 bg-card border border-border">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-foreground">{t('login.title')}</h1>
              <p className="text-muted-foreground">
                {t('login.subtitle')}
              </p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                data-testid="error-message"
                role="alert"
                aria-live="assertive"
                className="animate-slide-in-down"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                className="bg-primary/10 text-primary border-primary/20 animate-slide-in-down"
                data-testid="success-message"
                role="status"
                aria-live="polite"
              >
                <AlertDescription>{t('login.success')}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t('login.email.label')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-ring transition-all duration-200"
                    required
                    disabled={isLoading}
                    data-testid="email-input"
                    aria-label={t('login.email.aria')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    {t('login.password.label')}
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all duration-200"
                  >
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('login.password.placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-ring transition-all duration-200"
                    required
                    disabled={isLoading}
                    data-testid="password-input"
                    aria-label={t('login.password.aria')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-[44px] hover:scale-[1.02] active:scale-95 transition-all duration-200"
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
              <span className="text-muted-foreground">
                {t('login.noAccount')}{" "}
              </span>
              <Link
                href="/auth/register"
                className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4 transition-all duration-200"
              >
                {t('login.signUp')}
              </Link>
            </div>
          </div>
        </BackgroundGradient>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all duration-200"
          >
            {t('login.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}