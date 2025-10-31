# Next.js Error Debugging Reference

**Purpose**: Patterns for diagnosing and fixing Next.js specific errors.

**When to Consult**: Hydration errors, SSR issues, client/server boundary problems, route errors.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "hydration errors SSR debugging app router server components",
  tokens: 4000
})
```

---

## Common Next.js Issues

### 1. Hydration Errors

**Symptoms**: `Text content does not match server-rendered HTML` or `Hydration failed because the initial UI does not match what was rendered on the server`

**Diagnosis**:
```typescript
// Check browser console for detailed error
// Example: "Expected server HTML to contain a matching <div> in <main>"

// Common causes:
// 1. Different content on server vs client
// 2. Browser extensions modifying DOM
// 3. Date/time rendering
// 4. Random values (Math.random(), uuid)
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Same content on server and client
export default function Component() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>  // Same on server and client
  }

  return <div>{new Date().toISOString()}</div>  // Only on client
}

// ✅ GOOD: Suppress hydration warning for specific element
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>

// ❌ BAD: Different content on server vs client
export default function Component() {
  return <div>{new Date().toISOString()}</div>
  // Server renders one time, client renders different time!
}

// ❌ BAD: Using window/localStorage on server
export default function Component() {
  const theme = localStorage.getItem('theme')  // localStorage undefined on server!
  return <div className={theme}>Content</div>
}
```

**Fix**:
```typescript
// BEFORE (hydration error)
'use client'
export default function UserGreeting() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : 'Good afternoon'

  return <h1>{greeting}!</h1>
  // Server renders "Good morning", client might render "Good afternoon"
}

// AFTER (no hydration error)
'use client'
import { useState, useEffect } from 'react'

export default function UserGreeting() {
  const [greeting, setGreeting] = useState('Hello')  // Default for server

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? 'Good morning' : 'Good afternoon')
  }, [])

  return <h1>{greeting}!</h1>
}
```

---

### 2. Server/Client Component Boundary Issues

**Symptoms**: `You're importing a component that needs X. It only works in a Client Component` or `async/await is not yet supported in Client Components`

**Diagnosis**:
```typescript
// Check if 'use client' is needed
// Server Components (default):
// - Can be async
// - Can't use hooks (useState, useEffect)
// - Can't use browser APIs (window, localStorage)
// - Can't use event handlers (onClick, onChange)

// Client Components ('use client'):
// - Can use hooks
// - Can use browser APIs
// - Can use event handlers
// - Can't be async (use useEffect instead)
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Server Component (data fetching)
export default async function ProjectsPage() {
  const projects = await getProjects()  // Async allowed in Server Component

  return (
    <div>
      <h1>Projects</h1>
      <ProjectList projects={projects} />
    </div>
  )
}

// ✅ GOOD: Client Component (interactivity)
'use client'
import { useState } from 'react'

export function ProjectList({ projects }) {
  const [filter, setFilter] = useState('')

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {projects.filter(p => p.name.includes(filter)).map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  )
}

// ❌ BAD: Async Client Component
'use client'
export default async function ProjectsPage() {  // Error!
  const projects = await getProjects()
  return <div>{/* ... */}</div>
}

// ❌ BAD: Hooks in Server Component
export default function ProjectsPage() {
  const [filter, setFilter] = useState('')  // Error! No 'use client'
  return <div>{/* ... */}</div>
}
```

**Fix**:
```typescript
// BEFORE (error: hooks in Server Component)
export default function DashboardPage() {
  const [projects, setProjects] = useState([])  // Error!

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(setProjects)
  }, [])

  return <div>{projects.map(p => <div key={p.id}>{p.name}</div>)}</div>
}

// AFTER (proper Server Component)
async function getProjects() {
  const res = await fetch('http://localhost:3000/api/projects', {
    cache: 'no-store'  // Always fresh data
  })
  return res.json()
}

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <div>
      {projects.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
```

---

### 3. Route Handler Issues

**Symptoms**: `405 Method Not Allowed` or `Route handler returned undefined`

