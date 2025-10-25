# Plan de Refactorización: Agentes + Skills según Mejores Prácticas Anthropic

**Versión**: 1.0
**Fecha**: 2025-10-24
**Estado**: Draft - En Iteración

---

## 📋 Visión General (Validada con Docs Oficiales)

**Arquitectura Híbrida Oficial**:
- **Agent .md**: Identidad mínima + invocación obligatoria de skill
- **Skill**: Workflow técnico completo en SKILL.md
- **References**: Docs modulares cargados bajo demanda (práctica oficial)
- **Scripts**: Automatizaciones opcionales
- **Assets**: Templates, archivos de salida

---

## 🎯 Estructura Propuesta (Siguiendo Anthropic Standards)

```
.claude/
├── agents/
│   ├── architect-agent.md              # ~150 líneas (identidad + "Skill: architect-skill")
│   ├── test-architect.md               # ~150 líneas
│   ├── implementer-agent.md            # ~150 líneas
│   ├── supabase-data-specialist.md     # ~150 líneas
│   ├── ui-ux-expert.md                 # ~150 líneas
│   └── README-ITERATIVE-V2.md          # (sin cambios)
│
└── skills/
    ├── architect-skill/
    │   ├── SKILL.md                    # Workflow principal
    │   ├── references/                 # Docs cargados bajo demanda
    │   │   ├── entity-design-patterns.md
    │   │   ├── prd-checklist.md
    │   │   ├── supabase-mcp-workflow.md
    │   │   └── context7-queries.md     # Queries predefinidas
    │   └── scripts/
    │       └── validate-prd.sh         # Opcional
    │
    ├── test-architect-skill/
    │   ├── SKILL.md
    │   ├── references/
    │   │   ├── vitest-best-practices.md
    │   │   ├── playwright-e2e-patterns.md
    │   │   ├── mocking-strategies.md
    │   │   ├── zod-test-patterns.md    # Específico para testing
    │   │   └── context7-queries.md
    │   └── scripts/
    │       └── coverage-validator.sh
    │
    ├── implementer-skill/
    │   ├── SKILL.md
    │   ├── references/
    │   │   ├── use-case-patterns.md
    │   │   ├── clean-architecture-boundaries.md
    │   │   ├── error-handling-strategies.md
    │   │   ├── zod-runtime-validation.md
    │   │   ├── tanstack-query-patterns.md
    │   │   └── context7-queries.md
    │
    ├── supabase-skill/
    │   ├── SKILL.md
    │   ├── references/
    │   │   ├── rls-policy-patterns.md  # Con ejemplos comunes
    │   │   ├── query-optimization.md
    │   │   ├── migration-best-practices.md
    │   │   ├── supabase-mcp-workflows.md
    │   │   └── context7-queries.md     # CRÍTICO: queries RLS
    │   └── scripts/
    │       └── validate-rls.sh
    │
    ├── ui-ux-skill/
    │   ├── SKILL.md
    │   ├── references/
    │   │   ├── shadcn-component-library.md
    │   │   ├── tailwind-utility-patterns.md
    │   │   ├── accessibility-wcag-checklist.md
    │   │   ├── chrome-devtools-workflows.md
    │   │   ├── tanstack-query-ui-patterns.md
    │   │   ├── next-intl-i18n-patterns.md
    │   │   └── context7-queries.md
    │   └── assets/
    │       └── style-guide-reference.md
    │
    ├── skill-creator/                  # Ya existe
    │   └── SKILL.md
    │
    └── rbac-permissions-architect/     # Ya existe
        ├── SKILL.md
        └── references/
```

**CLAVE**: NO hay carpeta `shared/`. Cada skill tiene SUS references, pero pueden duplicarse intencionalmente para:
1. **Contexto específico**: Zod para testing ≠ Zod para validación runtime
2. **Carga bajo demanda**: Solo se cargan las refs necesarias para esa skill
3. **Mantenibilidad**: Cada skill es autocontenida

