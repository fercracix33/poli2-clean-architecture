# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Project Constitution

**This project follows STRICT architectural rules defined in `.trae/rules/project_rules.md`**. All development MUST adhere to these rules. Any deviation is considered an error.

### Fundamental Principles (IMMUTABLE)

1. **Screaming Clean Architecture**: Our folder structure reflects the business domain (tasks, projects), not tools. Business logic is independent of frameworks.
2. **Test-Driven Development (TDD) is LAW**: No functional code without a failing test first. Tests are the living specification.
3. **Strict Boundaries**: Architecture layers are sacred. Communication only through well-defined interfaces.

### Canonical Technology Stack (FINAL)

**ONLY these technologies are approved. Using alternatives is STRICTLY PROHIBITED:**

- **Framework**: Next.js 14+ with App Router
- **Database/Backend**: Supabase (Postgres, Auth, Storage with mandatory RLS)
- **Internationalization**: next-intl 4.x (cookie-based, no URL prefix)
- **Unit/Integration Testing**: **Vitest** (Jest is PROHIBITED)
- **E2E Testing**: Playwright
- **UI/Styling**: Tailwind CSS + shadcn/ui + Aceternity UI (no traditional CSS)
  - **shadcn/ui**: Base component library for standard UI elements
  - **Aceternity UI**: Advanced effects and animations (background-gradient, typewriter-effect, etc.)
- **Server State**: TanStack Query (useEffect for data fetching is PROHIBITED)
- **Client State**: Zustand (only for non-server state like UI state)
- **Validation**: Zod (mandatory for all network boundaries and forms)
- **Authorization**: CASL (@casl/ability + @casl/react) - Client-side authorization logic for UI visibility and permissions

### Mandatory Clean Architecture Layers

**"The Onion" - Dependencies always point inward:**

1. **Entities (Center)**: Pure TypeScript/Zod objects, business rules
2. **Use Cases**: Business logic orchestration, no knowledge of external world
3. **Interface Adapters**: Data format translators (repositories, controllers)
4. **Frameworks & Drivers**: External world (Next.js, Supabase, browser)

### STRICT Directory Structure (IMMUTABLE)

```
app/src/
├── app/
│   ├── (main)/             # Main app pages
│   │   └── [feature]/      # e.g., /tasks, /projects
│   │       └── page.tsx    # React page component (UI Layer)
│   └── api/
│       └── [feature]/      # API endpoints (Interface Adapter Layer)
│           └── route.ts    # Controller calling Use Cases
├── features/
│   └── [feature-name]/     # e.g., "tasks", "projects"
│       ├── components/     # Feature-specific React components (UI Layer)
│       ├── use-cases/      # Pure business logic (Use Case Layer)
│       │   ├── createTask.ts
│       │   └── createTask.test.ts  # Vitest tests
│       ├── services/       # Data access layer (Interface Adapter)
│       │   └── task.service.ts     # Supabase code ONLY here
│       ├── abilities/      # CASL ability definitions (IF feature has authorization)
│       │   ├── defineAbility.ts
│       │   └── defineAbility.test.ts
│       ├── context/        # React context providers (IF needed)
│       │   └── AbilityContext.tsx
│       ├── hooks/          # Custom React hooks (IF needed)
│       │   └── useAppAbility.ts
│       └── entities.ts     # Zod schemas & types (Entity Layer)
├── lib/                    # Shared utilities
└── components/ui/          # Generic shadcn components
```

## Common Development Commands

Navigate to the `app/` directory before running commands:

```bash
cd app
```

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check (if available)

### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI mode

## 🚨 MANDATORY TDD Process - ITERATIVE WORKFLOW

### ⚡ New Iterative Flow (IMMUTABLE)

**CRITICAL CHANGE**: The workflow is now **iterative with mandatory architectural review** at each phase.

```
Usuario → Arquitecto (PRD Master)
              ↓
    ┌─────────────────────┐
    │   ITERATION LOOP    │
    │  (Per Agent Phase)  │
    └─────────────────────┘
              ↓
    Arquitecto escribe 00-request.md para Agente
              ↓
    Agente trabaja en 01-iteration.md
              ↓
    Arquitecto + Usuario revisan
              ↓
    ┌─────────────────────────────────┐
    │ ¿Aprobado?                      │
    ├─────────────────────────────────┤
    │ NO → Agente corrige (02-, 03-...) │
    │      Volver a revisión           │
    │                                  │
    │ SÍ → Continuar siguiente agente  │
    └─────────────────────────────────┘
```

**Sequence Order**:
1. Test Agent → Review → Approval
2. Implementer Agent → Review → Approval
3. Supabase Agent → Review → Approval
4. UI/UX Expert Agent → Review → Approval

### Agent Responsibilities (STRICT)

#### 1. **Arquitecto (Architect Agent)** ⭐ COORDINATOR & REVIEWER

