/**
 * Theme Entities Tests
 *
 * Tests Zod schemas for Theme entity validation.
 * IMPORTANT: Uses .safeParse() for all validations (never .parse()).
 *
 * Created by: Test Agent
 * Date: 2025-10-07
 * Feature: Dark/Light Mode Toggle (theme-001)
 */

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
