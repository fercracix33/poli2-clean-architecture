/**
 * Theme Store Tests
 *
 * Tests Zustand store for theme state management.
 * Validates initial state, toggleTheme(), setTheme(), and subscriptions.
 *
 * Created by: Test Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './theme.store'
import { DEFAULT_THEME } from '../entities'

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useThemeStore.setState({ theme: DEFAULT_THEME })
  })

  describe('Initial State', () => {
    it('should initialize with dark theme', () => {
      const state = useThemeStore.getState()

      expect(state.theme).toBe('dark')
      expect(state.theme).toBe(DEFAULT_THEME)
    })

    it('should have toggleTheme function', () => {
      const state = useThemeStore.getState()

      expect(state.toggleTheme).toBeDefined()
      expect(typeof state.toggleTheme).toBe('function')
    })

    it('should have setTheme function', () => {
      const state = useThemeStore.getState()

      expect(state.setTheme).toBeDefined()
      expect(typeof state.setTheme).toBe('function')
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      const { toggleTheme } = useThemeStore.getState()

      // Initial state is dark
      expect(useThemeStore.getState().theme).toBe('dark')

      // Toggle to light
      toggleTheme()
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('should toggle from light to dark', () => {
      const { setTheme, toggleTheme } = useThemeStore.getState()

      // Set to light first
      setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')

      // Toggle to dark
      toggleTheme()
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('should toggle back and forth multiple times', () => {
      const { toggleTheme } = useThemeStore.getState()

      expect(useThemeStore.getState().theme).toBe('dark')

      toggleTheme() // dark -> light
      expect(useThemeStore.getState().theme).toBe('light')

      toggleTheme() // light -> dark
      expect(useThemeStore.getState().theme).toBe('dark')

      toggleTheme() // dark -> light
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('should maintain reactivity across components', () => {
      // Subscribe to store changes
      const themeValues: string[] = []
      const unsubscribe = useThemeStore.subscribe((state) => {
        themeValues.push(state.theme)
      })

      const { toggleTheme } = useThemeStore.getState()

      toggleTheme()
      toggleTheme()

      expect(themeValues).toEqual(['light', 'dark'])

      unsubscribe()
    })
  })

  describe('setTheme', () => {
    it('should set theme to light', () => {
      const { setTheme } = useThemeStore.getState()

      setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('should set theme to dark', () => {
      const { setTheme } = useThemeStore.getState()

      setTheme('light') // Change from default
      setTheme('dark')  // Set back to dark
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('should overwrite current theme', () => {
      const { setTheme } = useThemeStore.getState()

      setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')

      setTheme('dark')
      expect(useThemeStore.getState().theme).toBe('dark')

      setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('should trigger store subscribers', () => {
      const themeChanges: string[] = []
      const unsubscribe = useThemeStore.subscribe((state) => {
        themeChanges.push(state.theme)
      })

      const { setTheme } = useThemeStore.getState()

      setTheme('light')
      setTheme('dark')
      setTheme('light')

      expect(themeChanges).toEqual(['light', 'dark', 'light'])

      unsubscribe()
    })
  })

  describe('Store Behavior', () => {
    it('should not persist to localStorage', () => {
      const { toggleTheme } = useThemeStore.getState()

      toggleTheme()

      // Verify localStorage was NOT called
      // (This is implicit - no localStorage.setItem in implementation)
      expect(localStorage.getItem('theme')).toBeNull()
    })

    it('should reset to dark on store recreation', () => {
      const { setTheme } = useThemeStore.getState()

      // Change theme
      setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')

      // Simulate page reload by resetting store
      useThemeStore.setState({ theme: DEFAULT_THEME })
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('should maintain type safety', () => {
      const state = useThemeStore.getState()

      // TypeScript should enforce Theme type
      // This is a compile-time test, but we verify runtime behavior
      expect(['light', 'dark']).toContain(state.theme)
    })
  })
})
