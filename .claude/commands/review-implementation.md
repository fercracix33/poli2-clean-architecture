# Review Implementation

## Description
Comprehensive architecture review command for the Architect Agent to validate feature implementations against PRDs, Clean Architecture principles, and technology stack compliance. This command analyzes code, identifies deviations, and prepares detailed correction plans.

## Usage
```bash
/review-implementation  [options]
```

## Parameters
- `feature-path` (required): Path to the feature directory relative to PRDs/
  - Example: `tasks/001-create-task`
- `--layer` (optional): Focus review on specific architecture layer
  - Options: `entities`, `use-cases`, `services`, `components`, `all` (default)
- `--strict` (optional): Enable strict mode (fails on warnings)
- `--fix-plan` (optional): Generate detailed correction plan
- `--check-tests` (optional): Validate test coverage and quality

## Examples

### Basic Implementation Review
```bash
/review-implementation tasks/001-create-task
```

### Review Specific Layer
```bash
/review-implementation tasks/001-create-task --layer=use-cases
```

### Full Audit with Correction Plan
```bash
/review-implementation tasks/001-create-task --strict --fix-plan --check-tests
```

### Quick Entities Validation
```bash
/review-implementation auth/003-login --layer=entities
```

## Implementation

When this command is executed, Claude Code should perform the following steps:

### Phase 0: Context Gathering

**CRITICAL**: Before any analysis, use MCPs to gather current context.

#### 0.1 Load PRD Documentation
```bash
# Read the master PRD
cat PRDs/[feature-path]/00-master-prd.md

# Read implementation specs if they exist
cat PRDs/[feature-path]/03-implementation-spec.md 2>/dev/null
cat PRDs/[feature-path]/02-test-spec.md 2>/dev/null
```

#### 0.2 Query Database Schema (Supabase MCP)
```typescript
// Only if feature involves database
supabase.list_tables({ schemas: ['public'] })
supabase.execute_sql({
  query: `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name ILIKE '%[feature-name]%'
  `
})
```

#### 0.3 Verify Latest Patterns (Context7 MCP)
```typescript
// Check if implementation uses latest patterns
context7.get_library_docs({
  context7CompatibleLibraryID: "/colinhacks/zod",
  topic: "schema validation latest patterns",
  tokens: 2000
})

context7.get_library_docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router best practices",
  tokens: 2000
})
```

---

### Phase 1: PRD Validation

#### 1.1 Verify PRD Completeness
```bash
# Check all required PRD sections exist
✅ Check if 00-master-prd.md exists
✅ Verify all 14 sections are present
✅ Confirm entities.ts is defined in PRD
✅ Validate API specifications are complete
✅ Check acceptance criteria are testable
```

#### 1.2 Extract Expected Architecture
```typescript
// From PRD Section 8.3 (Feature Directory Structure)
const expectedStructure = {
  entities: 'entities.ts',
  useCases: ['create[Entity].ts', 'get[Entity].ts', ...],
  services: ['[feature].service.ts'],
  components: ['[Entity]Form.tsx', '[Entity]List.tsx', ...]
}
```

---

### Phase 2: Directory Structure Validation

#### 2.1 Verify Canonical Structure
```bash
# Check if feature follows Clean Architecture structure
app/src/features/[feature-name]/
├── entities.ts              # ← Must exist
├── use-cases/               # ← Check contents
├── services/                # ← Check contents
└── components/              # ← Check contents (if UI feature)

# Verify API routes if specified
app/src/app/api/[feature]/
├── route.ts                 # ← CRUD endpoint
└── [id]/route.ts            # ← Single resource endpoint
```

**Validation Rules:**
- ❌ FAIL if entities.ts missing
- ⚠️ WARN if use-cases/ missing but PRD specifies them
- ⚠️ WARN if services/ missing but PRD specifies database access
- ℹ️ INFO if components/ missing (might be API-only feature)

#### 2.2 Check File Naming Conventions
```typescript
// Verify naming follows standards
const namingRules = {
  entities: 'entities.ts',           // Exact name
  useCases: 'camelCase.ts',          // createTask.ts, getTask.ts
  services: 'kebab-case.service.ts', // task.service.ts
  components: 'PascalCase.tsx',      // TaskForm.tsx, TaskList.tsx
  tests: '*.test.ts(x)',             // All test files
}
```

