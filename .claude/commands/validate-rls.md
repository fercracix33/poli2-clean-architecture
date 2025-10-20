---
description: "Valida políticas RLS de Supabase para detectar problemas de rendimiento y seguridad"
allowed-tools: Bash(grep:*), Bash(find:*), Bash(cat:*), mcp__supabase__*
---

# Validate RLS Policies

Validar políticas RLS (Row Level Security) de Supabase para detectar **políticas circulares**, **falta de índices**, y **problemas de rendimiento**.

## 🎯 Objetivo

Escanear migraciones de Supabase y detectar anti-patterns en políticas RLS que causan ralentización y conflictos.

## 📊 Validaciones a Realizar

### 1. DETECTAR POLÍTICAS CIRCULARES

Buscar políticas RLS que contienen joins a la tabla fuente (patrón circular):

```bash
echo "=== 🔍 Detectando Políticas Circulares (CRÍTICO) ==="
echo ""

# Buscar patrones de join circular en políticas RLS
grep -r "CREATE POLICY" supabase/migrations/ -A 10 --include="*.sql" | \
  grep -E "WHERE.*\\..*=.*\\..*|JOIN.*ON.*\\..*=.*\\." | \
  grep -v "^--" && \
  echo "❌ CRÍTICO: Posibles políticas circulares detectadas (joins a tabla fuente)" || \
  echo "✅ No se detectaron políticas circulares evidentes"

echo ""
echo "Patrones a revisar manualmente:"
echo "  - WHERE table.column = source_table.column"
echo "  - JOIN con referencia a la tabla fuente dentro del USING"
echo ""
```

### 2. VERIFICAR ESPECIFICACIÓN DE ROL (TO)

Todas las políticas deben especificar el rol (TO authenticated, TO anon, etc.):

```bash
echo "=== 🔐 Verificando Especificación de Rol (TO) ==="
echo ""

# Contar políticas sin TO role
policies_without_to=$(grep -r "CREATE POLICY" supabase/migrations/ -A 5 --include="*.sql" | \
  grep -v "TO authenticated\|TO anon\|TO service_role" | \
  grep "USING\|WITH CHECK" | wc -l)

if [ "$policies_without_to" -gt 0 ]; then
    echo "❌ ADVERTENCIA: Se encontraron $policies_without_to políticas sin especificar TO role"
    echo "   Esto causa evaluación para TODOS los roles (impacto en rendimiento)"
    echo ""
    grep -r "CREATE POLICY" supabase/migrations/ -A 5 --include="*.sql" | \
      grep -B 3 "USING" | grep -v "TO authenticated\|TO anon\|TO service_role" | head -20
else
    echo "✅ Todas las políticas especifican TO role"
fi

echo ""
```

### 3. VERIFICAR WRAPPING DE auth.uid()

auth.uid() debe estar envuelto en SELECT para mejor rendimiento:

```bash
echo "=== ⚡ Verificando Wrapping de auth.uid() ==="
echo ""

# Buscar auth.uid() sin SELECT
unwrapped_auth=$(grep -r "auth\.uid()" supabase/migrations/ --include="*.sql" | \
  grep -v "(SELECT auth.uid())" | \
  grep -v "^--" | wc -l)

if [ "$unwrapped_auth" -gt 0 ]; then
    echo "⚠️  ADVERTENCIA: Se encontraron $unwrapped_auth usos de auth.uid() sin SELECT wrapper"
    echo "   Recomendación: Usar (SELECT auth.uid()) para mejor rendimiento"
    echo ""
    grep -r "auth\.uid()" supabase/migrations/ --include="*.sql" -n | \
      grep -v "(SELECT auth.uid())" | head -10
else
    echo "✅ Todos los auth.uid() están correctamente envueltos"
fi

echo ""
```

### 4. VERIFICAR ÍNDICES EN COLUMNAS RLS

Las columnas usadas en políticas RLS DEBEN tener índices:

