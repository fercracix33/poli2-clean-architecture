# Architect Deep Analysis Skill

## Purpose

This skill guides the Architect Agent through a rigorous, methodical process for analyzing user requirements and generating comprehensive, unambiguous technical specifications (PRDs).

**Use this skill when:**
- Starting any new feature development
- User requests a new capability or enhancement
- Translating high-level requirements into technical specifications
- Creating the foundation for the TDD agent workflow

**This skill prevents:**
- Ambiguous requirements that block downstream agents
- Incomplete PRDs missing critical details
- Inconsistent patterns across the codebase
- Architectural violations and technology mismatches
- Unnecessary rework due to unclear specifications

## Prerequisites

Before starting this skill:
- [ ] Read `CLAUDE.md` for complete project rules
- [ ] Read `PRDs/GUIA-USO-PRD.md` for PRD system usage
- [ ] Read `.trae/rules/project_rules.md` for architectural rules
- [ ] Have clear user requirement statement
- [ ] Ensure you understand the TDD agent sequence

## Process Overview

```
Phase 1: Discovery & Clarification (MANDATORY - Cannot skip)
    ↓
Phase 2: Research & Context Gathering (Use MCPs and exploration)
    ↓
Phase 3: Design & Specification (Define all layers)
    ↓
Phase 4: Documentation (Create PRD and entities)
    ↓
Phase 5: Validation & Quality Check (Verify completeness)
    ↓
Phase 6: Handoff Preparation (Set up for Test Agent)
```

---

## Phase 1: Discovery & Clarification

**OBJECTIVE**: Eliminate ALL ambiguity before design. Never assume.

### Step 1.1: Initial Requirement Analysis

**Read the user's requirement carefully and identify:**
- What domain does this feature belong to? (tasks, projects, auth, etc.)
- What is the core user problem being solved?
- What existing features does this interact with?

### Step 1.2: Mandatory Clarification Questions

**⚠️ CRITICAL: You MUST ask 5-10 clarifying questions. DO NOT PROCEED without clear answers.**

Use this question framework:

```markdown
Before I create the technical specification, I need to clarify several aspects:

## 🔒 PERMISSIONS & AUTHORIZATION
1. Who can perform this action? (specific roles/user types)
2. What are the permission boundaries? (organization-level, user-level, public?)
3. Should this respect existing multi-tenancy patterns?

## ⚙️ FUNCTIONAL REQUIREMENTS
4. What are ALL the actions users can take? (create, read, update, delete, other?)
5. Can this data be edited after creation? By whom?
6. What happens when [edge case scenario]?

## 📊 DATA REQUIREMENTS
7. What data fields are required vs optional?
8. What are the validation rules? (lengths, formats, regex patterns?)
9. What are the relationships with existing entities? (foreign keys?)

## 🔔 SIDE EFFECTS & INTEGRATION
10. Should this trigger notifications or other side effects?
11. Does this affect other existing features?
12. Are there external API integrations needed?

## ⚡ PERFORMANCE & REAL-TIME
13. Are there real-time requirements? (websockets, polling?)
14. Expected data volume? (need pagination, virtualization?)
15. Any special caching considerations?
```

**Wait for user responses before proceeding.**

### Step 1.3: Requirement Summary

After receiving answers, create a requirement summary:

```markdown
## Requirement Summary

**Feature Domain**: [domain]
**Feature Name**: [descriptive name in kebab-case]
**Feature ID**: [domain]-[next-number]-[feature-name]

**Core Problem**: [one sentence]
**Proposed Solution**: [one sentence]
**Expected Impact**: [business value in 1-2 sentences]

**Key Clarifications**:
- [Clarification 1 from user answers]
- [Clarification 2 from user answers]
- [Clarification 3 from user answers]
```

---

## Phase 2: Research & Context Gathering

**OBJECTIVE**: Gather context from existing systems and latest documentation before making any design decisions.

### Step 2.1: Explore Existing Codebase Patterns

**Tool: `Glob` + `Read`**

```bash
# Find existing features in the same domain
Glob: "app/src/features/{domain-name}/**/*.ts"

# Find similar entity patterns
Glob: "app/src/features/**/entities.ts"

# Find similar use cases
Glob: "app/src/features/**/use-cases/*.ts"
```

**Read 2-3 similar features and document:**
- What naming conventions are used? (PascalCase, camelCase, kebab-case patterns)
- What Zod patterns are common? (schema structure, validation messages)
- What database column naming? (snake_case in DB, camelCase in TypeScript?)
- What multi-tenancy patterns? (organization_id present? RLS patterns?)
- What common relationships exist? (user_id, organization_id foreign keys?)

**Document findings:**
```markdown
## Codebase Patterns Discovered

**Naming Conventions**:
- Database columns: [snake_case/camelCase]
- TypeScript types: [PascalCase/camelCase]
- API endpoints: [pattern]

**Common Zod Patterns**:
- [Pattern 1 example]
- [Pattern 2 example]

**Multi-tenancy**:
- Organization isolation: [yes/no, how implemented]
- RLS policies pattern: [example]

**Existing Relationships**:
- [Entity A] → [Entity B] (relationship type)
- Common foreign keys: user_id, organization_id
```

### Step 2.2: Consult Context7 for Latest Best Practices

