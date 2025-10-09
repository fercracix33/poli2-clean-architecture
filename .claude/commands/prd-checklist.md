---
description: "Valida que el PRD esté completo y todas las secciones estén llenas"
allowed-tools: Bash(cat:*), Bash(find:*), Bash(grep:*)
---

# PRD Checklist Validation

Validar que el PRD (Product Requirements Document) esté completo y siga la estructura definida en los templates.

## 🎯 Objetivo

Verificar que un PRD específico tenga todas las secciones requeridas completadas correctamente según el template correspondiente.

## 📂 Uso

```bash
# Validar un PRD específico
/prd-checklist tasks/001-create-task

# El comando buscará en: PRDs/tasks/001-create-task/
```

## 🔍 Validaciones por Tipo de Documento

### 1. VALIDAR MASTER PRD (00-master-prd.md)

```bash
PRD_PATH="PRDs/$ARGUMENTS"

if [ ! -d "$PRD_PATH" ]; then
    echo "❌ ERROR: No existe el directorio $PRD_PATH"
    exit 1
fi

echo "=========================================="
echo "📋 VALIDANDO: $PRD_PATH"
echo "=========================================="
echo ""

# Validar que existe el archivo master
MASTER_FILE="$PRD_PATH/00-master-prd.md"
if [ ! -f "$MASTER_FILE" ]; then
    echo "❌ CRÍTICO: No existe 00-master-prd.md"
    exit 1
fi

echo "✅ Archivo master encontrado"
echo ""
echo "=== VALIDANDO SECCIONES REQUERIDAS ==="

# Array de secciones obligatorias
declare -a required_sections=(
    "# Feature ID"
    "## 1. Executive Summary"
    "## 2. Problem Statement"
    "## 3. Goals and Success Metrics"
    "## 4. User Stories"
    "## 5. Functional Requirements"
    "## 6. Data Contracts"
    "## 7. API Specifications"
    "## 8. Technical Architecture"
    "## 9. Testing Strategy"
    "## 10. Security Considerations"
    "## 11. Acceptance Criteria"
    "## 12. Out of Scope"
)

# Validar cada sección
missing_sections=0
for section in "${required_sections[@]}"; do
    if grep -q "^$section" "$MASTER_FILE"; then
        echo "  ✅ $section"
        
        # Verificar que la sección no esté vacía (tiene contenido después del header)
        section_content=$(sed -n "/^$section/,/^##/p" "$MASTER_FILE" | tail -n +2 | head -n -1 | tr -d '[:space:]')
        if [ -z "$section_content" ]; then
            echo "    ⚠️  Sección parece vacía - revisar manualmente"
        fi
    else
        echo "  ❌ FALTA: $section"
        ((missing_sections++))
    fi
done

echo ""
```

### 2. VALIDAR ENTITIES (entities.ts debe existir)

```bash
echo "=== VALIDANDO DATA CONTRACTS ==="

# Buscar el feature name del PRD
FEATURE_NAME=$(grep "^# Feature ID:" "$MASTER_FILE" | sed 's/# Feature ID: //' | tr -d '[:space:]')

if [ -z "$FEATURE_NAME" ]; then
    echo "⚠️  No se pudo extraer Feature Name del PRD"
else
    # Buscar entities.ts en features
    ENTITIES_FILE="app/src/features/${FEATURE_NAME}/entities.ts"
    
    if [ -f "$ENTITIES_FILE" ]; then
        echo "  ✅ entities.ts existe: $ENTITIES_FILE"
        
        # Validar que tenga Zod schemas
        if grep -q "z\\.object\\|ZodSchema" "$ENTITIES_FILE"; then
            echo "    ✅ Contiene schemas Zod"
        else
            echo "    ❌ No contiene schemas Zod"
        fi
        
        # Validar exports
        if grep -q "export type\\|export const.*Schema" "$ENTITIES_FILE"; then
            echo "    ✅ Exporta tipos correctamente"
        else
            echo "    ⚠️  Verificar exports de tipos"
        fi
    else
        echo "  ❌ entities.ts NO EXISTE: $ENTITIES_FILE"
        echo "    El Arquitecto debe crear este archivo"
    fi
fi

echo ""
```

