# PRD Template Guide

Complete guide to the 9-section PRD structure used in this project.

**Note**: This project uses a **9-section structure**, not the 14-section structure mentioned in some legacy documents. The template has evolved to match the actual project needs.

---

## Template Structure Overview

```
PRD/
├── Metadata (header)
├── 1. User Story
├── 2. Criterios de Aceptación (Acceptance Criteria)
├── 3. Contrato de Datos (Data Contracts - Entities & Zod)
├── 4. Contrato de API Endpoints
├── 5. Especificaciones de UI/UX
├── 6. Consideraciones Técnicas
├── 7. Referencias a Documentos Específicos
├── 8. Criterios de Definición de Terminado (DoD)
└── 9. Notas y Observaciones
```

---

## Metadata (Header)

**Purpose**: Provide quick reference information about the feature.

**Required fields**:
```markdown
## Metadata
- **Feature ID:** [domain]-[number] (ej: tasks-001, auth-002)
- **Version:** [X.Y] (ej: 1.0, 1.1)
- **Created:** [YYYY-MM-DD]
- **Status:** [Draft | In Development | Testing | Completed | Deprecated]
- **Dependencies:** [Lista de features requeridas]
- **Assigned Architect:** [Nombre del arquitecto responsable]
```

**Feature ID Convention**:
- Format: `{domain}-{number}`
- Examples: `tasks-001`, `auth-002`, `i18n-001`, `theme-001`
- Domain must match directory structure in PRDs/

**Status values**:
- **Draft**: Initial creation, not yet approved
- **In Development**: Approved, agents working on it
- **Testing**: Implementation complete, in testing phase
- **Completed**: Fully implemented and deployed
- **Deprecated**: No longer in use

---

## Section 1: User Story

**Purpose**: Explain WHO needs WHAT and WHY in business terms.

**Structure**:
```markdown
## 1. User Story
> Como un **[Tipo de Usuario específico]**, quiero **[Realizar una Acción específica]** para poder **[Obtener un Beneficio concreto]**.

### Contexto del Negocio
[Explicación del problema que resuelve esta feature y por qué es importante]

### Usuarios Objetivo
- **Primarios:** [Usuarios principales que usarán esta feature]
- **Secundarios:** [Usuarios que se benefician indirectamente]
```

**Best practices**:
- Be specific about the user type (not just "user")
- Focus on the business value, not technical implementation
- Explain the "why" clearly
- Identify both primary and secondary users

**Example**:
```markdown
## 1. User Story
> Como un **usuario nuevo**, quiero **registrarme y crear o unirme a una organización** para poder **colaborar en proyectos de gestión de tareas con mi equipo**.

### Contexto del Negocio
El sistema necesita una base sólida de autenticación y gestión organizacional que permita a los usuarios colaborar de forma segura.

### Usuarios Objetivo
- **Primarios:** Nuevos usuarios que necesitan registrarse
- **Secundarios:** Administradores que invitan usuarios
```

---

## Section 2: Criterios de Aceptación

**Purpose**: Define WHAT the feature must do (functional) and HOW it must perform (non-functional).

**Structure**:
```markdown
## 2. Criterios de Aceptación

### Funcionales
- **DEBE** [comportamiento esperado obligatorio]
- **DEBE** [otro comportamiento crítico]
- **NO DEBE** [comportamiento explícitamente prohibido]
- **PUEDE** [comportamiento opcional deseable]

### No Funcionales
- **Performance:** DEBE responder en menos de [X]ms
- **Accesibilidad:** DEBE cumplir WCAG 2.1 AA mínimo
- **Responsividad:** DEBE funcionar en móvil (375px+), tablet (768px+) y desktop (1024px+)
- **Seguridad:** DEBE implementar [requisitos de seguridad específicos]
- **Escalabilidad:** DEBE soportar [número] de usuarios concurrentes
```

**Keywords explained**:
- **DEBE**: Mandatory requirement (MUST)
- **NO DEBE**: Forbidden behavior (MUST NOT)
- **PUEDE**: Optional/desirable (MAY)

**Non-functional requirements**:
- **Performance**: Response time targets
- **Accesibilidad**: Always WCAG 2.1 AA minimum (project standard)
- **Responsividad**: Mobile-first (375px+), tablet (768px+), desktop (1024px+)
- **Seguridad**: RLS, validation, authentication requirements
- **Escalabilidad**: Concurrent user targets

