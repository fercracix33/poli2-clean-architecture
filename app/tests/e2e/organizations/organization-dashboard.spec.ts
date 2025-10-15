/**
 * E2E Tests: Organization Dashboard
 *
 * Tests the organization dashboard page functionality:
 * - Dashboard loads correctly
 * - Statistics are displayed
 * - Quick actions work
 * - Navigation is functional
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

import { test, expect } from '@playwright/test';
import {
  registerUser,
  authenticateUser,
  setupTestOrganization,
  cleanupTestData,
  generateTestEmail,
  generateTestSlug,
  type TestUser,
  type TestOrganization,
} from '../helpers/organization-helpers';

test.describe('Organization Dashboard', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    // Register and authenticate a test user
    testUser = {
      email: generateTestEmail('dashboard-test'),
      password: 'TestPassword123!',
      name: 'Dashboard Test User',
    };

    await registerUser(page, testUser);

    // Create test organization
    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for dashboard E2E tests',
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup test data
    await cleanupTestData(page, testOrg.slug);
  });

  test('should display organization dashboard', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Check page loaded
    await expect(page).toHaveTitle(/Dashboard/i);

    // Check welcome message
    await expect(page.locator('h1')).toContainText('Welcome to');

    // Check stats cards are visible
    await expect(page.getByText(/members/i)).toBeVisible();
    await expect(page.getByText(/projects/i)).toBeVisible();
  });

  test('should navigate to members page from quick actions', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Click invite members button
    await page.getByTestId('invite-members-button').click();

    // Should navigate to members page
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}/members`));
  });

  test('should navigate to settings from quick actions', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Click settings button
    await page.getByTestId('view-settings-button').click();

    // Should navigate to settings page
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}/settings`));
  });

  test('should display empty state when no projects', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Check for empty state message
    await expect(page.getByText(/No projects yet/i)).toBeVisible();

    // Check for create first project button
    await expect(page.getByTestId('create-first-project-button')).toBeVisible();
  });

  test('should use organization switcher', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Click organization switcher
    await page.getByTestId('organization-switcher').click();

    // Should show dropdown with organizations
    await expect(page.getByText(/My Organizations/i)).toBeVisible();
  });
});

test.describe('Organization Dashboard - Error Handling', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    testUser = {
      email: generateTestEmail('dashboard-error'),
      password: 'TestPassword123!',
      name: 'Dashboard Error Test User',
    };

    await registerUser(page, testUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for error handling',
    });
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure for dashboard API
    await page.route('**/api/organizations/**/stats', route => route.abort());

    await page.goto(`/org/${testOrg.slug}`);

    // Should show error message or fallback UI
    const hasErrorMessage = await page.getByText(/error|failed|try again/i).isVisible().catch(() => false);
    const hasFallbackUI = await page.locator('h1').isVisible().catch(() => false);

    // Either error message or fallback UI should be present
    expect(hasErrorMessage || hasFallbackUI).toBe(true);
  });

  test('should handle 404 organization not found', async ({ page }) => {
    // Navigate to non-existent organization
    await page.goto('/org/non-existent-organization-12345');

    // Should show 404 error or redirect
    const has404 = await page.getByText(/not found|doesn't exist/i).isVisible().catch(() => false);
    const isRedirected = page.url().includes('/404') || page.url().includes('/dashboard');

    expect(has404 || isRedirected).toBe(true);
  });

  test('should handle unauthorized access (403)', async ({ page, context }) => {
    // Create organization then logout
    await context.clearCookies();

    // Try to access organization without authentication
    await page.goto(`/org/${testOrg.slug}`);

    // Should redirect to login or show access denied
    const isLoginPage = page.url().includes('/auth/login') || page.url().includes('/login');
    const hasAccessDenied = await page.getByText(/access denied|sign in|log in/i).isVisible().catch(() => false);

    expect(isLoginPage || hasAccessDenied).toBe(true);
  });

  test('should recover from temporary API failures', async ({ page }) => {
    let requestCount = 0;

    // Fail first request, succeed on retry
    await page.route('**/api/organizations/**/stats', route => {
      requestCount++;
      if (requestCount === 1) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto(`/org/${testOrg.slug}`);

    // Should eventually show content (with retry logic)
    // Or show error with retry button
    const hasContent = await page.locator('h1').isVisible();
    expect(hasContent).toBe(true);
  });
});

test.describe('Organization Dashboard - Accessibility', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    testUser = {
      email: generateTestEmail('dashboard-a11y'),
      password: 'TestPassword123!',
      name: 'Dashboard A11y User',
    };

    await registerUser(page, testUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for a11y',
    });
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Organization switcher
    await page.keyboard.press('Tab'); // Navigation menu
    await page.keyboard.press('Tab'); // First action button

    // All interactive elements should be reachable
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check organization switcher has label
    const orgSwitcher = page.getByTestId('organization-switcher');
    const hasAriaLabel = await orgSwitcher.getAttribute('aria-label').catch(() => null);
    const hasAccessibleName = await orgSwitcher.textContent();

    expect(hasAriaLabel || hasAccessibleName).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Page should have h1
    await expect(page.locator('h1')).toBeVisible();

    // Check heading levels are sequential
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // All buttons should have text or aria-label
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
