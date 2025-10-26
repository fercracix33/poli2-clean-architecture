# Zod Validation Debugging Reference

**Purpose**: Patterns for diagnosing and fixing Zod schema validation errors.

**When to Consult**: Validation errors, schema mismatches, safeParse issues, type inference problems.

**Context7 Equivalent**:
```typescript
await context7.get_library_docs({
  context7CompatibleLibraryID: "/colinhacks/zod",
  topic: "safeParse error handling flatten custom errors refinements",
  tokens: 3000
})
```

---

## Common Zod Issues

### 1. safeParse Not Handled Correctly

**Symptoms**: `TypeError: Cannot read property 'data' of undefined` or validation errors not caught

**Diagnosis**:
```typescript
// Check safeParse result structure
const result = schema.safeParse(input)
console.log('Success:', result.success)
if (!result.success) {
  console.log('Errors:', result.error.flatten())
}
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Always check success before accessing data
export async function createTask(input: unknown) {
  const result = TaskCreateSchema.safeParse(input)

  if (!result.success) {
    const errors = result.error.flatten()
    throw new ValidationError('Invalid task data', errors)
  }

  // Now result.data is type-safe
  return taskService.create(result.data)
}

// ❌ BAD: Accessing data without checking success
export async function createTask(input: unknown) {
  const result = TaskCreateSchema.safeParse(input)
  return taskService.create(result.data)  // TypeError if validation fails!
}
```

**Fix**:
```typescript
// BEFORE (crashes on invalid input)
export async function updateProject(id: number, input: unknown) {
  const validated = ProjectUpdateSchema.safeParse(input)
  return projectService.update(id, validated.data)  // Crash!
}

// AFTER (proper error handling)
export async function updateProject(id: number, input: unknown) {
  const result = ProjectUpdateSchema.safeParse(input)

  if (!result.success) {
    throw new ValidationError(
      'Invalid project data',
      result.error.flatten().fieldErrors
    )
  }

  return projectService.update(id, result.data)
}
```

---

### 2. Schema Mismatch Errors

**Symptoms**: `Expected string, received number` or `Required field missing`

**Diagnosis**:
```typescript
// Print expected vs actual
const result = schema.safeParse(input)
if (!result.success) {
  console.log('Expected schema:', schema.shape)
  console.log('Received input:', input)
  console.log('Errors:', result.error.issues)
}
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Use proper schema types
const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.number().int().min(1).max(5),
  dueDate: z.string().datetime().optional(),
})

// ✅ GOOD: Use .transform() for type coercion
const TaskInputSchema = z.object({
  priority: z.string().transform(val => parseInt(val, 10)),  // "3" → 3
  dueDate: z.string().transform(val => new Date(val)),       // ISO string → Date
})

// ❌ BAD: Expecting wrong types
const BadSchema = z.object({
  priority: z.string(),  // But API returns number!
  dueDate: z.date(),     // But form sends string!
})
```

**Fix**:
```typescript
// BEFORE (schema doesn't match API response)
const UserSchema = z.object({
  id: z.string(),              // API returns number!
  created_at: z.date(),        // API returns ISO string!
  metadata: z.object({}),      // API returns JSON string!
})

// AFTER (schema matches API)
const UserSchema = z.object({
  id: z.number(),
  created_at: z.string().datetime(),
  metadata: z.string().transform(val => JSON.parse(val)),
})

// Or use preprocessing
const UserSchema = z.preprocess(
  (val: any) => ({
    ...val,
    created_at: new Date(val.created_at),
    metadata: JSON.parse(val.metadata),
  }),
  z.object({
    id: z.number(),
    created_at: z.date(),
    metadata: z.record(z.unknown()),
  })
)
```

---

### 3. Optional vs Nullable Confusion

**Symptoms**: `Expected string, received null` or `undefined not allowed`

**Diagnosis**:
```typescript
// Check what the API actually returns
console.log('Description value:', data.description)  // null or undefined?

// Test both cases
schema.safeParse({ description: null })
schema.safeParse({ description: undefined })
schema.safeParse({})  // Missing field
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Understand the difference
const Schema = z.object({
  // .optional() = field can be missing (undefined)
  optionalField: z.string().optional(),  // { } is valid

  // .nullable() = field can be null
  nullableField: z.string().nullable(),  // { nullableField: null } is valid

  // Both missing and null allowed
  optionalNullable: z.string().optional().nullable(),

  // Neither missing nor null (must be present and non-null)
  required: z.string(),  // { required: undefined } is invalid
})

// ✅ GOOD: Use .nullish() for both undefined and null
const Schema = z.object({
  description: z.string().nullish(),  // undefined | null | string
})

// ❌ BAD: Using .optional() when field can be null
const BadSchema = z.object({
  description: z.string().optional(),  // Fails if description: null
})
```

**Fix**:
```typescript
// BEFORE (fails when Supabase returns null)
const TaskSchema = z.object({
  description: z.string().optional(),  // Supabase returns null, not undefined!
  completed_at: z.string().datetime().optional(),
})

// AFTER (handles Supabase nulls)
const TaskSchema = z.object({
  description: z.string().nullable(),  // or .nullish()
  completed_at: z.string().datetime().nullable(),
})
```

---

### 4. Custom Error Messages

