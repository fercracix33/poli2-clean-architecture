# UI/UX Expert & Accessibility Specialist Skill

## Purpose

This skill guides the UI/UX Expert Agent (fifth agent in TDD workflow) through a rigorous, methodical process for creating accessible, performant React components that integrate seamlessly with implemented use cases and make E2E tests pass.

**Use this skill when:**
- All previous agents (Architect, Test, Implementer, Supabase) have completed their phases
- E2E tests exist but are failing
- Use cases and services are fully implemented and tested
- UI components need to be created to complete the feature

**This skill prevents:**
- Inaccessible components that violate WCAG 2.1 AA
- Implementing business logic in components
- Modifying E2E tests to make them pass
- Using prohibited technologies (non-approved UI libraries, useEffect for data fetching)
- Performance issues and Core Web Vitals failures
- Hardcoded strings without i18n

## Prerequisites

Before starting this skill:
- [ ] Read `CLAUDE.md` for complete project rules
- [ ] Read `.trae/rules/project_rules.md` for architectural rules
- [ ] Verify Architect, Test Agent, Implementer, and Supabase Agent have completed their phases
- [ ] Verify all unit/integration tests are PASSING
- [ ] Verify E2E tests exist but are FAILING
- [ ] Understand your role: UI layer ONLY, no business logic

## Process Overview

```
Phase 1: E2E Test & Use Case Analysis (Understand requirements)
    ↓
Phase 2: Research & Best Practices (Context7 MANDATORY)
    ↓
Phase 3: Component Design (Plan UI structure)
    ↓
Phase 4: UI Implementation (Make E2E tests pass)
    ↓
Phase 5: Accessibility Validation (WCAG 2.1 AA MANDATORY)
    ↓
Phase 6: Performance Optimization (Core Web Vitals)
    ↓
Phase 7: Validation & Quality Check (Final verification)
    ↓
Phase 8: Handoff Completion (Feature complete)
```

---

## Phase 1: E2E Test & Use Case Analysis

**OBJECTIVE**: Understand what UI needs to be built by analyzing E2E tests and available use cases.

### Step 1.1: Read Master PRD

**Tool: `Read`**

```bash
# Read the complete Master PRD
Read: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\[domain]\[number]-[feature-name]\00-master-prd.md"
```

**Extract from PRD:**
- What is the feature about?
- What are the user stories?
- What components are specified in Section 8.3?
- What are the acceptance criteria?
- What are the functional requirements?

**Document understanding:**
```markdown
## Feature Understanding

**Feature Name**: [name]
**Domain**: [domain]
**Purpose**: [one sentence]

**User Stories**:
1. [User story 1]
2. [User story 2]

**Required Components** (from PRD):
- [Component 1]: [purpose]
- [Component 2]: [purpose]

**Key Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

### Step 1.2: Analyze E2E Tests

**Tool: `Glob` + `Read`**

```bash
# Find all E2E test files for this feature
Glob: "app/tests/e2e/**/*[feature-name]*.spec.ts"
Glob: "app/tests/e2e/**/*.spec.ts"
```

**Read ALL E2E test files and document:**

```markdown
## E2E Test Analysis

### Test File: [filename]

