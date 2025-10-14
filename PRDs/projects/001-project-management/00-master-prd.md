# PRD: Project Management System

## Metadata
- **Feature ID:** projects-001
- **Version:** 1.0
- **Created:** 2025-10-10
- **Status:** Draft
- **Dependencies:**
  - auth-001 (Authentication & Organizations)
  - Database migrations #11 (create_projects_schema) ✅ Completed
  - Database migrations #12 (fix_projects_rls_vulnerability) ✅ Completed
  - entities.ts ✅ Completed
  - project.service.ts ✅ Completed
- **Assigned Architect:** Architect Agent

---

## 1. User Story

> Como **miembro de una organización**, quiero **crear y gestionar proyectos** para poder **organizar el trabajo de mi equipo en contextos separados y facilitar la colaboración estructurada**.

### Contexto del Negocio

Las organizaciones necesitan organizar su trabajo en proyectos independientes que representen iniciativas, productos, departamentos o cualquier agrupación lógica de tareas. Cada proyecto debe:

- Tener identidad propia (nombre, descripción, personalización visual)
- Controlar quién puede acceder y qué permisos tienen
- Mantener configuraciones específicas
- Poder archivarse cuando finaliza sin perder la información histórica
- Facilitar navegación rápida mediante favoritos

Esta feature es fundamental porque establece el segundo nivel de la jerarquía organizacional:
```
Organization (Nivel 1)
  └── Projects (Nivel 2) ← Esta feature
       └── Tasks (Nivel 3) - Futura implementación
```

### Usuarios Objetivo

- **Primarios:**
  - Administradores de organización que crean y configuran proyectos
  - Líderes de proyecto que gestionan miembros y configuraciones
  - Miembros del equipo que visualizan y acceden a proyectos

- **Secundarios:**
  - Nuevos usuarios invitados que necesitan entender la estructura del proyecto
  - Stakeholders que necesitan visibilidad de los proyectos activos

---

## 2. Criterios de Aceptación

### Funcionales

