---
description: "Automatiza el handoff entre agentes y actualiza _status.md"
allowed-tools: Bash(cat:*), Bash(sed:*), Bash(date:*)
---

# Agent Handoff

Automatizar el proceso de handoff entre agentes especializados en el flujo TDD.

## 🎯 Objetivo

Facilitar la transición entre agentes, actualizando automáticamente el `_status.md` y proporcionando contexto al siguiente agente.

## 🔄 Secuencia de Agentes (INMUTABLE)

```
Arquitecto → Test Agent → Implementer → Supabase Agent → UI/UX Expert
```

## 📝 Uso

```bash
# Completar handoff del agente actual
/agent-handoff   

# Ejemplos:
/agent-handoff tasks/001-create-task arquitecto completed
/agent-handoff tasks/001-create-task test-agent completed
/agent-handoff tasks/001-create-task implementer in-progress
```

## 🤖 Agentes Válidos

- `arquitecto` → Architect Agent
- `test-agent` → Test Agent  
- `implementer` → Implementer Agent
- `supabase-agent` → Supabase Agent
- `ui-ux-agent` → UI/UX Expert Agent

## 📊 Status Válidos

- `not-started` - No iniciado
- `in-progress` - En progreso
- `completed` - Completado
- `blocked` - Bloqueado

## 🔧 Implementación del Handoff

```bash
# Parsear argumentos
IFS=' ' read -r PRD_PATH CURRENT_AGENT STATUS <<< "$ARGUMENTS"

# Validar argumentos
if [ -z "$PRD_PATH" ] || [ -z "$CURRENT_AGENT" ] || [ -z "$STATUS" ]; then
    echo "❌ ERROR: Uso incorrecto"
    echo "Uso: /agent-handoff   "
    echo "Ejemplo: /agent-handoff tasks/001-create-task arquitecto completed"
    exit 1
fi

PRD_DIR="PRDs/$PRD_PATH"
STATUS_FILE="$PRD_DIR/_status.md"

# Validar que existe el PRD
if [ ! -d "$PRD_DIR" ]; then
    echo "❌ ERROR: No existe el directorio $PRD_DIR"
    exit 1
fi

if [ ! -f "$STATUS_FILE" ]; then
    echo "❌ ERROR: No existe _status.md en $PRD_DIR"
    exit 1
fi

echo "=========================================="
echo "🔄 AGENT HANDOFF: $CURRENT_AGENT"
echo "=========================================="
echo ""

# Determinar el nombre legible del agente
case $CURRENT_AGENT in
    "arquitecto")
        AGENT_NAME="Arquitecto (Architect)"
        NEXT_AGENT="Test Agent"
        AGENT_DOC="00-master-prd.md"
        ;;
    "test-agent")
        AGENT_NAME="Test Agent"
        NEXT_AGENT="Implementer Agent"
        AGENT_DOC="02-test-spec.md"
        ;;
    "implementer")
        AGENT_NAME="Implementer Agent"
        NEXT_AGENT="Supabase Agent"
        AGENT_DOC="03-implementation-spec.md"
        ;;
    "supabase-agent")
        AGENT_NAME="Supabase Agent"
        NEXT_AGENT="UI/UX Expert Agent"
        AGENT_DOC="01-supabase-spec.md"
        ;;
    "ui-ux-agent")
        AGENT_NAME="UI/UX Expert Agent"
        NEXT_AGENT="NINGUNO (Feature Completa)"
        AGENT_DOC="04-ui-spec.md"
        ;;
    *)
        echo "❌ ERROR: Agente desconocido: $CURRENT_AGENT"
        exit 1
        ;;
esac

# Mostrar info del handoff
echo "📋 PRD: $PRD_PATH"
echo "👤 Agente Actual: $AGENT_NAME"
echo "📄 Documento: $AGENT_DOC"
echo "📊 Status: $STATUS"
echo "➡️  Siguiente: $NEXT_AGENT"
echo ""
```

### 1. ACTUALIZAR _status.md

