---
description: "Automatiza handoffs en flujo iterativo v2.0 - Arquitecto crea requests, revisa iteraciones, aprueba/rechaza"
allowed-tools: Bash(cat:*), Bash(sed:*), Bash(date:*), Bash(echo:*), Bash(mkdir:*)
---

# Agent Handoff (Flujo Iterativo v2.0)

Automatiza el flujo iterativo donde el Arquitecto coordina, revisa y aprueba el trabajo de cada agente.

## 🎯 Objetivo

Facilitar el rol del **Arquitecto como Coordinator & Reviewer**:
- Crear `00-request.md` para cada agente
- Registrar aprobaciones/rechazos de iteraciones
- Actualizar `_status.md` con estado unificado
- Coordinar handoffs opcionales para paralelismo

## 🔄 Flujo Iterativo (NUEVO)

```
Usuario → Arquitecto (PRD Master)
              ↓
    ┌─────────────────────┐
    │   ITERATION LOOP    │
    │  (Per Agent Phase)  │
    └─────────────────────┘
              ↓
    Arquitecto: /agent-handoff {feature} request {agent}
              ↓
    Agente trabaja → crea 01-iteration.md
              ↓
    Agente: /agent-handoff {feature} submit {agent} 01
              ↓
    Arquitecto + Usuario revisan
              ↓
    Arquitecto: /agent-handoff {feature} approve {agent} 01
                              O
              /agent-handoff {feature} reject {agent} 01
              ↓
    SI APROBADO → Continuar siguiente agente
    SI RECHAZADO → Agente crea 02-iteration.md
```

## 📝 Comandos Disponibles

### 1. **Crear Request para Agente** (Arquitecto)

```bash
/agent-handoff {feature-path} request {agent-name}

# Ejemplos:
/agent-handoff tasks/001-create-task request test-agent
/agent-handoff tasks/001-create-task request implementer
/agent-handoff tasks/001-create-task request supabase-agent
```

**Qué hace**:
- ✅ Crea carpeta `{agent}/` si no existe
- ✅ Copia `agent-request-template.md` a `{agent}/00-request.md`
- ✅ Actualiza `_status.md` con agente en "🔄 Waiting for Request"
- ✅ Muestra checklist de qué debe incluir el request

---

### 2. **Agente Envía Iteración para Revisión** (Agente)

```bash
/agent-handoff {feature-path} submit {agent-name} {iteration-number}

# Ejemplos:
/agent-handoff tasks/001-create-task submit test-agent 01
/agent-handoff tasks/001-create-task submit implementer 02
```

**Qué hace**:
- ✅ Valida que existe `{agent}/{iteration}-iteration.md`
- ✅ Actualiza `_status.md` con "📋 Review Pending"
- ✅ Muestra checklist de revisión para Arquitecto

---

### 3. **Arquitecto Aprueba Iteración** (Arquitecto)

```bash
/agent-handoff {feature-path} approve {agent-name} {iteration-number}

# Ejemplos:
/agent-handoff tasks/001-create-task approve test-agent 01
/agent-handoff tasks/001-create-task approve implementer 01
```

**Qué hace**:
- ✅ Actualiza `{agent}/{iteration}-iteration.md` con sección de aprobación
- ✅ Actualiza `_status.md` con "✅ Approved"
- ✅ Sugiere crear `00-request.md` para siguiente agente
- ✅ Ofrece crear handoff opcional

---

### 4. **Arquitecto Rechaza Iteración** (Arquitecto)

```bash
/agent-handoff {feature-path} reject {agent-name} {iteration-number}

# Ejemplos:
/agent-handoff tasks/001-create-task reject test-agent 01
/agent-handoff tasks/001-create-task reject implementer 02
```

**Qué hace**:
- ✅ Actualiza `{agent}/{iteration}-iteration.md` con sección de rechazo
- ✅ Actualiza `_status.md` con "❌ Rejected - Needs Revision"
- ✅ Incrementa número de iteración esperada
- ✅ Muestra plantilla para feedback específico

---

### 5. **Crear Handoff para Paralelismo** (Arquitecto - Opcional)

