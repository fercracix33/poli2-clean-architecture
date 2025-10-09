/**
 * ThemeToggle Component
 *
 * Displays a button that toggles between light and dark themes.
 * Shows Moon icon in dark mode, Sun icon in light mode.
 * Fully accessible with ARIA attributes and keyboard navigation.
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

'use client'

import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/theme.store'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleTheme()
    }
  }

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      className="inline-flex items-center justify-center rounded-md p-2 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      type="button"
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}
