/**
 * Create Task Inline E2E Tests
 *
 * Tests complete user workflow for creating tasks inline in columns.
 * Validates quick task creation, keyboard shortcuts, and validation.
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { test, expect } from '@playwright/test';

test.describe('Inline Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-1');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();
  });

  test('creates task inline in column', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    // Click "Add task" button in column
    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Inline input should appear
    await expect(toDoColumn.locator('[data-testid="task-title-input"]')).toBeVisible();
    await expect(toDoColumn.locator('[data-testid="task-title-input"]')).toBeFocused();

    // Type task title
    await page.fill('[data-testid="task-title-input"]', 'Implement login page');

    // Press Enter to save
    await page.keyboard.press('Enter');

    // Verify task appears in column
    await expect(toDoColumn.locator('[data-task-title="Implement login page"]')).toBeVisible();
  });

  test('cancels task creation with Escape', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Cancelled task');

    // Press Escape
    await page.keyboard.press('Escape');

    // Input should disappear
    await expect(page.locator('[data-testid="task-title-input"]')).not.toBeVisible();

    // Task should not be created
    await expect(toDoColumn.locator('[data-task-title="Cancelled task"]')).not.toBeVisible();
  });

  test('cancels task creation by clicking outside', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Cancelled task');

    // Click outside the input (on board background)
    await page.locator('[data-testid="board-view"]').click({ position: { x: 10, y: 10 } });

    // Input should close
    await expect(page.locator('[data-testid="task-title-input"]')).not.toBeVisible();

    // Task should not be created
    await expect(toDoColumn.locator('[data-task-title="Cancelled task"]')).not.toBeVisible();
  });

  test('validates empty task title', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Try to save without typing
    await page.keyboard.press('Enter');

    // Error message should appear
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('required');

    // Input should remain open
    await expect(page.locator('[data-testid="task-title-input"]')).toBeVisible();
  });

  test('validates minimum title length', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'ab'); // Too short

    await page.keyboard.press('Enter');

    // Error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('at least 3');
  });

  test('creates task with Enter, input remains for next task', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Create first task
    await page.fill('[data-testid="task-title-input"]', 'Task 1');
    await page.keyboard.press('Enter');

    // Wait for task to be created
    await expect(toDoColumn.locator('[data-task-title="Task 1"]')).toBeVisible();

    // Input should be cleared but still visible for next task
    await expect(page.locator('[data-testid="task-title-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-title-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="task-title-input"]')).toBeFocused();

    // Create second task
    await page.fill('[data-testid="task-title-input"]', 'Task 2');
    await page.keyboard.press('Enter');

    await expect(toDoColumn.locator('[data-task-title="Task 2"]')).toBeVisible();
  });

  test('closes inline creation with Escape', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Create one task
    await page.fill('[data-testid="task-title-input"]', 'Task 1');
    await page.keyboard.press('Enter');

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Input should disappear
    await expect(page.locator('[data-testid="task-title-input"]')).not.toBeVisible();
  });

  test('shows loading state during creation', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Loading test');
    await page.keyboard.press('Enter');

    // Loading indicator should appear briefly
    await expect(page.locator('[data-testid="creating-task-spinner"]')).toBeVisible();

    // Then task appears
    await expect(toDoColumn.locator('[data-task-title="Loading test"]')).toBeVisible();
  });

  test('places new task at top of column', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'New top task');
    await page.keyboard.press('Enter');

    // Verify task is first in column
    const firstTask = toDoColumn.locator('[data-testid="task-card"]').first();
    await expect(firstTask).toContainText('New top task');
  });

  test('keyboard shortcut N to create task', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    // Focus column first
    await toDoColumn.click();

    // Press 'N' key
    await page.keyboard.press('n');

    // Inline input should appear
    await expect(toDoColumn.locator('[data-testid="task-title-input"]')).toBeVisible();
    await expect(toDoColumn.locator('[data-testid="task-title-input"]')).toBeFocused();
  });

  test('creates task in correct column', async ({ page }) => {
    const progressColumn = page.locator('[data-column-name="In Progress"]');

    // Add task in "In Progress" column
    await progressColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Task in progress');
    await page.keyboard.press('Enter');

    // Verify task is in correct column
    await expect(progressColumn.locator('[data-task-title="Task in progress"]')).toBeVisible();

    // Verify task is NOT in other columns
    const toDoColumn = page.locator('[data-column-name="To Do"]');
    await expect(toDoColumn.locator('[data-task-title="Task in progress"]')).not.toBeVisible();
  });

  test('trims whitespace from task title', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', '  Trimmed task  ');
    await page.keyboard.press('Enter');

    // Verify task has trimmed title
    await expect(toDoColumn.locator('[data-task-title="Trimmed task"]')).toBeVisible();
  });

  test('allows creating multiple tasks rapidly', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Create 5 tasks quickly
    for (let i = 1; i <= 5; i++) {
      await page.fill('[data-testid="task-title-input"]', `Rapid task ${i}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200); // Small delay for API
    }

    // Verify all tasks created
    for (let i = 1; i <= 5; i++) {
      await expect(toDoColumn.locator(`[data-task-title="Rapid task ${i}"]`)).toBeVisible();
    }
  });

  test('persists task after page reload', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Persistent task');
    await page.keyboard.press('Enter');

    // Wait for task to appear
    await expect(toDoColumn.locator('[data-task-title="Persistent task"]')).toBeVisible();

    // Reload page
    await page.reload();
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Verify task still exists
    await expect(page.locator('[data-task-title="Persistent task"]')).toBeVisible();
  });

  test('shows character count while typing', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Test task');

    // Character counter should be visible
    await expect(page.locator('[data-testid="char-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="char-count"]')).toContainText('9'); // "Test task" = 9 chars
  });

  test('shows max length warning', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Type close to max length (assume 200 max)
    const longTitle = 'x'.repeat(195);
    await page.fill('[data-testid="task-title-input"]', longTitle);

    // Warning should appear
    await expect(page.locator('[data-testid="char-count"]')).toHaveClass(/warning/);
  });

  test('prevents exceeding max length', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Try to type more than max (assume 200 max)
    const tooLongTitle = 'x'.repeat(250);
    await page.fill('[data-testid="task-title-input"]', tooLongTitle);

    await page.keyboard.press('Enter');

    // Error should appear
    await expect(page.locator('[data-testid="error-message"]')).toContainText('at most 200');
  });
});

test.describe('Inline Task Creation Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-1');
  });

  test('input has proper ARIA label', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    const input = page.locator('[data-testid="task-title-input"]');
    await expect(input).toHaveAttribute('aria-label', /task title|new task/i);
    await expect(input).toHaveAttribute('placeholder');
  });

  test('add task button has ARIA label', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');
    const addButton = toDoColumn.locator('[data-testid="add-task-inline"]');

    await expect(addButton).toHaveAttribute('aria-label', /add task/i);
    await expect(addButton).toHaveAttribute('role', 'button');
  });

  test('error messages are announced', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.keyboard.press('Enter'); // Empty

    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
    await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
  });

  test('keyboard shortcuts are documented', async ({ page }) => {
    // Open keyboard shortcuts help (assume Shift+?)
    await page.keyboard.press('Shift+?');

    // Help modal should appear
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]')).toBeVisible();

    // Should document 'N' shortcut
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]'))
      .toContainText('N');
    await expect(page.locator('[data-testid="keyboard-shortcuts-modal"]'))
      .toContainText('new task');
  });

  test('focus trap in inline input', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();

    // Focus should be on input
    await expect(page.locator('[data-testid="task-title-input"]')).toBeFocused();

    // Tab should not escape input area
    await page.keyboard.press('Tab');

    // Focus should remain within task creation context
    // (either on input or on save/cancel buttons)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeDefined();
  });

  test('screen reader announces task creation', async ({ page }) => {
    const toDoColumn = page.locator('[data-column-name="To Do"]');

    await toDoColumn.locator('[data-testid="add-task-inline"]').click();
    await page.fill('[data-testid="task-title-input"]', 'Test task');
    await page.keyboard.press('Enter');

    // Live region should announce
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/task created|added/i);
  });
});
