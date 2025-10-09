/**
 * Theme Entities
 *
 * Pure data contracts defined with Zod schemas.
 * NO business logic, NO external dependencies (except Zod).
 *
 * Created by: Architect Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

import { z } from 'zod';

// ============================================================================
// MAIN ENTITY SCHEMA
// ============================================================================

/**
 * Theme represents the current visual theme of the application
 *
 * Only two valid values:
 * - 'light': Light mode (white background, dark text)
 * - 'dark': Dark mode (dark background, light text)
 *
 * @example
 * const currentTheme: Theme = 'dark';
 * const isValid = ThemeSchema.safeParse(currentTheme).success; // true
 */
export const ThemeSchema = z.enum(['light', 'dark'], {
  errorMap: () => ({ message: 'Theme must be either "light" or "dark"' })
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Theme = z.infer<typeof ThemeSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default theme configuration
 *
 * The application ALWAYS starts in dark mode.
 * This value is NOT affected by:
 * - User preference (no persistence)
 * - System preference (not detected)
 * - Previous session state (resets on reload)
 */
export const DEFAULT_THEME: Theme = 'dark';

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Theme
 *
 * @param value - Value to check
 * @returns true if value is 'light' or 'dark'
 *
 * @example
 * const userInput = 'dark';
 * if (isTheme(userInput)) {
 *   // TypeScript knows userInput is Theme
 *   console.log(userInput); // 'dark'
 * }
 */
export function isTheme(value: unknown): value is Theme {
  return ThemeSchema.safeParse(value).success;
}
