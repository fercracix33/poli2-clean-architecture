# PRD: Sistema de Comentarios en Tareas

## Metadata
- **Feature ID:** tasks-004
- **Version:** 1.0
- **Created:** 2024-01-15
- **Status:** Completed
- **Dependencies:** tasks-001 (Create Task), auth-001 (User Authentication)
- **Assigned Architect:** Arquitecto Principal

---

## 1. User Story
> Como un **miembro del equipo**, quiero **añadir comentarios a las tareas** para poder **comunicar actualizaciones, hacer preguntas y colaborar efectivamente con otros miembros del proyecto**.

### Contexto del Negocio
Los equipos necesitan una forma de comunicarse sobre el progreso de las tareas sin recurrir a herramientas externas como email o Slack. Los comentarios en tareas permiten mantener toda la comunicación contextualizada y accesible para todos los miembros del proyecto.

### Usuarios Objetivo
- **Primarios:** Miembros del equipo asignados a tareas
- **Secundarios:** Project managers y stakeholders que necesitan visibilidad del progreso

---

## 2. Criterios de Aceptación

### Funcionales
- **DEBE** permitir crear comentarios con texto de 1-1000 caracteres
- **DEBE** mostrar comentarios ordenados cronológicamente (más reciente primero)
- **DEBE** mostrar autor y timestamp de cada comentario
- **DEBE** permitir editar comentarios propios dentro de 5 minutos de creación
- **DEBE** permitir eliminar comentarios propios en cualquier momento
- **NO DEBE** permitir comentarios vacíos o solo espacios en blanco
- **DEBE** manejar el caso cuando la tarea no existe (404)
- **DEBE** sanitizar contenido para prevenir XSS

### No Funcionales
- **Performance:** DEBE responder en menos de 200ms para crear/listar comentarios
- **Accesibilidad:** DEBE cumplir WCAG 2.1 AA mínimo
- **Responsividad:** DEBE funcionar en móvil (375px+), tablet (768px+) y desktop (1024px+)
- **Seguridad:** DEBE implementar RLS para acceso solo a miembros del proyecto
- **Escalabilidad:** DEBE soportar hasta 1000 comentarios por tarea

---

## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales
- **Nueva Entidad:** `Comment` en `src/features/comments/entities.ts`
- **Entidades Modificadas:** Ninguna (los comentarios son independientes)

### Schemas de Zod
```typescript
import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.string().cuid(),
  content: z.string()
    .min(1, "El comentario no puede estar vacío")
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .trim(),
  taskId: z.string().cuid("ID de tarea inválido"),
  authorId: z.string().cuid("ID de autor inválido"),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const CommentCreateSchema = CommentSchema.omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export const CommentUpdateSchema = CommentSchema.pick({ 
  content: true 
}).partial();

export type Comment = z.infer<typeof CommentSchema>;
export type CommentCreate = z.infer<typeof CommentCreateSchema>;
export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;

// Schema para respuestas de API que incluyen información del autor
export const CommentWithAuthorSchema = CommentSchema.extend({
  author: z.object({
    id: z.string().cuid(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url().optional()
  })
});

export type CommentWithAuthor = z.infer<typeof CommentWithAuthorSchema>;
```

### Relaciones
- **Comment** pertenece a **Task** (many-to-one)
- **Comment** pertenece a **User** como author (many-to-one)

---

## 4. Contrato de API Endpoints

### Endpoint Principal: POST /api/comments
- **Ruta:** `POST /api/comments`
- **Autenticación:** Requerida
- **Body Schema:** `CommentCreateSchema`
- **Query Parameters:** Ninguno

#### Respuestas
- **Éxito:** `201` con schema `CommentWithAuthorSchema`
- **Errores:**
  - `400` - Bad Request: Validación fallida o contenido inválido
  - `401` - Unauthorized: Usuario no autenticado
  - `403` - Forbidden: Usuario no tiene acceso a la tarea
  - `404` - Not Found: Tarea no existe
  - `500` - Internal Server Error: Error del servidor

### Endpoint: GET /api/comments
- **Ruta:** `GET /api/comments?taskId={taskId}&limit={limit}&offset={offset}`
- **Autenticación:** Requerida
- **Query Parameters:** 
  - `taskId` (requerido): ID de la tarea
  - `limit` (opcional): Máximo 100, default 50
  - `offset` (opcional): Default 0

#### Respuestas
- **Éxito:** `200` con array de `CommentWithAuthorSchema`
- **Errores:** Similares al POST

### Endpoint: PUT /api/comments/[id]
- **Ruta:** `PUT /api/comments/{commentId}`
- **Autenticación:** Requerida
- **Body Schema:** `CommentUpdateSchema`

#### Respuestas
- **Éxito:** `200` con `CommentWithAuthorSchema` actualizado
- **Errores:** 
  - `400` - Bad Request: Validación fallida
  - `401` - Unauthorized: Usuario no autenticado
  - `403` - Forbidden: No es el autor o tiempo de edición expirado
  - `404` - Not Found: Comentario no existe
  - `500` - Internal Server Error

### Endpoint: DELETE /api/comments/[id]
- **Ruta:** `DELETE /api/comments/{commentId}`
- **Autenticación:** Requerida

#### Respuestas
- **Éxito:** `200` con mensaje de confirmación
- **Errores:** Similares al PUT

---

## 5. Especificaciones de UI/UX

### Componentes Requeridos
- **Componente Principal:** `CommentForm` en `src/features/comments/components/`
- **Componentes Secundarios:** 
  - `CommentList` para mostrar lista de comentarios
  - `CommentCard` para cada comentario individual
  - `CommentEditForm` para edición inline