**Example**:
```markdown
### Funcionales
- **DEBE** permitir registro con email/password y Google OAuth
- **DEBE** verificar email antes de activar la cuenta
- **NO DEBE** permitir nombres de organización duplicados

### No Funcionales
- **Performance:** DEBE responder en menos de 300ms para autenticación
- **Accesibilidad:** DEBE cumplir WCAG 2.1 AA mínimo
- **Seguridad:** DEBE implementar RLS estricto para aislamiento entre organizaciones
```

---

## Section 3: Contrato de Datos (CRITICAL)

**Purpose**: Define ALL entities with Zod schemas and TypeScript types. This is the DATA CONTRACT.

**Structure**:
```markdown
## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales
- **Nueva Entidad:** `EntityName` en `src/features/[feature-name]/entities.ts`
- **Entidades Modificadas:** [Lista de entidades existentes que se modificarán]

### Schemas de Zod
[Complete TypeScript code with Zod schemas]

### Relaciones
- **EntityA** pertenece a **EntityB** (many-to-one)
- **EntityA** tiene muchos **EntityC** (one-to-many)
```

**Zod Schema Requirements**:

1. **Main entity schema** with full validation:
```typescript
export const EntitySchema = z.object({
  id: z.string().uuid(),
  field: z.string().min(1, "Error message").max(100, "Error message"),
  optionalField: z.string().optional(),
  enumField: z.enum(['value1', 'value2']),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),  // Use .coerce for date strings from DB
  updatedAt: z.coerce.date(),
});
```

2. **Create schema** (omit auto-generated fields):
```typescript
export const EntityCreateSchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
```

3. **Update schema** (partial, omit immutable fields):
```typescript
export const EntityUpdateSchema = EntitySchema
  .omit({
    id: true,
    userId: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
```

4. **TypeScript types**:
```typescript
export type Entity = z.infer<typeof EntitySchema>;
export type EntityCreate = z.infer<typeof EntityCreateSchema>;
export type EntityUpdate = z.infer<typeof EntityUpdateSchema>;
```

**Common patterns**:
- Use `.uuid()` for IDs
- Use `.coerce.date()` for dates from database (they come as strings)
- Use `.min()` and `.max()` for string length validation
- Use `.regex()` for pattern validation
- Use `.refine()` for custom validation logic
- Use descriptive error messages in Spanish (project standard)

**Naming conventions**:
- Database: `snake_case` (e.g., `user_id`, `created_at`)
- TypeScript/Zod: `camelCase` (e.g., `userId`, `createdAt`)
- Schema names: `PascalCase` + `Schema` suffix (e.g., `OrganizationSchema`)
- Type names: `PascalCase` (e.g., `Organization`, `OrganizationCreate`)

**Reference**: See `references/entity-design-patterns.md` for advanced Zod patterns.

---

## Section 4: Contrato de API Endpoints

**Purpose**: Define all API routes with request/response contracts.

**Structure for each endpoint**:
```markdown
### [Método] [Ruta]
- **Ruta:** `[METHOD] /api/[resource]`
- **Autenticación:** [Requerida | Opcional | No requerida]
- **Body Schema:** `[SchemaName]`
- **Query Parameters:** [Lista de parámetros opcionales]

#### Respuestas
- **Éxito:** `[código]` con schema `[ResponseSchema]`
- **Errores:**
  - `400` - Bad Request: [Condición específica]
  - `401` - Unauthorized: [Condición específica]
  - `403` - Forbidden: [Condición específica]
  - `404` - Not Found: [Condición específica]
  - `500` - Internal Server Error: [Condición específica]
```

**HTTP Methods**:
- **POST**: Create new resource
- **GET**: Retrieve resource(s)
- **PATCH**: Partial update
- **PUT**: Full replacement (rarely used)
- **DELETE**: Remove resource

**Authentication levels**:
- **Requerida**: Must be authenticated (uses Supabase Auth)
- **Opcional**: Works for both authenticated and anonymous
- **No requerida**: Public endpoint

**Response codes**:
- **200 OK**: Successful GET/PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflict (e.g., duplicate)
- **500 Internal Server Error**: Server error

**Example**:
```markdown
### POST /api/organizations
- **Ruta:** `POST /api/organizations`
- **Autenticación:** Requerida
- **Body Schema:** `OrganizationCreateSchema`

#### Respuestas
- **Éxito:** `201` con `Organization` creada
- **Errores:**
  - `400` - Validación fallida o nombre/slug duplicado
  - `401` - Usuario no autenticado
  - `500` - Error del servidor
```

---

## Section 5: Especificaciones de UI/UX

**Purpose**: Define UI components, user flows, and interface states.

