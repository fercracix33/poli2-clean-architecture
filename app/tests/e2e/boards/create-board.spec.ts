/**
 * Create Board E2E Tests
 *
 * Tests complete user workflow for creating boards from projects.
 * Validates board creation, default columns, and navigation.
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { test, expect } from '@playwright/test';

test.describe('Create Board Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates board from project page', async ({ page }) => {
    // Navigate to project
    await page.goto('/dashboard/projects/proj-1');
    await expect(page.locator('[data-testid="project-view"]')).toBeVisible();

    // Click create board button
    await page.click('[data-testid="create-board"]');

    // Fill board form
    await expect(page.locator('[data-testid="create-board-modal"]')).toBeVisible();
    await page.fill('[data-testid="board-name"]', 'Sprint 24');
    await page.fill('[data-testid="board-description"]', 'Board for sprint 24');

    // Submit
    await page.click('[data-testid="submit-board"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Board created');

    // Verify board appears in list
    await expect(page.locator('[data-testid="board-list"]')).toContainText('Sprint 24');
  });

  test('creates board with default columns', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    // Create board
    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'New Board');
    await page.click('[data-testid="submit-board"]');

    // Navigate to board
    await page.click('[data-testid="board-list"] [data-board-name="New Board"]');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Verify default columns exist
    await expect(page.locator('[data-column-name="To Do"]')).toBeVisible();
    await expect(page.locator('[data-column-name="In Progress"]')).toBeVisible();
    await expect(page.locator('[data-column-name="Done"]')).toBeVisible();

    // Verify columns in correct order
    const columns = page.locator('[data-testid="column"]');
    await expect(columns).toHaveCount(3);
    await expect(columns.nth(0)).toContainText('To Do');
    await expect(columns.nth(1)).toContainText('In Progress');
    await expect(columns.nth(2)).toContainText('Done');
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');

    // Try to submit without name
    await page.click('[data-testid="submit-board"]');

    // Verify validation error
    await expect(page.locator('[data-testid="error-board-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-board-name"]')).toContainText('required');

    // Board should not be created
    await expect(page.locator('[data-testid="create-board-modal"]')).toBeVisible();
  });

  test('validates minimum name length', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'ab'); // Too short

    await page.click('[data-testid="submit-board"]');

    await expect(page.locator('[data-testid="error-board-name"]')).toContainText('at least 3');
  });

  test('navigates to board after creation', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'Sprint 25');
    await page.click('[data-testid="submit-board"]');

    // Should auto-navigate to board
    await page.waitForURL(/\/dashboard\/boards\/[a-z0-9-]+/);

    // Verify board view loaded
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="board-title"]')).toContainText('Sprint 25');
  });

  test('shows loading state during creation', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'Sprint 26');

    const submitButton = page.locator('[data-testid="submit-board"]');
    await submitButton.click();

    // Verify loading state
    await expect(submitButton).toBeDisabled();
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('allows optional description', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'Backlog');
    // Leave description empty
    await page.click('[data-testid="submit-board"]');

    // Should succeed
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('cancels board creation', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'Cancelled Board');

    // Cancel instead of submit
    await page.click('[data-testid="cancel-board"]');

    // Modal should close
    await expect(page.locator('[data-testid="create-board-modal"]')).not.toBeVisible();

    // Board should not be created
    await expect(page.locator('[data-testid="board-list"]')).not.toContainText('Cancelled Board');
  });

  test('keyboard shortcut to create board', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    // Press Ctrl+N (or Cmd+N on Mac)
    await page.keyboard.press('Control+n');

    // Modal should open
    await expect(page.locator('[data-testid="create-board-modal"]')).toBeVisible();

    // Focus should be on name input
    await expect(page.locator('[data-testid="board-name"]')).toBeFocused();
  });

  test('escape key closes modal', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await expect(page.locator('[data-testid="create-board-modal"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('[data-testid="create-board-modal"]')).not.toBeVisible();
  });

  test('enter key submits form', async ({ page }) => {
    await page.goto('/dashboard/projects/proj-1');

    await page.click('[data-testid="create-board"]');
    await page.fill('[data-testid="board-name"]', 'Quick Board');

    // Press Enter
    await page.keyboard.press('Enter');

    // Should submit and show success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});

test.describe('Create Board Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/projects/proj-1');
  });

  test('modal has proper ARIA attributes', async ({ page }) => {
    await page.click('[data-testid="create-board"]');

    const modal = page.locator('[data-testid="create-board-modal"]');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-labelledby');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('form inputs have labels', async ({ page }) => {
    await page.click('[data-testid="create-board"]');

    const nameInput = page.locator('[data-testid="board-name"]');
    await expect(nameInput).toHaveAttribute('aria-label');

    const descInput = page.locator('[data-testid="board-description"]');
    await expect(descInput).toHaveAttribute('aria-label');
  });

  test('error messages are announced', async ({ page }) => {
    await page.click('[data-testid="create-board"]');
    await page.click('[data-testid="submit-board"]');

    const errorMessage = page.locator('[data-testid="error-board-name"]');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
    await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
  });

  test('keyboard navigation through form', async ({ page }) => {
    await page.click('[data-testid="create-board"]');

    // Tab through fields
    await page.keyboard.press('Tab'); // Name input
    await expect(page.locator('[data-testid="board-name"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Description
    await expect(page.locator('[data-testid="board-description"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Submit button
    await expect(page.locator('[data-testid="submit-board"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Cancel button
    await expect(page.locator('[data-testid="cancel-board"]')).toBeFocused();
  });
});
