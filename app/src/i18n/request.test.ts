/**
 * i18n Request Configuration Tests - WILL FAIL until request.ts is implemented
 *
 * Created by: Test Agent
 * Date: 2025-10-09
 */

import { describe, it, expect, vi } from 'vitest';
import { cookies } from 'next/headers';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('getLocale from request.ts', () => {
  it('returns locale from cookie when valid', async () => {
    const mockCookieStore = {
      get: vi.fn((name: string) => ({ value: 'es' })),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    // Import getRequestConfig dynamically to avoid module caching
    const { default: getRequestConfig } = await import('./request');
    const config = await getRequestConfig();

    expect(config.locale).toBe('es');
  });

  it('returns DEFAULT_LOCALE when cookie does not exist', async () => {
    const mockCookieStore = {
      get: vi.fn(() => undefined),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const { default: getRequestConfig } = await import('./request');
    const config = await getRequestConfig();

    expect(config.locale).toBe('en');
  });

  it('returns DEFAULT_LOCALE when cookie has invalid locale', async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: 'invalid' })),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const { default: getRequestConfig } = await import('./request');
    const config = await getRequestConfig();

    expect(config.locale).toBe('en');
  });

  it('loads correct messages for locale', async () => {
    const mockCookieStore = {
      get: vi.fn(() => ({ value: 'es' })),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const { default: getRequestConfig } = await import('./request');
    const config = await getRequestConfig();

    expect(config.messages).toBeDefined();
  });
});
