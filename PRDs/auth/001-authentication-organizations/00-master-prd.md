# PRD: Sistema de Autenticación y Organizaciones

## Metadata
- **Feature ID:** auth-001
- **Version:** 1.0
- **Created:** 2025-09-26
- **Status:** Draft
- **Dependencies:** Ninguna (feature base)
- **Assigned Architect:** Arquitecto Principal

---

## 1. User Story
> Como un **usuario nuevo**, quiero **registrarme y crear o unirme a una organización** para poder **colaborar en proyectos de gestión de tareas con mi equipo**.

### Contexto del Negocio
El sistema necesita una base sólida de autenticación y gestión organizacional que permita a los usuarios colaborar de forma segura. Cada usuario debe pertenecer al menos a una organización para acceder a las funcionalidades de la aplicación, garantizando un contexto de trabajo colaborativo desde el primer momento.

### Usuarios Objetivo
- **Primarios:** Nuevos usuarios que necesitan registrarse y configurar su espacio de trabajo
- **Secundarios:** Administradores de organizaciones que invitan y gestionan usuarios

---

## 2. Criterios de Aceptación

### Funcionales
- **DEBE** permitir registro con email/password y Google OAuth
- **DEBE** verificar email antes de activar la cuenta (Supabase automático)
- **DEBE** permitir crear organizaciones con nombre único y código de invitación
- **DEBE** generar códigos de invitación únicos de 8 caracteres alfanuméricos
- **DEBE** permitir unirse a organizaciones usando identificador + código
- **DEBE** asignar automáticamente rol de administrador al creador de la organización
- **DEBE** implementar sistema de permisos base escalable para futuras features
- **DEBE** forzar a usuarios sin organización a crear/unirse a una antes de acceder
- **NO DEBE** permitir nombres de organización duplicados
- **NO DEBE** permitir códigos de invitación duplicados

### No Funcionales
- **Performance:** DEBE responder en menos de 300ms para operaciones de autenticación
- **Accesibilidad:** DEBE cumplir WCAG 2.1 AA mínimo
- **Responsividad:** DEBE funcionar en móvil (375px+), tablet (768px+) y desktop (1024px+)
- **Seguridad:** DEBE implementar RLS estricto para aislamiento entre organizaciones
- **Escalabilidad:** DEBE soportar hasta 10,000 organizaciones y 100,000 usuarios

---

## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales
- **Nueva Entidad:** `User` en `src/features/auth/entities.ts`
- **Nueva Entidad:** `Organization` en `src/features/auth/entities.ts`
- **Nueva Entidad:** `OrganizationMember` en `src/features/auth/entities.ts`
- **Nueva Entidad:** `Permission` en `src/features/auth/entities.ts`
- **Nueva Entidad:** `Role` en `src/features/auth/entities.ts`

### Schemas de Zod
```typescript
import { z } from 'zod';

// Usuario base (extiende auth.users de Supabase)
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  avatar_url: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

// Organización
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Solo letras, números, espacios, guiones y guiones bajos"),
  slug: z.string()
    .min(2, "Identificador debe tener al menos 2 caracteres")
    .max(50, "Identificador no puede exceder 50 caracteres")
    .regex(/^[a-z0-9\-_]+$/, "Solo letras minúsculas, números, guiones y guiones bajos"),
  invite_code: z.string().length(8, "Código debe tener exactamente 8 caracteres"),
  description: z.string().max(500, "Descripción no puede exceder 500 caracteres").optional(),
  created_by: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

// Miembro de organización
export const OrganizationMemberSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  joined_at: z.date(),
  invited_by: z.string().uuid().optional(),
});

// Permiso base (escalable para futuras features)
export const PermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  resource: z.string().min(1).max(50), // ej: "organization", "project", "task"
  action: z.string().min(1).max(50), // ej: "create", "read", "update", "delete", "manage"
  created_at: z.date(),
});

// Rol (agrupa permisos)
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  organization_id: z.string().uuid().optional(), // null = rol del sistema
  is_system_role: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

// Relación rol-permiso
export const RolePermissionSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
});

// Schemas para operaciones
export const OrganizationCreateSchema = OrganizationSchema.omit({
  id: true,
  invite_code: true,
  created_by: true,
  created_at: true,
  updated_at: true,
});

export const OrganizationJoinSchema = z.object({
  slug: z.string().min(2).max(50),
  invite_code: z.string().length(8),
});

export const UserProfileUpdateSchema = UserProfileSchema.pick({
  name: true,
  avatar_url: true,
}).partial();

// Tipos TypeScript
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type RolePermission = z.infer<typeof RolePermissionSchema>;
export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationJoin = z.infer<typeof OrganizationJoinSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
```

