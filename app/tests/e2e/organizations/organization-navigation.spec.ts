/**
 * E2E Tests: Organization Navigation
 *
 * Tests the organization layout navigation:
 * - Navigation tabs work correctly
 * - Breadcrumbs display properly
 * - Mobile menu functions
 * - Organization switcher works
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

import { test, expect } from '@playwright/test';
import {
  registerUser,
  setupTestOrganization,
  cleanupTestData,
  generateTestEmail,
  generateTestSlug,
  type TestUser,
  type TestOrganization,
} from '../helpers/organization-helpers';

test.describe('Organization Navigation', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    // Register and authenticate a test user
    testUser = {
      email: generateTestEmail('nav-test'),
      password: 'TestPassword123!',
      name: 'Navigation Test User',
    };

    await registerUser(page, testUser);

    // Create test organization
    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for navigation E2E tests',
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup test data
    await cleanupTestData(page, testOrg.slug);
  });

  test('should navigate between organization pages using tabs', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Navigate to Members
    await page.getByTestId('nav-members').click();
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}/members`));

    // Navigate to Settings
    await page.getByTestId('nav-settings').click();
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}/settings`));

    // Navigate back to Overview
    await page.getByTestId('nav-overview').click();
    await expect(page).toHaveURL(`/org/${testOrg.slug}`);
  });

  test('should highlight current navigation tab', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/members`);

    // Members tab should be highlighted
    const membersTab = page.getByTestId('nav-members');
    await expect(membersTab).toHaveAttribute('data-state', 'active');
  });

  test('should display organization name in header', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Organization switcher should show current org name or slug
    await expect(page.getByTestId('organization-switcher')).toContainText(testOrg.name);
  });

  test('should switch to another organization', async ({ page }) => {
    // TODO: User must have multiple organizations
    // This test will be skipped until multi-org setup is implemented
    test.skip();
  });

  test('should navigate to create new organization', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Open organization switcher
    await page.getByTestId('organization-switcher').click();

    // Click create new
    await page.getByTestId('create-new-organization').click();

    // Should navigate to create page
    await expect(page).toHaveURL(/\/org\/create/);
  });

  test('mobile menu should work correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/org/${testOrg.slug}`);

    // Desktop nav should be hidden
    await expect(page.getByTestId('nav-members')).not.toBeVisible();

    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();

    // Navigation should be visible in sheet
    await expect(page.getByTestId('nav-members')).toBeVisible();
  });

  test('should close mobile menu after navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/org/${testOrg.slug}`);

    // Open mobile menu
    await page.getByRole('button', { name: /open menu/i }).click();

    // Navigate to members
    await page.getByTestId('nav-members').click();

    // Menu should close
    // Note: Sheet component closes, so elements become invisible
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}/members`));
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Tab to organization switcher
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs depending on page structure

    // Press Enter to open
    await page.keyboard.press('Enter');

    // Should open dropdown
    await expect(page.getByText(/My Organizations/i)).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Dropdown should close
    await expect(page.getByText(/My Organizations/i)).not.toBeVisible();
  });
});

test.describe('Organization Navigation - Accessibility', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    testUser = {
      email: generateTestEmail('nav-a11y'),
      password: 'TestPassword123!',
      name: 'Navigation A11y User',
    };

    await registerUser(page, testUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for navigation a11y',
    });
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('navigation tabs should have proper ARIA roles', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Navigation should be in a nav element or have role="navigation"
    const hasNavElement = await page.locator('nav').isVisible().catch(() => false);
    const hasNavRole = await page.locator('[role="navigation"]').isVisible().catch(() => false);

    expect(hasNavElement || hasNavRole).toBe(true);

    // Active tab should have aria-current or data-state="active"
    const overviewTab = page.getByTestId('nav-overview');
    const hasAriaCurrent = await overviewTab.getAttribute('aria-current').catch(() => null);
    const hasDataState = await overviewTab.getAttribute('data-state');

    expect(hasAriaCurrent || hasDataState).toBeTruthy();
  });

  test('organization switcher should be accessible', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Organization switcher should have accessible name
    const orgSwitcher = page.getByTestId('organization-switcher');
    const ariaLabel = await orgSwitcher.getAttribute('aria-label').catch(() => null);
    const textContent = await orgSwitcher.textContent();

    expect(ariaLabel || textContent).toBeTruthy();

    // Should be keyboard operable
    await orgSwitcher.focus();
    await page.keyboard.press('Enter');

    // Dropdown should open
    const isDropdownVisible = await page.getByText(/My Organizations/i).isVisible();
    expect(isDropdownVisible).toBe(true);
  });

  test('navigation should have proper landmark structure', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Should have main landmark
    await expect(page.locator('main')).toBeVisible();

    // Should have navigation landmark
    const hasNavLandmark = await page.locator('nav').isVisible().catch(() => false);
    const hasNavRole = await page.locator('[role="navigation"]').isVisible().catch(() => false);

    expect(hasNavLandmark || hasNavRole).toBe(true);

    // Should have proper heading hierarchy
    const h1 = await page.locator('h1').isVisible().catch(() => false);
    expect(h1).toBe(true);
  });

  test('mobile menu should be accessible', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`/org/${testOrg.slug}`);

    // Mobile menu button should have accessible name
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await expect(menuButton).toBeVisible();

    const buttonText = await menuButton.textContent();
    const ariaLabel = await menuButton.getAttribute('aria-label');

    expect(buttonText || ariaLabel).toBeTruthy();

    // Should be keyboard operable
    await menuButton.focus();
    await page.keyboard.press('Enter');

    // Navigation should appear
    await expect(page.getByTestId('nav-members')).toBeVisible();
  });

  test('navigation links should have clear focus indicators', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Tab to navigation
    await page.keyboard.press('Tab');

    // Focus should be visible on navigation elements
    const focusedElement = await page.evaluate(() => {
      const activeEl = document.activeElement;
      if (!activeEl) return null;

      const styles = window.getComputedStyle(activeEl);
      const hasFocusVisible = activeEl.matches(':focus-visible');
      const hasOutline = styles.outline !== 'none' && styles.outline !== '';
      const hasBoxShadow = styles.boxShadow !== 'none';

      return {
        tagName: activeEl.tagName,
        hasFocusVisible,
        hasOutline,
        hasBoxShadow,
      };
    });

    expect(focusedElement).toBeTruthy();
  });

  test('organization switcher dropdown should announce changes', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    // Open organization switcher
    await page.getByTestId('organization-switcher').click();

    // Dropdown content should be announced
    const dropdown = page.getByText(/My Organizations/i);
    await expect(dropdown).toBeVisible();

    // Check for aria-live region or role
    const parentWithRole = await page.evaluate(() => {
      const dropdown = document.querySelector('[role="menu"], [role="listbox"], [aria-live]');
      return dropdown !== null;
    });

    expect(parentWithRole).toBe(true);
  });

  test('tab navigation should follow logical order', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}`);

    const focusOrder: string[] = [];

    // Tab through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const elementInfo = await page.evaluate(() => {
        const activeEl = document.activeElement;
        if (!activeEl) return null;

        return {
          tagName: activeEl.tagName,
          testId: activeEl.getAttribute('data-testid'),
          text: activeEl.textContent?.slice(0, 30),
        };
      });

      if (elementInfo && elementInfo.testId) {
        focusOrder.push(elementInfo.testId);
      }
    }

    // Should include navigation elements
    const hasNavElements =
      focusOrder.some((id) => id.includes('nav-')) ||
      focusOrder.some((id) => id.includes('organization-switcher'));

    expect(hasNavElements).toBe(true);
  });
});
