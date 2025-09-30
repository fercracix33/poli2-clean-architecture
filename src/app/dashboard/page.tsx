'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Settings, Building, Users, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-6">
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/settings/profile">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
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
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle>Welcome back, {profile?.name || 'User'}!</CardTitle>
                  <CardDescription>{profile?.email || 'user@example.com'}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Organizations Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Organizations
                    </CardTitle>
                    <CardDescription>
                      Manage your organizations
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {organizations && organizations.length > 0 ? (
                  <div className="space-y-3">
                    {organizations.slice(0, 3).map((org: any) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {org.memberCount || 0} members
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-muted-foreground">No organizations yet</p>
                    <Button className="mt-3" variant="outline" size="sm">
                      Create your first organization
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button variant="outline" className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Invite team members
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Building className="w-4 h-4 mr-2" />
                    Create organization
                  </Button>
                  <Link href="/settings/profile">
                    <Button variant="outline" className="justify-start w-full">
                      <User className="w-4 h-4 mr-2" />
                      Edit profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Account settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizations?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}