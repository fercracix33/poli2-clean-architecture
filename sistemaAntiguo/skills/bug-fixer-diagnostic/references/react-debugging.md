# React Debugging Reference

**Purpose**: Patterns for diagnosing and fixing React hooks and component issues.

**When to Consult**: Hook dependency issues, re-render problems, state bugs, infinite loops.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks debugging useEffect dependency array re-renders state",
  tokens: 4000
})
```

---

## Common React Issues

### 1. useEffect Infinite Loop

**Symptoms**: Browser freezes, `Maximum update depth exceeded` error, rapid console logs

**Diagnosis**:
```typescript
// Add logging to track effect runs
useEffect(() => {
  console.log('Effect running!', new Date().toISOString())
  // ... effect code
}, [dependencies])

// If console floods with logs, you have infinite loop
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Primitive dependencies (stable)
useEffect(() => {
  fetchData(userId)
}, [userId])  // userId is number/string (stable)

// ✅ GOOD: Memoized object dependencies
const filters = useMemo(() => ({
  status: 'active',
  priority: 'high'
}), [])  // Empty deps = runs once

useEffect(() => {
  fetchTasks(filters)
}, [filters])  // filters is memoized (stable reference)

// ✅ GOOD: useCallback for function dependencies
const handleUpdate = useCallback((id: number) => {
  updateTask(id)
}, [])  // Empty deps = function never changes

useEffect(() => {
  subscribe(handleUpdate)
  return () => unsubscribe(handleUpdate)
}, [handleUpdate])  // handleUpdate is memoized

// ❌ BAD: Object literal in dependency array
useEffect(() => {
  fetchTasks({ status: 'active' })
}, [{ status: 'active' }])  // New object every render! Infinite loop!

// ❌ BAD: Function in dependency array (not memoized)
useEffect(() => {
  const handleClick = () => console.log('clicked')
  document.addEventListener('click', handleClick)
  return () => document.removeEventListener('click', handleClick)
}, [handleClick])  // handleClick not defined outside! Error!

// ❌ BAD: State setter in dependency array
const [count, setCount] = useState(0)
useEffect(() => {
  setCount(count + 1)
}, [count])  // Infinite loop! count changes → effect runs → count changes → ...
```

**Fix**:
```typescript
// BEFORE (infinite loop)
function TaskList() {
  const [tasks, setTasks] = useState([])
  const filters = { status: 'active', priority: 'high' }  // New object every render!

  useEffect(() => {
    fetchTasks(filters).then(setTasks)
  }, [filters])  // filters changes every render → infinite loop

  return <div>{/* ... */}</div>
}

// AFTER (stable dependencies)
function TaskList() {
  const [tasks, setTasks] = useState([])

  // Option 1: Move object inside effect
  useEffect(() => {
    const filters = { status: 'active', priority: 'high' }
    fetchTasks(filters).then(setTasks)
  }, [])  // Empty deps = runs once

  // Option 2: Use useMemo
  const filters = useMemo(() => ({
    status: 'active',
    priority: 'high'
  }), [])

  useEffect(() => {
    fetchTasks(filters).then(setTasks)
  }, [filters])  // filters is stable

  return <div>{/* ... */}</div>
}
```

---

### 2. Stale Closure Bug

**Symptoms**: State value inside useEffect/callback is always the initial value

**Diagnosis**:
```typescript
// Check if effect/callback uses state but doesn't list it in dependencies
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    console.log(count)  // Always logs 0!
  }, 1000)
  return () => clearInterval(interval)
}, [])  // Missing 'count' in dependencies
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Use functional state updates
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1)  // Uses previous value (no stale closure)
  }, 1000)
  return () => clearInterval(interval)
}, [])  // No count dependency needed!

// ✅ GOOD: Include state in dependencies
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    console.log(count)  // Always current value
  }, 1000)
  return () => clearInterval(interval)
}, [count])  // Re-create interval when count changes

