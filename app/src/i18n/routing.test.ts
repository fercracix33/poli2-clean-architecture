/**
 * i18n Routing Configuration Tests - WILL PASS when routing.ts is created
 *
 * Created by: Test Agent
 * Date: 2025-10-09
 */

import { describe, it, expect } from 'vitest';

describe('routing configuration', () => {
  it('exports locales array with en and es', async () => {
    const { routing } = await import('./routing');
    
    expect(routing.locales).toEqual(['en', 'es']);
  });

  it('sets defaultLocale to en', async () => {
    const { routing } = await import('./routing');
    
    expect(routing.defaultLocale).toBe('en');
  });

  it('sets localePrefix to never', async () => {
    const { routing } = await import('./routing');
    
    expect(routing.localePrefix).toBe('never');
  });

  it('configures localeCookie with correct name', async () => {
    const { routing } = await import('./routing');
    
    expect(routing.localeCookie?.name).toBe('NEXT_LOCALE');
  });

  it('configures localeCookie with correct maxAge', async () => {
    const { routing } = await import('./routing');
    
    const oneYear = 60 * 60 * 24 * 365;
    expect(routing.localeCookie?.maxAge).toBe(oneYear);
  });
});
