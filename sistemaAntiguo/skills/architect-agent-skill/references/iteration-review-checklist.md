# Iteration Review Checklist

Comprehensive checklist for reviewing agent iterations as the quality gate in the iterative v2.0 workflow.

---

## Review Process Overview

```
Agent completes iteration
         ↓
1. Read iteration document
         ↓
2. Verify against 00-request.md
         ↓
3. Coordinate with Usuario (business review)
         ↓
4. Make decision: Approve ✅ or Reject ❌
```

---

## General Review Criteria (All Agents)

### 1. Documentation Completeness

- [ ] `XX-iteration.md` file exists and follows template
- [ ] Summary section complete with overview
- [ ] Detailed breakdown of work performed
- [ ] All deliverables documented
- [ ] Evidence provided (screenshots, logs, test results)
- [ ] Technical decisions explained with rationale
- [ ] Blockers (if any) documented with resolution
- [ ] Quality checklist completed
- [ ] Submission timestamp present

### 2. Requirements Coverage

- [ ] All objectives from `00-request.md` addressed
- [ ] All deliverables from `00-request.md` present
- [ ] No requirements skipped or ignored
- [ ] Scope matches request (no scope creep)
- [ ] Out-of-scope items clearly identified and documented

### 3. Quality Standards

- [ ] Code follows project conventions (Clean Architecture, naming)
- [ ] No prohibited technologies used (Jest, useEffect for fetching, etc.)
- [ ] No architectural violations (layer boundaries respected)
- [ ] Error handling implemented appropriately
- [ ] Logging/debugging removed (no console.logs in production)

### 4. Communication Quality

- [ ] Iteration document is clear and well-structured
- [ ] Technical terms explained when necessary
- [ ] Decisions are justified with reasoning
- [ ] Issues/blockers communicated proactively
- [ ] Next steps or open questions identified

---

## Test Agent Iteration Review

### Core Deliverables

- [ ] `entities.test.ts` created with Zod schema validation tests
- [ ] Use case tests created for ALL business logic functions
- [ ] Service tests created for ALL data access functions
- [ ] API endpoint tests created for ALL routes
- [ ] E2E tests created for ALL user flows
- [ ] Test fixtures and factories created
- [ ] Mock configurations complete

### Test Quality

- [ ] **All tests FAIL appropriately** (not syntax errors)
- [ ] Tests fail with "function not defined" or "endpoint not found"
- [ ] No tests passing (no implementation code written)
- [ ] Test descriptions are clear and specific
- [ ] Assertions are meaningful (not just `expect(true).toBe(true)`)
- [ ] Edge cases covered (null, undefined, empty, malformed)

### Test Coverage

- [ ] Coverage target met (>90% of requirements)
- [ ] All acceptance criteria from PRD have tests
- [ ] Happy path scenarios tested
- [ ] Error scenarios tested
- [ ] Authorization scenarios tested (RLS checks)
- [ ] Validation scenarios tested (Zod validation)

### Mocks and Fixtures

- [ ] Supabase client properly mocked
- [ ] Mock configuration allows test execution
- [ ] Test fixtures follow realistic data patterns
- [ ] Factory functions for test data creation
- [ ] Mocks don't leak between tests

### E2E Tests (Critical)

- [ ] E2E tests cover complete user workflows
- [ ] Navigation flows tested
- [ ] Form interactions tested
- [ ] API calls verified
- [ ] Accessibility requirements included (ARIA labels, keyboard nav)
- [ ] Tests use proper Playwright patterns

### Prohibited Violations

- [ ] ❌ NO functional implementation (only tests)
- [ ] ❌ NO modification of entities.ts
- [ ] ❌ NO tests that pass (all must fail initially)

---

## Implementer Agent Iteration Review

### Core Deliverables

- [ ] Use case functions implemented
- [ ] All use case tests passing
- [ ] Business logic correctly orchestrates service calls
- [ ] Input validation using Zod schemas
- [ ] Authorization checks implemented
- [ ] Error handling complete

### Implementation Quality

- [ ] Pure business logic (no database access)
- [ ] Service interfaces called correctly
- [ ] No business logic in wrong layer (e.g., in services)
- [ ] Proper error throwing with descriptive messages
- [ ] Return types match schema definitions

### Test Compliance

- [ ] **ALL use case tests passing** (100%)
- [ ] No tests modified to make them pass
- [ ] No tests skipped or disabled
- [ ] Test coverage maintained (>90%)

### Service Interface Specification

- [ ] Clear service interfaces defined for Supabase Agent
- [ ] Interface includes all required methods
- [ ] Method signatures specify input/output types
- [ ] Documentation for expected behavior

### Prohibited Violations

- [ ] ❌ NO modification of test files
- [ ] ❌ NO direct database access (must use services)
- [ ] ❌ NO modification of entities.ts
- [ ] ❌ NO implementation beyond use cases

---

## Supabase Agent Iteration Review

### Core Deliverables