```bash
echo "=== ACTUALIZANDO _status.md ==="

# Obtener fecha actual
CURRENT_DATE=$(date +"%Y-%m-%d")

# Preparar el status del agente según el formato requerido
case $STATUS in
    "completed")
        STATUS_EMOJI="✅"
        STATUS_TEXT="Completed"
        ;;
    "in-progress")
        STATUS_EMOJI="🔄"
        STATUS_TEXT="In Progress"
        ;;
    "blocked")
        STATUS_EMOJI="🚫"
        STATUS_TEXT="Blocked"
        ;;
    "not-started")
        STATUS_EMOJI="⏸️"
        STATUS_TEXT="Not Started"
        ;;
    *)
        echo "❌ ERROR: Status inválido: $STATUS"
        exit 1
        ;;
esac

# Actualizar la línea del agente en _status.md
# Formato: - **Architect**: ✅ Completed (2025-01-15)

# Buscar y reemplazar la línea del agente
if grep -q "**$AGENT_NAME**" "$STATUS_FILE"; then
    # Agente ya existe, actualizar
    sed -i.bak "s|- \*\*$AGENT_NAME\*\*.*|- **$AGENT_NAME**: $STATUS_EMOJI $STATUS_TEXT ($CURRENT_DATE)|" "$STATUS_FILE"
    echo "  ✅ Status actualizado para $AGENT_NAME"
else
    echo "  ⚠️  No se encontró entrada para $AGENT_NAME en _status.md"
    echo "  📝 Agregando entrada..."
    
    # Agregar nueva entrada en la sección de Agent Status
    # Buscar la línea "## Agent Status" y agregar después
    sed -i.bak "/^## Agent Status/a\\
- **$AGENT_NAME**: $STATUS_EMOJI $STATUS_TEXT ($CURRENT_DATE)" "$STATUS_FILE"
fi

# Actualizar Last Updated
sed -i.bak "s|^**Last Updated:**.*|**Last Updated:** $CURRENT_DATE|" "$STATUS_FILE"

# Si el agente está completed, actualizar el Overall Status
if [ "$STATUS" == "completed" ]; then
    # Contar cuántos agentes están completed
    COMPLETED_COUNT=$(grep -c "✅ Completed" "$STATUS_FILE")
    
    if [ "$COMPLETED_COUNT" -ge 5 ]; then
        sed -i.bak "s|^**Status:**.*|**Status:** ✅ Completed|" "$STATUS_FILE"
        echo "  🎉 ¡TODOS LOS AGENTES COMPLETADOS! Feature lista."
    else
        sed -i.bak "s|^**Status:**.*|**Status:** 🔄 In Progress|" "$STATUS_FILE"
    fi
fi

# Limpiar backup
rm -f "$STATUS_FILE.bak"

echo "  ✅ _status.md actualizado"
echo ""
```

### 2. VALIDAR ENTREGABLES DEL AGENTE

```bash
echo "=== VALIDANDO ENTREGABLES ==="

case $CURRENT_AGENT in
    "arquitecto")
        # Validar que exista 00-master-prd.md completo
        if [ -f "$PRD_DIR/00-master-prd.md" ]; then
            echo "  ✅ 00-master-prd.md existe"
        else
            echo "  ❌ FALTA: 00-master-prd.md"
        fi
        
        # Validar entities.ts
        FEATURE_NAME=$(basename "$PRD_PATH")
        if [ -f "app/src/features/$FEATURE_NAME/entities.ts" ]; then
            echo "  ✅ entities.ts creado"
        else
            echo "  ⚠️  entities.ts no encontrado - verificar feature name"
        fi
        ;;
        
    "test-agent")
        # Validar que existan archivos .test.ts
        FEATURE_NAME=$(basename "$PRD_PATH")
        TEST_COUNT=$(find "app/src/features/$FEATURE_NAME" -name "*.test.ts" 2>/dev/null | wc -l)
        
        if [ "$TEST_COUNT" -gt 0 ]; then
            echo "  ✅ Tests creados ($TEST_COUNT archivos)"
        else
            echo "  ❌ No se encontraron archivos .test.ts"
        fi
        
        # Validar 02-test-spec.md
        if [ -f "$PRD_DIR/02-test-spec.md" ]; then
            echo "  ✅ 02-test-spec.md existe"
        else
            echo "  ❌ FALTA: 02-test-spec.md"
        fi
        ;;
        
    "implementer")
        # Validar que existan use-cases
        FEATURE_NAME=$(basename "$PRD_PATH")
        USECASE_COUNT=$(find "app/src/features/$FEATURE_NAME/use-cases" -name "*.ts" ! -name "*.test.ts" 2>/dev/null | wc -l)
        
        if [ "$USECASE_COUNT" -gt 0 ]; then
            echo "  ✅ Use cases implementados ($USECASE_COUNT archivos)"
        else
            echo "  ❌ No se encontraron use cases"
        fi
        ;;
        
    "supabase-agent")
        # Validar que existan services
        FEATURE_NAME=$(basename "$PRD_PATH")
        if [ -f "app/src/features/$FEATURE_NAME/services/"*.service.ts ]; then
            echo "  ✅ Services implementados"
        else
            echo "  ❌ No se encontraron services"
        fi
        
        # Validar migrations
        MIGRATION_COUNT=$(find "app/supabase/migrations" -name "*.sql" 2>/dev/null | wc -l)
        echo "  📊 Migraciones encontradas: $MIGRATION_COUNT"
        ;;
        
    "ui-ux-agent")
        # Validar componentes
        FEATURE_NAME=$(basename "$PRD_PATH")
        COMPONENT_COUNT=$(find "app/src/features/$FEATURE_NAME/components" -name "*.tsx" 2>/dev/null | wc -l)
        
        if [ "$COMPONENT_COUNT" -gt 0 ]; then
            echo "  ✅ Componentes creados ($COMPONENT_COUNT archivos)"
        else
            echo "  ❌ No se encontraron componentes"
        fi
        
        # Validar tests E2E
        E2E_COUNT=$(find "app/e2e" -name "*${FEATURE_NAME}*.spec.ts" 2>/dev/null | wc -l)
        if [ "$E2E_COUNT" -gt 0 ]; then
            echo "  ✅ Tests E2E creados ($E2E_COUNT archivos)"
        else
            echo "  ⚠️  No se encontraron tests E2E"
        fi
        ;;
esac

echo ""
```

