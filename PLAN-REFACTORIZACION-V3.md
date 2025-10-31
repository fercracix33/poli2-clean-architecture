# Plan de Refactorización: Sistema de Agentes v2.0 → v3.0

## 🎯 Objetivo
Invertir el flujo de trabajo: **subagentes planifican y revisan**, **Claude Code principal implementa**.

---

## 📋 Fase 1: Backup y Preparación

### 1.1 Crear rama `sistema2`
```bash
git checkout -b sistema2
git push -u origin sistema2
```

### 1.2 Mover sistema actual a `/sistemaAntiguo/`
```bash
mkdir -p sistemaAntiguo/{agentes,skills}
mv .claude/agents/*.md sistemaAntiguo/agentes/
mv .claude/skills/* sistemaAntiguo/skills/
```

### 1.3 Documentar sistema antiguo
- Crear `sistemaAntiguo/README.md` explicando por qué se archivó
- Listar todos los agentes y skills preservados

---

## 📋 Fase 2: Diseño del Nuevo Sistema

### 2.1 Nuevo Architect Agent (Master Planner)

**Archivo:** `.claude/agents/architect-master.md`

**Responsabilidades:**
- ✅ Entender **todo** a gran escala (código, DB, requisitos usuario)
- ✅ Crear **PRD Master único** con visión completa
- ✅ Delegar **planificación detallada** a subagentes especializados
- ✅ **Revisar implementación** del thread principal (arquitectura, estructura)
- ✅ Herramientas: Context7, Supabase MCP, lectura de código completo

**Skill:** `.claude/skills/architect-master-skill/SKILL.md`
- Fase 1: Análisis profundo (código + DB + requisitos)
- Fase 2: Consulta Context7 para patrones
- Fase 3: Creación PRD Master estructurado
- Fase 4: Identificación de especialistas necesarios
- Fase 5: Escritura de peticiones (`00-request.md`) por especialista
- Fase 6: Revisión de implementación (arquitectura)

---

### 2.2 Agentes de Planificación Especializados

#### Backend Expert
**Archivo:** `.claude/agents/backend-planning-expert.md`

**Responsabilidades:**
- ✅ Leer PRD Master y su `00-request.md`
- ✅ Planificar use cases, servicios, validaciones Zod **por fases**
- ✅ Consultar Context7 para patrones de backend
- ✅ Crear plan detallado en `01-plan.md` (NO implementa)
- ✅ **Revisar implementación** del thread principal (best practices backend)

**Skill:** `.claude/skills/backend-planning-skill/SKILL.md`
- Fase 1: Análisis de requisitos del PRD
- Fase 2: Context7: TanStack Query, Zod patterns
- Fase 3: Diseño de use cases y servicios por fases
- Fase 4: Especificar interfaces y contratos
- Fase 5: Crear checklist de implementación
- Fase 6: Template de revisión (TanStack Query optimistic updates, etc.)

#### Database Expert
**Archivo:** `.claude/agents/database-planning-expert.md`

**Responsabilidades:**
- ✅ Planificar schema, RLS, migraciones **por fases**
- ✅ Consultar Supabase MCP para estado actual de DB
- ✅ Crear plan detallado en `01-plan.md`
- ✅ **Revisar implementación** (RLS correctas, performance)

**Skill:** `.claude/skills/database-planning-skill/SKILL.md`
- Fase 1: Análisis de entidades y relaciones
- Fase 2: Supabase MCP: esquema actual, advisors
- Fase 3: Diseño de tablas, constraints, indexes
- Fase 4: Especificar RLS policies por workspace
- Fase 5: Crear migraciones por fases
- Fase 6: Template de revisión (RLS anti-patterns)

#### Frontend Expert
**Archivo:** `.claude/agents/frontend-planning-expert.md`

**Responsabilidades:**
- ✅ Planificar componentes React, UX flows **por fases**
- ✅ Consultar Context7 para shadcn/ui patterns
- ✅ Especificar accesibilidad WCAG 2.1 AA
- ✅ **Revisar implementación** (componentes, a11y)

**Skill:** `.claude/skills/frontend-planning-skill/SKILL.md`
- Fase 1: Análisis de flujos de usuario
- Fase 2: Context7: shadcn/ui, React patterns
- Fase 3: Diseño de componentes y jerarquía
- Fase 4: Especificar estados, loading, errors
- Fase 5: Checklist de accesibilidad
- Fase 6: Template de revisión (WCAG, responsive)

#### Testing Expert
**Archivo:** `.claude/agents/testing-planning-expert.md`

**Responsabilidades:**
- ✅ **SECUENCIAL antes de otros**: Planificar estrategia de testing
- ✅ Definir tests (unit, integration, E2E) **por fases**
- ✅ Crear especificaciones de tests (NO implementa tests todavía)
- ✅ **Revisar implementación** de tests (coverage, best practices)

**Skill:** `.claude/skills/testing-planning-skill/SKILL.md`
- Fase 1: Análisis de cobertura necesaria
- Fase 2: Context7: Vitest, Playwright patterns
- Fase 3: Diseño de estrategia de testing por capa
- Fase 4: Especificar casos de prueba por fase
- Fase 5: Definir mocks y fixtures
- Fase 6: Template de revisión (coverage >90%)