**Test Scenarios**:
1. **Scenario**: [test description]
   - **Setup**: [what's being set up]
   - **Actions**: [user interactions]
   - **Assertions**: [what's being verified]
   - **Components Involved**: [which components]

2. **Scenario**: [test description]
   - **Setup**: [what's being set up]
   - **Actions**: [user interactions]
   - **Assertions**: [what's being verified]
   - **Components Involved**: [which components]

**UI Elements Expected** (from test selectors):
- [data-testid="element-1"]: [what it is]
- [role="button"]: [what it does]
- [aria-label="label"]: [accessibility requirement]

**User Flows**:
1. [Flow 1]: [sequence of actions]
2. [Flow 2]: [sequence of actions]

**Current Status**: ALL TESTS FAILING ❌
```

### Step 1.3: Review Implemented Use Cases

**Tool: `Glob` + `Read`**

```bash
# Find all use cases for this feature
Glob: "app/src/features/[feature-name]/use-cases/*.ts"
```

**Read use case files (NOT test files) and document:**

```markdown
## Available Use Cases

### create[Entity].ts

**Function Signature**:
```typescript
export async function create[Entity](
  data: [Entity]Create,
  userId: string,
  organizationId: string
): Promise<[Entity]>
```

**Purpose**: [what it does]
**Parameters**: [what's required]
**Returns**: [what's returned]
**Integration**: [how UI will call this]

### get[Entity].ts

**Function Signature**:
```typescript
export async function get[Entity](
  id: string,
  userId: string
): Promise<[Entity] | null>
```

**Purpose**: [what it does]
**Integration**: [how UI will call this]

### list[Entities].ts

**Function Signature**:
```typescript
export async function list[Entities](
  query: [Entity]Query,
  userId: string,
  organizationId: string
): Promise<{
  data: [Entity][];
  pagination: { ... };
}>
```

**Purpose**: [what it does]
**Integration**: [how UI will call this]

### update[Entity].ts

**Function Signature**:
```typescript
export async function update[Entity](
  id: string,
  data: [Entity]Update,
  userId: string
): Promise<[Entity]>
```

**Purpose**: [what it does]
**Integration**: [how UI will call this]

### delete[Entity].ts

**Function Signature**:
```typescript
export async function delete[Entity](
  id: string,
  userId: string
): Promise<void>
```

**Purpose**: [what it does]
**Integration**: [how UI will call this]
```

### Step 1.4: Review Entity Schemas

**Tool: `Read`**

```bash
# Read entity schemas
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\src\features\[feature-name]\entities.ts"
```

**Extract validation rules for forms:**

```markdown
## Entity Validation Rules

### [Entity]CreateSchema

**Required Fields**:
- [field1]: [type, validation rules, min/max]
- [field2]: [type, validation rules]

**Optional Fields**:
- [field3]: [type, validation rules]

**Enum Fields**:
- [field4]: [allowed values]

**Form Implications**:
- [field1] input: [type of input needed, validation feedback]
- [field2] input: [type of input needed, validation feedback]

**Error Messages** (i18n keys):
- [field1] required: `errors.[namespace].field1.required`
- [field1] maxLength: `errors.[namespace].field1.maxLength`
```

### Step 1.5: Review Translation Files

**Tool: `Read`**

```bash
# Read existing translations
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\en\[namespace].json"
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\es\[namespace].json"
```

**Verify translations are complete:**

```markdown
## i18n Review

**Namespace**: `[namespace]`

**Available Keys**:
- form.field1.label
- form.field1.placeholder
- form.field1.error
- actions.create.success
- actions.create.error
- ui.title
- ui.empty

**Missing Keys** (need to add):
- [key1]: [purpose]
- [key2]: [purpose]

**Action Required**:
- [ ] Add missing keys to both en and es files
```

### Step 1.6: Identify Components to Build

**Based on E2E tests, use cases, and PRD, create component list:**

```markdown
## Component Build List

### 1. [Entity]Form.tsx

**Purpose**: Create/edit form for [entity]
**Props**:
```typescript
interface [Entity]FormProps {
  mode: 'create' | 'edit';
  initialData?: [Entity];
  onSuccess?: (entity: [Entity]) => void;
  onCancel?: () => void;
}
```

**Use Cases Called**:
- create[Entity] (if mode='create')
- update[Entity] (if mode='edit')

**E2E Tests**:
- [test scenario 1]
- [test scenario 2]

**shadcn/ui Components Needed**:
- Form (react-hook-form wrapper)
- Input
- Button
- Label
- Select (if enum fields)

**Accessibility Requirements**:
- Form labels for all inputs
- Error messages announced
- Keyboard navigation
- Focus management

---

### 2. [Entity]List.tsx

**Purpose**: Display paginated list of [entities]
**Props**:
```typescript
interface [Entity]ListProps {
  organizationId: string;
}
```

**Use Cases Called**:
- list[Entities]

**E2E Tests**:
- [test scenario]

**shadcn/ui Components Needed**:
- Table (or Card for grid view)
- Pagination
- Skeleton (loading state)

**Accessibility Requirements**:
- Semantic table markup
- Loading state announced
- Pagination keyboard accessible

---

### 3. [Entity]Details.tsx

**Purpose**: Display single entity details
**Props**:
```typescript
interface [Entity]DetailsProps {
  entityId: string;
}
```

**Use Cases Called**:
- get[Entity]

**E2E Tests**:
- [test scenario]

**shadcn/ui Components Needed**:
- Card
- Button (edit, delete actions)

---

### 4. Page Component: app/(main)/[feature]/page.tsx

**Purpose**: Main feature page (server component)
**Responsibilities**:
- Authentication check
- Initial data loading
- Layout structure
- Render client components
```

---

## Phase 2: Research & Best Practices

**OBJECTIVE**: Consult Context7 and existing codebase for latest UI/UX patterns BEFORE implementing.

### Step 2.1: Explore Existing Component Patterns

**Tool: `Glob` + `Read`**

```bash
# Find similar components in codebase
Glob: "app/src/features/**/components/*Form.tsx"
Glob: "app/src/features/**/components/*List.tsx"
Glob: "app/src/components/ui/*.tsx"
```

**Read 2-3 similar components and document:**

```markdown
## Existing Component Patterns

### Form Pattern

**Example**: [path to example form]

**Pattern Observed**:
- Uses React Hook Form: `useForm<[Entity]Create>()`
- Zod resolver: `zodResolver([Entity]CreateSchema)`
- TanStack Query mutation: `useMutation({ mutationFn: create[Entity] })`
- Loading state: `mutation.isPending`
- Error handling: `mutation.error`
- Success callback: `onSuccess`

**Key Code Pattern**:
```typescript
const form = useForm<[Entity]Create>({
  resolver: zodResolver([Entity]CreateSchema),
  defaultValues: initialData || {},
});

const mutation = useMutation({
  mutationFn: (data: [Entity]Create) =>
    create[Entity](data, userId, organizationId),
  onSuccess: (entity) => {
    toast.success(t('actions.create.success'));
    onSuccess?.(entity);
  },
  onError: (error) => {
    toast.error(t('actions.create.error'));
  },
});

const onSubmit = form.handleSubmit((data) => {
  mutation.mutate(data);
});
```

---

### List Pattern

**Example**: [path to example list]

**Pattern Observed**:
- TanStack Query: `useQuery({ queryKey: [...], queryFn: list[Entities] })`
- Loading state: `query.isLoading ? <Skeleton /> : <Table>`
- Empty state: `data.length === 0 ? <EmptyState /> : <Table>`
- Pagination: `useState` for page, `useQuery` refetch on change

**Key Code Pattern**:
```typescript
const [page, setPage] = useState(1);
const query = useQuery({
  queryKey: ['entities', organizationId, page],
  queryFn: () => list[Entities]({ page, limit: 20 }, userId, organizationId),
});

if (query.isLoading) return <Skeleton />;
if (query.error) return <ErrorState />;
if (query.data.data.length === 0) return <EmptyState />;

return (
  <>
    <Table data={query.data.data} />
    <Pagination
      page={page}
      totalPages={query.data.pagination.totalPages}
      onPageChange={setPage}
    />
  </>
);
```

---

### shadcn/ui Usage Pattern

**Components Used**:
- Form components: `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- Input: `<Input>`
- Button: `<Button variant="default|outline|ghost">`
- Toast: `toast.success()`, `toast.error()`

**Installation Check**:
- [ ] Verify which components are already installed
- [ ] List which need to be added
```

### Step 2.2: Consult Context7 for shadcn/ui Patterns

**Tool: `mcp__context7__resolve-library-id` + `mcp__context7__get-library-docs`**

**MANDATORY consultations (run in parallel):**

```typescript
// 1. shadcn/ui form components with React Hook Form
context7.resolve_library_id({ libraryName: "shadcn/ui" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/shadcn/ui",
  topic: "form components react-hook-form zod validation",
  tokens: 3000
})

// 2. TanStack Query for data fetching and mutations
context7.resolve_library_id({ libraryName: "tanstack query" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/tanstack/query",
  topic: "useQuery useMutation optimistic updates",
  tokens: 3000
})

// 3. React Hook Form with Zod
context7.resolve_library_id({ libraryName: "react-hook-form" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/react-hook-form/react-hook-form",
  topic: "zodResolver form validation error handling",
  tokens: 2500
})

// 4. Tailwind CSS responsive design
context7.resolve_library_id({ libraryName: "tailwind" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/tailwindlabs/tailwindcss",
  topic: "responsive design breakpoints utilities",
  tokens: 2000
})

// 5. Next.js App Router client/server components
context7.resolve_library_id({ libraryName: "next.js" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router client server components",
  tokens: 2500
})
```

**Document findings:**

```markdown
## Context7 Best Practices

### shadcn/ui Form Pattern (Latest)

**Key Insights**:
- [Pattern 1 from docs]
- [Pattern 2 from docs]
- [Best practice for accessibility]

**Example Code** (from Context7):
```typescript
[relevant code snippet]
```

---

### TanStack Query Pattern (Latest)

**Key Insights**:
- [Mutation pattern]
- [Query invalidation pattern]
- [Optimistic update pattern]

**Example Code**:
```typescript
[relevant code snippet]
```

---

### React Hook Form + Zod (Latest)

**Key Insights**:
- [Resolver pattern]
- [Error handling]
- [Custom validation]

---

### Tailwind CSS Responsive (Latest)

**Key Insights**:
- [Breakpoint usage]
- [Mobile-first approach]
- [Common patterns]

---

### Next.js App Router (Latest)

**Key Insights**:
- [Client component usage]
- [Server component benefits]
- [When to use each]
```

### Step 2.3: Consult Context7 for WCAG 2.1 AA Accessibility

**Tool: `mcp__context7__get-library-docs`**

```typescript
// WCAG 2.1 accessibility guidelines
context7.resolve_library_id({ libraryName: "wcag" })
// Then:
context7.get_library_docs({
  context7CompatibleLibraryID: "/w3c/wcag",
  topic: "WCAG 2.1 AA forms keyboard navigation aria",
  tokens: 3000
})

// React accessibility patterns
context7.get_library_docs({
  context7CompatibleLibraryID: "/facebook/react",
  topic: "accessibility aria roles focus management",
  tokens: 2000
})
```

**Document findings:**

```markdown
## WCAG 2.1 AA Requirements

### Form Accessibility

**MUST HAVE**:
- [ ] All inputs have associated labels (explicit or aria-label)
- [ ] Error messages have role="alert" or aria-live="polite"
- [ ] Required fields indicated (aria-required or visual indicator)
- [ ] Form validation messages visible and announced
- [ ] Focus management (focus on first error after submit)

**Color Contrast**:
- [ ] Text: 4.5:1 minimum
- [ ] Large text (18pt+): 3:1 minimum
- [ ] Interactive elements: 3:1 minimum

---

### Keyboard Navigation

**MUST HAVE**:
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Logical tab order
- [ ] Skip links for navigation (if applicable)
- [ ] Escape key closes modals/dialogs
- [ ] Arrow keys for custom controls

---

### Screen Reader Support

**MUST HAVE**:
- [ ] Semantic HTML (headings, lists, tables)
- [ ] ARIA labels for icon buttons
- [ ] Loading states announced (aria-live)
- [ ] Dynamic content changes announced
- [ ] Table headers properly associated

---

### Focus Management

**MUST HAVE**:
- [ ] Visible focus indicators (not :focus { outline: none })
- [ ] Focus trapped in modals
- [ ] Focus returned after modal close
- [ ] Focus on first error in forms
```

### Step 2.4: Check Installed shadcn/ui Components

**Tool: `Read` + `Bash`**

```bash
# Check which shadcn components are already installed
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\src\components\ui"

# Check components.json for installed components
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\components.json"
```

**Document which components need to be added:**

```markdown
## shadcn/ui Component Inventory

### Already Installed ✅
- Button
- Input
- Label
- [other installed components]

### Need to Install 📦
- [ ] Form (react-hook-form wrapper)
- [ ] Select (for enum fields)
- [ ] Textarea (for long text fields)
- [ ] Dialog (for modals)
- [ ] Table (for lists)
- [ ] Skeleton (for loading states)
- [ ] [other needed components]

### Installation Commands
```bash
cd app
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add skeleton
```
```

---

## Phase 3: Component Design

**OBJECTIVE**: Plan UI structure and behavior before implementation.

### Step 3.1: Design Component Architecture

**For each component, create detailed design:**

```markdown
## Component Design: [Entity]Form.tsx

### Visual Structure

```
┌─────────────────────────────────────────┐
│  [Create/Edit Entity]                   │  ← h2 heading
├─────────────────────────────────────────┤
│  Field 1 Label                          │
│  ┌───────────────────────────────────┐ │
│  │ Input field                       │ │
│  └───────────────────────────────────┘ │
│  [Error message if validation fails]    │
│                                         │
│  Field 2 Label                          │
│  ┌───────────────────────────────────┐ │
│  │ Select dropdown                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │  Cancel  │  │  Submit  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Props Interface

```typescript
interface [Entity]FormProps {
  mode: 'create' | 'edit';
  initialData?: [Entity];
  onSuccess?: (entity: [Entity]) => void;
  onCancel?: () => void;
}
```

### State Management

**React Hook Form**:
- Form state: `useForm<[Entity]Create>()`
- Validation: `zodResolver([Entity]CreateSchema)`
- Default values: `initialData` (if mode='edit')

**TanStack Query Mutation**:
- Mutation function: `create[Entity]` or `update[Entity]`
- Loading state: `mutation.isPending`
- Error state: `mutation.error`
- Success callback: `onSuccess`

### Behavior Flow

1. **Component Mount**:
   - Initialize form with default values
   - Set up mutation
   - Focus first input

2. **User Fills Form**:
   - Real-time validation on blur
   - Error messages shown below fields
   - Submit button disabled if invalid

3. **User Submits**:
   - Validate all fields
   - If invalid: focus first error, show error messages
   - If valid: call mutation
   - Show loading state (button disabled, spinner)

4. **Mutation Success**:
   - Show success toast
   - Call `onSuccess` callback
   - Reset form (if create mode)

5. **Mutation Error**:
   - Show error toast
   - Display error message
   - Re-enable form

### Accessibility Checklist

- [ ] All inputs have explicit labels (`<Label htmlFor="field1">`)
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages have `role="alert"`
- [ ] Form has proper heading hierarchy
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus management on error
- [ ] Color contrast meets 4.5:1

### i18n Integration

**Translation Keys Used**:
- `[namespace].form.title.create` / `[namespace].form.title.edit`
- `[namespace].form.field1.label`
- `[namespace].form.field1.placeholder`
- `[namespace].form.field1.error`
- `[namespace].actions.create.success`
- `[namespace].actions.create.error`
- `[namespace].actions.cancel`
- `[namespace].actions.submit`

### Responsive Design

**Breakpoints**:
- Mobile (< 640px): Single column, full-width inputs
- Tablet (640px - 1024px): Single column, max-width form
- Desktop (> 1024px): Centered form, max-width 600px

**Tailwind Classes**:
```
Form container: "w-full max-w-2xl mx-auto p-4 sm:p-6"
Input fields: "w-full"
Button group: "flex flex-col sm:flex-row gap-2 sm:gap-4"
```

---

## Component Design: [Entity]List.tsx

### Visual Structure

```
┌─────────────────────────────────────────┐
│  [Entities]                     [Create]│  ← Title + Action
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │ Field1    │ Field2    │ Actions    ││  ← Table Header
│  ├─────────────────────────────────────┤│
│  │ Value1    │ Value2    │ [Edit] [Del]││  ← Row 1
│  │ Value1    │ Value2    │ [Edit] [Del]││  ← Row 2
│  └─────────────────────────────────────┘│
│                                         │
│  [< Prev]  Page 1 of 5  [Next >]       │  ← Pagination
└─────────────────────────────────────────┘

Loading State:
┌─────────────────────────────────────────┐
│  [Entities]                     [Create]│
├─────────────────────────────────────────┤
│  ████████████████████ (skeleton)       │
│  ████████████████████ (skeleton)       │
│  ████████████████████ (skeleton)       │
└─────────────────────────────────────────┘

Empty State:
┌─────────────────────────────────────────┐
│  [Entities]                     [Create]│
├─────────────────────────────────────────┤
│                                         │
│         📋                              │
│    No entities found                    │
│    Create your first entity             │
│                                         │
└─────────────────────────────────────────┘
```

### Props Interface

```typescript
interface [Entity]ListProps {
  organizationId: string;
}
```

### State Management

**React State**:
- Page: `const [page, setPage] = useState(1)`
- Sort: `const [sortBy, setSortBy] = useState<'createdAt'>('createdAt')`
- Order: `const [order, setOrder] = useState<'asc' | 'desc'>('desc')`

**TanStack Query**:
```typescript
const query = useQuery({
  queryKey: ['entities', organizationId, page, sortBy, order],
  queryFn: () => list[Entities](
    { page, limit: 20, sortBy, order },
    userId,
    organizationId
  ),
});
```

### Behavior Flow

1. **Component Mount**:
   - Fetch page 1
   - Show loading skeleton

2. **Data Loaded**:
   - If empty: show empty state
   - If data: show table with pagination

3. **User Changes Page**:
   - Update page state
   - Query refetches automatically (TanStack Query)
   - Show loading during fetch

4. **User Clicks Edit**:
   - Open [Entity]Form in modal/dialog
   - Pass entity data
   - On success: invalidate query to refetch

5. **User Clicks Delete**:
   - Show confirmation dialog
   - On confirm: call delete mutation
   - On success: invalidate query to refetch

### Accessibility Checklist

- [ ] Table has proper semantic markup (`<table>`, `<thead>`, `<tbody>`)
- [ ] Table headers have `scope="col"`
- [ ] Action buttons have aria-labels ("Edit [entity name]", "Delete [entity name]")
- [ ] Loading state announced with aria-live
- [ ] Pagination keyboard navigable
- [ ] Empty state has descriptive text

### i18n Integration

**Translation Keys Used**:
- `[namespace].list.title`
- `[namespace].list.empty.title`
- `[namespace].list.empty.description`
- `[namespace].list.table.column.field1`
- `[namespace].list.table.column.field2`
- `[namespace].list.actions.edit`
- `[namespace].list.actions.delete`
- `[namespace].list.pagination.prev`
- `[namespace].list.pagination.next`

### Responsive Design

**Mobile (< 640px)**:
- Table converts to card list
- Each row becomes a card
- Actions at bottom of card

**Tablet/Desktop (>= 640px)**:
- Full table layout
- Sticky header on scroll

---

## Component Design: Page (app/(main)/[feature]/page.tsx)

### Server Component Structure

```typescript
// app/src/app/(main)/[feature]/page.tsx
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { [Entity]List } from '@/features/[feature]/components/[Entity]List';

export default async function [Feature]Page() {
  // Server-side auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get organization (from session or query)
  const organizationId = user.user_metadata.organization_id;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('[namespace].page.title')}</h1>
      <[Entity]List organizationId={organizationId} />
    </div>
  );
}
```

### Responsibilities

- Authentication check (server-side)
- Redirect if not authenticated
- Get organization context
- Render layout structure
- Pass data to client components
```

---

## Phase 4: UI Implementation (Make E2E Tests Pass)

**OBJECTIVE**: Implement components one by one, making E2E tests pass WITHOUT modifying tests.

### Step 4.1: Install Required shadcn/ui Components

**Tool: `Bash`**

```bash
cd c:\Users\Usuario\Desktop\programación\poli2\app

# Install each required component
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add skeleton
```

**Verify installation:**
- Check `app/src/components/ui/` for new component files
- Verify no errors during installation

### Step 4.2: Add Missing i18n Keys

**Tool: `Read` + `Edit`**

```bash
# Read current translations
Read: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\en\[namespace].json"

# Add missing keys (if any identified in Phase 1.5)
Edit: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\en\[namespace].json"
Edit: "c:\Users\Usuario\Desktop\programación\poli2\app\src\locales\es\[namespace].json"
```

**Add keys following structure:**

```json
{
  "form": {
    "title": {
      "create": "Create Entity",
      "edit": "Edit Entity"
    },
    "field1": {
      "label": "Field 1",
      "placeholder": "Enter field 1",
      "error": "Field 1 is required"
    }
  },
  "list": {
    "title": "Entities",
    "empty": {
      "title": "No entities found",
      "description": "Create your first entity to get started"
    },
    "table": {
      "column": {
        "field1": "Field 1",
        "field2": "Field 2",
        "actions": "Actions"
      }
    },
    "actions": {
      "create": "Create",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel"
    }
  },
  "actions": {
    "create": {
      "success": "Entity created successfully",
      "error": "Failed to create entity"
    },
    "update": {
      "success": "Entity updated successfully",
      "error": "Failed to update entity"
    },
    "delete": {
      "success": "Entity deleted successfully",
      "error": "Failed to delete entity",
      "confirm": "Are you sure you want to delete this entity?"
    }
  }
}
```

### Step 4.3: Implement Components (TDD: Pick Failing Test → Implement → Pass → Repeat)

**Strategy: ONE E2E test at a time**

#### Step 4.3.1: Implement [Entity]Form.tsx

**Tool: `Write`**

```bash
Write: "c:\Users\Usuario\Desktop\programación\poli2\app\src\features\[feature-name]\components\[Entity]Form.tsx"
```

**Implementation template:**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { [Entity], [Entity]Create, [Entity]Update } from '../entities';
import { [Entity]CreateSchema, [Entity]UpdateSchema } from '../entities';
import { create[Entity], update[Entity] } from '../use-cases';

interface [Entity]FormProps {
  mode: 'create' | 'edit';
  initialData?: [Entity];
  onSuccess?: (entity: [Entity]) => void;
  onCancel?: () => void;
  userId: string;
  organizationId: string;
}

export function [Entity]Form({
  mode,
  initialData,
  onSuccess,
  onCancel,
  userId,
  organizationId,
}: [Entity]FormProps) {
  const t = useTranslations('[namespace]');
  const queryClient = useQueryClient();

  // React Hook Form setup
  const form = useForm<[Entity]Create | [Entity]Update>({
    resolver: zodResolver(mode === 'create' ? [Entity]CreateSchema : [Entity]UpdateSchema),
    defaultValues: initialData || {
      field1: '',
      field2: '',
      field3: 'default-value',
    },
  });

  // TanStack Query mutation
  const mutation = useMutation({
    mutationFn: (data: [Entity]Create | [Entity]Update) => {
      if (mode === 'create') {
        return create[Entity](data as [Entity]Create, userId, organizationId);
      } else {
        return update[Entity](
          initialData!.id,
          data as [Entity]Update,
          userId
        );
      }
    },
    onSuccess: (entity) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['entities', organizationId] });

      // Show success toast
      toast.success(t(`actions.${mode}.success`));

      // Call success callback
      onSuccess?.(entity);

      // Reset form if creating
      if (mode === 'create') {
        form.reset();
      }
    },
    onError: (error) => {
      // Show error toast
      toast.error(t(`actions.${mode}.error`));
      console.error(`Failed to ${mode} entity:`, error);
    },
  });

  // Form submit handler
  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Title */}
        <h2 className="text-2xl font-bold">
          {t(`form.title.${mode}`)}
        </h2>

        {/* Field 1 */}
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="field1">
                {t('form.field1.label')}
              </FormLabel>
              <FormControl>
                <Input
                  id="field1"
                  placeholder={t('form.field1.placeholder')}
                  {...field}
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.field1}
                  aria-describedby={
                    form.formState.errors.field1 ? 'field1-error' : undefined
                  }
                />
              </FormControl>
              <FormMessage id="field1-error" role="alert" />
            </FormItem>
          )}
        />

        {/* Field 2 (Select/Enum example) */}
        <FormField
          control={form.control}
          name="field2"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="field2">
                {t('form.field2.label')}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="field2" aria-label={t('form.field2.label')}>
                    <SelectValue placeholder={t('form.field2.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="value1">
                    {t('form.field2.options.value1')}
                  </SelectItem>
                  <SelectItem value="value2">
                    {t('form.field2.options.value2')}
                  </SelectItem>
                  <SelectItem value="value3">
                    {t('form.field2.options.value3')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={mutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('list.actions.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
            aria-busy={mutation.isPending}
          >
            {mutation.isPending
              ? t('form.submitting')
              : t(`form.submit.${mode}`)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Accessibility verification checklist:**
- [ ] All inputs have explicit labels with `htmlFor`
- [ ] Required fields have `aria-required="true"`
- [ ] Error messages have `role="alert"`
- [ ] Submit button has `aria-busy` during mutation
- [ ] Form fields have proper `aria-describedby` for errors
- [ ] Keyboard navigation works (test manually)

#### Step 4.3.2: Implement [Entity]List.tsx

**Tool: `Write`**

```bash
Write: "c:\Users\Usuario\Desktop\programación\poli2\app\src\features\[feature-name]\components\[Entity]List.tsx"
```

**Implementation template:**

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { [Entity], [Entity]Query } from '../entities';
import { list[Entities], delete[Entity] } from '../use-cases';
import { [Entity]Form } from './[Entity]Form';

interface [Entity]ListProps {
  organizationId: string;
  userId: string;
}

export function [Entity]List({ organizationId, userId }: [Entity]ListProps) {
  const t = useTranslations('[namespace]');
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch entities
  const query = useQuery({
    queryKey: ['entities', organizationId, page],
    queryFn: () =>
      list[Entities](
        { page, limit, sortBy: 'createdAt', order: 'desc' },
        userId,
        organizationId
      ),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => delete[Entity](id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', organizationId] });
      toast.success(t('actions.delete.success'));
    },
    onError: (error) => {
      toast.error(t('actions.delete.error'));
      console.error('Failed to delete entity:', error);
    },
  });

  // Handle delete with confirmation
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('actions.delete.confirm', { name }))) {
      deleteMutation.mutate(id);
    }
  };

  // Loading state
  if (query.isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Error state
  if (query.error) {
    return (
      <div className="text-center py-12" role="alert">
        <p className="text-destructive">{t('list.error')}</p>
        <Button onClick={() => query.refetch()} className="mt-4">
          {t('list.retry')}
        </Button>
      </div>
    );
  }

  // Empty state
  if (!query.data || query.data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4" aria-hidden="true">📋</div>
        <h3 className="text-xl font-semibold mb-2">
          {t('list.empty.title')}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t('list.empty.description')}
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>{t('list.actions.create')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('form.title.create')}</DialogTitle>
            </DialogHeader>
            <[Entity]Form
              mode="create"
              userId={userId}
              organizationId={organizationId}
              onSuccess={() => {
                // Close dialog (you may need dialog state management)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Data view
  const { data: entities, pagination } = query.data;

  return (
    <div className="space-y-4">
      {/* Header with Create button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('list.title')}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>{t('list.actions.create')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('form.title.create')}</DialogTitle>
            </DialogHeader>
            <[Entity]Form
              mode="create"
              userId={userId}
              organizationId={organizationId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t('list.table.column.field1')}</TableHead>
              <TableHead scope="col">{t('list.table.column.field2')}</TableHead>
              <TableHead scope="col" className="text-right">
                {t('list.table.column.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>{entity.field1}</TableCell>
                <TableCell>{entity.field2}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={t('list.actions.edit') + ' ' + entity.field1}
                      >
                        {t('list.actions.edit')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('form.title.edit')}</DialogTitle>
                      </DialogHeader>
                      <[Entity]Form
                        mode="edit"
                        initialData={entity}
                        userId={userId}
                        organizationId={organizationId}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(entity.id, entity.field1)}
                    disabled={deleteMutation.isPending}
                    aria-label={t('list.actions.delete') + ' ' + entity.field1}
                  >
                    {t('list.actions.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label={t('list.pagination.prev')}
          >
            {t('list.pagination.prev')}
          </Button>
          <span aria-live="polite" aria-atomic="true">
            {t('list.pagination.current', {
              page,
              total: pagination.totalPages,
            })}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            aria-label={t('list.pagination.next')}
          >
            {t('list.pagination.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Accessibility verification checklist:**
- [ ] Table has proper semantic markup
- [ ] Table headers have `scope="col"`
- [ ] Action buttons have descriptive `aria-label`
- [ ] Loading state has `aria-busy` and `aria-live`
- [ ] Pagination buttons have `aria-label`
- [ ] Current page announced with `aria-live`

#### Step 4.3.3: Implement Page Component

**Tool: `Write`**

```bash
Write: "c:\Users\Usuario\Desktop\programación\poli2\app\src\app\(main)\[feature]\page.tsx"
```

**Implementation template:**

```typescript
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { [Entity]List } from '@/features/[feature-name]/components/[Entity]List';

export default async function [Feature]Page() {
  // Server-side authentication check
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get organization from user metadata
  const organizationId = user.user_metadata.organization_id;

  if (!organizationId) {
    redirect('/onboarding'); // Or error page
  }

  // Get translations on server
  const t = await getTranslations('[namespace]');

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Page heading */}
      <h1 className="text-3xl font-bold mb-6">
        {t('page.title')}
      </h1>

      {/* Client component */}
      <[Entity]List organizationId={organizationId} userId={user.id} />
    </div>
  );
}
```

### Step 4.4: Run E2E Tests to Verify

**Tool: `Bash`**

```bash
cd c:\Users\Usuario\Desktop\programación\poli2\app

# Run E2E tests for this feature
npm run test:e2e -- --grep "[feature-name]"
```

**Expected outcome:**
- ✅ Tests that were failing now PASS
- ❌ If tests still fail: debug and iterate

**If tests fail:**
1. Read test output carefully
2. Identify which assertion failed
3. Fix component to match expected behavior
4. Re-run tests
5. Repeat until all pass

**CRITICAL: DO NOT modify test files to make them pass**

### Step 4.5: Verify No Hardcoded Strings

**Tool: `Grep`**

```bash
# Search for potential hardcoded strings (capital letters in quotes)
Grep:
  pattern: '"[A-Z][a-zA-Z\s]+"'
  path: "app/src/features/[feature-name]/components"
  output_mode: "content"
  -n: true
```

**For each match found:**
- Verify it's NOT a hardcoded user-facing string
- If it is: replace with `t('[namespace].key')`
- Add missing key to translation files

---

## Phase 5: Accessibility Validation

**OBJECTIVE**: Ensure WCAG 2.1 AA compliance (MANDATORY).

### Step 5.1: Automated Accessibility Testing

**Tool: `Bash`**

```bash
cd c:\Users\Usuario\Desktop\programación\poli2\app

# Run accessibility tests with axe
npm run test:a11y -- [feature-name]

# Or add axe checks to E2E tests
# (If not already present, this is a good practice)
```

**Expected violations: ZERO**

**If violations found:**
- Read violation details
- Fix issues in components
- Re-run tests
- Repeat until zero violations

### Step 5.2: Manual Accessibility Checklist

**Test each component manually:**

```markdown
## Accessibility Manual Testing

### Keyboard Navigation

**[Entity]Form**:
- [ ] Tab moves through all form fields in logical order
- [ ] Enter submits form
- [ ] Escape closes dialog (if in modal)
- [ ] Focus visible on all interactive elements
- [ ] Focus trapped in modal (if applicable)

**[Entity]List**:
- [ ] Tab moves through Create button, table rows, action buttons
- [ ] Enter activates buttons
- [ ] Arrow keys navigate table (if custom controls)
- [ ] Pagination keyboard accessible

---

### Screen Reader Testing

**Test with screen reader** (NVDA on Windows, VoiceOver on Mac):

**[Entity]Form**:
- [ ] Form title announced
- [ ] All labels announced correctly
- [ ] Required fields announced as required
- [ ] Error messages announced when validation fails
- [ ] Submit button announces loading state

**[Entity]List**:
- [ ] Table announced as table with X rows
- [ ] Column headers announced correctly
- [ ] Loading state announced
- [ ] Empty state announced
- [ ] Pagination state announced

---

### Color Contrast

**Use browser DevTools or contrast checker:**

**Text Elements**:
- [ ] Body text: >= 4.5:1 contrast ratio
- [ ] Headings: >= 4.5:1 contrast ratio
- [ ] Button text: >= 4.5:1 contrast ratio
- [ ] Link text: >= 4.5:1 contrast ratio

**Interactive Elements**:
- [ ] Button background: >= 3:1 contrast ratio
- [ ] Input borders: >= 3:1 contrast ratio
- [ ] Focus indicators: >= 3:1 contrast ratio

---

### Focus Indicators

**Visual Test**:
- [ ] All interactive elements have visible focus indicator
- [ ] Focus indicator meets 3:1 contrast ratio
- [ ] Focus indicator is not `outline: none` without alternative

---

### Semantic HTML

**Code Review**:
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Forms use `<form>` element
- [ ] Buttons use `<button>` not `<div onclick>`
- [ ] Tables use `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
- [ ] Lists use `<ul>`/`<ol>` and `<li>`

---

### ARIA Usage

**Code Review**:
- [ ] ARIA roles used correctly (not redundant with semantic HTML)
- [ ] `aria-label` for icon-only buttons
- [ ] `aria-live` for dynamic content (loading, errors)
- [ ] `aria-required` for required form fields
- [ ] `aria-invalid` for fields with errors
- [ ] `aria-describedby` for error messages
```

### Step 5.3: Fix Accessibility Issues

**For each issue found:**

1. **Document the issue**:
   ```markdown
   ### Issue: [Description]
   - **Component**: [Entity]Form
   - **Element**: Submit button
   - **Violation**: Missing aria-busy during loading
   - **Fix**: Add `aria-busy={mutation.isPending}` to button
   ```

2. **Fix the component**:
   ```bash
   Edit: "c:\Users\Usuario\Desktop\programación\poli2\app\src\features\[feature-name]\components\[Component].tsx"
   ```

3. **Re-test**:
   - Manual keyboard navigation
   - Screen reader testing
   - Automated tests

4. **Verify fix**:
   - [ ] Issue resolved
   - [ ] No new issues introduced

---

## Phase 6: Performance Optimization

**OBJECTIVE**: Optimize for Core Web Vitals (LCP, FID, CLS).

### Step 6.1: Performance Audit

**Tool: Browser DevTools (if available via Chrome MCP)**

```bash
# Run Lighthouse audit
# (Manual step - open browser DevTools → Lighthouse tab → Run audit)
```

**Target Metrics**:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**If metrics fail:**
- Identify bottlenecks
- Apply optimizations below

### Step 6.2: Code Splitting and Lazy Loading

**Optimize imports:**

```typescript
// Before: Eager import
import { HeavyComponent } from './HeavyComponent';

// After: Lazy import
import { lazy, Suspense } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Usage:
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

**Apply to:**
- Dialog content (modal components)
- Large tables/lists
- Charts or visualizations
- Rich text editors

### Step 6.3: Optimize TanStack Query

**Add proper caching and stale time:**

```typescript
const query = useQuery({
  queryKey: ['entities', organizationId, page],
  queryFn: () => list[Entities](...),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
});
```

**Use optimistic updates for mutations:**

```typescript
const mutation = useMutation({
  mutationFn: create[Entity],
  onMutate: async (newEntity) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['entities'] });

    // Snapshot previous value
    const previousEntities = queryClient.getQueryData(['entities']);

    // Optimistically update
    queryClient.setQueryData(['entities'], (old) => ({
      ...old,
      data: [...old.data, { ...newEntity, id: 'temp-id' }],
    }));

    return { previousEntities };
  },
  onError: (err, newEntity, context) => {
    // Rollback on error
    queryClient.setQueryData(['entities'], context.previousEntities);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['entities'] });
  },
});
```

### Step 6.4: Optimize Re-renders

**Use React.memo for expensive components:**

```typescript
import { memo } from 'react';