// ✅ GOOD: Use ref for values that don't trigger re-renders
const countRef = useRef(0)

useEffect(() => {
  const interval = setInterval(() => {
    console.log(countRef.current)  // Always current value
  }, 1000)
  return () => clearInterval(interval)
}, [])  // countRef.current can change without re-creating interval

// ❌ BAD: Using state without dependency
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1)  // count is stale! Always 0 + 1 = 1
  }, 1000)
  return () => clearInterval(interval)
}, [])  // Missing count dependency
```

**Fix**:
```typescript
// BEFORE (stale closure: count always 0)
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1)  // count is 0 (stale closure)
    }, 1000)
    return () => clearInterval(interval)
  }, [])  // Empty deps

  return <div>{count}</div>
}

// AFTER (functional update: no stale closure)
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1)  // Uses latest value
    }, 1000)
    return () => clearInterval(interval)
  }, [])  // Empty deps OK

  return <div>{count}</div>
}
```

---

### 3. Unnecessary Re-renders

**Symptoms**: Component re-renders many times, slow performance, laggy UI

**Diagnosis**:
```typescript
// Add logging to track renders
function MyComponent() {
  console.log('Rendering MyComponent')
  return <div>Content</div>
}

// Or use React DevTools Profiler
// Chrome DevTools → Components tab → ⚙️ Settings → Highlight updates
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Memoize expensive calculations
function TaskList({ tasks }) {
  const sortedTasks = useMemo(() => {
    console.log('Sorting tasks')
    return tasks.sort((a, b) => a.priority - b.priority)
  }, [tasks])  // Only re-sort when tasks change

  return <div>{sortedTasks.map(t => <Task key={t.id} task={t} />)}</div>
}

