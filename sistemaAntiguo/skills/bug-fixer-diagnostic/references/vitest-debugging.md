# Vitest Unit/Integration Test Debugging Reference

**Purpose**: Patterns for diagnosing and fixing Vitest test failures.

**When to Consult**: Unit tests failing, mock issues, async test problems, coverage gaps.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/vitest-dev/vitest",
  topic: "debugging test failures mocks async testing coverage",
  tokens: 4000
})
```

---

## Common Vitest Issues

### 1. Async Test Failures

**Symptoms**: `Test timed out in 5000ms` or `Promise not resolved`

**Diagnosis**:
```typescript
// Check if promise is returned
test('async operation', async () => {
  const result = await fetchData()  // Missing return or await?
  expect(result).toBe('data')
})

// Enable verbose logging
vi.setConfig({ testTimeout: 10000 })
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Always await async operations
test('fetches user data', async () => {
  const user = await fetchUser(1)
  expect(user.name).toBe('John')
})

// ✅ GOOD: Use waitFor for delayed assertions
import { waitFor } from '@testing-library/react'

test('updates after delay', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })
})

// ❌ BAD: Not awaiting async
test('fetches data', () => {
  fetchData().then(data => {
    expect(data).toBe('value')  // Assertion never runs!
  })
})
```

**Fix**:
```typescript
// BEFORE (fails silently)
test('creates task', () => {
  createTask({ title: 'Test' }).then(task => {
    expect(task.id).toBeDefined()
  })
})

// AFTER (correct)
test('creates task', async () => {
  const task = await createTask({ title: 'Test' })
  expect(task.id).toBeDefined()
})
```

---

### 2. Mock Issues

**Symptoms**: `TypeError: Cannot read property of undefined` or mocks not working

**Diagnosis**:
```typescript
// Check if mock is properly configured
console.log('Mock calls:', vi.mocked(fetchData).mock.calls)
console.log('Mock results:', vi.mocked(fetchData).mock.results)

// Verify mock is hoisted
vi.mock('@/lib/supabase')  // Must be at top level
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  })),
}))

// ✅ GOOD: Use vi.mocked for type safety
import { fetchData } from '@/lib/api'
vi.mock('@/lib/api')

test('calls API', async () => {
  vi.mocked(fetchData).mockResolvedValue({ data: 'test' })
  const result = await fetchData()
  expect(result.data).toBe('test')
})

// ❌ BAD: Partial mock (doesn't work)
vi.mock('@/lib/supabase', () => ({
  // Missing other exports!
  createClient: vi.fn(),
}))
```

**Fix**:
```typescript
// BEFORE (TypeError: supabase.from is not a function)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// AFTER (complete mock)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
  },
}))
```

---

### 3. React Component Testing Issues

**Symptoms**: `Unable to find element` or `Component not rendering`

**Diagnosis**:
```typescript
import { screen, render } from '@testing-library/react'

test('renders component', () => {
  render(<Component />)

  // Debug current DOM
  screen.debug()

  // Check what's rendered
  console.log(screen.getByRole('button'))
})
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Use Testing Library queries
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('button click', async () => {
  const user = userEvent.setup()
  render(<Button onClick={handleClick}>Click Me</Button>)

  // Query by role (accessible)
  const button = screen.getByRole('button', { name: /click me/i })
  await user.click(button)

  expect(handleClick).toHaveBeenCalled()
})

// ❌ BAD: Query by class (brittle)
test('button click', () => {
  render(<Button onClick={handleClick}>Click Me</Button>)
  const button = container.querySelector('.btn-primary')  // Brittle!
  fireEvent.click(button)
})
```

**Fix**:
```typescript
// BEFORE (fails with "Unable to find element")
test('shows error message', () => {
  render(<LoginForm />)
  fireEvent.click(screen.getByText('Submit'))
  expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
})

// AFTER (waits for async state update)
test('shows error message', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() => {
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })
})
```

---

### 4. Test Isolation Issues

**Symptoms**: Tests pass individually but fail when run together

**Diagnosis**:
```typescript
// Check for shared state
let sharedState = {}  // ⚠️ Shared between tests!

test('test 1', () => {
  sharedState.value = 'test1'
  expect(sharedState.value).toBe('test1')
})

test('test 2', () => {
  // May still have value from test 1!
  expect(sharedState.value).toBeUndefined()  // Fails!
})
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Use beforeEach for isolation
describe('TaskService', () => {
  let service: TaskService

  beforeEach(() => {
    vi.clearAllMocks()  // Clear mock history
    service = new TaskService()  // Fresh instance
  })

  test('creates task', async () => {
    const task = await service.create({ title: 'Test' })
    expect(task.id).toBeDefined()
  })

  test('updates task', async () => {
    const task = await service.update(1, { title: 'Updated' })
    expect(task.title).toBe('Updated')
  })
})

