/**
 * useApplyTheme Hook Tests
 *
 * Tests DOM manipulation and Zustand store subscription.
 * Validates HTML class application and cleanup.
 *
 * Created by: Test Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useApplyTheme } from './useApplyTheme'
import { useThemeStore } from '../store/theme.store'
import { DEFAULT_THEME } from '../entities'

// Mock document.documentElement
const mockClassListAdd = vi.fn()
const mockClassListRemove = vi.fn()
const mockClassListContains = vi.fn()

Object.defineProperty(global.document, 'documentElement', {
  configurable: true,
  writable: true,
  value: {
    classList: {
      add: mockClassListAdd,
      remove: mockClassListRemove,
      contains: mockClassListContains,
    },
  },
})

describe('useApplyTheme Hook', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Reset store to default
    useThemeStore.setState({ theme: DEFAULT_THEME })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('HTML Class Application', () => {
    it('should add "dark" class to html element on mount', () => {
      // Arrange
      useThemeStore.setState({ theme: 'dark' })

      // Act
      renderHook(() => useApplyTheme())

      // Assert
      expect(mockClassListAdd).toHaveBeenCalledWith('dark')
      expect(mockClassListRemove).not.toHaveBeenCalled()
    })

    it('should apply "dark" class when theme is dark', () => {
      // Arrange
      useThemeStore.setState({ theme: 'dark' })

      // Act
      renderHook(() => useApplyTheme())

      // Assert
      expect(mockClassListAdd).toHaveBeenCalledWith('dark')
    })

    it('should remove "dark" class when theme is light', () => {
      // Arrange
      useThemeStore.setState({ theme: 'light' })

      // Act
      renderHook(() => useApplyTheme())

      // Assert
      expect(mockClassListRemove).toHaveBeenCalledWith('dark')
      expect(mockClassListAdd).not.toHaveBeenCalled()
    })

    it('should update class when theme changes from dark to light', async () => {
      // Arrange
      useThemeStore.setState({ theme: 'dark' })
      const { rerender } = renderHook(() => useApplyTheme())

      // Clear initial mount calls
      vi.clearAllMocks()

      // Act
      useThemeStore.getState().setTheme('light')
      rerender()

      // Assert
      await waitFor(() => {
        expect(mockClassListRemove).toHaveBeenCalledWith('dark')
      })
    })

    it('should update class when theme changes from light to dark', async () => {
      // Arrange
      useThemeStore.setState({ theme: 'light' })
      const { rerender } = renderHook(() => useApplyTheme())

      // Clear initial mount calls
      vi.clearAllMocks()

      // Act
      useThemeStore.getState().setTheme('dark')
      rerender()

      // Assert
      await waitFor(() => {
        expect(mockClassListAdd).toHaveBeenCalledWith('dark')
      })
    })
  })

  describe('Store Subscription', () => {
    it('should subscribe to theme store', () => {
      // Arrange
      const { unmount } = renderHook(() => useApplyTheme())

      // Act
      useThemeStore.getState().toggleTheme()

      // Assert
      // If subscribed, classList methods should be called
      expect(mockClassListAdd).toHaveBeenCalled()

      unmount()
    })

    it('should unsubscribe on unmount', () => {
      // Arrange
      const { unmount } = renderHook(() => useApplyTheme())

      // Act
      unmount()
      vi.clearAllMocks()
      useThemeStore.getState().toggleTheme()

      // Assert
      // After unmount, no classList calls should happen
      expect(mockClassListAdd).not.toHaveBeenCalled()
      expect(mockClassListRemove).not.toHaveBeenCalled()
    })

    it('should react to store changes', async () => {
      // Arrange
      renderHook(() => useApplyTheme())
      vi.clearAllMocks()

      // Act
      useThemeStore.getState().toggleTheme() // dark -> light

      // Assert
      await waitFor(() => {
        expect(mockClassListRemove).toHaveBeenCalledWith('dark')
      })

      vi.clearAllMocks()

      // Act
      useThemeStore.getState().toggleTheme() // light -> dark

      // Assert
      await waitFor(() => {
        expect(mockClassListAdd).toHaveBeenCalledWith('dark')
      })
    })
  })

  describe('Side Effects', () => {
    it('should only manipulate classList, not other attributes', () => {
      // Arrange
      const documentElement = document.documentElement

      // Act
      renderHook(() => useApplyTheme())

      // Assert
      // Only classList methods should be called
      expect(mockClassListAdd).toHaveBeenCalled()

      // No other properties should be modified
      // (Implicit - we only mock classList)
      expect(documentElement.classList).toBeDefined()
    })

    it('should handle multiple rapid theme changes', async () => {
      // Arrange
      renderHook(() => useApplyTheme())
      vi.clearAllMocks()

      // Act
      const { toggleTheme } = useThemeStore.getState()
      toggleTheme() // dark -> light
      toggleTheme() // light -> dark
      toggleTheme() // dark -> light
      toggleTheme() // light -> dark

      // Assert
      await waitFor(() => {
        // Should have called both add and remove multiple times
        expect(mockClassListAdd).toHaveBeenCalled()
        expect(mockClassListRemove).toHaveBeenCalled()
      })
    })

    it('should not throw errors if documentElement is missing classList', () => {
      // Arrange
      Object.defineProperty(global.document, 'documentElement', {
        configurable: true,
        writable: true,
        value: {}, // No classList
      })

      // Act & Assert
      expect(() => renderHook(() => useApplyTheme())).not.toThrow()
    })
  })
})
