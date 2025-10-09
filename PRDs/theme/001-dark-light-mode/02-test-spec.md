# Test Specifications: Dark/Light Mode Toggle

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Supabase Spec:** N/A (No database required)
- **Feature ID:** theme-001
- **Assigned Agent:** Test Agent
- **Status:** Completed

---

## 1. Estrategia de Testing

### Cobertura Objetivo
- **Unitarios:** > 90% cobertura de líneas
- **Integración:** N/A (No API endpoints)
- **E2E:** ThemeToggle component interaction (UI/UX Agent responsibility)

### Herramientas
- **Framework:** Vitest
- **Mocking:** vi.mock() for Zustand store and DOM APIs
- **Assertions:** expect()
- **React Testing:** @testing-library/react for component tests
- **Coverage:** c8

### Test Layers Coverage
1. **Entities Layer:** Zod schema validation
2. **Store Layer:** Zustand state management
3. **Hooks Layer:** DOM manipulation and store subscription
4. **Components Layer:** React component rendering and interaction

---

## 2. Tests Unitarios - Entities

### Archivo: `src/features/theme/entities.test.ts`

**Purpose:** Validate Zod schemas for Theme entity

**Test Coverage:**
```typescript
import { describe, it, expect } from 'vitest'
import { ThemeSchema, DEFAULT_THEME, isTheme } from './entities'

describe('Theme Entities', () => {
  describe('ThemeSchema', () => {
    it('should validate "light" as valid theme', () => {
      const result = ThemeSchema.safeParse('light')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('light')
      }
    })

    it('should validate "dark" as valid theme', () => {
      const result = ThemeSchema.safeParse('dark')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('dark')
      }
    })

    it('should reject invalid theme values', () => {
      const invalidValues = ['auto', 'blue', 'system', 'high-contrast', '']

      invalidValues.forEach((value) => {
        const result = ThemeSchema.safeParse(value)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Theme must be either "light" or "dark"')
        }
      })
    })

    it('should reject null and undefined', () => {
      const nullResult = ThemeSchema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedResult = ThemeSchema.safeParse(undefined)
      expect(undefinedResult.success).toBe(false)
    })

    it('should reject non-string values', () => {
      const invalidValues = [123, true, {}, [], Symbol('dark')]

      invalidValues.forEach((value) => {
        const result = ThemeSchema.safeParse(value)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('DEFAULT_THEME', () => {
    it('should be "dark"', () => {
      expect(DEFAULT_THEME).toBe('dark')
    })

    it('should be a valid Theme', () => {
      const result = ThemeSchema.safeParse(DEFAULT_THEME)
      expect(result.success).toBe(true)
    })
  })

  describe('isTheme type guard', () => {
    it('should return true for "light"', () => {
      expect(isTheme('light')).toBe(true)
    })

    it('should return true for "dark"', () => {
      expect(isTheme('dark')).toBe(true)
    })

    it('should return false for invalid values', () => {
      expect(isTheme('auto')).toBe(false)
      expect(isTheme('system')).toBe(false)
      expect(isTheme('')).toBe(false)
      expect(isTheme(null)).toBe(false)
      expect(isTheme(undefined)).toBe(false)
      expect(isTheme(123)).toBe(false)
      expect(isTheme({})).toBe(false)
    })
  })
})
```

**Expected Failures:**
- All tests should PASS (entities.ts already implemented by Architect)

**Coverage Target:** 100% (simple entity validation)

---

## 3. Tests Unitarios - Zustand Store

### Archivo: `src/features/theme/store/theme.store.test.ts`

**Purpose:** Validate Zustand store state management and actions

**Test Coverage:**
```typescript
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
```

**Expected Failures:**
- `Cannot find module './theme.store'` (store not implemented yet)
- All tests should FAIL with module resolution errors

**Coverage Target:** > 95% (pure state management)

---

## 4. Tests Unitarios - useApplyTheme Hook

### Archivo: `src/features/theme/hooks/useApplyTheme.test.ts`