#### Gestión de Proyectos
- **DEBE** permitir crear proyectos con nombre (2-100 chars), slug (2-50 chars, URL-friendly), y descripción opcional (max 1000 chars)
- **DEBE** validar que el slug sea único dentro de la organización
- **DEBE** permitir personalización visual: color HEX (#RRGGBB) e ícono (max 50 chars)
- **DEBE** soportar 4 estados: `active`, `archived`, `completed`, `on_hold`
- **DEBE** permitir almacenar configuraciones personalizadas en campo JSONB `settings`
- **DEBE** registrar `created_by` con el UUID del creador
- **DEBE** mantener timestamps `created_at`, `updated_at`, y `archived_at` (cuando aplique)

#### Control de Acceso
- **DEBE** verificar permisos antes de cada operación:
  - `project.create` para crear proyectos
  - `project.update` o `project.manage_settings` o `project.manage` para actualizar
  - `project.delete` para eliminar permanentemente
  - `project.manage_members` o `project.invite` para añadir miembros
  - `project.remove_members` o `project.manage_members` para quitar miembros
- **DEBE** aislar datos por organización mediante RLS (usuarios solo ven proyectos de sus organizaciones)
- **DEBE** permitir a usuarios salir de proyectos voluntariamente (auto-remoción)

#### Archivado
- **DEBE** implementar archivado suave (soft delete): cambiar status a `archived` y registrar `archived_at`
- **DEBE** permitir reactivar proyectos archivados (cambiar a `active`, limpiar `archived_at`)
- **DEBE** hacer proyectos archivados de solo lectura (no se pueden editar, solo desarchivar o eliminar)
- **NO DEBE** mostrar proyectos archivados en listados por defecto (requiere filtro explícito)

#### Búsqueda y Filtrado
- **DEBE** soportar búsqueda por texto en `name` y `description` (case-insensitive)
- **DEBE** permitir filtrar por `status` (active, archived, completed, on_hold)
- **DEBE** permitir filtrar por `is_favorite` (proyectos marcados como favoritos)
- **DEBE** permitir filtrar por `created_by` (proyectos creados por usuario específico)
- **DEBE** ordenar por defecto por `created_at` descendente (más recientes primero)

#### Favoritos
- **DEBE** permitir marcar/desmarcar proyectos como favoritos mediante campo booleano `is_favorite`
- **DEBE** mantener favoritos a nivel de usuario (cada usuario tiene sus propios favoritos)

#### Gestión de Miembros
- **DEBE** permitir añadir usuarios de la organización como miembros del proyecto
- **DEBE** asignar un rol a cada miembro (referencia a tabla `roles`)
- **DEBE** registrar quién invitó al miembro (`invited_by`)
- **DEBE** permitir actualizar el rol de un miembro existente
- **DEBE** permitir remover miembros del proyecto
- **DEBE** mostrar detalles completos de miembros: email, nombre, avatar, rol

#### Estadísticas
- **DEBE** calcular y mostrar cantidad de miembros por proyecto
- **DEBE** mostrar nombre del creador del proyecto
- **DEBE** soportar consultas optimizadas con JOINs para evitar N+1 queries

### No Funcionales

- **Performance:**
  - Consultas de listado DEBEN responder en <300ms para organizaciones con hasta 1000 proyectos
  - Búsqueda con filtros DEBE usar índices de base de datos para rendimiento óptimo

- **Accesibilidad:**
  - Toda la UI DEBE cumplir WCAG 2.1 AA mínimo
  - Formularios DEBEN tener labels asociados correctamente
  - Mensajes de error DEBEN ser anunciados por lectores de pantalla

- **Responsividad:**
  - DEBE funcionar en móvil (375px+), tablet (768px+) y desktop (1024px+)
  - Listado de proyectos DEBE adaptar layout según breakpoint
  - Formularios DEBEN ser usables en pantallas táctiles

- **Seguridad:**
  - DEBE implementar RLS en todas las tablas (projects, project_members)
  - DEBE validar permisos mediante relaciones organization_members → role_permissions → permissions
  - DEBE prevenir inyección SQL mediante consultas parametrizadas de Supabase
  - DEBE validar inputs con Zod antes de enviar a base de datos

- **Escalabilidad:**
  - DEBE soportar 1000+ proyectos por organización sin degradación
  - DEBE usar paginación para listados grandes (implementación futura)

- **Internacionalización:**
  - **DEBE** usar next-intl para TODAS las cadenas de texto
  - **NO DEBE** contener strings hardcodeados en componentes
  - DEBE soportar inglés y español completamente
  - Mensajes de error de Zod DEBEN estar traducidos

---

## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales

**Ubicación:** `app/src/features/projects/entities.ts` ✅ **Completado en Phase 1**

### Schemas Implementados

#### ProjectSchema (Entidad Principal)
```typescript
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(/^[a-z0-9\-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens and underscores"),
  description: z.string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold'], {
    errorMap: () => ({ message: "Status must be one of: active, archived, completed, on_hold" })
  }),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX color (#RRGGBB)")
    .optional()
    .nullable(),
  icon: z.string()
    .max(50, "Icon cannot exceed 50 characters")
    .optional()
    .nullable(),
  is_favorite: z.boolean(),
  settings: z.record(z.any()).optional().nullable(),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
  archived_at: z.date().optional().nullable(),
});
```

#### ProjectCreateSchema (Creación)
```typescript
export const ProjectCreateSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9\-_]+$/),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold']).default('active'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  is_favorite: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
});
```

#### ProjectUpdateSchema (Actualización)
```typescript
export const ProjectUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  is_favorite: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
});
```

#### ProjectFilterSchema (Búsqueda)
```typescript
export const ProjectFilterSchema = z.object({
  organization_id: z.string().uuid(),
  status: z.enum(['active', 'archived', 'completed', 'on_hold']).optional(),
  is_favorite: z.boolean().optional(),
  search: z.string().optional(), // Busca en name y description
  created_by: z.string().uuid().optional(),
});
```

#### ProjectMemberSchema (Miembros)
```typescript
export const ProjectMemberSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  joined_at: z.date(),
  invited_by: z.string().uuid().optional().nullable(),
});

export const ProjectMemberCreateSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
});
```

#### Schemas Extendidos (con Relaciones)
```typescript
// Proyecto con estadísticas
export const ProjectWithStatsSchema = ProjectSchema.extend({
  member_count: z.number().int().nonnegative(),
  creator_name: z.string().optional(),
});

// Miembro con detalles de usuario
export const ProjectMemberWithUserSchema = ProjectMemberSchema.extend({
  user_email: z.string().email(),
  user_name: z.string(),
  user_avatar_url: z.string().url().optional().nullable(),
  role_name: z.string(),
});
```

### TypeScript Types
```typescript
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;
export type ProjectFilter = z.infer<typeof ProjectFilterSchema>;
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
export type ProjectMemberCreate = z.infer<typeof ProjectMemberCreateSchema>;
export type ProjectWithStats = z.infer<typeof ProjectWithStatsSchema>;
export type ProjectMemberWithUser = z.infer<typeof ProjectMemberWithUserSchema>;
```

### Type Guards
```typescript
export function isValidProjectStatus(status: string): status is Project['status'] {
  return ['active', 'archived', 'completed', 'on_hold'].includes(status);
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
```

### Relaciones

- **Project** pertenece a **Organization** (`organization_id` → `organizations.id`)
- **Project** fue creado por **User** (`created_by` → `auth.users.id`)
- **Project** tiene muchos **ProjectMember** (one-to-many)
- **ProjectMember** pertenece a **User** (`user_id` → `auth.users.id`)
- **ProjectMember** tiene un **Role** (`role_id` → `roles.id`)
- **ProjectMember** fue invitado por **User** (`invited_by` → `auth.users.id`)

---

## 4. Contrato de API Endpoints

### 4.1 POST /api/projects - Crear Proyecto

- **Ruta:** `POST /api/projects`
- **Autenticación:** Requerida (Supabase Auth)
- **Autorización:** Usuario debe tener permiso `project.create` en la organización
- **Body Schema:** `ProjectCreateSchema`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

#### Request Body
```typescript
{
  organization_id: string (UUID),
  name: string (2-100 chars),
  slug: string (2-50 chars, lowercase, alphanumeric, hyphens, underscores),
  description?: string (max 1000 chars),
  status?: 'active' | 'archived' | 'completed' | 'on_hold' (default: 'active'),
  color?: string (HEX format #RRGGBB),
  icon?: string (max 50 chars),
  is_favorite?: boolean (default: false),
  settings?: Record<string, any>
}
```

#### Respuestas

**201 Created:**
```typescript
{
  data: {
    id: string,
    organization_id: string,
    name: string,
    slug: string,
    description: string | null,
    status: 'active' | 'archived' | 'completed' | 'on_hold',
    color: string | null,
    icon: string | null,
    is_favorite: boolean,
    settings: Record<string, any> | null,
    created_by: string,
    created_at: string (ISO 8601),
    updated_at: string (ISO 8601),
    archived_at: string | null
  }
}
```

**400 Bad Request:**
```typescript
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: ZodError
  }
}
```

**401 Unauthorized:**
```typescript
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }
}
```

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions to create projects'
  }
}
```

**409 Conflict:**
```typescript
{
  error: {
    code: 'SLUG_ALREADY_EXISTS',
    message: 'A project with this slug already exists in the organization'
  }
}
```

**500 Internal Server Error:**
```typescript
{
  error: {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  }
}
```

---

### 4.2 GET /api/projects - Listar Proyectos

- **Ruta:** `GET /api/projects`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe ser miembro de la organización
- **Query Parameters:** Basados en `ProjectFilterSchema`

#### Query Parameters
```typescript
{
  organization_id: string (UUID, required),
  status?: 'active' | 'archived' | 'completed' | 'on_hold',
  is_favorite?: boolean,
  search?: string,
  created_by?: string (UUID),
  include_stats?: boolean (default: false) // Incluir member_count y creator_name
}
```

#### Respuestas

**200 OK (sin stats):**
```typescript
{
  data: Project[]
}
```

**200 OK (con stats):**
```typescript
{
  data: ProjectWithStats[]
}
```

**400 Bad Request:**
```typescript
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid query parameters',
    details: ZodError
  }
}
```

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'User is not a member of the organization'
  }
}
```

