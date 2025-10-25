# Guía de Uso del Sistema de PRDs - ITERATIVE EDITION

**Versión**: 2.0 (Sistema Iterativo)
**Fecha**: 2025-10-24
**Estado**: Activo

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Cambios Fundamentales vs v1.0](#cambios-fundamentales-vs-v10)
3. [Estructura del Sistema](#estructura-del-sistema)
4. [Flujo de Trabajo Iterativo](#flujo-de-trabajo-iterativo)
5. [Roles y Responsabilidades](#roles-y-responsabilidades)
6. [Templates Disponibles](#templates-disponibles)
7. [Convenciones de Naming](#convenciones-de-naming)
8. [Proceso Detallado por Fase](#proceso-detallado-por-fase)
9. [Sistema de Aprobaciones](#sistema-de-aprobaciones)
10. [Handoffs y Paralelismo](#handoffs-y-paralelismo)
11. [Troubleshooting](#troubleshooting)
12. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Introducción

### ¿Qué es el Sistema de PRDs Iterativo?

Este sistema mantiene organización, trazabilidad y calidad en el desarrollo de features mediante un **flujo iterativo** con **revisión arquitectónica obligatoria** en cada fase.

### Objetivos Principales

- **Calidad sobre Velocidad**: Cada iteración se revisa antes de avanzar
- **Aislamiento de Agentes**: Cada agente trabaja solo en su carpeta, sin interferencias
- **Arquitecto como Coordinador**: Único punto de traducción de información entre agentes
- **Trazabilidad Completa**: Versiones incrementales documentan toda la evolución
- **Paralelismo Controlado**: Handoffs opcionales permiten trabajo simultáneo cuando es seguro

---

## Cambios Fundamentales vs v1.0

### ❌ Sistema Antiguo (v1.0)

```
Usuario → Arquitecto (escribe 00-master-prd.md)
    ↓
Test Agent (escribe 02-test-spec.md) → Automático
    ↓
Implementer (escribe 03-implementation-spec.md) → Automático
    ↓
Supabase Agent (escribe 01-supabase-spec.md) → Automático
    ↓
UI/UX Expert (escribe 04-ui-spec.md) → Automático
```

**Problemas**:
- ❌ Flujo lineal sin revisión intermedia
- ❌ Errores se detectan al final
- ❌ Agentes leen documentos de otros agentes (acoplamiento)
- ❌ Cada agente escribe su propio "spec" (redundancia)

### ✅ Sistema Nuevo (v2.0)

```
Usuario ←→ Arquitecto (escribe architect/00-master-prd.md)
            ↓
            Arquitecto escribe test-agent/00-request.md
            ↓
            Test Agent trabaja → 01-iteration.md
            ↓
            Arquitecto + Usuario REVISAN
            ↓
         ¿Aprobado?
         ↙️      ↘️
      SÍ          NO
       ↓          ↓
    Continuar   Test Agent corrige → 02-iteration.md
                ↓
                Volver a revisión
```

**Beneficios**:
- ✅ Revisión obligatoria en cada fase
- ✅ Errores se detectan inmediatamente
- ✅ Agentes aislados (solo leen su carpeta)
- ✅ Solo Arquitecto escribe PRDs/requests
- ✅ Versiones incrementales (historial completo)
- ✅ Paralelismo opcional y seguro

---

## Estructura del Sistema

### Directorio Completo

```
PRDs/
├── _templates/                          # Templates reutilizables
│   ├── 00-master-prd-template.md       # Solo Arquitecto
│   ├── agent-request-template.md       # Arquitecto escribe 00-request.md
│   ├── agent-iteration-template.md     # Agentes usan para XX-iteration.md
│   ├── agent-handoff-template.md       # Handoffs opcionales
│   ├── rls-migration-template.md       # Template SQL técnico
│   └── _status-template.md             # Status unificado
│
├── _examples/
│   ├── 001-example-task-comments/      # Ejemplo OLD (v1.0)
│   └── 002-iterative-example/          # Ejemplo NEW (v2.0) ⭐
│       ├── architect/
│       │   └── 00-master-prd.md
│       ├── test-agent/
│       │   ├── 00-request.md
│       │   ├── 01-iteration.md
│       │   ├── 02-iteration.md         # Ejemplo de corrección
│       │   └── handoff-001.md
│       ├── implementer/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       ├── supabase-agent/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       ├── ui-ux-expert/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       └── _status.md
│
├── tasks/                               # Dominio: tasks
│   └── 001-create-task/
│       ├── architect/
│       │   └── 00-master-prd.md
│       ├── test-agent/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       ├── implementer/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       ├── supabase-agent/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       ├── ui-ux-expert/
│       │   ├── 00-request.md
│       │   └── 01-iteration.md
│       └── _status.md
│
├── auth/                                # Dominio: auth
│   └── 001-user-login/
│       └── [misma estructura]
│
├── GUIA-USO-PRD.md                      # Esta guía
├── WORKFLOW-ITERATIVO.md                # Workflow detallado ⭐
└── EJEMPLOS-ITERACIONES.md              # Ejemplos prácticos ⭐
```

### Anatomía de una Feature

```
[domain]/[number]-[feature-name]/
├── architect/                # ⭐ Solo Arquitecto escribe aquí
│   └── 00-master-prd.md     # ÚNICO PRD de la feature
│
├── test-agent/               # ⭐ Solo Test Agent trabaja aquí
│   ├── 00-request.md        # Arquitecto escribe requirements
│   ├── 01-iteration.md      # Test Agent: primera entrega
│   ├── 02-iteration.md      # Test Agent: correcciones (si rechazado)
│   ├── 03-iteration.md      # Test Agent: más correcciones (si necesario)
│   └── handoff-001.md       # Opcional: handoff a Implementer
│
├── implementer/              # ⭐ Solo Implementer trabaja aquí
│   ├── 00-request.md        # Arquitecto escribe requirements
│   ├── 01-iteration.md      # Implementer: primera entrega
│   └── handoff-001.md       # Opcional: handoff a Supabase
│
├── supabase-agent/           # ⭐ Solo Supabase Agent trabaja aquí
│   ├── 00-request.md        # Arquitecto escribe requirements
│   ├── 01-iteration.md      # Supabase: primera entrega
│   └── handoff-001.md       # Opcional: handoff a UI/UX
│
├── ui-ux-expert/             # ⭐ Solo UI/UX Expert trabaja aquí
│   ├── 00-request.md        # Arquitecto escribe requirements
│   └── 01-iteration.md      # UI/UX: primera entrega
│
└── _status.md                # Status UNIFICADO de toda la feature
```

---

## Flujo de Trabajo Iterativo

### Fase 0: Inicio (Usuario ←→ Arquitecto)

```
1. Usuario describe requisito
   ↓
2. Arquitecto clarifica (hace preguntas)
   ↓
3. Arquitecto crea estructura:
   mkdir -p PRDs/domain/XXX-feature/{architect,test-agent,implementer,supabase-agent,ui-ux-expert}
   ↓
4. Arquitecto escribe architect/00-master-prd.md
   ↓
5. Usuario aprueba PRD master
   ↓
6. Arquitecto crea entities.ts
```

### Fase 1: Test Agent (Iterativo)

```
1. Arquitecto escribe test-agent/00-request.md
   (traduce del PRD master lo que Test Agent necesita)
   ↓
2. Test Agent lee SOLO su carpeta (test-agent/)
   ↓
3. Test Agent trabaja y crea 01-iteration.md
   ↓
4. Test Agent notifica: "Iteración lista para revisión"
   ↓
5. Arquitecto + Usuario revisan 01-iteration.md
   ↓
6. ¿Aprobado?
      ├─ SÍ → Fase 2 (Implementer)
      └─ NO → Test Agent corrige en 02-iteration.md
              Volver a paso 5
```

### Fase 2: Implementer (Iterativo)

```
1. Arquitecto escribe implementer/00-request.md
   ↓
2. (Opcional) Arquitecto prepara test-agent/handoff-001.md
   para permitir que Implementer vea interfaces de tests
   ↓
3. Implementer lee:
   - implementer/00-request.md (obligatorio)
   - test-agent/handoff-001.md (si existe)
   ↓
4. Implementer trabaja y crea 01-iteration.md
   ↓
5. Implementer notifica: "Iteración lista para revisión"
   ↓
6. Arquitecto + Usuario revisan
   ↓
7. ¿Aprobado?
      ├─ SÍ → Fase 3 (Supabase)
      └─ NO → Implementer corrige en 02-iteration.md
```

### Fase 3: Supabase Agent (Iterativo)

[Mismo patrón que Fase 2]

### Fase 4: UI/UX Expert (Iterativo - Final)

[Mismo patrón que Fase 2]

**Resultado Final**: Feature completa, revisada y aprobada en CADA fase.

---

## Roles y Responsabilidades

### 🏗️ Arquitecto (Coordinator & Reviewer)

**Responsabilidades NUEVAS**:
- ✅ Escribir ÚNICO PRD master (`architect/00-master-prd.md`)
- ✅ Escribir `00-request.md` para CADA agente
- ✅ Revisar y aprobar/rechazar CADA iteración de CADA agente
- ✅ Traducir información entre agentes (agentes NO se comunican directamente)
- ✅ Decidir cuándo habilitar handoffs para paralelismo
- ✅ Mantener coherencia entre todas las fases
- ✅ Actualizar `_status.md` con decisiones de aprobación

**Herramientas**:
- Template: `00-master-prd-template.md`
- Template: `agent-request-template.md`
- Template: `agent-handoff-template.md` (opcional)

**Limitaciones**:
- ❌ NUNCA implementar lógica de negocio, servicios, componentes, tests
- ❌ NUNCA aprobar trabajo sin revisión exhaustiva con Usuario
- ❌ NUNCA permitir que agentes lean carpetas de otros agentes

---

### 🧪 Test Agent

**Responsabilidades NUEVAS**:
- ✅ Leer SOLO `test-agent/` folder
- ✅ Empezar desde `00-request.md` escrito por Arquitecto
- ✅ Crear `01-iteration.md` con suite de tests que fallan
- ✅ Si rechazado, corregir en `02-iteration.md`, `03-iteration.md`...
- ✅ (Opcional) Preparar `handoff-001.md` si Arquitecto lo solicita

**Herramientas**:
- Lee: `test-agent/00-request.md`
- Escribe: `test-agent/XX-iteration.md`
- Template: `agent-iteration-template.md`

**Limitaciones**:
- ❌ NO leer otras carpetas (salvo handoffs permitidos)
- ❌ NO modificar tests una vez aprobados
- ❌ NO avanzar sin aprobación explícita

---

### ⚙️ Implementer Agent

[Mismo patrón que Test Agent]

### 🗄️ Supabase Agent

[Mismo patrón que Test Agent]

### 🎨 UI/UX Expert Agent

[Mismo patrón que Test Agent]

---

## Templates Disponibles

### 1. `00-master-prd-template.md`

**Usado por**: SOLO Arquitecto
**Propósito**: PRD único y completo de la feature
**Ubicación**: `architect/00-master-prd.md`

**Secciones clave**:
- User Story y contexto
- Criterios de aceptación
- Contratos de datos (Zod schemas)
- API endpoints
- Consideraciones técnicas

---

### 2. `agent-request-template.md`

**Usado por**: SOLO Arquitecto
**Propósito**: Traducir requirements del PRD master para cada agente
**Ubicación**: `{agent}/00-request.md`

**Secciones clave**:
- Context (por qué este agente está trabajando)
- Objectives (qué debe lograr)
- Detailed Requirements
- Technical Specifications
- Limitations and Constraints
- Expected Deliverables
- Quality Checklist

---

### 3. `agent-iteration-template.md`

**Usado por**: Todos los agentes (Test, Implementer, Supabase, UI/UX)
**Propósito**: Documentar trabajo de cada iteración
**Ubicación**: `{agent}/XX-iteration.md`

**Secciones clave**:
- Context and Scope
- Work Completed
- Technical Decisions
- Blockers Encountered and Resolved
- Artifacts and Deliverables
- Evidence and Validation (tests, screenshots, metrics)
- Coverage Against Requirements
- Next Steps
- Quality Checklist
- Review Status (Arquitecto + Usuario)

---

### 4. `agent-handoff-template.md`

**Usado por**: SOLO Arquitecto
**Propósito**: Habilitar paralelismo seguro entre agentes
**Ubicación**: `{source-agent}/handoff-XXX.md`

**Secciones clave**:
- Important Notice (permisos de lectura)
- Context (por qué handoff)
- Information Transfer (qué puede usar el siguiente agente)
- Constraints (qué NO debe hacer)
- Coordination Points
- Verification Checklist

**Ejemplo de uso**:
```
Arquitecto prepara: test-agent/handoff-001.md
Implementer lee: test-agent/handoff-001.md
    (pero NO lee test-agent/01-iteration.md directamente)
```

---

### 5. `rls-migration-template.md`

**Usado por**: Supabase Agent
**Propósito**: Template SQL para políticas RLS
**Ubicación**: Migraciones SQL

(Técnico, no es PRD)

---

### 6. `_status-template.md`

**Usado por**: Arquitecto (actualiza), Todos leen
**Propósito**: Status unificado de toda la feature
**Ubicación**: `_status.md` (raíz de feature)

**Secciones clave**:
- Estado general de feature
- Estado por agente (Not Started, In Progress, In Review, Approved, Rejected)
- Iteraciones completadas por agente
- Decisiones de aprobación
- Bloqueadores activos
- Próximos pasos

---

## Convenciones de Naming

### Identificadores de Feature
- **Formato**: `[domain]-[number]`
- **Ejemplos**: `tasks-001`, `auth-003`, `projects-002`

### Directorios de Feature
- **Formato**: `[number]-[feature-name-kebab-case]`
- **Ejemplos**: `001-create-task`, `002-user-login`, `003-task-comments`

### Carpetas de Agentes
- **Nombres fijos**: `architect/`, `test-agent/`, `implementer/`, `supabase-agent/`, `ui-ux-expert/`

### Archivos de Agentes
- **Request**: Siempre `00-request.md` (Arquitecto escribe)
- **Iterations**: `01-iteration.md`, `02-iteration.md`, `03-iteration.md`...
- **Handoffs**: `handoff-001.md`, `handoff-002.md`...
- **PRD Master**: Siempre `00-master-prd.md` (solo en `architect/`)

---

## Proceso Detallado por Fase

### Comandos Útiles

```bash
# 1. Crear estructura completa de feature
mkdir -p PRDs/tasks/001-create-task/{architect,test-agent,implementer,supabase-agent,ui-ux-expert}

# 2. Arquitecto: Copiar template de PRD master
cp PRDs/_templates/00-master-prd-template.md PRDs/tasks/001-create-task/architect/00-master-prd.md

# 3. Arquitecto: Copiar template de request para Test Agent
cp PRDs/_templates/agent-request-template.md PRDs/tasks/001-create-task/test-agent/00-request.md

# 4. Test Agent: Copiar template de iteración
cp PRDs/_templates/agent-iteration-template.md PRDs/tasks/001-create-task/test-agent/01-iteration.md

# 5. (Opcional) Arquitecto: Copiar template de handoff
cp PRDs/_templates/agent-handoff-template.md PRDs/tasks/001-create-task/test-agent/handoff-001.md

# 6. Ver status
cat PRDs/tasks/001-create-task/_status.md
```

---

## Sistema de Aprobaciones

### Estados Posibles de una Iteración

| Estado | Descripción | Siguiente Paso |
|--------|-------------|----------------|
| **In Progress** | Agente trabajando | Esperar notificación de agente |
| **Ready for Review** | Agente notificó completitud | Arquitecto + Usuario revisan |
| **Approved** | Aprobado por Arquitecto + Usuario | Continuar siguiente fase |
| **Rejected** | No cumple requisitos | Agente corrige en nueva iteración |

### Criterios de Aprobación

**Arquitecto evalúa**:
- ✅ Cumple todos los objetivos de `00-request.md`
- ✅ Sigue Clean Architecture
- ✅ Usa solo tech stack canónico
- ✅ Documentación completa
- ✅ Decisiones técnicas justificadas

**Usuario evalúa**:
- ✅ Cumple expectativas de negocio
- ✅ UX es aceptable (si UI)
- ✅ Performance es adecuada

### Proceso de Rechazo

```
1. Arquitecto + Usuario identifican problemas específicos
   ↓
2. Arquitecto documenta feedback claro en iteración
   (sección "Review Status")
   ↓
3. Agente lee feedback y corrige
   ↓
4. Agente crea NUEVA iteración (02-, 03-...)
   ↓
5. Agente notifica: "Iteración X lista para revisión"
   ↓
6. Repetir revisión
```

**Importante**:
- ❌ NO editar iteraciones anteriores
- ✅ Crear nueva iteración con correcciones
- ✅ Documentar qué cambió vs iteración anterior

---

## Handoffs y Paralelismo

### ¿Cuándo Usar Handoffs?

**Usar handoff SI**:
- Trabajo del siguiente agente puede empezar antes de aprobación final
- Interfaces están suficientemente estables
- Paralelismo acelera entrega sin riesgo

**NO usar handoff SI**:
- Trabajo del agente anterior aún puede cambiar mucho
- Dependencias son muy acopladas
- Riesgo de retrabajo es alto

### Ejemplo de Handoff

```
Escenario: Test Agent ha definido interfaces estables

1. Arquitecto prepara:
   test-agent/handoff-001.md

2. Handoff contiene:
   - Interfaces de funciones (signatures)
   - Contratos de datos (schemas)
   - Tests que deben pasar

3. Implementer lee:
   - implementer/00-request.md (obligatorio)
   - test-agent/handoff-001.md (opcional, permitido)

4. Implementer puede empezar MIENTRAS Test Agent itera correcciones

5. Si Test Agent es rechazado y interfaces cambian:
   - Arquitecto actualiza handoff-001.md → handoff-002.md
   - Notifica a Implementer del cambio
```

### Reglas de Handoffs

1. **Solo Arquitecto prepara handoffs**
2. **Handoffs son read-only para agentes receptores**
3. **Handoffs se versionan** (handoff-001, handoff-002)
4. **Handoffs NO reemplazan `00-request.md`** (son complementarios)
5. **Agentes NO pueden solicitar handoffs** (solo Arquitecto decide)

---

## Troubleshooting

### Problema: "Agente leyó carpeta de otro agente"

**Solución**:
- ❌ PROHIBIDO: Agentes solo leen su carpeta
- ✅ Arquitecto debe preparar handoff si información es necesaria
- ✅ Rechazar trabajo del agente y corregir

### Problema: "Agente modificó iteración anterior"

**Solución**:
- ❌ PROHIBIDO: Iteraciones son inmutables
- ✅ Crear nueva iteración (XX+1)
- ✅ Documentar cambios vs iteración anterior

### Problema: "No sé si aprobar o rechazar"

**Solución**:
1. Revisar checklist de `XX-iteration.md`
2. Verificar contra `00-request.md`
3. Consultar PRD master `architect/00-master-prd.md`
4. Si hay duda, rechazar con feedback específico (mejor rechazar que aprobar con dudas)

### Problema: "Handoff quedó desactualizado"

**Solución**:
1. Arquitecto crea handoff-00X+1.md
2. Arquitecto notifica a agente receptor
3. Agente receptor ajusta su trabajo según nuevo handoff

---

## Ejemplos Prácticos

Ver documentos complementarios:

1. **PRDs/WORKFLOW-ITERATIVO.md**: Workflow paso a paso completo
2. **PRDs/EJEMPLOS-ITERACIONES.md**: Ejemplos reales de iteraciones
3. **PRDs/_examples/002-iterative-example/**: Feature completa de ejemplo

---

## Resumen: Reglas de Oro

1. **SOLO Arquitecto escribe PRDs master**
2. **Agentes trabajan en AISLAMIENTO** (solo su carpeta)
3. **CADA iteración se REVISA antes de avanzar**
4. **Iteraciones son INMUTABLES** (no editar, crear nueva)
5. **Handoffs son OPCIONALES** (Arquitecto decide)
6. **Status es UNIFICADO** (un solo `_status.md` por feature)
7. **NO assumptions** (si hay duda, preguntar a Arquitecto)

---

**Versión**: 2.0
**Última Actualización**: 2025-10-24
**Próxima Revisión**: Después de implementar primera feature con v2.0
**Mantenedor**: Architect Agent