#### shadcn UI/UX Expert
**Archivo:** `.claude/agents/shadcn-uiux-planning-expert.md`

**Responsabilidades:**
- ✅ Planificar componentes shadcn/ui específicos
- ✅ Diseñar animaciones, transiciones, micro-interacciones
- ✅ Consultar shadcn MCP para componentes disponibles
- ✅ **Revisar implementación** (consistencia visual, Style Guide)

**Skill:** `.claude/skills/shadcn-uiux-planning-skill/SKILL.md`
- Fase 1: Análisis de componentes necesarios
- Fase 2: shadcn MCP: componentes disponibles
- Fase 3: Diseño de composición de componentes
- Fase 4: Especificar variantes, estados
- Fase 5: Micro-interacciones y animaciones
- Fase 6: Template de revisión (Style Guide compliance)

#### Security Expert
**Archivo:** `.claude/agents/security-planning-expert.md`

**Responsabilidades:**
- ✅ Planificar seguridad (CASL, RLS, validaciones)
- ✅ Análisis de superficie de ataque
- ✅ Especificar defense-in-depth
- ✅ **Revisar implementación** (vulnerabilidades, OWASP)

**Skill:** `.claude/skills/security-planning-skill/SKILL.md`
- Fase 1: Threat modeling
- Fase 2: Context7: CASL patterns, RLS best practices
- Fase 3: Diseño de authorization layers
- Fase 4: Especificar validaciones y sanitization
- Fase 5: Checklist de seguridad
- Fase 6: Template de revisión (OWASP Top 10)

#### Performance Expert
**Archivo:** `.claude/agents/performance-planning-expert.md`

**Responsabilidades:**
- ✅ Planificar optimizaciones (queries, caching, rendering)
- ✅ Especificar Core Web Vitals targets
- ✅ Consultar Context7 para performance patterns
- ✅ **Revisar implementación** (lighthouse, profiling)

**Skill:** `.claude/skills/performance-planning-skill/SKILL.md`
- Fase 1: Análisis de bottlenecks potenciales
- Fase 2: Context7: React performance, TanStack Query caching
- Fase 3: Diseño de estrategia de caching
- Fase 4: Especificar lazy loading, code splitting
- Fase 5: Definir métricas de performance
- Fase 6: Template de revisión (Core Web Vitals)

---

### 2.3 Nuevo Sistema de PRDs v3.0

**Estructura:**
```
PRDs/
├── _templates/
│   ├── 00-master-prd-v3-template.md       # Para Architect Master
│   ├── planning-request-template.md       # Para 00-request.md de planificadores
│   ├── planning-phase-template.md         # Para 01-plan.md, 02-plan.md...
│   ├── implementation-checkpoint-template.md  # Para checkpoints de implementación
│   └── review-template.md                 # Para revisiones de especialistas
│
├── [domain]/[number]-[feature-name]/
│   ├── architect/
│   │   └── 00-master-prd.md               # Único PRD master
│   │
│   ├── testing-expert/                    # ⚠️ PRIMERO (secuencial)
│   │   ├── 00-request.md
│   │   ├── 01-plan.md                     # Plan de testing
│   │   ├── review-checkpoint-1.md         # Revisión post-implementación
│   │   └── review-checkpoint-2.md
│   │
│   ├── backend-expert/                    # Después de testing (paralelo)
│   │   ├── 00-request.md
│   │   ├── 01-plan.md
│   │   └── review-checkpoint-1.md
│   │
│   ├── database-expert/                   # Paralelo con backend
│   │   ├── 00-request.md
│   │   ├── 01-plan.md
│   │   └── review-checkpoint-1.md
│   │
│   ├── frontend-expert/                   # Paralelo con backend
│   │   ├── 00-request.md
│   │   ├── 01-plan.md
│   │   └── review-checkpoint-1.md
│   │
│   ├── shadcn-expert/                     # Paralelo con frontend
│   │   ├── 00-request.md
│   │   ├── 01-plan.md
│   │   └── review-checkpoint-1.md
│   │
│   ├── security-expert/                   # Paralelo después de arquitectura
│   │   ├── 00-request.md
│   │   ├── 01-plan.md
│   │   └── review-checkpoint-1.md
│   │
│   ├── performance-expert/                # Final
│   │   ├── 00-request.md
│   │   ├── 01-plan.md
│   │   └── review-checkpoint-1.md
│   │
│   ├── implementation/                    # 🆕 Thread principal
│   │   ├── phase-1-entities.md            # Log de implementación por fase
│   │   ├── phase-2-tests.md
│   │   ├── phase-3-use-cases.md
│   │   ├── phase-4-services.md
│   │   ├── phase-5-ui.md
│   │   └── checkpoints.md                 # Cuándo pedir revisión
│   │
│   └── _status-v3.md                      # Status unificado
```

---

## 📋 Fase 3: Nuevo Flujo de Trabajo v3.0

### 3.1 Secuencia de Ejecución

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

---