---

## 📝 Template de Agent .md (MINIMAL ~150 líneas)

```markdown
---
name: {agent-name}
description: Use this agent when {trigger}. Specializes in {expertise}. Examples: [...]
model: sonnet
color: {color}
---

# IDENTITY & ROLE

You are the **{Title}**—{one-sentence mission}.

## Core Mission

{2-3 paragraph explanation of role}

## Authority & Boundaries

**YOU ARE THE ONLY AGENT AUTHORIZED TO**:
- {Responsibility 1}
- {Responsibility 2}
- {Responsibility 3}

**YOU ARE STRICTLY PROHIBITED FROM**:
- {Prohibition 1}
- {Prohibition 2}
- {Prohibition 3}

---

# ITERATIVE WORKFLOW v2.0

## Your Workspace

**Isolated folder**: `PRDs/{domain}/{feature}/{agent-name}/`

**Files YOU read**:
- ✅ `{agent-name}/00-request.md` (Architect writes)
- ✅ `architect/00-master-prd.md` (reference)
- ✅ Handoffs if enabled

**Files you CANNOT read**:
- ❌ Other agent folders

---

# 🎯 MANDATORY SKILL INVOCATION

**CRITICAL**: Before ANY work, invoke your technical skill:

```
Skill: {agent-name}-skill
```

**The skill provides**:
- ✅ Step-by-step technical procedures
- ✅ Context7 consultation checkpoints (MANDATORY phases)
- ✅ MCP integration workflows
- ✅ Technology-specific references (loaded on demand)
- ✅ Code patterns and best practices

**This skill is NOT optional—it is your complete technical manual.**

---

# QUICK REFERENCE

**Triggers**: {When to use}
**Deliverables**: {What you produce}
**Success metrics**: {How to measure}

---

**Complete technical guide**: `.claude/skills/{agent-name}-skill/SKILL.md`
```

**Reducción**: De ~2000 líneas a ~150 líneas ✅

---

## 📘 Template de SKILL.md (Siguiendo Anthropic Spec)

```markdown
---
name: {agent-name}-skill
description: Comprehensive technical manual for {Agent Name}. Provides workflows, Context7 checkpoints, MCP integration, and on-demand reference documentation.
---

# {Agent Name} - Technical Operations Manual

**Version**: 1.0
**Last Updated**: {date}
**Maintained by**: Architect Agent

---

## 📚 What This Skill Provides

This skill is your complete technical guide. It includes:

- **Phased Workflow**: Step-by-step procedures with mandatory checkpoints
- **Context7 Integration**: When and how to query latest docs
- **MCP Workflows**: How to use available MCPs for your tasks
- **Reference Docs**: On-demand documentation (see `references/` folder)
- **Quality Standards**: Checklists and validation criteria

---

## 🔄 Workflow Phases

### Phase 0: Pre-Flight Preparation

**MANDATORY CHECKPOINT: Context7 Research**

Before starting implementation, you MUST consult latest documentation:

**Technologies to verify**:
- {Technology 1}: Breaking changes, latest API
- {Technology 2}: New patterns, deprecations
- {Technology 3}: Best practices updates

**How to query**:
```bash
# Resolve library ID first
Context7: resolve-library-id "{library-name}"

# Then get targeted docs
Context7: get-library-docs "{library-id}" topic="{specific-topic}"
```

**Examples** (adapt to your context):
```bash
Context7: resolve-library-id "vitest"
# Returns: /vitest-dev/vitest