---

### 4.3 GET /api/projects/[id] - Obtener Proyecto

- **Ruta:** `GET /api/projects/{projectId}`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe ser miembro de la organización del proyecto

#### Path Parameters
- `projectId`: string (UUID)

#### Respuestas

**200 OK:**
```typescript
{
  data: Project
}
```

**404 Not Found:**
```typescript
{
  error: {
    code: 'NOT_FOUND',
    message: 'Project not found'
  }
}
```

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Access to this project is denied'
  }
}
```

---

### 4.4 GET /api/projects/by-slug - Obtener Proyecto por Slug

- **Ruta:** `GET /api/projects/by-slug`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe ser miembro de la organización

#### Query Parameters
```typescript
{
  organization_id: string (UUID, required),
  slug: string (required)
}
```

#### Respuestas

**200 OK:** (Igual que 4.3)

**404 Not Found:** (Igual que 4.3)

**400 Bad Request:** Si faltan parámetros requeridos

---

### 4.5 PATCH /api/projects/[id] - Actualizar Proyecto

- **Ruta:** `PATCH /api/projects/{projectId}`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permisos `project.update`, `project.manage_settings`, o `project.manage`
- **Body Schema:** `ProjectUpdateSchema`

#### Request Body
```typescript
{
  name?: string (2-100 chars),
  description?: string (max 1000 chars),
  status?: 'active' | 'archived' | 'completed' | 'on_hold',
  color?: string (HEX #RRGGBB),
  icon?: string (max 50 chars),
  is_favorite?: boolean,
  settings?: Record<string, any>
}
```

#### Respuestas

**200 OK:**
```typescript
{
  data: Project
}
```

**400 Bad Request:** (Igual que 4.1)

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions to update this project'
  }
}
```

**404 Not Found:** (Igual que 4.3)

---

### 4.6 DELETE /api/projects/[id] - Eliminar Proyecto

- **Ruta:** `DELETE /api/projects/{projectId}`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permiso `project.delete`

#### Respuestas

**204 No Content:** (Sin body)

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions to delete this project'
  }
}
```

**404 Not Found:** (Igual que 4.3)

---

### 4.7 POST /api/projects/[id]/archive - Archivar Proyecto

- **Ruta:** `POST /api/projects/{projectId}/archive`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permisos `project.update` o `project.manage`

#### Respuestas

**200 OK:**
```typescript
{
  data: Project // con status='archived' y archived_at poblado
}
```

**400 Bad Request:**
```typescript
{
  error: {
    code: 'ALREADY_ARCHIVED',
    message: 'Project is already archived'
  }
}
```

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:** (Igual que 4.5)

**404 Not Found:** (Igual que 4.3)

---

### 4.8 POST /api/projects/[id]/unarchive - Reactivar Proyecto

- **Ruta:** `POST /api/projects/{projectId}/unarchive`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permisos `project.update` o `project.manage`

#### Respuestas

**200 OK:**
```typescript
{
  data: Project // con status='active' y archived_at=null
}
```

**400 Bad Request:**
```typescript
{
  error: {
    code: 'NOT_ARCHIVED',
    message: 'Project is not archived'
  }
}
```

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:** (Igual que 4.5)

**404 Not Found:** (Igual que 4.3)

---

### 4.9 POST /api/projects/[id]/members - Añadir Miembro

- **Ruta:** `POST /api/projects/{projectId}/members`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permisos `project.manage_members`, `project.invite`, o `project.manage`
- **Body Schema:** `ProjectMemberCreateSchema` (sin `project_id`, tomado de path)

#### Request Body
```typescript
{
  user_id: string (UUID),
  role_id: string (UUID)
}
```

#### Respuestas

**201 Created:**
```typescript
{
  data: {
    id: string,
    project_id: string,
    user_id: string,
    role_id: string,
    joined_at: string (ISO 8601),
    invited_by: string
  }
}
```

**400 Bad Request:**
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'ALREADY_MEMBER' | 'USER_NOT_IN_ORGANIZATION',
    message: string,
    details?: ZodError
  }
}
```

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions to add members to this project'
  }
}
```

**404 Not Found:**
```typescript
{
  error: {
    code: 'NOT_FOUND',
    message: 'Project not found or user not found'
  }
}
```

---

### 4.10 GET /api/projects/[id]/members - Listar Miembros

- **Ruta:** `GET /api/projects/{projectId}/members`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe ser miembro del proyecto

#### Query Parameters
```typescript
{
  include_details?: boolean (default: true) // Incluir user_email, user_name, user_avatar_url, role_name
}
```

#### Respuestas

**200 OK (con detalles):**
```typescript
{
  data: ProjectMemberWithUser[]
}
```

**200 OK (sin detalles):**
```typescript
{
  data: ProjectMember[]
}
```

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'User is not a member of this project'
  }
}
```

**404 Not Found:** (Igual que 4.3)

---

### 4.11 PATCH /api/projects/[id]/members/[userId] - Actualizar Rol de Miembro

- **Ruta:** `PATCH /api/projects/{projectId}/members/{userId}`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permisos `project.manage_members` o `project.manage`

