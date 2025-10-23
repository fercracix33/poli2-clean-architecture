/**
 * Custom Fields Complete Flow E2E Tests
 *
 * Tests entire custom fields workflow from creation to filtering.
 * Validates field types (text, number, date, select), validation, and persistence.
 *
 * CRITICAL TEST: Core extensibility feature - must work end-to-end.
 *
 * Created by: Test Agent
 * Date: 2025-10-22
 */

import { test, expect } from '@playwright/test';

test.describe('Custom Fields Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to board
    await page.goto('/dashboard/boards/board-custom-fields-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();
  });

  test('complete workflow: create field → assign value → filter', async ({ page }) => {
    // 1. Open board settings
    await page.click('[data-testid="board-settings"]');
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();

    // 2. Navigate to custom fields tab
    await page.click('[data-testid="tab-custom-fields"]');
    await expect(page.locator('[data-testid="custom-fields-panel"]')).toBeVisible();

    // 3. Create custom field "Sprint" (select type)
    await page.click('[data-testid="add-custom-field"]');

    await page.fill('[data-testid="field-name"]', 'Sprint');
    await page.selectOption('[data-testid="field-type"]', 'select');

    // Add options
    await page.fill('[data-testid="option-input"]', 'Sprint 23');
    await page.click('[data-testid="add-option"]');

    await page.fill('[data-testid="option-input"]', 'Sprint 24');
    await page.click('[data-testid="add-option"]');

    await page.fill('[data-testid="option-input"]', 'Sprint 25');
    await page.click('[data-testid="add-option"]');

    await page.click('[data-testid="save-field"]');

    // Verify field appears in list
    await expect(page.locator('[data-testid="field-list"]')).toContainText('Sprint');
    await expect(page.locator('[data-testid="field-list"]')).toContainText('select');

    // 4. Close settings
    await page.click('[data-testid="close-settings"]');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // 5. Create task with custom field value
    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Implement login');

    // Open task details
    await page.click('[data-testid="task-details-expand"]');
    await expect(page.locator('[data-testid="task-details-panel"]')).toBeVisible();

    // Assign custom field value
    await expect(page.locator('[data-testid="custom-field-sprint"]')).toBeVisible();
    await page.selectOption('[data-testid="custom-field-sprint"]', 'Sprint 24');

    await page.click('[data-testid="save-task"]');

    // Verify task shows custom field value
    const taskCard = page.locator('[data-task-id*="implement-login"]');
    await expect(taskCard).toBeVisible();
    await expect(taskCard.locator('[data-testid="custom-field-badge"]'))
      .toContainText('Sprint 24');

    // 6. Create another task with different value
    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Fix bug');
    await page.click('[data-testid="task-details-expand"]');
    await page.selectOption('[data-testid="custom-field-sprint"]', 'Sprint 25');
    await page.click('[data-testid="save-task"]');

    const bugTask = page.locator('[data-task-id*="fix-bug"]');
    await expect(bugTask.locator('[data-testid="custom-field-badge"]'))
      .toContainText('Sprint 25');

    // 7. Apply filter by custom field
    await page.click('[data-testid="filters-button"]');
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();

    await page.click('[data-testid="add-filter"]');
    await page.selectOption('[data-testid="filter-field"]', 'Sprint');
    await page.selectOption('[data-testid="filter-value"]', 'Sprint 24');
    await page.click('[data-testid="apply-filters"]');

    // 8. Verify filtering works
    await expect(page.locator('text=Implement login')).toBeVisible();
    await expect(page.locator('text=Fix bug')).not.toBeVisible();

    // Verify filter indicator
    await expect(page.locator('[data-testid="active-filters"]'))
      .toContainText('Sprint: Sprint 24');

    // 9. Clear filter
    await page.click('[data-testid="clear-filters"]');

    // Both tasks visible again
    await expect(page.locator('text=Implement login')).toBeVisible();
    await expect(page.locator('text=Fix bug')).toBeVisible();
  });

  test('validates required custom fields', async ({ page }) => {
    // Setup: Board has required custom field "Story Points"
    await page.goto('/dashboard/boards/board-required-fields');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Try to create task without filling required field
    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'New Task');

    // Expand details to see custom fields
    await page.click('[data-testid="task-details-expand"]');

    // Verify field is marked as required
    await expect(page.locator('[data-testid="custom-field-story-points"]'))
      .toHaveAttribute('required');
    await expect(page.locator('[data-testid="label-story-points"]'))
      .toContainText('*'); // Required indicator

    // Try to save without filling
    await page.click('[data-testid="save-task"]');

    // Verify validation error
    await expect(page.locator('[data-testid="field-error-story-points"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="field-error-story-points"]'))
      .toContainText('Story Points is required');

    // Fill required field
    await page.fill('[data-testid="custom-field-story-points"]', '5');
    await page.click('[data-testid="save-task"]');

    // Task should be created
    await expect(page.locator('text=New Task')).toBeVisible();

    // Verify value is displayed
    const taskCard = page.locator('[data-task-id*="new-task"]');
    await expect(taskCard.locator('[data-testid="custom-field-badge"]'))
      .toContainText('5');
  });

  test('validates number field bounds', async ({ page }) => {
    await page.goto('/dashboard/boards/board-number-fields');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task');
    await page.click('[data-testid="task-details-expand"]');

    // Try to enter number outside bounds (field config: 0-100)
    await page.fill('[data-testid="custom-field-story-points"]', '150');
    await page.click('[data-testid="save-task"]');

    // Verify error
    await expect(page.locator('[data-testid="field-error-story-points"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="field-error-story-points"]'))
      .toContainText('must be between 0 and 100');

    // Try negative number
    await page.fill('[data-testid="custom-field-story-points"]', '-5');
    await page.click('[data-testid="save-task"]');

    await expect(page.locator('[data-testid="field-error-story-points"]'))
      .toContainText('must be between 0 and 100');

    // Enter valid number
    await page.fill('[data-testid="custom-field-story-points"]', '50');
    await page.click('[data-testid="save-task"]');

    // Should succeed
    await expect(page.locator('text=Task')).toBeVisible();
  });

  test('date picker for date custom fields', async ({ page }) => {
    await page.goto('/dashboard/boards/board-date-fields');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task with date');
    await page.click('[data-testid="task-details-expand"]');

    // Open date picker
    await page.click('[data-testid="custom-field-due-date"]');

    // Verify date picker appears
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();

    // Select a date
    await page.click('[data-date="2025-02-15"]');

    // Verify date is set
    await expect(page.locator('[data-testid="custom-field-due-date"]'))
      .toHaveValue('2025-02-15');

    await page.click('[data-testid="save-task"]');

    // Verify task shows date
    const taskCard = page.locator('[data-task-id*="task-with-date"]');
    await expect(taskCard.locator('[data-testid="custom-field-badge"]'))
      .toContainText('Feb 15'); // Locale-specific format
  });

  test('text field with max length validation', async ({ page }) => {
    await page.goto('/dashboard/boards/board-text-fields');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task');
    await page.click('[data-testid="task-details-expand"]');

    // Field has max length of 100
    const longText = 'x'.repeat(150);
    await page.fill('[data-testid="custom-field-description"]', longText);

    // Should show character count
    await expect(page.locator('[data-testid="char-count-description"]'))
      .toContainText('150/100'); // Over limit

    await page.click('[data-testid="save-task"]');

    // Verify error
    await expect(page.locator('[data-testid="field-error-description"]'))
      .toContainText('must be at most 100 characters');

    // Enter valid text
    await page.fill('[data-testid="custom-field-description"]', 'Valid text');
    await expect(page.locator('[data-testid="char-count-description"]'))
      .toContainText('10/100');

    await page.click('[data-testid="save-task"]');

    // Should succeed
    await expect(page.locator('text=Task')).toBeVisible();
  });

  test('edit custom field value on existing task', async ({ page }) => {
    await page.goto('/dashboard/boards/board-custom-fields-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Click on existing task
    const taskCard = page.locator('[data-task-id="existing-task-1"]');
    await taskCard.click();

    // Task details modal opens
    await expect(page.locator('[data-testid="task-details-modal"]')).toBeVisible();

    // Current value is "Sprint 24"
    await expect(page.locator('[data-testid="custom-field-sprint"]'))
      .toHaveValue('Sprint 24');

    // Change to "Sprint 25"
    await page.selectOption('[data-testid="custom-field-sprint"]', 'Sprint 25');
    await page.click('[data-testid="save-task-details"]');

    // Verify badge updates
    await expect(taskCard.locator('[data-testid="custom-field-badge"]'))
      .toContainText('Sprint 25');
  });

  test('delete custom field removes values from all tasks', async ({ page }) => {
    await page.goto('/dashboard/boards/board-custom-fields-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Verify tasks have custom field values
    const task1 = page.locator('[data-task-id="task-1"]');
    await expect(task1.locator('[data-testid="custom-field-badge"]')).toBeVisible();

    // Open board settings
    await page.click('[data-testid="board-settings"]');
    await page.click('[data-testid="tab-custom-fields"]');

    // Delete field "Sprint"
    const sprintField = page.locator('[data-field-name="Sprint"]');
    await sprintField.locator('[data-testid="delete-field"]').click();

    // Confirm deletion
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation"]'))
      .toContainText('This will remove all values');

    await page.click('[data-testid="confirm-delete"]');

    // Close settings
    await page.click('[data-testid="close-settings"]');

    // Verify badges are removed from tasks
    await expect(task1.locator('[data-testid="custom-field-badge"]'))
      .not.toBeVisible();
  });

  test('update custom field definition updates all tasks', async ({ page }) => {
    await page.goto('/dashboard/boards/board-custom-fields-test');

    // Open settings
    await page.click('[data-testid="board-settings"]');
    await page.click('[data-testid="tab-custom-fields"]');

    // Edit "Sprint" field - rename to "Release"
    const sprintField = page.locator('[data-field-name="Sprint"]');
    await sprintField.locator('[data-testid="edit-field"]').click();

    await page.fill('[data-testid="field-name"]', 'Release');
    await page.click('[data-testid="save-field"]');

    // Close settings
    await page.click('[data-testid="close-settings"]');

    // Open task details
    const taskCard = page.locator('[data-task-id="task-1"]');
    await taskCard.click();

    // Field should now be labeled "Release"
    await expect(page.locator('[data-testid="label-release"]')).toBeVisible();
    await expect(page.locator('[data-testid="custom-field-release"]')).toBeVisible();
  });

  test('multiple select field allows multiple values', async ({ page }) => {
    await page.goto('/dashboard/boards/board-multi-select');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task with tags');
    await page.click('[data-testid="task-details-expand"]');

    // Select multiple tags
    const tagsField = page.locator('[data-testid="custom-field-tags"]');
    await tagsField.click();

    await page.click('[data-option="Frontend"]');
    await page.click('[data-option="Backend"]');
    await page.click('[data-option="Testing"]');

    // Close dropdown
    await page.keyboard.press('Escape');

    // Verify selected values
    await expect(tagsField).toContainText('Frontend');
    await expect(tagsField).toContainText('Backend');
    await expect(tagsField).toContainText('Testing');

    await page.click('[data-testid="save-task"]');

    // Verify task shows all badges
    const taskCard = page.locator('[data-task-id*="task-with-tags"]');
    await expect(taskCard.locator('[data-testid="custom-field-badge"]'))
      .toHaveCount(3);
  });

  test('boolean field shows checkbox', async ({ page }) => {
    await page.goto('/dashboard/boards/board-boolean-fields');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Blocking task');
    await page.click('[data-testid="task-details-expand"]');

    // Verify checkbox for boolean field
    const blockingField = page.locator('[data-testid="custom-field-blocking"]');
    await expect(blockingField).toHaveAttribute('type', 'checkbox');

    // Check the box
    await blockingField.check();
    await page.click('[data-testid="save-task"]');

    // Verify task shows indicator
    const taskCard = page.locator('[data-task-id*="blocking-task"]');
    await expect(taskCard.locator('[data-testid="blocking-indicator"]'))
      .toBeVisible();
  });

  test('filters tasks by custom field values', async ({ page }) => {
    await page.goto('/dashboard/boards/board-custom-fields-test');
    await expect(page.locator('[data-testid="board-view"]')).toBeVisible();

    // Board has tasks with different "Priority" values: High, Medium, Low
    await page.click('[data-testid="filters-button"]');
    await page.click('[data-testid="add-filter"]');

    await page.selectOption('[data-testid="filter-field"]', 'Priority');
    await page.selectOption('[data-testid="filter-operator"]', 'equals');
    await page.selectOption('[data-testid="filter-value"]', 'High');

    await page.click('[data-testid="apply-filters"]');

    // Only high priority tasks visible
    const visibleTasks = page.locator('[data-testid="task-card"]');
    await expect(visibleTasks).toHaveCount(2); // Assume 2 high priority tasks

    const firstTask = visibleTasks.first();
    await expect(firstTask.locator('[data-testid="custom-field-badge"]'))
      .toContainText('High');
  });
});

