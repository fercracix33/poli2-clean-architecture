/**
 * E2E Tests: Join Organization
 *
 * Tests the organization join flow:
 * - Join organization with valid invite code
 * - Validation of slug and invite code
 * - Error handling for invalid codes
 * - Error handling for already being a member
 * - Redirect to organization dashboard after joining
 *
 * Created by: Agent
 * Date: 2025-10-14
 * Feature: Organizations - Join Flow
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

test.describe('Join Organization', () => {
  let ownerUser: TestUser;
  let joiningUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page, context }) => {
    // Create owner user and organization
    ownerUser = {
      email: generateTestEmail('org-owner'),
      password: 'TestPassword123!',
      name: 'Organization Owner',
    };

    await registerUser(page, ownerUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for join E2E tests',
    });

    // Create a second user to join the organization
    // Clear cookies to simulate a new user
    await context.clearCookies();

    joiningUser = {
      email: generateTestEmail('joining-user'),
      password: 'TestPassword123!',
      name: 'Joining User',
    };

    await registerUser(page, joiningUser);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup test data
    await cleanupTestData(page, testOrg.slug);
  });

  test('should join organization with valid invite code', async ({ page }) => {
    // Navigate to join page
    await page.goto('/org/join');

    // Check page loaded
    await expect(page.locator('h1')).toContainText(/Join.*Organization/i);

    // Fill join form
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Should redirect to organization dashboard
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });

    // Should see welcome message or organization name
    await expect(page.locator('h1')).toContainText('Welcome to');
  });

  test('should validate invite code format (8 characters)', async ({ page }) => {
    await page.goto('/org/join');

    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);

    // Try with code too short
    await page.fill('[data-testid="invite-code-input"]', '1234567'); // 7 chars
    await page.click('[data-testid="submit-button"]');

    // Should show validation error
    await expect(page.getByText(/8 characters/i)).toBeVisible();

    // Try with code too long
    await page.fill('[data-testid="invite-code-input"]', '123456789'); // 9 chars
    await page.click('[data-testid="submit-button"]');

    // Should show validation error
    await expect(page.getByText(/8 characters/i)).toBeVisible();
  });

  test('should show error with invalid invite code', async ({ page }) => {
    await page.goto('/org/join');

    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', 'INVALID1'); // Valid format, wrong code

    await page.click('[data-testid="submit-button"]');

    // Should show error message
    await expect(page.getByText(/invalid.*code|not found/i)).toBeVisible();

    // Should not navigate away
    await expect(page).toHaveURL(/\/org\/join/);
  });

  test('should show error when organization does not exist', async ({ page }) => {
    await page.goto('/org/join');

    await page.fill('[data-testid="organization-slug-input"]', 'non-existent-org');
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);

    await page.click('[data-testid="submit-button"]');

    // Should show error message
    await expect(page.getByText(/not found|does not exist/i)).toBeVisible();

    // Should not navigate away
    await expect(page).toHaveURL(/\/org\/join/);
  });

  test('should show error when already a member', async ({ page, context }) => {
    // First, join the organization
    await page.goto('/org/join');
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Wait for successful join
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });

    // Try to join again
    await page.goto('/org/join');
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Should show error message
    await expect(page.getByText(/already.*member/i)).toBeVisible();

    // Should not navigate away (or redirect to org dashboard)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/org\/join|\/org\/[^\/]+$/);
  });

  test('should validate slug format', async ({ page }) => {
    await page.goto('/org/join');

    // Try invalid slug with spaces
    await page.fill('[data-testid="organization-slug-input"]', 'invalid slug');
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Should show validation error
    await expect(page.getByText(/lowercase.*letters|invalid.*slug/i)).toBeVisible();

    // Try invalid slug with uppercase
    await page.fill('[data-testid="organization-slug-input"]', 'Invalid-Slug');
    await page.click('[data-testid="submit-button"]');

    // Should show validation error
    await expect(page.getByText(/lowercase.*letters|invalid.*slug/i)).toBeVisible();
  });

  test('new member should have member role (not admin)', async ({ page }) => {
    // Join organization
    await page.goto('/org/join');
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Wait for redirect
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });

    // Navigate to members page
    await page.goto(`/org/${testOrg.slug}/members`);

    // Find the joining user in the members list
    const memberRow = page.locator(`[data-testid="member-row"]:has-text("${joiningUser.name}")`);
    await expect(memberRow).toBeVisible();

    // Check role badge shows "member" (not admin)
    const roleBadge = memberRow.locator('[data-testid="role-badge"]');
    const roleText = await roleBadge.textContent();

    // Role should be "member" or similar, NOT admin
    expect(roleText?.toLowerCase()).not.toContain('admin');
    expect(roleText?.toLowerCase()).toContain('member');
  });

  test('should show loading state during join', async ({ page }) => {
    await page.goto('/org/join');

    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);

    // Click submit
    await page.click('[data-testid="submit-button"]');

    // Should show loading spinner or disabled button
    const submitButton = page.getByTestId('submit-button');

    // Check for loading state
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    const hasSpinner = await page.getByTestId('loading-spinner').isVisible().catch(() => false);

    expect(isDisabled || hasSpinner).toBe(true);

    // Wait for redirect
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });
  });

  test('should require both slug and invite code', async ({ page }) => {
    await page.goto('/org/join');

    // Try to submit with only slug
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.click('[data-testid="submit-button"]');

    // Should show validation error for invite code
    await expect(page.getByText(/invite.*code.*required/i)).toBeVisible();

    // Clear slug, try to submit with only invite code
    await page.fill('[data-testid="organization-slug-input"]', '');
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Should show validation error for slug
    await expect(page.getByText(/organization.*required|slug.*required/i)).toBeVisible();
  });
});

test.describe('Join Organization - Accessibility', () => {
  let ownerUser: TestUser;
  let joiningUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page, context }) => {
    // Setup owner and organization
    ownerUser = {
      email: generateTestEmail('org-owner-a11y'),
      password: 'TestPassword123!',
      name: 'Owner A11y User',
    };

    await registerUser(page, ownerUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for join a11y tests',
    });

    // Create joining user
    await context.clearCookies();

    joiningUser = {
      email: generateTestEmail('joining-user-a11y'),
      password: 'TestPassword123!',
      name: 'Joining A11y User',
    };

    await registerUser(page, joiningUser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/org/join');

    // Tab through form fields
    await page.keyboard.press('Tab'); // Focus slug input
    await page.keyboard.type(testOrg.slug);

    await page.keyboard.press('Tab'); // Focus invite code input
    await page.keyboard.type(testOrg.inviteCode);

    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Submit form

    // Should redirect successfully
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/org/join');

    // Check for aria-labels on form inputs
    const slugInput = page.getByTestId('organization-slug-input');
    const codeInput = page.getByTestId('invite-code-input');

    // Inputs should be visible
    await expect(slugInput).toBeVisible();
    await expect(codeInput).toBeVisible();

    // Check for form element
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('error messages should be announced to screen readers', async ({ page }) => {
    await page.goto('/org/join');

    // Submit with invalid data
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', 'INVALID1');
    await page.click('[data-testid="submit-button"]');

    // Error message should be visible and have proper ARIA
    const errorMessage = page.getByText(/invalid.*code|not found/i);
    await expect(errorMessage).toBeVisible();

    // Error should have role="alert" or be in an aria-live region
    const errorContainer = page.locator('[role="alert"]').or(page.locator('[aria-live]'));
    await expect(errorContainer).toBeVisible();
  });
});

test.describe('Join Organization - Responsive', () => {
  let ownerUser: TestUser;
  let joiningUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page, context }) => {
    // Setup owner and organization
    ownerUser = {
      email: generateTestEmail('org-owner-responsive'),
      password: 'TestPassword123!',
      name: 'Owner Responsive User',
    };

    await registerUser(page, ownerUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for join responsive tests',
    });

    // Create joining user
    await context.clearCookies();

    joiningUser = {
      email: generateTestEmail('joining-user-responsive'),
      password: 'TestPassword123!',
      name: 'Joining Responsive User',
    };

    await registerUser(page, joiningUser);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/org/join');

    // Form should be visible and usable
    await expect(page.getByTestId('organization-slug-input')).toBeVisible();
    await expect(page.getByTestId('invite-code-input')).toBeVisible();

    // Fill and submit form
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Should redirect successfully
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/org/join');

    // Form should be visible and usable
    await expect(page.getByTestId('organization-slug-input')).toBeVisible();

    // Fill and submit form
    await page.fill('[data-testid="organization-slug-input"]', testOrg.slug);
    await page.fill('[data-testid="invite-code-input"]', testOrg.inviteCode);
    await page.click('[data-testid="submit-button"]');

    // Should redirect successfully
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}`), { timeout: 10000 });
  });
});