**Role:** Chief Architect, Technical Product Manager, and **Iteration Reviewer** - Bridge and quality gate

**Core Mission:**
- Translate high-level user requirements into clear, detailed technical specifications (PRDs)
- **NEW**: Review and approve/reject EVERY iteration of EVERY agent before progression
- **NEW**: Coordinate information flow between agents (agents work in isolation)
- Prepare the "construction ground" by creating directory structure and data contracts (entities)

**Exclusive Responsibilities:**
- **Invoke Skill**: MUST use `architect-deep-analysis.md` skill at phase start
- **PRD Generation**: Create SINGLE master PRD (ONLY Arquitecto writes PRDs)
- **Request Writing**: Write `00-request.md` for EACH agent with specific requirements
- **Iteration Review**: Review EVERY `XX-iteration.md` from agents with Usuario
- **Approval Authority**: Approve or reject agent work (rejection = new iteration required)
- **Handoff Coordination**: (Optional) Prepare `handoff-XXX.md` to enable parallelism between agents
- **Information Translator**: Agents read ONLY their folder; Arquitecto bridges information
- **Architecture Guardian**: ONLY agent authorized to modify project directory structure
- **Entity Implementation**: Implement pure `entities.ts` files with Zod schemas and TypeScript types
- **CASL Types Definition**: Define AppAbility type and ability function signatures in entities.ts for features requiring authorization
- **Coherence Maintenance**: Ensure consistency across all agent deliverables

**Strict Limitations:**
- **NEVER** implement business logic, services, components, or tests
- **NEVER** modify master PRD once delivered (unless human explicitly requests changes)
- **NEVER** approve agent work without thorough review with Usuario
- **NEVER** allow agents to advance without explicit approval
- **NEVER** create dependencies outside the canonical tech stack

**Deliverables:**
- `PRDs/domain/XXX-feature/architect/00-master-prd.md` (ÚNICO PRD del sistema)
- `PRDs/domain/XXX-feature/{agent}/00-request.md` (petición inicial para cada agente)
- `PRDs/domain/XXX-feature/{agent}/handoff-XXX.md` (opcional, para paralelismo)
- Directory structure: `PRDs/domain/XXX-feature/{test-agent, implementer, supabase-agent, ui-ux-expert}/`
- `src/features/[feature]/entities.ts` with Zod schemas
- Approval/rejection decisions documented in `_status.md`

---

#### 2. **Test Agent (Test Architect)** 🧪

**Role:** Test Architect and Living Specification Guardian - Defines what must be implemented

**Core Mission:**
- Create tests for ALL layers (use cases, services, APIs, E2E) that FAIL appropriately
- Act as the living specification of the entire system
- **NEW**: Work in iterations until approved by Arquitecto + Usuario

**Exclusive Responsibilities:**
- **Invoke Skill**: MUST use `test-architect-tdd.md` skill at phase start
- **Read Scope**: ONLY read `PRDs/domain/XXX-feature/test-agent/` folder
- **Request-Based Work**: Start from `00-request.md` written by Arquitecto
- **Iterative Development**: Create `01-iteration.md`, then `02-`, `03-`... if corrections needed
- **Complete Coverage**: Test use cases, data services, API endpoints, validations, **E2E user flows**
- **Interface Definition**: Define expected function signatures before they exist
- **Mock Configuration**: Set up all external dependency mocks (Supabase client, etc.)
- **E2E Specification**: Define complete user workflows with Playwright (navigation → interaction → assertion)
- **CASL Ability Tests**: Unit tests for defineAbilitiesFor() and E2E tests verifying <Can> component visibility (if authorization required)
- **Failure Validation**: Ensure all tests fail with "function not defined" initially (E2E fail with "page not found")
- **Handoff Preparation**: (Optional) If requested, prepare `handoff-001.md` for Implementer

**Strict Limitations:**
- **NEVER** implement any functional logic
- **NEVER** modify tests once approved (they become immutable specification)
- **NEVER** touch entities, services, or components
- **NEVER** read other agents' folders (Arquitecto coordinates info)
- **NEVER** advance to production code until Arquitecto approves iteration
- **NEVER** create temporary solutions or workarounds

**Deliverables (Per Iteration):**
- `XX-iteration.md` documenting:
  - Complete failing test suite for all layers (unit, integration, **E2E**)
  - Clearly defined function interfaces
  - Configured mocks and test fixtures
  - E2E tests with accessibility requirements
  - >90% coverage target
  - Decisions, blockers resolved, evidences (screenshots, logs)
- (Optional) `handoff-XXX.md` if Arquitecto requests parallelism

---

#### 3. **Implementer Agent (Business Logic Developer)** ⚙️

**Role:** Business Logic Developer - Implements use cases to pass tests