**Structure**:
```markdown
## 5. Especificaciones de UI/UX

### Componentes Requeridos
- **Componente Principal:** `ComponentName` en `src/features/[feature-name]/components/`
- **Componentes Secundarios:** [Lista]
- **Páginas:** `src/app/(main)/[feature]/page.tsx`

### Flujos de Usuario
1. **Flujo Principal:**
   - Usuario [acción]
   - Sistema [respuesta]
   - Usuario [siguiente acción]
   - Sistema [resultado]

### Estados de la Interfaz
- **Loading:** [Descripción]
- **Error:** [Descripción]
- **Empty:** [Descripción]
- **Success:** [Descripción]
```

**Component organization**:
- Feature-specific: `src/features/[feature]/components/`
- Shared UI: `src/components/ui/` (shadcn/ui)
- Pages: `src/app/(main)/[feature]/page.tsx`

**Required UI states**:
- **Loading**: Show skeleton or spinner while fetching
- **Error**: Display error message with retry option
- **Empty**: Show when no data (with CTA to create)
- **Success**: Normal state with data

**Accessibility requirements** (always):
- WCAG 2.1 AA compliance minimum
- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast ratios

---

## Section 6: Consideraciones Técnicas

**Purpose**: Document security, performance, and integration requirements.

**Structure**:
```markdown
## 6. Consideraciones Técnicas

### Seguridad
- **Políticas RLS:** [Descripción]
- **Validaciones:** [Validaciones de autorización]
- **Sanitización:** [Campos que requieren sanitización]

### Performance
- **Optimizaciones:** [Optimizaciones específicas]
- **Caching:** [Estrategias de cache]
- **Paginación:** [Límites y estrategias]

### Integraciones
- **APIs Externas:** [Servicios externos]
- **Webhooks:** [Webhooks necesarios]
- **Background Jobs:** [Tareas en segundo plano]
```

**Security**:
- **RLS policies**: Row Level Security for database (see Section 8 in agent-specific docs)
- **Validations**: Zod schemas (already in Section 3)
- **Sanitization**: XSS prevention, SQL injection (handled by Supabase + Zod)

**Performance**:
- **Optimizations**: Specific indexing, query optimization
- **Caching**: TanStack Query handles most (staleTime, cacheTime)
- **Pagination**: Default limit 20, max 100

**Integrations**:
- **External APIs**: Third-party services (Stripe, SendGrid, etc.)
- **Webhooks**: Incoming/outgoing webhooks
- **Background Jobs**: Async tasks (email sending, reports, etc.)

---

## Section 7: Referencias a Documentos Específicos

**Purpose**: Link to agent-specific detailed specifications (OLD SYSTEM - being replaced by iterative workflow).

**Current structure** (legacy):
```markdown
## 7. Referencias a Documentos Específicos
- **Supabase:** `01-supabase-spec.md`
- **Testing:** `02-test-spec.md`
- **Implementation:** `03-implementation-spec.md`
- **UI/UX:** `04-ui-spec.md`
- **Status:** `_status.md`
```

**NEW iterative system** (v2.0):
```markdown
## 7. Referencias a Documentos Específicos
- **Test Agent:** `test-agent/00-request.md` → `test-agent/01-iteration.md`
- **Implementer:** `implementer/00-request.md` → `implementer/01-iteration.md`
- **Supabase Agent:** `supabase-agent/00-request.md` → `supabase-agent/01-iteration.md`
- **UI/UX Expert:** `ui-ux-expert/00-request.md` → `ui-ux-expert/01-iteration.md`
- **Status:** `_status.md`
```

**Note**: In the new system, you (Architect) write the `00-request.md` for each agent, and they create iteration documents.

---

## Section 8: Criterios de Definición de Terminado (DoD)

**Purpose**: Define WHEN each agent phase is considered complete.

**Structure**:
```markdown
## 8. Criterios de Definición de Terminado (DoD)

### Para Supabase Agent
- [ ] Schema de base de datos creado
- [ ] Políticas RLS implementadas y probadas
- [ ] Servicios de datos implementados
- [ ] Migraciones ejecutadas exitosamente

### Para Test Agent
- [ ] Suite de tests unitarios creada
- [ ] Tests de integración implementados
- [ ] Mocks configurados correctamente
- [ ] Cobertura de tests > 90%

### Para Implementer Agent
- [ ] Casos de uso implementados
- [ ] Endpoints de API funcionando
- [ ] Todos los tests pasando
- [ ] Validaciones de Zod implementadas

### Para UI/UX Expert Agent
- [ ] Componentes implementados
- [ ] Tests E2E pasando
- [ ] Accesibilidad validada
- [ ] Responsividad confirmada
```

