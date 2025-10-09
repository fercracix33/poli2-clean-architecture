/**
 * useApplyTheme Hook
 *
 * Applies theme changes to the HTML element by managing the 'dark' class.
 * Subscribes to theme store and updates document.documentElement classList.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

'use client'

import { useEffect } from 'react'
import { useThemeStore } from '../store/theme.store'

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook to apply theme changes to the HTML element
 *
 * Subscribes to the theme store and updates document.documentElement
 * by adding/removing the 'dark' class based on the current theme.
 *
 * Side Effects:
 * - Adds 'dark' class to <html> when theme is 'dark'
 * - Removes 'dark' class from <html> when theme is 'light'
 * - Automatically reacts to theme changes from the store
 *
 * Usage:
 * @example
 * // In root layout (app/layout.tsx)
 * 'use client'
 * import { useApplyTheme } from '@/features/theme/hooks/useApplyTheme'
 *
 * export default function RootLayout({ children }) {
 *   useApplyTheme()
 *   return <html><body>{children}</body></html>
 * }
 *
 * @returns void
 */
export function useApplyTheme(): void {
  // Subscribe ONLY to theme state (optimized selector)
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    // Access the <html> element
    const root = document.documentElement

    // Defensive check: ensure classList exists (edge case for testing environments)
    if (!root || !root.classList) {
      return
    }

    // Apply or remove 'dark' class based on theme
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // No cleanup needed - classList manipulation is idempotent
  }, [theme])
}