#### Request Body
```typescript
{
  role_id: string (UUID)
}
```

#### Respuestas

**200 OK:**
```typescript
{
  data: ProjectMember
}
```

**400 Bad Request:** (Igual que 4.1)

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:** (Igual que 4.9)

**404 Not Found:**
```typescript
{
  error: {
    code: 'NOT_FOUND',
    message: 'Member not found in this project'
  }
}
```

---

### 4.12 DELETE /api/projects/[id]/members/[userId] - Remover Miembro

- **Ruta:** `DELETE /api/projects/{projectId}/members/{userId}`
- **Autenticación:** Requerida
- **Autorización:** Usuario debe tener permisos `project.remove_members` o `project.manage_members` O ser el propio usuario (auto-remoción)

#### Respuestas

**204 No Content:** (Sin body)

**401 Unauthorized:** (Igual que 4.1)

**403 Forbidden:**
```typescript
{
  error: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions to remove this member'
  }
}
```

**404 Not Found:** (Igual que 4.11)

---

## 5. Especificaciones de UI/UX

### 5.1 Componentes Requeridos

**Ubicación:** `app/src/features/projects/components/`

#### Componentes Principales

1. **ProjectList** - Lista de proyectos con búsqueda y filtros
   - Props: `organizationId`, `initialFilters?`
   - Usa TanStack Query para fetching
   - Muestra ProjectCard por cada proyecto
   - Incluye estado empty, loading, error
   - Sticky search bar en mobile

2. **ProjectCard** - Tarjeta individual de proyecto
   - Props: `project` (ProjectWithStats)
   - Muestra: nombre, descripción (truncada), color/ícono, miembros count, estado
   - Acciones: botón favorito, menú dropdown (edit, archive, delete)
   - Responsive: stack vertical en mobile, horizontal en desktop
   - Click en tarjeta navega a `/org/{slug}/projects/{projectSlug}`

3. **CreateProjectDialog** - Modal para crear proyecto
   - Props: `organizationId`, `onSuccess`, `onCancel`
   - Formulario con React Hook Form + Zod
   - Campos: name, slug (auto-generado desde name, editable), description, color, icon
   - Validación en tiempo real
   - Preview visual con color/ícono seleccionado
   - Color picker usando shadcn/ui

4. **EditProjectDialog** - Modal para editar proyecto
   - Props: `project`, `onSuccess`, `onCancel`
   - Igual que CreateProjectDialog pero pre-poblado
   - No permite editar slug (immutable después de creación)

5. **ProjectHeader** - Header de página de proyecto individual
   - Props: `project`
   - Muestra: color/ícono, nombre, descripción, breadcrumbs
   - Acciones: edit, archive, delete, mark favorite
   - Tabs: Dashboard, Members, Settings

6. **ProjectMemberList** - Lista de miembros del proyecto
   - Props: `projectId`
   - Muestra tabla con avatar, nombre, email, rol, joined_at
   - Acciones por fila: cambiar rol, remover (si hay permisos)
   - Botón "Add Member" abre dialog

7. **AddProjectMemberDialog** - Modal para añadir miembro
   - Props: `projectId`, `organizationId`, `onSuccess`, `onCancel`
   - Dropdown de usuarios de la organización (exclude ya miembros)
   - Dropdown de roles disponibles
   - Validación: usuario debe estar en organización

8. **ProjectFilters** - Componente de filtros
   - Props: `filters`, `onFilterChange`
   - Campos: search (debounced), status, is_favorite, created_by
   - Botón "Clear Filters"
   - Mobile: collapse en accordion

9. **ProjectSettings** - Página de configuraciones del proyecto
   - Props: `project`
   - Tabs: General, Advanced, Danger Zone
   - General: name, description, color, icon, status
   - Advanced: JSONB settings (JSON editor)
   - Danger Zone: Archive, Delete (con confirmación)

#### Componentes Reutilizables (shadcn/ui)

- **Dialog** - Para modales
- **Button** - Acciones
- **Input, Textarea** - Formularios
- **Select** - Dropdowns
- **Badge** - Estados (active, archived, etc.)
- **Avatar** - Usuarios
- **Card** - Contenedores
- **Table** - Listado de miembros
- **Tabs** - Navegación de proyecto
- **DropdownMenu** - Acciones contextuales
- **AlertDialog** - Confirmaciones destructivas

### 5.2 Páginas Requeridas

**Ubicación:** `app/src/app/(main)/org/[orgSlug]/projects/`

1. **`page.tsx`** - Listado de proyectos
   - Ruta: `/org/{orgSlug}/projects`
   - Componentes: ProjectFilters, ProjectList, CreateProjectDialog (trigger en header)
   - Layout: Grid responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
   - Estados: empty state si no hay proyectos ("Create your first project")

2. **`[projectSlug]/page.tsx`** - Dashboard del proyecto
   - Ruta: `/org/{orgSlug}/projects/{projectSlug}`
   - Componentes: ProjectHeader
   - Contenido: Stats básicas, activity reciente (placeholder para futuro)
   - Message: "Task management coming soon" (tareas aún no implementadas)

3. **`[projectSlug]/members/page.tsx`** - Miembros del proyecto
   - Ruta: `/org/{orgSlug}/projects/{projectSlug}/members`
   - Componentes: ProjectHeader, ProjectMemberList, AddProjectMemberDialog

4. **`[projectSlug]/settings/page.tsx`** - Configuraciones del proyecto
   - Ruta: `/org/{orgSlug}/projects/{projectSlug}/settings`
   - Componentes: ProjectHeader, ProjectSettings

### 5.3 Flujos de Usuario

#### Flujo 1: Crear Proyecto (Happy Path)

