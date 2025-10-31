# Agent Types Matrix - v3.0 Planning Experts

## Complete Specialist Matrix

| Agent | Domain | Plans For | Reviews | Technologies | MCP Required | Workflow Position |
|-------|--------|-----------|---------|--------------|--------------|-------------------|
| **Testing Planning Expert** | Test Strategy | Test coverage, unit/integration/E2E specs | Test implementation, coverage | Vitest, Playwright | context7 | **FIRST** (sequential) |
| **Backend Planning Expert** | Business Logic | Use cases, service orchestration, validation | Use case implementation | TanStack Query, Zod | context7 | After testing (parallel) |
| **Database Planning Expert** | Data Layer | Schema, RLS policies, migrations, indexes | Data services, RLS | Supabase, PostgreSQL | context7, supabase | After testing (parallel) |
| **Frontend Planning Expert** | UI Components | React components, UX flows, state management | Component implementation | React, shadcn/ui, Tailwind | context7 | After testing (parallel) |
| **shadcn UI/UX Planning Expert** | Visual Design | Component composition, animations, micro-interactions | Visual consistency, Style Guide | shadcn/ui, Aceternity UI | context7, chrome-devtools | After frontend (parallel) |
| **Security Planning Expert** | Security | CASL policies, RLS, defense-in-depth, OWASP | Security implementation | CASL, Supabase RLS | context7 | After architecture (parallel) |
| **Performance Planning Expert** | Optimization | Caching, lazy loading, Core Web Vitals | Performance metrics | TanStack Query, React | context7, chrome-devtools | Final (after all) |

---

## Detailed Agent Specifications

### 1. Testing Planning Expert ⚠️ FIRST (Sequential)

**Agent Name**: `testing-planning-expert`
**Color**: orange
**Workflow Position**: MUST complete first (blocks all others)

**Plans**:
- Test coverage strategy (unit, integration, E2E)
- Test specifications per architectural layer
- Mock and fixture requirements
- Accessibility testing requirements (WCAG 2.1 AA)
- Coverage targets (>90%)

**Reviews**:
- Test implementation completeness
- Coverage gaps
- Best practices violations
- E2E flow coverage

**Technologies**:
- Vitest (unit/integration)
- Playwright (E2E)
- Testing Library (React)
- MSW (mocking)

**Context7 Queries**:
```
- Vitest best practices 2025
- Playwright E2E patterns
- Testing Library accessibility
```

**Deliverables**:
- `01-plan.md`: Complete test strategy
- `review-checkpoint-N.md`: Test quality assessment

---

### 2. Backend Planning Expert

**Agent Name**: `backend-planning-expert`
**Color**: orange
**Workflow Position**: After testing, parallel with database/frontend

**Plans**:
- Use case orchestration patterns
- Service interfaces and contracts
- Business validation logic
- TanStack Query integration patterns
- Error handling strategies

**Reviews**:
- Use case implementation quality
- Zod schema usage
- TanStack Query optimistic updates
- Error propagation

**Technologies**:
- TanStack Query (server state)
- Zod (validation)
- React Hook Form
- Next.js API routes

**Context7 Queries**:
```
- TanStack Query v5 best practices
- Zod validation patterns
- React Hook Form integration
```

**Deliverables**:
- `01-plan.md`: Use case specifications
- `review-checkpoint-N.md`: Implementation quality

---

### 3. Database Planning Expert

**Agent Name**: `database-planning-expert`
**Color**: orange
**Workflow Position**: After testing, parallel with backend/frontend

**Plans**:
- Database schema design
- RLS policies for multi-tenancy
- Migration strategies
- Index optimization
- Query performance patterns

**Reviews**:
- Data service purity (no business logic)
- RLS policy correctness
- Query performance
- Migration safety

**Technologies**:
- Supabase (Postgres + Auth + Storage)
- PostgreSQL
- Row Level Security (RLS)
- Database migrations

**Context7 Queries**:
```
- Supabase RLS best practices 2025
- PostgreSQL index optimization
- Migration strategies
```

**Supabase MCP Queries**:
```
- List current tables and schemas
- Get advisors (security, performance)
- Analyze existing RLS policies
```

**Deliverables**:
- `01-plan.md`: Schema + RLS design
- `review-checkpoint-N.md`: Data layer assessment

---

### 4. Frontend Planning Expert

**Agent Name**: `frontend-planning-expert`
**Color**: orange
**Workflow Position**: After testing, parallel with backend/database

**Plans**:
- React component hierarchy
- UX flows and user journeys
- State management patterns (Zustand for UI state)
- Accessibility requirements (WCAG 2.1 AA)
- Responsive design breakpoints

