/**
 * Internationalization (i18n) Entities
 *
 * Pure data contracts defined with Zod schemas.
 * NO business logic, NO external dependencies (except Zod).
 *
 * Created by: Architect Agent
 * Date: 2025-10-09
 * Feature: Application Internationalization System (i18n-001)
 */

import { z } from 'zod';

// ============================================================================
// LOCALE SCHEMA
// ============================================================================

/**
 * Locale represents the supported languages in the application
 *
 * Only two valid values:
 * - 'en': English (default)
 * - 'es': Spanish
 *
 * @example
 * const userLocale: Locale = 'es';
 * const isValid = LocaleSchema.safeParse(userLocale).success; // true
 */
export const LocaleSchema = z.enum(['en', 'es'], {
  errorMap: () => ({ message: 'Locale must be either "en" or "es"' }),
});

// ============================================================================
// LOCALE COOKIE SCHEMA
// ============================================================================

/**
 * LocaleCookie represents the structure of the locale cookie value
 *
 * This schema validates the cookie value to ensure it's a valid locale
 * before using it in the application.
 *
 * @example
 * const cookieData: LocaleCookie = {
 *   name: 'NEXT_LOCALE',
 *   value: 'es',
 *   maxAge: 31536000
 * };
 */
export const LocaleCookieSchema = z.object({
  name: z.literal('NEXT_LOCALE'),
  value: LocaleSchema,
  maxAge: z.number().positive().default(31536000), // 1 year in seconds
});

// ============================================================================
// TRANSLATION NAMESPACE SCHEMA
// ============================================================================

/**
 * TranslationNamespace represents the top-level organization of translations
 *
 * Namespaces group related translations (e.g., all auth-related strings)
 *
 * @example
 * const namespace: TranslationNamespace = 'auth';
 * // Corresponds to locales/en/auth.json or locales/es/auth.json
 */
export const TranslationNamespaceSchema = z.enum([
  'common', // Shared UI elements (buttons, labels, etc.)
  'auth', // Authentication & authorization
  'navigation', // Navigation menus, links
  'errors', // Error messages
  'validation', // Form validation messages
]);

// ============================================================================
// TRANSLATION KEY SCHEMA
// ============================================================================

/**
 * TranslationKey represents a nested path to a specific translation
 *
 * Format: "namespace.key" or "namespace.nested.key"
 *
 * @example
 * const key1: TranslationKey = "common.welcome"; // Valid
 * const key2: TranslationKey = "auth.login.title"; // Valid
 * const key3: TranslationKey = "invalid"; // Invalid (no namespace)
 */
export const TranslationKeySchema = z
  .string()
  .regex(
    /^[a-z]+(\.[a-z]+)+$/,
    'Translation key must be in format: namespace.key or namespace.nested.key'
  );

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Locale = z.infer<typeof LocaleSchema>;
export type LocaleCookie = z.infer<typeof LocaleCookieSchema>;
export type TranslationNamespace = z.infer<typeof TranslationNamespaceSchema>;
export type TranslationKey = z.infer<typeof TranslationKeySchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default locale configuration
 *
 * The application ALWAYS starts with English for new users.
 * This can be overridden by:
 * - Existing locale cookie
 * - Browser accept-language header (future enhancement)
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * All supported locales
 *
 * This array is used for:
 * - Locale validation
 * - Rendering locale selector options
 * - Loading translation files
 * - Type inference in TypeScript
 *
 * @readonly This array is frozen and cannot be modified
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'es'] as const;

/**
 * Locale cookie name
 *
 * This cookie stores the user's language preference.
 * It persists across sessions (1 year).
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Locale cookie max age (in seconds)
 *
 * Default: 1 year (31,536,000 seconds)
 * This ensures the user's language preference is remembered long-term.
 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Locale labels for UI display
 *
 * Maps locale codes to their human-readable names.
 * Used in the LocaleSelector component.
 *
 * @example
 * const label = LOCALE_LABELS['es']; // "Español"
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

/**
 * Locale flags for UI display (emoji)
 *
 * Optional visual indicator for each language.
 * Can be used in LocaleSelector for better UX.
 *
 * @example
 * const flag = LOCALE_FLAGS['es']; // "🇪🇸"
 */
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Locale
 *
 * @param value - Value to check
 * @returns true if value is 'en' or 'es'
 *
 * @example
 * const userInput = 'es';
 * if (isLocale(userInput)) {
 *   // TypeScript knows userInput is Locale
 *   console.log(userInput); // 'es'
 * }
 *
 * @example
 * const cookieValue = getCookie('NEXT_LOCALE');
 * const locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
 */
export function isLocale(value: unknown): value is Locale {
  return LocaleSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid TranslationKey
 *
 * @param value - Value to check
 * @returns true if value matches "namespace.key" pattern
 *
 * @example
 * const key = "common.welcome";
 * if (isTranslationKey(key)) {
 *   // TypeScript knows key is TranslationKey
 *   const translation = t(key);
 * }
 */
export function isTranslationKey(value: unknown): value is TranslationKey {
  return TranslationKeySchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid TranslationNamespace
 *
 * @param value - Value to check
 * @returns true if value is a valid namespace
 *
 * @example
 * const namespace = "auth";
 * if (isTranslationNamespace(namespace)) {
 *   // Load translation file for this namespace
 *   const translations = await import(`/locales/en/${namespace}.json`);
 * }
 */
export function isTranslationNamespace(
  value: unknown
): value is TranslationNamespace {
  return TranslationNamespaceSchema.safeParse(value).success;
}