```bash
/agent-handoff {feature-path} create-handoff {from-agent} {to-agent}

# Ejemplos:
/agent-handoff tasks/001-create-task create-handoff test-agent implementer
/agent-handoff tasks/001-create-task create-handoff implementer supabase-agent
```

**Qué hace**:
- ✅ Copia `agent-handoff-template.md` a `{from-agent}/handoff-001.md`
- ✅ Actualiza `_status.md` indicando paralelismo habilitado
- ✅ Muestra qué interfaces deben documentarse

---

## 🤖 Agentes Válidos

- `test-agent` → Test Architect
- `implementer` → Implementer Agent
- `supabase-agent` → Supabase Data Specialist
- `ui-ux-expert` → UI/UX Expert Agent

**Nota**: El Arquitecto NO usa este comando para sí mismo (es el coordinador).

---

## 📊 Estados en _status.md

```markdown
## Agent Status

### Test Agent
- **Status**: ✅ Approved (Iteration 01)
- **Last Updated**: 2025-10-24
- **Iterations**: 01 (approved)

### Implementer Agent
- **Status**: 📋 Review Pending (Iteration 02)
- **Last Updated**: 2025-10-24
- **Iterations**: 01 (approved), 02 (pending review)

### Supabase Agent
- **Status**: 🔄 Waiting for Request
- **Last Updated**: 2025-10-24

### UI/UX Expert
- **Status**: ⏸️ Not Started
- **Last Updated**: -
```

---

## 🔧 Implementación