---

### Phase 3: Architecture Layer Analysis

#### 3.1 Entities Layer Review

**Read File:**
```bash
cat app/src/features/[feature-name]/entities.ts
```

**Validation Checklist:**
```typescript
✅ Zod is the ONLY import
✅ No business logic (only Zod schemas + types)
✅ All schemas from PRD Section 6 are implemented
✅ Schema validations match PRD specifications
✅ TypeScript types are exported (z.infer<>)
✅ No circular dependencies
✅ JSDoc comments present for complex schemas
✅ Naming: [Entity]Schema, [Entity]CreateSchema, [Entity]UpdateSchema
```

**Anti-Pattern Detection:**
```typescript
// ❌ CRITICAL VIOLATION: Business logic in entities
if (code.includes('if (') || code.includes('throw new Error')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'entities',
    rule: 'No business logic allowed',
    message: 'Entities must be pure Zod schemas + TypeScript types',
    fix: 'Move validation logic to use cases'
  })
}

// ❌ CRITICAL: Non-Zod imports
const imports = extractImports(code)
if (imports.some(i => i !== 'zod')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'entities',
    rule: 'Only Zod imports allowed',
    message: `Found imports: ${imports.join(', ')}`,
    fix: 'Remove all non-Zod dependencies'
  })
}
```

#### 3.2 Use Cases Layer Review

**Read Files:**
```bash
ls app/src/features/[feature-name]/use-cases/*.ts | grep -v test
```

**For Each Use Case File:**
```typescript
✅ Import entities from ../entities
✅ Import service interfaces (not implementations)
✅ Pure business logic orchestration
✅ No direct database access (must use services)
✅ Proper error handling with custom errors
✅ Input validation using Zod schemas
✅ Authorization logic present (if applicable)
✅ No framework-specific code (Next.js, React)
✅ Corresponding test file exists
```

**Prohibited Patterns:**
```typescript
// ❌ CRITICAL: Direct database access
if (code.includes('supabase.from(')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'use-cases',
    rule: 'No direct database access',
    message: 'Use cases must call services, not Supabase directly',
    fix: 'Create service method and call it'
  })
}

// ❌ CRITICAL: Framework coupling
if (code.includes('NextRequest') || code.includes('Response')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'use-cases',
    rule: 'Framework-agnostic required',
    message: 'Use cases cannot depend on Next.js',
    fix: 'Move framework code to API route handlers'
  })
}
```

#### 3.3 Services Layer Review

**Read Files:**
```bash
cat app/src/features/[feature-name]/services/*.service.ts
```

**Validation Checklist:**
```typescript
✅ Import entities from ../entities
✅ Import Supabase client from lib/supabase
✅ ONLY CRUD operations (no business logic)
✅ No validation beyond data type safety
✅ No authorization logic (use cases handle this)
✅ Proper error handling (database errors only)
✅ TypeScript return types match entities
✅ Methods return raw data or null
✅ Corresponding test file exists
```

**Prohibited Patterns:**
```typescript
// ❌ CRITICAL: Business validation in service
if (code.includes('if (data.length < 5)') || 
    code.includes('if (user.role !==')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'services',
    rule: 'No business logic in services',
    message: 'Services must be pure data access (CRUD only)',
    fix: 'Move validation to use cases'
  })
}

// ⚠️ WARNING: Complex queries without optimization
if (code.includes('.select()').length > 3) {
  violations.push({
    severity: 'WARNING',
    layer: 'services',
    rule: 'Query optimization recommended',
    message: 'Multiple select statements detected',
    fix: 'Consider query optimization and proper indexing'
  })
}
```

#### 3.4 Components Layer Review (If UI Feature)

**Read Files:**
```bash
ls app/src/features/[feature-name]/components/*.tsx
```

**Validation Checklist:**
```typescript
✅ Import shadcn/ui or Aceternity UI components only
✅ Use TanStack Query for data fetching (NOT useEffect)
✅ Call use cases via API (not services directly)
✅ Proper loading/error states
✅ Tailwind CSS only (no traditional CSS)
✅ Accessibility: ARIA labels, keyboard navigation
✅ TypeScript props interface defined
✅ No business logic in components
```