### Relaciones
- **User** tiene muchos **OrganizationMember** (one-to-many)
- **Organization** tiene muchos **OrganizationMember** (one-to-many)
- **OrganizationMember** pertenece a **User** y **Organization** (many-to-one)
- **Role** tiene muchos **RolePermission** (one-to-many)
- **Permission** tiene muchos **RolePermission** (one-to-many)

---

## 4. Contrato de API Endpoints

### Autenticación (Supabase Auth)
- **Registro:** Supabase Auth con email/password y Google OAuth
- **Login:** Supabase Auth
- **Logout:** Supabase Auth
- **Verificación:** Supabase Auth automática

### Organizaciones
#### POST /api/organizations
- **Ruta:** `POST /api/organizations`
- **Autenticación:** Requerida
- **Body Schema:** `OrganizationCreateSchema`

**Respuestas:**
- **Éxito:** `201` con `Organization` creada
- **Errores:**
  - `400` - Validación fallida o nombre/slug duplicado
  - `401` - Usuario no autenticado
  - `500` - Error del servidor

#### POST /api/organizations/join
- **Ruta:** `POST /api/organizations/join`
- **Autenticación:** Requerida
- **Body Schema:** `OrganizationJoinSchema`

**Respuestas:**
- **Éxito:** `200` con `OrganizationMember` creado
- **Errores:**
  - `400` - Validación fallida
  - `404` - Organización no encontrada o código inválido
  - `409` - Usuario ya es miembro
  - `401` - Usuario no autenticado

#### GET /api/organizations/me
- **Ruta:** `GET /api/organizations/me`
- **Autenticación:** Requerida

**Respuestas:**
- **Éxito:** `200` con array de organizaciones del usuario
- **Errores:**
  - `401` - Usuario no autenticado

### Perfil de Usuario
#### GET /api/users/me
- **Ruta:** `GET /api/users/me`
- **Autenticación:** Requerida

#### PUT /api/users/me
- **Ruta:** `PUT /api/users/me`
- **Autenticación:** Requerida
- **Body Schema:** `UserProfileUpdateSchema`

---

## 5. Especificaciones de UI/UX

