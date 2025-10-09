'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlipWords } from '@/components/ui/flip-words';
import { User, Settings, Building, Users, Plus, LogOut, Sparkles, TrendingUp, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { Organization } from '@/features/auth/entities';

export default function DashboardPage() {
  const router = useRouter();
  const welcomeWords = ["productive", "organized", "focused", "efficient", "on track"];

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <header className="bg-white/60 dark:bg-black/60 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation Header */}
      <header className="bg-white/60 dark:bg-black/60 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/settings/profile">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-950">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {/* Welcome Card */}
          <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="User avatar"
                          data-testid="user-avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">
                        We're{' '}
                        <FlipWords
                          words={welcomeWords}
                          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
                          duration={2500}
                        />
                      </CardTitle>
                    </div>
                    <div className="text-lg font-medium text-slate-700 dark:text-slate-300">
                      to see you, <span data-testid="user-name" className="text-blue-600 dark:text-blue-400">{profile?.name || 'User'}</span>!
                    </div>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                      {profile?.email || 'user@example.com'}
                    </CardDescription>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Organizations Card */}
            <Card className="border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-slate-900 dark:text-slate-100">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-2">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                      Your Organizations
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                      Workspaces for your teams and projects
                    </CardDescription>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {organizations && organizations.length > 0 ? (
                  <div className="space-y-3">
                    {organizations.slice(0, 3).map((org: Organization) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{org.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {org.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="group-hover:bg-blue-100 dark:group-hover:bg-blue-900">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No organizations yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Create your first workspace to start organizing projects</p>
                    <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Create your first organization
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-slate-100">
                  <Zap className="w-5 h-5 mr-2 text-amber-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Get started with your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="justify-start border-2 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Invite team members</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start border-2 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Create project</span>
                  </Button>
                  <Link href="/settings/profile">
                    <Button
                      variant="outline"
                      className="justify-start w-full border-2 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Edit profile</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="justify-start border-2 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Account settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active Tasks
                  </CardTitle>
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                    0
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">tasks in progress</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active Projects
                  </CardTitle>
                  <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    0
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">across all teams</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Upcoming Deadlines
                  </CardTitle>
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">
                    0
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">this week</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}