test.describe('Custom Fields Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/boards/board-custom-fields-test');
  });

  test('custom field inputs have proper labels', async ({ page }) => {
    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task');
    await page.click('[data-testid="task-details-expand"]');

    // Verify field has associated label
    const sprintField = page.locator('[data-testid="custom-field-sprint"]');
    await expect(sprintField).toHaveAttribute('aria-labelledby');

    const labelId = await sprintField.getAttribute('aria-labelledby');
    const label = page.locator(`#${labelId}`);
    await expect(label).toContainText('Sprint');
  });

  test('validation errors are announced to screen readers', async ({ page }) => {
    await page.goto('/dashboard/boards/board-required-fields');
    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task');
    await page.click('[data-testid="task-details-expand"]');

    // Try to save without required field
    await page.click('[data-testid="save-task"]');

    // Error should have aria-live region
    const errorMessage = page.locator('[data-testid="field-error-story-points"]');
    await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('keyboard navigation through custom fields', async ({ page }) => {
    await page.click('[data-testid="add-task-col-to-do"]');
    await page.fill('[data-testid="task-title-input"]', 'Task');
    await page.click('[data-testid="task-details-expand"]');

    // Tab through fields
    await page.keyboard.press('Tab'); // Title
    await page.keyboard.press('Tab'); // Description
    await page.keyboard.press('Tab'); // Custom field 1
    await page.keyboard.press('Tab'); // Custom field 2

    // Verify focus is on custom field
    const customField = page.locator('[data-testid="custom-field-sprint"]');
    await expect(customField).toBeFocused();

    // Can interact with keyboard
    await page.keyboard.press('ArrowDown'); // Open select
    await page.keyboard.press('ArrowDown'); // Navigate options
    await page.keyboard.press('Enter'); // Select option
  });
});