export const [Entity]ListItem = memo(function [Entity]ListItem({ entity }) {
  // Expensive rendering logic
  return (
    <TableRow>
      {/* ... */}
    </TableRow>
  );
});
```

**Use useCallback for event handlers:**

```typescript
const handleDelete = useCallback((id: string) => {
  deleteMutation.mutate(id);
}, [deleteMutation]);
```

**Use useMemo for expensive calculations:**

```typescript
const sortedEntities = useMemo(() => {
  return entities.sort((a, b) => a.field1.localeCompare(b.field1));
}, [entities]);
```

### Step 6.5: Optimize Images (if applicable)

**Use Next.js Image component:**

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### Step 6.6: Minimize Bundle Size

**Check bundle size:**

```bash
cd app
npm run build

# Check .next/analyze for bundle analysis
```

**Optimize imports:**

```typescript
// Before: Full library import
import { Button, Input, Select } from '@/components/ui';

// After: Specific imports (if tree-shaking not working)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

---

## Phase 7: Validation & Quality Check

**OBJECTIVE**: Final verification before marking complete.

### Step 7.1: E2E Test Verification

**Tool: `Bash`**

```bash
cd app

# Run ALL E2E tests for this feature
npm run test:e2e -- --grep "[feature-name]"
```

**Expected outcome:**
- ✅ **ALL E2E tests PASSING** (100%)
- ❌ If any test fails: STOP and fix