**Prohibited Patterns:**
```typescript
// ❌ CRITICAL: useEffect for data fetching
if (code.includes('useEffect') && code.includes('fetch(')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'components',
    rule: 'No useEffect for data fetching',
    message: 'Must use TanStack Query (useQuery/useMutation)',
    fix: 'Replace useEffect with useQuery hook'
  })
}

// ❌ CRITICAL: Direct service calls
if (code.includes('import {') && code.includes('from "../services')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'components',
    rule: 'No direct service access',
    message: 'Components must call use cases via API',
    fix: 'Create API endpoint and use TanStack Query'
  })
}

// ❌ CRITICAL: Traditional CSS
if (code.includes('import styles from') || code.includes('.css')) {
  violations.push({
    severity: 'CRITICAL',
    layer: 'components',
    rule: 'No traditional CSS',
    message: 'Must use Tailwind CSS utility classes',
    fix: 'Convert to Tailwind classes'
  })
}
```

---

### Phase 4: Technology Stack Validation

#### 4.1 Detect Prohibited Technologies
```bash
# Scan for forbidden patterns
grep -r "import.*from 'jest'" app/src/features/[feature-name]/
grep -r "import.*from 'redux'" app/src/features/[feature-name]/
grep -r "import.*from 'mobx'" app/src/features/[feature-name]/
grep -r "\.css" app/src/features/[feature-name]/
```

**Prohibited Technology Matrix:**
```typescript
const prohibitedTech = {
  'jest': { severity: 'CRITICAL', replacement: 'Vitest' },
  'redux': { severity: 'CRITICAL', replacement: 'Zustand (client state) or TanStack Query (server state)' },
  'mobx': { severity: 'CRITICAL', replacement: 'Zustand' },
  'axios': { severity: 'WARNING', replacement: 'Native fetch with TanStack Query' },
  'lodash': { severity: 'INFO', replacement: 'Native JavaScript when possible' },
  '.css': { severity: 'CRITICAL', replacement: 'Tailwind CSS utilities' },
  'useEffect.*fetch': { severity: 'CRITICAL', replacement: 'TanStack Query (useQuery/useMutation)' }
}
```

#### 4.2 Verify Required Technologies
```typescript
✅ Next.js 14+ App Router (check app/ directory)
✅ Vitest for testing (check vitest.config.ts)
✅ Zod for validation (check entities.ts)
✅ TanStack Query for server state (check providers.tsx)
✅ Tailwind CSS for styling (check tailwind.config.ts)
✅ Supabase client for database (check lib/supabase.ts)
```

---

### Phase 5: Test Coverage Validation (If --check-tests)

#### 5.1 Verify Test Files Exist
```bash
# Check test coverage for each layer
for file in app/src/features/[feature-name]/use-cases/*.ts; do
  [ -f "${file%.ts}.test.ts" ] || echo "Missing test: ${file}"
done
```

**Required Test Files:**
```typescript
✅ entities.test.ts (Zod schema validation)
✅ [useCase].test.ts for each use case
✅ [service].service.test.ts for each service
✅ [Component].test.tsx for each component (unit)
✅ E2E tests for critical user flows (Playwright)
```

#### 5.2 Validate Test Quality
```bash
# Run tests and check coverage
cd app
npm run test:coverage -- app/src/features/[feature-name]
```

**Coverage Requirements:**
```typescript
const coverageThresholds = {
  entities: { statements: 100, branches: 100 },    // Must be 100%
  useCases: { statements: 90, branches: 85 },      // TDD requirement
  services: { statements: 90, branches: 80 },      // Data layer
  components: { statements: 80, branches: 75 }     // UI layer
}
```

#### 5.3 Check Test Agent Compliance
```bash
# Verify Test Agent created tests first (TDD)
git log --all --full-history -- "**/[feature-name]/**/*.test.ts" | head -n 20

# Tests should be created BEFORE implementation
✅ Test commits should have earlier timestamps
❌ FAIL if implementation commits exist before test commits
```

---

### Phase 6: PRD Acceptance Criteria Validation

#### 6.1 Compare Implementation to PRD Section 11
```typescript
// Extract acceptance criteria from PRD
const acceptanceCriteria = extractFromPRD('## 11. Acceptance Criteria')

// Check each criterion
for (const criterion of acceptanceCriteria.mustHave) {
  const isImplemented = checkImplementation(criterion)
  results.push({
    criterion,
    status: isImplemented ? 'PASS' : 'FAIL',
    severity: 'CRITICAL'
  })
}
```

