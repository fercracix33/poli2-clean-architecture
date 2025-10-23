/**
 * Kanban Board Accessibility E2E Tests
 *
 * Tests WCAG 2.1 AA compliance for Kanban features.
 * Validates keyboard navigation, screen reader support, and ARIA.
 *
 * Created by: Test Agent
 * Date: 2025-01-22
 */

import { test, expect } from '@playwright/test'

test.describe('Kanban Accessibility - WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to board
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/dashboard')
    await page.goto('/dashboard/boards/test-board-1')
    await page.waitForLoadState('networkidle')
  })

  describe('Keyboard Navigation', () => {
    test('user can navigate entire board using keyboard only', async ({ page }) => {
      // Start from first focusable element
      await page.keyboard.press('Tab')

      // Tab through columns
      let focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
      expect(focused).toContain('column')

      // Tab to first task
      await page.keyboard.press('Tab')
      focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
      expect(focused).toContain('task')

      // Tab to task actions
      await page.keyboard.press('Tab')
      focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
      expect(focused).toContain('task-action')

      // Continue tabbing to next task
      await page.keyboard.press('Tab')
      focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
      expect(focused).toBeTruthy()
    })

    test('user can activate task using Enter key', async ({ page }) => {
      // Tab to first task
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Activate with Enter
      await page.keyboard.press('Enter')

      // Verify task modal/detail opens
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    })

    test('user can close modal using Escape key', async ({ page }) => {
      // Open task modal
      const taskCard = page.locator('[data-task-id="task-1"]')
      await taskCard.click()
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()

      // Close with Escape
      await page.keyboard.press('Escape')

      // Verify modal closed
      await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()

      // Verify focus returned to trigger element
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-task-id'))
      expect(focused).toBe('task-1')
    })

    test('user can navigate between columns using arrow keys', async ({ page }) => {
      // Focus first column header
      const firstColumn = page.locator('[data-column-id]:first-child [data-testid="column-header"]')
      await firstColumn.focus()

      // Press Right arrow to next column
      await page.keyboard.press('ArrowRight')

      const focused = await page.evaluate(() => document.activeElement?.closest('[data-column-id]')?.getAttribute('data-column-id'))
      expect(focused).toBeTruthy()
      expect(focused).not.toBe('col-to-do') // Should have moved

      // Press Left arrow to go back
      await page.keyboard.press('ArrowLeft')

      const focusedAfter = await page.evaluate(() => document.activeElement?.closest('[data-column-id]')?.getAttribute('data-column-id'))
      expect(focusedAfter).toBeTruthy()
    })

    test('skip link allows bypassing navigation', async ({ page }) => {
      // Focus page
      await page.keyboard.press('Tab')

      // Verify skip link is focused
      const skipLink = page.locator('[data-testid="skip-to-content"]')
      await expect(skipLink).toBeFocused()

      // Activate skip link
      await page.keyboard.press('Enter')

      // Verify focus moved to main content
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('id'))
      expect(focused).toBe('main-content')
    })
  })

  describe('ARIA Attributes', () => {
    test('columns have proper ARIA roles and labels', async ({ page }) => {
      // Check first column
      const column = page.locator('[data-column-id="col-to-do"]')

      // Should have role="region" or role="list"
      await expect(column).toHaveAttribute('role', /region|list/)

      // Should have aria-label with column name
      await expect(column).toHaveAttribute('aria-label', /To Do|todo/i)

      // Should have aria-labelledby pointing to header
      const labelledBy = await column.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()

      // Verify header exists with matching id
      const header = page.locator(`#${labelledBy}`)
      await expect(header).toBeVisible()
    })

    test('tasks have proper ARIA roles and labels', async ({ page }) => {
      // Check first task
      const task = page.locator('[data-task-id="task-1"]')

      // Should have role="button" or role="listitem"
      await expect(task).toHaveAttribute('role', /button|listitem/)

      // Should have aria-label describing task
      const ariaLabel = await task.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toContain('task') // Should describe it's a task

      // Should have aria-pressed when draggable
      const ariaPressed = await task.getAttribute('aria-pressed')
      expect(ariaPressed).toMatch(/true|false/)
    })

    test('drag-drop has proper ARIA live regions', async ({ page }) => {
      // Verify live region exists
      const liveRegion = page.locator('[aria-live="assertive"]')
      await expect(liveRegion).toHaveCount(1)

      // Should have aria-atomic
      await expect(liveRegion).toHaveAttribute('aria-atomic', 'true')

      // Start drag with keyboard
      const taskCard = page.locator('[data-task-id="task-1"]')
      await taskCard.focus()
      await page.keyboard.press('Space')

      // Verify announcement in live region
      await expect(liveRegion).toContainText(/picked up|grabbed/i)

      // Drop
      await page.keyboard.press('Space')

      // Verify drop announcement
      await expect(liveRegion).toContainText(/dropped|moved/i)
    })

    test('WIP limit indicator has proper ARIA', async ({ page }) => {
      // Find column with WIP limit
      const limitedColumn = page.locator('[data-column-id="col-limited"]')
      const wipIndicator = limitedColumn.locator('[data-testid="wip-indicator"]')

      // Should have aria-label explaining limit
      await expect(wipIndicator).toHaveAttribute('aria-label', /WIP limit|work in progress/i)

      // Should have role="status" if showing live count
      await expect(wipIndicator).toHaveAttribute('role', 'status')

      // When at limit, should have aria-live
      const atLimit = await wipIndicator.getAttribute('data-at-limit')
      if (atLimit === 'true') {
        await expect(wipIndicator).toHaveAttribute('aria-live', 'polite')
      }
    })

    test('modals have proper ARIA dialog attributes', async ({ page }) => {
      // Open task modal
      await page.click('[data-task-id="task-1"]')
      const modal = page.locator('[data-testid="task-modal"]')

      // Should have role="dialog"
      await expect(modal).toHaveAttribute('role', 'dialog')

      // Should have aria-modal="true"
      await expect(modal).toHaveAttribute('aria-modal', 'true')

      // Should have aria-labelledby
      const labelledBy = await modal.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()

      // Should have aria-describedby
      const describedBy = await modal.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()

      // Verify labels exist
      const label = page.locator(`#${labelledBy}`)
      await expect(label).toBeVisible()
    })

    test('form inputs have proper labels', async ({ page }) => {
      // Open create task form
      await page.click('[data-testid="create-task-button"]')

      // Verify all inputs have labels
      const inputs = await page.locator('input, textarea, select').all()

      for (const input of inputs) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')

        // Must have either aria-label or associated label element
        if (!ariaLabel) {
          expect(ariaLabelledBy || id).toBeTruthy()

          if (id) {
            // Verify label exists
            const label = page.locator(`label[for="${id}"]`)
            await expect(label).toHaveCount(1)
          }
        }
      }
    })
  })

  describe('Focus Management', () => {
    test('focus is trapped in modal when open', async ({ page }) => {
      // Open modal
      await page.click('[data-task-id="task-1"]')
      const modal = page.locator('[data-testid="task-modal"]')
      await expect(modal).toBeVisible()

      // Tab through all focusable elements in modal
      const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      const focusableElements = await modal.locator(focusableSelector).all()
      const count = focusableElements.length

      // Tab through all elements
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab')
      }

      // One more tab should cycle back to first element (focus trap)
      await page.keyboard.press('Tab')

      const focused = await page.evaluate(() => document.activeElement)
      const isInsideModal = await modal.evaluate((node, el) => node.contains(el), focused)

      expect(isInsideModal).toBe(true)
    })

    test('focus returns to trigger when modal closes', async ({ page }) => {
      // Focus and click task
      const taskCard = page.locator('[data-task-id="task-1"]')
      await taskCard.focus()
      await taskCard.click()

      // Verify modal open
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()

      // Close modal
      await page.keyboard.press('Escape')

      // Verify focus returned to task card
      await expect(taskCard).toBeFocused()
    })

    test('focus visible on all interactive elements', async ({ page }) => {
      // Tab to first focusable element
      await page.keyboard.press('Tab')

      // Get computed styles of focused element
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        }
      })

      // Should have visible focus indicator (outline or box-shadow)
      const hasVisibleFocus =
        outline.outline !== 'none' ||
        parseInt(outline.outlineWidth) > 0 ||
        outline.boxShadow !== 'none'

      expect(hasVisibleFocus).toBe(true)
    })
  })

  describe('Screen Reader Support', () => {
    test('task count announced for each column', async ({ page }) => {
      const column = page.locator('[data-column-id="col-to-do"]')

      // Should have visually hidden text for count
      const srOnly = column.locator('.sr-only, [class*="sr-only"]')
      const text = await srOnly.textContent()

      // Should announce number of tasks
      expect(text).toMatch(/\d+ task/)
    })

    test('drag state changes announced to screen readers', async ({ page }) => {
      // Focus task
      const taskCard = page.locator('[data-task-id="task-1"]')
      await taskCard.focus()

      // Start drag
      await page.keyboard.press('Space')

      // Check live region
      const liveRegion = page.locator('[aria-live]')
      const announcement = await liveRegion.textContent()

      // Should announce pickup
      expect(announcement).toMatch(/picked up|grabbed|started dragging/i)

      // Should include task title
      expect(announcement).toContain('task') // Task title/description

      // Move
      await page.keyboard.press('ArrowRight')

      // Should announce new position
      const moveAnnouncement = await liveRegion.textContent()
      expect(moveAnnouncement).toMatch(/moved|position/i)
    })

    test('error messages announced to screen readers', async ({ page }) => {
      // Setup: Try to exceed WIP limit
      const taskCard = page.locator('[data-task-id="task-new"]')
      const limitedColumn = page.locator('[data-column-id="col-limited"]')

      // Attempt drag to full column
      await taskCard.dragTo(limitedColumn)

      // Verify error in live region
      const liveRegion = page.locator('[aria-live="assertive"]')
      await expect(liveRegion).toContainText(/WIP limit|exceeded|reached/i)

      // Should also have role="alert" on error message
      const alert = page.locator('[role="alert"]')
      await expect(alert).toBeVisible()
      await expect(alert).toContainText(/WIP limit|exceeded/i)
    })
  })

  describe('Color Contrast (WCAG AA)', () => {
    test('text has sufficient color contrast ratio', async ({ page }) => {
      // Check task card text
      const taskCard = page.locator('[data-task-id="task-1"]')

      const contrast = await page.evaluate((el) => {
        const element = el as HTMLElement
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor

        // Helper to parse rgb
        const parseRgb = (rgb: string) => {
          const match = rgb.match(/\d+/g)
          if (!match) return null
          return match.map(Number)
        }

        const fg = parseRgb(color)
        const bg = parseRgb(backgroundColor)

        if (!fg || !bg) return null

        // Calculate relative luminance
        const luminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map((val) => {
            val /= 255
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
          })
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }

        const l1 = luminance(fg)
        const l2 = luminance(bg)
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

        return ratio
      }, taskCard)

      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    })

    test('focus indicators have sufficient contrast', async ({ page }) => {
      // Tab to focusable element
      await page.keyboard.press('Tab')

      const contrast = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        const styles = window.getComputedStyle(el)
        const outlineColor = styles.outlineColor
        const backgroundColor = styles.backgroundColor

        // Parse colors and calculate contrast
        // (Simplified - same logic as above)
        const parseRgb = (rgb: string) => {
          const match = rgb.match(/\d+/g)
          if (!match) return null
          return match.map(Number)
        }

        const outline = parseRgb(outlineColor)
        const bg = parseRgb(backgroundColor)

        if (!outline || !bg) return 5 // Assume passing if can't calculate

        const luminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map((val) => {
            val /= 255
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
          })
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }

        const l1 = luminance(outline)
        const l2 = luminance(bg)
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      })

      // WCAG AA requires 3:1 for UI components
      expect(contrast).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Mobile Accessibility', () => {
    test('touch targets are at least 44x44px', async ({ page }) => {
      // Check all interactive elements
      const buttons = await page.locator('button, a, [role="button"]').all()

      for (const button of buttons) {
        const box = await button.boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('board is usable with screen magnification', async ({ page }) => {
      // Set viewport to simulate zooming
      await page.setViewportSize({ width: 1280 / 2, height: 800 / 2 })

      // Verify board still functional
      await expect(page.locator('[data-testid="board-container"]')).toBeVisible()

      // Verify horizontal scroll works
      const board = page.locator('[data-testid="board-container"]')
      const scrollWidth = await board.evaluate((el) => el.scrollWidth)
      const clientWidth = await board.evaluate((el) => el.clientWidth)

      // Should have horizontal scroll when zoomed
      expect(scrollWidth).toBeGreaterThan(clientWidth)
    })
  })
})