Context7: get-library-docs "/vitest-dev/vitest" topic="mocking modules vi.mock"
```

**Decision Point**: Based on research, choose implementation approach

**Reference**: See `references/context7-queries.md` for query library

---

### Phase 1: {Agent-Specific Work Phase 1}

**Objective**: {What to accomplish}

**Procedure**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**MCP Integration** (if applicable):
```bash
# Example: Supabase Agent uses Supabase MCP
mcp.supabase.execute_sql({ query: "SELECT * FROM pg_policies" })
```

**Reference**: See `references/{specific-topic}.md` for detailed patterns

---

### Phase 2: {Agent-Specific Work Phase 2}

**Objective**: {What to accomplish}

**Procedure**:
1. {Step 1}
2. {Step 2}

**CHECKPOINT: Context7 Consultation (conditional)**

If encountering issues or uncertainty:
- Query Context7 for troubleshooting
- Check for bug fixes or workarounds
- Verify you're not using deprecated patterns

**Reference**: See `references/{another-topic}.md`

---

### Phase 3: Validation & Quality Check

**Quality Checklist**:
- [ ] All Context7 checkpoints completed
- [ ] MCP tools used where applicable
- [ ] Reference patterns followed
- [ ] Tests pass (if applicable)
- [ ] Documentation complete

**FINAL CHECKPOINT: Context7 (if needed)**

Before finalizing:
- Verify best practices compliance
- Check for any missed patterns

---

## 📖 Available References

**On-Demand Documentation** (in `references/` folder):

| Reference | Purpose | When to Use |
|-----------|---------|-------------|
| `{topic-1}.md` | {Description} | {Trigger} |
| `{topic-2}.md` | {Description} | {Trigger} |
| `context7-queries.md` | Pre-built Context7 queries | Always consult first |

**How to use references**:
1. Identify which reference matches your current task
2. Read the reference for patterns and examples
3. Apply the patterns to your specific context
4. Consult Context7 if reference is outdated or incomplete

---

## 🔧 MCP Workflows

### {MCP Name} Integration

**When to use**: {Trigger condition}

**Available Tools**:
- `{mcp-tool-1}`: {Description}
- `{mcp-tool-2}`: {Description}

**Workflow Example**:
```typescript
// Step 1: Check current state
const current = await mcp.{tool}.{action}()

// Step 2: Analyze
if (current.needs_update) {
  // Step 3: Execute
  await mcp.{tool}.{update_action}(params)
}
```

**Reference**: See `references/{mcp}-workflows.md` for complete guide

---

## 🎯 Context7 Query Library

**Pre-built queries for common scenarios**:

### Scenario 1: Getting Started
```bash
Context7: get-library-docs "{library-id}" topic="getting started setup"
```

### Scenario 2: Troubleshooting
```bash
Context7: get-library-docs "{library-id}" topic="{error-message-keyword}"
```

### Scenario 3: Best Practices
```bash
Context7: get-library-docs "{library-id}" topic="best practices production"
```

**Full query library**: `references/context7-queries.md`

---

## ✅ Quality Standards

**Before completing your iteration**:

### Technical Quality
- [ ] Code follows Clean Architecture boundaries
- [ ] No prohibited technologies used
- [ ] Proper error handling implemented

### Documentation Quality
- [ ] All work documented in `XX-iteration.md`
- [ ] Technical decisions explained
- [ ] Blockers and resolutions noted

### Process Quality
- [ ] Context7 consulted at mandatory checkpoints
- [ ] MCP tools leveraged appropriately
- [ ] Reference patterns applied correctly

---

## 🚫 Common Mistakes to Avoid

**DON'T**:
- ❌ Skip Context7 mandatory checkpoints
- ❌ Use outdated patterns without verification
- ❌ Ignore available MCP tools
- ❌ Work outside your authorized boundaries

**DO**:
- ✅ Always verify latest docs before implementing
- ✅ Follow reference patterns as baseline
- ✅ Leverage MCPs for context gathering
- ✅ Document every decision made

---

## 💡 Pro Tips

1. **Context7 Strategy**: Query early and often, but targeted
2. **Reference Usage**: Start with references, fallback to Context7 for gaps
3. **MCP Integration**: Use MCPs for discovery, Context7 for implementation
4. **Iteration Speed**: Don't over-research, implement and validate

---

**Need help?** Consult `references/` folder for detailed guides.
```

