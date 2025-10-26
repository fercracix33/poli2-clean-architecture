# Bug Fixer Diagnostic Skill References

References are loaded **on demand** when specific technical guidance is needed during bug diagnosis.

## Available References

1. **playwright-debugging.md** - Playwright E2E test debugging patterns
   - When to consult: E2E tests failing, selector issues, timing problems
   - Context7 equivalent: `/microsoft/playwright` with topic "debugging selectors wait"

2. **vitest-debugging.md** - Vitest unit/integration test debugging
   - When to consult: Unit tests failing, mock issues, async test problems
   - Context7 equivalent: `/vitest-dev/vitest` with topic "debugging test failures"

3. **zod-validation.md** - Zod schema debugging and validation patterns
   - When to consult: Validation errors, schema mismatches, safeParse issues
   - Context7 equivalent: `/colinhacks/zod` with topic "safeParse error handling"

4. **supabase-rls.md** - Supabase RLS policy debugging
   - When to consult: Data access issues, permission errors, RLS blocks
   - Context7 equivalent: `/supabase/supabase` with topic "RLS debugging policies"

5. **nextjs-errors.md** - Next.js specific error patterns
   - When to consult: Hydration errors, SSR issues, client/server boundary problems
   - Context7 equivalent: `/vercel/next.js` with topic "hydration errors debugging"

6. **react-debugging.md** - React hooks and component debugging
   - When to consult: Hook dependency issues, re-render problems, state bugs
   - Context7 equivalent: `/facebook/react` with topic "hooks debugging useEffect"

## Update Policy

References should be refreshed when:
- Context7 documentation changes
- New debugging patterns emerge
- Technology versions change (Next.js, React, Playwright updates)
- Common mistakes are identified through usage
- New MCP debugging tools become available