**Core Mission:**
- Implement use cases (Use Case Layer) that make tests pass without modifying them
- Follow strict TDD: Red → Green → Refactor
- **NEW**: Work in iterations until approved by Arquitecto + Usuario

**Exclusive Responsibilities:**
- **Invoke Skill**: MUST use `implementer-tdd.md` skill at phase start
- **Read Scope**: ONLY read `PRDs/domain/XXX-feature/implementer/` folder
- **Request-Based Work**: Start from `00-request.md` written by Arquitecto
- **Handoff Integration**: May read `test-agent/handoff-XXX.md` if parallelism enabled
- **Iterative Development**: Create `01-iteration.md`, then `02-`, `03-`... if corrections needed
- **Use Cases Only**: Implement pure business logic orchestration
- **Test Compliance**: Make use case tests pass without modifying them
- **Validation Logic**: Create business rules, authorization, input validation
- **CASL Ability Implementation**: Implement defineAbilitiesFor() and loadUserAbility() use cases for authorized features
- **Service Orchestration**: Coordinate calls to data services (without implementing them)
- **Error Handling**: Implement specific error handling and propagation
- **Handoff Preparation**: (Optional) If requested, prepare `handoff-001.md` for Supabase Agent

**Strict Limitations:**
- **NEVER** modify test files (they are immutable specification)
- **NEVER** implement data services (Supabase Agent responsibility)
- **NEVER** modify entities (Arquitecto responsibility)
- **NEVER** access database directly (must use services)
- **NEVER** read other agents' folders except allowed handoffs
- **NEVER** advance until Arquitecto approves iteration
- **NEVER** over-engineer beyond what tests require (YAGNI principle)

**Deliverables (Per Iteration):**
- `XX-iteration.md` documenting:
  - Use cases that pass all tests
  - Clear interfaces for required data services
  - Business logic, validations, and orchestration
  - >90% test coverage for implemented use cases
  - Decisions, blockers resolved, code artifacts
- (Optional) `handoff-XXX.md` if Arquitecto requests parallelism

---

#### 4. **Supabase Agent (Data Specialist)** 🗄️

**Role:** Data Specialist and Database Architect - Implements pure data access

**Core Mission:**
- Implement data services (Interface Adapter Layer) that make service tests pass
- Create pure database access without business logic
- **NEW**: Work in iterations until approved by Arquitecto + Usuario

**Exclusive Responsibilities:**
- **Invoke Skill**: MUST use `supabase-specialist-rls.md` skill at phase start
- **Read Scope**: ONLY read `PRDs/domain/XXX-feature/supabase-agent/` folder
- **Request-Based Work**: Start from `00-request.md` written by Arquitecto
- **Handoff Integration**: May read `implementer/handoff-XXX.md` if parallelism enabled
- **Iterative Development**: Create `01-iteration.md`, then `02-`, `03-`... if corrections needed
- **Data Services Only**: Implement pure CRUD operations and data access
- **Database Schema**: Design tables, relationships, constraints, indexes
- **RLS Implementation**: Row Level Security policies for multi-tenant isolation (NOT responsible for CASL - only database-level security)
- **Query Optimization**: Efficient database queries and performance tuning
- **Migration Management**: Database schema versioning and evolution
- **Handoff Preparation**: (Optional) If requested, prepare `handoff-001.md` for UI/UX Expert

**Strict Limitations:**
- **NEVER** add business validations to services (use cases handle business logic)
- **NEVER** modify service tests (they are immutable specification)
- **NEVER** implement business logic in data services
- **NEVER** touch use cases or entities
- **NEVER** read other agents' folders except allowed handoffs
- **NEVER** advance until Arquitecto approves iteration
- Services must be pure: input → database operation → output

**Deliverables (Per Iteration):**
- `XX-iteration.md` documenting:
  - Pure data services passing all tests
  - Complete database schema with RLS
  - Optimized queries with proper indexing
  - Database migrations and security policies
  - Decisions, performance benchmarks, migration scripts
- (Optional) `handoff-XXX.md` if Arquitecto requests parallelism

---

#### 5. **UI/UX Expert Agent (Interface Specialist)** 🎨

**Role:** UI/UX Designer and Interface Specialist - Creates user interfaces

**Core Mission:**
- Create accessible React components using shadcn/ui that pass E2E tests
- Integrate with implemented use cases to create complete user experience
- **NEW**: Work in iterations until approved by Arquitecto + Usuario

