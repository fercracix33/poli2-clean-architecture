# CRITICAL: Sistema Iterativo v2.0 - Actualizaciones para Agentes

**Fecha**: 2025-10-24
**Versión**: 2.0
**Aplicable a**: TODOS los agentes

---

## ⚠️ CAMBIOS FUNDAMENTALES

El sistema TDD ha sido refactorizado a un **flujo iterativo** con **revisión arquitectónica obligatoria**.

**Esto REEMPLAZA el flujo linear anterior.**

---

## 📋 Para TODOS los Agentes

### NUEVO: Lectura de Documentos

**ANTES (❌ OBSOLETO)**:
- Agentes leían documentos de otros agentes
- Cada agente escribía su propio "spec" document

**AHORA (✅ OBLIGATORIO)**:
- ✅ Cada agente lee SOLO su carpeta: `PRDs/{feature}/{agent-name}/`
- ✅ Arquitecto coordina información entre agentes
- ✅ Solo Arquitecto escribe PRDs

### NUEVO: Estructura de Archivos

**Ubicación de trabajo**:
```
PRDs/{domain}/{number}-{feature-name}/
├── architect/           ← Solo Arquitecto
│   └── 00-master-prd.md
├── test-agent/          ← Solo Test Agent
│   ├── 00-request.md    (Arquitecto escribe)
│   ├── 01-iteration.md  (Test Agent escribe)
│   ├── 02-iteration.md  (si rechazado)
│   └── handoff-001.md   (opcional, Arquitecto)
├── implementer/         ← Solo Implementer
│   ├── 00-request.md
│   └── 01-iteration.md
├── supabase-agent/      ← Solo Supabase Agent
│   ├── 00-request.md
│   └── 01-iteration.md
├── ui-ux-expert/        ← Solo UI/UX Expert
│   ├── 00-request.md
│   └── 01-iteration.md
└── _status.md           (Todos leen, Arquitecto actualiza)
```

### NUEVO: Proceso de Trabajo

**Patrón para cada agente**:

```
1. Leer {tu-agente}/00-request.md (escrito por Arquitecto)
   ↓
2. Trabajar en tu fase
   ↓
3. Documentar en {tu-agente}/01-iteration.md
   (usar template: PRDs/_templates/agent-iteration-template.md)
   ↓
4. Notificar: "Iteración lista para revisión"
   ↓
5. ESPERAR aprobación de Arquitecto + Usuario
   ↓
6. SI APROBADO: FIN (Arquitecto coordina siguiente fase)
   SI RECHAZADO: Leer feedback y crear 02-iteration.md
```

### NUEVO: Reglas Críticas

1. **NO leer carpetas de otros agentes** (salvo handoffs permitidos)
2. **NO editar iteraciones previas** (crear nueva con número siguiente)
3. **NO avanzar sin aprobación explícita** de Arquitecto + Usuario
4. **SÍ documentar TODO** en archivo de iteración
5. **SÍ seguir template** `agent-iteration-template.md`

---

## 🏗️ Arquitecto - Nuevas Responsabilidades

### ROL AMPLIADO: Coordinator & Reviewer

**NUEVAS tareas**:
1. ✅ Escribir `00-request.md` para CADA agente
2. ✅ Revisar CADA iteración de CADA agente
3. ✅ Aprobar o rechazar con feedback específico
4. ✅ Decidir cuándo habilitar handoffs para paralelismo
5. ✅ Traducir información entre agentes (puente)
6. ✅ Actualizar `_status.md` con decisiones

**Templates que usa**:
- `00-master-prd-template.md` (PRD master)
- `agent-request-template.md` (para `00-request.md`)
- `agent-handoff-template.md` (handoffs opcionales)

**Limitaciones**:
- ❌ NUNCA aprobar sin revisión exhaustiva
- ❌ NUNCA permitir que agentes lean carpetas de otros
- ❌ NUNCA dejar avanzar sin aprobación explícita

---

## 🧪 Test Agent - Nuevas Responsabilidades

### Cambios vs Anterior

**ANTES**:
- Escribía `02-test-spec.md`
- Leía PRD master directamente
- Avanzaba automáticamente

**AHORA**:
- ✅ Lee `test-agent/00-request.md` (Arquitecto escribe)
- ✅ Escribe `test-agent/01-iteration.md`
- ✅ Espera aprobación antes de continuar
- ✅ Si rechazado, crea `02-iteration.md`
- ✅ (Opcional) Prepara `handoff-001.md` si Arquitecto pide

**Template**:
- `agent-iteration-template.md`

**Scope de lectura**:
- ✅ `test-agent/00-request.md`
- ✅ `architect/00-master-prd.md` (referencia)
- ✅ `app/src/features/{feature}/entities.ts`
- ❌ Carpetas de otros agentes

---

## ⚙️ Implementer - Nuevas Responsabilidades

### Cambios vs Anterior

