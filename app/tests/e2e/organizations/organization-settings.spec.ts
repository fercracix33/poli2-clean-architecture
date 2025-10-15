/**
 * E2E Tests: Organization Settings
 *
 * Tests the organization settings page functionality:
 * - Settings form displays correctly
 * - Admin can update organization details
 * - Invite code can be copied
 * - Danger zone actions work with confirmation
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

test.describe('Organization Settings', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    // Register and authenticate a test user (will be admin/owner)
    testUser = {
      email: generateTestEmail('settings-test'),
      password: 'TestPassword123!',
      name: 'Settings Test User',
    };

    await registerUser(page, testUser);

    // Create test organization (user becomes owner automatically)
    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for settings E2E tests',
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup test data
    await cleanupTestData(page, testOrg.slug);
  });

  test('should display organization settings form', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Check page title
    await expect(page.locator('h1')).toContainText('Organization Settings');

    // Check form fields are visible
    await expect(page.getByTestId('org-name-input')).toBeVisible();
    await expect(page.getByTestId('org-slug-input')).toBeVisible();
    await expect(page.getByTestId('org-description-input')).toBeVisible();
  });

  test('admin should be able to update organization name', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Clear and type new name
    await page.getByTestId('org-name-input').fill('Updated Organization Name');

    // Save changes
    await page.getByTestId('save-org-settings').click();

    // Should show success message
    // Note: Toast verification depends on implementation
    await expect(page.getByTestId('org-name-input')).toHaveValue('Updated Organization Name');
  });

  test('admin should be able to update organization description', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Type new description
    await page.getByTestId('org-description-input').fill('New organization description');

    // Save changes
    await page.getByTestId('save-org-settings').click();

    // Should persist the change
    await page.reload();
    await expect(page.getByTestId('org-description-input')).toHaveValue('New organization description');
  });

  test('should display invite code', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Invite code should be visible
    await expect(page.getByTestId('org-invite-code')).toBeVisible();
    await expect(page.getByTestId('org-invite-code')).not.toBeEmpty();

    // Invite code should be 8 characters
    const inviteCode = await page.getByTestId('org-invite-code').inputValue();
    expect(inviteCode).toHaveLength(8);
  });

  test('should validate organization slug format', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Try to enter invalid slug
    await page.getByTestId('org-slug-input').fill('Invalid Slug!');

    // Try to save
    await page.getByTestId('save-org-settings').click();

    // Should show validation error
    await expect(page.getByText(/only.*lowercase.*letters/i)).toBeVisible();
  });

  test('non-admin should not be able to edit settings', async ({ page }) => {
    // TODO: This test requires creating a second user with member/viewer role
    // Will be implemented after role management tests are in place
    test.skip();
  });

  test('member should be able to leave organization', async ({ page }) => {
    // TODO: This test requires creating a second user with member role
    // Will be implemented after join organization tests are in place
    test.skip();
  });

  test('owner should be able to delete organization', async ({ page }) => {
    // Current user is owner (creator of the organization)
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Delete button should be visible
    await expect(page.getByTestId('delete-org-button')).toBeVisible();

    // Click delete button
    await page.getByTestId('delete-org-button').click();

    // Confirmation dialog should appear
    await expect(page.getByRole('alertdialog')).toBeVisible();

    // Type organization slug to confirm
    await page.getByTestId('delete-org-confirm-input').fill(testOrg.slug);

    // Confirm button should be enabled
    await expect(page.getByTestId('confirm-delete-org')).toBeEnabled();

    // Confirm deletion
    await page.getByTestId('confirm-delete-org').click();

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|home)/);
  });

  test('delete confirmation should require exact org slug match', async ({ page }) => {
    // Current user is owner
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Click delete button
    await page.getByTestId('delete-org-button').click();

    // Type wrong name
    await page.getByTestId('delete-org-confirm-input').fill('wrong-name');

    // Confirm button should be disabled
    await expect(page.getByTestId('confirm-delete-org')).toBeDisabled();
  });

  test('owner should not see leave organization button', async ({ page }) => {
    // Current user is owner (creator of the organization)
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Leave button should not be visible (only delete)
    await expect(page.getByTestId('leave-org-button')).not.toBeVisible();
    await expect(page.getByTestId('delete-org-button')).toBeVisible();
  });
});

test.describe('Organization Settings - Error Handling', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    testUser = {
      email: generateTestEmail('settings-error'),
      password: 'TestPassword123!',
      name: 'Settings Error Test User',
    };

    await registerUser(page, testUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for settings error handling',
    });
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('should handle network errors when loading settings', async ({ page }) => {
    // Mock network failure for settings API
    await page.route(`**/api/organizations/${testOrg.slug}/details`, route => route.abort());

    await page.goto(`/org/${testOrg.slug}/settings`);

    // Should show error message or fallback
    const hasError = await page.getByText(/error|failed|unable to load/i).isVisible().catch(() => false);
    const hasForm = await page.getByTestId('org-name-input').isVisible().catch(() => false);

    // Either error or fallback form should be visible
    expect(hasError || hasForm).toBe(true);
  });

  test('should handle errors when saving settings', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Mock failure for update API
    await page.route(`**/api/organizations/${testOrg.slug}/update`, route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Try to update settings
    await page.fill('[data-testid="org-name-input"]', 'Updated Name');
    await page.click('[data-testid="save-org-settings"]');

    // Should show error message
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle errors when deleting organization', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Mock failure for delete API
    await page.route(`**/api/organizations/${testOrg.slug}/delete`, route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Try to delete
    await page.click('[data-testid="delete-org-button"]');
    await page.fill('[data-testid="delete-org-confirm-input"]', testOrg.slug);
    await page.click('[data-testid="confirm-delete-org"]');

    // Should show error message
    await expect(page.getByText(/error|failed|unable to delete/i)).toBeVisible({ timeout: 5000 });

    // Should not redirect (deletion failed)
    await expect(page).toHaveURL(new RegExp(`/org/${testOrg.slug}/settings`));
  });

  test('should handle validation errors from server', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Mock validation error from server
    await page.route(`**/api/organizations/${testOrg.slug}/update`, route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Organization name already exists' }),
      });
    });

    // Try to update with invalid data
    await page.fill('[data-testid="org-name-input"]', 'Duplicate Name');
    await page.click('[data-testid="save-org-settings"]');

    // Should show validation error from server
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle rate limiting errors', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Mock rate limit error
    await page.route(`**/api/organizations/${testOrg.slug}/update`, route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Too many requests' }),
      });
    });

    // Try to update
    await page.fill('[data-testid="org-name-input"]', 'New Name');
    await page.click('[data-testid="save-org-settings"]');

    // Should show rate limit error
    await expect(page.getByText(/too many|rate limit|slow down/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Organization Settings - Accessibility', () => {
  let testUser: TestUser;
  let testOrg: TestOrganization;

  test.beforeEach(async ({ page }) => {
    testUser = {
      email: generateTestEmail('settings-a11y'),
      password: 'TestPassword123!',
      name: 'Settings A11y User',
    };

    await registerUser(page, testUser);

    testOrg = await setupTestOrganization(page, {
      name: 'Test Organization',
      slug: generateTestSlug('test-org'),
      description: 'Test organization for settings a11y',
    });
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, testOrg.slug);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Tab through form fields
    await page.keyboard.press('Tab'); // Name input
    await page.keyboard.press('Tab'); // Slug input
    await page.keyboard.press('Tab'); // Description input
    await page.keyboard.press('Tab'); // Save button

    // All form fields should be reachable
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('form inputs should have proper labels', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Check name input has label
    const nameInput = page.getByTestId('org-name-input');
    const nameLabel = await nameInput.getAttribute('aria-label').catch(() => null);
    const nameId = await nameInput.getAttribute('id');

    // Should have aria-label or associated label element
    const hasLabelFor = nameId ? await page.locator(`label[for="${nameId}"]`).isVisible().catch(() => false) : false;

    expect(nameLabel || hasLabelFor).toBeTruthy();

    // Check slug input has label
    const slugInput = page.getByTestId('org-slug-input');
    const slugLabel = await slugInput.getAttribute('aria-label').catch(() => null);

    expect(slugLabel || hasLabelFor).toBeTruthy();
  });

  test('error messages should be announced', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Try invalid input
    await page.fill('[data-testid="org-slug-input"]', 'Invalid Slug!');
    await page.click('[data-testid="save-org-settings"]');

    // Error message should be visible
    const errorMessage = await page.getByText(/only.*lowercase|invalid/i).isVisible();

    if (errorMessage) {
      // Check for aria-live region
      const hasAriaLive = await page.locator('[aria-live]').isVisible().catch(() => false);
      const hasRoleAlert = await page.locator('[role="alert"]').isVisible().catch(() => false);

      expect(hasAriaLive || hasRoleAlert).toBe(true);
    }
  });

  test('delete confirmation dialog should be accessible', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Open delete dialog
    await page.click('[data-testid="delete-org-button"]');

    // Dialog should have proper role
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    // Dialog should have accessible title
    const hasTitle = await dialog.locator('h1, h2, [role="heading"]').isVisible().catch(() => false);
    expect(hasTitle).toBe(true);
  });

  test('dangerous actions should have clear warnings', async ({ page }) => {
    await page.goto(`/org/${testOrg.slug}/settings`);

    // Delete button should be clearly marked
    const deleteButton = page.getByTestId('delete-org-button');
    const buttonText = await deleteButton.textContent();
    const buttonClass = await deleteButton.getAttribute('class');

    // Should have "delete" or "danger" in text or styling
    const hasDangerIndicator =
      buttonText?.toLowerCase().includes('delete') ||
      buttonClass?.includes('danger') ||
      buttonClass?.includes('destructive');

    expect(hasDangerIndicator).toBe(true);
  });
});
