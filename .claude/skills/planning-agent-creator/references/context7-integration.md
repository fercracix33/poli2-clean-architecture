# Context7 Integration for Planning Agents

## Why Context7 is Mandatory

Context7 provides **up-to-date best practices** that no model can possess. Technologies evolve, patterns change, and new anti-patterns emerge. Planning agents MUST consult Context7 to ensure:

- Latest library versions and APIs
- Current best practices (not outdated patterns)
- Performance optimizations
- Security updates
- Anti-pattern avoidance

**Without Context7**: Plans become outdated, violate current best practices, and lead to technical debt.

---

## When to Consult Context7

### Phase 1: Agent Creation (MANDATORY)
Query Context7 when **creating the planning agent itself**:

```bash
# General agent best practices
mcp__context7__resolve-library-id "claude code"
mcp__context7__get-library-docs "/anthropics/claude-code" topic="agent creation yaml structure planning"
```

### Phase 2: Domain Planning (MANDATORY)
Query Context7 when **creating implementation plans**:

```bash
# Example: Backend planning agent
mcp__context7__resolve-library-id "tanstack query"
mcp__context7__get-library-docs "/tanstack/query" topic="best practices caching patterns 2025"

# Example: Database planning agent
mcp__context7__resolve-library-id "supabase"
mcp__context7__get-library-docs "/supabase/supabase" topic="rls policies performance optimization"

# Example: Frontend planning agent
mcp__context7__resolve-library-id "react"
mcp__context7__get-library-docs "/facebook/react" topic="best practices hooks patterns 2025"
```

### Phase 3: Review (MANDATORY)
Query Context7 when **reviewing implementations** to catch:
- Outdated patterns
- Anti-patterns
- Performance issues
- Security vulnerabilities

---

## Pre-Built Query Patterns by Agent Type

### Testing Planning Expert

```bash
# Test strategy and coverage
mcp__context7__resolve-library-id "vitest"
mcp__context7__get-library-docs "/vitest-dev/vitest" topic="test patterns mocking best practices"

# E2E testing
mcp__context7__resolve-library-id "playwright"
mcp__context7__get-library-docs "/microsoft/playwright" topic="e2e testing accessibility patterns"

# Accessibility testing
mcp__context7__get-library-docs "/testing-library/react-testing-library" topic="accessibility testing wcag"
```

**What to look for**:
- Current mocking strategies (MSW vs manual mocks)
- Playwright selector best practices
- WCAG 2.1 AA testing patterns
- Coverage tool configurations

---

### Backend Planning Expert

```bash
# Server state management
mcp__context7__resolve-library-id "tanstack query"
mcp__context7__get-library-docs "/tanstack/query" topic="optimistic updates caching strategies error handling"

# Validation
mcp__context7__resolve-library-id "zod"
mcp__context7__get-library-docs "/colinhacks/zod" topic="schema composition validation patterns"

# Form management
mcp__context7__resolve-library-id "react hook form"
mcp__context7__get-library-docs "/react-hook-form/react-hook-form" topic="integration zod validation patterns"
```

**What to look for**:
- TanStack Query v5 breaking changes
- Optimistic update patterns
- Zod schema composition techniques
- React Hook Form integration patterns

---

### Database Planning Expert

```bash
# Supabase and RLS
mcp__context7__resolve-library-id "supabase"
mcp__context7__get-library-docs "/supabase/supabase" topic="row level security best practices performance"

# PostgreSQL optimization
mcp__context7__get-library-docs "/supabase/supabase" topic="postgresql indexing query optimization"

# Migrations
mcp__context7__get-library-docs "/supabase/supabase" topic="database migrations version control"
```

**What to look for**:
- RLS policy anti-patterns (circular dependencies)
- Index strategies for performance
- Migration rollback patterns
- Multi-tenant isolation techniques

---

### Frontend Planning Expert

```bash
# React patterns
mcp__context7__resolve-library-id "react"
mcp__context7__get-library-docs "/facebook/react" topic="hooks patterns composition best practices 2025"

# UI components
mcp__context7__resolve-library-id "shadcn ui"
mcp__context7__get-library-docs "/shadcn/ui" topic="component composition patterns"

# Accessibility
mcp__context7__get-library-docs "/facebook/react" topic="accessibility aria wcag patterns"

# Internationalization
mcp__context7__resolve-library-id "next-intl"
mcp__context7__get-library-docs "/amannn/next-intl" topic="cookie based locale management"
```

**What to look for**:
- React 18+ concurrent features
- shadcn/ui composition patterns
- WCAG 2.1 AA compliance techniques
- next-intl cookie-based patterns

---

### shadcn UI/UX Planning Expert

```bash
# Component library
mcp__context7__resolve-library-id "shadcn ui"
mcp__context7__get-library-docs "/shadcn/ui" topic="component variants composition theming"

# Styling
mcp__context7__resolve-library-id "tailwind css"
mcp__context7__get-library-docs "/tailwindlabs/tailwindcss" topic="animation utility classes best practices"

# Animations
mcp__context7__resolve-library-id "framer motion"
mcp__context7__get-library-docs "/framer/motion" topic="react animations performance"
```