**Diagnosis**:
```typescript
// Check route file location
// app/api/projects/route.ts ✅
// app/api/projects.ts ❌ (wrong location)

// Check HTTP method exports
// export async function GET(request: Request) ✅
// export async function get(request: Request) ❌ (lowercase)

// Check return value
// return Response.json({ data }) ✅
// return { data } ❌ (must be Response object)
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Proper route handler structure
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter')

  const tasks = await getTasks(filter)

  return NextResponse.json(tasks)  // Return Response
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const task = await createTask(body)

  return NextResponse.json(task, { status: 201 })
}

// ✅ GOOD: Dynamic route
// app/api/tasks/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = await getTask(params.id)

  if (!task) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(task)
}

// ❌ BAD: Wrong export name (lowercase)
export async function get(request: NextRequest) {  // Error!
  return NextResponse.json({ data: 'test' })
}

// ❌ BAD: Not returning Response
export async function GET(request: NextRequest) {
  return { data: 'test' }  // Error! Must return Response
}
```

**Fix**:
```typescript
// BEFORE (405 Method Not Allowed)
// app/api/projects/route.ts
export async function get(request: Request) {  // Lowercase!
  const projects = await getProjects()
  return new Response(JSON.stringify(projects))
}

// AFTER (works)
import { NextResponse } from 'next/server'

export async function GET(request: Request) {  // Uppercase!
  const projects = await getProjects()
  return NextResponse.json(projects)
}
```

---

### 4. Middleware Issues

**Symptoms**: Middleware not running or infinite redirects

**Diagnosis**:
```typescript
// Check middleware location
// middleware.ts (root) ✅
// app/middleware.ts ❌ (wrong location)

// Check matcher config
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Middleware structure (root middleware.ts)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  // Redirect to login if not authenticated
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
}

// ❌ BAD: Infinite redirect loop
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  // Middleware runs on /login too! Infinite loop!
}

// ❌ BAD: Matcher too broad (runs on every route)
export const config = {
  matcher: '/:path*',  // Runs on EVERYTHING including _next/static
}
```

**Fix**:
```typescript
// BEFORE (infinite redirect)
export function middleware(request: NextRequest) {
  const isAuthenticated = checkAuth(request)

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',  // Runs on /login too!
}

// AFTER (no infinite loop)
export function middleware(request: NextRequest) {
  const isAuthenticated = checkAuth(request)
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Don't redirect if already on login page
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect away from login if authenticated
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}
```

---

## Debugging Tools

### 1. Next.js Error Overlay
```typescript
// Development mode shows detailed errors
// Enable in next.config.js
module.exports = {
  reactStrictMode: true,  // Helps catch issues early
}
```

### 2. Logging
```typescript
// Server Component logging (shows in terminal)
export default async function Page() {
  console.log('Server log')  // Terminal
  const data = await getData()
  return <div>{data}</div>
}

// Client Component logging (shows in browser)
'use client'
export default function Page() {
  console.log('Client log')  // Browser console
  return <div>Content</div>
}
```

### 3. Request Headers Inspection
```typescript
// Route handler
export async function GET(request: NextRequest) {
  console.log('Headers:', Object.fromEntries(request.headers))
  console.log('Cookies:', request.cookies.getAll())
  console.log('URL:', request.url)

  return NextResponse.json({ ok: true })
}
```

---

## Common Fixes Checklist

- [ ] Add `'use client'` for components using hooks/browser APIs
- [ ] Use `suppressHydrationWarning` for date/time content
- [ ] Ensure server and client render same initial content
- [ ] Use uppercase HTTP methods (GET, POST, not get, post)
- [ ] Return `NextResponse` from route handlers
- [ ] Place middleware in root (not in app directory)
- [ ] Avoid infinite redirects in middleware
- [ ] Use `matcher` to limit middleware scope
- [ ] Use `useEffect` for browser-only code
- [ ] Fetch data in Server Components, not Client Components

---

**Update Policy**: Refresh when Next.js releases new features or patterns emerge from Context7.