// ✅ GOOD: Clean up after tests
afterEach(() => {
  vi.restoreAllMocks()
  cleanup()  // React Testing Library cleanup
})
```

**Fix**:
```typescript
// BEFORE (shared mock state)
const mockFetch = vi.fn()

test('test 1', async () => {
  mockFetch.mockResolvedValue({ data: 'test1' })
  const result = await fetch()
  expect(result.data).toBe('test1')
})

test('test 2', async () => {
  // Still has mockResolvedValue from test 1!
  mockFetch.mockResolvedValue({ data: 'test2' })
  const result = await fetch()
  expect(result.data).toBe('test2')
})

// AFTER (isolated)
describe('fetch tests', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    mockFetch.mockClear()  // Clear call history
  })

  test('test 1', async () => {
    mockFetch.mockResolvedValueOnce({ data: 'test1' })
    const result = await fetch()
    expect(result.data).toBe('test1')
  })

  test('test 2', async () => {
    mockFetch.mockResolvedValueOnce({ data: 'test2' })
    const result = await fetch()
    expect(result.data).toBe('test2')
  })
})
```

---

## Debugging Tools

### 1. Vitest UI
```bash
# Run with UI
npm run test -- --ui

# Opens browser with test results, coverage, and console logs
```

### 2. Debug in VS Code
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test", "--", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### 3. Console Logging
```typescript
// Use console.log in tests
test('debug test', () => {
  const result = calculateTotal([1, 2, 3])
  console.log('Result:', result)  // Shows in test output
  expect(result).toBe(6)
})

// Or use vi.fn to inspect calls
const mockFn = vi.fn()
mockFn('arg1', 'arg2')
console.log('Calls:', mockFn.mock.calls)  // [['arg1', 'arg2']]
```

### 4. Coverage Reports
```bash
# Generate coverage
npm run test -- --coverage

# Open HTML report
open coverage/index.html

# Coverage threshold (vitest.config.ts)
export default {
  test: {
    coverage: {
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
  },
}
```

---

## Best Practices from Context7

### 1. AAA Pattern (Arrange, Act, Assert)
```typescript
test('creates task with valid data', async () => {
  // Arrange
  const input = { title: 'Test Task', description: 'Test description' }
  const mockService = vi.mocked(taskService)
  mockService.create.mockResolvedValue({ id: 1, ...input })

  // Act
  const result = await createTask(input)

  // Assert
  expect(result.id).toBeDefined()
  expect(result.title).toBe(input.title)
  expect(mockService.create).toHaveBeenCalledWith(input)
})
```

### 2. Test Naming Convention
```typescript
// ✅ GOOD: Descriptive names
test('throws ValidationError when title is empty', () => {
  expect(() => createTask({ title: '' })).toThrow(ValidationError)
})

test('returns null when user is not found', async () => {
  const user = await findUser(999)
  expect(user).toBeNull()
})

// ❌ BAD: Vague names
test('test 1', () => { /* ... */ })
test('works', () => { /* ... */ })
```

### 3. Mock Only External Dependencies
```typescript
// ✅ GOOD: Mock Supabase, fetch, external APIs
vi.mock('@/lib/supabase')
vi.mock('@/lib/external-api')

// ✅ GOOD: Don't mock internal modules (test real behavior)
import { calculateTotal } from '@/lib/utils'  // Real implementation
test('calculates total', () => {
  expect(calculateTotal([1, 2, 3])).toBe(6)
})

// ❌ BAD: Mocking everything (tests nothing)
vi.mock('@/lib/utils')
test('calculates total', () => {
  vi.mocked(calculateTotal).mockReturnValue(6)
  expect(calculateTotal([1, 2, 3])).toBe(6)  // Pointless!
})
```

### 4. Use Factories for Test Data
```typescript
// Create test data factories
function createMockTask(overrides = {}) {
  return {
    id: 1,
    title: 'Test Task',
    description: 'Test description',
    status: 'pending',
    createdAt: new Date(),
    ...overrides,
  }
}

// Usage
test('updates task status', async () => {
  const task = createMockTask({ status: 'pending' })
  const updated = await updateTaskStatus(task.id, 'completed')
  expect(updated.status).toBe('completed')
})
```

---

## Common Fixes Checklist

- [ ] Add `async/await` to all async tests
- [ ] Use `vi.clearAllMocks()` in `beforeEach`
- [ ] Mock external dependencies at top level
- [ ] Use `waitFor` for async state updates
- [ ] Query by role/label (accessible queries)
- [ ] Use `userEvent` instead of `fireEvent`
- [ ] Add proper TypeScript types to mocks
- [ ] Isolate test state (no shared variables)
- [ ] Use test data factories
- [ ] Follow AAA pattern (Arrange, Act, Assert)

---

**Update Policy**: Refresh when Vitest releases new features or patterns emerge from Context7.