---

## 📖 Template de Reference Document

**Ejemplo: `references/vitest-best-practices.md`**

```markdown
# Vitest Best Practices

**Last Updated**: {date}
**Context7 Queries**: See bottom for refresh commands

---

## When to Consult This Reference

Use this guide when:
- Creating unit tests for use cases
- Setting up test mocks
- Configuring coverage thresholds
- Debugging failing tests

**When this is outdated**: Run Context7 queries at bottom to get latest

---

## Pattern 1: Mocking Supabase Client

### Common Scenario
Testing a use case that calls Supabase service.

### Pattern
```typescript
// tests/mocks/supabase.ts
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    update: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    delete: vi.fn().mockResolvedValue({ error: null }),
  })),
}

// In test file
vi.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabaseClient,
}))
```

### When Pattern May Be Outdated
If Vitest releases breaking changes to `vi.mock` API.

**Refresh**: Run Context7 query at bottom: "Mocking Refresh"

---

## Pattern 2: Testing Async Use Cases

### Common Scenario
Use case returns a Promise and may throw errors.

### Pattern
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createTask } from './createTask'

describe('createTask', () => {
  it('should create task successfully', async () => {
    const input = { title: 'Test', project_id: 'uuid' }
    const result = await createTask(input, 'user-id')

    expect(result).toMatchObject({
      id: expect.any(String),
      title: 'Test',
    })
  })

  it('should throw on validation error', async () => {
    await expect(
      createTask({ title: '' }, 'user-id')
    ).rejects.toThrow('Title is required')
  })
})
```

---

## Pattern 3: Coverage Configuration

### vitest.config.ts
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
})
```

---

## Context7 Refresh Queries

**Use these to update this reference when needed**:

### General Setup Refresh
```bash
Context7: get-library-docs "/vitest-dev/vitest" topic="configuration setup vitest.config"
```

### Mocking Refresh
```bash
Context7: get-library-docs "/vitest-dev/vitest" topic="vi.mock mocking modules latest"
```

### Coverage Refresh
```bash
Context7: get-library-docs "/vitest-dev/vitest" topic="coverage configuration thresholds"
```

### Async Testing Refresh
```bash
Context7: get-library-docs "/vitest-dev/vitest" topic="async testing promises errors"
```

---

**Maintained by**: Test Architect Skill
```

---

## 🔧 Implementación por Agente (Detallada)

### 1. **Architect Agent**

**Agent .md** (~150 líneas):
```markdown
---
name: architect-agent
description: Use this agent when translating user requirements into technical specifications...
model: sonnet
color: red
---

# IDENTITY & ROLE

You are the **Chief Architect**—bridge between user needs and technical implementation.

[... resto de identidad ...]

# 🎯 MANDATORY SKILL INVOCATION

**CRITICAL**: Before starting, invoke:

```
Skill: architect-skill
```
```

**Skill**: `architect-skill/`
```
├── SKILL.md                    # Workflow completo
├── references/
│   ├── entity-design-patterns.md       # Zod schemas avanzados
│   ├── prd-checklist.md                # Validación PRD
│   ├── supabase-mcp-workflow.md        # Cómo research DB
│   └── context7-queries.md             # Queries pre-built
└── scripts/
    └── validate-prd.sh                 # Opcional
```

**SKILL.md Phases**:
1. **Phase 0: Pre-Work Research**
   - CHECKPOINT: Context7 para Zod latest, Supabase patterns
   - MCP Workflow: Supabase MCP para query existing schema
2. **Phase 1: Clarification**
3. **Phase 2: PRD Creation**
   - Reference: `prd-checklist.md`
4. **Phase 3: Entity Design**
   - Reference: `entity-design-patterns.md`
5. **Phase 4: Validation**

---

### 2. **Test Architect**

**Agent .md** (~150 líneas): Identidad + `Skill: test-architect-skill`

