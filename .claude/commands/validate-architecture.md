---
description: "Valida adherencia a Clean Architecture y tecnologías prohibidas"
allowed-tools: Bash(grep:*), Bash(find:*), Bash(cat:*)
---

# Validate Architecture

Validar que el código siga ESTRICTAMENTE las reglas de Clean Architecture y no use tecnologías prohibidas.

## 🎯 Objetivo

Escanear el codebase completo y detectar violaciones arquitectónicas que rompen las reglas INMUTABLES del proyecto.

## 📊 Validaciones a Realizar

### 1. TECNOLOGÍAS PROHIBIDAS

Buscar y reportar uso de tecnologías PROHIBIDAS:

```bash
# ❌ PROHIBIDO: Jest (solo Vitest permitido)
echo "=== Buscando uso de Jest (PROHIBIDO) ==="
grep -r "from ['\"]jest['\"]" app/src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ No se encontró Jest"
grep -r "import.*jest" app/src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ No se encontró Jest"
grep -r "\"jest\":" app/package.json 2>/dev/null || echo "✅ Jest no está en package.json"

# ❌ PROHIBIDO: useEffect para data fetching
echo -e "\n=== Buscando useEffect para data fetching (PROHIBIDO) ==="
grep -r "useEffect.*fetch\|useEffect.*axios\|useEffect.*api" app/src/ --include="*.tsx" --include="*.ts" -n

# ❌ PROHIBIDO: CSS tradicional (solo Tailwind permitido)
echo -e "\n=== Buscando archivos CSS tradicionales (PROHIBIDO) ==="
find app/src/ -name "*.css" ! -name "globals.css" 2>/dev/null || echo "✅ No se encontraron archivos CSS prohibidos"

# ❌ PROHIBIDO: Librerías de estado no aprobadas
echo -e "\n=== Buscando librerías de estado no aprobadas ==="
grep -r "from ['\"]redux\|from ['\"]mobx\|from ['\"]recoil" app/src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ No se encontraron librerías no aprobadas"
```

### 2. VIOLACIONES DE CLEAN ARCHITECTURE

Detectar violaciones de las capas de Clean Architecture:

```bash
echo -e "\n=== Validando capas de Clean Architecture ==="

# ❌ Use Cases NO deben importar de app/ o components/
echo "Validando: Use Cases no deben depender de UI..."
grep -r "from.*['\"]@/app\|from.*['\"]@/components" app/src/features/*/use-cases/ --include="*.ts" 2>/dev/null && echo "❌ VIOLACIÓN: Use cases importando UI" || echo "✅ Use cases no importan UI"

# ❌ Use Cases NO deben importar servicios de Supabase directamente
echo "Validando: Use Cases no deben usar Supabase directamente..."
grep -r "from.*['\"]@supabase\|createClient" app/src/features/*/use-cases/ --include="*.ts" 2>/dev/null && echo "❌ VIOLACIÓN: Use cases usando Supabase directamente" || echo "✅ Use cases usan servicios correctamente"

# ❌ Componentes NO deben importar servicios directamente
echo "Validando: Componentes no deben usar servicios directamente..."
grep -r "from.*['\"].*services.*['\"]" app/src/features/*/components/ --include="*.tsx" 2>/dev/null && echo "❌ VIOLACIÓN: Componentes usando servicios directamente" || echo "✅ Componentes usan use cases correctamente"

# ❌ Services NO deben tener lógica de negocio
echo "Validando: Services no deben tener validaciones de negocio..."
grep -r "if.*throw\|validate\|check.*role\|authorize" app/src/features/*/services/ --include="*.ts" -n 2>/dev/null && echo "⚠️  ADVERTENCIA: Posible lógica de negocio en services" || echo "✅ Services son puros (solo CRUD)"
```

### 3. ESTRUCTURA DE CARPETAS

Validar que la estructura de carpetas siga el estándar:

```bash
echo -e "\n=== Validando estructura de carpetas ==="

# Cada feature debe tener la estructura correcta
for feature_dir in app/src/features/*/; do
    feature_name=$(basename "$feature_dir")
    echo "Validando feature: $feature_name"
    
    # Verificar carpetas obligatorias
    [ -d "$feature_dir/use-cases" ] || echo "  ❌ Falta carpeta: use-cases/"
    [ -d "$feature_dir/services" ] || echo "  ❌ Falta carpeta: services/"
    [ -f "$feature_dir/entities.ts" ] || echo "  ❌ Falta archivo: entities.ts"
    
    # Verificar que use-cases tenga tests
    if [ -d "$feature_dir/use-cases" ]; then
        test_count=$(find "$feature_dir/use-cases" -name "*.test.ts" | wc -l)
        if [ "$test_count" -eq 0 ]; then
            echo "  ❌ No hay tests en use-cases/"
        fi
    fi
done
```

### 4. ZOD VALIDATION

Validar que se use Zod para validaciones:

```bash
echo -e "\n=== Validando uso de Zod ==="

# Verificar que entities.ts use Zod
echo "Buscando schemas Zod en entities.ts..."
grep -r "z\\.object\|z\\.string\|ZodSchema" app/src/features/*/entities.ts 2>/dev/null || echo "⚠️  No se encontraron schemas Zod"

# Verificar que API routes validen con Zod
echo "Verificando validación Zod en API routes..."
grep -r "\\.parse\\(\|.safeParse(" app/src/app/api/ --include="*.ts" 2>/dev/null || echo "⚠️  Las API routes no parecen validar con Zod"
```

## 📋 REPORTE FINAL

Después de ejecutar todas las validaciones, crear un resumen:

```bash
echo -e "\n=========================================="
echo "📊 RESUMEN DE VALIDACIÓN ARQUITECTÓNICA"
echo "=========================================="
echo ""
echo "Revisa los resultados anteriores:"
echo "  ✅ = Cumple con las reglas"
echo "  ❌ = Violación CRÍTICA - debe corregirse"
echo "  ⚠️  = Advertencia - revisar manualmente"
echo ""
echo "=========================================="
```

## 🚨 Acciones Requeridas

Si encontraste violaciones:

1. **❌ Violaciones CRÍTICAS**: Deben corregirse INMEDIATAMENTE antes de continuar
2. **⚠️ Advertencias**: Revisar manualmente y corregir si es necesario
3. **Documentar**: Si una "violación" es intencional, debe documentarse en CLAUDE.md con justificación

## 💡 Ejemplos de Correcciones

**Mal** (Use Case accediendo UI):
```typescript
import { Button } from '@/components/ui/button'; // ❌ PROHIBIDO
```

**Bien** (Use Case puro):
```typescript
import { TaskService } from '../services/task.service'; // ✅ CORRECTO
```

**Mal** (Componente accediendo service):
```typescript
import { taskService } from '../services/task.service'; // ❌ PROHIBIDO
```

**Bien** (Componente usando use case):
```typescript
import { createTask } from '../use-cases/createTask'; // ✅ CORRECTO
```