## 📋 Fase 4: Actualización de Documentación

### 4.1 Actualizar `CLAUDE.md`
- Sección "Agent Responsibilities v3.0"
- Nuevo flujo de trabajo
- Explicar inversión de roles

### 4.2 Actualizar `PRDs/WORKFLOW-ITERATIVO.md`
- Renombrar a `WORKFLOW-V3-PLANNING.md`
- Documentar nuevo flujo
- Ejemplos de planes vs implementación

### 4.3 Crear `PRDs/GUIA-USO-PRD-V3.md`
- Cómo usar nueva estructura
- Cuándo pedir checkpoints de revisión
- Ejemplos de revisión

### 4.4 Crear `.claude/AGENT-SYSTEM-V3.md`
- Arquitectura completa del sistema v3.0
- Diagrama de flujo visual
- Matriz de especialistas

---

## 📋 Fase 5: Comandos Personalizados v3.0

### 5.1 Actualizar `/agent-handoff`
- Adaptarlo al nuevo flujo (planificadores → implementador)

### 5.2 Crear `/request-review`
```bash
/request-review [feature-path] [specialist] [checkpoint-number]
# Ejemplo: /request-review rbac/001-foundation backend-expert 1
```

### 5.3 Crear `/approve-plans`
```bash
/approve-plans [feature-path]
# Marca todos los planes como aprobados, habilita implementación
```

### 5.4 Crear `/implementation-checkpoint`
```bash
/implementation-checkpoint [feature-path] [phase]
# Pausa implementación, solicita revisiones de especialistas
```

---

## 📋 Fase 6: Testing del Nuevo Sistema

### 6.1 Feature Piloto
- Seleccionar feature pequeña (ej: "User Profile Settings")
- Ejecutar flujo completo v3.0
- Documentar resultados

### 6.2 Validación
- ✅ Architect crea PRD específico
- ✅ Testing Expert planifica primero
- ✅ Especialistas planean en paralelo
- ✅ Thread principal implementa por fases
- ✅ Checkpoints de revisión funcionan
- ✅ Correcciones iterativas fluyen bien

---

## 🎯 Resultado Final

**Sistema v3.0:**
- ✅ Subagentes = Planificadores + Revisores (NO implementan)
- ✅ Thread principal = Implementador (siguiendo planes)
- ✅ Architect Master = Coordinador general + Revisor arquitectónico
- ✅ Revisiones en checkpoints manuales (flexible)
- ✅ Planificación paralela (después de testing)
- ✅ Implementación guiada por planes detallados

**Archivos a crear:**
- 7 agentes nuevos (`.claude/agents/*.md`)
- 7 skills nuevas (`.claude/skills/*/SKILL.md`)
- 5 templates nuevos PRD v3.0
- 4 comandos actualizados/nuevos
- 3 documentos de guía actualizados

**Estimación:** ~8-10 horas de trabajo total

---

## 📊 Comparación v2.0 vs v3.0

| Aspecto | v2.0 (Actual) | v3.0 (Propuesto) |
|---------|---------------|------------------|
| **Quién implementa** | Subagentes | Thread principal |
| **Rol de subagentes** | Implementadores | Planificadores + Revisores |
| **Architect** | Coordinador + Revisor | Master Planner + Coordinador + Revisor |
| **Especialización** | 5 agentes TDD | 7+ expertos especializados |
| **Revisión** | Por iteración completa | Por checkpoint manual |
| **Paralelismo** | Limitado (handoffs) | Amplio (todos planifican en paralelo) |
| **Context7** | Opcional | Obligatorio en cada plan |
| **Flexibilidad** | Rígida (secuencial) | Flexible (checkpoints manuales) |

---

## 🚨 Decisiones Importantes

### ¿Qué conservar del v2.0?
- ✅ Estructura PRD por feature
- ✅ Sistema de carpetas por agente
- ✅ Plantillas estandarizadas
- ✅ Status unificado
- ✅ Documentación exhaustiva

### ¿Qué cambiar?
- 🔄 Rol de subagentes (implementar → planificar/revisar)
- 🔄 Flujo de trabajo (rígido → flexible con checkpoints)
- 🔄 Especialización (TDD layers → dominios de expertise)
- 🔄 Revisiones (por fase TDD → por checkpoint manual)

### ¿Qué añadir?
- ➕ Más especialistas (security, performance, shadcn)
- ➕ Folder `implementation/` para logs del thread principal
- ➕ Templates de revisión por especialista
- ➕ Comandos para gestionar checkpoints

---

## 📝 Próximos Pasos

1. **Aprobar plan general** ✋ (esperando feedback)
2. **Crear rama `sistema2`**
3. **Archivar sistema v2.0** en `/sistemaAntiguo/`
4. **Crear Architect Master** (agente + skill)
5. **Crear especialistas** (7 agentes + skills)
6. **Crear templates PRD v3.0**
7. **Actualizar documentación**
8. **Crear comandos v3.0**
9. **Feature piloto**
10. **Ajustar según resultados**

---

**Fecha:** 2025-10-29
**Versión:** 1.0
**Estado:** Propuesta inicial
