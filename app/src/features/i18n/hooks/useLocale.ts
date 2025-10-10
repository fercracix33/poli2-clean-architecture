/**
 * useLocale Hook - Client-Side Locale Management
 *
 * Provides current locale and function to change it.
 * Changes persist in cookie and trigger page reload.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-09
 * Feature: i18n-001
 */

'use client';

import { useState } from 'react';
import { useLocale as useNextIntlLocale } from 'next-intl';
import {
  type Locale,
  LocaleSchema,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
} from '../entities';

/**
 * Get locale from cookie (fallback for when next-intl context is not available)
 */
function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;

  const cookies = document.cookie.split('; ');
  const localeCookie = cookies.find(c => c.startsWith(`${LOCALE_COOKIE_NAME}=`));

  if (!localeCookie) return DEFAULT_LOCALE;

  const value = localeCookie.split('=')[1];
  const parseResult = LocaleSchema.safeParse(value);

  return parseResult.success ? parseResult.data : DEFAULT_LOCALE;
}

/**
 * useLocale Hook
 *
 * @returns Current locale, setLocale function, and loading state
 *
 * @example
 * const { locale, setLocale, isChangingLocale } = useLocale();
 *
 * // Change locale
 * setLocale('es');
 */
export function useLocale() {
  // Try to get locale from next-intl context (server-synced)
  // Falls back to cookie reading if context is not available (e.g., in tests)
  let currentLocale: Locale;
  try {
    currentLocale = useNextIntlLocale() as Locale;
  } catch {
    // Fallback to cookie reading (for tests or when context is not available)
    currentLocale = getLocaleFromCookie();
  }

  const [isChangingLocale, setIsChangingLocale] = useState(false);

  /**
   * Update locale preference
   * Stores in cookie and reloads page to apply changes
   */
  const setLocale = (newLocale: Locale) => {
    // Don't reload if locale is the same
    if (newLocale === currentLocale) return;

    setIsChangingLocale(true);

    // Update cookie with proper settings
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;

    // Reload page to apply new locale
    window.location.reload();
  };

  return {
    locale: currentLocale,
    setLocale,
    isChangingLocale,
  };
}
