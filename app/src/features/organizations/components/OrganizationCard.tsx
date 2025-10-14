/**
 * OrganizationCard Component
 *
 * Card displaying organization information
 * Used in organization switcher and listings
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Organization } from '@/features/organizations/entities';
import { Users, Building2 } from 'lucide-react';
import { RoleBadge } from './RoleBadge';

interface OrganizationCardProps {
  organization: Organization;
  role?: string;
  memberCount?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function OrganizationCard({
  organization,
  role,
  memberCount,
  onClick,
  isSelected
}: OrganizationCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{organization.name}</CardTitle>
          </div>
          {role && <RoleBadge role={role} />}
        </div>
        {organization.description && (
          <CardDescription className="line-clamp-2">
            {organization.description}
          </CardDescription>
        )}
      </CardHeader>
      {memberCount !== undefined && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
