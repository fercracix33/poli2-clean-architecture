/**
 * WIP Limits E2E Tests
 *
 * Tests complete user workflow for Work In Progress limits enforcement.
 * Validates drag & drop restrictions, real-time count updates, and visual indicators.
 *
 * CRITICAL TEST: Core Kanban feature - MUST work correctly.
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { test, expect } from '@playwright/test';

test.describe('WIP Limits Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('prevents drag when WIP limit reached', async ({ page }) => {
    // Navigate to board with WIP limits configured
    await page.goto('/dashboard/boards/board-wip-test');

    // Wait for board to load
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Verify column has WIP limit indicator
    const progressColumn = page.locator('[data-column-id="col-in-progress"]');
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('2/2'); // At limit

    // Try to drag 3rd task into column
    const taskCard = page.locator('[data-task-id="task-todo-1"]');
    await taskCard.dragTo(progressColumn);

    // Verify error message appears
    await expect(page.locator('[data-testid="wip-limit-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="wip-limit-error"]'))
      .toContainText('WIP limit exceeded');

    // Verify task was NOT moved
    const todoColumn = page.locator('[data-column-id="col-to-do"]');
    await expect(todoColumn.locator('[data-task-id="task-todo-1"]'))
      .toBeVisible();
  });

  test('allows drag when WIP limit not reached', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const progressColumn = page.locator('[data-column-id="col-in-progress"]');

    // Remove one task first to make room
    const existingTask = progressColumn.locator('[data-task-id="task-progress-1"]');
    const todoColumn = page.locator('[data-column-id="col-to-do"]');
    await existingTask.dragTo(todoColumn);

    // Wait for update
    await page.waitForTimeout(500);

    // Now WIP should be 1/2
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('1/2');

    // Try to drag new task
    const newTask = page.locator('[data-task-id="task-todo-1"]');
    await newTask.dragTo(progressColumn);

    // Wait for update
    await page.waitForTimeout(500);

    // Should succeed - task is now in progress column
    await expect(progressColumn.locator('[data-task-id="task-todo-1"]'))
      .toBeVisible();

    // WIP should now be 2/2
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('2/2');
  });

  test('shows WIP count in column header', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const progressColumn = page.locator('[data-column-id="col-in-progress"]');
    const wipIndicator = progressColumn.locator('[data-testid="wip-indicator"]');

    await expect(wipIndicator).toBeVisible();
    await expect(wipIndicator).toContainText('/'); // Format: "2/3"

    // Verify it's in the column header
    const columnHeader = progressColumn.locator('[data-testid="column-header"]');
    await expect(columnHeader).toContainText('/');
  });

  test('allows unlimited tasks when wip_limit is null', async ({ page }) => {
    await page.goto('/dashboard/boards/board-unlimited');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const backlogColumn = page.locator('[data-column-id="col-backlog"]');

    // Column should show "∞" or no limit indicator
    const wipIndicator = backlogColumn.locator('[data-testid="wip-indicator"]');
    await expect(wipIndicator).toContainText('∞');

    // Drag multiple tasks - all should succeed
    for (let i = 1; i <= 5; i++) {
      const task = page.locator(`[data-task-id="task-${i}"]`);
      await task.dragTo(backlogColumn);
      await page.waitForTimeout(300); // Wait for animation

      await expect(backlogColumn.locator(`[data-task-id="task-${i}"]`))
        .toBeVisible();
    }

    // Verify count shows "5/∞"
    await expect(wipIndicator).toContainText('5/∞');
  });

  test('updates WIP count in real-time during drag', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const progressColumn = page.locator('[data-column-id="col-in-progress"]');
    const wipIndicator = progressColumn.locator('[data-testid="wip-indicator"]');

    // Initial count
    await expect(wipIndicator).toContainText('2/2');

    // Drag task OUT of column
    const task = progressColumn.locator('[data-task-id="task-progress-1"]');
    const doneColumn = page.locator('[data-column-id="col-done"]');
    await task.dragTo(doneColumn);

    // Wait for update
    await page.waitForTimeout(500);

    // Count should decrease
    await expect(wipIndicator).toContainText('1/2');

    // Verify task is in done column
    await expect(doneColumn.locator('[data-task-id="task-progress-1"]'))
      .toBeVisible();
  });

  test('shows visual warning when approaching WIP limit', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const progressColumn = page.locator('[data-column-id="col-in-progress"]');

    // At limit (2/2) - should show red/warning state
    const wipIndicator = progressColumn.locator('[data-testid="wip-indicator"]');
    await expect(wipIndicator).toHaveClass(/warning|danger|red/);

    // Move task out to get to 1/2
    const task = progressColumn.locator('[data-task-id="task-progress-1"]');
    const todoColumn = page.locator('[data-column-id="col-to-do"]');
    await task.dragTo(todoColumn);
    await page.waitForTimeout(500);

    // Should no longer show warning state
    await expect(wipIndicator).not.toHaveClass(/warning|danger|red/);
  });

  test('blocks drag with visual feedback before drop', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const progressColumn = page.locator('[data-column-id="col-in-progress"]');

    // Column is at limit (2/2)
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('2/2');

    // Start dragging task
    const taskCard = page.locator('[data-task-id="task-todo-1"]');
    await taskCard.hover();
    await page.mouse.down();

    // Hover over progress column
    await progressColumn.hover();

    // Column should show "blocked" visual state
    await expect(progressColumn).toHaveClass(/blocked|disabled|wip-exceeded/);

    // Cancel drag
    await page.mouse.up();
  });

  test('allows override of WIP limit with confirmation', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-override');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    const progressColumn = page.locator('[data-column-id="col-in-progress"]');

    // Column at limit
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('2/2');

    // Drag task while holding modifier key (Shift)
    const taskCard = page.locator('[data-task-id="task-todo-1"]');
    await page.keyboard.down('Shift');
    await taskCard.dragTo(progressColumn);
    await page.keyboard.up('Shift');

    // Confirmation dialog should appear
    await expect(page.locator('[data-testid="wip-override-dialog"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="wip-override-dialog"]'))
      .toContainText('Exceed WIP limit?');

    // Confirm override
    await page.click('[data-testid="confirm-override"]');

    // Task should be moved
    await expect(progressColumn.locator('[data-task-id="task-todo-1"]'))
      .toBeVisible();

    // WIP count should show exceeded (3/2)
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('3/2');
  });

  test('keyboard navigation respects WIP limits', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Focus on task card
    const taskCard = page.locator('[data-task-id="task-todo-1"]');
    await taskCard.focus();

    // Try to move with keyboard (Ctrl + Arrow Right)
    await page.keyboard.press('Control+ArrowRight');

    // Should show error message
    await expect(page.locator('[data-testid="wip-limit-error"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="wip-limit-error"]'))
      .toContainText('WIP limit exceeded');

    // Task should remain in original column
    const todoColumn = page.locator('[data-column-id="col-to-do"]');
    await expect(todoColumn.locator('[data-task-id="task-todo-1"]'))
      .toBeVisible();
  });

  test('displays WIP limit in column settings', async ({ page }) => {
    await page.goto('/dashboard/boards/board-wip-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Open column settings
    const progressColumn = page.locator('[data-column-id="col-in-progress"]');
    await progressColumn.locator('[data-testid="column-menu"]').click();
    await page.click('[data-testid="edit-column"]');

    // Verify WIP limit field is visible
    await expect(page.locator('[data-testid="wip-limit-input"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="wip-limit-input"]'))
      .toHaveValue('2');

    // Update WIP limit
    await page.fill('[data-testid="wip-limit-input"]', '5');
    await page.click('[data-testid="save-column"]');

    // Verify indicator updates
    await expect(progressColumn.locator('[data-testid="wip-indicator"]'))
      .toContainText('2/5');
  });
});

test.describe('WIP Limits Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-wip-test');
  });

  test('WIP indicator has proper ARIA labels', async ({ page }) => {
    const progressColumn = page.locator('[data-column-id="col-in-progress"]');
    const wipIndicator = progressColumn.locator('[data-testid="wip-indicator"]');

    await expect(wipIndicator).toHaveAttribute('aria-label', /work in progress/i);
    await expect(wipIndicator).toHaveAttribute('role', 'status');
  });

  test('screen reader announces WIP limit violations', async ({ page }) => {
    const progressColumn = page.locator('[data-column-id="col-in-progress"]');

    // Try to exceed limit
    const taskCard = page.locator('[data-task-id="task-todo-1"]');
    await taskCard.dragTo(progressColumn);

    // Error message should have aria-live region
    const errorMessage = page.locator('[data-testid="wip-limit-error"]');
    await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('keyboard users can view WIP limit info', async ({ page }) => {
    const progressColumn = page.locator('[data-column-id="col-in-progress"]');

    // Tab to column header
    await page.keyboard.press('Tab');

    // Focus should be on column
    await expect(progressColumn.locator('[data-testid="column-header"]'))
      .toBeFocused();

    // Press 'i' for info (or another keyboard shortcut)
    await page.keyboard.press('i');

    // Tooltip should appear with WIP info
    await expect(page.locator('[data-testid="wip-info-tooltip"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="wip-info-tooltip"]'))
      .toContainText('Work In Progress limit: 2');
  });
});