**Example Validation:**
```typescript
// PRD says: "User can create [entity] with required fields"
✅ Check: POST /api/[feature] endpoint exists
✅ Check: Entity validation includes required fields
✅ Check: Use case implements creation logic
✅ Check: Service has create method
✅ Check: Tests verify creation flow
```

---

### Phase 7: Database Schema Validation (If DB Feature)

#### 7.1 Verify RLS Policies Implemented
```typescript
// From PRD Section 8.2
const expectedPolicies = extractFromPRD('## 8.2 Row Level Security')

// Query actual policies (Supabase MCP)
const actualPolicies = await supabase.execute_sql({
  query: `
    SELECT policyname, permissive, roles, cmd, qual
    FROM pg_policies
    WHERE tablename = '[table_name]'
  `
})

// Compare expected vs actual
compareImplementation(expectedPolicies, actualPolicies)
```

#### 7.2 Check Table Schema
```typescript
// Verify table matches PRD Section 8.1
const expectedSchema = extractFromPRD('## 8.1 Database Schema')
const actualSchema = await supabase.execute_sql({
  query: `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = '[table_name]'
  `
})

compareSchemas(expectedSchema, actualSchema)
```

---

## Expected Output

### Clean Implementation (No Issues)
```
🎯 ARCHITECTURE REVIEW COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: tasks/001-create-task
Status: ✅ APPROVED

📋 PRD Compliance
  ✅ All 14 PRD sections complete
  ✅ Entities defined correctly
  ✅ API specifications match implementation
  ✅ Acceptance criteria: 12/12 PASS

🏗️ Clean Architecture
  ✅ Entities Layer: Pure Zod schemas (0 violations)
  ✅ Use Cases Layer: Business logic isolated (0 violations)
  ✅ Services Layer: Pure CRUD operations (0 violations)
  ✅ Components Layer: Framework compliance (0 violations)

🔧 Technology Stack
  ✅ Next.js 14 App Router
  ✅ Vitest for testing
  ✅ TanStack Query for data fetching
  ✅ Tailwind CSS for styling
  ✅ No prohibited technologies detected

🧪 Test Coverage
  ✅ Entities: 100% coverage
  ✅ Use Cases: 94% coverage (target: 90%)
  ✅ Services: 91% coverage (target: 90%)
  ✅ Components: 87% coverage (target: 80%)
  ✅ TDD compliance: Tests created before implementation

🗄️ Database Implementation
  ✅ Table schema matches PRD
  ✅ All RLS policies implemented
  ✅ Indexes created for performance
  ✅ Foreign keys configured correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No corrections needed. Implementation is production-ready! 🚀
```

### Implementation with Violations
```
⚠️ ARCHITECTURE REVIEW FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: auth/003-login
Status: ❌ NEEDS CORRECTIONS

📋 PRD Compliance
  ⚠️ 2 acceptance criteria not met

🏗️ Clean Architecture Violations

  ❌ CRITICAL: Entities Layer
    File: app/src/features/auth/entities.ts
    Line: 23
    Issue: Business logic detected in entities
    Found: if (password.length < 8) throw new Error(...)
    Fix: Remove validation logic, keep only Zod schema
    
  ❌ CRITICAL: Use Cases Layer  
    File: app/src/features/auth/use-cases/loginUser.ts
    Line: 45
    Issue: Direct database access detected
    Found: const user = await supabase.from('users')...
    Fix: Call authService.findUserByEmail() instead
    
  ❌ CRITICAL: Services Layer
    File: app/src/features/auth/services/auth.service.ts
    Line: 67
    Issue: Business validation in service
    Found: if (user.role !== 'admin')...
    Fix: Move authorization to loginUser use case

🔧 Technology Stack Violations

  ❌ CRITICAL: Prohibited Technology
    File: app/src/features/auth/components/LoginForm.tsx
    Line: 12
    Issue: useEffect used for data fetching
    Found: useEffect(() => { fetch('/api/auth')... })
    Fix: Replace with TanStack Query useQuery hook
    
  ⚠️ WARNING: Deprecated Pattern
    File: app/src/features/auth/use-cases/loginUser.ts
    Line: 89
    Issue: Manual error creation
    Suggestion: Use custom error classes

🧪 Test Coverage Issues

  ❌ CRITICAL: Missing Tests
    - auth/use-cases/loginUser.test.ts (missing)
    - auth/services/auth.service.test.ts (low coverage: 64%)
    
  ⚠️ WARNING: TDD Violation
    loginUser.ts was committed before loginUser.test.ts
    This violates Test-Driven Development principles

🗄️ Database Implementation

  ❌ CRITICAL: Missing RLS Policy
    Expected: "Users can only access own sessions"
    Table: user_sessions
    Fix: Create SELECT policy with auth.uid() check
    
  ⚠️ WARNING: Missing Index
    Recommended: CREATE INDEX idx_users_email ON users(email)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Issues: 10 (6 critical, 4 warnings)

🔧 CORRECTION PLAN GENERATED
See: PRDs/auth/003-login/CORRECTIONS.md
```