**Exclusive Responsibilities:**
- **Invoke Skill**: MUST use `ui-ux-a11y-expert.md` skill at phase start
- **Read Scope**: ONLY read `PRDs/domain/XXX-feature/ui-ux-expert/` folder
- **Request-Based Work**: Start from `00-request.md` written by Arquitecto
- **Handoff Integration**: May read `supabase-agent/handoff-XXX.md` if parallelism enabled
- **Iterative Development**: Create `01-iteration.md`, then `02-`, `03-`... if corrections needed
- **React Components**: UI components using only approved stack (shadcn/ui, Tailwind)
- **E2E Test Compliance**: Make Playwright E2E tests pass without modifying them
- **CASL React Integration**: Implement AbilityContext, useAppAbility hook, and <Can> component usage for authorized features
- **Accessibility**: WCAG 2.1 AA compliance mandatory
- **User Experience**: Loading states, error handling, responsive design
- **Performance**: Core Web Vitals optimization and efficient rendering

**Strict Limitations:**
- **NEVER** implement business logic in components
- **NEVER** modify E2E tests (they are immutable specification)
- **NEVER** access data services directly (must use implemented use cases)
- **NEVER** use non-approved UI libraries
- **NEVER** read other agents' folders except allowed handoffs
- **NEVER** advance until Arquitecto approves iteration
- **NEVER** create non-accessible components

**Deliverables (Per Iteration):**
- `XX-iteration.md` documenting:
  - Complete functional UI passing all E2E tests
  - WCAG 2.1 AA accessible components
  - Responsive design for multiple breakpoints
  - Optimized performance (Core Web Vitals green)
  - Decisions, accessibility audits, performance metrics, screenshots

### TDD Principles (IMMUTABLE) - Iterative Edition

1. **Red**: Test Agent creates tests for EVERYTHING that FAIL
2. **Review**: Arquitecto + Usuario review and approve/reject Test Agent iteration
3. **Green**: Implementer/Supabase agents make tests pass without modifying them
4. **Review**: Arquitecto + Usuario review and approve/reject implementation iterations
5. **Refactor**: Each agent improves code keeping tests green (within their iteration)
6. **Review**: Arquitecto + Usuario review refactored code before final approval
7. **PROHIBITED**: Any agent modifying tests after approval
8. **PROHIBITED**: Any agent advancing without explicit Arquitecto approval
9. **PROHIBITED**: Any agent reading folders outside their designated scope

### 🎯 Specialized Skills (MANDATORY)

**Every agent MUST invoke their specialized skill at the start of their phase.**

Each agent has a dedicated skill file in `.claude/skills/` that provides:
- **Rigorous step-by-step workflow** with mandatory checkpoints
- **Context7 consultation requirements** for latest best practices
- **Detailed templates and code examples**
- **Validation checklists** to prevent common mistakes
- **Architectural guardrails** to avoid violations

#### Available Skills

| Agent | Skill File | Purpose |
|-------|-----------|---------|
| **Architect** | `architect-deep-analysis.md` | PRD creation, entities design, structure setup |
| **Test Agent** | `test-architect-tdd.md` | Comprehensive test suite (unit, integration, E2E) |
| **Implementer** | `implementer-tdd.md` | Use case implementation following TDD |
| **Supabase Agent** | `supabase-specialist-rls.md` | Data services, RLS policies, DB schema |
| **UI/UX Expert** | `ui-ux-a11y-expert.md` | Accessible components, E2E compliance |
| **Bug Fixer** | `bug-fixer-diagnosis.md` | Root cause diagnosis and fixes |
| **UI Improver** | `ui-improver-consistency.md` | Visual improvements without logic changes |

#### How to Use Skills

When an agent starts their phase, they **MUST**:

1. **Announce skill invocation**:
   ```
   "I'll use the [skill-name] skill to ensure comprehensive [phase] implementation."
   ```

2. **Follow all phases sequentially** (cannot skip checkpoints)

3. **Consult Context7 as mandated** by the skill

4. **Complete all checklists** before handoff

5. **Update status** and execute handoff command

**Example**:
```
User: "Create the task creation feature"
→ Architect: "I'll use the architect-deep-analysis skill for this feature"
  [Follows 6 phases: Discovery, Research, Design, Documentation, Validation, Handoff]
→ Test Agent: "I'll use the test-architect-tdd skill to create the test suite"
  [Follows 6 phases: Analysis, Research, Strategy, Implementation, Validation, Handoff]
→ ...and so on
```

**Benefits of Using Skills**:
- ✅ **Consistency**: Every agent follows the same rigorous approach
- ✅ **Quality**: Context7 ensures up-to-date best practices
- ✅ **Prevention**: Mandatory checkpoints catch errors early
- ✅ **Completeness**: Checklists ensure nothing is forgotten
- ✅ **Architectural Integrity**: Built-in validation prevents violations

**CRITICAL**: Skills are NOT optional. They are the **mandatory workflow** for each agent.

## Architecture Patterns

### Feature Organization (Clean Architecture)
Each feature follows strict layered architecture:
- **Entities**: Pure Zod schemas and TypeScript types (business rules)
- **Use Cases**: Pure business logic orchestration (no external dependencies)
- **Services**: Data access layer (Interface Adapter - Supabase code ONLY here)
- **Components**: React components (UI Layer)

