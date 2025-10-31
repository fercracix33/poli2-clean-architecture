# Planning & Review Workflow v3.0

## Complete v3.0 Flow

```
PASO 1: ARCHITECT MASTER
  Usuario → Architect Master (PRD Master único)
             ↓
  Architect analiza: código + DB + requisitos
             ↓
  Crea 00-master-prd.md muy específico
  (archivos exactos, estructura, pero NO código)
             ↓
  Escribe 00-request.md para cada especialista

────────────────────────────────────────────

PASO 2: TESTING EXPERT (SECUENCIAL) ⚠️
  Testing Expert lee su 00-request.md
             ↓
  Crea 01-plan.md con estrategia de testing
  (qué tests necesarios, NO implementa tests)
             ↓
  Architect + Usuario revisan plan
             ↓
  APROBADO → Continuar

────────────────────────────────────────────

PASO 3: ESPECIALISTAS EN PARALELO 🔄
  Backend Expert    → 01-plan.md
  Database Expert   → 01-plan.md
  Frontend Expert   → 01-plan.md
  shadcn Expert     → 01-plan.md
  Security Expert   → 01-plan.md
  Performance Expert → 01-plan.md
             ↓
  Architect + Usuario revisan todos los planes
             ↓
  APROBADOS → Continuar

────────────────────────────────────────────

PASO 4: IMPLEMENTACIÓN (THREAD PRINCIPAL) 🛠️
  Claude Code Principal:
    1. Lee TODOS los planes aprobados
    2. Implementa por fases:
       - Fase 1: entities.ts
       - Fase 2: tests (siguiendo plan de Testing Expert)
       - Fase 3: use cases (siguiendo plan de Backend Expert)
       - Fase 4: services (siguiendo plan de Database Expert)
       - Fase 5: UI (siguiendo planes de Frontend/shadcn)

    3. En CHECKPOINTS (decididos manualmente):
       → Usuario dice: "Revisa el trabajo"
       → Claude invoca especialistas para revisión
       → Especialistas crean review-checkpoint-N.md
       → Claude corrige según feedback
       → Continúa implementación

    4. Architect revisa SIEMPRE:
       - Estructura de archivos
       - Cumplimiento de Clean Architecture
       - Coherencia con PRD Master

────────────────────────────────────────────

PASO 5: REFINAMIENTO ITERATIVO
  Si revisión detecta problemas:
    → Claude corrige
    → Solicita nueva revisión
    → Repite hasta aprobación

  Una vez TODO aprobado:
    → Feature completa ✅
```

## v2.0 vs v3.0 Comparison

| Aspecto | v2.0 (Archivado) | v3.0 (Actual) |
|---------|------------------|---------------|
| **Quién implementa** | Subagentes | Thread principal (Claude Code) |
| **Rol de subagentes** | Implementadores | Planificadores + Revisores |
| **Architect** | Coordinador + Revisor | Master Planner + Coordinador + Revisor |
| **Especialización** | 5 agentes TDD | 7+ expertos especializados |
| **Revisión** | Por iteración completa | Por checkpoint manual |
| **Paralelismo** | Limitado (handoffs) | Amplio (todos planifican en paralelo) |
| **Context7** | Opcional | Obligatorio en cada plan |
| **Flexibilidad** | Rígida (secuencial) | Flexible (checkpoints manuales) |
| **Deliverables** | Código funcionando + tests | Planes detallados + Reviews |
| **Workspace files** | `XX-iteration.md` | `01-plan.md` + `review-checkpoint-N.md` |

## Planning Agent Responsibilities

### Planning Phase
- Read `00-request.md` from Architect
- Consult Context7 for latest best practices
- Create `01-plan.md` with:
  - Detailed specifications (NOT code)
  - Patterns and architectures to follow
  - File structure and organization
  - Phased approach if complex
  - Best practices from Context7

### Review Phase
- Triggered by user at checkpoints
- Review Claude Code's implementation
- Create `review-checkpoint-N.md` with:
  - What was implemented correctly
  - What violates best practices
  - Specific corrections needed
  - Improvement suggestions
  - Context7 references for corrections

### Prohibited Activities
- ❌ Implementing any code
- ❌ Modifying tests
- ❌ Writing business logic
- ❌ Direct file operations
- ❌ Approving own work

## Workflow Integration

### Sequential Dependencies
```
Testing Expert MUST complete first
   ↓
Other experts work in parallel
   ↓
Architect reviews all plans
   ↓
User approves plans
   ↓
Claude Code implements
```

### Checkpoint Flow
```
User: "Implement phase 1"
   ↓
Claude Code implements following plans
   ↓
User: "Review the work"
   ↓
Claude invokes relevant experts
   ↓
Experts create review-checkpoint-1.md
   ↓
Claude reads reviews and corrects
   ↓
Continue to next phase
```

## File Structure Example

```
PRDs/domain/001-feature/
├── architect/
│   └── 00-master-prd.md         # Único PRD master
├── testing-planning-expert/
│   ├── 00-request.md            # Architect writes
│   ├── 01-plan.md               # Expert creates (testing strategy)
│   └── review-checkpoint-1.md   # Expert reviews (if requested)
├── backend-planning-expert/
│   ├── 00-request.md
│   ├── 01-plan.md               # Expert creates (use cases plan)
│   └── review-checkpoint-1.md
├── database-planning-expert/
│   ├── 00-request.md
│   ├── 01-plan.md               # Expert creates (schema/RLS plan)
│   └── review-checkpoint-1.md
└── _status.md                   # Unified status
```

## Success Metrics

Planning agents are successful when:
- Plans are detailed enough for implementation without ambiguity
- Reviews catch best practice violations early
- Context7 is consulted for all recommendations
- Feedback is specific and actionable
- No code implementation occurs in planning phase