### 3. GENERAR HANDOFF SUMMARY

```bash
echo "=========================================="
echo "📊 HANDOFF SUMMARY"
echo "=========================================="
echo ""
echo "✅ Agente: $AGENT_NAME"
echo "✅ Status actualizado: $STATUS_TEXT"
echo "✅ Fecha: $CURRENT_DATE"
echo ""

if [ "$STATUS" == "completed" ]; then
    echo "🎯 PRÓXIMO PASO:"
    echo ""
    if [ "$NEXT_AGENT" == "NINGUNO (Feature Completa)" ]; then
        echo "  🎉 ¡FEATURE COMPLETADA!"
        echo "  📋 Pasos finales:"
        echo "     1. Ejecutar todos los tests: npm run test"
        echo "     2. Ejecutar E2E: npm run test:e2e"
        echo "     3. Validar arquitectura: /validate-architecture"
        echo "     4. Crear PR y solicitar code review"
    else
        echo "  ➡️  Siguiente agente: $NEXT_AGENT"
        echo ""
        echo "  📝 El $NEXT_AGENT debe:"
        
        case $NEXT_AGENT in
            "Test Agent")
                echo "     1. Leer PRD master (00-master-prd.md)"
                echo "     2. Copiar template: 02-test-template.md"
                echo "     3. Crear tests que FALLEN para todas las capas"
                echo "     4. Configurar mocks apropiados"
                echo "     5. Ejecutar: /agent-handoff $PRD_PATH test-agent completed"
                ;;
            "Implementer Agent")
                echo "     1. Leer tests del Test Agent"
                echo "     2. Implementar use cases para pasar tests"
                echo "     3. NO modificar tests"
                echo "     4. Validar cobertura >90%"
                echo "     5. Ejecutar: /agent-handoff $PRD_PATH implementer completed"
                ;;
            "Supabase Agent")
                echo "     1. Leer especificación de services"
                echo "     2. Crear schema de base de datos"
                echo "     3. Implementar RLS policies"
                echo "     4. Implementar services puros (solo CRUD)"
                echo "     5. Ejecutar: /agent-handoff $PRD_PATH supabase-agent completed"
                ;;
            "UI/UX Expert Agent")
                echo "     1. Leer especificación de UI"
                echo "     2. Crear componentes con shadcn/ui"
                echo "     3. Implementar tests E2E"
                echo "     4. Validar accesibilidad WCAG 2.1 AA"
                echo "     5. Ejecutar: /agent-handoff $PRD_PATH ui-ux-agent completed"
                ;;
        esac
    fi
fi

echo ""
echo "=========================================="
```

## 🚨 Casos Especiales

### Handoff con Status "blocked"

Si un agente se bloquea:

```bash
/agent-handoff tasks/001-create-task implementer blocked

# Esto actualizará el status pero NO pasará al siguiente agente
# El Arquitecto debe investigar y resolver el bloqueo
```

### Reiniciar Handoff

Si necesitas reiniciar un agente:

```bash
/agent-handoff tasks/001-create-task test-agent not-started

# Esto marca el agente como "not-started" y permite volver a ejecutarlo
```

## 💡 Integración con Workflow

Este comando se integra con el workflow TDD:

```bash
# 1. Arquitecto completa su trabajo
/agent-handoff tasks/001-create-task arquitecto completed

# 2. Test Agent completa tests
/agent-handoff tasks/001-create-task test-agent completed

# 3. Implementer completa use cases
/agent-handoff tasks/001-create-task implementer completed

# 4. Supabase Agent completa services
/agent-handoff tasks/001-create-task supabase-agent completed

# 5. UI/UX Expert completa UI
/agent-handoff tasks/001-create-task ui-ux-agent completed

# 🎉 Feature completada!
```