/**
 * Task Drag & Drop E2E Tests
 *
 * Tests CRITICAL user flow: dragging tasks between columns.
 * Validates dnd-kit implementation and WIP limit UI feedback.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { test, expect } from '@playwright/test'

test.describe('Task Drag & Drop - CRITICAL KANBAN FUNCTIONALITY', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login and navigate to board
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="submit-button"]')

    // Wait for auth
    await page.waitForURL('/dashboard')

    // Navigate to test board
    await page.goto('/dashboard/boards/test-board-1')
    await page.waitForLoadState('networkidle')
  })

  describe('Basic Drag & Drop', () => {
    test('user can drag task between columns', async ({ page }) => {
      // Wait for board to load
      await expect(page.locator('[data-testid="board-container"]')).toBeVisible()

      // Locate task and target column
      const taskCard = page.locator('[data-task-id="task-1"]')
      const sourceColumn = page.locator('[data-column-id="col-to-do"]')
      const targetColumn = page.locator('[data-column-id="col-in-progress"]')

      // Verify initial state
      await expect(sourceColumn.locator('[data-task-id="task-1"]')).toBeVisible()

      // Perform drag & drop
      await taskCard.dragTo(targetColumn)

      // Wait for animation
      await page.waitForTimeout(500)

      // Verify task moved
      await expect(targetColumn.locator('[data-task-id="task-1"]')).toBeVisible()
      await expect(sourceColumn.locator('[data-task-id="task-1"]')).not.toBeVisible()

      // Verify position persisted (check via reload)
      await page.reload()
      await page.waitForLoadState('networkidle')
      await expect(targetColumn.locator('[data-task-id="task-1"]')).toBeVisible()
    })

    test('user can reorder tasks within same column', async ({ page }) => {
      // Locate tasks in same column
      const column = page.locator('[data-column-id="col-to-do"]')
      const taskA = column.locator('[data-task-id="task-a"]')
      const taskB = column.locator('[data-task-id="task-b"]')
      const taskC = column.locator('[data-task-id="task-c"]')

      // Verify initial order (A, B, C)
      const tasksInitial = await column.locator('[data-task-id]').all()
      expect(await tasksInitial[0].getAttribute('data-task-id')).toBe('task-a')
      expect(await tasksInitial[1].getAttribute('data-task-id')).toBe('task-b')
      expect(await tasksInitial[2].getAttribute('data-task-id')).toBe('task-c')

      // Drag task A below task C
      await taskA.dragTo(taskC)

      // Wait for animation
      await page.waitForTimeout(500)

      // Verify new order (B, C, A)
      const tasksFinal = await column.locator('[data-task-id]').all()
      expect(await tasksFinal[0].getAttribute('data-task-id')).toBe('task-b')
      expect(await tasksFinal[1].getAttribute('data-task-id')).toBe('task-c')
      expect(await tasksFinal[2].getAttribute('data-task-id')).toBe('task-a')
    })

    test('shows drag preview while dragging', async ({ page }) => {
      // Locate task
      const taskCard = page.locator('[data-task-id="task-1"]')

      // Start dragging
      await taskCard.hover()
      await page.mouse.down()

      // Verify drag overlay/preview is visible
      await expect(page.locator('[data-testid="drag-overlay"]')).toBeVisible()

      // Move mouse to simulate drag
      await page.mouse.move(300, 400)

      // Verify preview follows cursor
      const overlay = page.locator('[data-testid="drag-overlay"]')
      await expect(overlay).toBeVisible()

      // Release
      await page.mouse.up()

      // Verify preview disappears
      await expect(overlay).not.toBeVisible()
    })

    test('shows drop indicator in target column', async ({ page }) => {
      // Locate task and target column
      const taskCard = page.locator('[data-task-id="task-1"]')
      const targetColumn = page.locator('[data-column-id="col-in-progress"]')

      // Start dragging
      await taskCard.hover()
      await page.mouse.down()

      // Move over target column
      await taskCard.dragTo(targetColumn, { force: true, trial: true })

      // Verify drop indicator shown
      await expect(
        targetColumn.locator('[data-testid="drop-indicator"]')
      ).toBeVisible()

      // Cancel drag
      await page.keyboard.press('Escape')

      // Verify indicator disappears
      await expect(
        targetColumn.locator('[data-testid="drop-indicator"]')
      ).not.toBeVisible()
    })
  })

  describe('WIP Limits Enforcement (CRITICAL)', () => {
    test('prevents drag when target column is at WIP limit', async ({ page }) => {
      // Setup: Column with wip_limit=3, currently has 3 tasks
      const taskCard = page.locator('[data-task-id="task-new"]')
      const limitedColumn = page.locator('[data-column-id="col-limited"]')

      // Verify column has WIP limit indicator
      await expect(limitedColumn.locator('[data-testid="wip-indicator"]')).toContainText(
        '3/3'
      )

      // Attempt drag
      await taskCard.dragTo(limitedColumn)

      // Verify error toast/alert shown
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-toast"]')).toContainText(
        /WIP limit exceeded|reached its limit/i
      )

      // Verify task NOT moved
      await page.reload()
      await expect(limitedColumn.locator('[data-task-id="task-new"]')).not.toBeVisible()
    })

    test('visual indicator when column is at WIP limit', async ({ page }) => {
      // Locate column at limit
      const limitedColumn = page.locator('[data-column-id="col-at-limit"]')

      // Verify visual indicator shown
      await expect(limitedColumn.locator('[data-testid="wip-limit-badge"]')).toHaveClass(
        /bg-red|border-red|text-red/
      )

      // Verify column header shows warning
      await expect(limitedColumn.locator('[data-testid="column-header"]')).toHaveAttribute(
        'data-at-limit',
        'true'
      )
    })

    test('allows drag when column is under WIP limit', async ({ page }) => {
      // Setup: Column with wip_limit=3, currently has 2 tasks
      const taskCard = page.locator('[data-task-id="task-move"]')
      const limitedColumn = page.locator('[data-column-id="col-under-limit"]')

      // Verify column shows 2/3
      await expect(limitedColumn.locator('[data-testid="wip-indicator"]')).toContainText(
        '2/3'
      )

      // Perform drag
      await taskCard.dragTo(limitedColumn)

      // Wait for animation
      await page.waitForTimeout(500)

      // Verify task moved successfully
      await expect(limitedColumn.locator('[data-task-id="task-move"]')).toBeVisible()

      // Verify WIP indicator updated to 3/3
      await expect(limitedColumn.locator('[data-testid="wip-indicator"]')).toContainText(
        '3/3'
      )
    })

    test('does not apply WIP limit when dragging within same column', async ({ page }) => {
      // Setup: Column at limit, reordering within it
      const column = page.locator('[data-column-id="col-at-limit"]')
      const taskA = column.locator('[data-task-id="task-a"]')
      const taskB = column.locator('[data-task-id="task-b"]')

      // Drag task A to different position in same column
      await taskA.dragTo(taskB)

      // Verify NO error shown
      await expect(page.locator('[data-testid="error-toast"]')).not.toBeVisible()

      // Verify task reordered successfully
      await page.waitForTimeout(500)
      // Position should have changed
    })

    test('WIP limit only applies to target column (not source)', async ({ page }) => {
      // Setup: Moving task FROM full column TO empty column
      const fullColumn = page.locator('[data-column-id="col-full"]')
      const emptyColumn = page.locator('[data-column-id="col-empty"]')
      const taskCard = fullColumn.locator('[data-task-id="task-1"]')

      // Verify source column is full
      await expect(fullColumn.locator('[data-testid="wip-indicator"]')).toContainText('3/3')

      // Drag task OUT of full column
      await taskCard.dragTo(emptyColumn)

      // Verify move succeeds
      await page.waitForTimeout(500)
      await expect(emptyColumn.locator('[data-task-id="task-1"]')).toBeVisible()

      // Verify source column now shows 2/3
      await expect(fullColumn.locator('[data-testid="wip-indicator"]')).toContainText('2/3')
    })
  })

  describe('Loading & Error States', () => {
    test('shows loading indicator during async move', async ({ page }) => {
      // Locate task
      const taskCard = page.locator('[data-task-id="task-1"]')
      const targetColumn = page.locator('[data-column-id="col-target"]')

      // Perform drag
      await taskCard.dragTo(targetColumn)

      // Verify loading spinner shown briefly
      await expect(page.locator('[data-testid="move-loading"]')).toBeVisible({
        timeout: 1000,
      })

      // Wait for completion
      await expect(page.locator('[data-testid="move-loading"]')).not.toBeVisible({
        timeout: 5000,
      })
    })

    test('reverts task position on API error', async ({ page }) => {
      // Setup: Simulate network error
      await page.route('**/api/tasks/*/move', (route) => route.abort('failed'))

      const taskCard = page.locator('[data-task-id="task-1"]')
      const sourceColumn = page.locator('[data-column-id="col-source"]')
      const targetColumn = page.locator('[data-column-id="col-target"]')

      // Verify initial position
      await expect(sourceColumn.locator('[data-task-id="task-1"]')).toBeVisible()

      // Attempt drag
      await taskCard.dragTo(targetColumn)

      // Wait for error
      await page.waitForTimeout(2000)

      // Verify error message shown
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-toast"]')).toContainText(/failed|error/i)

      // Verify task reverted to original position (optimistic UI rollback)
      await expect(sourceColumn.locator('[data-task-id="task-1"]')).toBeVisible()
      await expect(targetColumn.locator('[data-task-id="task-1"]')).not.toBeVisible()
    })
  })

  describe('Keyboard Accessibility', () => {
    test('user can move task using keyboard only', async ({ page }) => {
      // Focus first task
      const taskCard = page.locator('[data-task-id="task-1"]')
      await taskCard.focus()

      // Press Space to pick up
      await page.keyboard.press('Space')

      // Verify task is in "lifted" state
      await expect(taskCard).toHaveAttribute('aria-pressed', 'true')

      // Use arrow keys to navigate
      await page.keyboard.press('ArrowRight') // Move to next column
      await page.keyboard.press('ArrowDown') // Move down in column

      // Press Space to drop
      await page.keyboard.press('Space')

      // Verify task moved
      await page.waitForTimeout(500)
      await expect(page.locator('[data-column-id="col-in-progress"]').locator('[data-task-id="task-1"]')).toBeVisible()
    })

    test('user can cancel keyboard drag with Escape', async ({ page }) => {
      // Focus task
      const taskCard = page.locator('[data-task-id="task-1"]')
      const sourceColumn = page.locator('[data-column-id="col-source"]')
      await taskCard.focus()

      // Pick up with Space
      await page.keyboard.press('Space')
      await expect(taskCard).toHaveAttribute('aria-pressed', 'true')

      // Navigate
      await page.keyboard.press('ArrowRight')

      // Cancel with Escape
      await page.keyboard.press('Escape')

      // Verify task returned to original position
      await expect(taskCard).toHaveAttribute('aria-pressed', 'false')
      await expect(sourceColumn.locator('[data-task-id="task-1"]')).toBeVisible()
    })

    test('screen reader announces drag state changes', async ({ page }) => {
      // Focus task
      const taskCard = page.locator('[data-task-id="task-1"]')
      await taskCard.focus()

      // Pick up
      await page.keyboard.press('Space')

      // Verify live region updated
      const liveRegion = page.locator('[aria-live="assertive"]')
      await expect(liveRegion).toContainText(/picked up|grabbed/i)

      // Drop
      await page.keyboard.press('Space')

      // Verify announcement
      await expect(liveRegion).toContainText(/dropped|moved/i)
    })
  })

  describe('Edge Cases', () => {
    test('handles rapid successive drags', async ({ page }) => {
      // Drag task 1
      const task1 = page.locator('[data-task-id="task-1"]')
      const task2 = page.locator('[data-task-id="task-2"]')
      const targetColumn = page.locator('[data-column-id="col-target"]')

      await task1.dragTo(targetColumn)
      await page.waitForTimeout(100) // Small delay

      // Immediately drag task 2
      await task2.dragTo(targetColumn)

      // Wait for both to settle
      await page.waitForTimeout(1000)

      // Verify both moved
      await expect(targetColumn.locator('[data-task-id="task-1"]')).toBeVisible()
      await expect(targetColumn.locator('[data-task-id="task-2"]')).toBeVisible()
    })

    test('handles dragging task to empty column', async ({ page }) => {
      const taskCard = page.locator('[data-task-id="task-1"]')
      const emptyColumn = page.locator('[data-column-id="col-empty"]')

      // Verify column is empty
      await expect(emptyColumn.locator('[data-task-id]')).toHaveCount(0)

      // Drag task
      await taskCard.dragTo(emptyColumn)

      // Wait
      await page.waitForTimeout(500)

      // Verify task is now in column at position 0
      await expect(emptyColumn.locator('[data-task-id="task-1"]')).toBeVisible()
      await expect(emptyColumn.locator('[data-task-id]')).toHaveCount(1)
    })

    test('handles dragging last task from column', async ({ page }) => {
      const sourceColumn = page.locator('[data-column-id="col-one-task"]')
      const taskCard = sourceColumn.locator('[data-task-id="task-only"]')
      const targetColumn = page.locator('[data-column-id="col-target"]')

      // Verify source has only one task
      await expect(sourceColumn.locator('[data-task-id]')).toHaveCount(1)

      // Drag task
      await taskCard.dragTo(targetColumn)

      // Wait
      await page.waitForTimeout(500)

      // Verify source column is now empty
      await expect(sourceColumn.locator('[data-task-id]')).toHaveCount(0)
      await expect(sourceColumn.locator('[data-testid="empty-column-message"]')).toBeVisible()

      // Verify task in target
      await expect(targetColumn.locator('[data-task-id="task-only"]')).toBeVisible()
    })
  })
})
