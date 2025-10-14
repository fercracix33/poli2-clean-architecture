/**
 * Organization Layout
 *
 * Shared layout for all organization pages
 * Includes:
 * - Organization header with name and switcher
 * - Navigation tabs (Dashboard, Projects, Members, Settings)
 * - Breadcrumbs
 * - Mobile responsive menu
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { OrganizationSwitcher } from '@/features/organizations/components/OrganizationSwitcher';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const t = useTranslations('organization.dashboard');
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = params.slug as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch current organization
  const { data: currentOrg, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['organization', slug],
    queryFn: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) throw new Error('Organization not found');
      return data;
    },
  });

  // Fetch user's organizations for switcher
  const { data: userOrgs, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['userOrganizations'],
    queryFn: async () => {
      const response = await fetch('/api/organizations/me');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch organizations');
      }

      return await response.json();
    },
  });

  // Navigation items
  const navigation = [
    {
      name: t('overview'),
      href: `/org/${slug}`,
      icon: LayoutDashboard,
      current: pathname === `/org/${slug}`,
    },
    {
      name: t('projects'),
      href: `/org/${slug}/projects`,
      icon: FolderKanban,
      current: pathname?.startsWith(`/org/${slug}/projects`),
    },
    {
      name: t('members'),
      href: `/org/${slug}/members`,
      icon: Users,
      current: pathname === `/org/${slug}/members`,
    },
    {
      name: t('settings'),
      href: `/org/${slug}/settings`,
      icon: Settings,
      current: pathname === `/org/${slug}/settings`,
    },
  ];

  const NavigationItems = ({ mobile = false }) => (
    <nav className={`flex ${mobile ? 'flex-col' : 'flex-row'} gap-1`}>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            variant={item.current ? 'secondary' : 'ghost'}
            className={`justify-start ${mobile ? 'w-full' : ''}`}
            onClick={() => {
              router.push(item.href);
              if (mobile) setMobileMenuOpen(false);
            }}
            data-testid={`nav-${item.name.toLowerCase()}`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {item.name}
          </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left side: Org switcher and navigation */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="space-y-4 py-4">
                  {isLoadingOrg || isLoadingOrgs ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    currentOrg && userOrgs && (
                      <OrganizationSwitcher
                        currentOrganization={currentOrg}
                        organizations={userOrgs}
                      />
                    )
                  )}
                  <NavigationItems mobile />
                </div>
              </SheetContent>
            </Sheet>

            {/* Organization Switcher (Desktop) */}
            <div className="hidden md:block">
              {isLoadingOrg || isLoadingOrgs ? (
                <Skeleton className="h-10 w-[200px]" />
              ) : (
                currentOrg && userOrgs && (
                  <OrganizationSwitcher
                    currentOrganization={currentOrg}
                    organizations={userOrgs}
                    isLoading={isLoadingOrg || isLoadingOrgs}
                  />
                )
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1">
              <NavigationItems />
            </div>
          </div>

          {/* Right side: User menu (future) */}
          <div className="flex items-center gap-2">
            {/* Placeholder for user menu */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
}