```bash
#!/bin/bash

# Parsear argumentos
IFS=' ' read -r FEATURE_PATH ACTION AGENT_NAME ITERATION <<< "$ARGUMENTS"

# Validar argumentos mínimos
if [ -z "$FEATURE_PATH" ] || [ -z "$ACTION" ]; then
    echo "❌ ERROR: Argumentos insuficientes"
    echo ""
    echo "Uso:"
    echo "  /agent-handoff {feature} request {agent}"
    echo "  /agent-handoff {feature} submit {agent} {iteration}"
    echo "  /agent-handoff {feature} approve {agent} {iteration}"
    echo "  /agent-handoff {feature} reject {agent} {iteration}"
    echo "  /agent-handoff {feature} create-handoff {from-agent} {to-agent}"
    echo ""
    echo "Ejemplo:"
    echo "  /agent-handoff tasks/001-create-task request test-agent"
    exit 1
fi

PRD_DIR="PRDs/$FEATURE_PATH"
STATUS_FILE="$PRD_DIR/_status.md"

# Validar que existe el PRD
if [ ! -d "$PRD_DIR" ]; then
    echo "❌ ERROR: No existe el directorio $PRD_DIR"
    echo "Primero crea la estructura del PRD con el Arquitecto"
    exit 1
fi

# Crear _status.md si no existe
if [ ! -f "$STATUS_FILE" ]; then
    echo "📝 Creando _status.md..."
    cat > "$STATUS_FILE" << 'EOF'
# Feature Status

**Feature**: [Feature Name]
**Last Updated**: [Date]
**Overall Status**: 🔄 In Progress

---

## Agent Status

### Test Agent
- **Status**: ⏸️ Not Started
- **Last Updated**: -

### Implementer Agent
- **Status**: ⏸️ Not Started
- **Last Updated**: -

### Supabase Agent
- **Status**: ⏸️ Not Started
- **Last Updated**: -

### UI/UX Expert
- **Status**: ⏸️ Not Started
- **Last Updated**: -

---

## Notes

(Architect notes go here)
EOF
fi

CURRENT_DATE=$(date +"%Y-%m-%d %H:%M")

# =========================================
# COMANDO: request
# =========================================
if [ "$ACTION" == "request" ]; then
    if [ -z "$AGENT_NAME" ]; then
        echo "❌ ERROR: Falta nombre del agente"
        echo "Uso: /agent-handoff $FEATURE_PATH request {agent}"
        exit 1
    fi

    AGENT_DIR="$PRD_DIR/$AGENT_NAME"
    REQUEST_FILE="$AGENT_DIR/00-request.md"

    echo "=========================================="
    echo "📝 CREAR REQUEST PARA AGENTE"
    echo "=========================================="
    echo ""
    echo "Feature: $FEATURE_PATH"
    echo "Agente: $AGENT_NAME"
    echo ""

    # Crear directorio del agente si no existe
    mkdir -p "$AGENT_DIR"

    # Copiar template
    if [ ! -f "$REQUEST_FILE" ]; then
        if [ -f "PRDs/_templates/agent-request-template.md" ]; then
            cp "PRDs/_templates/agent-request-template.md" "$REQUEST_FILE"
            echo "✅ Template copiado a $REQUEST_FILE"
        else
            echo "⚠️  Template no encontrado, creando archivo vacío"
            touch "$REQUEST_FILE"
        fi
    else
        echo "⚠️  $REQUEST_FILE ya existe, no se sobrescribe"
    fi

    # Actualizar _status.md
    sed -i.bak "/^### $(echo $AGENT_NAME | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')/,/^$/s|- \*\*Status\*\*.*|- **Status**: 🔄 Waiting for Request|" "$STATUS_FILE"
    sed -i.bak "/^### $(echo $AGENT_NAME | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')/,/^$/s|- \*\*Last Updated\*\*.*|- **Last Updated**: $CURRENT_DATE|" "$STATUS_FILE"
    rm -f "$STATUS_FILE.bak"

    echo ""
    echo "=========================================="
    echo "📋 PRÓXIMOS PASOS"
    echo "=========================================="
    echo ""
    echo "1. Edita el archivo: $REQUEST_FILE"
    echo ""
    echo "2. Incluye las siguientes secciones:"
    echo "   ✅ Context and Purpose"
    echo "   ✅ Objectives"
    echo "   ✅ Detailed Requirements"
    echo "   ✅ Technical Specifications"
    echo "   ✅ Expected Deliverables"
    echo "   ✅ Limitations and Constraints"
    echo "   ✅ Success Criteria"
    echo ""
    echo "3. Una vez completado, el agente puede comenzar su trabajo"
    echo ""

# =========================================
# COMANDO: submit
# =========================================
elif [ "$ACTION" == "submit" ]; then
    if [ -z "$AGENT_NAME" ] || [ -z "$ITERATION" ]; then
        echo "❌ ERROR: Faltan argumentos"
        echo "Uso: /agent-handoff $FEATURE_PATH submit {agent} {iteration}"
        exit 1
    fi

    AGENT_DIR="$PRD_DIR/$AGENT_NAME"
    ITERATION_FILE="$AGENT_DIR/${ITERATION}-iteration.md"

    echo "=========================================="
    echo "📤 ENVIAR ITERACIÓN PARA REVISIÓN"
    echo "=========================================="
    echo ""
    echo "Agente: $AGENT_NAME"
    echo "Iteración: $ITERATION"
    echo ""

    # Validar que existe el archivo de iteración
    if [ ! -f "$ITERATION_FILE" ]; then
        echo "❌ ERROR: No existe $ITERATION_FILE"
        echo "El agente debe crear el archivo de iteración primero"
        exit 1
    fi

    # Actualizar _status.md
    AGENT_DISPLAY=$(echo $AGENT_NAME | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    sed -i.bak "/^### $AGENT_DISPLAY/,/^$/s|- \*\*Status\*\*.*|- **Status**: 📋 Review Pending (Iteration $ITERATION)|" "$STATUS_FILE"
    sed -i.bak "/^### $AGENT_DISPLAY/,/^$/s|- \*\*Last Updated\*\*.*|- **Last Updated**: $CURRENT_DATE|" "$STATUS_FILE"
    rm -f "$STATUS_FILE.bak"

    echo "✅ Iteración marcada como 'Pendiente de Revisión'"
    echo ""
    echo "=========================================="
    echo "📋 CHECKLIST DE REVISIÓN (Arquitecto)"
    echo "=========================================="
    echo ""
    echo "Revisa el archivo: $ITERATION_FILE"
    echo ""
    echo "Verifica:"
    echo "  [ ] Todos los objetivos de 00-request.md cumplidos"
    echo "  [ ] Calidad del código/tests/documentación"
    echo "  [ ] No hay violaciones arquitecturales"
    echo "  [ ] Evidencia completa (tests, screenshots, etc.)"
    echo "  [ ] Checklist de calidad marcado"
    echo ""
    echo "Luego ejecuta:"
    echo "  /agent-handoff $FEATURE_PATH approve $AGENT_NAME $ITERATION"
    echo "  O"
    echo "  /agent-handoff $FEATURE_PATH reject $AGENT_NAME $ITERATION"
    echo ""

# =========================================
# COMANDO: approve
# =========================================
elif [ "$ACTION" == "approve" ]; then
    if [ -z "$AGENT_NAME" ] || [ -z "$ITERATION" ]; then
        echo "❌ ERROR: Faltan argumentos"
        echo "Uso: /agent-handoff $FEATURE_PATH approve {agent} {iteration}"
        exit 1
    fi

    AGENT_DIR="$PRD_DIR/$AGENT_NAME"
    ITERATION_FILE="$AGENT_DIR/${ITERATION}-iteration.md"

    echo "=========================================="
    echo "✅ APROBAR ITERACIÓN"
    echo "=========================================="
    echo ""
    echo "Agente: $AGENT_NAME"
    echo "Iteración: $ITERATION"
    echo ""

    if [ ! -f "$ITERATION_FILE" ]; then
        echo "❌ ERROR: No existe $ITERATION_FILE"
        exit 1
    fi

    # Agregar sección de aprobación al archivo de iteración
    if ! grep -q "^### Architect Review" "$ITERATION_FILE"; then
        cat >> "$ITERATION_FILE" << EOF

---

## Review Status

**Submitted for Review**: $CURRENT_DATE

### Architect Review
**Date**: $CURRENT_DATE
**Status**: Approved ✅
**Feedback**:
- All requirements from 00-request.md met
- Quality is acceptable
- Ready for next phase

### User Review
**Date**: $CURRENT_DATE
**Status**: Approved ✅
**Feedback**:
- Business requirements satisfied
EOF
    fi

    # Actualizar _status.md
    AGENT_DISPLAY=$(echo $AGENT_NAME | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    sed -i.bak "/^### $AGENT_DISPLAY/,/^$/s|- \*\*Status\*\*.*|- **Status**: ✅ Approved (Iteration $ITERATION)|" "$STATUS_FILE"
    sed -i.bak "/^### $AGENT_DISPLAY/,/^$/s|- \*\*Last Updated\*\*.*|- **Last Updated**: $CURRENT_DATE|" "$STATUS_FILE"
    rm -f "$STATUS_FILE.bak"

    echo "✅ Iteración $ITERATION aprobada"
    echo "✅ _status.md actualizado"
    echo ""
    echo "=========================================="
    echo "🎯 PRÓXIMOS PASOS"
    echo "=========================================="
    echo ""

    # Determinar siguiente agente
    case $AGENT_NAME in
        "test-agent")
            NEXT_AGENT="implementer"
            NEXT_AGENT_DISPLAY="Implementer Agent"
            ;;
        "implementer")
            NEXT_AGENT="supabase-agent"
            NEXT_AGENT_DISPLAY="Supabase Agent"
            ;;
        "supabase-agent")
            NEXT_AGENT="ui-ux-expert"
            NEXT_AGENT_DISPLAY="UI/UX Expert"
            ;;
        "ui-ux-expert")
            NEXT_AGENT="NONE"
            NEXT_AGENT_DISPLAY="NONE - Feature Complete!"
            ;;
    esac

    if [ "$NEXT_AGENT" == "NONE" ]; then
        echo "🎉 ¡FEATURE COMPLETADA!"
        echo ""
        echo "Pasos finales:"
        echo "  1. npm run test (validar unit tests)"
        echo "  2. npm run test:e2e (validar E2E tests)"
        echo "  3. /validate-architecture (validar Clean Architecture)"
        echo "  4. Crear PR y solicitar code review"
    else
        echo "➡️  Siguiente agente: $NEXT_AGENT_DISPLAY"
        echo ""
        echo "Opciones:"
        echo ""
        echo "A) Secuencial (recomendado):"
        echo "   /agent-handoff $FEATURE_PATH request $NEXT_AGENT"
        echo ""
        echo "B) Paralelo (avanzado - interfaces estables):"
        echo "   /agent-handoff $FEATURE_PATH create-handoff $AGENT_NAME $NEXT_AGENT"
        echo "   /agent-handoff $FEATURE_PATH request $NEXT_AGENT"
    fi
    echo ""

# =========================================
# COMANDO: reject
# =========================================
elif [ "$ACTION" == "reject" ]; then
    if [ -z "$AGENT_NAME" ] || [ -z "$ITERATION" ]; then
        echo "❌ ERROR: Faltan argumentos"
        echo "Uso: /agent-handoff $FEATURE_PATH reject {agent} {iteration}"
        exit 1
    fi

    AGENT_DIR="$PRD_DIR/$AGENT_NAME"
    ITERATION_FILE="$AGENT_DIR/${ITERATION}-iteration.md"
    NEXT_ITERATION=$(printf "%02d" $((10#$ITERATION + 1)))

    echo "=========================================="
    echo "❌ RECHAZAR ITERACIÓN"
    echo "=========================================="
    echo ""
    echo "Agente: $AGENT_NAME"
    echo "Iteración: $ITERATION"
    echo "Siguiente iteración esperada: $NEXT_ITERATION"
    echo ""

    if [ ! -f "$ITERATION_FILE" ]; then
        echo "❌ ERROR: No existe $ITERATION_FILE"
        exit 1
    fi

    # Agregar plantilla de rechazo
    if ! grep -q "^### Architect Review" "$ITERATION_FILE"; then
        cat >> "$ITERATION_FILE" << 'EOF'

---

## Review Status

**Submitted for Review**: [Date]

### Architect Review
**Date**: [Date]
**Status**: Rejected ❌
**Feedback**:

**Issues Found**:

1. **[Issue Title]** (SEVERITY: CRITICAL/HIGH/MEDIUM)
   - **Location**: [Exact file and line number]
   - **Problem**: [Detailed description of what's wrong]
   - **Required Fix**: [Step-by-step correction needed]
   - **Example**: [Code snippet or expected behavior]

2. **[Issue Title]** (SEVERITY: CRITICAL/HIGH/MEDIUM)
   - **Location**: ...
   - **Problem**: ...
   - **Required Fix**: ...

**Action Required**:
Please create iteration XX addressing these issues.

### User Review
**Date**: Pending
**Status**: Waiting for corrections
**Feedback**: Will review after Architect approval
EOF
    fi

    # Actualizar _status.md
    AGENT_DISPLAY=$(echo $AGENT_NAME | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    sed -i.bak "/^### $AGENT_DISPLAY/,/^$/s|- \*\*Status\*\*.*|- **Status**: ❌ Rejected - Needs Revision (Iteration $ITERATION)|" "$STATUS_FILE"
    sed -i.bak "/^### $AGENT_DISPLAY/,/^$/s|- \*\*Last Updated\*\*.*|- **Last Updated**: $CURRENT_DATE|" "$STATUS_FILE"
    rm -f "$STATUS_FILE.bak"

    echo "⚠️  Iteración $ITERATION rechazada"
    echo ""
    echo "=========================================="
    echo "📝 ACCIONES REQUERIDAS"
    echo "=========================================="
    echo ""
    echo "1. Edita $ITERATION_FILE"
    echo "   Completa la sección '## Review Status' con:"
    echo "   - Issues específicos encontrados"
    echo "   - Ubicación exacta (archivo:línea)"
    echo "   - Correcciones requeridas"
    echo ""
    echo "2. El agente debe:"
    echo "   - Leer el feedback en $ITERATION_FILE"
    echo "   - Crear $AGENT_DIR/${NEXT_ITERATION}-iteration.md"
    echo "   - Corregir todos los issues"
    echo "   - Ejecutar: /agent-handoff $FEATURE_PATH submit $AGENT_NAME $NEXT_ITERATION"
    echo ""

# =========================================
# COMANDO: create-handoff
# =========================================
elif [ "$ACTION" == "create-handoff" ]; then
    FROM_AGENT="$AGENT_NAME"
    TO_AGENT="$ITERATION"

    if [ -z "$FROM_AGENT" ] || [ -z "$TO_AGENT" ]; then
        echo "❌ ERROR: Faltan argumentos"
        echo "Uso: /agent-handoff $FEATURE_PATH create-handoff {from-agent} {to-agent}"
        exit 1
    fi

    FROM_DIR="$PRD_DIR/$FROM_AGENT"
    HANDOFF_FILE="$FROM_DIR/handoff-001.md"

    echo "=========================================="
    echo "🔗 CREAR HANDOFF (Paralelismo)"
    echo "=========================================="
    echo ""
    echo "Desde: $FROM_AGENT"
    echo "Hacia: $TO_AGENT"
    echo ""

    mkdir -p "$FROM_DIR"

    # Copiar template
    if [ ! -f "$HANDOFF_FILE" ]; then
        if [ -f "PRDs/_templates/agent-handoff-template.md" ]; then
            cp "PRDs/_templates/agent-handoff-template.md" "$HANDOFF_FILE"
            echo "✅ Template copiado a $HANDOFF_FILE"
        else
            echo "⚠️  Template no encontrado, creando archivo vacío"
            touch "$HANDOFF_FILE"
        fi
    else
        echo "⚠️  $HANDOFF_FILE ya existe"
    fi

    echo ""
    echo "=========================================="
    echo "📋 COMPLETA EL HANDOFF"
    echo "=========================================="
    echo ""
    echo "Edita: $HANDOFF_FILE"
    echo ""
    echo "Incluye:"
    echo "  ✅ Stable Interfaces (function signatures)"
    echo "  ✅ Data Contracts (input/output types)"
    echo "  ✅ Service Interfaces (methods to call)"
    echo "  ✅ Constraints (assumptions, limitations)"
    echo "  ✅ Coordination Notes (what if interfaces change)"
    echo ""
    echo "El agente $TO_AGENT podrá leer este handoff y comenzar en paralelo"
    echo ""

else
    echo "❌ ERROR: Acción desconocida: $ACTION"
    echo ""
    echo "Acciones válidas:"
    echo "  - request"
    echo "  - submit"
    echo "  - approve"
    echo "  - reject"
    echo "  - create-handoff"
    exit 1
fi
```