```bash
echo "=== 📊 Verificando Índices en Columnas RLS ==="
echo ""

# Extraer columnas usadas en políticas RLS
echo "Columnas comunes que deberían tener índices:"

# Buscar user_id en políticas
if grep -r "user_id" supabase/migrations/ --include="*rls*.sql" -q; then
    echo "  - user_id (detectado en políticas)"
    grep -r "CREATE INDEX.*user_id" supabase/migrations/ --include="*.sql" -q && \
      echo "    ✅ Índice encontrado" || \
      echo "    ❌ CRÍTICO: Falta índice en user_id"
fi

# Buscar organization_id en políticas
if grep -r "organization_id" supabase/migrations/ --include="*rls*.sql" -q; then
    echo "  - organization_id (detectado en políticas)"
    grep -r "CREATE INDEX.*organization_id" supabase/migrations/ --include="*.sql" -q && \
      echo "    ✅ Índice encontrado" || \
      echo "    ❌ CRÍTICO: Falta índice en organization_id"
fi

# Buscar team_id en políticas
if grep -r "team_id" supabase/migrations/ --include="*rls*.sql" -q; then
    echo "  - team_id (detectado en políticas)"
    grep -r "CREATE INDEX.*team_id" supabase/migrations/ --include="*.sql" -q && \
      echo "    ✅ Índice encontrado" || \
      echo "    ❌ CRÍTICO: Falta índice en team_id"
fi

echo ""
```

### 5. VERIFICAR FUNCIONES SECURITY DEFINER

Políticas complejas deben usar funciones SECURITY DEFINER:

```bash
echo "=== 🛡️  Verificando Funciones Security Definer ==="
echo ""

# Contar funciones security definer
security_definer_count=$(grep -r "SECURITY DEFINER" supabase/migrations/ --include="*.sql" | wc -l)

if [ "$security_definer_count" -eq 0 ]; then
    echo "⚠️  ADVERTENCIA: No se encontraron funciones SECURITY DEFINER"
    echo "   Si tienes políticas complejas, considera usar SECURITY DEFINER functions"
else
    echo "✅ Se encontraron $security_definer_count funciones SECURITY DEFINER"
    echo ""
    grep -r "CREATE.*FUNCTION" supabase/migrations/ --include="*.sql" -A 2 | \
      grep -B 1 "SECURITY DEFINER" | head -20
fi

echo ""
```

### 6. VERIFICAR DOCUMENTACIÓN DE CONTEXT7

Las migraciones RLS deben documentar findings de Context7:

```bash
echo "=== 📝 Verificando Documentación de Context7 ==="
echo ""

# Buscar comentarios de verificación
context7_docs=$(grep -r "Context7 Consultation\|RLS IMPLEMENTATION VERIFICATION" supabase/migrations/ --include="*.sql" | wc -l)

if [ "$context7_docs" -eq 0 ]; then
    echo "❌ CRÍTICO: No se encontró documentación de Context7 en migraciones RLS"
    echo "   Según el agente de Supabase, DEBES documentar findings de Context7"
    echo ""
    echo "   Ejemplo requerido:"
    echo "   /**"
    echo "    * RLS IMPLEMENTATION VERIFICATION"
    echo "    * Context7 Consultation Date: YYYY-MM-DD"
    echo "    * Key Findings: ..."
    echo "    */"
else
    echo "✅ Se encontró documentación de Context7 en $context7_docs migraciones"
fi

echo ""
```

### 7. VERIFICAR WITH CHECK EN INSERT/UPDATE

Políticas INSERT y UPDATE deben tener WITH CHECK clause:

```bash
echo "=== ✔️  Verificando WITH CHECK en INSERT/UPDATE ==="
echo ""

# Buscar políticas INSERT/UPDATE sin WITH CHECK
policies_insert=$(grep -r "FOR INSERT" supabase/migrations/ --include="*.sql" | wc -l)
policies_update=$(grep -r "FOR UPDATE" supabase/migrations/ --include="*.sql" | wc -l)
with_check_count=$(grep -r "WITH CHECK" supabase/migrations/ --include="*.sql" | wc -l)

echo "Políticas INSERT encontradas: $policies_insert"
echo "Políticas UPDATE encontradas: $policies_update"
echo "WITH CHECK clauses encontradas: $with_check_count"
echo ""

total_expected=$((policies_insert + policies_update))

if [ "$with_check_count" -lt "$total_expected" ]; then
    echo "⚠️  ADVERTENCIA: Algunas políticas INSERT/UPDATE no tienen WITH CHECK"
    echo "   Expected: $total_expected | Found: $with_check_count"
    echo ""
    grep -r "FOR INSERT\|FOR UPDATE" supabase/migrations/ -A 5 --include="*.sql" | \
      grep -v "WITH CHECK" | head -20
else
    echo "✅ Todas las políticas INSERT/UPDATE tienen WITH CHECK"
fi

echo ""
```