### Correction Plan Document (If --fix-plan)
```markdown
# Feature Correction Plan: auth/003-login

**Generated**: 2024-01-15 14:30:00
**Review Status**: NEEDS CORRECTIONS
**Priority**: HIGH (6 critical violations)

---

## Critical Violations (Must Fix Before Merge)

### 1. Entities Layer: Business Logic Detected
**Location**: `app/src/features/auth/entities.ts:23`

**Current Code**:
```typescript
export const validatePassword = (password: string) => {
  if (password.length < 8) {
    throw new Error('Password too short')
  }
}
```

**Correction**:
```typescript
// Remove validation function, use Zod schema only
export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters')
})
```

**Agent Responsible**: Implementer Agent (should not have added logic here)

---

### 2. Use Cases: Direct Database Access
**Location**: `app/src/features/auth/use-cases/loginUser.ts:45`

**Current Code**:
```typescript
const user = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

**Correction**:
```typescript
// Use service layer instead
const user = await authService.findUserByEmail(email)
if (!user) {
  throw new UserNotFoundError(email)
}
```

**Agent Responsible**: Implementer Agent (violated layer boundaries)

---

### 3. Services: Business Validation Present
**Location**: `app/src/features/auth/services/auth.service.ts:67`

**Current Code**:
```typescript
if (user.role !== 'admin') {
  throw new Error('Unauthorized')
}
return user
```

**Correction**:
```typescript
// Remove authorization logic, return raw data only
return user // Services just return data, no business checks
```

**Move Authorization To**:
```typescript
// app/src/features/auth/use-cases/loginUser.ts
const user = await authService.findUserByEmail(email)
if (!user || user.role !== 'admin') {
  throw new UnauthorizedError('Admin access required')
}
```

---

### 4. Components: useEffect for Data Fetching
**Location**: `app/src/features/auth/components/LoginForm.tsx:12`

**Current Code**:
```typescript
useEffect(() => {
  fetch('/api/auth/session')
    .then(res => res.json())
    .then(data => setSession(data))
}, [])
```

**Correction**:
```typescript
// Replace with TanStack Query
const { data: session, isLoading } = useQuery({
  queryKey: ['session'],
  queryFn: () => fetch('/api/auth/session').then(res => res.json())
})
```

---

### 5. Missing RLS Policy
**Table**: `user_sessions`

**Required Policy**:
```sql
-- Create RLS policy for user sessions
CREATE POLICY "Users can only access own sessions"
  ON user_sessions
  FOR SELECT
  USING (user_id = auth.uid());
```

**Implementation**:
1. Supabase Agent must add this to migration file
2. Apply migration to database
3. Verify policy with: `SELECT * FROM pg_policies WHERE tablename = 'user_sessions'`

---

### 6. Missing Test Coverage
**Missing Files**:
- `auth/use-cases/loginUser.test.ts`
- Test coverage for `auth.service.ts` (current: 64%, target: 90%)

**Action Required**:
1. Test Agent must create comprehensive test suite
2. All tests must be created BEFORE implementing fixes
3. Tests must cover edge cases and error scenarios

---

## Warnings (Should Fix)

### 7. TDD Violation
**Issue**: Implementation code committed before tests