**ANTES**:
- Escribía `03-implementation-spec.md`
- Leía spec de Test Agent directamente
- Avanzaba automáticamente

**AHORA**:
- ✅ Lee `implementer/00-request.md`
- ✅ Puede leer `test-agent/handoff-001.md` (si existe)
- ✅ Escribe `implementer/01-iteration.md`
- ✅ Espera aprobación
- ✅ Si rechazado, crea `02-iteration.md`

**Template**:
- `agent-iteration-template.md`

**Scope de lectura**:
- ✅ `implementer/00-request.md`
- ✅ `test-agent/handoff-001.md` (si Arquitecto lo preparó)
- ✅ `architect/00-master-prd.md` (referencia)
- ✅ `app/src/features/{feature}/entities.ts`
- ❌ `test-agent/01-iteration.md` (NO PERMITIDO)

---

## 🗄️ Supabase Agent - Nuevas Responsabilidades

### Cambios vs Anterior

**ANTES**:
- Escribía `01-supabase-spec.md`
- Leía PRD master y spec de Implementer
- Avanzaba automáticamente

**AHORA**:
- ✅ Lee `supabase-agent/00-request.md`
- ✅ Puede leer `implementer/handoff-001.md` (si existe)
- ✅ Escribe `supabase-agent/01-iteration.md`
- ✅ Espera aprobación
- ✅ Si rechazado, crea `02-iteration.md`

**Template**:
- `agent-iteration-template.md`

**Scope de lectura**:
- ✅ `supabase-agent/00-request.md`
- ✅ `implementer/handoff-001.md` (si existe)
- ✅ `architect/00-master-prd.md` (referencia)
- ❌ Carpetas de otros agentes directamente

---

## 🎨 UI/UX Expert - Nuevas Responsabilidades

### Cambios vs Anterior

**ANTES**:
- Escribía `04-ui-spec.md`
- Leía todos los specs anteriores
- Avanzaba automáticamente

**AHORA**:
- ✅ Lee `ui-ux-expert/00-request.md`
- ✅ Puede leer `supabase-agent/handoff-001.md` (si existe)
- ✅ Escribe `ui-ux-expert/01-iteration.md`
- ✅ Espera aprobación final
- ✅ Si rechazado, crea `02-iteration.md`

**Template**:
- `agent-iteration-template.md`

**Scope de lectura**:
- ✅ `ui-ux-expert/00-request.md`
- ✅ `supabase-agent/handoff-001.md` (si existe)
- ✅ `architect/00-master-prd.md` (referencia)
- ❌ Carpetas de otros agentes directamente

---

## 📚 Documentación de Referencia

Para detalles completos, consultar:

1. **CLAUDE.md** - Sistema completo actualizado
2. **PRDs/GUIA-USO-PRD.md** - Guía exhaustiva del sistema iterativo
3. **PRDs/WORKFLOW-ITERATIVO.md** - Workflow paso a paso
4. **PRDs/EJEMPLOS-ITERACIONES.md** - Ejemplos prácticos

---

## 🚀 Inicio Rápido por Agente

### Arquitecto
```bash
# 1. Crear estructura
mkdir -p PRDs/{domain}/{number}-{feature}/{architect,test-agent,implementer,supabase-agent,ui-ux-expert}

# 2. Crear PRD master
cp PRDs/_templates/00-master-prd-template.md PRDs/{domain}/{number}-{feature}/architect/00-master-prd.md

# 3. Crear request para Test Agent
cp PRDs/_templates/agent-request-template.md PRDs/{domain}/{number}-{feature}/test-agent/00-request.md
```

### Test Agent / Implementer / Supabase / UI-UX
```bash
# 1. Leer request
cat PRDs/{domain}/{number}-{feature}/{tu-agente}/00-request.md

# 2. Copiar template de iteración
cp PRDs/_templates/agent-iteration-template.md PRDs/{domain}/{number}-{feature}/{tu-agente}/01-iteration.md

# 3. Trabajar y documentar

# 4. Notificar a Arquitecto cuando esté listo
```

---

## ⚠️ Errores Comunes a Evitar

| Error | Correcto |
|-------|----------|
| ❌ Leer carpeta de otro agente | ✅ Solo leer tu carpeta (+ handoffs permitidos) |
| ❌ Editar iteración anterior | ✅ Crear nueva iteración con número siguiente |
| ❌ Avanzar sin aprobación | ✅ Esperar aprobación explícita de Arquitecto + Usuario |
| ❌ Escribir "spec" propio | ✅ Solo Arquitecto escribe PRD, tú escribes iteraciones |
| ❌ Asumir cosas de otros agentes | ✅ Preguntar a Arquitecto si hay dudas |

---

**Versión**: 2.0
**Fecha**: 2025-10-24
**CRÍTICO**: Este documento REEMPLAZA flujos anteriores
**Prioridad**: TODOS los agentes deben seguir este flujo
