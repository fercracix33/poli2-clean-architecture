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