**Reviews**:
- Component structure quality
- Accessibility compliance
- UX flow completeness
- State management correctness

**Technologies**:
- React (Next.js App Router)
- shadcn/ui (base components)
- Tailwind CSS
- Zustand (client state)
- next-intl (i18n)

**Context7 Queries**:
```
- React best practices 2025
- shadcn/ui composition patterns
- WCAG 2.1 AA accessibility
```

**Deliverables**:
- `01-plan.md`: Component specifications
- `review-checkpoint-N.md`: UI quality assessment

---

### 5. shadcn UI/UX Planning Expert

**Agent Name**: `shadcn-uiux-planning-expert`
**Color**: orange
**Workflow Position**: After frontend (parallel)

**Plans**:
- shadcn/ui component composition
- Aceternity UI effects integration
- Animations and micro-interactions
- Visual consistency with Style Guide
- Dark mode support

**Reviews**:
- Component visual consistency
- Animation smoothness
- Style Guide compliance
- Brand alignment

**Technologies**:
- shadcn/ui (base components)
- Aceternity UI (advanced effects)
- Tailwind CSS (styling)
- Framer Motion (animations)

**Context7 Queries**:
```
- shadcn/ui advanced patterns
- Tailwind CSS animation best practices
- Framer Motion performance
```

**Chrome DevTools MCP**:
- Take screenshots for visual validation
- Verify animations and transitions

**Deliverables**:
- `01-plan.md`: Visual design plan
- `review-checkpoint-N.md`: Visual quality assessment

---

### 6. Security Planning Expert

**Agent Name**: `security-planning-expert`
**Color**: orange
**Workflow Position**: After architecture (parallel)

**Plans**:
- CASL ability definitions (client-side authorization)
- RLS policy design (server-side security)
- Defense-in-depth strategy
- OWASP Top 10 mitigations
- Input sanitization requirements

**Reviews**:
- CASL and RLS alignment
- Authorization coverage
- Input validation completeness
- OWASP compliance

**Technologies**:
- CASL (@casl/ability, @casl/react)
- Supabase RLS
- Zod (input validation)
- Content Security Policy

**Context7 Queries**:
```
- CASL authorization patterns 2025
- Supabase RLS security best practices
- OWASP Top 10 mitigations
```

**Deliverables**:
- `01-plan.md`: Security architecture
- `review-checkpoint-N.md`: Security audit

---

### 7. Performance Planning Expert

**Agent Name**: `performance-planning-expert`
**Color**: orange
**Workflow Position**: Final (after all others)

**Plans**:
- Caching strategies (TanStack Query)
- Lazy loading and code splitting
- Image optimization
- Core Web Vitals optimization
- Database query optimization

**Reviews**:
- Lighthouse scores
- Core Web Vitals metrics
- TanStack Query caching effectiveness
- Bundle size

**Technologies**:
- TanStack Query (caching)
- Next.js (code splitting)
- React (lazy loading)
- Chrome DevTools (profiling)

**Context7 Queries**:
```
- TanStack Query caching strategies
- Next.js performance optimization
- Core Web Vitals best practices 2025
```

**Chrome DevTools MCP**:
- Performance profiling
- Lighthouse audits
- Network analysis

**Deliverables**:
- `01-plan.md`: Performance optimization plan
- `review-checkpoint-N.md`: Performance audit

---

## Common Patterns Across All Agents

### Planning Phase Checklist
- [ ] Read `00-request.md` from Architect
- [ ] Consult Context7 for latest best practices
- [ ] Analyze domain-specific requirements
- [ ] Create detailed specifications (NOT code)
- [ ] Define phased approach if complex
- [ ] Specify file structure and organization
- [ ] Include Context7 references in plan

### Review Phase Checklist
- [ ] Triggered by user at checkpoint
- [ ] Analyze Claude Code's implementation
- [ ] Identify best practice violations
- [ ] Provide specific, actionable feedback
- [ ] Reference Context7 for corrections
- [ ] Suggest improvements with rationale
- [ ] Document in `review-checkpoint-N.md`

### Prohibited Activities (All Agents)
- ❌ Implementing code
- ❌ Modifying tests
- ❌ Writing business logic
- ❌ Direct file operations
- ❌ Approving own work
- ❌ Reading other agents' folders

---

## Agent Selection Guide

**When creating a new agent, ask**:
1. Which domain does this agent specialize in?
2. What will it plan?
3. What will it review?
4. Which technologies are involved?
5. What Context7 queries are needed?
6. When in the workflow does it execute?

**Use this matrix to**:
- Understand all available specialist types
- Select the correct agent for a domain
- Identify required MCPs and technologies
- Determine workflow positioning
