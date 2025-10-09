/**
 * ThemeToggle Component Tests
 *
 * Tests React component rendering and user interaction.
 * Validates accessibility, keyboard navigation, and store integration.
 *
 * Created by: Test Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '../store/theme.store'

// Mock Zustand store
vi.mock('../store/theme.store')

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Sun: () => <div data-testid="sun-icon">Sun</div>,
}))

describe('ThemeToggle Component', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render toggle button', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should show Moon icon when theme is dark', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument()
    })

    it('should show Sun icon when theme is light', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
    })

    it('should have accessible label', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call toggleTheme on click', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme multiple times on multiple clicks', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // Assert
      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })

    it('should update icon after theme change', () => {
      // Arrange
      const { rerender } = render(<ThemeToggle />)

      // Initial: dark theme
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })
      rerender(<ThemeToggle />)
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()

      // Act: change to light theme
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })
      rerender(<ThemeToggle />)

      // Assert
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="button"', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should be keyboard accessible with Enter key', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

      // Assert
      expect(mockToggleTheme).toHaveBeenCalled()
    })

    it('should be keyboard accessible with Space key', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })

      // Assert
      expect(mockToggleTheme).toHaveBeenCalled()
    })

    it('should have aria-label describing current action', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button.getAttribute('aria-label')).toMatch(/toggle theme/i)
    })

    it('should have aria-pressed state', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-pressed')
    })
  })

  describe('Integration', () => {
    it('should integrate with theme store', () => {
      // Arrange
      const mockUseThemeStore = vi.mocked(useThemeStore)

      // Act
      mockUseThemeStore.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      render(<ThemeToggle />)

      // Assert
      expect(mockUseThemeStore).toHaveBeenCalled()
    })

    it('should reflect store state changes', () => {
      // Arrange
      const { rerender } = render(<ThemeToggle />)

      // Initial: dark
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })
      rerender(<ThemeToggle />)
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()

      // Change: light
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })
      rerender(<ThemeToggle />)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()

      // Change: dark again
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })
      rerender(<ThemeToggle />)
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply transition classes for smooth animation', () => {
      // Arrange
      vi.mocked(useThemeStore).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: vi.fn(),
      })

      // Act
      render(<ThemeToggle />)

      // Assert
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/transition/)
    })
  })
})
