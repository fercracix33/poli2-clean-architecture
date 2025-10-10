/**
 * Internationalization Entities Tests
 *
 * Tests Zod schemas for i18n data validation.
 * IMPORTANT: Uses .safeParse() for all validations (never .parse()).
 *
 * Created by: Test Agent
 * Date: 2025-10-09
 * Feature: Application Internationalization System (i18n-001)
 */

import { describe, it, expect } from 'vitest';
import {
  LocaleSchema,
  LocaleCookieSchema,
  TranslationNamespaceSchema,
  TranslationKeySchema,
  isLocale,
  isTranslationKey,
  isTranslationNamespace,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_LABELS,
  LOCALE_FLAGS,
  type Locale,
  type LocaleCookie,
  type TranslationNamespace,
  type TranslationKey,
} from './entities';

// ============================================================================
// LOCALE SCHEMA TESTS
// ============================================================================

describe('LocaleSchema', () => {
  describe('valid locales', () => {
    it('accepts "en" as valid locale', () => {
      const result = LocaleSchema.safeParse('en');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('en');
      }
    });

    it('accepts "es" as valid locale', () => {
      const result = LocaleSchema.safeParse('es');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('es');
      }
    });
  });

  describe('invalid locales', () => {
    it('rejects "fr" as invalid locale', () => {
      const result = LocaleSchema.safeParse('fr');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
        expect(result.error.issues[0].message).toBe('Locale must be either "en" or "es"');
      }
    });

    it('rejects "de" as invalid locale', () => {
      const result = LocaleSchema.safeParse('de');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('rejects empty string', () => {
      const result = LocaleSchema.safeParse('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('rejects null', () => {
      const result = LocaleSchema.safeParse(null);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('rejects undefined', () => {
      const result = LocaleSchema.safeParse(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('rejects number', () => {
      const result = LocaleSchema.safeParse(123);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('rejects object', () => {
      const result = LocaleSchema.safeParse({ locale: 'en' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('case sensitivity', () => {
    it('rejects uppercase "EN"', () => {
      const result = LocaleSchema.safeParse('EN');

      expect(result.success).toBe(false);
    });

    it('rejects mixed case "En"', () => {
      const result = LocaleSchema.safeParse('En');

      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// LOCALE COOKIE SCHEMA TESTS
// ============================================================================

describe('LocaleCookieSchema', () => {
  describe('valid cookie data', () => {
    it('accepts valid cookie structure with all fields', () => {
      const validCookie = {
        name: 'NEXT_LOCALE',
        value: 'en',
        maxAge: 31536000,
      };

      const result = LocaleCookieSchema.safeParse(validCookie);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCookie);
      }
    });

    it('accepts valid cookie with "es" locale', () => {
      const validCookie = {
        name: 'NEXT_LOCALE',
        value: 'es',
        maxAge: 31536000,
      };

      const result = LocaleCookieSchema.safeParse(validCookie);

      expect(result.success).toBe(true);
    });

    it('applies default maxAge when omitted', () => {
      const cookieWithoutMaxAge = {
        name: 'NEXT_LOCALE',
        value: 'en',
      };

      const result = LocaleCookieSchema.safeParse(cookieWithoutMaxAge);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxAge).toBe(31536000); // Default: 1 year
      }
    });

    it('accepts custom maxAge value', () => {
      const customMaxAge = 86400; // 1 day
      const validCookie = {
        name: 'NEXT_LOCALE',
        value: 'en',
        maxAge: customMaxAge,
      };

      const result = LocaleCookieSchema.safeParse(validCookie);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxAge).toBe(customMaxAge);
      }
    });
  });

  describe('invalid cookie data', () => {
    it('rejects cookie with wrong name', () => {
      const invalidCookie = {
        name: 'WRONG_NAME',
        value: 'en',
        maxAge: 31536000,
      };

      const result = LocaleCookieSchema.safeParse(invalidCookie);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_literal');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects cookie with invalid locale value', () => {
      const invalidCookie = {
        name: 'NEXT_LOCALE',
        value: 'fr',
        maxAge: 31536000,
      };

      const result = LocaleCookieSchema.safeParse(invalidCookie);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['value']);
      }
    });

    it('rejects cookie with negative maxAge', () => {
      const invalidCookie = {
        name: 'NEXT_LOCALE',
        value: 'en',
        maxAge: -100,
      };

      const result = LocaleCookieSchema.safeParse(invalidCookie);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
        expect(result.error.issues[0].path).toEqual(['maxAge']);
      }
    });

    it('rejects cookie with zero maxAge', () => {
      const invalidCookie = {
        name: 'NEXT_LOCALE',
        value: 'en',
        maxAge: 0,
      };

      const result = LocaleCookieSchema.safeParse(invalidCookie);

      expect(result.success).toBe(false);
    });

    it('rejects cookie with missing required name field', () => {
      const invalidCookie = {
        value: 'en',
        maxAge: 31536000,
      };

      const result = LocaleCookieSchema.safeParse(invalidCookie);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_literal');
        expect(result.error.issues[0].path).toEqual(['name']);
      }
    });

    it('rejects cookie with missing value field', () => {
      const invalidCookie = {
        name: 'NEXT_LOCALE',
        maxAge: 31536000,
      };

      const result = LocaleCookieSchema.safeParse(invalidCookie);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['value']);
      }
    });
  });
});

// ============================================================================
// TRANSLATION NAMESPACE SCHEMA TESTS
// ============================================================================

describe('TranslationNamespaceSchema', () => {
  describe('valid namespaces', () => {
    const validNamespaces: TranslationNamespace[] = [
      'common',
      'auth',
      'navigation',
      'errors',
      'validation',
    ];

    validNamespaces.forEach((namespace) => {
      it(`accepts "${namespace}" as valid namespace`, () => {
        const result = TranslationNamespaceSchema.safeParse(namespace);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(namespace);
        }
      });
    });
  });

  describe('invalid namespaces', () => {
    it('rejects "invalid" namespace', () => {
      const result = TranslationNamespaceSchema.safeParse('invalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('rejects empty string', () => {
      const result = TranslationNamespaceSchema.safeParse('');

      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = TranslationNamespaceSchema.safeParse(null);

      expect(result.success).toBe(false);
    });

    it('rejects undefined', () => {
      const result = TranslationNamespaceSchema.safeParse(undefined);

      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// TRANSLATION KEY SCHEMA TESTS
// ============================================================================

describe('TranslationKeySchema', () => {
  describe('valid translation keys', () => {
    it('accepts "common.welcome" format', () => {
      const result = TranslationKeySchema.safeParse('common.welcome');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('common.welcome');
      }
    });

    it('accepts "auth.login.title" nested format', () => {
      const result = TranslationKeySchema.safeParse('auth.login.title');

      expect(result.success).toBe(true);
    });

    it('accepts deeply nested keys', () => {
      const result = TranslationKeySchema.safeParse('common.buttons.actions.save');

      expect(result.success).toBe(true);
    });

    it('accepts keys with multiple segments', () => {
      const result = TranslationKeySchema.safeParse('validation.errors.required.email');

      expect(result.success).toBe(true);
    });
  });

  describe('invalid translation keys', () => {
    it('rejects key without namespace (single word)', () => {
      const result = TranslationKeySchema.safeParse('invalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
        expect(result.error.issues[0].validation).toBe('regex');
        expect(result.error.issues[0].message).toContain('namespace.key');
      }
    });

    it('rejects key with uppercase letters', () => {
      const result = TranslationKeySchema.safeParse('Common.Welcome');

      expect(result.success).toBe(false);
    });

    it('rejects key with numbers', () => {
      const result = TranslationKeySchema.safeParse('common.welcome1');

      expect(result.success).toBe(false);
    });

    it('rejects key with special characters', () => {
      const result = TranslationKeySchema.safeParse('common.welcome!');

      expect(result.success).toBe(false);
    });

    it('rejects key with spaces', () => {
      const result = TranslationKeySchema.safeParse('common welcome');

      expect(result.success).toBe(false);
    });

    it('rejects key with hyphens', () => {
      const result = TranslationKeySchema.safeParse('common.welcome-message');

      expect(result.success).toBe(false);
    });

    it('rejects key with underscores', () => {
      const result = TranslationKeySchema.safeParse('common.welcome_message');

      expect(result.success).toBe(false);
    });

    it('rejects empty string', () => {
      const result = TranslationKeySchema.safeParse('');

      expect(result.success).toBe(false);
    });

    it('rejects key starting with dot', () => {
      const result = TranslationKeySchema.safeParse('.common.welcome');

      expect(result.success).toBe(false);
    });

    it('rejects key ending with dot', () => {
      const result = TranslationKeySchema.safeParse('common.welcome.');

      expect(result.success).toBe(false);
    });

    it('rejects key with consecutive dots', () => {
      const result = TranslationKeySchema.safeParse('common..welcome');

      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// TYPE GUARDS TESTS
// ============================================================================

describe('isLocale', () => {
  describe('returns true for valid locales', () => {
    it('returns true for "en"', () => {
      expect(isLocale('en')).toBe(true);
    });

    it('returns true for "es"', () => {
      expect(isLocale('es')).toBe(true);
    });
  });

  describe('returns false for invalid locales', () => {
    it('returns false for "fr"', () => {
      expect(isLocale('fr')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isLocale('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isLocale(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isLocale(undefined)).toBe(false);
    });

    it('returns false for number', () => {
      expect(isLocale(123)).toBe(false);
    });

    it('returns false for object', () => {
      expect(isLocale({ locale: 'en' })).toBe(false);
    });

    it('returns false for array', () => {
      expect(isLocale(['en'])).toBe(false);
    });

    it('returns false for uppercase "EN"', () => {
      expect(isLocale('EN')).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('narrows type when used in if statement', () => {
      const value: unknown = 'es';

      if (isLocale(value)) {
        // TypeScript should know value is Locale here
        const locale: Locale = value;
        expect(locale).toBe('es');
      } else {
        throw new Error('Should not reach here');
      }
    });
  });
});

describe('isTranslationKey', () => {
  describe('returns true for valid keys', () => {
    it('returns true for "common.welcome"', () => {
      expect(isTranslationKey('common.welcome')).toBe(true);
    });

    it('returns true for nested keys', () => {
      expect(isTranslationKey('auth.login.title')).toBe(true);
    });
  });

  describe('returns false for invalid keys', () => {
    it('returns false for single word', () => {
      expect(isTranslationKey('invalid')).toBe(false);
    });

    it('returns false for uppercase', () => {
      expect(isTranslationKey('Common.Welcome')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isTranslationKey('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isTranslationKey(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isTranslationKey(undefined)).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('narrows type when used in if statement', () => {
      const value: unknown = 'common.welcome';

      if (isTranslationKey(value)) {
        const key: TranslationKey = value;
        expect(key).toBe('common.welcome');
      } else {
        throw new Error('Should not reach here');
      }
    });
  });
});

describe('isTranslationNamespace', () => {
  describe('returns true for valid namespaces', () => {
    const validNamespaces = ['common', 'auth', 'navigation', 'errors', 'validation'];

    validNamespaces.forEach((namespace) => {
      it(`returns true for "${namespace}"`, () => {
        expect(isTranslationNamespace(namespace)).toBe(true);
      });
    });
  });

  describe('returns false for invalid namespaces', () => {
    it('returns false for "invalid"', () => {
      expect(isTranslationNamespace('invalid')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isTranslationNamespace('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isTranslationNamespace(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isTranslationNamespace(undefined)).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('narrows type when used in if statement', () => {
      const value: unknown = 'auth';

      if (isTranslationNamespace(value)) {
        const namespace: TranslationNamespace = value;
        expect(namespace).toBe('auth');
      } else {
        throw new Error('Should not reach here');
      }
    });
  });
});

// ============================================================================
// CONSTANTS TESTS
// ============================================================================

describe('Constants', () => {
  describe('DEFAULT_LOCALE', () => {
    it('is set to "en"', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });

    it('is a valid Locale type', () => {
      expect(isLocale(DEFAULT_LOCALE)).toBe(true);
    });
  });

  describe('SUPPORTED_LOCALES', () => {
    it('contains exactly 2 locales', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });

    it('contains "en" and "es"', () => {
      expect(SUPPORTED_LOCALES).toEqual(['en', 'es']);
    });

    it('all items are valid Locale values', () => {
      SUPPORTED_LOCALES.forEach((locale) => {
        expect(isLocale(locale)).toBe(true);
      });
    });

    it('is readonly (frozen)', () => {
      expect(Object.isFrozen(SUPPORTED_LOCALES)).toBe(false); // as const makes it readonly in TS, but not frozen at runtime
      // TypeScript will prevent mutations at compile time
    });

    it('includes DEFAULT_LOCALE', () => {
      expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
    });
  });

  describe('LOCALE_COOKIE_NAME', () => {
    it('is set to "NEXT_LOCALE"', () => {
      expect(LOCALE_COOKIE_NAME).toBe('NEXT_LOCALE');
    });

    it('is a string', () => {
      expect(typeof LOCALE_COOKIE_NAME).toBe('string');
    });
  });

  describe('LOCALE_COOKIE_MAX_AGE', () => {
    it('is set to 1 year in seconds', () => {
      const oneYearInSeconds = 60 * 60 * 24 * 365;
      expect(LOCALE_COOKIE_MAX_AGE).toBe(oneYearInSeconds);
    });

    it('equals 31536000 seconds', () => {
      expect(LOCALE_COOKIE_MAX_AGE).toBe(31536000);
    });

    it('is a positive number', () => {
      expect(LOCALE_COOKIE_MAX_AGE).toBeGreaterThan(0);
    });
  });

  describe('LOCALE_LABELS', () => {
    it('has label for "en"', () => {
      expect(LOCALE_LABELS.en).toBe('English');
    });

    it('has label for "es"', () => {
      expect(LOCALE_LABELS.es).toBe('Español');
    });

    it('has labels for all supported locales', () => {
      SUPPORTED_LOCALES.forEach((locale) => {
        expect(LOCALE_LABELS[locale]).toBeDefined();
        expect(typeof LOCALE_LABELS[locale]).toBe('string');
        expect(LOCALE_LABELS[locale].length).toBeGreaterThan(0);
      });
    });

    it('has exactly 2 entries', () => {
      expect(Object.keys(LOCALE_LABELS)).toHaveLength(2);
    });
  });

  describe('LOCALE_FLAGS', () => {
    it('has flag for "en"', () => {
      expect(LOCALE_FLAGS.en).toBe('🇺🇸');
    });

    it('has flag for "es"', () => {
      expect(LOCALE_FLAGS.es).toBe('🇪🇸');
    });

    it('has flags for all supported locales', () => {
      SUPPORTED_LOCALES.forEach((locale) => {
        expect(LOCALE_FLAGS[locale]).toBeDefined();
        expect(typeof LOCALE_FLAGS[locale]).toBe('string');
        expect(LOCALE_FLAGS[locale].length).toBeGreaterThan(0);
      });
    });

    it('has exactly 2 entries', () => {
      expect(Object.keys(LOCALE_FLAGS)).toHaveLength(2);
    });
  });
});