**Agent-specific checklists**:
- **Supabase Agent**: Database, RLS, services, migrations
- **Test Agent**: All test layers (unit, integration, E2E), >90% coverage
- **Implementer**: Use cases, API endpoints, all tests passing
- **UI/UX Expert**: Components, E2E tests, accessibility, responsiveness

**Coverage target**: Always >90% for all layers

---

## Section 9: Notas y Observaciones

**Purpose**: Document additional context, design decisions, or special considerations.

**Use for**:
- Design decisions and rationale
- Alternative approaches considered and rejected
- Known limitations or technical debt
- Future enhancements planned
- Migration notes if refactoring existing feature

**Example**:
```markdown
## 9. Notas y Observaciones

**Decisión de Diseño**: Se eligió usar códigos de invitación de 8 caracteres en lugar de enlaces únicos para facilitar el compartir verbal entre equipos.

**Limitación Conocida**: El sistema actual no soporta múltiples organizaciones por usuario. Esta funcionalidad se agregará en auth-003.

**Deuda Técnica**: La validación de duplicados de slug se hace en el cliente y servidor. Considerar constraint único en base de datos en futuro refactor.
```

---

## PRD Creation Workflow

### Before writing PRD (MANDATORY)

**Phase 0: Research existing database context**:
1. Query Supabase MCP for existing tables
2. Check for similar features
3. Identify naming conventions
4. Review RLS patterns
5. Understand relationships

**Phase 1: Ask INFORMED clarifying questions**:
- Use Phase 0 context to ask specific questions
- Don't assume requirements
- Clarify permissions, functionality, data, side effects, performance

**Phase 2: Query Context7 for latest patterns**:
- Zod: `/colinhacks/zod` for validation patterns
- Next.js: `/vercel/next.js` for API route patterns
- Supabase: `/supabase/supabase` for RLS best practices

### While writing PRD

1. Start with Metadata header
2. Write User Story (Section 1)
3. Define Acceptance Criteria (Section 2)
4. **Design Data Contracts** (Section 3) - MOST CRITICAL
5. Define API Endpoints (Section 4)
6. Specify UI/UX (Section 5)
7. Document Technical Considerations (Section 6)
8. Link to agent documents (Section 7)
9. Define DoD per agent (Section 8)
10. Add notes and observations (Section 9)

### After writing PRD

**Validation checklist**:
- [ ] All 9 sections complete
- [ ] Zod schemas have validation messages in Spanish
- [ ] API endpoints cover all CRUD operations
- [ ] UI states (loading, error, empty, success) defined
- [ ] Security considerations documented
- [ ] DoD checklists complete for all agents
- [ ] Feature ID follows convention
- [ ] Status is set correctly

---

## Common Mistakes to Avoid

**❌ Vague user stories**:
```markdown
> Como usuario quiero hacer cosas
```

**✅ Specific user stories**:
```markdown
> Como un **administrador de organización**, quiero **invitar usuarios vía código** para poder **controlar quién accede a mi workspace**
```

**❌ Missing validation messages**:
```typescript
z.string().min(2).max(100)
```

**✅ With descriptive Spanish messages**:
```typescript
z.string()
  .min(2, "Nombre debe tener al menos 2 caracteres")
  .max(100, "Nombre no puede exceder 100 caracteres")
```

**❌ Incomplete API specs**:
```markdown
### POST /api/organizations
Crea una organización
```

**✅ Complete API specs**:
```markdown
### POST /api/organizations
- **Ruta:** `POST /api/organizations`
- **Autenticación:** Requerida
- **Body Schema:** `OrganizationCreateSchema`
- **Respuestas:**
  - `201` - Organización creada
  - `400` - Validación fallida
  - `401` - No autenticado
```

**❌ Forgetting non-functional requirements**:
```markdown
### Funcionales
- DEBE crear organizaciones
```

**✅ Including both functional and non-functional**:
```markdown
### Funcionales
- DEBE crear organizaciones

### No Funcionales
- **Performance:** < 300ms
- **Accesibilidad:** WCAG 2.1 AA
- **Seguridad:** RLS estricto
```

---

## Template Location

**Master template**: `PRDs/_templates/00-master-prd-template.md`

**Example PRDs**:
- `PRDs/auth/001-authentication-organizations/00-master-prd.md`
- `PRDs/i18n/001-internationalization/00-master-prd.md`
- `PRDs/theme/001-dark-light-mode/00-master-prd.md`

**Usage**:
```bash
# Copy template for new feature
cp PRDs/_templates/00-master-prd-template.md PRDs/{domain}/{number}-{feature}/architect/00-master-prd.md
```

---

**Last Updated**: 2025-10-24