1. Usuario navega a `/org/{orgSlug}/projects`
2. Click en botón "Create Project" (header)
3. Se abre CreateProjectDialog
4. Usuario ingresa:
   - Name: "Mobile App Redesign"
   - Slug: "mobile-app-redesign" (auto-generado, editable)
   - Description: "Q4 2025 mobile app redesign project"
   - Color: #3B82F6 (selecciona del color picker)
   - Icon: "📱" (emoji picker o text input)
5. Preview muestra cómo se verá el proyecto
6. Click "Create"
7. Validación Zod OK → POST /api/projects
8. Success → Dialog cierra, ProjectList se actualiza (TanStack Query invalidation)
9. Toast notification: "Project created successfully"
10. Usuario puede navegar al nuevo proyecto

#### Flujo 2: Buscar y Filtrar Proyectos

1. Usuario está en `/org/{orgSlug}/projects` con 50 proyectos
2. Ingresa "mobile" en search box (debounced 300ms)
3. Lista se filtra mostrando solo proyectos que contienen "mobile" en name/description
4. Selecciona filter "Status: Active"
5. Lista se reduce a proyectos active con "mobile"
6. Marca checkbox "Favorites only"
7. Lista muestra solo favoritos activos con "mobile"
8. Click "Clear Filters" → vuelve al listado completo

#### Flujo 3: Añadir Miembro a Proyecto

1. Usuario navega a `/org/{orgSlug}/projects/{projectSlug}/members`
2. Click "Add Member"
3. Se abre AddProjectMemberDialog
4. Selecciona usuario "jane@example.com" del dropdown
5. Selecciona rol "Project Manager"
6. Click "Add Member"
7. Validación: usuario existe en organización → OK
8. POST /api/projects/{id}/members
9. Success → Dialog cierra, MemberList se actualiza
10. Toast: "Jane added to project successfully"

#### Flujo 4: Archivar Proyecto

1. Usuario en `/org/{orgSlug}/projects`
2. Hover sobre ProjectCard de proyecto completado
3. Click menú dropdown (3 dots)
4. Click "Archive"
5. AlertDialog confirma: "Archive this project? It will become read-only."
6. Click "Archive"
7. POST /api/projects/{id}/archive
8. Success → Proyecto desaparece de vista active
9. Toast: "Project archived successfully"
10. Usuario puede ver archivados con filtro "Status: Archived"

### 5.4 Estados de la Interfaz

#### Loading States

- **Inicial:** Skeleton loaders para ProjectCard (3 placeholders en desktop)
- **Creación:** Button "Create" muestra spinner + texto "Creating..."
- **Actualización:** Overlay de formulario con spinner
- **Eliminación:** Confirmación con progress bar

#### Error States

- **Network Error:** Toast rojo + opción "Retry"
- **Validation Error:** Inline errors bajo campos de formulario (color rojo, ícono)
- **Permission Denied:** Alert banner: "You don't have permission to perform this action"
- **Not Found:** Página 404 personalizada: "Project not found or access denied"

#### Empty States

- **Sin proyectos:**
  - Ícono grande de carpeta vacía
  - Texto: "No projects yet"
  - Subtítulo: "Create your first project to get started"
  - Botón primario: "Create Project"

- **Sin resultados de búsqueda:**
  - Ícono de lupa
  - Texto: "No projects found"
  - Subtítulo: "Try adjusting your filters"
  - Botón: "Clear Filters"

- **Sin miembros:**
  - Ícono de usuarios
  - Texto: "No members yet"
  - Botón: "Add Member"

#### Success States

- **Creación exitosa:** Toast verde + auto-redirect a proyecto nuevo
- **Actualización exitosa:** Toast verde + datos actualizados in-place
- **Miembro añadido:** Toast verde + aparece en lista
- **Archivado:** Toast azul informativo

### 5.5 Wireframes/Mockups

*Nota: Los diseños visuales deben seguir el design system existente de la organización (Phase 2). Usar mismos colores, tipografía, y componentes shadcn/ui.*

**Layout de ProjectList (Desktop):**
```
┌────────────────────────────────────────────────────┐
│ Header: "Projects" + [Create Project Button]      │
├────────────────────────────────────────────────────┤
│ Filters: [Search] [Status ▼] [☐ Favorites] [Clear]│
├────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐                  │
│ │Project │ │Project │ │Project │                  │
│ │ Card 1 │ │ Card 2 │ │ Card 3 │                  │
│ │        │ │        │ │        │                  │
│ └────────┘ └────────┘ └────────┘                  │
│ ┌────────┐ ┌────────┐ ┌────────┐                  │
│ │Project │ │Project │ │Project │                  │
│ │ Card 4 │ │ Card 5 │ │ Card 6 │                  │
│ └────────┘ └────────┘ └────────┘                  │
└────────────────────────────────────────────────────┘
```

**ProjectCard Structure:**
```
┌──────────────────────────────────┐
│ [🎨] Mobile App Redesign    [⋮] │ ← Color dot + name + menu
│ Q4 2025 mobile app redesign...  │ ← Description (truncated)
│                                  │
│ Active • 5 members • Created by │ ← Status, stats, creator
│ John Doe                         │
│ ────────────────────────────     │
│ [★ Favorite]          [View →]  │ ← Actions
└──────────────────────────────────┘
```

---

## 6. Consideraciones Técnicas

### 6.1 Seguridad

#### Políticas RLS (Row Level Security) ✅ Implementadas

**Tabla: projects**

