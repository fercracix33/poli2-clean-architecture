/**
 * i18n Server-Side Configuration
 *
 * Resolves the user's locale from cookie and loads appropriate messages.
 * This runs on the server for every request.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-09
 * Feature: i18n-001
 */

import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import {
  LocaleSchema,
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  type Locale,
} from '@/features/i18n/entities';

/**
 * Server-side locale resolution
 *
 * This function:
 * 1. Reads the NEXT_LOCALE cookie
 * 2. Validates it using Zod LocaleSchema
 * 3. Falls back to DEFAULT_LOCALE if invalid or missing
 * 4. Loads the appropriate translation messages
 *
 * @returns Configuration with locale and messages
 */
export default getRequestConfig(async () => {
  // 1. Read locale cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);

  // 2. Validate locale using Zod schema
  const parseResult = LocaleSchema.safeParse(localeCookie?.value);

  // 3. Use validated locale or fallback to default
  const locale: Locale = parseResult.success ? parseResult.data : DEFAULT_LOCALE;

  // 4. Load and merge all translation namespaces
  // Each JSON file represents a namespace that components can access via useTranslations()
  const commonMessages = (await import(`@/locales/${locale}/common.json`)).default;
  const authMessages = (await import(`@/locales/${locale}/auth.json`)).default;
  const dashboardMessages = (await import(`@/locales/${locale}/dashboard.json`)).default;

  // Merge all namespaces into a single messages object
  // Pattern: { ...common, auth: authMessages, dashboard: dashboardMessages }
  // This allows:
  // - useTranslations() to access common.* keys directly
  // - useTranslations('auth') to access auth.* keys
  // - useTranslations('dashboard') to access dashboard.* keys
  const messages = {
    ...commonMessages,
    auth: authMessages,
    dashboard: dashboardMessages,
  };

  return {
    locale,
    messages,
  };
});