- [ ] Data service files implemented
- [ ] All service tests passing
- [ ] Database schema created (migration file)
- [ ] RLS policies implemented
- [ ] Indexes created for performance
- [ ] Migration executed successfully

### Service Quality

- [ ] Pure CRUD operations (no business logic)
- [ ] Input validation delegated to use cases (no Zod in services)
- [ ] Proper error handling for database errors
- [ ] Transactions used where appropriate
- [ ] Connection cleanup (no leaks)

### Database Schema

- [ ] Table names follow `snake_case` convention
- [ ] All columns have appropriate types
- [ ] Primary keys defined (UUIDs)
- [ ] Foreign keys with proper constraints
- [ ] NOT NULL constraints where appropriate
- [ ] Default values for timestamps (`DEFAULT NOW()`)
- [ ] Check constraints for business rules (if applicable)

### RLS Policies

- [ ] RLS enabled on all tables
- [ ] Policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Multi-tenant isolation via `organization_id`
- [ ] Uses `auth.uid()` for user identification
- [ ] Policies tested and verified
- [ ] No security holes (test with different users)

### Indexes and Performance

- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Indexes on `organization_id` for multi-tenancy
- [ ] No over-indexing (balance read/write performance)

### Migration Quality

- [ ] Migration file follows naming convention
- [ ] Migration is idempotent (can run multiple times)
- [ ] Rollback strategy documented
- [ ] Migration tested locally

### Prohibited Violations

- [ ] ❌ NO business validation in services
- [ ] ❌ NO modification of service tests
- [ ] ❌ NO business logic in data layer
- [ ] ❌ NO modification of use cases or entities

---

## UI/UX Expert Agent Iteration Review

### Core Deliverables

- [ ] React components implemented
- [ ] All E2E tests passing
- [ ] Pages created and routed correctly
- [ ] Forms with validation
- [ ] Loading/error/empty states
- [ ] Responsive design (mobile, tablet, desktop)

### Component Quality

- [ ] Components use shadcn/ui library
- [ ] Tailwind CSS for styling (no traditional CSS)
- [ ] Proper component composition
- [ ] No business logic in components
- [ ] Use cases called via TanStack Query (not useEffect)

### E2E Test Compliance

- [ ] **ALL E2E tests passing** (100%)
- [ ] Tests verify complete user workflows
- [ ] No tests modified to make them pass
- [ ] No tests skipped or disabled

### Accessibility (WCAG 2.1 AA)

- [ ] Semantic HTML elements used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast ratios meet standards (4.5:1 minimum)
- [ ] Screen reader tested
- [ ] Form validation announces errors

### Responsiveness

- [ ] Mobile (375px+): Functional and readable
- [ ] Tablet (768px+): Optimized layout
- [ ] Desktop (1024px+): Full feature set
- [ ] No horizontal scroll
- [ ] Touch targets minimum 44x44px

### UI States

- [ ] Loading state with skeleton or spinner
- [ ] Error state with user-friendly message and retry
- [ ] Empty state with CTA to create
- [ ] Success state with data display

### Internationalization (i18n)

- [ ] NO hardcoded strings (all via `useTranslations`)
- [ ] Translation files created (`en` and `es`)
- [ ] **CRITICAL**: `i18n/request.ts` updated to import new namespace
- [ ] Translation keys follow naming convention
- [ ] Zod validation messages translated

### Performance

- [ ] Core Web Vitals in acceptable range
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Code splitting where appropriate

### Prohibited Violations

- [ ] ❌ NO business logic in components
- [ ] ❌ NO modification of E2E tests
- [ ] ❌ NO direct service calls (must use use cases)
- [ ] ❌ NO non-approved UI libraries
- [ ] ❌ NO hardcoded strings (must use i18n)

---

## Specific Review Templates

### ✅ Approval Template

```markdown
## Review Status

**Submitted for Review**: YYYY-MM-DD HH:MM

### Architect Review
**Date**: YYYY-MM-DD HH:MM
**Status**: Approved ✅
**Feedback**:
- All requirements from 00-request.md met
- Quality standards exceeded
- No architectural violations found
- Test coverage excellent (XX%)
- Ready for next phase

### User Review
**Date**: YYYY-MM-DD HH:MM
**Status**: Approved ✅
**Feedback**:
- Business requirements fully satisfied
- User experience meets expectations
- Feature aligns with product vision
```

**Next steps**:
1. Update `_status.md` with approval
2. Prepare `00-request.md` for next agent
3. Notify user of progression

---

### ❌ Rejection Template