```sql
-- SELECT: Usuarios ven proyectos de sus organizaciones
CREATE POLICY "Users can view projects in their organizations"
  ON projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Solo con permiso project.create
CREATE POLICY "Users can create projects with permission"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM organization_members om
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE om.user_id = auth.uid()
        AND om.organization_id = projects.organization_id
        AND p.name = 'project.create'
    )
    AND created_by = auth.uid()
  );

-- UPDATE: Solo con permisos project.update, project.manage_settings, o project.manage
CREATE POLICY "Users can update projects with permission"
  ON projects FOR UPDATE
  USING (
    id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM organization_members om
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE om.user_id = auth.uid()
        AND om.organization_id = projects.organization_id
        AND p.name IN ('project.update', 'project.manage_settings', 'project.manage')
    )
  );

-- DELETE: Solo con permiso project.delete
CREATE POLICY "Users can delete projects with permission"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM organization_members om
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE om.user_id = auth.uid()
        AND om.organization_id = projects.organization_id
        AND p.name = 'project.delete'
    )
  );
```

**Tabla: project_members**

```sql
-- SELECT: Usuarios ven miembros de proyectos en sus organizaciones
CREATE POLICY "Users can view project members in their organizations"
  ON project_members FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT: Solo con permisos project.manage_members, project.invite, o project.manage
CREATE POLICY "Users can add project members with permission"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions perm ON perm.id = rp.permission_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND perm.name IN ('project.manage_members', 'project.invite', 'project.manage')
    )
    AND invited_by = auth.uid()
  );

-- UPDATE: Solo con permisos project.manage_members o project.manage
CREATE POLICY "Users can update project members with permission"
  ON project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions perm ON perm.id = rp.permission_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND perm.name IN ('project.manage_members', 'project.manage')
    )
  );

-- DELETE: Con permiso o auto-remoción
CREATE POLICY "Users can remove project members with permission or self"
  ON project_members FOR DELETE
  USING (
    user_id = auth.uid() -- Auto-remoción
    OR EXISTS (
      SELECT 1
      FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions perm ON perm.id = rp.permission_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND perm.name IN ('project.remove_members', 'project.manage_members', 'project.manage')
    )
  );
```

#### Validaciones de Autorización

- **En Use Cases:** Cada use case DEBE verificar permisos antes de operar
- **Doble Validación:** RLS en DB + validación explícita en use case (defense in depth)
- **Mensajes de Error:** No revelar información sobre existencia de recursos sin permiso (siempre "Not found or access denied")

#### Sanitización

- **Inputs de Usuario:** Zod valida y limpia inputs antes de persistir
- **SQL Injection:** Prevenido por Supabase (queries parametrizadas)
- **XSS:** Prevenido por React (escaping automático)
- **JSONB Settings:** Validar estructura antes de guardar (no permitir funciones ejecutables)

### 6.2 Performance

#### Optimizaciones Implementadas