**Skill**: `test-architect-skill/`
```
├── SKILL.md
├── references/
│   ├── vitest-best-practices.md        # Patterns con Context7 refresh
│   ├── playwright-e2e-patterns.md      # E2E workflows
│   ├── mocking-strategies.md           # Mock patterns
│   ├── zod-test-patterns.md            # Testing validation
│   └── context7-queries.md
└── scripts/
    └── coverage-validator.sh
```

**SKILL.md Phases**:
1. **Phase 0: Pre-Work**
   - CHECKPOINT OBLIGATORIO: Context7 Vitest + Playwright latest
   - Consultar breaking changes
2. **Phase 1: Unit Tests**
   - Reference: `vitest-best-practices.md`
   - Reference: `zod-test-patterns.md`
3. **Phase 2: E2E Tests**
   - Reference: `playwright-e2e-patterns.md`
4. **Phase 3: Validation**
   - Script: `coverage-validator.sh`

---

### 3. **Implementer Agent**

**Agent .md** (~150 líneas): Identidad + `Skill: implementer-skill`

**Skill**: `implementer-skill/`
```
├── SKILL.md
└── references/
    ├── use-case-patterns.md            # Clean Architecture
    ├── clean-architecture-boundaries.md # Layer rules
    ├── error-handling-strategies.md
    ├── zod-runtime-validation.md       # Validation in use cases
    ├── tanstack-query-patterns.md      # For API integration
    └── context7-queries.md
```

**SKILL.md Phases**:
1. **Phase 0: Pre-Implementation**
   - CHECKPOINT (condicional): Context7 si dudas
2. **Phase 1: Use Case Implementation**
   - Reference: `use-case-patterns.md`
   - Reference: `clean-architecture-boundaries.md`
3. **Phase 2: API Routes**
   - Reference: `error-handling-strategies.md`
4. **Phase 3: Validation**

**NOTA**: Este agente tiene MENOS Context7 checkpoints obligatorios porque:
- Los tests ya definen las interfaces
- Los patrones son más estables
- Context7 solo si hay dudas específicas

---

### 4. **Supabase Agent**

**Agent .md** (~150 líneas): Identidad + `Skill: supabase-skill`

**Skill**: `supabase-skill/`
```
├── SKILL.md
├── references/
│   ├── rls-policy-patterns.md          # Ejemplos RLS comunes
│   ├── query-optimization.md
│   ├── migration-best-practices.md
│   ├── supabase-mcp-workflows.md       # Research con MCP
│   └── context7-queries.md             # CRÍTICO para RLS
└── scripts/
    └── validate-rls.sh
```

**SKILL.md Phases**:
1. **Phase 0: Pre-Schema Design**
   - MCP Workflow: Supabase MCP para research
   - CHECKPOINT: Context7 para Supabase best practices
2. **Phase 1: Schema Design**
   - Reference: `migration-best-practices.md`
3. **Phase 2: RLS Policies**
   - **CHECKPOINT CRÍTICO OBLIGATORIO**:
     - Context7: `/supabase/supabase topic="row level security multi-tenant"`
     - ANTES de escribir CUALQUIER policy
   - Reference: `rls-policy-patterns.md` (patrones base)
4. **Phase 3: Service Implementation**
5. **Phase 4: Validation**
   - Script: `validate-rls.sh`

**CRÍTICO**: RLS es el área más propensa a errores. Context7 OBLIGATORIO.

---

### 5. **UI/UX Expert**

**Agent .md** (~150 líneas): Identidad + `Skill: ui-ux-skill`

**Skill**: `ui-ux-skill/`
```
├── SKILL.md
├── references/
│   ├── shadcn-component-library.md     # Catálogo componentes
│   ├── tailwind-utility-patterns.md    # Utilities comunes
│   ├── accessibility-wcag-checklist.md # A11y validation
│   ├── chrome-devtools-workflows.md    # MCP workflows
│   ├── tanstack-query-ui-patterns.md   # Data fetching UI
│   ├── next-intl-i18n-patterns.md      # i18n implementation
│   └── context7-queries.md
└── assets/
    └── style-guide-reference.md
```

