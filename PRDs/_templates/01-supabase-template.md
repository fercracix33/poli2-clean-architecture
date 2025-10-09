# Supabase Specifications: [Feature Name]

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Feature ID:** [feature-id]
- **Assigned Agent:** Supabase Agent
- **Status:** [Pending | In Progress | Completed]

---

## 1. Schema de Base de Datos

### Tabla Principal: [table_name]
```sql
CREATE TABLE [table_name] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  [field_name] [TYPE] [CONSTRAINTS],
  [another_field] [TYPE] [CONSTRAINTS],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_[table_name]_[field] ON [table_name]([field]);

-- Triggers para updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Tablas Relacionadas
[Definición de tablas adicionales si las hay]

### Relaciones (Foreign Keys)
```sql
-- Ejemplo de relación
ALTER TABLE [table_name] 
ADD CONSTRAINT fk_[table_name]_[related_table]
FOREIGN KEY ([foreign_key_field]) 
REFERENCES [related_table](id) 
ON DELETE [CASCADE | SET NULL | RESTRICT];
```

---

## 2. Políticas de Row Level Security (RLS)

### Habilitar RLS
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### Políticas de Lectura (SELECT)
```sql
-- Política para lectura individual
CREATE POLICY "Users can read own [resource]" ON [table_name]
  FOR SELECT USING (auth.uid() = user_id);

-- Política para lectura pública (si aplica)
CREATE POLICY "Public read access" ON [table_name]
  FOR SELECT USING (is_public = true);
```

### Políticas de Escritura (INSERT)
```sql
-- Política para creación
CREATE POLICY "Users can create own [resource]" ON [table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Políticas de Actualización (UPDATE)
```sql
-- Política para actualización
CREATE POLICY "Users can update own [resource]" ON [table_name]
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Políticas de Eliminación (DELETE)
```sql
-- Política para eliminación
CREATE POLICY "Users can delete own [resource]" ON [table_name]
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 3. Servicios de Datos (Data Access Layer)

### Archivo: `src/features/[feature-name]/services/[feature-name].service.ts`

```typescript
import { supabase } from '@/lib/supabase';
import { [EntityName], [EntityName]Create, [EntityName]Update } from '../entities';

// Crear [resource]
export async function create[EntityName]InDB(
  data: [EntityName]Create, 
  userId: string
): Promise<[EntityName]> {
  const { data: result, error } = await supabase
    .from('[table_name]')
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error('Error creating [resource]:', error);
    throw new Error('Could not create the [resource].');
  }

  return result;
}

// Obtener [resource] por ID
export async function get[EntityName]ByIdFromDB(
  id: string, 
  userId: string
): Promise<[EntityName] | null> {
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No encontrado
    }
    console.error('Error fetching [resource]:', error);
    throw new Error('Could not fetch the [resource].');
  }

  return data;
}

// Listar [resources] del usuario
export async function list[EntityName]sFromDB(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<[EntityName][]> {
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error listing [resources]:', error);
    throw new Error('Could not list [resources].');
  }

  return data || [];
}

// Actualizar [resource]
export async function update[EntityName]InDB(
  id: string,
  data: [EntityName]Update,
  userId: string
): Promise<[EntityName]> {
  const { data: result, error } = await supabase
    .from('[table_name]')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating [resource]:', error);
    throw new Error('Could not update the [resource].');
  }

  return result;
}

// Eliminar [resource]
export async function delete[EntityName]FromDB(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('[table_name]')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting [resource]:', error);
    throw new Error('Could not delete the [resource].');
  }
}
```

---

## 4. Migraciones

### Archivo de Migración: `[timestamp]_create_[table_name]_table.sql`

```sql
-- Crear tabla principal
CREATE TABLE [table_name] (
  -- [Definición completa de la tabla]
);

-- Habilitar RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Crear políticas
-- [Todas las políticas definidas arriba]

-- Crear índices
-- [Todos los índices necesarios]

-- Insertar datos de prueba (solo en desarrollo)
-- INSERT INTO [table_name] (...) VALUES (...);
```

---

## 5. Funciones de Base de Datos (Si son necesarias)

### Función: [function_name]
```sql
CREATE OR REPLACE FUNCTION [function_name]([parameters])
RETURNS [return_type]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lógica de la función
  RETURN [result];
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION [function_name] TO authenticated;
```

---

## 6. Validaciones y Constraints

### Constraints de Base de Datos
```sql
-- Ejemplo de constraint de validación
ALTER TABLE [table_name] 
ADD CONSTRAINT check_[field_name] 
CHECK ([field_name] IN ('value1', 'value2', 'value3'));

-- Constraint de unicidad
ALTER TABLE [table_name] 
ADD CONSTRAINT unique_[field_name] 
UNIQUE ([field_name]);
```

### Validaciones en el Servicio
```typescript
// Validaciones adicionales en TypeScript
function validateBusinessRules(data: [EntityName]Create): void {
  // Ejemplo: validar reglas de negocio específicas
  if (data.[field] && data.[field].length > 1000) {
    throw new Error('[Field] cannot exceed 1000 characters');
  }
}
```

---

## 7. Testing de Base de Datos

### Datos de Prueba
```sql
-- Insertar datos para testing
INSERT INTO [table_name] ([fields]) VALUES
  ([test_values_1]),
  ([test_values_2]),
  ([test_values_3]);
```

### Verificación de Políticas RLS
```sql
-- Test de política de lectura
SELECT * FROM [table_name] WHERE user_id = '[test_user_id]';

-- Test de política de escritura
INSERT INTO [table_name] ([fields]) VALUES ([test_values]);
```

---

## 8. Performance y Optimización

### Índices Recomendados
- `idx_[table_name]_user_id` - Para filtros por usuario
- `idx_[table_name]_created_at` - Para ordenamiento temporal
- `idx_[table_name]_[search_field]` - Para búsquedas frecuentes

### Consideraciones de Performance
- [Estrategias de optimización específicas]
- [Límites de paginación recomendados]
- [Campos que requieren índices compuestos]

---

## 9. Seguridad

### Checklist de Seguridad
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de seguridad implementadas para todos los roles
- [ ] Validación de entrada en servicios
- [ ] Sanitización de datos sensibles
- [ ] Logs de auditoría (si son necesarios)

### Roles y Permisos
- **authenticated:** [Permisos específicos]
- **anon:** [Permisos específicos]
- **service_role:** [Permisos específicos]

---

## 10. Checklist de Completitud

- [ ] Schema de base de datos creado
- [ ] RLS habilitado y políticas implementadas
- [ ] Servicios de datos implementados
- [ ] Migraciones creadas y probadas
- [ ] Índices de performance añadidos
- [ ] Funciones de base de datos (si aplican)
- [ ] Datos de prueba insertados
- [ ] Validaciones implementadas
- [ ] Documentación actualizada

---

**Completado por:** [Nombre del Supabase Agent]
**Fecha de Completitud:** [YYYY-MM-DD]
**Revisado por:** [Nombre del revisor]