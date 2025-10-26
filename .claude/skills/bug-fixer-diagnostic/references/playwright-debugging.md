# Playwright E2E Test Debugging Reference

**Purpose**: Patterns for diagnosing and fixing Playwright E2E test failures.

**When to Consult**: E2E tests failing, selector issues, timing problems, flaky tests.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/microsoft/playwright",
  topic: "debugging selectors wait locators screenshots trace viewer",
  tokens: 4000
})
```

---

## Common Playwright Issues

### 1. Selector Not Found

**Symptoms**: `Error: locator.click: Target closed` or `Timeout 30000ms exceeded`

**Diagnosis**:
```typescript
// Check if element exists
await page.locator('button[data-testid="submit"]').count()  // Returns 0 if not found

// Take screenshot to see page state
await page.screenshot({ path: 'debug-page-state.png', fullPage: true })

// Print page HTML
console.log(await page.content())
```

**Context7 Best Practice**:
```typescript
// Use data-testid for stability (recommended by Playwright)
await page.locator('[data-testid="submit-button"]').click()

// NOT: CSS classes (can change)
// await page.locator('.btn-primary').click()

// NOT: Text content (i18n issues)
// await page.getByText('Submit').click()
```

**Fix**:
```typescript
// BEFORE (brittle)
await page.locator('button.submit-btn').click()

// AFTER (stable)
await page.locator('[data-testid="submit-button"]').click()

// Or use getByRole (accessible)
await page.getByRole('button', { name: 'Submit' }).click()
```

---

### 2. Timing Issues (Race Conditions)

**Symptoms**: Tests pass sometimes, fail others (flakiness)

**Diagnosis**:
```typescript
// Enable slow motion to see what's happening
const browser = await chromium.launch({ slowMo: 1000 })

// Enable trace for step-by-step debugging
await context.tracing.start({ screenshots: true, snapshots: true })
await page.goto('/dashboard')
// ... test steps
await context.tracing.stop({ path: 'trace.zip' })
// View: npx playwright show-trace trace.zip
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Wait for network idle
await page.goto('/dashboard', { waitUntil: 'networkidle' })

// ✅ GOOD: Wait for specific element
await page.waitForSelector('[data-testid="dashboard-loaded"]')

// ✅ GOOD: Wait for API response
await page.waitForResponse(response =>
  response.url().includes('/api/projects') && response.status() === 200
)

// ❌ BAD: Arbitrary timeout
await page.waitForTimeout(3000)  // Flaky!
```

**Fix**:
```typescript
// BEFORE (flaky)
await page.click('[data-testid="open-modal"]')
await page.fill('[data-testid="input"]', 'value')  // May fail if modal not ready

// AFTER (stable)
await page.click('[data-testid="open-modal"]')
await page.waitForSelector('[data-testid="modal-content"]', { state: 'visible' })
await page.fill('[data-testid="input"]', 'value')
```

---

### 3. Element Not Visible/Interactable

**Symptoms**: `Element is not visible` or `Element is outside of the viewport`

**Diagnosis**:
```typescript
// Check element state
const element = page.locator('[data-testid="button"]')
console.log('Visible:', await element.isVisible())
console.log('Enabled:', await element.isEnabled())
console.log('Editable:', await element.isEditable())

// Check bounding box
console.log('BoundingBox:', await element.boundingBox())
```

**Context7 Best Practice**:
```typescript
// Playwright auto-waits for actionability
// Element must be:
// - Attached to DOM
// - Visible
// - Stable (not animating)
// - Enabled
// - Not covered by other elements

// Force click if needed (last resort)
await page.locator('[data-testid="button"]').click({ force: true })
```

**Fix**:
```typescript
// BEFORE (fails on hidden element)
await page.click('[data-testid="hidden-button"]')

// AFTER (wait for visibility)
await page.locator('[data-testid="hidden-button"]').waitFor({ state: 'visible' })
await page.click('[data-testid="hidden-button"]')

// Or scroll into view
await page.locator('[data-testid="footer-button"]').scrollIntoViewIfNeeded()
await page.click('[data-testid="footer-button"]')
```

---

### 4. Navigation Issues

**Symptoms**: `Navigation timeout of 30000ms exceeded`

**Diagnosis**:
```typescript
// Listen to navigation events
page.on('response', response => {
  console.log('Response:', response.url(), response.status())
})

page.on('requestfailed', request => {
  console.log('Failed:', request.url(), request.failure()?.errorText)
})

