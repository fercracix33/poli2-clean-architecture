/**
 * Drag & Drop Columns E2E Tests
 *
 * Tests complete user workflow for reordering columns via drag & drop.
 * Validates visual feedback, persistence, and accessibility.
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { test, expect } from '@playwright/test';

test.describe('Column Drag & Drop Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-1');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();
  });

  test('reorders columns via drag and drop', async ({ page }) => {
    // Initial order: To Do, In Progress, Done
    const columns = page.locator('[data-testid="column"]');
    await expect(columns.nth(0)).toContainText('To Do');
    await expect(columns.nth(1)).toContainText('In Progress');
    await expect(columns.nth(2)).toContainText('Done');

    // Drag "Done" to first position
    const doneColumn = page.locator('[data-column-name="Done"]');
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await doneColumn.dragTo(toDoColumn);

    // Wait for reorder animation
    await page.waitForTimeout(500);

    // Verify new order: Done, To Do, In Progress
    await expect(columns.nth(0)).toContainText('Done');
    await expect(columns.nth(1)).toContainText('To Do');
    await expect(columns.nth(2)).toContainText('In Progress');
  });

  test('shows visual feedback during drag', async ({ page }) => {
    const doneColumn = page.locator('[data-column-name="Done"]');

    // Start dragging
    await doneColumn.hover();
    await page.mouse.down();

    // Column should have dragging state
    await expect(doneColumn).toHaveClass(/dragging|is-dragging/);

    // Cancel drag
    await page.mouse.up();
  });

  test('shows drop indicator between columns', async ({ page }) => {
    const progressColumn = page.locator('[data-column-name="In Progress"]');
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    // Start dragging In Progress
    await progressColumn.hover();
    await page.mouse.down();

    // Hover over To Do
    await toDoColumn.hover();

    // Drop indicator should appear
    await expect(page.locator('[data-testid="drop-indicator"]')).toBeVisible();

    await page.mouse.up();
  });

  test('persists column order after page reload', async ({ page }) => {
    // Reorder columns
    const doneColumn = page.locator('[data-column-name="Done"]');
    const toDoColumn = page.locator('[data-column-name="To Do"]');
    await doneColumn.dragTo(toDoColumn);

    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Verify order persisted
    const columns = page.locator('[data-testid="column"]');
    await expect(columns.nth(0)).toContainText('Done');
    await expect(columns.nth(1)).toContainText('To Do');
  });

  test('prevents invalid drop zones', async ({ page }) => {
    const progressColumn = page.locator('[data-column-name="In Progress"]');

    await progressColumn.hover();
    await page.mouse.down();

    // Try to drop outside board area
    await page.mouse.move(0, 0);

    // Should show blocked cursor or invalid state
    await expect(page.locator('body')).toHaveClass(/no-drop|not-allowed/);

    await page.mouse.up();

    // Column should remain in original position
    const columns = page.locator('[data-testid="column"]');
    await expect(columns.nth(1)).toContainText('In Progress');
  });

  test('handles rapid column reordering', async ({ page }) => {
    const columns = page.locator('[data-testid="column"]');

    // Rapidly reorder multiple times
    await columns.nth(2).dragTo(columns.nth(0)); // Done -> first
    await page.waitForTimeout(300);

    await columns.nth(1).dragTo(columns.nth(2)); // Swap middle
    await page.waitForTimeout(300);

    await columns.nth(0).dragTo(columns.nth(2)); // First -> last
    await page.waitForTimeout(500);

    // Verify final state is consistent
    const finalOrder = await columns.allTextContents();
    expect(finalOrder).toHaveLength(3);
    expect(new Set(finalOrder).size).toBe(3); // No duplicates
  });

  test('shows drag handle on column header', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');

    // Hover over column
    await column.hover();

    // Drag handle should appear
    await expect(column.locator('[data-testid="drag-handle"]')).toBeVisible();

    // Should have cursor: grab
    await expect(column.locator('[data-testid="drag-handle"]')).toHaveCSS('cursor', 'grab');
  });

  test('drag handle changes to grabbing during drag', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');
    const dragHandle = column.locator('[data-testid="drag-handle"]');

    await dragHandle.hover();
    await page.mouse.down();

    // Cursor should change to grabbing
    await expect(dragHandle).toHaveCSS('cursor', 'grabbing');

    await page.mouse.up();
  });

  test('cancels drag with escape key', async ({ page }) => {
    const columns = page.locator('[data-testid="column"]');
    const initialOrder = await columns.allTextContents();

    const doneColumn = page.locator('[data-column-name="Done"]');
    await doneColumn.hover();
    await page.mouse.down();

    // Move column
    await page.mouse.move(100, 0);

    // Press Escape
    await page.keyboard.press('Escape');

    // Column should return to original position
    const finalOrder = await columns.allTextContents();
    expect(finalOrder).toEqual(initialOrder);
  });

  test('displays column count during drag', async ({ page }) => {
    const progressColumn = page.locator('[data-column-name="In Progress"]');

    await progressColumn.hover();
    await page.mouse.down();

    // Task count should still be visible
    await expect(progressColumn.locator('[data-testid="task-count"]')).toBeVisible();

    await page.mouse.up();
  });

  test('preserves column width during reorder', async ({ page }) => {
    const progressColumn = page.locator('[data-column-name="In Progress"]');

    // Get initial width
    const initialWidth = await progressColumn.evaluate((el) => el.clientWidth);

    // Reorder
    const toDoColumn = page.locator('[data-column-name="To Do"]');
    await progressColumn.dragTo(toDoColumn);
    await page.waitForTimeout(500);

    // Verify width unchanged
    const finalWidth = await progressColumn.evaluate((el) => el.clientWidth);
    expect(finalWidth).toBe(initialWidth);
  });

  test('smooth animation during reorder', async ({ page }) => {
    const doneColumn = page.locator('[data-column-name="Done"]');
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await doneColumn.dragTo(toDoColumn);

    // Should have transition CSS property
    await expect(doneColumn).toHaveCSS('transition', /transform/);
  });
});

test.describe('Column Drag & Drop Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-1');
  });

  test('keyboard navigation for reordering', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');

    // Focus column
    await column.focus();

    // Press Space to grab
    await page.keyboard.press('Space');

    // Move with arrow keys
    await page.keyboard.press('ArrowRight');

    // Press Space to drop
    await page.keyboard.press('Space');

    // Verify order changed
    const columns = page.locator('[data-testid="column"]');
    await expect(columns.nth(1)).toContainText('To Do');
  });

  test('screen reader announces drag state', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');

    await column.focus();
    await page.keyboard.press('Space');

    // Should have aria-grabbed
    await expect(column).toHaveAttribute('aria-grabbed', 'true');

    await page.keyboard.press('Space'); // Drop

    await expect(column).toHaveAttribute('aria-grabbed', 'false');
  });

  test('drag handle has ARIA label', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');
    const dragHandle = column.locator('[data-testid="drag-handle"]');

    await expect(dragHandle).toHaveAttribute('aria-label', /drag|reorder/i);
    await expect(dragHandle).toHaveAttribute('role', 'button');
  });

  test('live region announces reorder completion', async ({ page }) => {
    const doneColumn = page.locator('[data-column-name="Done"]');
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await doneColumn.dragTo(toDoColumn);
    await page.waitForTimeout(500);

    // Live region should announce
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/moved|reordered/i);
  });

  test('focus remains on column after drop', async ({ page }) => {
    const column = page.locator('[data-column-name="To Do"]');

    await column.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');

    // Focus should remain on column
    await expect(column).toBeFocused();
  });

  test('drag handle is keyboard accessible', async ({ page }) => {
    const dragHandle = page.locator('[data-testid="drag-handle"]').first();

    // Tab to drag handle
    await page.keyboard.press('Tab');

    // Should be focusable
    await expect(dragHandle).toBeFocused();

    // Space or Enter should activate
    await page.keyboard.press('Space');

    // Should enter drag mode
    const column = page.locator('[data-testid="column"]').first();
    await expect(column).toHaveAttribute('aria-grabbed', 'true');
  });
});