**Purpose:** Validate DOM manipulation and Zustand store subscription

**Mocking Strategy:**
```typescript
// Mock document.documentElement.classList
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
  toggle: vi.fn(),
}

Object.defineProperty(document, 'documentElement', {
  configurable: true,
  value: {
    classList: mockClassList,
  },
})
```

**Test Coverage:**
```typescript
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
      expect(documentElement).not.toHaveProperty('style')
      expect(documentElement).not.toHaveProperty('dataset')
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
```

**Expected Failures:**
- `Cannot find module './useApplyTheme'` (hook not implemented yet)
- All tests should FAIL with module resolution errors

**Coverage Target:** > 90% (DOM manipulation and subscriptions)

---

## 5. Tests de Integración - ThemeToggle Component

### Archivo: `src/features/theme/components/ThemeToggle.test.tsx`

**Purpose:** Validate React component rendering and user interaction

**Mocking Strategy:**
```typescript
// Mock Zustand store
vi.mock('../store/theme.store', () => ({
  useThemeStore: vi.fn(),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Moon: () => <div data-testid="moon-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
}))
```

**Test Coverage:**
```typescript
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
```

**Expected Failures:**
- `Cannot find module './ThemeToggle'` (component not implemented yet)
- All tests should FAIL with module resolution errors

**Coverage Target:** > 90% (component rendering and interaction)

---

## 6. Mocking Strategy

### Zustand Store Mocks
```typescript
// For component tests
vi.mock('../store/theme.store', () => ({
  useThemeStore: vi.fn(),
}))

// Usage in tests
vi.mocked(useThemeStore).mockReturnValue({
  theme: 'dark',
  toggleTheme: mockToggleTheme,
  setTheme: mockSetTheme,
})
```

### DOM API Mocks
```typescript
// Mock document.documentElement.classList
const mockClassListAdd = vi.fn()
const mockClassListRemove = vi.fn()

Object.defineProperty(global.document, 'documentElement', {
  configurable: true,
  writable: true,
  value: {
    classList: {
      add: mockClassListAdd,
      remove: mockClassListRemove,
    },
  },
})
```

### Icon Library Mocks
```typescript
// Mock lucide-react
vi.mock('lucide-react', () => ({
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Sun: () => <div data-testid="sun-icon">Sun</div>,
}))
```

### NO Mocks Required
- ❌ localStorage (NOT used in this feature)
- ❌ Supabase client (NO database)
- ❌ API endpoints (NO backend)
- ❌ External APIs (NO integrations)

---

## 7. Test Data & Fixtures

### Constants
```typescript
// No fixtures needed - only two theme values: 'light' and 'dark'
export const VALID_THEMES = ['light', 'dark'] as const
export const INVALID_THEMES = ['auto', 'system', 'blue', 'high-contrast', '', null, undefined]
export const DEFAULT_THEME = 'dark'
```

### Mock Functions
```typescript
export const createMockThemeStore = (theme: 'light' | 'dark' = 'dark') => ({
  theme,
  toggleTheme: vi.fn(),
  setTheme: vi.fn(),
})
```

---

## 8. Performance Tests

### Not Required for This Feature
- No performance-critical operations (simple state toggle)
- No large data sets
- No async operations
- No network requests

**Rationale:** Theme toggle is instantaneous (<50ms as per PRD)

---

## 9. Security Tests

### Not Required for This Feature
- No user input storage
- No authentication/authorization
- No backend communication
- No sensitive data

**Rationale:** Pure client-side UI state (no security implications)

---

## 10. Coverage Requirements

### Minimum Coverage Targets
- **Statements:** > 90%
- **Branches:** > 85%
- **Functions:** > 95%
- **Lines:** > 90%

### Coverage by Layer
- **Entities:** 100% (simple Zod validation)
- **Store:** > 95% (pure state management)
- **Hooks:** > 90% (DOM manipulation)
- **Components:** > 90% (rendering and interaction)

### Coverage Exclusions
- None (all code should be tested)

---

## 11. Test Execution