**Verification checklist:**
```markdown
## E2E Test Results

- [ ] All test scenarios pass
- [ ] No flaky tests (run 3 times to verify)
- [ ] All assertions passing
- [ ] No timeout errors
- [ ] No console errors during tests
```

### Step 7.2: Architecture Validation

**Tool: `SlashCommand`**

```bash
/validate-architecture
```

**Expected outcome:**
- ✅ No violations found
- ❌ If violations found: fix immediately

**Manual architecture checklist:**

```markdown
## Architecture Compliance

### Clean Architecture Layers
- [ ] Components only call use cases (not services directly)
- [ ] No business logic in components
- [ ] Components only use TanStack Query (no useEffect for data fetching)
- [ ] No direct Supabase client usage in components

### Technology Stack
- [ ] Only shadcn/ui components used
- [ ] Only Tailwind CSS (no traditional CSS files)
- [ ] TanStack Query for all data fetching
- [ ] React Hook Form for all forms
- [ ] Zod for all validation
- [ ] No prohibited libraries (Jest, Redux, MobX, etc.)

### File Organization
- [ ] Components in `features/[feature]/components/`
- [ ] No logic in page components (server components are minimal)
- [ ] Proper imports using `@/*` aliases
```

### Step 7.3: i18n Validation

**Checklist:**

```markdown
## i18n Compliance

### No Hardcoded Strings
- [ ] All user-facing text uses `useTranslations()`
- [ ] All button labels translated
- [ ] All form labels translated
- [ ] All error messages translated
- [ ] All toast messages translated
- [ ] All empty states translated

### Translation Files Complete
- [ ] English (`en/[namespace].json`) complete
- [ ] Spanish (`es/[namespace].json`) complete
- [ ] Both files have identical key structure
- [ ] No missing keys
- [ ] No unused keys

### Configuration
- [ ] Namespace loaded in `i18n/request.ts`
- [ ] No `MISSING_MESSAGE` errors in console
- [ ] Locale switching works without errors
```

### Step 7.4: Accessibility Final Verification

**Run complete accessibility audit:**

```markdown
## WCAG 2.1 AA Final Audit

### Automated Testing
- [ ] Zero axe violations
- [ ] Zero Lighthouse accessibility warnings
- [ ] Zero browser console accessibility warnings

### Manual Testing
- [ ] Keyboard navigation fully functional
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets requirements (4.5:1 for text, 3:1 for UI)
- [ ] Focus indicators visible and meet 3:1 contrast
- [ ] No keyboard traps
- [ ] Semantic HTML used throughout
- [ ] ARIA attributes used correctly

### Device Testing
- [ ] Desktop (keyboard + mouse)
- [ ] Mobile (touch)
- [ ] Tablet (touch)
```

### Step 7.5: Performance Final Verification

**Run Lighthouse audit:**

```markdown
## Core Web Vitals

### Metrics (Target: All Green)
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Lighthouse Score
- [ ] Performance: >= 90
- [ ] Accessibility: 100
- [ ] Best Practices: >= 90
- [ ] SEO: >= 90

### Optimizations Applied
- [ ] Images optimized (if applicable)
- [ ] Code splitting for heavy components
- [ ] Lazy loading for modals/dialogs
- [ ] Proper TanStack Query caching
- [ ] Minimal re-renders
```

### Step 7.6: Comprehensive Checklist

**Final quality gate:**

```markdown
## Final Quality Checklist

### Functionality
- [ ] All E2E tests passing (100%)
- [ ] All user stories satisfied
- [ ] All acceptance criteria met
- [ ] No console errors
- [ ] No console warnings (except known third-party)

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No unused imports
- [ ] No commented-out code
- [ ] Proper TypeScript types (no `any`)

### Architecture
- [ ] Clean Architecture respected
- [ ] Only approved technologies used
- [ ] No business logic in components
- [ ] Proper layer separation

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Zero accessibility violations
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Performance
- [ ] Core Web Vitals green
- [ ] Lighthouse score >= 90
- [ ] Optimizations applied
- [ ] No performance regressions

### i18n
- [ ] No hardcoded strings
- [ ] All translations complete (en + es)
- [ ] Locale switching works

### Responsiveness
- [ ] Mobile (< 640px) works perfectly
- [ ] Tablet (640px - 1024px) works perfectly
- [ ] Desktop (> 1024px) works perfectly
```

---

## Phase 8: Handoff Completion

**OBJECTIVE**: Mark feature as complete and update status.

### Step 8.1: Update PRD Status

**Tool: `SlashCommand`**

```bash
/agent-handoff [domain]/[number]-[feature-name] ui-ux-agent completed
```

This will automatically update `_status.md`.

### Step 8.2: Document Component API

**Tool: `Write`**

```bash
Write: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\[domain]\[number]-[feature-name]\04-ui-spec.md"
```

**Copy template and fill:**

```bash
Read: "c:\Users\Usuario\Desktop\programación\poli2\PRDs\_templates\04-ui-template.md"
```

**Complete all sections:**
- Component inventory
- Props interfaces
- Accessibility features
- Performance optimizations
- E2E test coverage
- Known limitations
- Future improvements

### Step 8.3: Create Final Report

**Provide comprehensive completion report:**

```markdown
## ✅ UI/UX Phase Complete

**Feature**: [Feature Name]
**Feature ID**: [domain]-[number]-[feature-name]

---

### Deliverables

#### 1. Components Implemented

**[Entity]Form.tsx**:
- ✅ Create and edit modes
- ✅ React Hook Form + Zod validation
- ✅ TanStack Query mutations
- ✅ Loading and error states
- ✅ WCAG 2.1 AA compliant
- ✅ Fully responsive

**[Entity]List.tsx**:
- ✅ Paginated data fetching
- ✅ Loading skeletons
- ✅ Empty state
- ✅ Edit/delete actions
- ✅ WCAG 2.1 AA compliant
- ✅ Fully responsive

**Page Component**:
- ✅ Server-side authentication
- ✅ Layout structure
- ✅ Integration with client components

---

### Quality Metrics

#### E2E Tests
- **Total Tests**: [X]
- **Passing**: [X] (100%)
- **Failing**: 0 ✅
- **Coverage**: Complete user flows

#### Accessibility
- **axe Violations**: 0 ✅
- **WCAG 2.1 AA**: Compliant ✅
- **Keyboard Navigation**: Fully functional ✅
- **Screen Reader**: Compatible ✅
- **Color Contrast**: Meets requirements ✅

#### Performance
- **LCP**: [X]s (< 2.5s) ✅
- **FID**: [X]ms (< 100ms) ✅
- **CLS**: [X] (< 0.1) ✅
- **Lighthouse Performance**: [X]/100
- **Lighthouse Accessibility**: 100/100 ✅

#### i18n
- **Hardcoded Strings**: 0 ✅
- **Translation Coverage**: 100% (en + es) ✅
- **Locale Switching**: Works perfectly ✅

#### Responsiveness
- **Mobile (< 640px)**: ✅
- **Tablet (640px - 1024px)**: ✅
- **Desktop (> 1024px)**: ✅

---

### Architecture Compliance

- ✅ No business logic in components
- ✅ Only use cases called (not services)
- ✅ TanStack Query for all data fetching
- ✅ React Hook Form for all forms
- ✅ shadcn/ui components only
- ✅ Tailwind CSS only
- ✅ Clean Architecture respected

---

### Files Created/Modified

**Created**:
- `app/src/features/[feature-name]/components/[Entity]Form.tsx`
- `app/src/features/[feature-name]/components/[Entity]List.tsx`
- `app/src/app/(main)/[feature]/page.tsx`
- `app/src/locales/en/[namespace].json` (updated)
- `app/src/locales/es/[namespace].json` (updated)
- `PRDs/[domain]/[number]-[feature-name]/04-ui-spec.md`

**Modified**:
- None (only created new files)

---

### Known Limitations

[If any limitations exist, document them here]

- None ✅

---

### Future Improvements

[Optional enhancements for future iterations]

1. [Potential improvement 1]
2. [Potential improvement 2]

---

### Feature Complete

**Status**: ✅ **COMPLETE**

All acceptance criteria met. Feature ready for production.

**Next Steps**:
- Human review and QA
- Deployment to staging
- User acceptance testing
```

---

## Deliverables Checklist

Before considering this skill complete, verify ALL deliverables:

```markdown
## Final Deliverables Checklist

### Components
- [ ] [Entity]Form.tsx implemented and tested
- [ ] [Entity]List.tsx implemented and tested
- [ ] Page component implemented (server component)
- [ ] All components use shadcn/ui
- [ ] All components use Tailwind CSS only
- [ ] All components use useTranslations() for text

### Testing
- [ ] ALL E2E tests passing (100%)
- [ ] No test files modified
- [ ] E2E tests cover all user flows
- [ ] No console errors during tests

### Accessibility
- [ ] WCAG 2.1 AA compliant (verified)
- [ ] Zero axe violations
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets requirements
- [ ] Focus indicators visible

### Performance
- [ ] Core Web Vitals green
- [ ] Lighthouse Performance >= 90
- [ ] Lighthouse Accessibility = 100
- [ ] Code splitting applied where needed
- [ ] Optimizations documented

### i18n
- [ ] No hardcoded strings
- [ ] English translations complete
- [ ] Spanish translations complete
- [ ] Namespace loaded in i18n/request.ts
- [ ] Locale switching works

### Responsiveness
- [ ] Mobile layout works perfectly
- [ ] Tablet layout works perfectly
- [ ] Desktop layout works perfectly
- [ ] No horizontal scroll on small screens

### Architecture
- [ ] No business logic in components
- [ ] Only use cases called (not services)
- [ ] No Supabase client in components
- [ ] Clean Architecture respected
- [ ] Technology stack compliant

### Documentation
- [ ] 04-ui-spec.md created and complete
- [ ] Component API documented
- [ ] Props interfaces documented
- [ ] Accessibility features documented
- [ ] Performance optimizations documented

### Status
- [ ] _status.md updated via /agent-handoff
- [ ] UI/UX Agent marked completed
- [ ] Feature marked as complete
```

---

## Common Pitfalls to Avoid

### ❌ DON'T: Implement Business Logic in Components

**Problem**: Violates Clean Architecture, creates tight coupling, makes testing hard.

**Wrong**:
```typescript
// ❌ Business logic in component
const handleSubmit = async (data) => {
  if (data.field1.length < 5) {
    toast.error('Too short');
    return;
  }

  const result = await supabase.from('entities').insert(data);
  // ...
};
```

**Correct**:
```typescript
// ✅ Call use case
const mutation = useMutation({
  mutationFn: (data) => create[Entity](data, userId, organizationId),
  // Use case handles validation and business logic
});
```

---

### ❌ DON'T: Call Services Directly

**Problem**: Bypasses use case layer, violates architecture.

**Wrong**:
```typescript
// ❌ Direct service call
import { [Entity]Service } from '../services/[feature].service';

const data = await [Entity]Service.create(newEntity);
```

**Correct**:
```typescript
// ✅ Call use case
import { create[Entity] } from '../use-cases/create[Entity]';

const mutation = useMutation({
  mutationFn: (data) => create[Entity](data, userId, organizationId),
});
```

---

### ❌ DON'T: Use useEffect for Data Fetching

**Problem**: Violates project rules, harder to manage loading/error states.

**Wrong**:
```typescript
// ❌ useEffect for fetching
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    setLoading(true);
    const result = await list[Entities](...);
    setData(result.data);
    setLoading(false);
  }
  fetchData();
}, []);
```

**Correct**:
```typescript
// ✅ TanStack Query
const query = useQuery({
  queryKey: ['entities', organizationId],
  queryFn: () => list[Entities](...),
});

// query.isLoading, query.data, query.error
```

---

### ❌ DON'T: Modify E2E Tests

**Problem**: Tests are immutable specification, modifying them violates TDD.

**Wrong**:
```typescript
// ❌ Changing test to make it pass
test('creates entity', async () => {
  // Changed selector from data-testid="create-button" to data-testid="submit-btn"
  await page.click('[data-testid="submit-btn"]');
});
```

**Correct**:
```typescript
// ✅ Update component to match test
<Button data-testid="create-button">Create</Button>
```

---

### ❌ DON'T: Hardcode Strings

**Problem**: Violates i18n requirements, not translatable.

**Wrong**:
```typescript
// ❌ Hardcoded string
<h2>Create Entity</h2>
<Button>Submit</Button>
```

**Correct**:
```typescript
// ✅ Translated
const t = useTranslations('namespace');
<h2>{t('form.title.create')}</h2>
<Button>{t('form.submit')}</Button>
```

---

### ❌ DON'T: Skip Accessibility

**Problem**: Violates WCAG 2.1 AA requirement, excludes users.

**Wrong**:
```typescript
// ❌ No label, no aria
<input type="text" />
<button onClick={handleDelete}>🗑️</button>
```

**Correct**:
```typescript
// ✅ Proper accessibility
<Label htmlFor="field1">Field 1</Label>
<Input id="field1" aria-required="true" />

<Button
  onClick={handleDelete}
  aria-label="Delete entity"
>
  🗑️
</Button>
```

---

### ❌ DON'T: Forget Responsive Design

**Problem**: Poor mobile experience.

**Wrong**:
```typescript
// ❌ Fixed width, not responsive
<div className="w-[800px]">
  {/* Content */}
