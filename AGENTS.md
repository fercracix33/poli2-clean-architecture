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
- **Unit/Integration Testing**: **Vitest** (Jest is PROHIBITED)
- **E2E Testing**: Playwright
- **UI/Styling**: Tailwind CSS + shadcn/ui + Aceternity UI (no traditional CSS)
  - **shadcn/ui**: Base component library for standard UI elements
  - **Aceternity UI**: Advanced effects and animations (background-gradient, typewriter-effect, etc.)
- **Server State**: TanStack Query (useEffect for data fetching is PROHIBITED)
- **Client State**: Zustand (only for non-server state like UI state)
- **Validation**: Zod (mandatory for all network boundaries and forms)

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

## 🚨 MANDATORY TDD Process

### Agent Sequence (IMMUTABLE ORDER)
```
1. Arquitecto → 2. Test Agent → 3. Implementer Agent → 4. Supabase Agent → 5. UI/UX Expert Agent
```

### Agent Responsibilities (STRICT)

#### 1. **Arquitecto (Architect Agent)**
**Role:** Chief Architect and Technical Product Manager - Bridge between human and development team

**Core Mission:**
- Translate high-level user requirements into clear, detailed technical specifications (PRDs)
- Prepare the "construction ground" by creating directory structure and data contracts (entities)

**Exclusive Responsibilities:**
- **Architecture Guardian**: ONLY agent authorized to modify project directory structure
- **PRD Generation**: Create immutable Product Requirements Documents following strict template
- **Entity Implementation**: Implement pure `entities.ts` files with Zod schemas and TypeScript types
- **Structure Creation**: Create complete feature directory structure for other agents
- **Requirements Clarification**: Ask clarifying questions to eliminate ambiguity before implementation

**Strict Limitations:**
- **NEVER** implement business logic, services, components, or tests
- **NEVER** modify PRDs once delivered (unless human explicitly requests changes)
- **NEVER** create dependencies outside the canonical tech stack
- Must deliver artifacts in correct order: PRD → Directory Structure → Entities → Hand-off to Test Agent

**Deliverables:**
- Complete PRD with acceptance criteria, data contracts, API specifications
- Directory structure following Clean Architecture layers
- Pure `entities.ts` files with Zod schemas
- Clear interfaces for all other agents

---

#### 2. **Test Agent (Test Architect)**
**Role:** Test Architect and Living Specification Guardian - Defines what must be implemented

**Core Mission:**
- Create tests for ALL layers (use cases, services, APIs) that FAIL appropriately
- Act as the living specification of the entire system

**Exclusive Responsibilities:**
- **Complete Coverage**: Test use cases, data services, API endpoints, validations
- **Interface Definition**: Define expected function signatures before they exist
- **Mock Configuration**: Set up all external dependency mocks (Supabase client, etc.)
- **Failure Validation**: Ensure all tests fail with "function not defined" initially
- **Specification Authority**: Tests become immutable truth for other agents

**Strict Limitations:**
- **NEVER** implement any functional logic
- **NEVER** modify tests once created (they are immutable specification)
- **NEVER** touch entities, services, or components
- **NEVER** create temporary solutions or workarounds

**Deliverables:**
- Complete failing test suite for all layers
- Clearly defined function interfaces
- Configured mocks and test fixtures
- >90% coverage target for all layers

---

#### 3. **Implementer Agent (Business Logic Developer)**
**Role:** Business Logic Developer - Implements use cases to pass tests

**Core Mission:**
- Implement use cases (Use Case Layer) that make tests pass without modifying them
- Follow strict TDD: Red → Green → Refactor

**Exclusive Responsibilities:**
- **Use Cases Only**: Implement pure business logic orchestration
- **Test Compliance**: Make use case tests pass without modifying them
- **Validation Logic**: Create business rules, authorization, input validation
- **Service Orchestration**: Coordinate calls to data services (without implementing them)
- **Error Handling**: Implement specific error handling and propagation

**Strict Limitations:**
- **NEVER** modify test files (they are immutable specification)
- **NEVER** implement data services (Supabase Agent responsibility)
- **NEVER** modify entities (Architect responsibility)
- **NEVER** access database directly (must use services)
- **NEVER** over-engineer beyond what tests require (YAGNI principle)

**Deliverables:**
- Use cases that pass all tests
- Clear interfaces for required data services
- Business logic, validations, and orchestration
- >90% test coverage for implemented use cases

---

#### 4. **Supabase Agent (Data Specialist)**
**Role:** Data Specialist and Database Architect - Implements pure data access

**Core Mission:**
- Implement data services (Interface Adapter Layer) that make service tests pass
- Create pure database access without business logic

**Exclusive Responsibilities:**
- **Data Services Only**: Implement pure CRUD operations and data access
- **Database Schema**: Design tables, relationships, constraints, indexes
- **RLS Implementation**: Row Level Security policies for multi-tenant isolation
- **Query Optimization**: Efficient database queries and performance tuning
- **Migration Management**: Database schema versioning and evolution

**Strict Limitations:**
- **NEVER** add business validations to services (use cases handle business logic)
- **NEVER** modify service tests (they are immutable specification)
- **NEVER** implement business logic in data services
- **NEVER** touch use cases or entities
- Services must be pure: input → database operation → output

**Deliverables:**
- Pure data services passing all tests
- Complete database schema with RLS
- Optimized queries with proper indexing
- Database migrations and security policies

