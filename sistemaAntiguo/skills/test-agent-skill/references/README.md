# Test Agent Skill References

References are loaded **on demand** when specific technical guidance is needed.

## Available References

1. **vitest-patterns.md** - Vitest mocking and testing patterns
   - When to consult: Creating unit/integration tests, mocking dependencies
   - Context7 equivalent: `/vitest-dev/vitest` (topic: "mocking vi.mock vi.spyOn")

2. **playwright-e2e-patterns.md** - Playwright E2E testing best practices
   - When to consult: Creating E2E tests, user flow testing, accessibility
   - Context7 equivalent: `/microsoft/playwright` (topic: "user flows accessibility selectors")

3. **zod-testing-patterns.md** - Zod schema validation testing
   - When to consult: Testing entities, schema validation
   - Context7 equivalent: `/colinhacks/zod` (topic: "safeParse testing")

4. **test-structure-guide.md** - Test organization and structure patterns
   - When to consult: Organizing test suites, naming conventions
   - Context7 equivalent: Testing best practices documentation

5. **coverage-and-validation.md** - Coverage targets and validation strategies
   - When to consult: Ensuring test completeness, coverage thresholds
   - Context7 equivalent: Testing coverage best practices

## Update Policy

References should be refreshed when:
- Context7 documentation changes
- Vitest/Playwright versions update
- New testing patterns emerge
- Common mistakes are identified
- TDD best practices evolve

## Usage Pattern

Test Agent should load specific references when:
- Unsure about mocking strategy → Load `vitest-patterns.md`
- Creating E2E tests → Load `playwright-e2e-patterns.md`
- Testing Zod schemas → Load `zod-testing-patterns.md`
- Organizing test files → Load `test-structure-guide.md`
- Validating coverage → Load `coverage-and-validation.md`

**Progressive disclosure**: Don't load all upfront, load on demand as needed.
