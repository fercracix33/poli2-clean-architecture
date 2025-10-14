/**
 * OrganizationSwitcher Component
 *
 * Dropdown menu to switch between user's organizations
 * Displays current org and allows navigation
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Organization } from '@/features/organizations/entities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building2, ChevronsUpDown, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationSwitcherProps {
  currentOrganization: Organization;
  organizations: Organization[];
  isLoading?: boolean;
}

export function OrganizationSwitcher({
  currentOrganization,
  organizations,
  isLoading
}: OrganizationSwitcherProps) {
  const t = useTranslations('organization.switcher');
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between"
          data-testid="organization-switcher"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentOrganization.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>{t('current')}</DropdownMenuLabel>
        <DropdownMenuItem disabled className="font-medium">
          <Building2 className="h-4 w-4 mr-2" />
          {currentOrganization.name}
        </DropdownMenuItem>

        {organizations.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('myOrganizations')}</DropdownMenuLabel>
            {organizations
              .filter(org => org.id !== currentOrganization.id)
              .map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => router.push(`/org/${org.slug}`)}
                  data-testid={`switch-to-${org.slug}`}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {org.name}
                </DropdownMenuItem>
              ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/org/create')}
          data-testid="create-new-organization"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('createNew')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
