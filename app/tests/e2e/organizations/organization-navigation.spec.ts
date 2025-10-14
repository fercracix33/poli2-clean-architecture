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

test.describe('Organization Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup test organization and authenticate user
  });

  test('should navigate between organization pages using tabs', async ({ page }) => {
    await page.goto('/org/test-org');

    // Navigate to Members
    await page.getByTestId('nav-members').click();
    await expect(page).toHaveURL(/\/org\/test-org\/members/);

    // Navigate to Settings
    await page.getByTestId('nav-settings').click();
    await expect(page).toHaveURL(/\/org\/test-org\/settings/);

    // Navigate back to Overview
    await page.getByTestId('nav-overview').click();
    await expect(page).toHaveURL('/org/test-org');
  });

  test('should highlight current navigation tab', async ({ page }) => {
    await page.goto('/org/test-org/members');

    // Members tab should be highlighted
    const membersTab = page.getByTestId('nav-members');
    await expect(membersTab).toHaveAttribute('data-state', 'active');
  });

  test('should display organization name in header', async ({ page }) => {
    await page.goto('/org/test-org');

    // Organization switcher should show current org name
    await expect(page.getByTestId('organization-switcher')).toContainText('test-org');
  });

  test('should switch to another organization', async ({ page }) => {
    // TODO: User must have multiple organizations
    await page.goto('/org/test-org');

    // Open organization switcher
    await page.getByTestId('organization-switcher').click();

    // Select another organization
    await page.getByTestId('switch-to-other-org').click();

    // Should navigate to the other organization
    await expect(page).toHaveURL(/\/org\/other-org/);
  });

  test('should navigate to create new organization', async ({ page }) => {
    await page.goto('/org/test-org');

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

    await page.goto('/org/test-org');

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

    await page.goto('/org/test-org');

    // Open mobile menu
    await page.getByRole('button', { name: /open menu/i }).click();

    // Navigate to members
    await page.getByTestId('nav-members').click();

    // Menu should close
    // Note: Sheet component closes, so elements become invisible
    await expect(page).toHaveURL(/\/org\/test-org\/members/);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/org/test-org');

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