**Tool: `mcp__context7__resolve-library-id` + `mcp__context7__get-library-docs`**

**MANDATORY consultations (do all in parallel):**

```typescript
// 1. Next.js App Router patterns
context7.resolve_library_id({ libraryName: "next.js" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router api routes error handling",
  tokens: 3000
})

// 2. Supabase RLS and multi-tenancy
context7.resolve_library_id({ libraryName: "supabase" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/supabase/supabase",
  topic: "row level security policies multi-tenant",
  tokens: 3000
})

// 3. Zod schema validation patterns
context7.resolve_library_id({ libraryName: "zod" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/colinhacks/zod",
  topic: "schema validation refinements error messages",
  tokens: 2500
})

// 4. shadcn/ui component patterns (if UI is part of feature)
context7.resolve_library_id({ libraryName: "shadcn/ui" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/shadcn/ui",
  topic: "form components react-hook-form",
  tokens: 2000
})

// 5. TanStack Query patterns (if data fetching in UI)
context7.resolve_library_id({ libraryName: "tanstack query" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/tanstack/query",
  topic: "mutations optimistic updates",
  tokens: 2000
})
```

**Document findings:**
```markdown
## Latest Best Practices (Context7)

**Next.js App Router**:
- [Key pattern or recommendation]
- [Error handling approach]

**Supabase RLS**:
- [Multi-tenancy pattern]
- [Policy structure example]

**Zod Validation**:
- [Schema composition pattern]
- [Error message handling]

**UI Patterns** (if applicable):
- [shadcn/ui usage]
- [TanStack Query pattern]
```

### Step 2.3: Database Schema Exploration

**Tool: `mcp__supabase__list_tables` + `mcp__supabase__execute_sql`**

```typescript
// 1. List all existing tables
supabase.list_tables({ schemas: ['public'] })

// 2. If feature interacts with existing tables, inspect them
supabase.execute_sql({
  query: `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'existing_table'
    ORDER BY ordinal_position;
  `
})

// 3. Check existing foreign key patterns
supabase.execute_sql({
  query: `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
  `
})

// 4. Review existing RLS policies
supabase.execute_sql({
  query: `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public';
  `
})
```

**Document findings:**
```markdown
## Database Schema Analysis

**Existing Tables**:
- [table_name]: [brief description, key columns]

**Foreign Key Patterns**:
- ON DELETE CASCADE for cleanup
- organization_id for multi-tenancy
- user_id for ownership

**RLS Policy Patterns**:
- [Common pattern 1: e.g., auth.uid() = user_id]
- [Common pattern 2: e.g., organization membership check]

**Indexes**:
- Common indexes: [patterns found]
```

### Step 2.4: i18n Namespace Planning

**Tool: `Read` + `Glob`**

```bash
# Check existing i18n structure
Read: "app/src/i18n/request.ts"

# Find existing translation namespaces
Glob: "app/src/locales/en/*.json"
```

**Plan i18n for this feature:**
```markdown
## i18n Strategy

**Namespace**: `[feature-domain]` (e.g., 'tasks', 'projects')

**Translation Keys Needed**:
- Form labels: `[namespace].form.[field].label`
- Validation errors: `[namespace].form.[field].error`
- Success messages: `[namespace].actions.[action].success`
- Error messages: `[namespace].actions.[action].error`
- UI labels: `[namespace].ui.[element]`

**Files to Create**:
- `app/src/locales/en/[namespace].json`
- `app/src/locales/es/[namespace].json`

**Update Required**:
- ⚠️ MUST update `app/src/i18n/request.ts` to import and merge namespace
```

---

## Phase 3: Design & Specification

**OBJECTIVE**: Design complete technical architecture for all layers.

### Step 3.1: Database Schema Design

**Based on research from Phase 2, design the database schema.**

