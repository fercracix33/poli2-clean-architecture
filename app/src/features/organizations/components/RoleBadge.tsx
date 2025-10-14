/**
 * RoleBadge Component
 *
 * Displays a role badge with appropriate styling
 * Uses i18n for role names
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const t = useTranslations('organization.members.roles');

  // Map role names to badge variants
  const roleVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    organization_owner: 'destructive',
    organization_admin: 'default',
    organization_member: 'secondary',
    organization_viewer: 'outline',
  };

  const variant = roleVariants[role] || 'secondary';
  const roleLabel = t(role as any); // Dynamic role translation

  return (
    <Badge variant={variant} className={className}>
      {roleLabel}
    </Badge>
  );
}
