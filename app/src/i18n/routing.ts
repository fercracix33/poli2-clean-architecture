/**
 * i18n Routing Configuration
 *
 * Configures next-intl routing WITHOUT URL prefix changes.
 * Locale is stored in cookie, URLs remain unchanged.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-09
 * Feature: i18n-001
 */

import { defineRouting } from 'next-intl/routing';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
} from '@/features/i18n/entities';

/**
 * next-intl routing configuration
 *
 * Critical settings:
 * - localePrefix: 'never' → URLs don't change (e.g., /tasks, NOT /en/tasks)
 * - localeCookie → Stores user's language preference in cookie
 */
export const routing = defineRouting({
  locales: SUPPORTED_LOCALES as unknown as string[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'never', // CRITICAL: No URL changes
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: LOCALE_COOKIE_MAX_AGE,
  },
});