### 3. VALIDAR OTROS DOCUMENTOS PRD

```bash
echo "=== VALIDANDO DOCUMENTOS COMPLEMENTARIOS ==="

# Array de documentos que deben existir
declare -a prd_documents=(
    "01-supabase-spec.md:Supabase Agent"
    "02-test-spec.md:Test Agent"
    "03-implementation-spec.md:Implementer Agent"
    "04-ui-spec.md:UI/UX Expert Agent"
    "_status.md:Status Tracking"
)

for doc_info in "${prd_documents[@]}"; do
    doc_name="${doc_info%%:*}"
    agent_name="${doc_info##*:}"
    doc_path="$PRD_PATH/$doc_name"
    
    if [ -f "$doc_path" ]; then
        echo "  ✅ $doc_name ($agent_name)"
        
        # Verificar que no esté vacío (más de 100 bytes)
        file_size=$(stat -f%z "$doc_path" 2>/dev/null || stat -c%s "$doc_path" 2>/dev/null)
        if [ "$file_size" -lt 100 ]; then
            echo "    ⚠️  Archivo muy pequeño - puede estar vacío"
        fi
    else
        echo "  ❌ FALTA: $doc_name ($agent_name)"
    fi
done

echo ""
```

### 4. VALIDAR STATUS TRACKING

```bash
echo "=== VALIDANDO STATUS TRACKING ==="

STATUS_FILE="$PRD_PATH/_status.md"

if [ ! -f "$STATUS_FILE" ]; then
    echo "❌ CRÍTICO: No existe _status.md"
else
    echo "✅ _status.md existe"
    echo ""
    
    # Extraer información clave del status
    echo "Estado actual del PRD:"
    echo ""
    
    # Feature ID
    grep "Feature ID:" "$STATUS_FILE" || echo "  ⚠️  Falta Feature ID"
    
    # Status general
    grep "Status:" "$STATUS_FILE" || echo "  ⚠️  Falta Status"
    
    # Agentes completados
    echo ""
    echo "Progreso de Agentes:"
    grep "## Agent Status" -A 20 "$STATUS_FILE" | grep "^-" || echo "  ⚠️  No se encontró info de agentes"
fi

echo ""
```

## 📊 REPORTE FINAL

```bash
echo "=========================================="
echo "📊 RESUMEN DE VALIDACIÓN PRD"
echo "=========================================="
echo ""

if [ $missing_sections -eq 0 ]; then
    echo "✅ Master PRD tiene todas las secciones requeridas"
else
    echo "❌ Master PRD tiene $missing_sections secciones faltantes"
fi

echo ""
echo "Revisa los detalles anteriores para:"
echo "  • Secciones faltantes en el Master PRD"
echo "  • Archivos de agentes pendientes"
echo "  • Estado de entities.ts"
echo "  • Status tracking actualizado"
echo ""
echo "=========================================="
```

## 🚨 Acciones Requeridas

Según los resultados:

1. **❌ Secciones faltantes**: El Arquitecto debe completar el Master PRD
2. **❌ entities.ts faltante**: El Arquitecto debe crear el archivo de entidades
3. **❌ Documentos de agentes faltantes**: Cada agente debe copiar su template y completarlo
4. **⚠️ Secciones vacías**: Revisar y llenar con contenido apropiado

## 💡 Comando para Crear PRD Desde Cero

Si el PRD no existe:

```bash
# Crear estructura de PRD
FEATURE_PATH="PRDs/tasks/001-create-task"
mkdir -p "$FEATURE_PATH"

# Copiar templates
cp PRDs/_templates/00-master-prd-template.md "$FEATURE_PATH/00-master-prd.md"
cp PRDs/_templates/01-supabase-template.md "$FEATURE_PATH/01-supabase-spec.md"
cp PRDs/_templates/02-test-template.md "$FEATURE_PATH/02-test-spec.md"
cp PRDs/_templates/03-implementation-template.md "$FEATURE_PATH/03-implementation-spec.md"
cp PRDs/_templates/04-ui-template.md "$FEATURE_PATH/04-ui-spec.md"
cp PRDs/_templates/_status-template.md "$FEATURE_PATH/_status.md"

echo "✅ Estructura PRD creada en $FEATURE_PATH"
```