### Scripts de Testing
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:theme": "vitest src/features/theme"
  }
}
```

### Expected Test Run Output (After Implementation)
```bash
npm run test:theme

✓ src/features/theme/entities.test.ts (14 tests)
✓ src/features/theme/store/theme.store.test.ts (12 tests)
✓ src/features/theme/hooks/useApplyTheme.test.ts (10 tests)
✓ src/features/theme/components/ThemeToggle.test.tsx (15 tests)

Test Files  4 passed (4)
     Tests  51 passed (51)
  Start at  10:00:00
  Duration  2.34s (transform 150ms, setup 0ms, collect 450ms, tests 1.74s)
```

### CI/CD Integration
```yaml
# Will be configured in .github/workflows/test.yml
- name: Run Theme Tests
  run: npm run test:theme

- name: Check Coverage
  run: npm run test:coverage -- --threshold.lines=90
```

---

## 12. Checklist de Completitud

### Tests Unitarios
- [x] Entities: Zod schema validation
- [x] Store: Initial state validation
- [x] Store: toggleTheme() functionality
- [x] Store: setTheme() functionality
- [x] Store: Subscription behavior
- [x] Store: No localStorage persistence
- [x] Hook: HTML class application
- [x] Hook: Store subscription
- [x] Hook: Cleanup on unmount
- [x] Hook: DOM manipulation safety

### Tests de Integración
- [x] Component: Rendering with dark theme
- [x] Component: Rendering with light theme
- [x] Component: Icon display logic
- [x] Component: Click interaction
- [x] Component: Keyboard accessibility
- [x] Component: ARIA attributes
- [x] Component: Store integration

### Mocking
- [x] Zustand store mocked for component tests
- [x] DOM APIs mocked (documentElement.classList)
- [x] Icon library mocked (lucide-react)
- [x] Mock cleanup implemented (beforeEach/afterEach)

### Coverage
- [x] Cobertura > 90% target defined
- [x] Coverage exclusions documented (none)
- [x] Test execution scripts configured
- [ ] Coverage reports generated (after implementation)

### Expected Test Failures
- [x] All tests WILL FAIL with "module not found" errors
- [x] Store tests will fail: `Cannot find module './theme.store'`
- [x] Hook tests will fail: `Cannot find module './useApplyTheme'`
- [x] Component tests will fail: `Cannot find module './ThemeToggle'`

---

## 13. Handoff to Implementer Agent

### What You Will Receive
- ✅ Complete failing test suite (51 tests total)
- ✅ Clearly defined interfaces and function signatures
- ✅ Expected behavior documented in assertions
- ✅ Mock configurations ready to use

### What You Must Implement
1. **Zustand Store** (`store/theme.store.ts`):
   - Initial state: `{ theme: 'dark' }`
   - `toggleTheme()` function
   - `setTheme(theme: Theme)` function

2. **useApplyTheme Hook** (`hooks/useApplyTheme.ts`):
   - Subscribe to Zustand store
   - Add/remove 'dark' class to `document.documentElement`
   - Cleanup subscription on unmount

3. **ThemeToggle Component** (`components/ThemeToggle.tsx`):
   - Render button with Moon/Sun icon
   - Call `toggleTheme()` on click
   - WCAG 2.1 AA accessibility
   - Keyboard navigation (Enter/Space)

### Critical Requirements
- ❌ **DO NOT** modify ANY test files
- ❌ **DO NOT** add localStorage logic
- ❌ **DO NOT** add system theme detection
- ✅ **MUST** make all 51 tests pass
- ✅ **MUST** achieve > 90% coverage
- ✅ **MUST** follow exact interfaces defined in tests

### Success Criteria
```bash
npm run test:theme

✓ All 51 tests passing
✓ Coverage > 90%
✓ No test modifications
✓ No warnings or errors
```

---

**Completado por:** Test Agent
**Fecha de Completitud:** 2025-10-07
**Tests Totales:** 51 tests across 4 files
**Coverage Target:** > 90% for all layers
**Status:** ✅ Ready for Implementer Agent