1. **Índices de Base de Datos** (ver migration #11):
   ```sql
   CREATE INDEX idx_projects_organization_id ON projects(organization_id);
   CREATE INDEX idx_projects_slug ON projects(organization_id, slug);
   CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
   CREATE INDEX idx_projects_status ON projects(status);
   CREATE INDEX idx_project_members_project_id ON project_members(project_id);
   CREATE INDEX idx_project_members_user_id ON project_members(user_id);
   ```

2. **Query Optimization:**
   - Usar `getProjectsWithStats()` en lugar de N+1 queries separadas
   - JOINs eficientes para relaciones (user_profiles, roles)
   - SELECT solo campos necesarios (no `SELECT *` en producción crítica)

3. **Caching con TanStack Query:**
   - Cache key: `['projects', organizationId, filters]`
   - Stale time: 30 segundos (balance freshness/performance)
   - Invalidación automática después de mutaciones (create, update, delete)
   - Prefetching en hover de ProjectCard (anticipar navegación)

4. **Debouncing:**
   - Search input: 300ms debounce para evitar queries excesivas
   - Color picker: actualización visual inmediata, guardado debounced

#### Límites y Paginación

- **Actual:** Sin paginación (asume <1000 proyectos por organización)
- **Futuro:** Implementar cursor-based pagination cuando se superen 100 proyectos
- **Límite Server-Side:** Max 1000 proyectos en respuesta (safety limit)

### 6.3 Integraciones

#### APIs Externas

- **Ninguna en MVP:** Esta feature es auto-contenida

#### Webhooks (Futuro)

- Disparar webhook cuando proyecto se crea/archiva/elimina
- Notificar a sistemas externos de cambios en membresía

#### Background Jobs (Futuro)

- Limpieza de proyectos archivados >1 año (soft delete a hard delete)
- Generación de reportes de proyectos por organización

---

## 7. Referencias a Documentos Específicos

- **Supabase Spec:** `01-supabase-spec.md` (Test Agent creará)
- **Testing Spec:** `02-test-spec.md` (Test Agent creará)
- **Implementation Spec:** `03-implementation-spec.md` (Implementer creará)
- **UI/UX Spec:** `04-ui-spec.md` (UI/UX Expert creará)
- **Status Tracking:** `_status.md` (Todos los agentes actualizarán)

### Documentos Relacionados

- **PRD Padre:** `PRDs/auth/001-authentication-organizations/00-master-prd.md` (Organizations feature)
- **Migrations:**
  - Migration #11: `20251010082240_create_projects_schema.sql` ✅
  - Migration #12: `20251010090100_fix_projects_rls_vulnerability.sql` ✅
- **Entities:** `app/src/features/projects/entities.ts` ✅
- **Service:** `app/src/features/projects/services/project.service.ts` ✅

---

## 8. Criterios de Definición de Terminado (DoD)

### Para Supabase Agent

- [x] Schema de base de datos creado (Migration #11) ✅ Completado
- [x] Políticas RLS implementadas y probadas (Migration #12) ✅ Completado
- [x] Servicios de datos implementados (`project.service.ts`) ✅ Completado
- [x] Migraciones ejecutadas exitosamente en database ✅ Completado
- [ ] Tests de servicios implementados (`project.service.test.ts`)
- [ ] Validación manual de RLS con diferentes roles
- [ ] Documentación de queries complejas

### Para Test Agent

- [ ] Suite de tests unitarios creada para entities
- [ ] Tests de integración para use cases implementados
- [ ] Tests de servicios con mocks de Supabase
- [ ] Tests de API endpoints (route handlers)
- [ ] Mocks configurados correctamente
- [ ] Cobertura de tests >90% en todas las capas
- [ ] Tests de validación Zod exhaustivos

### Para Implementer Agent

- [ ] Casos de uso implementados:
  - [ ] `createProject.ts`
  - [ ] `getProjects.ts`
  - [ ] `getProjectById.ts`
  - [ ] `getProjectBySlug.ts`
  - [ ] `updateProject.ts`
  - [ ] `deleteProject.ts`
  - [ ] `archiveProject.ts`
  - [ ] `unarchiveProject.ts`
  - [ ] `addProjectMember.ts`
  - [ ] `removeProjectMember.ts`
  - [ ] `updateProjectMemberRole.ts`
  - [ ] `getProjectMembers.ts`
- [ ] API endpoints implementados (12 endpoints del Section 4)
- [ ] Todos los tests pasando (green)
- [ ] Validaciones de Zod integradas
- [ ] Manejo de errores completo
- [ ] Logging de operaciones críticas

### Para UI/UX Expert Agent

- [ ] Componentes implementados (9 componentes del Section 5.1)
- [ ] Páginas implementadas (4 páginas del Section 5.2)
- [ ] Tests E2E pasando (Playwright):
  - [ ] Flujo crear proyecto
  - [ ] Flujo buscar/filtrar proyectos
  - [ ] Flujo añadir miembro
  - [ ] Flujo archivar proyecto
- [ ] Accesibilidad validada (WCAG 2.1 AA):
  - [ ] Navegación por teclado completa
  - [ ] Screen reader compatible
  - [ ] Contraste de colores adecuado
  - [ ] Labels y ARIA attributes correctos
- [ ] Responsividad confirmada (mobile, tablet, desktop)
- [ ] Internacionalización completa:
  - [ ] Traducción namespace `projects.json` creado (en/es)
  - [ ] Namespace importado en `i18n/request.ts`
  - [ ] Sin strings hardcodeados
  - [ ] Mensajes de error traducidos
  - [ ] Validaciones Zod traducidas
- [ ] Performance verificada:
  - [ ] Lighthouse score >90
  - [ ] Core Web Vitals green
  - [ ] Sin memory leaks
  - [ ] Optimistic updates funcionando

---

## 9. Notas y Observaciones

### Decisiones de Diseño Importantes

1. **Slug Inmutable:** Una vez creado, el slug NO puede cambiarse. Esto previene broken links y simplifica implementación. Si necesitan cambiar el slug, deben crear nuevo proyecto y migrar data manualmente.

2. **Soft Delete con Archivado:** Preferimos archivado sobre eliminación hard. Proyectos archivados:
   - Conservan toda la data histórica
   - Son de solo lectura
   - Pueden reactivarse
   - Solo admins pueden eliminar permanentemente

3. **Favoritos a Nivel de Usuario:** Cada usuario tiene sus propios favoritos. Esto permite personalización sin afectar a otros miembros.

4. **JSONB Settings:** El campo `settings` es flexible para futuras extensiones sin cambiar schema. Ejemplos:
   ```json
   {
     "theme": "dark",
     "notifications": { "email": true, "slack": false },
     "custom_fields": { "budget": "50000", "priority": "high" }
   }
   ```

5. **Permisos Granulares:** Separamos `project.update`, `project.manage_settings`, y `project.manage` para control fino. Organizaciones pueden dar permisos específicos según necesidad.

6. **Auto-Join de Creadores:** Cuando un usuario crea un proyecto, automáticamente se añade como miembro con rol de creador (implementación en use case).

### Consideraciones Especiales

- **Multi-Tenancy:** RLS garantiza aislamiento total entre organizaciones. Proyectos de Org A son invisibles para usuarios de Org B.

- **Performance con Muchos Proyectos:** Si una organización supera 500 proyectos, considerar:
  - Paginación obligatoria
  - Virtual scrolling en UI
  - Índices adicionales

- **Migraciones Futuras:** El campo `settings` JSONB permite extender funcionalidad sin migrations. Ejemplos futuros:
  - Project templates
  - Custom workflows
  - Integration configs

- **Tareas (Future):** Esta feature establece la base. La implementación de tareas (tasks) será una feature separada que referenciará `project_id`.

### Limitaciones Conocidas

- **Sin Jerarquía de Proyectos:** No soportamos sub-proyectos. Todos los proyectos están al mismo nivel dentro de la organización.

- **Sin Historial de Cambios:** No rastreamos quién cambió qué y cuándo (audit log). Implementación futura si es necesario.

- **Sin Notificaciones:** No notificamos cuando se añaden miembros, se archivan proyectos, etc. Implementación futura.

- **Sin Exportación:** No hay funcionalidad de exportar proyecto a JSON/CSV. Implementación futura.

### Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| RLS mal configurado expone datos | Alto | Media | Tests exhaustivos de RLS, peer review de policies |
| Slug colisiones | Medio | Baja | Unique constraint en DB, validación en use case |
| Performance con muchos miembros | Medio | Media | Paginación en members list, lazy loading |
| JSONB settings sin validación | Medio | Media | Validación con Zod schema específico por tipo de setting |

---

**Última Actualización:** 2025-10-10
**Próxima Revisión:** Después de Test Agent completar 02-test-spec.md

---

## Appendix A: Permission Matrix

| Acción | Permiso Requerido | Notas |
|--------|-------------------|-------|
| Crear proyecto | `project.create` | Usuario debe estar en la organización |
| Ver proyecto | (ninguno) | Miembro de la organización es suficiente |
| Actualizar proyecto | `project.update` OR `project.manage_settings` OR `project.manage` | Debe ser miembro del proyecto |
| Eliminar proyecto | `project.delete` | Operación destructiva, requiere permiso especial |
| Archivar proyecto | `project.update` OR `project.manage` | Soft delete, menos peligroso que delete |
| Añadir miembro | `project.manage_members` OR `project.invite` OR `project.manage` | - |
| Remover miembro | `project.remove_members` OR `project.manage_members` OR `project.manage` OR self | Usuarios pueden salir voluntariamente |
| Actualizar rol de miembro | `project.manage_members` OR `project.manage` | - |
| Ver miembros | (ninguno) | Cualquier miembro del proyecto puede ver otros miembros |

---

## Appendix B: Database Schema Reference

```sql
-- Projects Table (Main)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
  slug TEXT NOT NULL CHECK (length(slug) >= 2 AND length(slug) <= 50 AND slug ~ '^[a-z0-9\-_]+$'),
  description TEXT CHECK (description IS NULL OR length(description) <= 1000),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed', 'on_hold')),
  color TEXT CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
  icon TEXT CHECK (icon IS NULL OR length(icon) <= 50),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  UNIQUE (organization_id, slug)
);

-- Project Members Table (Join)
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE (project_id, user_id)
);
```

---

## Appendix C: API Error Codes Reference

| Código | HTTP Status | Significado | Acción Usuario |
|--------|-------------|-------------|----------------|
| `VALIDATION_ERROR` | 400 | Input no válido según Zod schema | Corregir campos marcados en rojo |
| `SLUG_ALREADY_EXISTS` | 409 | Slug ya existe en la organización | Cambiar slug a uno único |
| `ALREADY_ARCHIVED` | 400 | Proyecto ya está archivado | Operación no necesaria |
| `NOT_ARCHIVED` | 400 | Proyecto no está archivado (intentando desarchivar) | Operación no aplicable |
| `ALREADY_MEMBER` | 400 | Usuario ya es miembro del proyecto | Verificar lista de miembros |
| `USER_NOT_IN_ORGANIZATION` | 400 | Usuario no pertenece a la organización | Invitar a organización primero |
| `UNAUTHORIZED` | 401 | Token no válido o expirado | Volver a iniciar sesión |
| `FORBIDDEN` | 403 | Sin permisos suficientes | Contactar admin para permisos |
| `NOT_FOUND` | 404 | Recurso no existe o sin acceso | Verificar URL o permisos |
| `INTERNAL_ERROR` | 500 | Error inesperado del servidor | Reportar a soporte técnico |

---

## Appendix D: Translation Keys Structure

**Namespace:** `projects` (archivo: `locales/{locale}/projects.json`)

```json
{
  "list": {
    "title": "Projects",
    "empty": {
      "title": "No projects yet",
      "description": "Create your first project to get started",
      "action": "Create Project"
    },
    "search": {
      "placeholder": "Search projects...",
      "noResults": "No projects found"
    }
  },
  "card": {
    "members": "{count, plural, =0 {No members} =1 {1 member} other {# members}}",
    "createdBy": "Created by {name}",
    "status": {
      "active": "Active",
      "archived": "Archived",
      "completed": "Completed",
      "on_hold": "On Hold"
    }
  },
  "form": {
    "name": {
      "label": "Project Name",
      "placeholder": "Enter project name",
      "error": {
        "required": "Name is required",
        "tooShort": "Name must be at least 2 characters",
        "tooLong": "Name cannot exceed 100 characters"
      }
    },
    "slug": {
      "label": "Project Slug",
      "description": "URL-friendly identifier (lowercase, numbers, hyphens)",
      "error": {
        "invalid": "Slug can only contain lowercase letters, numbers, and hyphens",
        "exists": "This slug already exists in the organization"
      }
    },
    "description": {
      "label": "Description",
      "placeholder": "Optional project description",
      "error": {
        "tooLong": "Description cannot exceed 1000 characters"
      }
    },
    "color": {
      "label": "Color",
      "error": "Invalid HEX color format"
    },
    "icon": {
      "label": "Icon",
      "placeholder": "Emoji or icon name"
    }
  },
  "actions": {
    "create": "Create Project",
    "edit": "Edit Project",
    "archive": "Archive",
    "unarchive": "Unarchive",
    "delete": "Delete",
    "addMember": "Add Member",
    "favorite": "Mark as Favorite",
    "unfavorite": "Remove from Favorites"
  },
  "confirmations": {
    "archive": {
      "title": "Archive this project?",
      "description": "The project will become read-only but can be unarchived later.",
      "confirm": "Archive",
      "cancel": "Cancel"
    },
    "delete": {
      "title": "Delete project permanently?",
      "description": "This action cannot be undone. All project data will be lost.",
      "confirm": "Delete",
      "cancel": "Cancel"
    }
  },
  "errors": {
    "loadFailed": "Failed to load projects",
    "createFailed": "Failed to create project",
    "updateFailed": "Failed to update project",
    "deleteFailed": "Failed to delete project",
    "forbidden": "You don't have permission to perform this action",
    "notFound": "Project not found or access denied"
  },
  "success": {
    "created": "Project created successfully",
    "updated": "Project updated successfully",
    "archived": "Project archived successfully",
    "unarchived": "Project unarchived successfully",
    "deleted": "Project deleted successfully",
    "memberAdded": "{name} added to project",
    "memberRemoved": "{name} removed from project"
  }
}
```

**IMPORTANTE:** Este namespace DEBE ser importado en `app/src/i18n/request.ts`:

```typescript
const projectsMessages = (await import(`@/locales/${locale}/projects.json`)).default;

const messages = {
  ...commonMessages,
  auth: authMessages,
  dashboard: dashboardMessages,
  projects: projectsMessages, // ← AÑADIR ESTA LÍNEA
};
```