```markdown
## Database Schema Design

**Table Name**: `[table_name]` (snake_case)

**Columns**:
```sql
CREATE TABLE [table_name] (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Business fields
  [field1] VARCHAR(200) NOT NULL,
  [field2] TEXT,
  [field3] VARCHAR(50) NOT NULL CHECK ([field3] IN ('value1', 'value2')),

  -- Relationships (follow existing patterns)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_[table]_user_id ON [table_name](user_id);
CREATE INDEX idx_[table]_organization_id ON [table_name](organization_id);
CREATE INDEX idx_[table]_created_at ON [table_name](created_at DESC);
```

**Relationships**:
- [Entity] belongs to User (user_id)
- [Entity] belongs to Organization (organization_id)
- [Entity] has many [RelatedEntity] (if applicable)

**RLS Policies**:
```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view organization data
CREATE POLICY "Users can view own organization [entities]"
  ON [table_name] FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create for own organization
CREATE POLICY "Users can create [entities] for own organization"
  ON [table_name] FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update own records
CREATE POLICY "Users can update own [entities]"
  ON [table_name] FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete own records
CREATE POLICY "Users can delete own [entities]"
  ON [table_name] FOR DELETE
  USING (user_id = auth.uid());
```

**Rationale**:
- [Why this schema design]
- [Why these indexes]
- [Why these RLS policies]
```

### Step 3.2: Data Contracts (Zod Schemas)

**Design complete Zod schemas following existing patterns.**

```markdown
## Data Contracts (entities.ts)

**Location**: `app/src/features/[feature-name]/entities.ts`

```typescript
import { z } from 'zod';

// ============================================================================
// MAIN ENTITY SCHEMA
// ============================================================================

/**
 * [Entity] represents [description]
 */
export const [Entity]Schema = z.object({
  id: z.string().uuid(),

  // Business fields with validation
  [field1]: z.string()
    .min(1, 'errors.[namespace].field1.required')
    .max(200, 'errors.[namespace].field1.maxLength'),

  [field2]: z.string()
    .optional(),

  [field3]: z.enum(['value1', 'value2', 'value3'], {
    errorMap: () => ({ message: 'errors.[namespace].field3.invalid' })
  }),

  // Relationships
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),

  // Timestamps
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ============================================================================
// DERIVED SCHEMAS
// ============================================================================

/**
 * Schema for creating new [Entity]
 */
export const [Entity]CreateSchema = [Entity]Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating [Entity]
 */
export const [Entity]UpdateSchema = [Entity]Schema
  .omit({
    id: true,
    userId: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

/**
 * Schema for query parameters
 */
export const [Entity]QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', '[field]']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type [Entity] = z.infer<typeof [Entity]Schema>;
export type [Entity]Create = z.infer<typeof [Entity]CreateSchema>;
export type [Entity]Update = z.infer<typeof [Entity]UpdateSchema>;
export type [Entity]Query = z.infer<typeof [Entity]QuerySchema>;
```

**Validation Rules**:
- [field1]: Required, 1-200 characters
- [field2]: Optional
- [field3]: Must be one of predefined values

**Error Messages**: All error messages use i18n keys for translation
```

### Step 3.3: Use Case Interfaces

**Define function signatures for ALL use cases.**

```markdown
## Use Case Interfaces

**Location**: `app/src/features/[feature-name]/use-cases/`

### create[Entity].ts
```typescript
import type { [Entity], [Entity]Create } from '../entities';

/**
 * Creates a new [entity]
 *
 * Business Rules:
 * - User must be authenticated
 * - User must belong to the organization
 * - [Additional business rule]
 *
 * @param data - Validated entity creation data
 * @param userId - Authenticated user ID
 * @param organizationId - Target organization ID
 * @returns Created entity
 * @throws {Error} If validation fails or user lacks permission
 */
export async function create[Entity](
  data: [Entity]Create,
  userId: string,
  organizationId: string
): Promise<[Entity]> {
  // Implementation by Implementer Agent
}
```

### get[Entity].ts
```typescript
/**
 * Retrieves a single [entity] by ID
 *
 * Authorization:
 * - User must belong to the entity's organization
 *
 * @param id - Entity ID
 * @param userId - Authenticated user ID
 * @returns Entity or null if not found
 */
export async function get[Entity](
  id: string,
  userId: string
): Promise<[Entity] | null> {
  // Implementation by Implementer Agent
}
```

### list[Entities].ts
```typescript
import type { [Entity]Query } from '../entities';

/**
 * Lists [entities] with pagination and filtering
 *
 * @param query - Query parameters (page, limit, sortBy, order)
 * @param userId - Authenticated user ID
 * @param organizationId - Organization filter
 * @returns Paginated list of entities
 */
export async function list[Entities](
  query: [Entity]Query,
  userId: string,
  organizationId: string
): Promise<{
  data: [Entity][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  // Implementation by Implementer Agent
}
```

### update[Entity].ts
```typescript
import type { [Entity]Update } from '../entities';

/**
 * Updates an existing [entity]
 *
 * Authorization:
 * - User must be the owner (user_id match)
 *
 * @param id - Entity ID
 * @param data - Partial update data
 * @param userId - Authenticated user ID
 * @returns Updated entity
 * @throws {Error} If entity not found or user not authorized
 */
export async function update[Entity](
  id: string,
  data: [Entity]Update,
  userId: string
): Promise<[Entity]> {
  // Implementation by Implementer Agent
}
```

### delete[Entity].ts
```typescript
/**
 * Deletes a [entity]
 *
 * Authorization:
 * - User must be the owner
 *
 * Side Effects:
 * - [Cascade deletions or other effects]
 *
 * @param id - Entity ID
 * @param userId - Authenticated user ID
 * @throws {Error} If entity not found or user not authorized
 */
export async function delete[Entity](
  id: string,
  userId: string
): Promise<void> {
  // Implementation by Implementer Agent
}
```

**Dependencies** (Service interfaces needed):
```typescript
// app/src/features/[feature-name]/services/[feature].service.ts
export interface [Entity]Service {
  create(data: [Entity]Create): Promise<[Entity]>;
  getById(id: string, userId: string): Promise<[Entity] | null>;
  list(query: [Entity]Query, organizationId: string): Promise<[Entity][]>;
  count(organizationId: string): Promise<number>;
  update(id: string, data: [Entity]Update): Promise<[Entity]>;
  delete(id: string): Promise<void>;
}
```
```

### Step 3.4: API Specifications

**Define ALL API endpoints following Next.js App Router patterns.**

```markdown
## API Specifications

**Base Path**: `/api/[feature]`

### POST /api/[feature]

**Purpose**: Create new [entity]

**Authentication**: Required (Supabase Auth)

**Request**:
```typescript
{
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token}'
  },
  body: [Entity]CreateSchema
}
```

**Response**:
```typescript
// 201 Created
{
  data: [Entity]
}

// 400 Bad Request (validation error)
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: ZodError
  }
}

// 401 Unauthorized
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }
}