**SKILL.md Phases**:
1. **Phase 0: Pre-Design**
   - CHECKPOINT: Context7 shadcn + Tailwind latest
   - MANDATORY: Read `.claude/STYLE_GUIDE.md`
2. **Phase 1: Component Architecture**
   - Reference: `shadcn-component-library.md`
3. **Phase 2: Implementation**
   - Reference: `tailwind-utility-patterns.md`
   - Reference: `tanstack-query-ui-patterns.md`
   - Reference: `next-intl-i18n-patterns.md`
4. **Phase 3: Visual Validation**
   - **MCP Workflow OBLIGATORIO**: Chrome DevTools
   - Reference: `chrome-devtools-workflows.md`
   - Screenshots before/after
5. **Phase 4: Accessibility**
   - Reference: `accessibility-wcag-checklist.md`
6. **Phase 5: E2E Verification**

---

## 🚀 Plan de Implementación (Faseado)

### Fase 1: Preparación (1 hora)
- [ ] Crear estructura de carpetas `skills/{agent-name}/`
- [ ] Crear template `agent-minimal.md`
- [ ] Crear template `SKILL-template.md`
- [ ] Crear template `reference-template.md`

### Fase 2: Architect Skill (2-3 horas)
- [ ] Refactorizar `architect-agent.md` a ~150 líneas
- [ ] Crear `architect-skill/SKILL.md` con workflow completo
- [ ] Crear references:
  - [ ] `entity-design-patterns.md` (con ejemplos Zod)
  - [ ] `prd-checklist.md`
  - [ ] `supabase-mcp-workflow.md`
  - [ ] `context7-queries.md` (queries pre-built)
- [ ] Testing: Crear feature de prueba

### Fase 3: Test Architect Skill (2-3 horas)
- [ ] Refactorizar `test-architect.md` a ~150 líneas
- [ ] Crear `test-architect-skill/SKILL.md`
- [ ] Crear references:
  - [ ] `vitest-best-practices.md` (con Context7 refresh queries)
  - [ ] `playwright-e2e-patterns.md`
  - [ ] `mocking-strategies.md`
  - [ ] `zod-test-patterns.md`
  - [ ] `context7-queries.md`
- [ ] Crear script: `coverage-validator.sh`
- [ ] Testing: Crear tests de prueba

### Fase 4: Implementer Skill (2 horas)
- [ ] Refactorizar `implementer-agent.md` a ~150 líneas
- [ ] Crear `implementer-skill/SKILL.md`
- [ ] Crear references:
  - [ ] `use-case-patterns.md`
  - [ ] `clean-architecture-boundaries.md`
  - [ ] `error-handling-strategies.md`
  - [ ] `zod-runtime-validation.md`
  - [ ] `tanstack-query-patterns.md`
  - [ ] `context7-queries.md`
- [ ] Testing: Implementar use cases

### Fase 5: Supabase Skill (2-3 horas)
- [ ] Refactorizar `supabase-data-specialist.md` a ~150 líneas
- [ ] Crear `supabase-skill/SKILL.md` con **CHECKPOINT RLS CRÍTICO**
- [ ] Crear references:
  - [ ] `rls-policy-patterns.md` (ejemplos multi-tenant)
  - [ ] `query-optimization.md`
  - [ ] `migration-best-practices.md`
  - [ ] `supabase-mcp-workflows.md`
  - [ ] `context7-queries.md` (ÉNFASIS en RLS queries)
- [ ] Crear script: `validate-rls.sh`
- [ ] Testing: Schema + RLS