---

#### 5. **UI/UX Expert Agent (Interface Specialist)**
**Role:** UI/UX Designer and Interface Specialist - Creates user interfaces

**Core Mission:**
- Create accessible React components using shadcn/ui that pass E2E tests
- Integrate with implemented use cases to create complete user experience

**Exclusive Responsibilities:**
- **React Components**: UI components using only approved stack (shadcn/ui, Tailwind)
- **E2E Test Compliance**: Make Playwright E2E tests pass without modifying them
- **Accessibility**: WCAG 2.1 AA compliance mandatory
- **User Experience**: Loading states, error handling, responsive design
- **Performance**: Core Web Vitals optimization and efficient rendering

**Strict Limitations:**
- **NEVER** implement business logic in components
- **NEVER** modify E2E tests (they are immutable specification)
- **NEVER** access data services directly (must use implemented use cases)
- **NEVER** use non-approved UI libraries
- **NEVER** create non-accessible components

**Deliverables:**
- Complete functional UI passing all E2E tests
- WCAG 2.1 AA accessible components
- Responsive design for multiple breakpoints
- Optimized performance (Core Web Vitals green)

### TDD Principles (IMMUTABLE)
1. **Red**: Test Agent creates tests for EVERYTHING that FAIL
2. **Green**: Each agent makes THEIR tests pass without modifying tests
3. **Refactor**: Each agent improves code keeping tests green
4. **PROHIBITED**: Any agent modifying tests to make implementation pass

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

## 📋 PRD System (Product Requirements Documents)

### Purpose and Objectives
The PRD system maintains organization, traceability, and coherence in feature development using our specialized agent ecosystem. Located in `/PRDs/`, this system provides:

- **Organization**: Clear and scalable structure for documentation
- **Traceability**: Complete tracking from requirement to implementation
- **Coherence**: Uniform standards for all agents
- **Efficiency**: Reusable templates and optimized processes
- **Quality**: Validation and review at each stage

### Directory Structure
```
PRDs/
├── _templates/                    # Reusable templates
│   ├── 00-master-prd-template.md # Architect template
│   ├── 01-supabase-template.md   # Supabase Agent template
│   ├── 02-test-template.md       # Test Agent template
│   ├── 03-implementation-template.md # Implementer template
│   ├── 04-ui-template.md         # UI/UX Expert template
│   └── _status-template.md       # Status tracking template
│
├── _examples/                     # Reference examples
│   └── 001-example-task-comments/ # Complete feature example
│
├── [domain]/                      # Feature domains (tasks, projects, auth)
│   └── [number]-[feature-name]/   # Individual features
│       ├── 00-master-prd.md      # Master PRD (Architect)
│       ├── 01-supabase-spec.md   # DB specifications (Supabase Agent)
│       ├── 02-test-spec.md       # Test specifications (Test Agent)
│       ├── 03-implementation-spec.md # Implementation guide (Implementer)
│       ├── 04-ui-spec.md         # UI/UX specifications (UI/UX Expert)
│       └── _status.md            # Progress tracking
│
└── GUIA-USO-PRD.md              # Comprehensive usage guide
```

### Agent-Template Mapping
- **00-master-prd-template.md**: Architect → Complete requirements, data contracts, API specifications
- **01-supabase-template.md**: Supabase Agent → Database schema, RLS policies, data services
- **02-test-template.md**: Test Agent → Complete test suite (unit, integration, mocking)
- **03-implementation-template.md**: Implementer Agent → Use cases, API endpoints, business logic
- **04-ui-template.md**: UI/UX Expert Agent → React components, E2E tests, accessibility
- **_status-template.md**: All Agents → Progress tracking, metrics, blockers

### Naming Conventions
- **Feature ID**: `[domain]-[number]` (e.g., `tasks-001`, `auth-003`)
- **Directory**: `[number]-[feature-name-kebab-case]` (e.g., `001-create-task`)
- **Files**: Always use the numbered prefixes (`00-`, `01-`, `02-`, etc.)

### Workflow Process
1. **Architect** creates PRD master from user requirements
2. **Sequential agent execution** following TDD agent order
3. **Each agent** copies their template and completes it
4. **Status tracking** updated by each agent upon completion
5. **Continuous validation** against acceptance criteria

### Key Features of PRD System
- **Immutable templates**: Templates provide consistent structure
- **Status tracking**: Real-time progress monitoring with metrics
- **Agent coordination**: Clear handoffs between specialized agents
- **Quality gates**: Validation criteria at each stage
- **Reusable examples**: Reference implementations for guidance

### Usage Commands
```bash
# Create new feature directory
mkdir PRDs/[domain]/[number]-[feature-name]

# Copy templates for new feature
cp PRDs/_templates/*.md PRDs/[domain]/[number]-[feature-name]/

# View feature status
cat PRDs/[domain]/[number]-[feature-name]/_status.md

# Reference examples
find PRDs/_examples -name "*.md"
```

### Critical PRD Rules
- **Always use templates**: Never create PRD documents from scratch
- **Follow agent sequence**: Respect the TDD agent execution order
- **Update status files**: Each agent must update `_status.md` upon completion
- **Document decisions**: Record technical decisions and rationale
- **Maintain traceability**: Link implementation back to requirements

For complete details, see `PRDs/GUIA-USO-PRD.md`.


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