// 403 Forbidden
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions'
  }
}

// 500 Internal Server Error
{
  error: {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  }
}
```

**Implementation Location**: `app/src/app/api/[feature]/route.ts`

---

### GET /api/[feature]

**Purpose**: List [entities] with pagination

**Authentication**: Required

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `sortBy` (string: 'createdAt' | 'updatedAt' | '[field]')
- `order` (string: 'asc' | 'desc')

**Response**:
```typescript
// 200 OK
{
  data: [Entity][],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

---

### GET /api/[feature]/[id]

**Purpose**: Get single [entity]

**Authentication**: Required

**Response**:
```typescript
// 200 OK
{
  data: [Entity]
}

// 404 Not Found
{
  error: {
    code: 'NOT_FOUND',
    message: '[Entity] not found'
  }
}
```

---

### PATCH /api/[feature]/[id]

**Purpose**: Update [entity]

**Authentication**: Required

**Request**:
```typescript
{
  body: [Entity]UpdateSchema
}
```

**Response**:
```typescript
// 200 OK
{
  data: [Entity]
}
```

---

### DELETE /api/[feature]/[id]

**Purpose**: Delete [entity]

**Authentication**: Required

**Response**:
```typescript
// 204 No Content

// 404 Not Found
{
  error: {
    code: 'NOT_FOUND',
    message: '[Entity] not found'
  }
}
```
```

### Step 3.5: Component Specifications (UI Layer)

**Define UI components and their responsibilities.**

```markdown
## Component Specifications

**Location**: `app/src/features/[feature-name]/components/`

### [Entity]Form.tsx

**Purpose**: Form for creating/editing [entity]

**Props**:
```typescript
interface [Entity]FormProps {
  mode: 'create' | 'edit';
  initialData?: [Entity];
  onSuccess?: (entity: [Entity]) => void;
  onCancel?: () => void;
}
```

**Behavior**:
- Uses React Hook Form + Zod validation
- Uses shadcn/ui form components
- Shows loading state during submission
- Shows error messages (translated)
- Calls `create[Entity]` or `update[Entity]` use case via TanStack Query

**Accessibility**:
- All form fields have labels
- Error messages announced to screen readers
- Keyboard navigation support

**i18n Namespace**: `[feature-domain]`

---

### [Entity]List.tsx

**Purpose**: Display list of [entities] with pagination

**Props**:
```typescript
interface [Entity]ListProps {
  organizationId: string;
}
```

**Behavior**:
- Uses TanStack Query to fetch data
- Shows loading skeleton
- Shows empty state when no data
- Pagination controls
- Sort controls
- Click entity to view details

**Accessibility**:
- Semantic HTML (table or list)
- Loading state announced
- Pagination keyboard navigable

---

### [Entity]Details.tsx

**Purpose**: Display single [entity] details

**Props**:
```typescript
interface [Entity]DetailsProps {
  entityId: string;
}
```

**Behavior**:
- Fetches entity data
- Shows loading state
- Shows error state if not found
- Edit/Delete actions (if authorized)

---

### Page Component

**Location**: `app/src/app/(main)/[feature]/page.tsx`

**Purpose**: Main page for [feature]

**Behavior**:
- Server component (initial data loading)
- Passes data to client components
- Handles authentication check
- Breadcrumbs and navigation
```

---

## Phase 4: Documentation

**OBJECTIVE**: Create complete, unambiguous PRD and implementation artifacts.

### Step 4.1: Create Master PRD

**Tool: `Read` template, then `Write` PRD**

```bash
# Read the template
Read: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\_templates\00-master-prd-template.md"

# Create PRD directory
mkdir: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\[domain]\[number]-[feature-name]"

# Write Master PRD
Write: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\[domain]\[number]-[feature-name]\00-master-prd.md"
```

**Fill ALL sections completely:**
1. Executive Summary
2. Problem Statement
3. Goals and Success Metrics
4. User Stories
5. Functional Requirements
6. Data Contracts (copy from Phase 3.2)
7. API Specifications (copy from Phase 3.4)
8. Technical Architecture (copy from Phase 3.1)
9. Testing Strategy
10. Security Considerations
11. Acceptance Criteria
12. Out of Scope
13. Dependencies & Prerequisites
14. Timeline Estimate

**⚠️ NO section should be left with TODOs or placeholders.**

### Step 4.2: Implement entities.ts

**Tool: `Write`**

```bash
# Create feature directory
mkdir: "c:\Users\Usuario\Desktop\programación\poli2\app\src\features\[feature-name]"

# Write entities.ts
Write: "c:\Users\Usuario\Desktop\programación\poli2\app\src\features\[feature-name]\entities.ts"
```

**Copy the complete Zod schemas from Phase 3.2.**

**Ensure:**
- All imports are correct (`import { z } from 'zod';`)
- All schemas are exported
- All TypeScript types are exported
- JSDoc comments are present
- Error messages use i18n keys

### Step 4.3: Create Complete Directory Structure

**Tool: `Bash`**

```bash
cd "c:\Users\Usuario\Desktop\programación\poli2\app\src"

# Create feature subdirectories
mkdir -p "features/[feature-name]/components"
mkdir -p "features/[feature-name]/use-cases"
mkdir -p "features/[feature-name]/services"

# Create placeholder files for other agents
touch "features/[feature-name]/use-cases/create[Entity].ts"
touch "features/[feature-name]/use-cases/create[Entity].test.ts"
touch "features/[feature-name]/use-cases/get[Entity].ts"
touch "features/[feature-name]/use-cases/get[Entity].test.ts"
touch "features/[feature-name]/use-cases/list[Entities].ts"
touch "features/[feature-name]/use-cases/list[Entities].test.ts"
touch "features/[feature-name]/use-cases/update[Entity].ts"
touch "features/[feature-name]/use-cases/update[Entity].test.ts"
touch "features/[feature-name]/use-cases/delete[Entity].ts"
touch "features/[feature-name]/use-cases/delete[Entity].test.ts"

touch "features/[feature-name]/services/[feature].service.ts"
touch "features/[feature-name]/services/[feature].service.test.ts"

touch "features/[feature-name]/components/[Entity]Form.tsx"
touch "features/[feature-name]/components/[Entity]List.tsx"
touch "features/[feature-name]/components/[Entity]Details.tsx"

# Create API routes
mkdir -p "app/api/[feature]/[id]"
touch "app/api/[feature]/route.ts"
touch "app/api/[feature]/[id]/route.ts"

# Create page
mkdir -p "app/(main)/[feature]"
touch "app/(main)/[feature]/page.tsx"
```

### Step 4.4: Create i18n Translation Files

**Tool: `Write`**

```bash
# Create English translations
Write: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\en\[namespace].json"

# Create Spanish translations
Write: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\es\[namespace].json"
```

**Structure:**
```json
{
  "form": {
    "field1": {
      "label": "Field 1 Label",
      "placeholder": "Enter field 1",
      "error": "Field 1 is invalid"
    }
  },
  "actions": {
    "create": {
      "success": "Created successfully",
      "error": "Failed to create"
    }
  },
  "ui": {
    "title": "Page Title",
    "empty": "No items found"
  }
}
```

### Step 4.5: Update i18n Configuration

**Tool: `Read` + `Edit`**

```bash
# Read current config
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\src\i18n\request.ts"

# Add import and merge for new namespace
Edit: "c:\Users\Usuario\Desktop\programación\poli2\app\src\i18n\request.ts"
```

**Add:**
```typescript
// Import new namespace
const [namespace]Messages = (await import(`@/locales/${locale}/[namespace].json`)).default;

// Merge into messages object
const messages = {
  ...commonMessages,
  auth: authMessages,
  [namespace]: [namespace]Messages, // ← ADD THIS
};
```

### Step 4.6: Initialize Status Tracking

**Tool: `Read` template + `Write` status**

```bash
# Read template
Read: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\_templates\_status-template.md"

# Write status file
Write: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\[domain]\[number]-[feature-name]\_status.md"
```

**Initialize with:**
- Feature ID
- Current status: "In Progress - Architect"
- Architect: Completed
- All other agents: Not Started
- Metrics: All 0%

---

## Phase 5: Validation & Quality Check

**OBJECTIVE**: Verify completeness and quality before handoff.

### Step 5.1: Architecture Validation Checklist

Run through this checklist:

```markdown
## Architecture Validation

### Clean Architecture Compliance
- [ ] Entities are pure (only Zod imports)
- [ ] Use cases defined (no implementation yet)
- [ ] Services defined (interface only)
- [ ] Components specified (UI layer)
- [ ] Dependencies point inward (outer layers depend on inner)

### Technology Stack Compliance
- [ ] Only approved technologies used
- [ ] No Jest, Redux, MobX, traditional CSS
- [ ] Vitest for testing (specified in test plan)
- [ ] Supabase for data access
- [ ] shadcn/ui for UI components
- [ ] TanStack Query for data fetching

### Directory Structure
- [ ] Follows canonical structure
- [ ] Feature-based organization
- [ ] All subdirectories created
- [ ] Placeholder files exist
```

### Step 5.2: PRD Completeness Checklist

**Tool: `SlashCommand`**

```bash
/prd-checklist [domain]/[number]-[feature-name]
```

**Manual verification:**

```markdown
## PRD Completeness

### Master PRD (00-master-prd.md)
- [ ] All 14 sections completed
- [ ] No TODO or placeholder text
- [ ] Executive summary clear and concise
- [ ] User stories with acceptance criteria
- [ ] Complete data contracts (Zod schemas)
- [ ] All API endpoints documented
- [ ] Database schema with RLS policies
- [ ] Testing strategy defined
- [ ] Security considerations documented
- [ ] Acceptance criteria testable
- [ ] Out of scope items listed
- [ ] Timeline estimate provided

### Entities (entities.ts)
- [ ] File exists and compiles
- [ ] All Zod schemas present
- [ ] TypeScript types exported
- [ ] JSDoc comments added
- [ ] Validation rules match requirements
- [ ] Error messages use i18n keys
- [ ] No business logic (pure schemas)

### Directory Structure
- [ ] Feature directory exists
- [ ] use-cases/ directory with placeholders
- [ ] services/ directory with placeholders
- [ ] components/ directory with placeholders
- [ ] API routes created
- [ ] Page file created

### i18n Setup
- [ ] Translation files created (en + es)
- [ ] i18n/request.ts updated with namespace
- [ ] All keys defined in JSON files
- [ ] Both languages have complete translations

### Status Tracking
- [ ] _status.md initialized
- [ ] Architect marked as completed
- [ ] Next agent (Test Agent) identified
```

### Step 5.3: Consistency Checks

```markdown
## Consistency Validation

### Naming Conventions
- [ ] Entity names consistent (PascalCase in code)
- [ ] Database table names consistent (snake_case)
- [ ] API routes consistent (kebab-case)
- [ ] File names follow conventions

### Pattern Consistency
- [ ] Multi-tenancy follows existing pattern
- [ ] RLS policies match existing features
- [ ] Zod schemas follow project style
- [ ] Foreign keys follow naming convention

### API Consistency
- [ ] Error codes match project standard
- [ ] Response format consistent
- [ ] Authentication pattern same as existing
- [ ] Pagination format standard

### i18n Consistency
- [ ] Namespace naming matches domain
- [ ] Key structure matches other features
- [ ] Error message pattern consistent
```

### Step 5.4: Agent Instruction Clarity

**Verify instructions for each agent are crystal clear:**

```markdown
## Agent Instruction Verification

### Test Agent Instructions
- [ ] All test file locations specified
- [ ] Expected test coverage stated (>90%)
- [ ] Mock requirements documented
- [ ] Test scenarios enumerated
- [ ] No ambiguity in what to test

### Implementer Agent Instructions
- [ ] All use case signatures defined
- [ ] Business rules clearly stated
- [ ] Service dependencies identified
- [ ] Error handling specified
- [ ] No ambiguity in logic requirements

### Supabase Agent Instructions
- [ ] Complete database schema provided
- [ ] All RLS policies defined
- [ ] Service interface documented
- [ ] Migration requirements clear
- [ ] No ambiguity in data access

### UI/UX Agent Instructions
- [ ] All components specified
- [ ] Component props defined
- [ ] Behavior requirements clear
- [ ] Accessibility requirements stated
- [ ] E2E test scenarios provided
- [ ] No ambiguity in UI requirements
```

---

## Phase 6: Handoff Preparation

**OBJECTIVE**: Prepare clean handoff to Test Agent.

### Step 6.1: Create Handoff Document

**Write explicit handoff instructions in the PRD.**

```markdown
## 🎯 HANDOFF TO TEST AGENT

**PRD Status**: ✅ Complete
**Feature**: `[feature-name]`
**Location**: `app/src/features/[feature-name]/`
**PRD**: `PRDs/[domain]/[number]-[feature-name]/00-master-prd.md`

### What I've Delivered

1. **Complete Master PRD**
   - Location: `PRDs/[domain]/[number]-[feature-name]/00-master-prd.md`
   - All 14 sections completed
   - Zero ambiguity in requirements

2. **Complete Directory Structure**
   - Feature directory: `app/src/features/[feature-name]/`
   - All subdirectories created
   - Placeholder files for all layers

3. **Implemented Entities**
   - File: `app/src/features/[feature-name]/entities.ts`
   - All Zod schemas implemented
   - TypeScript types exported
   - Compiles without errors

4. **i18n Setup**
   - Translation files: `app/src/locales/{en,es}/[namespace].json`
   - Config updated: `app/src/i18n/request.ts`

5. **Status Tracking**
   - File: `PRDs/[domain]/[number]-[feature-name]/_status.md`
   - Architect phase marked complete

### What You Must Do

1. **Read and Understand**
   - Read complete Master PRD
   - Understand all functional requirements
   - Understand all acceptance criteria
   - Ask questions if ANY ambiguity exists

2. **Copy Test Template**
   - Source: `PRDs/_templates/02-test-template.md`
   - Destination: `PRDs/[domain]/[number]-[feature-name]/02-test-spec.md`

3. **Create Comprehensive Test Suite**

   **Entity Tests**:
   - File: `app/src/features/[feature-name]/entities.test.ts`
   - Validate all Zod schemas
   - Test all validation rules
   - Test error messages

   **Use Case Tests** (create for each use case):
   - `create[Entity].test.ts`
   - `get[Entity].test.ts`
   - `list[Entities].test.ts`
   - `update[Entity].test.ts`
   - `delete[Entity].test.ts`

   Requirements:
   - Mock all service dependencies
   - Test happy paths
   - Test error cases
   - Test authorization logic
   - Test business validations
   - Coverage target: >90%

   **Service Tests**:
   - File: `services/[feature].service.test.ts`
   - Mock Supabase client
   - Test all CRUD operations
   - Test RLS enforcement
   - Coverage target: >90%

   **API Tests**:
   - File: `app/api/[feature]/route.test.ts`
   - File: `app/api/[feature]/[id]/route.test.ts`
   - Test all endpoints
   - Test authentication
   - Test validation
   - Test error responses

4. **Verify Tests FAIL Appropriately**
   - All tests must initially fail
   - Failure reason: "function not defined" or similar
   - No test should pass before implementation

5. **Update Status**
   - Command: `/agent-handoff [domain]/[number]-[feature-name] test-agent completed`
   - Update `_status.md` with completion metrics

### Critical Requirements

**MUST DO**:
- ✅ Create tests for ALL layers (entities, use cases, services, API)
- ✅ Mock external dependencies (Supabase, auth)
- ✅ Verify all tests fail initially
- ✅ Achieve >90% coverage target
- ✅ Tests become immutable specification

**MUST NOT DO**:
- ❌ Implement any functional code
- ❌ Modify entities.ts
- ❌ Skip any test scenarios
- ❌ Create tests that pass without implementation

### Files You Will Create

```
app/src/features/[feature-name]/
├── entities.test.ts              # ← YOU create
├── use-cases/
│   ├── create[Entity].test.ts   # ← YOU create
│   ├── get[Entity].test.ts      # ← YOU create
│   ├── list[Entities].test.ts   # ← YOU create
│   ├── update[Entity].test.ts   # ← YOU create
│   └── delete[Entity].test.ts   # ← YOU create
└── services/
    └── [feature].service.test.ts # ← YOU create

app/src/app/api/[feature]/
├── route.test.ts                 # ← YOU create
└── [id]/route.test.ts            # ← YOU create

PRDs/[domain]/[number]-[feature-name]/
└── 02-test-spec.md               # ← YOU create
```

### Questions or Concerns?

If ANY part of this PRD is ambiguous or unclear:
1. **STOP** - Do not proceed with assumptions
2. **ASK** - Request clarification from human or architect
3. **WAIT** - Wait for clear answer before creating tests

**Ready to proceed?**
```

### Step 6.2: Final Verification

Run through final checklist:

```markdown
## Final Handoff Checklist

### Deliverables Complete
- [ ] Master PRD exists and is 100% complete
- [ ] entities.ts implemented and compiles
- [ ] Directory structure created
- [ ] i18n files created and config updated
- [ ] _status.md initialized
- [ ] Handoff document written

### Quality Assurance
- [ ] No TODOs or placeholders in PRD
- [ ] No ambiguous requirements
- [ ] All interfaces clearly defined
- [ ] All technical decisions documented
- [ ] Rationale provided for key decisions

### Consistency
- [ ] Naming conventions followed
- [ ] Patterns match existing features
- [ ] Technology stack compliant
- [ ] Clean Architecture respected

### Clarity for Next Agent
- [ ] Test Agent knows exactly what to test
- [ ] All test file locations specified
- [ ] Coverage expectations clear
- [ ] Mock requirements documented
```

### Step 6.3: Execute Handoff Command

**Tool: `SlashCommand`**

```bash
/agent-handoff [domain]/[number]-[feature-name] arquitecto completed
```

This will:
- Update `_status.md` automatically
- Mark Architect phase as completed
- Indicate Test Agent is next

### Step 6.4: Communicate Handoff

**Provide final message to user:**

```markdown
## ✅ Architecture Phase Complete

**Feature**: [Feature Name]
**Feature ID**: [domain]-[number]-[feature-name]

### Deliverables

1. **Complete Master PRD**
   - Location: `PRDs/[domain]/[number]-[feature-name]/00-master-prd.md`
   - All requirements documented
   - All technical specifications defined

2. **Implemented Entities**
   - Location: `app/src/features/[feature-name]/entities.ts`
   - All Zod schemas implemented
   - TypeScript types exported

3. **Complete Directory Structure**
   - Feature directory with all subdirectories
   - Placeholder files for all agents
   - API routes created
   - Page structure created

4. **i18n Setup**
   - Translation namespaces created
   - Configuration updated

5. **Status Tracking**
   - Progress tracking initialized
   - Architect phase marked complete

### Next Steps

**Test Agent** is now ready to:
1. Read the Master PRD
2. Create comprehensive test suite (>90% coverage)
3. Ensure all tests fail appropriately
4. Hand off to Implementer Agent

All technical decisions have been documented. Zero ambiguity remains.

**Ready for Test Agent to proceed.**
```

---

## Deliverables Checklist

Before considering this skill complete, verify ALL deliverables:

### Master PRD (00-master-prd.md)
- [ ] Section 1: Executive Summary (complete)
- [ ] Section 2: Problem Statement (complete)
- [ ] Section 3: Goals and Success Metrics (complete)
- [ ] Section 4: User Stories (complete with acceptance criteria)
- [ ] Section 5: Functional Requirements (complete)
- [ ] Section 6: Data Contracts (complete Zod schemas)
- [ ] Section 7: API Specifications (all endpoints documented)
- [ ] Section 8: Technical Architecture (DB schema + RLS)
- [ ] Section 9: Testing Strategy (comprehensive)
- [ ] Section 10: Security Considerations (complete)
- [ ] Section 11: Acceptance Criteria (testable)
- [ ] Section 12: Out of Scope (documented)
- [ ] Section 13: Dependencies & Prerequisites (listed)
- [ ] Section 14: Timeline Estimate (provided)

### Entities (entities.ts)
- [ ] File exists and compiles without errors
- [ ] All main schemas defined
- [ ] All derived schemas (Create, Update, Query)
- [ ] TypeScript types exported
- [ ] JSDoc comments present
- [ ] Validation rules match PRD
- [ ] Error messages use i18n keys
- [ ] No business logic present

### Directory Structure
- [ ] Feature directory created
- [ ] use-cases/ subdirectory with placeholder files
- [ ] services/ subdirectory with placeholder files
- [ ] components/ subdirectory with placeholder files
- [ ] API route directories created
- [ ] Page file created

### i18n Setup
- [ ] English translation file created
- [ ] Spanish translation file created
- [ ] All required keys defined
- [ ] i18n/request.ts updated with namespace import
- [ ] Namespace merged into messages object

### Status Tracking
- [ ] _status.md file created from template
- [ ] Feature ID set correctly
- [ ] Architect phase marked completed
- [ ] Other agents marked not started
- [ ] Metrics initialized to 0%

### Handoff Documentation
- [ ] Clear handoff message written
- [ ] All deliverables listed
- [ ] Test Agent instructions complete
- [ ] File locations specified
- [ ] No ambiguity in next steps

---

## Common Pitfalls to Avoid

### ❌ DON'T: Skip Clarification Questions
**Problem**: Proceeding with assumptions leads to incomplete or wrong specifications.
**Solution**: ALWAYS ask 5-10 clarifying questions before any design work.

### ❌ DON'T: Design Without Research
**Problem**: Reinventing patterns that already exist, inconsistency across features.
**Solution**: ALWAYS explore existing codebase and consult Context7 before designing.

### ❌ DON'T: Create Incomplete PRDs
**Problem**: Downstream agents blocked by ambiguity or missing information.
**Solution**: Fill ALL 14 sections completely. No TODOs, no placeholders.

### ❌ DON'T: Implement Business Logic
**Problem**: Architect implementing use cases violates agent responsibilities.
**Solution**: ONLY implement pure entities.ts (Zod + Types). Nothing else.

### ❌ DON'T: Forget i18n Configuration Update
**Problem**: Components throw MISSING_MESSAGE errors even though translation files exist.
**Solution**: ALWAYS update `i18n/request.ts` to import and merge new namespace.

### ❌ DON'T: Define Vague Interfaces
**Problem**: Test Agent doesn't know what to test, Implementer doesn't know what to build.
**Solution**: Define precise function signatures with parameter types, return types, and JSDoc.

### ❌ DON'T: Ignore Existing Patterns
**Problem**: Feature doesn't match existing code style, creates maintenance burden.
**Solution**: Research existing features first, follow established patterns consistently.

### ❌ DON'T: Skip RLS Policy Design
**Problem**: Security vulnerabilities, data leakage between organizations.
**Solution**: Design complete RLS policies for all CRUD operations in PRD.

### ❌ DON'T: Assume Technology Choices
**Problem**: Using prohibited technologies (Jest, Redux, CSS, etc.).
**Solution**: Strictly follow approved tech stack from CLAUDE.md.

### ❌ DON'T: Create Ambiguous Acceptance Criteria
**Problem**: No clear definition of "done", testing becomes subjective.
**Solution**: Write testable acceptance criteria with specific, measurable outcomes.

---

## Success Criteria

This skill is successful when:

✅ **Zero Ambiguity**: Test Agent can create complete test suite without asking questions
✅ **Complete Specification**: All interfaces, schemas, and APIs precisely defined
✅ **Pattern Consistency**: New feature matches existing codebase patterns
✅ **Technology Compliance**: Only approved stack used, no violations
✅ **i18n Ready**: Translation namespaces properly configured and loaded
✅ **Security Designed**: RLS policies planned for multi-tenant data isolation
✅ **Agent Clarity**: Each downstream agent knows exactly what to build
✅ **Testable Requirements**: Acceptance criteria are specific and measurable
✅ **No Rework**: Implementation proceeds smoothly without backtracking

---

## Skill Usage Example

```bash
# User requests new feature
User: "I need to add a commenting system to tasks"

# Architect invokes this skill
Architect: "I'll use the deep analysis skill to create a comprehensive specification."

# Skill guides through phases:
Phase 1: Ask clarifying questions (permissions, functionality, data, etc.)
Phase 2: Research codebase and Context7 for patterns
Phase 3: Design all layers (DB, entities, use cases, API, UI)
Phase 4: Create PRD, entities.ts, structure, i18n
Phase 5: Validate completeness and consistency
Phase 6: Execute handoff to Test Agent

# Result:
✅ Complete PRD with zero ambiguity
✅ Implemented entities.ts with all Zod schemas
✅ Full directory structure created
✅ i18n properly configured
✅ Clear handoff to Test Agent with specific instructions

# Test Agent can now proceed immediately without questions
```

---

## Notes

- **This skill is MANDATORY for all new features** - Do not create PRDs without following this process
- **Estimated time**: 2-4 hours depending on feature complexity
- **Quality over speed**: Thoroughness in this phase prevents costly rework later
- **When in doubt, ask**: Better to clarify now than fix later

**Remember**: You are the guardian of architectural integrity. Your work sets the foundation for the entire TDD workflow. Be thorough, be precise, be unambiguous.