- **Páginas:** Integración en `src/app/(main)/tasks/[id]/page.tsx`

### Flujos de Usuario
1. **Flujo Principal - Crear Comentario:**
   - Usuario ve la tarea con comentarios existentes debajo
   - Usuario escribe en el textarea del formulario
   - Botón "Añadir Comentario" se habilita cuando hay contenido válido
   - Al enviar, se muestra loading state en el botón
   - Comentario aparece inmediatamente en la lista
   - Formulario se limpia automáticamente

2. **Flujo Alternativo - Editar Comentario:**
   - Usuario hace click en "Editar" en su propio comentario
   - Comentario se convierte en textarea editable
   - Usuario puede guardar cambios o cancelar
   - Solo disponible por 5 minutos después de creación

3. **Flujo Alternativo - Eliminar Comentario:**
   - Usuario hace click en "Eliminar" en su propio comentario
   - Se muestra confirmación "¿Estás seguro?"
   - Al confirmar, comentario desaparece de la lista

### Estados de la Interfaz
- **Loading:** Spinner en botón durante envío, skeleton para carga inicial
- **Error:** Mensaje de error debajo del formulario con opción de reintentar
- **Empty:** Mensaje "No hay comentarios aún. ¡Sé el primero en comentar!"
- **Success:** Comentario añadido exitosamente (feedback visual sutil)

### Wireframes/Mockups
```
┌─────────────────────────────────────┐
│ Task Details                        │
├─────────────────────────────────────┤
│ Comments (3)                        │
│                                     │
│ ┌─ CommentCard ─────────────────┐   │
│ │ 👤 John Doe • 2 hours ago     │   │
│ │ This looks great! Just one     │   │
│ │ small suggestion...            │   │
│ │                    [Edit][Del] │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌─ CommentForm ─────────────────┐   │
│ │ Add a comment...               │   │
│ │ ┌─────────────────────────────┐ │   │
│ │ │ [Textarea]                  │ │   │
│ │ └─────────────────────────────┘ │   │
│ │              [Add Comment] ──┘ │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 6. Consideraciones Técnicas

### Seguridad
- **Políticas RLS:** 
  - Usuarios solo pueden ver comentarios de tareas a las que tienen acceso
  - Usuarios solo pueden editar/eliminar sus propios comentarios
  - Validación de tiempo límite para edición (5 minutos)
- **Validaciones:** 
  - Sanitización de contenido HTML para prevenir XSS
  - Validación de longitud y formato en frontend y backend
  - Verificación de permisos en cada operación
- **Sanitización:** 
  - Escape de caracteres especiales en contenido
  - Validación de URLs si se permiten links en el futuro

### Performance
- **Optimizaciones:** 
  - Paginación de comentarios (50 por página)
  - Índices en taskId y createdAt para queries eficientes
  - Cache de conteo de comentarios por tarea
- **Caching:** 
  - Cache de 5 minutos para listas de comentarios
  - Invalidación automática al crear/editar/eliminar
- **Paginación:** 
  - Carga inicial de 50 comentarios más recientes
  - Botón "Cargar más" para comentarios anteriores

### Integraciones
- **APIs Externas:** Ninguna requerida inicialmente
- **Webhooks:** Posible integración futura con notificaciones
- **Background Jobs:** Limpieza de comentarios huérfanos (si se elimina tarea)

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
- [ ] Tabla `comments` creada con campos requeridos
- [ ] Políticas RLS implementadas para lectura/escritura
- [ ] Servicios de datos implementados (CRUD completo)
- [ ] Migraciones ejecutadas y validadas
- [ ] Índices de performance añadidos

### Para Test Agent
- [ ] Suite de tests unitarios para use cases
- [ ] Tests de integración para API endpoints
- [ ] Mocks configurados para servicios de datos
- [ ] Cobertura de tests > 90%
- [ ] Tests de seguridad y validación

### Para Implementer Agent
- [ ] Use cases implementados con validaciones de negocio
- [ ] API endpoints funcionando con manejo de errores
- [ ] Todos los tests unitarios pasando
- [ ] Validaciones de Zod implementadas
- [ ] Logging y monitoreo configurado

### Para UI/UX Expert Agent
- [ ] Componentes implementados con shadcn/ui
- [ ] Integración con TanStack Query funcionando
- [ ] Tests E2E pasando para todos los flujos
- [ ] Accesibilidad validada (WCAG 2.1 AA)
- [ ] Responsividad confirmada en 3 breakpoints

---

## 9. Notas y Observaciones

### Decisiones de Diseño
1. **Edición con tiempo límite:** Se decidió permitir edición solo por 5 minutos para mantener integridad de conversaciones mientras permite corrección de errores tipográficos.

2. **Sin notificaciones push:** Para v1.0 no se incluyen notificaciones en tiempo real. Se evaluará para v1.1 basado en feedback de usuarios.

3. **Paginación simple:** Se usa paginación offset-based por simplicidad. Se considerará cursor-based para v2.0 si hay problemas de performance.

### Consideraciones Futuras (v1.1+)
- Menciones @usuario con notificaciones
- Reacciones emoji a comentarios
- Hilos de respuesta a comentarios
- Adjuntos de archivos pequeños
- Notificaciones en tiempo real

### Riesgos Identificados
1. **Spam de comentarios:** Mitigado con rate limiting (implementar en v1.1)
2. **Performance con muchos comentarios:** Mitigado con paginación y índices
3. **Contenido inapropiado:** Mitigado con moderación manual inicial

---

**Última Actualización:** 2024-01-15
**Próxima Revisión:** 2024-02-15