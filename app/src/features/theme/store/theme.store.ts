/**
 * Theme Store
 *
 * Zustand store for global theme state management.
 * Pure state management without persistence or side effects.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

import { create } from 'zustand'
import { DEFAULT_THEME, Theme, ThemeSchema } from '../entities'

// ============================================================================
// STORE INTERFACE
// ============================================================================

/**
 * Theme Store State
 *
 * Manages the current theme and provides actions to modify it.
 * NO persistence - state resets to DEFAULT_THEME on page reload.
 */
interface ThemeState {
  /**
   * Current theme value
   * @default 'dark' (DEFAULT_THEME)
   */
  theme: Theme

  /**
   * Toggle between light and dark themes
   * dark → light, light → dark
   */
  toggleTheme: () => void

  /**
   * Set theme directly to a specific value
   * @param theme - The theme to set ('light' or 'dark')
   * @throws {ZodError} if theme is not valid
   */
  setTheme: (theme: Theme) => void
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

/**
 * Theme Zustand Store
 *
 * IMPORTANT: No middleware, no persistence
 * State always resets to 'dark' on reload
 *
 * @example
 * const theme = useThemeStore((state) => state.theme)
 * const toggleTheme = useThemeStore((state) => state.toggleTheme)
 *
 * toggleTheme() // dark -> light
 */
export const useThemeStore = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME,

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),

  setTheme: (theme: Theme) => {
    // Validate with Zod schema
    const validated = ThemeSchema.parse(theme)
    set({ theme: validated })
  },
}))