**Symptoms**: Generic error messages don't help users

**Diagnosis**:
```typescript
// Check default error messages
const result = schema.safeParse(input)
if (!result.success) {
  console.log('Default errors:', result.error.issues)
}
```

**Context7 Best Practice**:
```typescript
// ✅ GOOD: Add custom error messages
const TaskSchema = z.object({
  title: z.string({
    required_error: 'Task title is required',
    invalid_type_error: 'Task title must be text',
  }).min(1, 'Task title cannot be empty'),

  email: z.string()
    .email('Please enter a valid email address'),

  priority: z.number()
    .int('Priority must be a whole number')
    .min(1, 'Priority must be at least 1')
    .max(5, 'Priority cannot exceed 5'),
})

// ✅ GOOD: Use .refine() for complex validation
const PasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],  // Error attached to confirmPassword field
})

// ❌ BAD: No custom messages (unhelpful to users)
const BadSchema = z.object({
  title: z.string().min(1),
  email: z.string().email(),
})
```

**Fix**:
```typescript
// BEFORE (generic errors)
const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(5),
})

// Validation error: "String must contain at least 1 character(s)"
// Not helpful!

// AFTER (user-friendly errors)
const CreateTaskSchema = z.object({
  title: z.string({
    required_error: 'Please enter a task title',
  }).min(1, 'Task title cannot be empty'),

  description: z.string().optional(),

  priority: z.number({
    required_error: 'Please select a priority',
    invalid_type_error: 'Priority must be a number',
  })
    .int('Priority must be 1, 2, 3, 4, or 5')
    .min(1, 'Priority must be at least 1')
    .max(5, 'Priority cannot be higher than 5'),
})

// Validation error: "Please enter a task title"
// Much better!
```

---

## Error Formatting

### 1. Flatten Errors
```typescript
// Get field-specific errors
const result = schema.safeParse(input)
if (!result.success) {
  const errors = result.error.flatten()

  console.log('Form errors:', errors.formErrors)  // General errors
  console.log('Field errors:', errors.fieldErrors)  // Per-field errors

  // Example output:
  // {
  //   formErrors: [],
  //   fieldErrors: {
  //     title: ['Task title cannot be empty'],
  //     priority: ['Priority must be at least 1']
  //   }
  // }
}
```

### 2. Format for UI
```typescript
// Convert Zod errors to form-friendly format
export function formatZodErrors(error: z.ZodError) {
  return error.issues.reduce((acc, issue) => {
    const path = issue.path.join('.')
    if (!acc[path]) {
      acc[path] = []
    }
    acc[path].push(issue.message)
    return acc
  }, {} as Record<string, string[]>)
}

// Usage in React Hook Form
const { register, handleSubmit, setError } = useForm()

const onSubmit = async (data: unknown) => {
  const result = TaskSchema.safeParse(data)

  if (!result.success) {
    const errors = formatZodErrors(result.error)
    Object.entries(errors).forEach(([field, messages]) => {
      setError(field as any, {
        type: 'manual',
        message: messages[0],
      })
    })
    return
  }

  // Proceed with validated data
  await createTask(result.data)
}
```

---

## Advanced Patterns

### 1. Discriminated Unions
```typescript
// Different schemas based on type field
const EventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal('scroll'),
    scrollTop: z.number(),
  }),
  z.object({
    type: z.literal('resize'),
    width: z.number(),
    height: z.number(),
  }),
])

// Type inference works perfectly
const event: z.infer<typeof EventSchema> = { type: 'click', x: 10, y: 20 }
```

### 2. Schema Composition
```typescript
// Base schema
const BaseTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
})

// Extend with additional fields
const CreateTaskSchema = BaseTaskSchema.extend({
  organizationId: z.number(),
  createdBy: z.number(),
})

const UpdateTaskSchema = BaseTaskSchema.partial().extend({
  updatedBy: z.number(),
  updatedAt: z.string().datetime(),
})

// Or use .pick() / .omit()
const TaskIdSchema = BaseTaskSchema.pick({ title: true })
const TaskWithoutDescriptionSchema = BaseTaskSchema.omit({ description: true })
```

### 3. Async Validation (Database Checks)
```typescript
// Use .refine() with async validation
const UniqueEmailSchema = z.object({
  email: z.string().email(),
}).refine(
  async (data) => {
    const existing = await db.users.findByEmail(data.email)
    return !existing
  },
  {
    message: 'Email already exists',
    path: ['email'],
  }
)

// Usage (must await)
const result = await UniqueEmailSchema.safeParseAsync(input)
```

---

## Common Fixes Checklist

- [ ] Always check `result.success` before accessing `result.data`
- [ ] Use `.nullable()` for fields that can be `null` (Supabase)
- [ ] Use `.optional()` for fields that can be missing
- [ ] Use `.nullish()` for fields that can be both `null` and `undefined`
- [ ] Add custom error messages for user-facing validations
- [ ] Use `.flatten()` to get field-specific errors
- [ ] Use `.transform()` for type coercion (string → number, string → Date)
- [ ] Use `.refine()` for complex validation logic
- [ ] Match schema types to actual API response types
- [ ] Test schemas with real data (null, undefined, edge cases)

---

**Update Policy**: Refresh when Zod releases new features or patterns emerge from Context7.