```markdown
## Review Status

**Submitted for Review**: YYYY-MM-DD HH:MM

### Architect Review
**Date**: YYYY-MM-DD HH:MM
**Status**: Rejected ❌
**Feedback**:

**Issues Found**: [X issues total]

---

#### Issue 1: [Clear Title] (SEVERITY: CRITICAL/HIGH/MEDIUM)

- **Location**: [Exact file path and line number or section]
- **Problem**: [Detailed description of what's wrong]
- **Why it matters**: [Impact on system or user]
- **Required Fix**: [Step-by-step correction needed]
- **Example**: [Code snippet or reference to correct pattern]

**Acceptance criteria**:
- [ ] Specific criterion 1
- [ ] Specific criterion 2

---

#### Issue 2: [Clear Title] (SEVERITY: CRITICAL/HIGH/MEDIUM)

[Same structure]

---

**Action Required**:
Please create iteration 02 addressing these [X] issues. Focus on CRITICAL severity first.

**Estimated rework**: [Time estimate if possible]

### User Review
**Date**: Pending
**Status**: Waiting for corrections
**Feedback**: Will review after Architect approves corrections
```

**Severity levels**:
- **CRITICAL**: Blocks progression, security issue, or data loss risk
- **HIGH**: Major functional issue, significant deviation from requirements
- **MEDIUM**: Quality issue, minor deviation, or improvement opportunity

**Next steps**:
1. Agent creates `02-iteration.md` addressing issues
2. Review again when notified
3. Repeat until approved

---

## Review Decision Framework

### When to APPROVE ✅

Approve when:
- ✅ ALL requirements from `00-request.md` met
- ✅ ALL deliverables present and complete
- ✅ Quality meets or exceeds standards
- ✅ NO architectural violations
- ✅ NO security issues
- ✅ Usuario approves business value
- ✅ Tests pass (for implementation phases)
- ✅ Coverage targets met

### When to REJECT ❌

Reject when:
- ❌ ANY requirement from `00-request.md` missing
- ❌ ANY deliverable incomplete or missing
- ❌ Quality below standards
- ❌ Architectural violations present
- ❌ Security concerns identified
- ❌ Usuario rejects business value
- ❌ Tests fail (for implementation phases)
- ❌ Coverage below target

### When to REQUEST CLARIFICATION ❓

Request clarification when:
- ❓ Unclear if requirement is met (need agent to explain)
- ❓ Technical decision needs justification
- ❓ Ambiguity in iteration document
- ❓ Missing context or rationale

**How to request clarification**:
- Add comment in iteration document
- Ask specific question
- Agent responds in same iteration document (no new iteration)
- Review again after clarification

---

## Common Review Mistakes to Avoid

### ❌ Mistake 1: Vague Feedback

**Don't**: "Tests are incomplete"

**Do**: "Missing E2E test for delete workflow. Required: Create `tests/e2e/comments-delete.spec.ts` with steps: navigate to comment, click delete, confirm, verify removal."

### ❌ Mistake 2: Approving with Known Issues

**Don't**: Approve and say "Fix this later"

**Do**: Reject with specific issues to fix now

### ❌ Mistake 3: Focusing Only on Code

**Don't**: Only check if code works

**Do**: Check documentation, tests, architecture, security, performance

### ❌ Mistake 4: Not Coordinating with Usuario

**Don't**: Approve without user's business review

**Do**: Always present iteration to user for business approval

### ❌ Mistake 5: Batch Reviewing Multiple Iterations

**Don't**: Let multiple iterations pile up before reviewing

**Do**: Review each iteration immediately when notified

---

## Post-Review Actions

### After APPROVAL ✅

1. **Document approval** in iteration file
2. **Update `_status.md`**:
   - Mark current agent phase as "Completed"
   - Mark next agent phase as "In Progress"
3. **Prepare next agent**:
   - Create `{next-agent}/00-request.md`
   - Include stable interfaces from approved iteration
   - Document any context needed
4. **Notify user**:
   - Confirm progression to next phase
   - Provide brief summary of what was approved

### After REJECTION ❌

1. **Document rejection** in iteration file with specific issues
2. **Update `_status.md`**:
   - Keep current agent phase as "In Progress"
   - Add note about iteration number
3. **Notify user**:
   - Explain rejection rationale
   - Set expectations for rework timeline

---

## Quality Gate Mindset

As the Architect, you are the **ONLY quality gate**. Your responsibility:

**YOU ENSURE**:
- ✅ Architectural integrity across all phases
- ✅ Requirements are fully met
- ✅ Quality standards maintained
- ✅ System coherence preserved

**YOU PREVENT**:
- ❌ Incomplete work from progressing
- ❌ Architectural violations from entering codebase
- ❌ Quality degradation over time
- ❌ Misalignment between agents

**YOUR AUTHORITY**:
- You can reject any iteration regardless of agent seniority
- You can request unlimited iterations until quality is met
- You can escalate to user if agent repeatedly fails
- You can adjust requirements if user approves changes

**YOUR LIMITS**:
- Cannot modify tests after Test Agent approval
- Cannot change PRD master without user approval
- Cannot skip review even if "looks good"
- Cannot approve without user's business review

---

**Remember**: Better to reject and get it right than approve and accumulate technical debt.

---

**Last Updated**: 2025-10-24