</div>
```

**Correct**:
```typescript
// ✅ Responsive
<div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
  {/* Content */}
</div>
```

---

### ❌ DON'T: Use Non-Approved UI Libraries

**Problem**: Violates technology stack rules.

**Wrong**:
```typescript
// ❌ Material-UI (not approved)
import { Button } from '@mui/material';
```

**Correct**:
```typescript
// ✅ shadcn/ui (approved)
import { Button } from '@/components/ui/button';
```

---

### ❌ DON'T: Skip Context7 Research

**Problem**: Miss latest best practices, reinvent patterns.

**Wrong**:
- Jump straight to implementation
- Use outdated patterns from training data

**Correct**:
- Consult Context7 for shadcn/ui, TanStack Query, React patterns
- Use latest recommended approaches
- Apply accessibility best practices from WCAG docs

---

### ❌ DON'T: Ignore Performance

**Problem**: Poor user experience, low Lighthouse scores.

**Wrong**:
- No code splitting
- No lazy loading
- No caching strategy
- Unnecessary re-renders

**Correct**:
- Lazy load heavy components
- Use React.memo for expensive renders
- Configure TanStack Query caching
- Optimize images with next/image

---

## Success Criteria

This skill is successful when:

✅ **ALL E2E Tests Pass**: 100% of E2E tests passing without modification
✅ **WCAG 2.1 AA Compliant**: Zero accessibility violations
✅ **Performance Optimized**: Core Web Vitals green (LCP < 2.5s, FID < 100ms, CLS < 0.1)
✅ **No Business Logic**: Components only call use cases, no service access
✅ **Technology Compliance**: Only shadcn/ui, Tailwind, TanStack Query used
✅ **i18n Complete**: Zero hardcoded strings, all text translated (en + es)
✅ **Responsive Design**: Works perfectly on mobile, tablet, desktop
✅ **Architecture Respected**: Clean Architecture layers maintained
✅ **No Test Modifications**: E2E tests remain unchanged (immutable)
✅ **Feature Complete**: All user stories and acceptance criteria met

---

## Skill Usage Example

```bash
# UI/UX Expert receives handoff from Supabase Agent
User: "Supabase Agent has completed. Proceed with UI implementation."

