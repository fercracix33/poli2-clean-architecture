/**
 * useLocale Hook Tests - WILL FAIL until hook is implemented
 *
 * Created by: Test Agent
 * Date: 2025-10-09
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocale } from './useLocale';

// Mock document.cookie
let mockCookies: Record<string, string> = {};
Object.defineProperty(document, 'cookie', {
  get: () => Object.entries(mockCookies).map(([k, v]) => `${k}=${v}`).join('; '),
  set: (str: string) => {
    const [kv] = str.split(';');
    const [key, value] = kv.split('=');
    if (value) mockCookies[key.trim()] = value.trim();
  },
  configurable: true,
});

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

describe('useLocale', () => {
  beforeEach(() => {
    mockCookies = {};
    mockReload.mockClear();
  });

  it('returns locale from cookie when exists', () => {
    mockCookies['NEXT_LOCALE'] = 'es';
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBe('es');
  });

  it('returns DEFAULT_LOCALE when cookie does not exist', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBe('en');
  });

  it('updates cookie when setLocale is called', () => {
    const { result } = renderHook(() => useLocale());
    act(() => {
      result.current.setLocale('es');
    });
    expect(document.cookie).toContain('NEXT_LOCALE=es');
  });

  it('reloads page after setting locale', () => {
    const { result } = renderHook(() => useLocale());
    act(() => {
      result.current.setLocale('es');
    });
    expect(mockReload).toHaveBeenCalled();
  });

  it('does NOT reload when setting same locale', () => {
    mockCookies['NEXT_LOCALE'] = 'en';
    const { result } = renderHook(() => useLocale());
    act(() => {
      result.current.setLocale('en');
    });
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('sets isChangingLocale to true during change', () => {
    const { result } = renderHook(() => useLocale());
    act(() => {
      result.current.setLocale('es');
    });
    expect(result.current.isChangingLocale).toBe(true);
  });
});