### Data Validation (Mandatory)
- ALL data crossing network boundaries MUST have Zod schema
- ALL form validations MUST use Zod
- Schemas co-located in `entities.ts` files within each feature
- TypeScript types inferred from Zod schemas

### State Management (Strict Rules)
- TanStack Query for server state and caching (configured in `providers.tsx`)
- Zustand ONLY for non-server state (UI state like "sidebar open/closed")
- React Hook Form for form state management
- **PROHIBITED**: useEffect for data fetching

### Database Integration
- Supabase client configuration in `lib/supabase.ts` and `lib/supabase-server.ts`
- Row Level Security (RLS) MANDATORY for data access control
- Organization-based multi-tenancy with role-based permissions

### Authorization (Defense in Depth)

**CRITICAL**: Authorization uses a two-layer approach for security:

#### Layer 1: CASL (Client-Side - UX Layer)
- **Purpose**: UI visibility, optimistic checks, better UX
- **Location**: `features/{feature}/abilities/`
- **Usage**: React components use `<Can>` or `ability.can()` to hide/show UI elements
- **Security Level**: NOT trusted (client can manipulate)
- **Performance**: Prevents unnecessary API calls

#### Layer 2: RLS Policies (Server-Side - Security Layer)
- **Purpose**: Actual security enforcement at database level
- **Location**: Supabase database policies
- **Usage**: PostgreSQL evaluates `auth.uid()` and workspace context
- **Security Level**: TRUSTED (cannot be bypassed)
- **Performance**: Executes on every query