**Evidence**:
```bash
commit 3a4f5b (Jan 15, 10:30) - Add loginUser use case
commit 7c8d9e (Jan 15, 11:45) - Add loginUser tests  # ← Tests should come first!
```

**Process Correction**:
1. Test Agent creates failing tests
2. Implementer makes tests pass
3. No code without tests first

---

### 8. Missing Database Index
**Recommendation**: Create index on users.email for faster lookups

```sql
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);
```

---

## Remediation Steps

### Step 1: Test Agent Actions (FIRST)
```bash
# Create missing test files
touch app/src/features/auth/use-cases/loginUser.test.ts
touch app/src/features/auth/services/auth.service.test.ts

# Implement comprehensive test suite
# Tests must FAIL initially
npm run test -- auth/use-cases/loginUser.test.ts
# Expected: ❌ FAIL (function not implemented correctly)
```

### Step 2: Implementer Agent Actions
```bash
# Fix use cases layer violations
# - Remove direct database access
# - Add proper error handling
# - Implement business logic correctly

# Run tests until they pass
npm run test:watch -- auth/use-cases/
# Target: ✅ PASS all tests
```

### Step 3: Supabase Agent Actions
```bash
# Fix services layer violations
# - Remove business logic
# - Keep services pure (CRUD only)
# - Add missing RLS policies
# - Create database indexes

# Verify RLS policies
supabase db test
```

### Step 4: UI/UX Agent Actions
```bash
# Fix components layer violations
# - Replace useEffect with TanStack Query
# - Ensure accessibility compliance

# Run E2E tests
npm run test:e2e -- auth/
```

### Step 5: Architect Verification (YOU)
```bash
# Re-run architecture review
/review-implementation auth/003-login --strict

# Expected: ✅ APPROVED
```

---

## Estimated Time to Fix

- **Test Agent**: 3 hours (comprehensive test suite)
- **Implementer Agent**: 2 hours (refactor use cases)
- **Supabase Agent**: 1 hour (fix services + RLS)
- **UI/UX Agent**: 1 hour (replace useEffect)

**Total**: ~7 hours

---

## Success Criteria

Implementation will be approved when:
- [ ] All 6 critical violations resolved
- [ ] Test coverage >90% for all layers
- [ ] No prohibited technologies detected
- [ ] TDD process followed (tests before implementation)
- [ ] All RLS policies implemented
- [ ] Clean Architecture boundaries respected
- [ ] `/review-implementation auth/003-login --strict` returns APPROVED

---

## Notes for Agents

**To Implementer Agent**:
- You violated layer boundaries by accessing Supabase directly
- Always call services, never database clients
- Business logic belongs in use cases, not entities or services

**To Test Agent**:
- Tests must be created BEFORE implementation
- Current coverage insufficient (target: 90%+)
- Include edge cases and error scenarios

**To Supabase Agent**:
- Services must be pure CRUD (no business validation)
- Missing RLS policies are security vulnerabilities
- Consider adding indexes for performance

**To UI/UX Agent**:
- useEffect for data fetching is prohibited
- Always use TanStack Query for server state
- Ensure WCAG 2.1 AA compliance

---

**End of Correction Plan**
```

---

## Integration with CLAUDE.md

Add this section to your CLAUDE.md file:

```markdown
### `/review-implementation`
Comprehensive architecture review for implemented features.

**Usage:** `/review-implementation <feature-path> [options]`

**Validates:**
- ✅ Clean Architecture layer boundaries
- ✅ PRD compliance and acceptance criteria
- ✅ Technology stack adherence
- ✅ Test coverage and TDD compliance
- ✅ Database schema and RLS policies
- ✅ Code quality and best practices

**Example:** `/review-implementation tasks/001-create-task --fix-plan`
```

---

## Notes

- This command uses **Supabase MCP** to verify database implementation
- This command uses **Context7 MCP** to ensure latest patterns
- Corrections are prioritized by severity: CRITICAL > WARNING > INFO
- `--fix-plan` generates a detailed remediation document
- Use `--strict` mode for CI/CD pipelines (fails on warnings)
- The command respects the TDD agent sequence and validates compliance

---

## Related Commands

- `/validate-architecture` - Quick architecture validation
- `/prd-checklist` - PRD completeness check
- `/agent-handoff` - Agent coordination