### Fase 6: UI/UX Skill (3 horas)
- [ ] Refactorizar `ui-ux-expert.md` a ~150 líneas
- [ ] Crear `ui-ux-skill/SKILL.md`
- [ ] Crear references:
  - [ ] `shadcn-component-library.md`
  - [ ] `tailwind-utility-patterns.md`
  - [ ] `accessibility-wcag-checklist.md`
  - [ ] `chrome-devtools-workflows.md` (MCP integration)
  - [ ] `tanstack-query-ui-patterns.md`
  - [ ] `next-intl-i18n-patterns.md`
  - [ ] `context7-queries.md`
- [ ] Crear asset: `style-guide-reference.md`
- [ ] Testing: Componentes + screenshots

### Fase 7: Validación E2E (1 hora)
- [ ] Ejecutar feature completa con todos los agentes
- [ ] Verificar invocación de skills
- [ ] Verificar Context7 checkpoints funcionan
- [ ] Verificar MCP workflows
- [ ] Actualizar CLAUDE.md

---

## 📊 Métricas de Éxito

### Reducción de Complejidad
- Agent .md: ~2000 → ~150 líneas ✅ (93% reducción)
- Separación clara: Identidad vs Procedimientos ✅

### Organización según Anthropic
- SKILL.md como workflow principal ✅
- references/ para docs bajo demanda ✅
- scripts/ para automatizaciones ✅
- assets/ para templates/outputs ✅

### Context7 Integration
- Checkpoints definidos en fases ✅
- Queries pre-built en `context7-queries.md` ✅
- Refresh queries en references ✅

### MCP Integration
- Workflows documentados ✅
- Ejemplos paso a paso ✅

### Reutilización Inteligente
- No hay duplicación innecesaria ✅
- Cada reference específica para su contexto ✅
- Pattern: Zod para testing ≠ Zod para runtime ✅

---

## 💡 Ventajas del Sistema Oficial

1. **Agentes Livianos**: Fácil de leer identidad y rol
2. **Skills Autocontenidas**: Todo en su carpeta, incluyendo references
3. **Carga Bajo Demanda**: References solo cuando se necesitan (performance)
4. **Context7 Estratégico**: Checkpoints en momentos clave + refresh queries
5. **MCP Workflows**: Integración clara y práctica
6. **Mantenibilidad**: Actualizar reference = actualizar skill completa
7. **Escalabilidad**: Nuevas skills siguen mismo patrón

---

## 🎯 Diferencias Clave vs Plan Anterior

| Aspecto | Plan Anterior (Rechazado) | Plan Actual (Oficial) |
|---------|---------------------------|----------------------|
| **Referencias Compartidas** | `skills/references/shared/` | NO - Cada skill tiene sus references |
| **Duplicación** | Evitada a toda costa | Intencional y contextual |
| **Carga** | Todo cargado siempre | Bajo demanda según necesidad |
| **Contexto** | Genérico | Específico por agente |
| **Mantenimiento** | Cambio afecta a todos | Cambio aislado por skill |

**Ejemplo**:
- `zod-test-patterns.md` en test-architect-skill → Enfoque testing
- `zod-runtime-validation.md` en implementer-skill → Enfoque validación runtime
- SON DIFERENTES aunque ambas hablen de Zod

---

## ⚠️ Puntos Críticos

1. **Supabase Skill**: CHECKPOINT Context7 ANTES de RLS es NO NEGOCIABLE
2. **UI/UX Skill**: Chrome DevTools MCP workflow OBLIGATORIO para visual validation
3. **Test Architect**: Context7 checkpoints para Vitest/Playwright ANTES de crear tests
4. **Todos**: `context7-queries.md` debe tener queries pre-built y testados

---

## 📝 Notas de Iteración

### Cambios Pendientes
- TBD

### Decisiones Tomadas
1. **2025-10-24**: Adoptar estructura oficial de Anthropic (references/ dentro de cada skill)
2. **2025-10-24**: Context7 checkpoints obligatorios en fases críticas
3. **2025-10-24**: Duplicación intencional de references por contexto

### Preguntas Abiertas
- TBD

---

**Última Actualización**: 2025-10-24
**Mantenedor**: Usuario + Claude Code