// ✅ GOOD: Memoize callbacks passed to children
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log('Clicked')
  }, [])  // Function never changes

  return (
    <div>
      <Child onClick={handleClick} />  {/* Child doesn't re-render */}
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

const Child = React.memo(({ onClick }) => {
  console.log('Rendering Child')
  return <button onClick={onClick}>Click me</button>
})

// ✅ GOOD: Split state to minimize re-renders
// BEFORE: Single state object
const [state, setState] = useState({ count: 0, text: '' })
// Changing count re-renders everything that uses state

// AFTER: Separate state variables
const [count, setCount] = useState(0)
const [text, setText] = useState('')
// Changing count only re-renders components that use count

// ❌ BAD: Creating new objects/functions in render
function Parent() {
  return (
    <Child onClick={() => console.log('clicked')} />  // New function every render!
    // Child re-renders even if memoized
  )
}

// ❌ BAD: Not memoizing expensive calculations
function TaskList({ tasks }) {
  const sortedTasks = tasks.sort((a, b) => a.priority - b.priority)
  // Re-sorts on EVERY render, even if tasks didn't change!
  return <div>{sortedTasks.map(t => <Task key={t.id} task={t} />)}</div>
}
```

**Fix**:
```typescript
// BEFORE (child re-renders on every parent render)
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <ExpensiveChild
        data={{ value: 'test' }}  // New object every render!
        onClick={() => console.log('click')}  // New function every render!
      />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

const ExpensiveChild = React.memo(({ data, onClick }) => {
  console.log('Rendering ExpensiveChild')  // Logs on every Parent render!
  return <div onClick={onClick}>{data.value}</div>
})

// AFTER (child only re-renders when props actually change)
function Parent() {
  const [count, setCount] = useState(0)

  const data = useMemo(() => ({ value: 'test' }), [])  // Stable object
  const handleClick = useCallback(() => {
    console.log('click')
  }, [])  // Stable function

  return (
    <div>
      <ExpensiveChild data={data} onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

const ExpensiveChild = React.memo(({ data, onClick }) => {
  console.log('Rendering ExpensiveChild')  // Only logs on mount!
  return <div onClick={onClick}>{data.value}</div>
})
```

---

### 4. State Not Updating

**Symptoms**: setState called but component doesn't re-render, state value unchanged

**Diagnosis**:
```typescript
// Check if state is being mutated
const [tasks, setTasks] = useState([])

const addTask = (task) => {
  tasks.push(task)  // Mutation! React doesn't detect change
  setTasks(tasks)   // Same array reference → no re-render
}

// Correct way
const addTask = (task) => {
  setTasks([...tasks, task])  // New array → re-render
}
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Immutable state updates
const [tasks, setTasks] = useState([])

// Add item
const addTask = (task) => {
  setTasks([...tasks, task])  // New array
}

// Remove item
const removeTask = (id) => {
  setTasks(tasks.filter(t => t.id !== id))  // New array
}

// Update item
const updateTask = (id, updates) => {
  setTasks(tasks.map(t =>
    t.id === id ? { ...t, ...updates } : t  // New objects
  ))
}

// ✅ GOOD: Functional state updates (for async operations)
const increment = () => {
  setCount(prev => prev + 1)  // Uses latest value
}

// ✅ GOOD: Object state updates
const [user, setUser] = useState({ name: '', email: '' })

const updateEmail = (email) => {
  setUser({ ...user, email })  // Spread previous state
}

// ❌ BAD: Mutating state directly
const addTask = (task) => {
  tasks.push(task)  // Mutation!
  setTasks(tasks)   // Same reference → no re-render
}

const updateTask = (id, updates) => {
  const task = tasks.find(t => t.id === id)
  task.title = updates.title  // Mutation!
  setTasks(tasks)  // Same reference → no re-render
}

// ❌ BAD: Multiple synchronous setState calls (may batch incorrectly)
const increment3Times = () => {
  setCount(count + 1)  // All use same 'count' value
  setCount(count + 1)
  setCount(count + 1)
  // Result: count + 1, not count + 3!
}

// Correct:
const increment3Times = () => {
  setCount(prev => prev + 1)
  setCount(prev => prev + 1)
  setCount(prev => prev + 1)
  // Result: count + 3 ✅
}
```

**Fix**:
```typescript
// BEFORE (state not updating)
function TaskList() {
  const [tasks, setTasks] = useState([])

  const addTask = (task) => {
    tasks.push(task)  // Mutation!
    setTasks(tasks)   // No re-render (same reference)
  }

  const updateTask = (id, title) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      task.title = title  // Mutation!
      setTasks(tasks)  // No re-render
    }
  }

  return <div>{/* ... */}</div>
}

// AFTER (immutable updates)
function TaskList() {
  const [tasks, setTasks] = useState([])

  const addTask = (task) => {
    setTasks([...tasks, task])  // New array
  }

  const updateTask = (id, title) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, title } : t  // New object for updated task
    ))
  }

  return <div>{/* ... */}</div>
}
```

---

## Debugging Tools

### 1. React DevTools
```bash
# Install Chrome extension: React Developer Tools

# Features:
# - Components tree
# - Props/State inspection
# - Profiler (render timing)
# - Highlight updates
```

### 2. useDebugValue
```typescript
// Custom hook debugging
function useCustomHook(value) {
  useDebugValue(value, v => `Custom: ${v}`)  // Shows in DevTools
  return value
}
```

### 3. Strict Mode
```typescript
// Detects side effects and issues
<React.StrictMode>
  <App />
</React.StrictMode>

// In development, renders components twice to catch bugs
```

---

## Common Fixes Checklist

- [ ] Use functional state updates in effects/callbacks
- [ ] Include all dependencies in useEffect array
- [ ] Memoize objects/functions passed to child components
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Never mutate state directly (use spread/map/filter)
- [ ] Use primitive values in dependency arrays when possible
- [ ] Wrap child components in `React.memo` if they re-render often
- [ ] Split large state objects into smaller pieces
- [ ] Use refs for values that don't need to trigger re-renders

---

**Update Policy**: Refresh when React releases new features or patterns emerge from Context7.
