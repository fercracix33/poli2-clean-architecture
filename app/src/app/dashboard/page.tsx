'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlipWords } from '@/components/ui/flip-words';
import { User, Settings, LogOut, Sparkles, FileText, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const welcomeWords = t.raw('welcome.words') as string[];

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await fetch('/api/auth/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
  });

  const handleLogout = () => {
    // Handle logout logic
    router.push('/');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/60 backdrop-blur-xl shadow-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navigation Header */}
      <header className="bg-card/60 backdrop-blur-xl shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center" aria-label="Dashboard icon">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {t('header.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/settings/profile">
                <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('header.settings')}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200">
                <LogOut className="w-4 h-4 mr-2" />
                {t('header.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid gap-6 max-w-5xl mx-auto">
          {/* Welcome Card */}
          <Card className="relative overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 animate-slide-in-up">
            <CardHeader className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center overflow-hidden shadow-lg">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={`Avatar for ${profile?.name || 'User'}`}
                          data-testid="user-avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-primary-foreground" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl text-foreground">
                        {t('welcome.prefix')}{' '}
                        <FlipWords
                          words={welcomeWords}
                          className="text-2xl font-bold text-primary"
                          duration={2500}
                        />
                      </CardTitle>
                    </div>
                    <div className="text-lg font-medium text-foreground">
                      {t('welcome.greeting')} <span data-testid="user-name" className="text-primary">{profile?.name || 'User'}</span>!
                    </div>
                    <CardDescription className="text-muted-foreground mt-1">
                      {profile?.email || 'user@example.com'}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <CardDescription className="text-muted-foreground mt-4 text-base">
                {t('welcome.subtitle')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  {t('quickActions.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/settings/profile" className="block">
                  <Button
                    variant="outline"
                    className="justify-start w-full border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="font-medium">{t('quickActions.editProfile')}</span>
                  </Button>
                </Link>
                <Link href="/settings/profile" className="block">
                  <Button
                    variant="outline"
                    className="justify-start w-full border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{t('quickActions.accountSettings')}</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center mr-2">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="justify-start w-full border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                  onClick={() => window.open('https://docs.example.com', '_blank')}
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">{t('quickActions.documentation')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start w-full border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                  onClick={() => window.open('https://support.example.com', '_blank')}
                >
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <HelpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">{t('quickActions.support')}</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center mr-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Welcome to your new workspace!</p>
                  <p className="pt-2">Start by exploring the features and customizing your profile.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
