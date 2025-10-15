/**
 * ProjectFilters Component
 *
 * Search and filter controls for project lists
 * - Search by name/description
 * - Filter by status
 * - Filter favorites only
 * - URL params integration for shareability
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-15
 * Feature: Projects UI
 */

'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Star, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Project } from '../entities';

interface ProjectFiltersProps {
  onFilterChange?: (filters: {
    search?: string;
    status?: Project['status'];
    favoritesOnly?: boolean;
  }) => void;
}

export function ProjectFilters({ onFilterChange }: ProjectFiltersProps) {
  const t = useTranslations('projects');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<Project['status'] | 'all'>(
    (searchParams.get('status') as Project['status']) || 'all'
  );
  const [favoritesOnly, setFavoritesOnly] = useState(
    searchParams.get('favorites') === 'true'
  );

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    if (status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    if (favoritesOnly) {
      params.set('favorites', 'true');
    } else {
      params.delete('favorites');
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(newUrl, { scroll: false });

    // Notify parent
    onFilterChange?.({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      favoritesOnly: favoritesOnly || undefined,
    });
  }, [search, status, favoritesOnly, router, searchParams, onFilterChange]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setFavoritesOnly(false);
  };

  const hasActiveFilters = search !== '' || status !== 'all' || favoritesOnly;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('filters.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label={t('filters.search')}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <Select value={status} onValueChange={(value) => setStatus(value as Project['status'] | 'all')}>
          <SelectTrigger className="w-[160px]" aria-label={t('filters.status')}>
            <SelectValue placeholder={t('filters.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
            <SelectItem value="active">{t('card.status.active')}</SelectItem>
            <SelectItem value="archived">{t('card.status.archived')}</SelectItem>
            <SelectItem value="completed">{t('card.status.completed')}</SelectItem>
            <SelectItem value="on_hold">{t('card.status.on_hold')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Favorites Toggle */}
        <Button
          variant={favoritesOnly ? 'default' : 'outline'}
          size="default"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className="gap-2"
          aria-label={t('filters.favorites')}
          aria-pressed={favoritesOnly}
        >
          <Star className={`h-4 w-4 ${favoritesOnly ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{t('filters.favorites')}</span>
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="default"
            onClick={handleClearFilters}
            className="gap-2"
            aria-label={t('filters.clear')}
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">{t('filters.clear')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