// Check network activity
await page.goto('/dashboard')
const requests = await page.evaluate(() => performance.getEntries())
console.log('Network requests:', requests.length)
```

**Context7 Best Practice**:
```typescript
// Use waitUntil option
await page.goto('/dashboard', {
  waitUntil: 'networkidle',  // Wait until network is idle
  timeout: 60000  // Increase timeout if needed
})

// Or wait for specific condition
await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
await page.waitForLoadState('networkidle')
```

**Fix**:
```typescript
// BEFORE (fails on slow network)
await page.goto('/dashboard')

// AFTER (robust)
await page.goto('/dashboard', { waitUntil: 'networkidle' })
await page.waitForSelector('[data-testid="dashboard-content"]')
```

---

## Debugging Tools

### 1. Playwright Inspector
```bash
# Run with inspector
npx playwright test --debug

# Or in code
await page.pause()  # Opens inspector at this point
```

### 2. Trace Viewer
```typescript
// Enable tracing
await context.tracing.start({ screenshots: true, snapshots: true })

// Run test
await page.goto('/login')
await page.fill('[data-testid="email"]', 'user@example.com')
await page.click('[data-testid="submit"]')

// Save trace
await context.tracing.stop({ path: 'trace.zip' })

// View trace
// npx playwright show-trace trace.zip
```

### 3. Screenshots & Videos
```typescript
// Screenshot on failure
test('login flow', async ({ page }) => {
  try {
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.click('[data-testid="submit"]')
  } catch (error) {
    await page.screenshot({ path: 'failure.png', fullPage: true })
    throw error
  }
})

// Enable video recording (playwright.config.ts)
export default {
  use: {
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
}
```

### 4. Console Logs
```typescript
// Listen to console messages
page.on('console', msg => {
  console.log('Browser console:', msg.type(), msg.text())
})

// Listen to page errors
page.on('pageerror', error => {
  console.error('Page error:', error.message)
})
```

---

## Best Practices from Context7

### 1. Use Stable Locators
```typescript
// Priority order (most stable to least):
// 1. data-testid
await page.locator('[data-testid="submit"]').click()

// 2. getByRole (accessible & semantic)
await page.getByRole('button', { name: 'Submit' }).click()

// 3. getByLabel (for form inputs)
await page.getByLabel('Email address').fill('user@example.com')

// 4. getByText (avoid if i18n)
await page.getByText('Submit').click()

// 5. CSS selectors (last resort)
await page.locator('button.submit').click()
```

### 2. Auto-Waiting Pattern
```typescript
// Playwright auto-waits, no need for manual waits
await page.click('[data-testid="button"]')  // Waits for actionability

// Only use explicit waits for:
// - Network requests
await page.waitForResponse('**/api/data')

// - Custom conditions
await page.waitForFunction(() => window.dataLoaded === true)

// - Load states
await page.waitForLoadState('networkidle')
```

### 3. Assertions with Auto-Retry
```typescript
// Playwright assertions auto-retry
await expect(page.locator('[data-testid="status"]')).toHaveText('Success')
// Retries for 5 seconds by default

// Configure timeout
await expect(page.locator('[data-testid="status"]')).toHaveText('Success', {
  timeout: 10000
})

// Soft assertions (continue on failure)
await expect.soft(page.locator('[data-testid="optional"]')).toBeVisible()
```

### 4. Page Object Model
```typescript
// Encapsulate page interactions
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email)
    await this.page.fill('[data-testid="password"]', password)
    await this.page.click('[data-testid="submit"]')
  }

  async getErrorMessage() {
    return this.page.locator('[data-testid="error"]').textContent()
  }
}

// Usage
const loginPage = new LoginPage(page)
await loginPage.goto()
await loginPage.login('user@example.com', 'password')
```

---

## Common Fixes Checklist

- [ ] Replace CSS class selectors with `data-testid`
- [ ] Remove arbitrary `waitForTimeout` calls
- [ ] Add `waitForSelector` for dynamic content
- [ ] Use `waitForResponse` for API calls
- [ ] Check element visibility before interaction
- [ ] Enable trace viewer for flaky tests
- [ ] Add error screenshots on failure
- [ ] Use `getByRole` for accessibility
- [ ] Verify navigation with `waitUntil: 'networkidle'`
- [ ] Add console/error listeners for debugging

---

**Update Policy**: Refresh when Playwright releases new debugging features or patterns emerge from Context7.
