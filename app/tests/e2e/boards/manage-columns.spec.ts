/**
 * Manage Columns E2E Tests
 *
 * Tests complete user workflow for managing board columns.
 * Validates creating, editing, and deleting columns.
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { test, expect } from '@playwright/test';

test.describe('Manage Columns Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-1');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();
  });

  test('creates new column', async ({ page }) => {
    // Click add column button
    await page.click('[data-testid="add-column"]');

    // Fill column form
    await expect(page.locator('[data-testid="column-form"]')).toBeVisible();
    await page.fill('[data-testid="column-name"]', 'In Review');
    await page.click('[data-testid="color-picker"]');
    await page.click('[data-color="#8b5cf6"]'); // Purple

    // Submit
    await page.click('[data-testid="save-column"]');

    // Verify column appears
    await expect(page.locator('[data-column-name="In Review"]')).toBeVisible();

    // Verify correct color applied
    const column = page.locator('[data-column-name="In Review"]');
    await expect(column).toHaveCSS('background-color', 'rgb(139, 92, 246)');
  });

  test('updates column name', async ({ page }) => {
    // Open column menu
    const column = page.locator('[data-column-name="To Do"]');
    await column.locator('[data-testid="column-menu"]').click();

    // Click edit
    await page.click('[data-testid="edit-column"]');

    // Update name
    await page.fill('[data-testid="column-name"]', 'Backlog');
    await page.click('[data-testid="save-column"]');

    // Verify updated
    await expect(page.locator('[data-column-name="Backlog"]')).toBeVisible();
    await expect(page.locator('[data-column-name="To Do"]')).not.toBeVisible();
  });

  test('updates column color', async ({ page }) => {
    const column = page.locator('[data-column-name="In Progress"]');
    await column.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="edit-column"]');

    // Change color
    await page.click('[data-testid="color-picker"]');
    await page.click('[data-color="#ef4444"]'); // Red
    await page.click('[data-testid="save-column"]');

    // Verify color changed
    await expect(column).toHaveCSS('background-color', 'rgb(239, 68, 68)');
  });

  test('sets WIP limit on column', async ({ page }) => {
    const column = page.locator('[data-column-name="In Progress"]');
    await column.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="edit-column"]');

    // Set WIP limit
    await page.fill('[data-testid="wip-limit"]', '5');
    await page.click('[data-testid="save-column"]');

    // Verify WIP indicator appears
    await expect(column.locator('[data-testid="wip-indicator"]')).toBeVisible();
    await expect(column.locator('[data-testid="wip-indicator"]')).toContainText('/5');
  });

  test('removes WIP limit', async ({ page }) => {
    // Assume column already has WIP limit
    const column = page.locator('[data-column-name="In Progress"]');
    await expect(column.locator('[data-testid="wip-indicator"]')).toBeVisible();

    await column.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="edit-column"]');

    // Clear WIP limit
    await page.fill('[data-testid="wip-limit"]', '');
    await page.click('[data-testid="save-column"]');

    // Verify indicator shows unlimited
    await expect(column.locator('[data-testid="wip-indicator"]')).toContainText('∞');
  });

  test('deletes empty column', async ({ page }) => {
    // Create new column to delete
    await page.click('[data-testid="add-column"]');
    await page.fill('[data-testid="column-name"]', 'Temporary');
    await page.click('[data-testid="save-column"]');

    // Delete it
    const column = page.locator('[data-column-name="Temporary"]');
    await column.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="delete-column"]');

    // Confirm deletion
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete"]');

    // Verify column removed
    await expect(column).not.toBeVisible();
  });

  test('prevents deleting column with tasks', async ({ page }) => {
    // Try to delete column with tasks
    const column = page.locator('[data-column-name="To Do"]');
    await column.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="delete-column"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('has tasks');

    // Column should still exist
    await expect(column).toBeVisible();
  });

  test('validates minimum column name length', async ({ page }) => {
    await page.click('[data-testid="add-column"]');
    await page.fill('[data-testid="column-name"]', 'a'); // Too short

    await page.click('[data-testid="save-column"]');

    // Verify validation error
    await expect(page.locator('[data-testid="error-column-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-column-name"]')).toContainText('at least 2');
  });

  test('prevents duplicate column names', async ({ page }) => {
    await page.click('[data-testid="add-column"]');
    await page.fill('[data-testid="column-name"]', 'To Do'); // Already exists

    await page.click('[data-testid="save-column"]');

    // Verify error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('already exists');
  });

  test('shows column count in header', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');

    // Verify count displayed
    const countIndicator = column.locator('[data-testid="task-count"]');
    await expect(countIndicator).toBeVisible();
    await expect(countIndicator).toContainText(/\d+/); // Contains number
  });

  test('cancels column creation', async ({ page }) => {
    await page.click('[data-testid="add-column"]');
    await page.fill('[data-testid="column-name"]', 'Cancelled');

    // Cancel instead of save
    await page.click('[data-testid="cancel-column"]');

    // Verify form closed
    await expect(page.locator('[data-testid="column-form"]')).not.toBeVisible();

    // Column not created
    await expect(page.locator('[data-column-name="Cancelled"]')).not.toBeVisible();
  });

  test('inline editing of column name', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');

    // Double click column header
    await column.locator('[data-testid="column-header"]').dblclick();

    // Inline input should appear
    await expect(column.locator('[data-testid="inline-edit-input"]')).toBeVisible();
    await expect(column.locator('[data-testid="inline-edit-input"]')).toBeFocused();

    // Edit name
    await page.fill('[data-testid="inline-edit-input"]', 'Ready');
    await page.keyboard.press('Enter');

    // Verify updated
    await expect(page.locator('[data-column-name="Ready"]')).toBeVisible();
  });

  test('escape key cancels inline editing', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');
    await column.locator('[data-testid="column-header"]').dblclick();

    await page.fill('[data-testid="inline-edit-input"]', 'Changed');

    // Press Escape
    await page.keyboard.press('Escape');

    // Original name preserved
    await expect(page.locator('[data-column-name="To Do"]')).toBeVisible();
    await expect(page.locator('[data-column-name="Changed"]')).not.toBeVisible();
  });
});

test.describe('Column Management Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-1');
  });

  test('column menu accessible via keyboard', async ({ page }) => {
    // Tab to column
    await page.keyboard.press('Tab');

    // Open menu with keyboard
    await page.keyboard.press('Space');

    // Menu should open
    await expect(page.locator('[data-testid="column-menu-dropdown"]')).toBeVisible();

    // Navigate menu items
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  });

  test('color picker has ARIA labels', async ({ page }) => {
    await page.click('[data-testid="add-column"]');
    await page.click('[data-testid="color-picker"]');

    const colorOptions = page.locator('[data-testid="color-option"]');
    const firstColor = colorOptions.first();

    await expect(firstColor).toHaveAttribute('aria-label');
    await expect(firstColor).toHaveAttribute('role', 'button');
  });

  test('deletion confirmation is announced', async ({ page }) => {
    await page.click('[data-testid="add-column"]');
    await page.fill('[data-testid="column-name"]', 'Test');
    await page.click('[data-testid="save-column"]');

    const column = page.locator('[data-column-name="Test"]');
    await column.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="delete-column"]');

    const confirmation = page.locator('[data-testid="delete-confirmation"]');
    await expect(confirmation).toHaveAttribute('role', 'alertdialog');
    await expect(confirmation).toHaveAttribute('aria-modal', 'true');
  });

  test('WIP limit input has proper label', async ({ page }) => {
    await page.click('[data-testid="add-column"]');

    const wipInput = page.locator('[data-testid="wip-limit"]');
    await expect(wipInput).toHaveAttribute('aria-label');
    await expect(wipInput).toHaveAttribute('type', 'number');
  });
});
