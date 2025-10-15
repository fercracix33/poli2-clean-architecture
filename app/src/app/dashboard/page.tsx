'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlipWords } from '@/components/ui/flip-words';
import { User, Settings, Building, Users, Plus, LogOut, Sparkles, TrendingUp, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { Organization } from '@/features/organizations/entities';
import { CreateOrganizationDialog } from '@/components/organizations/CreateOrganizationDialog';
import { JoinOrganizationDialog } from '@/components/organizations/JoinOrganizationDialog';

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

  // Fetch user organizations
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      return response.json();
    },
  });

  const handleLogout = () => {
    // Handle logout logic
    router.push('/');
  };

  if (profileLoading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/60 backdrop-blur-xl shadow-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="grid gap-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
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
                <Building className="h-6 w-6 text-primary-foreground" />
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
        <div className="grid gap-6">
          {/* Welcome Card */}
          <Card className="relative overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 animate-slide-in-up">
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
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
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('welcome.status')}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      <span className="text-sm font-medium text-foreground">{t('welcome.active')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Organizations Card */}
            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-foreground">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-2">
                        <Building className="w-4 h-4 text-primary-foreground" />
                      </div>
                      {t('organizations.title')}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      {t('organizations.description')}
                    </CardDescription>
                  </div>
                  <CreateOrganizationDialog
                    trigger={
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 hover:scale-[1.02] shadow-md">
                        <Plus className="w-4 h-4 mr-1" />
                        {t('organizations.new')}
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                {organizations && organizations.length > 0 ? (
                  <div className="space-y-3">
                    {organizations.slice(0, 3).map((org: Organization, index: number) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group animate-slide-in-up"
                        style={{ animationDelay: `${(index + 2) * 100}ms` }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{org.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {org.description || t('organizations.noDescription')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-200"
                          onClick={() => router.push(`/org/${org.slug}`)}
                        >
                          {t('organizations.view')}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">{t('organizations.empty.title')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('organizations.empty.description')}</p>
                    <CreateOrganizationDialog
                      trigger={
                        <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 hover:scale-[1.02]" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          {t('organizations.empty.cta')}
                        </Button>
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Zap className="w-5 h-5 mr-2 text-amber-500" />
                  {t('quickActions.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('quickActions.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="justify-start border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                      <Users className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium">{t('quickActions.inviteMembers')}</span>
                  </Button>
                  <JoinOrganizationDialog
                    trigger={
                      <Button
                        variant="outline"
                        className="justify-start border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group w-full"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <Building className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-medium">{t('quickActions.joinCode')}</span>
                      </Button>
                    }
                  />
                  <Link href="/settings/profile">
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
                  <Button
                    variant="outline"
                    className="justify-start border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{t('quickActions.accountSettings')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('stats.activeTasks')}
                  </CardTitle>
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-extrabold text-primary">
                    0
                  </div>
                  <span className="text-sm text-muted-foreground">{t('stats.tasksInProgress')}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '350ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('stats.activeProjects')}
                  </CardTitle>
                  <Building className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-extrabold text-accent">
                    0
                  </div>
                  <span className="text-sm text-muted-foreground">{t('stats.acrossTeams')}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('stats.upcomingDeadlines')}
                  </CardTitle>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-extrabold text-foreground">
                    0
                  </div>
                  <span className="text-sm text-muted-foreground">{t('stats.thisWeek')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}