# UI/UX Expert invokes this skill
UI/UX Agent: "I'll use the UI/UX Expert skill to create accessible components."

# Skill guides through phases:
Phase 1: Read PRD, analyze E2E tests, review use cases
Phase 2: Consult Context7 for shadcn/ui, TanStack Query, WCAG patterns
Phase 3: Design component architecture (structure, behavior, accessibility)
Phase 4: Implement components (make E2E tests pass)
Phase 5: Validate WCAG 2.1 AA compliance
Phase 6: Optimize performance (Core Web Vitals)
Phase 7: Final quality check (all tests passing, no violations)
Phase 8: Complete handoff (update status, document)

# Result:
✅ All E2E tests passing (100%)
✅ WCAG 2.1 AA compliant (zero violations)
✅ Core Web Vitals green
✅ No business logic in components
✅ i18n complete (no hardcoded strings)
✅ Fully responsive
✅ Feature ready for production
```

---

## Notes

- **This skill is MANDATORY for UI/UX Agent** - Do not implement UI without following this process
- **Estimated time**: 4-6 hours depending on feature complexity
- **Quality over speed**: Thoroughness ensures production-ready UI
- **Accessibility is NOT optional**: WCAG 2.1 AA is MANDATORY
- **Context7 consultation is REQUIRED**: Always verify latest patterns
- **When in doubt about accessibility**: Ask or research WCAG guidelines

**Remember**: You are the final gatekeeper before users interact with the feature. Your work directly impacts user experience, accessibility, and satisfaction. Be thorough, be accessible, be performant.