## 📋 REPORTE DE RENDIMIENTO (Opcional - Requiere DB)

Si tienes acceso a la base de datos, ejecuta estas validaciones:

```bash
echo "=== 🔥 Análisis de Rendimiento (Opcional) ==="
echo ""
echo "Para análisis de rendimiento, ejecuta estos comandos en tu DB:"
echo ""
echo "1. Verificar uso de índices en políticas:"
echo "   EXPLAIN ANALYZE SELECT * FROM [table] LIMIT 100;"
echo ""
echo "2. Verificar definiciones de políticas:"
echo "   SELECT * FROM pg_policies WHERE tablename = '[table]';"
echo ""
echo "3. Buscar políticas circulares:"
echo "   SELECT"
echo "     schemaname, tablename, policyname,"
echo "     pg_get_expr(qual, oid) AS policy_condition"
echo "   FROM pg_policies;"
echo ""
```

## 📊 REPORTE FINAL

```bash
echo "=========================================="
echo "📊 RESUMEN DE VALIDACIÓN RLS"
echo "=========================================="
echo ""
echo "Categorías validadas:"
echo "  ✅ Políticas circulares"
echo "  ✅ Especificación de roles (TO)"
echo "  ✅ Wrapping de auth.uid()"
echo "  ✅ Índices en columnas RLS"
echo "  ✅ Funciones SECURITY DEFINER"
echo "  ✅ Documentación de Context7"
echo "  ✅ WITH CHECK en INSERT/UPDATE"
echo ""
echo "Revisa los resultados anteriores:"
echo "  ✅ = Cumple con mejores prácticas"
echo "  ⚠️  = Advertencia - revisar"
echo "  ❌ = Violación CRÍTICA - corregir"
echo ""
echo "=========================================="
```

## 🚨 Anti-Patterns Comunes a Corregir

### ❌ ANTI-PATTERN 1: Join Circular

```sql
-- ❌ MALO
CREATE POLICY "bad" ON tasks
  USING (
    auth.uid() IN (
      SELECT user_id FROM team_user
      WHERE team_user.team_id = tasks.team_id  -- JOIN a tabla fuente!
    )
  );
```

```sql
-- ✅ CORRECTO
CREATE POLICY "good" ON tasks
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_user
      WHERE user_id = (SELECT auth.uid())
    )
  );
```

### ❌ ANTI-PATTERN 2: Sin TO Role

```sql
-- ❌ MALO (evalúa para todos los roles)
CREATE POLICY "slow" ON tasks
  USING ((SELECT auth.uid()) = user_id);
```

```sql
-- ✅ CORRECTO
CREATE POLICY "fast" ON tasks
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

### ❌ ANTI-PATTERN 3: Sin Índice

```sql
-- ❌ MALO (política sin índice correspondiente)
CREATE POLICY "policy" ON tasks
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
-- Falta: CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

```sql
-- ✅ CORRECTO (índice antes de política)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

CREATE POLICY "policy" ON tasks
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

## 💡 Acciones Recomendadas

Si encontraste problemas:

1. **❌ Políticas Circulares**: CRÍTICO - Refactorizar inmediatamente usando security definer functions
2. **❌ Índices Faltantes**: CRÍTICO - Agregar índices antes de deploy
3. **⚠️ Sin TO Role**: Agregar TO authenticated/anon para mejorar performance
4. **⚠️ Sin WITH CHECK**: Agregar WITH CHECK en INSERT/UPDATE para seguridad
5. **❌ Sin Documentación Context7**: Documentar findings según protocolo del agente

## 📚 Referencias

- Agente de Supabase: `.claude/agents/supabase-data-specialist.md`
- Template RLS: `PRDs/_templates/rls-migration-template.md` (si existe)
- Proyecto Rules: `.trae/rules/project_rules.md`

---

**Nota**: Este comando es CRÍTICO antes de hacer deploy de nuevas migraciones RLS. Ejecutar siempre después de que el Supabase Agent implemente políticas.