**What to look for**:
- shadcn/ui variant patterns
- Tailwind CSS v4 changes
- Framer Motion performance tips
- Dark mode implementation

---

### Security Planning Expert

```bash
# Client-side authorization
mcp__context7__resolve-library-id "casl"
mcp__context7__get-library-docs "/stalniy/casl" topic="react integration ability definition patterns"

# Server-side security
mcp__context7__resolve-library-id "supabase"
mcp__context7__get-library-docs "/supabase/supabase" topic="row level security authorization patterns"

# Input validation
mcp__context7__resolve-library-id "zod"
mcp__context7__get-library-docs "/colinhacks/zod" topic="input sanitization xss prevention"

# OWASP
mcp__context7__get-library-docs "/anthropics/claude-code" topic="owasp top 10 mitigation strategies"
```

**What to look for**:
- CASL + RLS alignment patterns
- Defense-in-depth strategies
- XSS/CSRF prevention techniques
- OWASP Top 10 (2023) mitigations

---

### Performance Planning Expert

```bash
# Caching strategies
mcp__context7__resolve-library-id "tanstack query"
mcp__context7__get-library-docs "/tanstack/query" topic="caching strategies stale time gc time"

# Next.js optimization
mcp__context7__resolve-library-id "next.js"
mcp__context7__get-library-docs "/vercel/next.js" topic="performance optimization code splitting lazy loading"

# React performance
mcp__context7__resolve-library-id "react"
mcp__context7__get-library-docs "/facebook/react" topic="performance optimization memoization"

# Core Web Vitals
mcp__context7__get-library-docs "/anthropics/claude-code" topic="core web vitals optimization lighthouse"
```

**What to look for**:
- TanStack Query caching strategies
- Next.js 14+ App Router optimizations
- React memo/useMemo patterns
- Lighthouse scoring techniques

---

## Query Construction Patterns

### Pattern 1: Technology + Topic
```bash
mcp__context7__get-library-docs "/{org}/{project}" topic="{specific_topic} best practices"
```

### Pattern 2: Technology + Version
```bash
mcp__context7__resolve-library-id "{technology} v{version}"
mcp__context7__get-library-docs "/{org}/{project}/{version}" topic="{topic}"
```

### Pattern 3: Multi-topic Query
```bash
topic="{topic1} {topic2} {topic3} patterns anti-patterns"
```

**Best practices**:
- Be specific: "rls performance" > "database"
- Include "best practices" or "patterns"
- Add "anti-patterns" to learn what to avoid
- Include year "2025" for latest info

---

## Documenting Context7 Findings

### In Planning Documents (`01-plan.md`)

Always reference Context7 findings:

```markdown
## Backend Use Case Implementation

Based on Context7 consultation (TanStack Query v5):

**Recommended patterns**:
1. Use `useMutation` for create/update/delete operations
2. Implement optimistic updates for better UX
3. Configure `gcTime` to 5 minutes for inactive queries

**Anti-patterns to avoid** (from Context7):
- ❌ Using `useEffect` for data fetching
- ❌ Manual cache invalidation (use `invalidateQueries`)
- ❌ Ignoring error retry strategies

**References**:
- Context7: /tanstack/query - "optimistic updates patterns"
- Context7: /tanstack/query - "error handling retry strategies"
```

### In Review Documents (`review-checkpoint-N.md`)

Reference Context7 when identifying issues:

```markdown
## Issues Found

### 1. Outdated TanStack Query Pattern
**Location**: `src/features/tasks/hooks/useCreateTask.ts:15`

**Issue**: Using deprecated `onSuccess` callback in `useMutation`

**Context7 Reference**: /tanstack/query v5 - "`onSuccess` removed in v5"

**Recommendation**: Use `onSettled` or query invalidation instead:
\```typescript
// ❌ Old pattern (v4)
useMutation({
  onSuccess: () => queryClient.invalidateQueries()
})

// ✅ New pattern (v5)
useMutation({
  onSettled: () => queryClient.invalidateQueries()
})
\```
```

---

## Context7 Refresh Policy

**When to re-query**:
- Major version changes (React 18 → 19)
- Breaking changes announced
- New anti-patterns discovered
- Security vulnerabilities disclosed
- Performance patterns evolve

**Frequency**:
- Planning phase: ALWAYS query
- Review phase: Query if patterns seem outdated
- Quarterly: Refresh reference docs

---

## Error Handling

### Context7 Not Available
If Context7 is unavailable:

1. **Fallback**: Use `references/{domain}-patterns.md` if available
2. **Document**: Note in plan that Context7 was unavailable
3. **Flag**: Mark plan for future Context7 validation
4. **Proceed**: Use documented best practices

### Library Not Found
If library not in Context7:

1. **Search variants**: Try different names (e.g., "react-hook-form" vs "react hook form")
2. **Official docs**: Fall back to official documentation
3. **Document**: Note alternative source used
4. **Community patterns**: Check GitHub issues/discussions

---

## Success Metrics

Context7 integration is successful when:
- ✅ All plans reference specific Context7 queries
- ✅ Best practices are current (not outdated)
- ✅ Anti-patterns are explicitly avoided
- ✅ Reviews catch outdated patterns
- ✅ References are documented for traceability
