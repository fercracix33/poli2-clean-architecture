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

test.describe('Organization Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup test organization and authenticate user
    // This will require test helpers for creating test data
  });

  test('should display organization dashboard', async ({ page }) => {
    await page.goto('/org/test-org');

    // Check page loaded
    await expect(page).toHaveTitle(/Dashboard/i);

    // Check welcome message
    await expect(page.locator('h1')).toContainText('Welcome to');

    // Check stats cards are visible
    await expect(page.getByText(/members/i)).toBeVisible();
    await expect(page.getByText(/projects/i)).toBeVisible();
  });

  test('should navigate to members page from quick actions', async ({ page }) => {
    await page.goto('/org/test-org');

    // Click invite members button
    await page.getByTestId('invite-members-button').click();

    // Should navigate to members page
    await expect(page).toHaveURL(/\/org\/test-org\/members/);
  });

  test('should navigate to settings from quick actions', async ({ page }) => {
    await page.goto('/org/test-org');

    // Click settings button
    await page.getByTestId('view-settings-button').click();

    // Should navigate to settings page
    await expect(page).toHaveURL(/\/org\/test-org\/settings/);
  });

  test('should display empty state when no projects', async ({ page }) => {
    await page.goto('/org/test-org');

    // Check for empty state message
    await expect(page.getByText(/No projects yet/i)).toBeVisible();

    // Check for create first project button
    await expect(page.getByTestId('create-first-project-button')).toBeVisible();
  });

  test('should use organization switcher', async ({ page }) => {
    await page.goto('/org/test-org');

    // Click organization switcher
    await page.getByTestId('organization-switcher').click();

    // Should show dropdown with organizations
    await expect(page.getByText(/My Organizations/i)).toBeVisible();
  });
});