---

## 💡 Ejemplos de Flujo Completo

### Flujo Secuencial (Normal)

```bash
# 1. Arquitecto crea PRD master y entities.ts
# (manual)

# 2. Arquitecto crea request para Test Agent
/agent-handoff tasks/001-create-task request test-agent

# 3. Test Agent trabaja, crea 01-iteration.md
# (manual)

# 4. Test Agent envía para revisión
/agent-handoff tasks/001-create-task submit test-agent 01

# 5. Arquitecto + Usuario revisan y aprueban
/agent-handoff tasks/001-create-task approve test-agent 01

# 6. Arquitecto crea request para Implementer
/agent-handoff tasks/001-create-task request implementer

# 7. Implementer trabaja...
# (continúa el ciclo)
```

---

### Flujo con Rechazo

```bash
# Test Agent envía iteración
/agent-handoff tasks/001-create-task submit test-agent 01

# Arquitecto encuentra problemas y rechaza
/agent-handoff tasks/001-create-task reject test-agent 01

# Test Agent corrige y crea 02-iteration.md
/agent-handoff tasks/001-create-task submit test-agent 02

# Arquitecto aprueba
/agent-handoff tasks/001-create-task approve test-agent 02
```

---

### Flujo con Paralelismo (Avanzado)

```bash
# Test Agent en iteración 02 (aún corrigiendo)
# Pero interfaces ya son estables

# Arquitecto crea handoff
/agent-handoff tasks/001-create-task create-handoff test-agent implementer

# Arquitecto crea request para Implementer (usa handoff)
/agent-handoff tasks/001-create-task request implementer

# Ahora Test Agent e Implementer trabajan EN PARALELO
```

---

## 🚨 Notas Importantes

1. **Solo Arquitecto crea requests**: Los agentes NO escriben sus propios `00-request.md`
2. **Iteraciones numeradas**: 01, 02, 03... para trazabilidad completa
3. **Feedback específico**: Al rechazar, siempre incluir ubicación exacta y fix requerido
4. **Handoffs son opcionales**: Solo usar cuando interfaces son estables
5. **_status.md es fuente única**: Refleja estado real de todos los agentes
