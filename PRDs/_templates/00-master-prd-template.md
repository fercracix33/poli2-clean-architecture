# PRD: [Nombre de la Feature]

## Metadata
- **Feature ID:** [domain]-[number] (ej: tasks-001, auth-002)
- **Version:** [X.Y] (ej: 1.0, 1.1)
- **Created:** [YYYY-MM-DD]
- **Status:** [Draft | In Development | Testing | Completed | Deprecated]
- **Dependencies:** [Lista de features requeridas]
- **Assigned Architect:** [Nombre del arquitecto responsable]

---

## 1. User Story
> Como un **[Tipo de Usuario específico]**, quiero **[Realizar una Acción específica]** para poder **[Obtener un Beneficio concreto]**.

### Contexto del Negocio
[Explicación del problema que resuelve esta feature y por qué es importante]

### Usuarios Objetivo
- **Primarios:** [Usuarios principales que usarán esta feature]
- **Secundarios:** [Usuarios que se benefician indirectamente]

---

## 2. Criterios de Aceptación

### Funcionales
- **DEBE** [comportamiento esperado obligatorio]
- **DEBE** [otro comportamiento crítico]
- **NO DEBE** [comportamiento explícitamente prohibido]
- **PUEDE** [comportamiento opcional deseable]

### No Funcionales
- **Performance:** DEBE responder en menos de [X]ms
- **Accesibilidad:** DEBE cumplir WCAG 2.1 AA mínimo
- **Responsividad:** DEBE funcionar en móvil (375px+), tablet (768px+) y desktop (1024px+)
- **Seguridad:** DEBE implementar [requisitos de seguridad específicos]
- **Escalabilidad:** DEBE soportar [número] de usuarios concurrentes

---

## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales
- **Nueva Entidad:** `[EntityName]` en `src/features/[feature-name]/entities.ts`
- **Entidades Modificadas:** [Lista de entidades existentes que se modificarán]

### Schemas de Zod
```typescript
// Ejemplo - Reemplazar con schemas reales
export const [EntityName]Schema = z.object({
  id: z.string().cuid(),
  [field]: z.string().min(1, "Campo requerido").max(100, "Máximo 100 caracteres"),
  [anotherField]: z.string().email("Email inválido"),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const [EntityName]CreateSchema = [EntityName]Schema.omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export const [EntityName]UpdateSchema = [EntityName]Schema.pick({ 
  [field]: true 
}).partial();

export type [EntityName] = z.infer<typeof [EntityName]Schema>;
export type [EntityName]Create = z.infer<typeof [EntityName]CreateSchema>;
export type [EntityName]Update = z.infer<typeof [EntityName]UpdateSchema>;
```

### Relaciones
- **[EntityName]** pertenece a **[RelatedEntity]** (many-to-one)
- **[EntityName]** tiene muchos **[ChildEntity]** (one-to-many)

---

## 4. Contrato de API Endpoints

### Endpoint Principal: [Método] [Ruta]
- **Ruta:** `[METHOD] /api/[resource]`
- **Autenticación:** [Requerida | Opcional | No requerida]
- **Body Schema:** `[SchemaName]`
- **Query Parameters:** [Lista de parámetros opcionales]

#### Respuestas
- **Éxito:** `[código]` con schema `[ResponseSchema]`
- **Errores:**
  - `400` - Bad Request: [Condición específica]
  - `401` - Unauthorized: [Condición específica]
  - `403` - Forbidden: [Condición específica]
  - `404` - Not Found: [Condición específica]
  - `500` - Internal Server Error: [Condición específica]

### Endpoints Adicionales
[Lista de otros endpoints si los hay]

---

## 5. Especificaciones de UI/UX

### Componentes Requeridos
- **Componente Principal:** `[ComponentName]` en `src/features/[feature-name]/components/`
- **Componentes Secundarios:** [Lista de componentes adicionales]
- **Páginas:** `src/app/(main)/[feature]/page.tsx`

### Flujos de Usuario
1. **Flujo Principal:**
   - Usuario [acción inicial]
   - Sistema [respuesta del sistema]
   - Usuario [siguiente acción]
   - Sistema [resultado final]

2. **Flujos Alternativos:**
   - [Descripción de flujos secundarios]

### Estados de la Interfaz
- **Loading:** [Descripción del estado de carga]
- **Error:** [Descripción del manejo de errores]
- **Empty:** [Descripción del estado vacío]
- **Success:** [Descripción del estado exitoso]

### Wireframes/Mockups
[Enlaces o descripciones de diseños visuales si están disponibles]

---

## 6. Consideraciones Técnicas

### Seguridad
- **Políticas RLS:** [Descripción de políticas de Row Level Security necesarias]
- **Validaciones:** [Validaciones de autorización específicas]
- **Sanitización:** [Campos que requieren sanitización especial]

### Performance
- **Optimizaciones:** [Optimizaciones específicas requeridas]
- **Caching:** [Estrategias de cache si aplican]
- **Paginación:** [Límites y estrategias de paginación]

### Integraciones
- **APIs Externas:** [Servicios externos requeridos]
- **Webhooks:** [Webhooks necesarios]
- **Background Jobs:** [Tareas en segundo plano]

---

## 7. Referencias a Documentos Específicos
- **Supabase:** `01-supabase-spec.md`
- **Testing:** `02-test-spec.md`
- **Implementation:** `03-implementation-spec.md`
- **UI/UX:** `04-ui-spec.md`
- **Status:** `_status.md`

---

## 8. Criterios de Definición de Terminado (DoD)

### Para Supabase Agent
- [ ] Schema de base de datos creado
- [ ] Políticas RLS implementadas y probadas
- [ ] Servicios de datos implementados
- [ ] Migraciones ejecutadas exitosamente

### Para Test Agent
- [ ] Suite de tests unitarios creada
- [ ] Tests de integración implementados
- [ ] Mocks configurados correctamente
- [ ] Cobertura de tests > 90%

### Para Implementer Agent
- [ ] Casos de uso implementados
- [ ] Endpoints de API funcionando
- [ ] Todos los tests pasando
- [ ] Validaciones de Zod implementadas

### Para UI/UX Expert Agent
- [ ] Componentes implementados
- [ ] Tests E2E pasando
- [ ] Accesibilidad validada
- [ ] Responsividad confirmada

---

## 9. Notas y Observaciones
[Cualquier información adicional, decisiones de diseño, o consideraciones especiales]

---

**Última Actualización:** [YYYY-MM-DD]
**Próxima Revisión:** [YYYY-MM-DD]