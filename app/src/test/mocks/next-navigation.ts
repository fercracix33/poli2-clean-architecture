/**
 * Mock for next/navigation
 * Used in tests to avoid Next.js runtime dependencies
 */

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
  };
}

export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function redirect() {
  // Mock redirect
}

export function notFound() {
  // Mock notFound
}
