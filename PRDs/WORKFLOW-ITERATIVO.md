# Workflow Iterativo Detallado - Sistema TDD v2.0

**Versión**: 2.0
**Fecha**: 2025-10-24
**Audiencia**: Arquitecto, Agentes, Usuario

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Fase 0: Iniciación](#fase-0-iniciación)
3. [Fase 1: Test Agent](#fase-1-test-agent)
4. [Fase 2: Implementer](#fase-2-implementer)
5. [Fase 3: Supabase Agent](#fase-3-supabase-agent)
6. [Fase 4: UI/UX Expert](#fase-4-uiux-expert)
7. [Proceso de Revisión](#proceso-de-revisión)
8. [Manejo de Rechazos](#manejo-de-rechazos)
9. [Handoffs para Paralelismo](#handoffs-para-paralelismo)

---

## Visión General

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 0: INICIACIÓN                        │
│   Usuario ←→ Arquitecto → PRD Master → Entities.ts          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  FASE 1: TEST AGENT                          │
│                                                              │
│  Arquitecto escribe 00-request.md                           │
│           ↓                                                  │
│  Test Agent trabaja → 01-iteration.md                       │
│           ↓                                                  │
│  Arquitecto + Usuario REVISAN                               │
│           ↓                                                  │
│     ¿Aprobado?                                              │
│    ↙️        ↘️                                              │
│  SÍ         NO                                              │
│   ↓          ↓                                              │
│ Continuar  02-iteration.md → Revisar de nuevo              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 FASE 2: IMPLEMENTER                          │
│              [Mismo patrón iterativo]                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               FASE 3: SUPABASE AGENT                         │
│              [Mismo patrón iterativo]                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               FASE 4: UI/UX EXPERT                           │
│              [Mismo patrón iterativo]                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   ✅ FEATURE COMPLETA
```

### Principios Fundamentales

1. **Iteración antes que perfección**: Entregar rápido, revisar, corregir
2. **Aislamiento de agentes**: Cada agente solo lee su carpeta
3. **Revisión obligatoria**: Nada avanza sin aprobación
4. **Versionado inmutable**: Iteraciones no se editan, se crean nuevas
5. **Arquitecto como puente**: Única fuente de coordinación

---

## Fase 0: Iniciación

### Participantes
- **Usuario** (define requisito)
- **Arquitecto** (traduce a especificación técnica)

### Paso 1: Requerimiento del Usuario

**Acción**: Usuario describe lo que necesita

**Ejemplo**:
```
"Necesito que los usuarios puedan crear tareas con título,
descripción y fecha límite. Las tareas deben pertenecer a
un proyecto y solo los miembros del proyecto pueden verlas."
```

**Output**: Descripción informal del requisito

---

### Paso 2: Clarificación del Arquitecto

**Acción**: Arquitecto hace preguntas para eliminar ambigüedad

**Preguntas típicas**:
- ¿Quién puede crear tareas? ¿Solo ciertos roles?
- ¿Qué validaciones se necesitan? (ej: título mínimo/máximo)
- ¿Hay campos opcionales/obligatorios?
- ¿Qué permisos específicos se requieren?
- ¿Hay dependencias de otras features?
- ¿Qué debe pasar si se elimina el proyecto?

**Output**: Clarificación completa del alcance

---

### Paso 3: Crear Estructura de Feature

**Acción**: Arquitecto crea directorios

**Comandos**:
```bash
# Crear estructura completa
mkdir -p PRDs/tasks/001-create-task/{architect,test-agent,implementer,supabase-agent,ui-ux-expert}

# Copiar template de status
cp PRDs/_templates/_status-template.md PRDs/tasks/001-create-task/_status.md
```

**Output**: Estructura de carpetas lista

---

### Paso 4: Arquitecto Escribe PRD Master

**Acción**: Arquitecto usa template y llena PRD completo

**Comando**:
```bash
cp PRDs/_templates/00-master-prd-template.md PRDs/tasks/001-create-task/architect/00-master-prd.md
```

**Contenido del PRD**:
- User Story
- Criterios de aceptación funcionales
- Criterios de aceptación no funcionales
- Contratos de datos (Zod schemas)
- Especificaciones de API endpoints
- Consideraciones de UI/UX
- Consideraciones técnicas (RLS, permisos, performance)

**Output**: `architect/00-master-prd.md` completo

---

### Paso 5: Usuario Aprueba PRD Master

**Acción**: Usuario revisa PRD y confirma que refleja lo esperado

**Checklist de Usuario**:
- [ ] La User Story es correcta
- [ ] Los criterios de aceptación cubren todos los casos
- [ ] La funcionalidad descrita es lo que necesito
- [ ] No hay ambigüedades importantes

**Output**: PRD master aprobado por Usuario

---

### Paso 6: Arquitecto Crea Entities

**Acción**: Arquitecto implementa `entities.ts` con Zod schemas

**Ubicación**: `app/src/features/tasks/entities.ts`

**Ejemplo**:
```typescript
import { z } from 'zod';

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  due_date: z.coerce.date().optional(),
  project_id: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.coerce.date().nullable(),
  project_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Task = z.infer<typeof TaskSchema>;
```

**Output**: Entities implementadas y versionadas en git

---

## Fase 1: Test Agent

### Paso 1.1: Arquitecto Escribe Request

**Acción**: Arquitecto traduce PRD master a requisitos específicos para Test Agent

**Comando**:
```bash
cp PRDs/_templates/agent-request-template.md PRDs/tasks/001-create-task/test-agent/00-request.md
```

**Contenido del request**:
- Context: Por qué Test Agent está trabajando en esto
- Objectives: Crear suite completa de tests que fallan
- Detailed Requirements:
  - Tests unitarios para use case `createTask`
  - Tests de integración para API endpoint `POST /api/tasks`
  - Tests de validación de Zod schemas
  - Tests E2E para flujo de creación de tarea en UI
- Technical Specifications:
  - Mocks de Supabase client
  - Fixtures de datos de prueba
  - Configuración de Vitest y Playwright
- Expected Deliverables:
  - `createTask.test.ts` (use case)
  - `route.test.ts` (API)
  - `create-task.spec.ts` (E2E)
  - Cobertura >90%

**Output**: `test-agent/00-request.md` completo

---

### Paso 1.2: Test Agent Trabaja

**Acción**: Test Agent lee `00-request.md` y crea tests

**Scope de lectura**:
- ✅ `test-agent/00-request.md`
- ✅ `architect/00-master-prd.md` (referencia)
- ✅ `app/src/features/tasks/entities.ts`
- ❌ Otras carpetas de agentes

**Comando**:
```bash
cp PRDs/_templates/agent-iteration-template.md PRDs/tasks/001-create-task/test-agent/01-iteration.md
```

**Test Agent crea**:
- Tests unitarios que fallan (función no existe)
- Tests de integración que fallan (endpoint no existe)
- Tests E2E que fallan (página no existe)
- Mocks configurados
- Fixtures de datos

**Output**: `test-agent/01-iteration.md` documentando todo

---

### Paso 1.3: Test Agent Notifica Completitud

**Acción**: Test Agent actualiza `_status.md` y notifica

**Mensaje**:
```
"Test Agent: Iteración 01 lista para revisión.

Deliverables:
- 25 tests unitarios (todos fallan apropiadamente)
- 8 tests de integración API (todos fallan)
- 3 tests E2E (todos fallan)
- Coverage: 0% (esperado, no hay implementación)

Ubicación: test-agent/01-iteration.md"
```

**Output**: Notificación a Arquitecto + Usuario

---

### Paso 1.4: Arquitecto + Usuario Revisan

**Acción**: Ambos revisan `01-iteration.md`

**Arquitecto verifica**:
- [ ] Tests cubren todos los requisitos de `00-request.md`
- [ ] Tests siguen patrones de TDD correctos
- [ ] Mocks están bien configurados
- [ ] Interfaces de funciones están bien definidas
- [ ] Tests fallan apropiadamente (no errores de sintaxis)
- [ ] Cobertura planificada es >90%

**Usuario verifica**:
- [ ] Tests cubren casos de negocio importantes
- [ ] Tests de E2E reflejan flujos reales de usuario
- [ ] No faltan escenarios críticos

---

### Paso 1.5: Decisión de Aprobación

**Opción A: APROBADO**

**Acción**: Arquitecto documenta aprobación en `01-iteration.md`

```markdown
## Review Status

**Submitted for Review**: 2025-10-24 10:30

### Architect Review
**Date**: 2025-10-24 11:00
**Status**: Approved ✅
**Feedback**:
- Cobertura completa de requisitos
- Tests bien estructurados
- Mocks correctamente configurados
- Listo para fase de implementación

### User Review
**Date**: 2025-10-24 11:15
**Status**: Approved ✅
**Feedback**:
- Tests E2E cubren flujos de usuario correctamente
- No faltan escenarios críticos
```

**Siguiente paso**: Pasar a Fase 2 (Implementer)

---

**Opción B: RECHAZADO**

**Acción**: Arquitecto documenta rechazo con feedback específico

```markdown
## Review Status

**Submitted for Review**: 2025-10-24 10:30

### Architect Review
**Date**: 2025-10-24 11:00
**Status**: Rejected ❌
**Feedback**:
- Falta test para validación de due_date en el pasado
- Tests E2E no cubren caso de error de permisos
- Mock de Supabase no está retornando errores correctamente
- Por favor corregir en iteración 02

### User Review
**Date**: Pendiente (esperando corrección)
**Status**: Pending
```

**Siguiente paso**: Test Agent corrige en `02-iteration.md`

---

### Paso 1.6 (si rechazado): Test Agent Corrige

**Acción**: Test Agent lee feedback y crea `02-iteration.md`

**Comando**:
```bash
cp PRDs/_templates/agent-iteration-template.md PRDs/tasks/001-create-task/test-agent/02-iteration.md
```

**Contenido de `02-iteration.md`**:
```markdown
# Test Agent - Iteration 02

**Based on**: 01-iteration.md feedback
**Date**: 2025-10-24 14:00

## Context and Scope

**What changed from previous iteration**:
- Added test for due_date validation (cannot be in the past)
- Added E2E test for permission error scenario
- Fixed Supabase mock to return errors correctly

## Work Completed

### Changes Made
1. **New test**: `createTask.test.ts` - line 150
   - Test: "should reject task with due_date in the past"

2. **New E2E test**: `create-task.spec.ts` - line 89
   - Scenario: "User without permissions sees error message"

3. **Fixed mock**: `__mocks__/supabase.ts` - line 45
   - Now correctly returns { data: null, error: {...} }

[... resto de documentación ...]
```

**Output**: `02-iteration.md` con correcciones

**Repetir**: Volver a Paso 1.3 (notificar completitud)

---

## Fase 2: Implementer

### Paso 2.1: Arquitecto Escribe Request

**Acción**: Arquitecto traduce requisitos para Implementer

**Comando**:
```bash
cp PRDs/_templates/agent-request-template.md PRDs/tasks/001-create-task/implementer/00-request.md
```

**Contenido del request**:
- Context: Tests están aprobados, ahora implementar lógica
- Objectives: Hacer pasar todos los tests del Test Agent
- Detailed Requirements:
  - Implementar use case `createTask`
  - Implementar API endpoint `POST /api/tasks/route.ts`
  - Validaciones de negocio
  - Autorización (solo miembros del proyecto)
  - Error handling robusto
- Technical Specifications:
  - Orquestar llamadas a servicios (no implementarlos)
  - Interfaces esperadas de servicios de datos
- Limitations:
  - NO implementar servicios de datos (Supabase Agent)
  - NO modificar tests
  - NO modificar entities

**Output**: `implementer/00-request.md`

---

### Paso 2.2 (Opcional): Arquitecto Prepara Handoff

**Acción**: Si Arquitecto decide habilitar paralelismo

**Comando**:
```bash
cp PRDs/_templates/agent-handoff-template.md PRDs/tasks/001-create-task/test-agent/handoff-001.md
```

**Contenido del handoff**:
```markdown
# Handoff - Test Agent to Implementer

**From**: Test Agent
**To**: Implementer
**Purpose**: Permitir que Implementer empiece antes de aprobación final de Test Agent

## Information Transfer

### Function Signatures (from tests)

```typescript
// Defined by tests - Implementer must implement exactly this
export async function createTask(
  input: CreateTaskInput,
  userId: string
): Promise<Task>;
```

### Expected Service Interface

```typescript
// Implementer will need this from Supabase Agent (not implemented yet)
interface TaskService {
  create(data: CreateTaskInput & { created_by: string }): Promise<Task>;
  checkUserCanAccessProject(userId: string, projectId: string): Promise<boolean>;
}
```

## Constraints

- DO NOT modify test signatures
- DO call services through interfaces (will be implemented later)
- DO implement business validations
```

**Output**: `test-agent/handoff-001.md`

---

### Paso 2.3: Implementer Trabaja

**Acción**: Implementer lee request (y handoff si existe) y trabaja

**Scope de lectura**:
- ✅ `implementer/00-request.md`
- ✅ `test-agent/handoff-001.md` (si existe)
- ✅ `architect/00-master-prd.md` (referencia)
- ✅ `app/src/features/tasks/entities.ts`
- ❌ `test-agent/01-iteration.md` (NO PERMITIDO)
- ❌ Otras carpetas de agentes

**Implementer crea**:
```typescript
// app/src/features/tasks/use-cases/createTask.ts
import { CreateTaskInputSchema, type Task } from '../entities';

export async function createTask(
  input: CreateTaskInput,
  userId: string
): Promise<Task> {
  // 1. Validate input
  const validatedInput = CreateTaskInputSchema.parse(input);

  // 2. Validate due_date not in past
  if (validatedInput.due_date && validatedInput.due_date < new Date()) {
    throw new Error('Due date cannot be in the past');
  }

  // 3. Check user can access project (calls service)
  const canAccess = await taskService.checkUserCanAccessProject(
    userId,
    validatedInput.project_id
  );

  if (!canAccess) {
    throw new Error('User does not have access to this project');
  }

  // 4. Create task (calls service)
  const task = await taskService.create({
    ...validatedInput,
    created_by: userId,
  });

  return task;
}
```

**Output**: `implementer/01-iteration.md` documentando implementación

---

### Paso 2.4-2.6: Mismo Proceso de Revisión

[Repetir pasos 1.3 a 1.6 con Implementer]

---

## Fase 3: Supabase Agent

### Paso 3.1: Arquitecto Escribe Request

**Contenido del request**:
- Objectives: Implementar servicios de datos puros
- Detailed Requirements:
  - Implementar `taskService.create()`
  - Implementar `taskService.checkUserCanAccessProject()`
  - Crear migración SQL para tabla `tasks`
  - Crear políticas RLS para multi-tenant
  - Crear índices para performance
- Technical Specifications:
  - Usar `rls-migration-template.md`
  - Consultar Context7 ANTES de RLS
  - Ejecutar `/validate-rls` después de migración

**Output**: `supabase-agent/00-request.md`

---

### Paso 3.2-3.6: Mismo Proceso Iterativo

[Repetir pasos 1.2 a 1.6 con Supabase Agent]

**Supabase Agent crea**:
- Migración SQL
- Políticas RLS
- Servicios de datos (`task.service.ts`)
- Optimizaciones de queries

---

## Fase 4: UI/UX Expert

### Paso 4.1: Arquitecto Escribe Request

**Contenido del request**:
- Objectives: Implementar UI que pase tests E2E
- Detailed Requirements:
  - Crear página `/tasks/new`
  - Crear componente `CreateTaskForm`
  - Integrar con API usando TanStack Query
  - Implementar validaciones en tiempo real
  - Accessibility (WCAG 2.1 AA)
  - Responsive design
- Technical Specifications:
  - Usar shadcn/ui components
  - Tailwind CSS para estilos
  - next-intl para i18n

**Output**: `ui-ux-expert/00-request.md`

---

### Paso 4.2-4.6: Mismo Proceso Iterativo

[Repetir pasos 1.2 a 1.6 con UI/UX Expert]

**UI/UX Expert crea**:
- React components
- Páginas Next.js
- Estilos con Tailwind
- Tests E2E pasando

---

## Proceso de Revisión

### Checklist del Arquitecto

```markdown
## Revisión Técnica

### Arquitectura
- [ ] Sigue Clean Architecture (capas correctas)
- [ ] No viola límites entre capas
- [ ] Dependencias apuntan hacia adentro

### Tech Stack
- [ ] Solo usa tecnologías canónicas
- [ ] No hay Jest, useEffect para fetching, CSS tradicional, etc.

### Calidad de Código
- [ ] Código es legible y mantenible
- [ ] Decisiones técnicas están justificadas
- [ ] Error handling es robusto
- [ ] Performance es aceptable

### Documentación
- [ ] Iteración documenta todo el trabajo
- [ ] Decisiones técnicas están explicadas
- [ ] Evidencias están presentes (tests, screenshots)
- [ ] Artefactos están listados

### Cumplimiento
- [ ] Cumple todos los objetivos de 00-request.md
- [ ] Cumple criterios de aceptación del PRD master
- [ ] No hay atajos o soluciones temporales
```

---

### Checklist del Usuario

```markdown
## Revisión de Negocio

### Funcionalidad
- [ ] Comportamiento es el esperado
- [ ] Casos de uso están cubiertos
- [ ] No faltan escenarios importantes

### UX (si UI)
- [ ] Interfaz es intuitiva
- [ ] Mensajes de error son claros
- [ ] Flujo es fluido y lógico
- [ ] Performance es aceptable para usuarios

### Calidad General
- [ ] Cumple expectativas de negocio
- [ ] No hay problemas evidentes
- [ ] Listo para producción
```

---

## Manejo de Rechazos

### Feedback Específico y Accionable

**❌ Feedback malo**:
```
"No me gusta, hazlo mejor"
"Hay problemas de calidad"
"Faltan cosas"
```

**✅ Feedback bueno**:
```
"Falta test para validación de due_date en el pasado.
Ubicación esperada: createTask.test.ts línea ~150
Escenario: createTask({ due_date: '2020-01-01' }) debe lanzar error"

"Tests E2E no cubren caso cuando usuario no tiene permisos.
Añadir test en create-task.spec.ts:
1. Login como user sin permisos
2. Intentar crear tarea
3. Verificar mensaje de error aparece"
```

---

### Proceso de Corrección

```
1. Agente lee feedback específico
   ↓
2. Agente identifica exactamente qué corregir
   ↓
3. Agente crea NUEVA iteración (no edita anterior)
   ↓
4. En nueva iteración, documenta:
   - Qué cambió vs iteración anterior
   - Por qué cambió (basado en feedback)
   - Evidencia de que está corregido
   ↓
5. Agente notifica completitud de nueva iteración
   ↓
6. Arquitecto + Usuario revisan SOLO nueva iteración
   ↓
7. Aprobado o nuevo rechazo
```

---

## Handoffs para Paralelismo

### Escenario: Test Agent → Implementer

**Situación**:
- Test Agent en iteración 01 (aún no aprobado)
- Interfaces de funciones están estables
- Arquitecto decide habilitar paralelismo

**Paso 1**: Arquitecto crea handoff
```bash
cp PRDs/_templates/agent-handoff-template.md PRDs/tasks/001-create-task/test-agent/handoff-001.md
```

**Paso 2**: Implementer puede leer:
- `implementer/00-request.md` (obligatorio)
- `test-agent/handoff-001.md` (opcional, permitido)

**Paso 3**: Implementer empieza a trabajar MIENTRAS Test Agent corrige iteración 02

**Paso 4**: Si interfaces cambian en iteración 02:
- Arquitecto actualiza `test-agent/handoff-002.md`
- Arquitecto notifica a Implementer
- Implementer ajusta su código

**Ventaja**: Acelera entrega sin comprometer calidad

---

## Resumen del Flujo

```
┌──────────┐
│ Usuario  │──────┐
└──────────┘      │
                   ▼
┌──────────────────────────────────┐
│ Arquitecto                        │
│ - Escribe PRD master              │
│ - Escribe 00-request.md (agentes) │
│ - Revisa iteraciones              │
│ - Aprueba/Rechaza                 │
│ - Coordina handoffs               │
└──────────────────────────────────┘
         │         │         │         │
         ▼         ▼         ▼         ▼
    ┌────────┬────────┬────────┬────────┐
    │ Test   │Impl.   │Supabase│UI/UX   │
    │ Agent  │        │ Agent  │ Expert │
    └────────┴────────┴────────┴────────┘
         │         │         │         │
         ▼         ▼         ▼         ▼
    XX-iteration.md (versioned, immutable)
         │         │         │         │
         ▼         ▼         ▼         ▼
    Arquitecto + Usuario REVISAN
         │         │         │         │
         ▼         ▼         ▼         ▼
    ¿Aprobado? → Sí → Continuar
         │
         No → Nueva iteración
```

---

**Versión**: 2.0
**Última Actualización**: 2025-10-24
**Mantenedor**: Architect Agent
