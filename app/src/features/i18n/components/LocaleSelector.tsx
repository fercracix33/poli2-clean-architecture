/**
 * LocaleSelector Component
 *
 * Allows users to change the application language between English and Spanish.
 * Persists preference in cookie and reloads page to apply changes.
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-09
 * Feature: Application Internationalization (i18n-001)
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2 } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import {
  LOCALE_LABELS,
  LOCALE_FLAGS,
  SUPPORTED_LOCALES,
  type Locale
} from '../entities';

/**
 * LocaleSelector Component
 *
 * Displays a dropdown to select between supported languages.
 * Shows current locale with flag emoji and handles locale changes.
 *
 * @example
 * ```tsx
 * <LocaleSelector />
 * ```
 *
 * @accessibility
 * - Combobox role on trigger button
 * - Keyboard navigation (Enter, Escape, Arrow keys)
 * - Screen reader compatible
 * - WCAG 2.1 AA compliant
 */
export function LocaleSelector() {
  const { locale, setLocale, isChangingLocale } = useLocale();

  /**
   * Handle locale selection
   * Calls setLocale which updates cookie and reloads page
   */
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isChangingLocale}
          role="combobox"
          aria-label="Change language"
          aria-haspopup="listbox"
          className="gap-2"
        >
          {isChangingLocale ? (
            <span role="status" className="contents">
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              <span className="sr-only">Changing language...</span>
              Loading...
            </span>
          ) : (
            <>
              <span aria-hidden="true">{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_LABELS[locale]}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" role="listbox">
        {SUPPORTED_LOCALES.filter(l => l !== locale).map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            role="option"
            className="gap-2 cursor-pointer"
          >
            <span aria-hidden="true">{LOCALE_FLAGS[l]}</span>
            <span>{LOCALE_LABELS[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
