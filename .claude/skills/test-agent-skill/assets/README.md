# Test Agent Skill Assets

Templates, examples, and diagrams for test creation.

## Available Assets

### Templates

1. **entity-test-template.ts** - Boilerplate for entities.test.ts
   - Sections: Valid data, invalid data, refinements, create/update schemas
   - Uses: Zod safeParse patterns, comprehensive validation coverage

2. **use-case-test-template.ts** - Boilerplate for use case tests
   - Sections: Happy path, validation, authorization, business rules, errors, edge cases
   - Uses: Vitest mocking, service mocks, comprehensive assertions

3. **service-test-template.ts** - Boilerplate for service tests
   - Sections: CRUD operations, snake_case ↔ camelCase, pagination, error handling
   - Uses: Supabase client mocking, query builder chains

4. **api-route-test-template.ts** - Boilerplate for API endpoint tests
   - Sections: Authentication, validation, authorization, error handling
   - Uses: NextRequest mocking, status codes, error responses

5. **e2e-test-template.spec.ts** - Boilerplate for Playwright E2E tests
   - Sections: CRUD flows, accessibility, keyboard navigation, error handling
   - Uses: data-testid selectors, ARIA assertions, user-centric testing

### Examples

1. **complete-test-suite-example/** - Full example of task comments feature
   - Files: All test types with realistic scenarios
   - Shows: Complete TDD RED phase implementation

2. **mock-configurations/** - Common mock setups
   - Supabase client mock
   - Use case mocks
   - MSW HTTP mocks
   - Auth mocks

### Diagrams

1. **test-layers-diagram.md** - Visual of test layers (entities → use cases → services → APIs → E2E)
2. **tdd-workflow-diagram.md** - RED → GREEN → REFACTOR cycle
3. **mock-hierarchy-diagram.md** - How mocks cascade through layers

## Template Usage

Test Agent should:
1. Start with appropriate template for test type
2. Replace placeholders with feature-specific values
3. Expand sections based on PRD requirements
4. Add feature-specific edge cases
5. Verify all tests FAIL appropriately

## Example Structure

```
assets/
├── templates/
│   ├── entity-test-template.ts
│   ├── use-case-test-template.ts
│   ├── service-test-template.ts
│   ├── api-route-test-template.ts
│   └── e2e-test-template.spec.ts
├── examples/
│   └── complete-test-suite-example/
│       ├── entities.test.ts
│       ├── use-cases/
│       ├── services/
│       ├── api/
│       └── e2e/
├── mocks/
│   ├── supabase-mock.ts
│   ├── use-case-mocks.ts
│   └── auth-mock.ts
└── diagrams/
    ├── test-layers.svg
    ├── tdd-workflow.svg
    └── mock-hierarchy.svg
```

## Quality Standards

All templates should:
- Follow project conventions (Clean Architecture, naming)
- Use approved technology stack (Vitest, Playwright)
- Include comprehensive comments
- Cover common scenarios
- Be copy-paste ready with minimal modification

**Goal**: Reduce boilerplate, enforce patterns, accelerate test creation.