**Critical Rules**:
- ✅ CASL and RLS must implement THE SAME authorization logic
- ✅ CASL checks come FIRST (prevent API calls user can't access)
- ✅ RLS is the FINAL authority (security enforcement)
- ❌ NEVER rely on CASL alone for security
- ❌ NEVER implement business logic in CASL (it's only for checks)

**Example Flow**:
```
User clicks "Delete Board" button
  ↓
1. CASL: ability.can('delete', 'Board')?
   → NO: Button disabled, API call prevented ✋
   → YES: Continue ✅
  ↓
2. API Call: DELETE /api/boards/123
  ↓
3. Use Case: Calls boardService.delete(123, userId)
  ↓
4. RLS Policy: Executes at Supabase
   → Check: auth.uid() = board.owner_id?
   → NO: PostgreSQL rejects query 🛑
   → YES: Delete succeeds ✅
```

## Critical Rules

### Development Guidelines
- **NEVER** create "simplified solutions" - ask human first
- **NEVER** use mock or hardcoded data
- **NEVER** delete the waitlist table
- **NEVER** use Jest - only Vitest
- **NEVER** write traditional CSS - only Tailwind utilities
- **NEVER** use useEffect for data fetching - only TanStack Query

### Path Aliases
- Use `@/*` for imports from `src/` directory (configured in `tsconfig.json`)

### Component Structure
- UI components follow shadcn/ui patterns in `components/ui/`
- Feature components organized within their respective feature directories
- Use Tailwind CSS classes with proper responsive design

### Testing Setup
- Vitest configured with jsdom environment
- Setup file at `src/test/setup.ts`
- Testing utilities from `@testing-library/react`
- Environment variables loaded automatically in tests
- **Tests are IMMUTABLE once created by Test Agent**

## 📋 PRD System (Product Requirements Documents) - ITERATIVE EDITION

### Purpose and Objectives
The **NEW iterative PRD system** maintains organization, traceability, and coherence through **versioned iterations** with **mandatory architectural review**. Located in `/PRDs/`, this system provides:

- **Organization**: Agent-isolated folders for clarity and focus
- **Traceability**: Complete version history through numbered iterations
- **Coherence**: Arquitecto as single coordinator and translator between agents
- **Efficiency**: Iterative refinement until approval (no rework after approval)
- **Quality**: Arquitecto + Usuario review EVERY iteration before progression

### Directory Structure (NEW)
```
PRDs/
├── _templates/                    # Simplified templates
│   ├── 00-master-prd-template.md # ONLY for Architect (unique PRD)
│   ├── agent-request-template.md # For Architect to write 00-request.md
│   ├── agent-iteration-template.md # For agents to write XX-iteration.md
│   ├── agent-handoff-template.md # Optional handoffs for parallelism
│   ├── rls-migration-template.md # Technical SQL template
│   └── _status-template.md       # Status tracking template
│
├── _examples/                     # Reference examples
│   ├── 001-example-task-comments/ # OLD linear example
│   └── 002-iterative-example/    # NEW iterative example ⭐
│
├── [domain]/                      # Feature domains (tasks, projects, auth)
│   └── [number]-[feature-name]/   # Individual features
│       ├── architect/             # ⭐ Architect's workspace
│       │   └── 00-master-prd.md  # ÚNICO PRD master
│       ├── test-agent/            # ⭐ Test Agent's workspace
│       │   ├── 00-request.md     # Architect writes requirements
│       │   ├── 01-iteration.md   # Agent's first iteration
│       │   ├── 02-iteration.md   # Corrections (if rejected)
│       │   ├── 03-iteration.md   # More corrections (if needed)
│       │   └── handoff-001.md    # Optional handoff to next agent
│       ├── implementer/           # ⭐ Implementer's workspace
│       │   ├── 00-request.md
│       │   ├── 01-iteration.md
│       │   └── handoff-001.md
│       ├── supabase-agent/        # ⭐ Supabase Agent's workspace
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       ├── ui-ux-expert/          # ⭐ UI/UX Expert's workspace
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       └── _status.md             # Unified status for whole feature
│
└── GUIA-USO-PRD.md              # Comprehensive usage guide (UPDATED)
└── WORKFLOW-ITERATIVO.md        # Detailed iterative workflow guide ⭐
└── EJEMPLOS-ITERACIONES.md      # Iteration examples and patterns ⭐
```

### Key Changes from Old System

| Aspect | OLD System | NEW System |
|--------|-----------|------------|
| **PRD Authorship** | Each agent writes spec | ONLY Architect writes PRD master |
| **Templates** | 5 agent templates | 1 master + 3 generic (request, iteration, handoff) |
| **Agent Scope** | Agents read all docs | Agents read ONLY their folder |
| **Workflow** | Linear sequential | Iterative with review loops |
| **Approval** | Implicit advancement | Explicit Architect + User approval |
| **Versioning** | Single document | Numbered iterations (01-, 02-, 03-...) |
| **Coordination** | Direct agent-to-agent | Architect as translator/coordinator |
| **Parallelism** | Not supported | Optional via handoff documents |

### Iteration Workflow (NEW)

**Per Agent Phase:**
```
1. Architect writes {agent}/00-request.md
   ↓
2. Agent reads 00-request.md and works
   ↓
3. Agent creates 01-iteration.md with deliverables
   ↓
4. Agent notifies completion
   ↓
5. Architect + Usuario review iteration
   ↓
6. APPROVED? → Continue to next agent
   REJECTED? → Agent creates 02-iteration.md → back to step 4
```

### Naming Conventions (UPDATED)
- **Feature ID**: `[domain]-[number]` (unchanged)
- **Directory**: `[number]-[feature-name-kebab-case]` (unchanged)
- **Agent Folders**: `test-agent/`, `implementer/`, `supabase-agent/`, `ui-ux-expert/`
- **Request**: Always `00-request.md` (written by Architect)
- **Iterations**: `01-iteration.md`, `02-iteration.md`, `03-iteration.md`...
- **Handoffs**: `handoff-001.md`, `handoff-002.md`... (optional)

### Usage Commands (UPDATED)
```bash
# Create new feature structure
mkdir -p PRDs/[domain]/[number]-[feature-name]/{architect,test-agent,implementer,supabase-agent,ui-ux-expert}

# Architect creates master PRD
cp PRDs/_templates/00-master-prd-template.md PRDs/[domain]/[number]-[feature-name]/architect/00-master-prd.md

# Architect creates request for Test Agent
cp PRDs/_templates/agent-request-template.md PRDs/[domain]/[number]-[feature-name]/test-agent/00-request.md

# Test Agent creates iteration
cp PRDs/_templates/agent-iteration-template.md PRDs/[domain]/[number]-[feature-name]/test-agent/01-iteration.md

# View feature status
cat PRDs/[domain]/[number]-[feature-name]/_status.md
```

### Critical PRD Rules (UPDATED)
- **ONLY Architect writes master PRD**: No other agent creates PRD documents
- **Agents work in isolation**: Read ONLY their own folder (+ handoffs if allowed)
- **Architect coordinates info**: Writes `00-request.md` translating requirements for each agent
- **Versioned iterations**: Each correction = new numbered iteration file
- **Mandatory approval**: NO advancement without Architect + User explicit approval
- **Handoffs are optional**: Architect decides when to enable parallelism
- **Status is unified**: Single `_status.md` tracks all agents, not per-agent status

For complete details, see:
- `PRDs/GUIA-USO-PRD.md` (complete guide)
- `PRDs/WORKFLOW-ITERATIVO.md` (detailed workflow)
- `PRDs/EJEMPLOS-ITERACIONES.md` (real examples)


## 🌐 Internationalization (i18n) - MANDATORY

### Configuration
- **Library**: next-intl 4.x
- **Strategy**: Cookie-based locale (no URL prefix)
- **Supported Locales**: English (default), Spanish
- **Cookie Name**: `NEXT_LOCALE`
- **Location**: `app/src/locales/[locale]/[namespace].json`

### Strict i18n Rules

#### 1. **NO HARDCODED STRINGS** (MANDATORY)
**PROHIBITED:**
```typescript
// ❌ WRONG
<h1>Welcome to Dashboard</h1>
<Button>Create Project</Button>
<p>No projects found</p>
```

**REQUIRED:**
```typescript
// ✅ CORRECT
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('dashboard');

  return (
    <>
      <h1>{t('title')}</h1>
      <Button>{t('createProject')}</Button>
      <p>{t('empty.message')}</p>
    </>
  );
}
```

#### 2. **Namespace Organization**
All translations MUST be organized by feature domain:

```
locales/
├── en/
│   ├── common.json      # Landing page, shared UI
│   ├── auth.json        # Authentication flow
│   ├── dashboard.json   # Dashboard & organizations
│   ├── projects.json    # Projects feature
│   ├── tasks.json       # Tasks feature
│   ├── settings.json    # User settings
│   └── errors.json      # Error messages, validations
└── es/ (same structure)
```

#### 3. **Component Requirements**
Every client component with user-facing text MUST:
- Import `useTranslations` from 'next-intl'
- Use appropriate namespace: `const t = useTranslations('namespace')`
- Replace ALL hardcoded strings with translation keys
- Use semantic key names: `t('form.email.label')` not `t('label1')`

#### 4. **Validation Messages (Zod)**
**PROHIBITED:**
```typescript
// ❌ WRONG - Hardcoded message
const schema = z.object({
  email: z.string().email('Invalid email address')
});
```

**REQUIRED:**
```typescript
// ✅ CORRECT - Translated message
export default function LoginForm() {
  const t = useTranslations('auth');

  // Create schema inside component for translation access
  const schema = z.object({
    email: z.string().email(t('login.email.error'))
  });

  // ... rest of component
}
```

#### 5. **Error Handling**
Backend errors (Supabase, API) MUST be mapped to translations:

```typescript
// ✅ CORRECT
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  if (error) {
    // Map Supabase error code to translation key
    const errorKey = `supabase.${error.code}` || 'network.generic';
    setErrorMessage(tErrors(errorKey));
  }
}
```

#### 6. **Dynamic Content (Pluralization, Variables)**
Use next-intl's ICU message format:

```json
{
  "tasks": {
    "count": "{count, plural, =0 {No tasks} =1 {1 task} other {# tasks}}"
  }
}
```

```typescript
const t = useTranslations('tasks');
<p>{t('count', { count: taskList.length })}</p>
```

#### 7. **Translation File Structure**
Each namespace JSON must follow this pattern:

```json
{
  "featureArea": {
    "component": {
      "element": {
        "label": "Text here",
        "placeholder": "Placeholder text",
        "error": "Error message"
      }
    }
  }
}
```

### Agent Responsibilities for i18n

#### **Arquitecto:**
When creating a new feature:
1. Identify all user-facing strings
2. Propose namespace structure in PRD
3. Define translation keys in entities/specifications
4. Document which components need translations

#### **Test Agent:**
NOT required for translation changes (translations are data, not logic)

**Exception:** If creating i18n utilities (error mappers, formatters):
- Create tests for utility functions
- Ensure proper type safety

#### **Implementer Agent:**
When implementing use cases:
1. Create translation JSON files (`en` and `es`)
2. **CRITICAL: Update `app/src/i18n/request.ts`** to import and merge the new namespace
3. Update all components to use `useTranslations()`
4. Move Zod schemas inside components if they have translated messages
5. Verify no hardcoded strings remain (search regex: `"[A-Z]`)

#### **Supabase Agent:**
NOT typically required for i18n

**Exception:** If storing locale preferences in database:
- Add `preferred_locale` column to `users` table
- Create RLS policies if needed

#### **UI/UX Expert:**
When creating UI components:
1. NEVER hardcode strings
2. Always use `useTranslations('namespace')` from the start
3. **Verify namespace is loaded in `i18n/request.ts`** before using it
4. Ensure aria-labels are translated for accessibility
5. Test locale switching in E2E tests

### 🚨 CRITICAL: Adding New Translation Namespaces

**MANDATORY WORKFLOW** when creating a new feature that needs translations:

#### Step 1: Create Translation Files
```bash
# Example: Adding 'dashboard' namespace
touch app/src/locales/en/dashboard.json
touch app/src/locales/es/dashboard.json
```

#### Step 2: Update `i18n/request.ts` (CRITICAL!)
**⚠️ IF YOU SKIP THIS STEP, YOU WILL GET `MISSING_MESSAGE` ERRORS**

```typescript
// app/src/i18n/request.ts
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);
  const parseResult = LocaleSchema.safeParse(localeCookie?.value);
  const locale: Locale = parseResult.success ? parseResult.data : DEFAULT_LOCALE;

  // Load ALL translation namespaces
  const commonMessages = (await import(`@/locales/${locale}/common.json`)).default;
  const authMessages = (await import(`@/locales/${locale}/auth.json`)).default;
  const dashboardMessages = (await import(`@/locales/${locale}/dashboard.json`)).default; // ← ADD THIS

  // Merge all namespaces into messages object
  const messages = {
    ...commonMessages,      // Root-level keys (landing page, shared UI)
    auth: authMessages,     // Namespaced under 'auth'
    dashboard: dashboardMessages, // ← ADD THIS
  };

  return { locale, messages };
});
```

#### Step 3: Use in Components
```typescript
// app/src/app/dashboard/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard'); // Must match namespace in i18n/request.ts

  return <h1>{t('welcome.title')}</h1>;
}
```

#### Why This Is Required

- `useTranslations('namespace')` looks for `messages.namespace` in the provider
- If you don't merge the namespace in `i18n/request.ts`, next-intl can't find it
- Error: `MISSING_MESSAGE: Could not resolve 'namespace' in messages for locale 'XX'`

**Example of Correct Messages Structure:**
```json
{
  "app": { ... },        // From common.json (root level)
  "hero": { ... },       // From common.json (root level)
  "auth": {              // From auth.json (namespaced)
    "login": { ... },
    "register": { ... }
  },
  "dashboard": {         // From dashboard.json (namespaced)
    "welcome": { ... }
  }
}
```

### Validation Checklist

Before merging any new feature, verify:
- [ ] NO hardcoded user-facing strings in code
- [ ] Translation files exist for both `en` and `es`
- [ ] **`i18n/request.ts` imports and merges the new namespace** ⚠️ CRITICAL
- [ ] All keys referenced in code exist in JSON files
- [ ] Zod validation messages are translated
- [ ] Error messages are mapped to translations
- [ ] Component imports `useTranslations` if it has text
- [ ] Locale switching works without breaking functionality
- [ ] No hydration errors in browser console
- [ ] No `MISSING_MESSAGE` console errors

### Common i18n Mistakes to Avoid

❌ **Hardcoding strings in components**
❌ **Mixing languages** (some English, some Spanish)
❌ **Creating Zod schemas outside components** (can't access translations)
❌ **Forgetting to translate error messages**
❌ **Using generic keys** like `text1`, `message2`
❌ **Not providing Spanish translations** (both languages required)
❌ **Creating translation files WITHOUT updating `i18n/request.ts`** (causes MISSING_MESSAGE errors)
❌ **Using `useTranslations('namespace')` without merging that namespace in request.ts**

### References
- Landing page: `app/src/app/page.tsx` (reference implementation)
- GlobalHeader: `app/src/components/layout/GlobalHeader.tsx`
- Translation files: `app/src/locales/en/common.json`
- Configuration: `app/src/i18n/request.ts`


## ⚠️ Common Mistakes to Avoid

### By Agent

**Arquitecto:**
- ❌ Creating PRDs without asking clarifying questions
- ❌ Implementing business logic instead of just entities
- ✅ Only create data contracts and structure

**Test Agent:**
- ❌ Writing tests that pass immediately
- ❌ Modifying tests after creating them
- ✅ All tests must fail with "function not defined"

**Implementer:**
- ❌ Touching database code directly
- ❌ Modifying test files to make them pass
- ✅ Only implement use cases following test specifications

**Supabase Agent:**
- ❌ Adding business validation in data services
- ❌ Implementing logic beyond CRUD operations
- ✅ Pure data access with RLS policies

**UI/UX Expert:**
- ❌ Implementing business logic in components
- ❌ Direct calls to data services
- ✅ Only use implemented use cases through TanStack Query



## 🎯 Comandos Personalizados de Claude Code

### `/validate-architecture`
Valida Clean Architecture y detecta tecnologías prohibidas.

**Uso:** `/validate-architecture`

**Valida:**
- ❌ Jest, useEffect para fetching, CSS tradicional, Redux/MobX
- ✅ Capas de Clean Architecture
- ✅ Estructura de carpetas
- ✅ Uso de Zod

---

### `/prd-checklist`
Valida completitud de un PRD.

**Uso:** `/prd-checklist tasks/001-create-task`

**Valida:**
- ✅ Master PRD completo
- ✅ entities.ts con Zod
- ✅ Documentos de agentes
- ✅ _status.md actualizado

---

### `/agent-handoff`
Automatiza handoff entre agentes TDD.

**Uso:** `/agent-handoff <PRD-path> <agent> <status>`

**Ejemplo:** `/agent-handoff tasks/001-create-task arquitecto completed`

**Agentes:** `arquitecto`, `test-agent`, `implementer`, `supabase-agent`, `ui-ux-agent`

**Status:** `not-started`, `in-progress`, `completed`, `blocked`