### Componentes Requeridos
- **Páginas de Autenticación:**
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/register/page.tsx`
  - `src/app/(auth)/verify-email/page.tsx`
- **Componentes de Organización:**
  - `CreateOrganizationForm` en `src/features/auth/components/`
  - `JoinOrganizationForm` en `src/features/auth/components/`
  - `OrganizationSelector` en `src/features/auth/components/`
- **Páginas de Onboarding:**
  - `src/app/(main)/onboarding/page.tsx`

### Flujos de Usuario

#### 1. Flujo de Registro Nuevo Usuario
1. Usuario accede a `/register`
2. Completa formulario (email, password, nombre)
3. Opción de registro con Google OAuth
4. Sistema envía email de verificación
5. Usuario verifica email
6. Redirección a `/onboarding`
7. Usuario debe crear organización o unirse a una
8. Redirección a dashboard principal

#### 2. Flujo de Creación de Organización
1. Usuario en onboarding selecciona "Crear organización"
2. Completa formulario (nombre, identificador, descripción)
3. Sistema genera código de invitación automáticamente
4. Usuario se convierte en administrador automáticamente
5. Redirección a dashboard con organización activa

#### 3. Flujo de Unirse a Organización
1. Usuario en onboarding selecciona "Unirse a organización"
2. Introduce identificador de organización + código
3. Sistema valida y añade como miembro
4. Redirección a dashboard con organización activa

### Estados de la Interfaz
- **Loading:** Spinners durante autenticación y operaciones
- **Error:** Mensajes específicos para cada tipo de error
- **Success:** Confirmaciones de acciones exitosas
- **Empty:** Estado cuando usuario no tiene organizaciones

---

## 6. Consideraciones Técnicas

### Seguridad
- **Políticas RLS:**
  - Usuarios solo ven sus propios datos de perfil
  - Miembros solo ven organizaciones a las que pertenecen
  - Administradores ven todos los miembros de sus organizaciones
- **Validaciones:**
  - Códigos de invitación únicos y seguros
  - Slugs de organización únicos
  - Sanitización de nombres y descripciones
- **Autenticación:**
  - Integración completa con Supabase Auth
  - Manejo seguro de tokens JWT
  - Refresh tokens automáticos

### Performance
- **Optimizaciones:**
  - Índices en campos de búsqueda frecuente
  - Cache de organizaciones del usuario
  - Paginación para listas grandes
- **Caching:**
  - Cache de 5 minutos para datos de organización
  - Invalidación automática en cambios

### Escalabilidad
- **Sistema de Permisos:**
  - Arquitectura preparada para nuevos recursos y acciones
  - Roles personalizados por organización
  - Herencia de permisos configurable
- **Base de Datos:**
  - Particionado por organización para escalabilidad
  - Índices optimizados para consultas frecuentes

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
- [ ] Schema de usuarios, organizaciones y permisos creado
- [ ] Políticas RLS implementadas y probadas
- [ ] Servicios de datos para auth y organizaciones
- [ ] Integración con Supabase Auth configurada
- [ ] Migraciones ejecutadas exitosamente

### Para Test Agent
- [ ] Tests unitarios para casos de uso de auth
- [ ] Tests de integración para API endpoints
- [ ] Tests de seguridad para RLS
- [ ] Mocks de Supabase Auth configurados
- [ ] Cobertura > 90%

### Para Implementer Agent
- [ ] Casos de uso de autenticación implementados
- [ ] API endpoints funcionando correctamente
- [ ] Middleware de autenticación configurado
- [ ] Validaciones de Zod implementadas
- [ ] Manejo de errores robusto

### Para UI/UX Expert Agent
- [ ] Páginas de autenticación implementadas
- [ ] Flujo de onboarding completo
- [ ] Componentes de organización funcionales
- [ ] Tests E2E para flujos completos
- [ ] Accesibilidad validada

---

## 9. Notas y Observaciones

### Decisiones de Diseño
1. **Sistema de permisos escalable:** Se diseña con recursos y acciones genéricos para permitir fácil extensión cuando se añadan nuevas features como kanban, calendario, chat, etc.

2. **Códigos de invitación:** Se generan automáticamente para evitar colisiones y garantizar unicidad.

3. **Roles del sistema vs personalizados:** Se permite tanto roles predefinidos del sistema como roles personalizados por organización.

### Permisos Base Iniciales
```
Recursos: organization, project, user
Acciones: create, read, update, delete, manage, invite

Ejemplos:
- organization.manage: Control total de la organización
- project.create: Crear nuevos proyectos
- user.invite: Invitar usuarios a la organización
- project.read: Ver proyectos específicos
```

### Consideraciones Futuras (v1.1+)
- Roles a nivel de proyecto independientes de organización
- Permisos temporales con expiración
- Auditoría de cambios de permisos
- Integración con proveedores de identidad empresariales (SAML, LDAP)

### Riesgos Identificados
1. **Complejidad de permisos:** Mitigado con sistema base simple y extensible
2. **Colisión de códigos:** Mitigado con generación automática y validación
3. **Escalabilidad de RLS:** Mitigado con índices apropiados y particionado

---

**Última Actualización:** 2025-09-26
**Próxima Revisión:** 2025-10-03