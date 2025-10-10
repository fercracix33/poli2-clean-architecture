/**
 * Locale-aware navigation utilities
 *
 * Re-exports of next-intl navigation helpers with our routing configuration.
 * These are type-safe, locale-aware versions of Next.js navigation primitives.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-09
 * Feature: i18n-001
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation utilities:
 * - Link: Locale-aware <Link> component
 * - redirect: Server-side locale-aware redirect
 * - usePathname: Hook for current pathname
 * - useRouter: Hook for programmatic navigation
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
