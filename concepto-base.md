# 🏗️ SISTEMA DE PERMISOS Y FEATURES - ESPECIFICACIÓN TÉCNICA COMPLETA

> **Versión**: 1.0  
> **Fecha**: 2025  
> **Objetivo**: Documento de especificación definitivo para implementación de sistema RBAC modular con features y multi-tenancy

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Conceptos Fundamentales](#2-conceptos-fundamentales)
3. [Arquitectura de Workspaces](#3-arquitectura-de-workspaces)
4. [Sistema de Features](#4-sistema-de-features)
5. [Sistema de Permisos (RBAC)](#5-sistema-de-permisos-rbac)
6. [Roles Especiales: Owner y Super Admin](#6-roles-especiales-owner-y-super-admin)
7. [Feature Obligatoria: Permissions Management](#7-feature-obligatoria-permissions-management)
8. [Sistema de Visibilidad](#8-sistema-de-visibilidad)
9. [Flujos de Verificación](#9-flujos-de-verificación)
10. [Modelo de Datos](#10-modelo-de-datos)
11. [Casos de Uso](#11-casos-de-uso)
12. [Reglas de Negocio](#12-reglas-de-negocio)

---

## 1. VISIÓN GENERAL DEL SISTEMA

### 1.1 Propósito

Este sistema implementa un **control de acceso granular, modular y escalable** que permite:

- Gestionar organizaciones y proyectos como espacios de trabajo independientes
- Activar/desactivar funcionalidades (features) de forma flexible y contextual
- Controlar el acceso mediante roles y permisos granulares
- Mantener dos roles especiales (Owner y Super Admin) con privilegios elevados
- Controlar la visibilidad de features según permisos del usuario

### 1.2 Pilares del Sistema

El sistema se sustenta en **tres componentes independientes pero interconectados**:

```
┌─────────────────────────────────────────┐
│   WORKSPACES (Contenedores)             │
│   - Organización (raíz)                 │
│   - Proyectos (hijos)                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   FEATURES (Funcionalidades)            │
│   - Módulos activables                  │
│   - Independientes por workspace        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   RBAC (Control de Acceso)              │
│   - Permisos granulares                 │
│   - Roles como conjuntos de permisos    │
│   - Owner y Super Admin especiales      │
└─────────────────────────────────────────┘
```

### 1.3 Principios de Diseño

1. **Modularidad Total**: Cualquier feature puede activarse en cualquier workspace sin restricciones
2. **Independencia Contextual**: Features y permisos NO se heredan entre workspaces
3. **Excepciones Mínimas**: Solo Owner y Super Admin tienen privilegios que trascienden contextos
4. **Visibilidad Controlada**: Los usuarios solo ven features para los que tienen permisos
5. **Flexibilidad Máxima**: El sistema debe adaptarse a cualquier caso de uso sin cambios de código

---

## 2. CONCEPTOS FUNDAMENTALES

### 2.1 Workspace

**Definición**: Un workspace es un contenedor de trabajo que representa un espacio donde los usuarios pueden trabajar y colaborar.

**Tipos de Workspace**:
- **Organization (Organización)**: Workspace raíz, contenedor padre
- **Project (Proyecto)**: Workspace hijo, contenido dentro de una organización

**Propiedades de un Workspace**:
```
workspace {
  id: UUID
  type: 'organization' | 'project'
  parent_id: UUID | NULL  // NULL si es org, org_id si es proyecto
  name: string
  slug: string
  owner_id: UUID  // Usuario que lo creó
  created_at: timestamp
}
```

**Características Clave**:
- Cada workspace tiene sus propios features activos
- Cada workspace tiene sus propios miembros con roles
- Los workspaces son contextos independientes
- Una organización puede contener múltiples proyectos

**Jerarquía**:
```
ORGANIZACIÓN (workspace raíz)
├─ parent_id: NULL
├─ Es el contenedor principal
├─ Puede tener cualquier feature
│
├─── PROYECTO 1 (workspace hijo)
│    ├─ parent_id: organization_id
│    ├─ Vive dentro de la org
│    └─ Tiene sus propios features independientes
│
└─── PROYECTO 2 (workspace hijo)
     ├─ parent_id: organization_id
     └─ Totalmente independiente del Proyecto 1
```

### 2.2 Feature

**Definición**: Un feature es un módulo funcional autocontenido que aporta capacidades específicas al workspace donde se activa.

**Estructura de un Feature**:
```
feature {
  id: UUID
  slug: string  // Ej: 'kanban', 'hr', 'chat'
  name: string  // Ej: 'Kanban Board'
  description: string
  category: string  // Ej: 'productivity', 'management'
}
```

**Ejemplos de Features**:
- `kanban`: Tableros Kanban
- `gantt`: Diagramas Gantt
- `chat`: Chat de equipo
- `time-tracking`: Seguimiento de tiempo
- `hr`: Gestión de recursos humanos
- `billing`: Facturación
- `analytics`: Analíticas
- `documents`: Gestión de documentos
- `calendar`: Calendario
- `permissions-management`: Gestión de permisos (obligatorio)

**Características**:
- Un feature puede activarse/desactivarse en cualquier workspace
- No hay restricciones de "features solo de org" o "solo de proyecto"
- Cada feature define sus propios recursos y permisos
- Los features son completamente modulares y desacoplados

### 2.3 Recurso (Resource)

**Definición**: Un recurso es una entidad sobre la cual se pueden realizar operaciones dentro de un feature.

**Ejemplo**:
```
Feature: kanban
├─ Resource: boards
├─ Resource: columns
├─ Resource: cards
└─ Resource: card_comments
```

### 2.4 Permiso (Permission)

**Definición**: Un permiso es la capacidad de realizar una acción específica sobre un recurso.

**Formato**: `resource.action`

**Ejemplos**:
```
boards.create    // Crear tableros
boards.read      // Ver tableros
boards.update    // Editar tableros
boards.delete    // Eliminar tableros
cards.move       // Mover tarjetas
cards.assign     // Asignar tarjetas
```

**Características**:
- Los permisos son granulares (operación específica sobre recurso específico)
- Los permisos pertenecen a features
- Los permisos son contextuales (solo aplican donde el feature está activo)

### 2.5 Rol (Role)

**Definición**: Un rol es una colección de permisos que se asigna a usuarios en un workspace específico.

**Tipos de Roles**:

**A. Roles Normales**:
```
Roles normales = Conjuntos de permisos
├─ Admin
├─ Editor
├─ Viewer
├─ Developer
├─ Manager
└─ (Cualquier rol custom)

Características:
- Son simplemente agrupaciones de permisos
- Se asignan en un workspace específico
- Son contextuales (no se heredan)
```

**B. Roles Especiales**:
```
Owner y Super Admin
├─ NO son conjuntos de permisos
├─ Tienen lógica especial en el sistema
├─ Tienen privilegios que trascienden contextos
└─ Tienen restricciones especiales entre ellos
```

**Scope de Roles**:
- Los roles normales solo aplican en el workspace donde se asignan
- Owner y Super Admin solo existen a nivel de organización
- No hay "Owner de proyecto" ni "Super Admin de proyecto"

---

## 3. ARQUITECTURA DE WORKSPACES

### 3.1 Organización (Organization)

**Definición**: La organización es el workspace raíz que actúa como contenedor principal.

**Características**:
```
Organización
├─ Es el nivel superior de la jerarquía
├─ Contiene proyectos
├─ Tiene un Owner (el que la creó)
├─ Puede tener Super Admins
├─ Puede tener cualquier feature activo
├─ Típicamente tiene features de gestión empresarial
└─ Es un workspace como cualquier otro
```

**Features Típicos en Organización**:
- Gestión de empleados (HR)
- Facturación (Billing)
- Documentos corporativos
- Settings de la organización
- Gestión de usuarios
- Permissions Management (obligatorio)

**Pero PUEDE tener cualquier feature**:
- Kanban
- Chat
- Calendario
- Etc.

### 3.2 Proyecto (Project)

**Definición**: Un proyecto es un workspace hijo contenido dentro de una organización.

**Características**:
```
Proyecto
├─ Vive dentro de una organización (parent_id)
├─ Es un espacio de trabajo para colaboración
├─ Tiene sus propios features activos
├─ Tiene sus propios miembros y roles
├─ Es completamente independiente de otros proyectos
└─ Es un workspace como cualquier otro
```

**Features Típicos en Proyecto**:
- Kanban
- Gantt
- Task Management
- Chat
- Time Tracking
- Files
- Permissions Management (obligatorio)

**Pero PUEDE tener cualquier feature**:
- HR
- Billing
- Etc. (aunque sería atípico)

### 3.3 Independencia entre Workspaces

**REGLA FUNDAMENTAL**: Los workspaces son contextos independientes.

**NO hay herencia de features**:
```
Organización tiene: [HR, Billing, Kanban]
Proyecto 1 tiene: [Kanban, Chat]
Proyecto 2 tiene: [Gantt, Time Tracking]

Cada workspace activa EXPLÍCITAMENTE sus features.
NO se heredan automáticamente.
```

**Ejemplo Visual**:
```
Org "TechCorp"
Features: [HR ✓, Billing ✓, Kanban ✓, Chat ✗]

├─── Proyecto "Marketing"
│    Features: [Kanban ✓, Chat ✓, HR ✗, Billing ✗]
│    └─ Tiene Kanban aunque org también
│    └─ Tiene Chat aunque org NO lo tenga
│    └─ NO tiene HR aunque org sí lo tenga
│
└─── Proyecto "Dev"
     Features: [Gantt ✓, Time Tracking ✓, Kanban ✗]
     └─ Completamente diferente
     └─ NO tiene Kanban aunque org sí lo tenga
```

**Implicaciones**:
- Para usar un feature en un workspace, debe estar EXPLÍCITAMENTE activado ahí
- Un usuario trabajando en un proyecto solo ve los features de ese proyecto
- Un usuario trabajando en la org solo ve los features de la org
- Son espacios de trabajo separados

---

## 4. SISTEMA DE FEATURES

### 4.1 Catálogo Global de Features

**Definición**: Existe un catálogo global que lista todos los features disponibles en el sistema.

**Tabla**: `features`
```sql
features {
  id: UUID
  slug: string (unique)
  name: string
  description: text
  category: string
}
```

**Características**:
- Es global (existe una sola vez)
- Lista todos los features posibles
- No está vinculado a ningún workspace específico
- Es el "menú" de features disponibles

**Ejemplo de Catálogo**:
```
features:
├─ kanban: "Kanban Board"
├─ gantt: "Gantt Charts"
├─ chat: "Team Chat"
├─ hr: "Human Resources"
├─ billing: "Billing & Invoicing"
├─ time-tracking: "Time Tracking"
├─ permissions-management: "Permissions Management" (obligatorio)
└─ ... (infinitos posibles)
```

### 4.2 Activación de Features

**Definición**: Un feature se activa en un workspace específico mediante una relación explícita.

**Tabla**: `workspace_features`
```sql
workspace_features {
  workspace_id: UUID (FK -> workspaces)
  feature_id: UUID (FK -> features)
  enabled: boolean
  config: JSONB (configuración específica)
  PRIMARY KEY (workspace_id, feature_id)
}
```

**Reglas de Activación**:
1. Un feature DEBE estar en `workspace_features` con `enabled=true` para estar activo
2. Si no está en la tabla, el feature NO existe en ese workspace
3. La activación es independiente por workspace
4. No hay límites en cuántos features puede tener un workspace

**Ejemplo**:
```sql
-- Org tiene Kanban y HR
INSERT INTO workspace_features VALUES 
  (org_1, feature_kanban, true),
  (org_1, feature_hr, true);

-- Proyecto 1 tiene Kanban y Chat
INSERT INTO workspace_features VALUES 
  (proj_1, feature_kanban, true),
  (proj_1, feature_chat, true);

-- Proyecto 2 solo tiene Gantt
INSERT INTO workspace_features VALUES 
  (proj_2, feature_gantt, true);
```

### 4.3 Recursos y Permisos de Features

**Definición**: Cada feature define los recursos sobre los que opera y los permisos disponibles.

**Tabla**: `feature_resources`
```sql
feature_resources {
  id: UUID
  feature_id: UUID (FK -> features)
  resource: string  // Ej: 'boards', 'cards'
  description: text
}
```

**Tabla**: `feature_permissions`
```sql
feature_permissions {
  id: UUID
  feature_id: UUID (FK -> features)
  resource: string
  action: string  // Ej: 'create', 'read', 'update', 'delete'
  description: text
  UNIQUE(feature_id, resource, action)
}
```

**Ejemplo Feature "Kanban"**:
```
feature: kanban

Resources:
├─ boards
├─ columns
├─ cards
└─ card_comments

Permissions:
├─ boards.create
├─ boards.read
├─ boards.update
├─ boards.delete
├─ columns.create
├─ columns.reorder
├─ cards.create
├─ cards.read
├─ cards.update
├─ cards.delete
├─ cards.move
├─ cards.assign
└─ card_comments.create
```

### 4.4 Independencia de Features

**REGLA**: Los features NO se heredan ni comparten entre workspaces.

**Verificación de Feature**:
```
Para saber si un feature está disponible en un workspace:

SELECT enabled 
FROM workspace_features 
WHERE workspace_id = ? 
  AND feature_id = ?

Si NO existe el registro o enabled=false → Feature NO disponible
Si existe y enabled=true → Feature disponible
```

**NO se debe**:
- Buscar el feature en la organización si no está en el proyecto
- Asumir que features de org están en proyectos
- Heredar configuración de features

**Cada workspace configura sus features independientemente**.

---

## 5. SISTEMA DE PERMISOS (RBAC)

### 5.1 Permisos Granulares

**Definición**: Los permisos son las capacidades atómicas del sistema.

**Formato**: `{resource}.{action}`

**Características**:
- Son específicos y granulares
- Pertenecen a features
- Son contextuales (solo aplican donde el feature está activo)

**Tabla**: `permissions` (vista materializada desde feature_permissions)
```sql
permissions {
  id: UUID
  feature_id: UUID
  resource: string
  action: string
  full_name: string  // resource.action
}
```

### 5.2 Roles Normales

**Definición**: Los roles normales son agrupaciones de permisos sin lógica especial.

**Tabla**: `roles`
```sql
roles {
  id: UUID
  name: string
  description: text
  is_special: boolean  // false para roles normales
  scope: string  // 'organization' o 'project'
}
```

**Tabla**: `role_permissions`
```sql
role_permissions {
  role_id: UUID (FK -> roles)
  permission_id: UUID (FK -> permissions)
  PRIMARY KEY (role_id, permission_id)
}
```

**Ejemplos de Roles Normales**:
```
Rol "Editor"
├─ boards.create
├─ boards.read
├─ boards.update
├─ cards.*  (todos los permisos de cards)
└─ comments.create

Rol "Viewer"
├─ boards.read
├─ cards.read
└─ comments.read

Rol "Manager"
├─ Todo de Editor +
├─ users.invite
└─ reports.view
```

**Características de Roles Normales**:
- Son simplemente conjuntos de permisos
- No tienen lógica especial en el sistema
- Se asignan a usuarios en workspaces específicos
- NO se heredan entre workspaces

### 5.3 Asignación de Roles a Usuarios

**Definición**: Los usuarios reciben roles en workspaces específicos.

**Tabla**: `user_workspace_roles`
```sql
user_workspace_roles {
  id: UUID
  user_id: UUID (FK -> auth.users)
  workspace_id: UUID (FK -> workspaces)
  role_id: UUID (FK -> roles)
  assigned_by: UUID (FK -> auth.users)
  assigned_at: timestamp
  UNIQUE(user_id, workspace_id, role_id)
}
```

**Reglas**:
- Un usuario puede tener múltiples roles en el mismo workspace
- Los permisos efectivos son la UNIÓN de todos sus roles
- Los roles solo aplican en el workspace donde se asignaron
- NO hay herencia de roles entre workspaces

**Ejemplo**:
```sql
-- María es Editor en Org
INSERT INTO user_workspace_roles VALUES 
  (uuid, maria_id, org_1, role_editor, owner_id, now());

-- María es Admin en Proyecto 1
INSERT INTO user_workspace_roles VALUES 
  (uuid, maria_id, proj_1, role_admin, owner_id, now());

-- María es Viewer en Proyecto 2
INSERT INTO user_workspace_roles VALUES 
  (uuid, maria_id, proj_2, role_viewer, owner_id, now());

Resultado:
- María tiene permisos diferentes en cada contexto
- Son independientes
```

### 5.4 Contexto de Permisos

**REGLA FUNDAMENTAL**: Los permisos son contextuales.

**Definición de Contexto**:
```
Contexto = { workspace_id, user_id }
```

**Verificación de Permisos**:
```
Para verificar si un usuario puede hacer algo:

1. Identificar el workspace actual (contexto)
2. Obtener roles del usuario EN ESE workspace
3. Obtener permisos de esos roles
4. Verificar si el permiso está en la lista
```

**NO se debe**:
- Verificar permisos en otros workspaces
- Asumir que permisos en org aplican en proyectos
- Buscar permisos fuera del contexto actual

**Excepciones**:
- Owner de la organización
- Super Admin de la organización

(Ver sección 6 para detalles)

---

## 6. ROLES ESPECIALES: OWNER Y SUPER ADMIN

### 6.1 Características Generales

**REGLA**: Owner y Super Admin son roles ESPECIALES que NO funcionan como roles normales.

**Diferencias con Roles Normales**:
```
Roles Normales:
└─ Son conjuntos de permisos
└─ Se verifican contra tabla role_permissions
└─ Son contextuales

Owner y Super Admin:
└─ NO son conjuntos de permisos
└─ Tienen lógica especial en el código
└─ Tienen privilegios que trascienden contextos
└─ Tienen restricciones especiales entre ellos
└─ Solo existen a NIVEL DE ORGANIZACIÓN
```

**Scope**:
- Owner y Super Admin solo se definen a nivel de **organización**
- NO existe "Owner de proyecto" ni "Super Admin de proyecto"
- El que crea un proyecto no obtiene un rol especial
- En proyectos solo hay roles normales

### 6.2 OWNER (Propietario)

**Definición**: El Owner es el usuario que creó la organización y tiene control absoluto e intocable sobre ella.

**Identificación**:
```sql
workspaces {
  id: UUID
  type: 'organization'
  owner_id: UUID  // El Owner
  ...
}
```

**Privilegios del Owner**:

1. **Acceso Global Absoluto**:
   - Tiene acceso total a la organización
   - Tiene acceso total a TODOS los proyectos de la organización
   - No necesita ser agregado explícitamente a proyectos
   - Bypass completo de verificación de permisos

2. **Control sobre Super Admins**:
   - Puede asignar rol de Super Admin a cualquier usuario
   - Puede remover rol de Super Admin de cualquier usuario
   - Puede modificar permisos de Super Admins
   - Los Super Admins NO pueden tocar al Owner

3. **Control sobre Usuarios Normales**:
   - Puede asignar/remover cualquier rol a cualquier usuario
   - Puede modificar permisos de cualquier usuario
   - Puede eliminar usuarios de la organización

4. **Gestión de la Organización**:
   - Puede eliminar la organización completa
   - Puede transferir ownership a otro usuario
   - Puede modificar configuración crítica de la organización

5. **Feature "Permissions Management"**:
   - Tiene SIEMPRE activos todos los permisos de esta feature
   - Independientemente de si está explícitamente asignado

**Restricciones del Owner**:
- Es único por organización (solo un Owner)
- No puede ser removido por nadie (excepto transferencia)
- No puede remover su propio rol de Owner (solo transferir)

**Verificación de Owner**:
```sql
SELECT owner_id 
FROM workspaces 
WHERE id = (
  SELECT COALESCE(parent_id, id) 
  FROM workspaces 
  WHERE id = :current_workspace_id
)

Si owner_id = user_id → Usuario es Owner
```

### 6.3 SUPER ADMIN (Super Administrador)

**Definición**: El Super Admin es un usuario con privilegios elevados pero con limitaciones respecto al Owner.

**Identificación**:
```sql
-- Tabla para marcar Super Admins
organization_super_admins {
  organization_id: UUID (FK -> workspaces)
  user_id: UUID (FK -> auth.users)
  assigned_by: UUID (FK -> auth.users)
  assigned_at: timestamp
  PRIMARY KEY (organization_id, user_id)
}
```

**Privilegios del Super Admin**:

1. **Acceso Global**:
   - Tiene acceso total a la organización
   - Tiene acceso total a TODOS los proyectos de la organización
   - No necesita ser agregado explícitamente a proyectos
   - Bypass de verificación de permisos normales

2. **Control sobre Usuarios Normales**:
   - Puede asignar/remover roles normales a usuarios
   - Puede modificar permisos de usuarios normales
   - Puede invitar/eliminar usuarios normales

3. **Feature "Permissions Management"**:
   - Tiene activos todos los permisos de esta feature
   - Puede gestionar roles y permisos

**Restricciones del Super Admin**:

1. **NO puede tocar al Owner**:
   - NO puede remover al Owner
   - NO puede modificar permisos del Owner
   - NO puede cambiar configuración que afecte al Owner

2. **NO puede tocar a otros Super Admins**:
   - NO puede remover a otros Super Admins
   - NO puede modificar permisos de otros Super Admins
   - NO puede afectar su estado de Super Admin

3. **NO puede auto-removerse**:
   - NO puede quitarse su propio rol de Super Admin
   - Solo el Owner puede removerlo

4. **NO puede eliminar la organización**:
   - Solo el Owner puede eliminar la organización

5. **Puede ser removido por el Owner**:
   - El Owner puede quitarle el rol de Super Admin
   - El Owner puede modificar sus permisos

**Verificación de Super Admin**:
```sql
SELECT EXISTS(
  SELECT 1 
  FROM organization_super_admins 
  WHERE organization_id = :org_id 
    AND user_id = :user_id
)
```

### 6.4 Jerarquía de Poder

```
┌─────────────────────────────────────────┐
│  OWNER                                  │
│  - Control absoluto                     │
│  - Intocable                            │
│  - Puede hacer TODO                     │
│  - Único                                │
└─────────────────────────────────────────┘
              ↓ puede gestionar
┌─────────────────────────────────────────┐
│  SUPER ADMIN                            │
│  - Control total EXCEPTO Owner          │
│  - NO puede tocar a Owner               │
│  - NO puede tocar a otros Super Admins  │
│  - Puede haber múltiples                │
└─────────────────────────────────────────┘
              ↓ pueden gestionar
┌─────────────────────────────────────────┐
│  USUARIOS NORMALES                      │
│  - Roles normales (conjuntos permisos)  │
│  - Contextuales                         │
│  - Pueden tener permisos de gestión     │
│    pero NUNCA tocar Owner/Super Admins  │
└─────────────────────────────────────────┘
```

### 6.5 Reglas de Interacción

**Tabla de Permisos entre Roles Especiales**:

| Acción | Owner puede | Super Admin puede | Usuario Normal puede |
|--------|-------------|-------------------|---------------------|
| Modificar Owner | ❌ No (solo transferir) | ❌ No | ❌ No |
| Asignar Super Admin | ✅ Sí | ❌ No | ❌ No |
| Remover Super Admin | ✅ Sí | ❌ No (ni a sí mismo) | ❌ No |
| Modificar Super Admin | ✅ Sí | ❌ No | ❌ No |
| Asignar roles normales | ✅ Sí | ✅ Sí | ✅ Sí (si tiene permiso) |
| Remover roles normales | ✅ Sí | ✅ Sí | ✅ Sí (si tiene permiso) |
| Eliminar organización | ✅ Sí | ❌ No | ❌ No |
| Acceder a cualquier proyecto | ✅ Sí | ✅ Sí | ❌ No |

### 6.6 Creación de Proyectos

**REGLA**: NO hay roles especiales a nivel de proyecto.

**Cuando se crea un proyecto**:
1. El usuario que lo crea NO obtiene un rol especial
2. Por defecto, se le asigna un rol normal con todos los permisos (ej: "Admin")
3. Este rol es configurable
4. NO es "Owner del proyecto", es simplemente el primer admin

**Permisos para crear proyectos**:
```
Pueden crear proyectos:
├─ Owner de la org (siempre)
├─ Super Admins de la org (siempre)
└─ Usuarios con permiso "projects.create" en la org
```

**Resultado**:
```
Usuario crea Proyecto X

1. Se crea el proyecto (parent_id = org_id)
2. Se asigna rol "Admin" al usuario en ese proyecto
3. El usuario tiene control total del proyecto
4. Pero NO es un "Owner especial"
5. Es un admin normal que puede ser removido
```

---

## 7. FEATURE OBLIGATORIA: PERMISSIONS MANAGEMENT

### 7.1 Definición

**Nombre**: `permissions-management`

**Propósito**: Feature que permite gestionar roles, permisos y miembros dentro de un workspace.

**Características**:
- Es un feature obligatorio en el sistema
- Debe estar disponible en todos los workspaces
- Se activa por defecto al crear un workspace
- No se puede desactivar completamente (pero sí sus permisos individuales)

### 7.2 Activación por Defecto

**REGLA**: Este feature se activa automáticamente al crear un workspace.

```sql
-- Trigger automático al crear workspace
CREATE TRIGGER auto_enable_permissions_management
AFTER INSERT ON workspaces
FOR EACH ROW
EXECUTE FUNCTION enable_permissions_management_feature();

-- La función activa el feature
CREATE FUNCTION enable_permissions_management_feature()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_features (workspace_id, feature_id, enabled)
  VALUES (
    NEW.id,
    (SELECT id FROM features WHERE slug = 'permissions-management'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7.3 Permisos del Feature

**Recursos y Permisos**:

```
Feature: permissions-management

Resources:
├─ members
├─ roles
├─ permissions
└─ projects (solo en org)

Permisos:
├─ members.view          // Ver lista de miembros
├─ members.invite        // Invitar nuevos miembros
├─ members.remove        // Eliminar miembros
├─ members.assign_roles  // Asignar roles a miembros
├─ members.remove_roles  // Quitar roles a miembros
├─ roles.view            // Ver roles existentes
├─ roles.create          // Crear roles nuevos
├─ roles.edit            // Editar roles
├─ roles.delete          // Eliminar roles
├─ permissions.view      // Ver permisos disponibles
├─ permissions.assign    // Asignar permisos a roles
├─ permissions.revoke    // Quitar permisos de roles
└─ projects.manage       // Gestionar proyectos (solo en org)
```

### 7.4 Acceso por Rol

**Owner**:
```
- Tiene TODOS los permisos de permissions-management
- SIEMPRE activos (bypass de verificación)
- En organización y en todos los proyectos
- No necesita asignación explícita
```

**Super Admin**:
```
- Tiene TODOS los permisos de permissions-management
- SIEMPRE activos (bypass de verificación)
- En organización y en todos los proyectos
- EXCEPTO: NO puede modificar Owner ni otros Super Admins
```

**Usuarios Normales**:
```
- Por defecto NO tienen ningún permiso de permissions-management
- Deben ser asignados explícitamente por Owner o Super Admin
- Si tienen permisos, NUNCA pueden:
  * Modificar al Owner
  * Modificar a Super Admins
  * Asignar el rol de Super Admin
- Pueden gestionar otros usuarios normales según permisos
```

### 7.5 Diferencias Org vs Proyecto

**A Nivel de Organización**:
```
permissions-management incluye:
├─ Gestión de miembros de la org
├─ Gestión de roles de la org
├─ projects.manage (crear, editar, eliminar proyectos)
└─ Asignación de Super Admins (solo Owner)
```

**A Nivel de Proyecto**:
```
permissions-management incluye:
├─ Gestión de miembros del proyecto
├─ Gestión de roles del proyecto
└─ NO incluye gestión de proyectos (eso es de la org)
```

### 7.6 Restricciones Especiales

**Al asignar roles**:
```javascript
// Pseudo-código de restricción
function canAssignRole(assigner, target_user, role) {
  // Owner puede asignar cualquier cosa
  if (assigner.isOwner()) return true;
  
  // Super Admin NO puede asignar Super Admin
  if (assigner.isSuperAdmin() && role === 'super_admin') {
    return false;
  }
  
  // Super Admin NO puede modificar a Owner
  if (assigner.isSuperAdmin() && target_user.isOwner()) {
    return false;
  }
  
  // Super Admin NO puede modificar a otros Super Admins
  if (assigner.isSuperAdmin() && target_user.isSuperAdmin()) {
    return false;
  }
  
  // Usuario normal con permiso "members.assign_roles"
  if (assigner.hasPermission('members.assign_roles')) {
    // NO puede tocar Owner
    if (target_user.isOwner()) return false;
    
    // NO puede tocar Super Admins
    if (target_user.isSuperAdmin()) return false;
    
    // NO puede asignar Super Admin
    if (role === 'super_admin') return false;
    
    // Puede asignar roles normales a usuarios normales
    return true;
  }
  
  return false;
}
```

---

## 8. SISTEMA DE VISIBILIDAD

### 8.1 Concepto de Visibilidad

**REGLA**: Los usuarios solo ven en la UI los features y opciones para los que tienen permisos.

**Principio**:
```
Si un usuario NO tiene permiso de visibilidad de un feature
→ El botón/menú de ese feature NO se muestra en la UI
```

### 8.2 Permiso de Visibilidad

**Definición**: Cada feature debe tener un permiso de visibilidad.

**Formato**: `{feature_slug}.view` o permisos específicos

**Ejemplo**:
```
Feature: kanban

Permisos:
├─ boards.read           // Ver tableros (visibilidad)
├─ boards.create         // Crear tableros
├─ boards.update         // Editar tableros
└─ boards.delete         // Eliminar tableros

Si usuario tiene "boards.read" → Ve opción Kanban en menú
Si NO tiene "boards.read" → NO ve opción Kanban
```

### 8.3 Verificación de Visibilidad

**Algoritmo**:
```javascript
// Pseudo-código para mostrar menú
function shouldShowFeatureInMenu(user, feature, workspace) {
  // 1. Owner y Super Admin ven todo
  if (user.isOwner() || user.isSuperAdmin()) {
    return isFeatureActive(feature, workspace);
  }
  
  // 2. Verificar si feature está activo
  if (!isFeatureActive(feature, workspace)) {
    return false;
  }
  
  // 3. Verificar si usuario tiene ALGÚN permiso del feature
  const featurePermissions = getFeaturePermissions(feature);
  const userPermissions = getUserPermissions(user, workspace);
  
  const hasAnyPermission = featurePermissions.some(
    perm => userPermissions.includes(perm)
  );
  
  return hasAnyPermission;
}
```

### 8.4 Implementación en UI

**Ejemplo en React**:
```jsx
// Hook para verificar visibilidad
function useFeatureVisibility(featureSlug) {
  const { user, workspace } = useContext();
  const { ability } = usePermissions();
  
  // Owner/Super Admin ven todo
  if (user.isOwner || user.isSuperAdmin) {
    return isFeatureActive(featureSlug, workspace);
  }
  
  // Verificar si tiene algún permiso del feature
  const feature = getFeature(featureSlug);
  const hasPermission = feature.permissions.some(
    perm => ability.can(perm.action, perm.resource)
  );
  
  return hasPermission;
}

// Uso en componente
function NavigationMenu() {
  const showKanban = useFeatureVisibility('kanban');
  const showChat = useFeatureVisibility('chat');
  const showHR = useFeatureVisibility('hr');
  
  return (
    <nav>
      {showKanban && <MenuItem to="/kanban">Kanban</MenuItem>}
      {showChat && <MenuItem to="/chat">Chat</MenuItem>}
      {showHR && <MenuItem to="/hr">HR</MenuItem>}
    </nav>
  );
}
```

### 8.5 Comportamiento por Rol

**Owner y Super Admin**:
```
- Ven TODOS los features activos en el workspace
- Independientemente de permisos específicos
- No necesitan permisos de visibilidad
```

**Usuarios Normales**:
```
- Solo ven features donde tienen AL MENOS un permiso
- Si tienen "boards.read" → Ven Kanban
- Si NO tienen ningún permiso de Kanban → NO lo ven
- Aunque el feature esté activo en el workspace
```

**Ejemplo**:
```
Workspace: Proyecto "Marketing"
Features activos: [Kanban, Chat, Files]

Usuario Pedro:
├─ Permisos: [boards.read, boards.create]
└─ Ve: Kanban (tiene permisos)
└─ NO ve: Chat, Files (sin permisos)

Usuario Ana:
├─ Permisos: [messages.send, files.upload]
└─ Ve: Chat, Files (tiene permisos)
└─ NO ve: Kanban (sin permisos)

Owner:
└─ Ve: Kanban, Chat, Files (todos los activos)
```

---

## 9. FLUJOS DE VERIFICACIÓN

### 9.1 Verificación de Permiso (Algoritmo Completo)

**Función Principal**: `canUserDoAction(user, action, resource, workspace)`

**Algoritmo**:
```javascript
function canUserDoAction(user, action, resource, workspace) {
  // PASO 1: Obtener organización
  const orgId = workspace.type === 'organization' 
    ? workspace.id 
    : workspace.parent_id;
  
  // PASO 2: ¿Usuario es Owner de la org?
  if (isOwnerOfOrganization(user.id, orgId)) {
    return {
      allowed: true,
      reason: 'owner_bypass'
    };
  }
  
  // PASO 3: ¿Usuario es Super Admin de la org?
  if (isSuperAdminOfOrganization(user.id, orgId)) {
    // Super Admin tiene restricciones especiales
    if (isProtectedAction(action, resource)) {
      // Acciones que afectan a Owner u otros Super Admins
      return {
        allowed: false,
        reason: 'super_admin_restriction'
      };
    }
    return {
      allowed: true,
      reason: 'super_admin_bypass'
    };
  }
  
  // PASO 4: ¿A qué feature pertenece el resource?
  const feature = getFeatureForResource(resource);
  if (!feature) {
    // Resource no pertenece a ningún feature
    return {
      allowed: false,
      reason: 'resource_not_found'
    };
  }
  
  // PASO 5: ¿Feature está activo en este workspace?
  const isActive = isFeatureActiveInWorkspace(feature.id, workspace.id);
  if (!isActive) {
    return {
      allowed: false,
      reason: 'feature_disabled'
    };
  }
  
  // PASO 6: ¿Usuario tiene el permiso en este workspace?
  const permission = `${resource}.${action}`;
  const hasPermission = userHasPermissionInWorkspace(
    user.id, 
    permission, 
    workspace.id
  );
  
  if (!hasPermission) {
    return {
      allowed: false,
      reason: 'insufficient_permissions'
    };
  }
  
  // TODO OK
  return {
    allowed: true,
    reason: 'permission_granted'
  };
}
```

### 9.2 Funciones Auxiliares

**isOwnerOfOrganization**:
```sql
SELECT owner_id = :user_id 
FROM workspaces 
WHERE id = :org_id AND type = 'organization'
```

**isSuperAdminOfOrganization**:
```sql
SELECT EXISTS(
  SELECT 1 
  FROM organization_super_admins 
  WHERE organization_id = :org_id 
    AND user_id = :user_id
)
```

**isFeatureActiveInWorkspace**:
```sql
SELECT enabled 
FROM workspace_features 
WHERE workspace_id = :workspace_id 
  AND feature_id = :feature_id
```

**userHasPermissionInWorkspace**:
```sql
-- Obtener todos los permisos del usuario en el workspace
WITH user_roles AS (
  SELECT role_id 
  FROM user_workspace_roles 
  WHERE user_id = :user_id 
    AND workspace_id = :workspace_id
),
user_permissions AS (
  SELECT p.full_name 
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  JOIN user_roles ur ON ur.role_id = rp.role_id
)
SELECT EXISTS(
  SELECT 1 
  FROM user_permissions 
  WHERE full_name = :permission
)
```

### 9.3 Acciones Protegidas (Super Admin)

**Definición**: Acciones que Super Admin NO puede realizar.

**Lista de Acciones Protegidas**:
```javascript
const PROTECTED_ACTIONS = {
  // Relacionadas con Owner
  'users.remove': (target_user) => target_user.isOwner(),
  'users.modify': (target_user) => target_user.isOwner(),
  'roles.assign': (target_user, role) => {
    return target_user.isOwner() || 
           (target_user.isSuperAdmin() && role !== 'remove');
  },
  'roles.remove': (target_user) => {
    return target_user.isOwner() || target_user.isSuperAdmin();
  },
  
  // Relacionadas con Super Admins
  'super_admin.assign': () => true,  // Solo Owner
  'super_admin.remove': () => true,  // Solo Owner
  
  // Relacionadas con organización
  'organization.delete': () => true,  // Solo Owner
  'organization.transfer': () => true,  // Solo Owner
};

function isProtectedAction(action, resource, context = {}) {
  const key = `${resource}.${action}`;
  const rule = PROTECTED_ACTIONS[key];
  
  if (!rule) return false;
  
  if (typeof rule === 'function') {
    return rule(context.target_user, context.role);
  }
  
  return rule;
}
```

### 9.4 Flujo de Creación de Workspace

**Creación de Organización**:
```
1. Usuario crea organización
2. Se crea el registro en workspaces
   └─ owner_id = user_id
   └─ type = 'organization'
   └─ parent_id = NULL

3. Se activa feature "permissions-management" automáticamente
   └─ INSERT INTO workspace_features

4. Usuario es ahora Owner
   └─ Tiene acceso total automático
   └─ No necesita asignación de roles
```

**Creación de Proyecto**:
```
1. Usuario crea proyecto (debe tener permiso o ser Owner/Super Admin)
2. Se crea el registro en workspaces
   └─ parent_id = organization_id
   └─ type = 'project'
   └─ owner_id = NULL (no aplica a proyectos)

3. Se activa feature "permissions-management" automáticamente

4. Se asigna rol "Admin" al creador
   └─ INSERT INTO user_workspace_roles
   └─ Es un rol NORMAL (no especial)
   └─ Tiene todos los permisos por defecto

5. Creador puede gestionar el proyecto
   └─ Pero puede ser removido por Owner/Super Admin
   └─ No es "Owner del proyecto"
```

### 9.5 Flujo de Asignación de Roles

**Asignar Rol Normal**:
```
1. Usuario A intenta asignar rol "Editor" a Usuario B en Workspace X

2. Verificar: ¿A puede hacer esto?
   ├─ ¿A es Owner? → SÍ, permitir
   ├─ ¿A es Super Admin? → Verificar restricciones
   │  ├─ ¿B es Owner? → NO permitir
   │  ├─ ¿B es Super Admin? → NO permitir
   │  └─ ¿B es usuario normal? → SÍ, permitir
   └─ ¿A tiene permiso "members.assign_roles"?
      ├─ ¿B es Owner? → NO permitir
      ├─ ¿B es Super Admin? → NO permitir
      └─ ¿B es usuario normal? → SÍ, permitir

3. Si permitido:
   INSERT INTO user_workspace_roles 
   VALUES (B.id, workspace_x, role_editor, A.id, now())
```

**Asignar Super Admin** (solo Owner):
```
1. Owner intenta asignar Super Admin a Usuario B

2. Verificar: ¿Usuario es Owner? 
   └─ NO → Denegar
   └─ SÍ → Continuar

3. Verificar: ¿Es a nivel organización?
   └─ NO → Denegar (Super Admin solo en org)
   └─ SÍ → Continuar

4. Asignar:
   INSERT INTO organization_super_admins 
   VALUES (org_id, B.id, owner_id, now())
```

---

## 10. MODELO DE DATOS

### 10.1 Tablas Core

**workspaces**
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('organization', 'project')),
  parent_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT org_no_parent CHECK (
    (type = 'organization' AND parent_id IS NULL) OR
    (type = 'project' AND parent_id IS NOT NULL)
  ),
  CONSTRAINT org_has_owner CHECK (
    (type = 'organization' AND owner_id IS NOT NULL) OR
    (type = 'project')
  ),
  UNIQUE(parent_id, slug)  -- Slug único dentro de org
);

CREATE INDEX idx_workspaces_parent ON workspaces(parent_id);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
```

**features**
```sql
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature obligatorio
INSERT INTO features (slug, name, is_mandatory) VALUES
  ('permissions-management', 'Permissions Management', TRUE);
```

**workspace_features**
```sql
CREATE TABLE workspace_features (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  enabled_by UUID REFERENCES auth.users(id),
  
  PRIMARY KEY (workspace_id, feature_id)
);

CREATE INDEX idx_workspace_features_workspace ON workspace_features(workspace_id);
CREATE INDEX idx_workspace_features_feature ON workspace_features(feature_id);
CREATE INDEX idx_workspace_features_enabled ON workspace_features(workspace_id, enabled);
```

**feature_resources**
```sql
CREATE TABLE feature_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  description TEXT,
  
  UNIQUE(feature_id, resource)
);

CREATE INDEX idx_feature_resources_feature ON feature_resources(feature_id);
```

**feature_permissions**
```sql
CREATE TABLE feature_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  
  UNIQUE(feature_id, resource, action)
);

CREATE INDEX idx_feature_permissions_feature ON feature_permissions(feature_id);
```

**permissions (vista materializada)**
```sql
CREATE MATERIALIZED VIEW permissions AS
SELECT 
  id,
  feature_id,
  resource,
  action,
  resource || '.' || action AS full_name,
  description
FROM feature_permissions;

CREATE UNIQUE INDEX idx_permissions_id ON permissions(id);
CREATE INDEX idx_permissions_feature ON permissions(feature_id);
CREATE INDEX idx_permissions_full_name ON permissions(full_name);

-- Refresh automático cuando cambia feature_permissions
CREATE TRIGGER refresh_permissions_on_change
AFTER INSERT OR UPDATE OR DELETE ON feature_permissions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_permissions_view();
```

### 10.2 Tablas RBAC

**roles**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  is_special BOOLEAN DEFAULT FALSE,
  scope VARCHAR(20) CHECK (scope IN ('organization', 'project')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(slug, scope)
);

CREATE INDEX idx_roles_special ON roles(is_special);
```

**role_permissions**
```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES feature_permissions(id) ON DELETE CASCADE,
  
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
```

**user_workspace_roles**
```sql
CREATE TABLE user_workspace_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, workspace_id, role_id)
);

CREATE INDEX idx_user_workspace_roles_user ON user_workspace_roles(user_id);
CREATE INDEX idx_user_workspace_roles_workspace ON user_workspace_roles(workspace_id);
CREATE INDEX idx_user_workspace_roles_role ON user_workspace_roles(role_id);
CREATE INDEX idx_user_workspace_roles_user_workspace ON user_workspace_roles(user_id, workspace_id);
```

**organization_super_admins**
```sql
CREATE TABLE organization_super_admins (
  organization_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (organization_id, user_id),
  
  CONSTRAINT super_admin_only_in_org CHECK (
    organization_id IN (
      SELECT id FROM workspaces WHERE type = 'organization'
    )
  )
);

CREATE INDEX idx_org_super_admins_org ON organization_super_admins(organization_id);
CREATE INDEX idx_org_super_admins_user ON organization_super_admins(user_id);
```

### 10.3 Funciones de Base de Datos

**get_user_organization**
```sql
CREATE FUNCTION get_user_organization(p_workspace_id UUID)
RETURNS UUID AS $$
  SELECT COALESCE(parent_id, id)
  FROM workspaces
  WHERE id = p_workspace_id;
$$ LANGUAGE sql STABLE;
```

**is_user_owner**
```sql
CREATE FUNCTION is_user_owner(p_user_id UUID, p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT owner_id = p_user_id
  FROM workspaces
  WHERE id = get_user_organization(p_workspace_id)
    AND type = 'organization';
$$ LANGUAGE sql STABLE;
```

**is_user_super_admin**
```sql
CREATE FUNCTION is_user_super_admin(p_user_id UUID, p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM organization_super_admins
    WHERE organization_id = get_user_organization(p_workspace_id)
      AND user_id = p_user_id
  );
$$ LANGUAGE sql STABLE;
```

**is_feature_active**
```sql
CREATE FUNCTION is_feature_active(p_feature_slug TEXT, p_workspace_id UUID)
RETURNS BOOLEAN AS $$
  SELECT enabled
  FROM workspace_features wf
  JOIN features f ON f.id = wf.feature_id
  WHERE wf.workspace_id = p_workspace_id
    AND f.slug = p_feature_slug;
$$ LANGUAGE sql STABLE;
```

**get_user_permissions_in_workspace**
```sql
CREATE FUNCTION get_user_permissions_in_workspace(
  p_user_id UUID,
  p_workspace_id UUID
)
RETURNS TABLE (
  permission_id UUID,
  full_name TEXT,
  resource TEXT,
  action TEXT
) AS $$
  SELECT DISTINCT
    p.id,
    p.full_name,
    p.resource,
    p.action
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  JOIN user_workspace_roles uwr ON uwr.role_id = rp.role_id
  WHERE uwr.user_id = p_user_id
    AND uwr.workspace_id = p_workspace_id;
$$ LANGUAGE sql STABLE;
```

**user_can**
```sql
CREATE FUNCTION user_can(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT,
  p_workspace_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_org_id UUID;
  v_is_owner BOOLEAN;
  v_is_super_admin BOOLEAN;
  v_feature_slug TEXT;
  v_is_active BOOLEAN;
  v_permission TEXT;
BEGIN
  -- Obtener organización
  v_org_id := get_user_organization(p_workspace_id);
  
  -- Verificar Owner
  v_is_owner := is_user_owner(p_user_id, p_workspace_id);
  IF v_is_owner THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar Super Admin
  v_is_super_admin := is_user_super_admin(p_user_id, p_workspace_id);
  IF v_is_super_admin THEN
    -- Super Admin tiene restricciones (implementar aquí si necesario)
    RETURN TRUE;
  END IF;
  
  -- Obtener feature del resource
  SELECT f.slug INTO v_feature_slug
  FROM features f
  JOIN feature_resources fr ON fr.feature_id = f.id
  WHERE fr.resource = p_resource
  LIMIT 1;
  
  IF v_feature_slug IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si feature está activo
  v_is_active := is_feature_active(v_feature_slug, p_workspace_id);
  IF NOT v_is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar permiso
  v_permission := p_resource || '.' || p_action;
  
  RETURN EXISTS(
    SELECT 1
    FROM get_user_permissions_in_workspace(p_user_id, p_workspace_id)
    WHERE full_name = v_permission
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### 10.4 Triggers

**auto_enable_permissions_management**
```sql
CREATE FUNCTION auto_enable_permissions_management()
RETURNS TRIGGER AS $$
DECLARE
  v_feature_id UUID;
BEGIN
  -- Obtener ID del feature permissions-management
  SELECT id INTO v_feature_id
  FROM features
  WHERE slug = 'permissions-management';
  
  -- Activarlo automáticamente
  INSERT INTO workspace_features (workspace_id, feature_id, enabled, enabled_by)
  VALUES (NEW.id, v_feature_id, TRUE, NEW.owner_id)
  ON CONFLICT (workspace_id, feature_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_enable_permissions_management
AFTER INSERT ON workspaces
FOR EACH ROW
EXECUTE FUNCTION auto_enable_permissions_management();
```

**prevent_remove_mandatory_features**
```sql
CREATE FUNCTION prevent_remove_mandatory_features()
RETURNS TRIGGER AS $$
DECLARE
  v_is_mandatory BOOLEAN;
BEGIN
  -- Verificar si el feature es obligatorio
  SELECT is_mandatory INTO v_is_mandatory
  FROM features
  WHERE id = NEW.feature_id;
  
  -- Si es obligatorio y se intenta desactivar, prevenir
  IF v_is_mandatory AND NEW.enabled = FALSE THEN
    RAISE EXCEPTION 'Cannot disable mandatory feature';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_remove_mandatory_features
BEFORE UPDATE ON workspace_features
FOR EACH ROW
EXECUTE FUNCTION prevent_remove_mandatory_features();
```

---

## 11. CASOS DE USO

### 11.1 Caso: Usuario Normal en Múltiples Contextos

**Contexto**:
- Usuario: Juan
- Organización: "TechCorp"
- Proyectos: "Marketing", "Development"

**Configuración**:
```
Org "TechCorp"
├─ Owner: María
├─ Features activos: [HR, Billing, Kanban, permissions-management]
├─ Juan tiene rol: "Employee"
│  └─ Permisos: [profile.read, profile.update, hr.view_own]

Proyecto "Marketing"
├─ Features activos: [Kanban, Chat, Files, permissions-management]
├─ Juan tiene rol: "Admin"
│  └─ Permisos: [boards.*, cards.*, messages.*, files.*]

Proyecto "Development"
├─ Features activos: [Kanban, Gantt, Time Tracking, permissions-management]
├─ Juan tiene rol: "Viewer"
   └─ Permisos: [*.read]
```

**Comportamiento**:

**En Organización**:
```
Juan accede a /org/techcorp

Ve en el menú:
├─ HR (tiene permiso hr.view_own)
├─ Kanban (tiene permiso implícito de org)
└─ Mi Perfil

NO ve:
├─ Billing (sin permisos)
├─ Settings (sin permisos)
└─ Permissions (sin permisos)

Puede hacer:
├─ Ver su perfil de empleado
├─ Editar su perfil
└─ Ver información de HR que le corresponda
```

**En Proyecto Marketing**:
```
Juan accede a /org/techcorp/project/marketing

Ve en el menú:
├─ Kanban (es admin, tiene todos los permisos)
├─ Chat (es admin, tiene todos los permisos)
├─ Files (es admin, tiene todos los permisos)
└─ Permissions (es admin, puede gestionar el equipo)

Puede hacer:
├─ Crear/editar/eliminar boards
├─ Gestionar tarjetas
├─ Enviar mensajes en chat
├─ Subir/eliminar archivos
└─ Invitar miembros al proyecto
└─ Asignar roles (excepto a Owner/Super Admins)
```

**En Proyecto Development**:
```
Juan accede a /org/techcorp/project/development

Ve en el menú:
├─ Kanban (tiene permiso de lectura)
├─ Gantt (tiene permiso de lectura)
└─ Time Tracking (tiene permiso de lectura)

NO ve:
└─ Permissions (sin permisos de gestión)

Puede hacer:
├─ Ver tableros Kanban (solo lectura)
├─ Ver diagramas Gantt (solo lectura)
├─ Ver registros de tiempo (solo lectura)

NO puede hacer:
├─ Crear/editar/eliminar nada
└─ Gestionar miembros
```

### 11.2 Caso: Owner y Super Admin

**Contexto**:
- Organización: "StartupXYZ"
- Owner: Ana
- Super Admin: Carlos

**Configuración**:
```
Org "StartupXYZ"
├─ Owner: Ana
├─ Super Admin: Carlos
├─ Features activos: [HR, Billing, permissions-management]

Proyecto "Product"
├─ Features activos: [Kanban, Chat, permissions-management]
├─ Miembro explícito: Pedro (Admin del proyecto)
```

**Comportamiento de Ana (Owner)**:

```
En Organización:
├─ Ve TODO
├─ Puede activar/desactivar cualquier feature
├─ Puede asignar Super Admin a Carlos
├─ Puede remover Super Admin a Carlos
├─ Puede eliminar la organización

En Proyecto "Product":
├─ Acceso automático (no necesita ser agregada)
├─ Ve TODO
├─ Puede gestionar miembros
├─ Puede activar/desactivar features del proyecto
├─ Puede eliminar el proyecto
└─ Puede remover a Pedro como Admin
```

**Comportamiento de Carlos (Super Admin)**:

```
En Organización:
├─ Ve TODO
├─ Puede activar/desactivar features (excepto algunos críticos)
├─ NO puede asignar Super Admin a otros
├─ NO puede remover a Ana (Owner)
├─ NO puede eliminar la organización

En Proyecto "Product":
├─ Acceso automático (no necesita ser agregado)
├─ Ve TODO
├─ Puede gestionar miembros normales
├─ Puede activar/desactivar features del proyecto
├─ NO puede eliminar el proyecto (solo Owner)
└─ Puede remover a Pedro como Admin
```

**Interacción entre ellos**:

```
Ana puede:
├─ Remover a Carlos como Super Admin → SÍ
├─ Modificar permisos de Carlos → SÍ (aunque es Super Admin)
└─ Eliminar a Carlos de la org → SÍ

Carlos puede:
├─ Remover a Ana como Owner → NO
├─ Modificar permisos de Ana → NO
├─ Eliminar a Ana de la org → NO
└─ Modificar a otros Super Admins → NO
```

### 11.3 Caso: Creación de Proyecto

**Contexto**:
- Usuario: Laura
- Organización: "AgencyCo"
- Laura crea un nuevo proyecto

**Flujo**:

**Paso 1: Laura crea el proyecto**
```
Laura accede a /org/agencyco/projects/new

Sistema verifica:
├─ ¿Laura es Owner? → NO
├─ ¿Laura es Super Admin? → NO
├─ ¿Laura tiene permiso "projects.create"? → SÍ
└─ Permitir creación
```

**Paso 2: Se crea el proyecto**
```sql
-- Se inserta el workspace
INSERT INTO workspaces (type, parent_id, name, slug) VALUES
  ('project', 'agencyco_id', 'Client Website', 'client-website');

-- Se activa permissions-management automáticamente (trigger)
INSERT INTO workspace_features VALUES
  ('project_id', 'permissions-management_id', true);

-- Se asigna rol "Admin" a Laura
INSERT INTO user_workspace_roles VALUES
  (uuid, 'laura_id', 'project_id', 'admin_role_id', 'laura_id', now());
```

**Paso 3: Configuración inicial**
```
Laura es ahora "Admin" del proyecto (rol normal, NO Owner)

Puede:
├─ Activar features en el proyecto
├─ Invitar miembros
├─ Asignar roles
├─ Configurar el proyecto

PERO:
├─ NO es "Owner del proyecto" (no existe ese concepto)
├─ Owner de la org (Ana) puede acceder al proyecto
├─ Super Admins de la org pueden acceder al proyecto
├─ Ana puede remover a Laura como Admin
└─ Laura puede ser removida del proyecto
```

### 11.4 Caso: Activación de Features

**Contexto**:
- Proyecto: "Marketing Campaign"
- Admin del proyecto: Roberto
- Features disponibles: Kanban, Gantt, Chat, Time Tracking

**Flujo**:

**Roberto quiere activar Kanban**:
```
1. Accede a /project/marketing-campaign/settings/features

2. Ve lista de features disponibles:
   ├─ Kanban (inactive)
   ├─ Gantt (inactive)
   ├─ Chat (inactive)
   └─ Time Tracking (inactive)

3. Click en "Activate Kanban"

4. Sistema verifica:
   ├─ ¿Roberto es Owner/Super Admin? → NO
   ├─ ¿Roberto tiene permiso "features.manage"? → SÍ (es Admin)
   └─ Permitir

5. Se activa el feature:
   INSERT INTO workspace_features VALUES
     ('project_id', 'kanban_id', true, '{}', now(), 'roberto_id');

6. Kanban ahora disponible en el proyecto
```

**Resultado**:
```
Features activos en proyecto:
├─ Kanban (activo)
├─ permissions-management (obligatorio, siempre activo)

Miembros del proyecto ahora pueden:
├─ Ver opción "Kanban" en menú (si tienen permisos)
├─ Crear boards (si tienen permiso boards.create)
├─ Ver boards (si tienen permiso boards.read)
```

### 11.5 Caso: Sistema de Visibilidad

**Contexto**:
- Proyecto: "Development Team"
- Features activos: [Kanban, Chat, Time Tracking, Files, permissions-management]
- Usuarios: Ana (Admin), Pedro (Developer), Laura (Viewer)

**Configuración de Roles**:
```
Rol "Admin" (Ana):
├─ Todos los permisos (*.*)

Rol "Developer" (Pedro):
├─ boards.* (todos los permisos de boards)
├─ cards.* (todos los permisos de cards)
├─ messages.send
├─ messages.read
├─ time_entries.create
└─ time_entries.read

Rol "Viewer" (Laura):
├─ boards.read
├─ cards.read
└─ messages.read
```

**Visibilidad en UI**:

**Ana (Admin) ve**:
```
Menú:
├─ Kanban ✓ (tiene permisos)
├─ Chat ✓ (tiene permisos)
├─ Time Tracking ✓ (tiene permisos)
├─ Files ✓ (tiene permisos)
└─ Permissions ✓ (tiene permisos)

Ve TODO porque es Admin
```

**Pedro (Developer) ve**:
```
Menú:
├─ Kanban ✓ (tiene boards.* y cards.*)
├─ Chat ✓ (tiene messages.send y messages.read)
├─ Time Tracking ✓ (tiene time_entries.*)
└─ Files ✗ (sin permisos de files)
└─ Permissions ✗ (sin permisos de gestión)

Solo ve features donde tiene AL MENOS un permiso
```

**Laura (Viewer) ve**:
```
Menú:
├─ Kanban ✓ (tiene boards.read)
├─ Chat ✓ (tiene messages.read)
└─ Time Tracking ✗ (sin permisos)
└─ Files ✗ (sin permisos)
└─ Permissions ✗ (sin permisos)

Solo ve features donde tiene AL MENOS un permiso
```

**Dentro de Kanban**:

**Ana**:
```
├─ Puede crear boards ✓
├─ Puede editar boards ✓
├─ Puede eliminar boards ✓
├─ Puede crear cards ✓
├─ Puede mover cards ✓
└─ Ve todos los botones/acciones
```

**Pedro**:
```
├─ Puede crear boards ✓
├─ Puede editar boards ✓
├─ Puede eliminar boards ✓
├─ Puede crear cards ✓
├─ Puede mover cards ✓
└─ Ve todos los botones/acciones (tiene permisos completos de Kanban)
```

**Laura**:
```
├─ Puede VER boards ✓
├─ Puede VER cards ✓
├─ NO ve botón "Create Board" (sin permiso)
├─ NO ve botón "Edit" (sin permiso)
├─ NO ve botón "Delete" (sin permiso)
└─ Solo modo lectura
```

---

## 12. REGLAS DE NEGOCIO

### 12.1 Reglas de Workspaces

**RN-W01**: Una organización DEBE tener un owner_id.
```sql
CONSTRAINT org_has_owner CHECK (
  (type = 'organization' AND owner_id IS NOT NULL) OR
  (type = 'project')
)
```

**RN-W02**: Una organización NO puede tener parent_id.
```sql
CONSTRAINT org_no_parent CHECK (
  (type = 'organization' AND parent_id IS NULL) OR
  (type = 'project' AND parent_id IS NOT NULL)
)
```

**RN-W03**: Un proyecto DEBE tener parent_id (la organización que lo contiene).

**RN-W04**: El slug de un workspace debe ser único dentro de su contenedor (org o proyecto dentro de org).
```sql
UNIQUE(parent_id, slug)
```

**RN-W05**: Al eliminar una organización, se eliminan en cascada todos sus proyectos.
```sql
ON DELETE CASCADE
```

### 12.2 Reglas de Features

**RN-F01**: El feature "permissions-management" es obligatorio y se activa automáticamente al crear un workspace.

**RN-F02**: Los features obligatorios NO pueden ser desactivados.
```sql
-- Trigger previene desactivación
IF v_is_mandatory AND NEW.enabled = FALSE THEN
  RAISE EXCEPTION 'Cannot disable mandatory feature';
END IF;
```

**RN-F03**: Un feature solo está disponible en un workspace si existe en `workspace_features` con `enabled=true`.

**RN-F04**: NO hay herencia de features entre workspaces. Cada workspace debe activar explícitamente sus features.

**RN-F05**: Cualquier feature puede ser activado en cualquier tipo de workspace (org o proyecto).

**RN-F06**: Un feature define sus propios recursos y permisos en el catálogo global.

### 12.3 Reglas de Permisos

**RN-P01**: Los permisos son específicos de features y solo aplican donde el feature está activo.

**RN-P02**: Un permiso tiene el formato `{resource}.{action}`.

**RN-P03**: Los permisos son contextuales: solo aplican en el workspace donde se asignaron.

**RN-P04**: NO hay herencia de permisos entre workspaces (excepto Owner y Super Admin).

**RN-P05**: Los permisos efectivos de un usuario son la UNIÓN de todos los permisos de sus roles en ese workspace.

**RN-P06**: Para verificar un permiso, se debe:
1. Verificar Owner/Super Admin (bypass)
2. Verificar que el feature esté activo
3. Verificar que el usuario tenga el permiso en ese workspace

### 12.4 Reglas de Roles

**RN-R01**: Los roles normales son conjuntos de permisos sin lógica especial.

**RN-R02**: Un usuario puede tener múltiples roles en el mismo workspace.

**RN-R03**: Los roles NO se heredan entre workspaces.

**RN-R04**: Los roles se asignan mediante `user_workspace_roles` que vincula usuario + workspace + rol.

**RN-R05**: Un rol puede tener scope `organization` o `project`, indicando para qué tipo de workspace está pensado.

### 12.5 Reglas de Owner

**RN-O01**: El Owner es el usuario especificado en `workspaces.owner_id` de la organización.

**RN-O02**: Solo existe Owner a nivel de organización, NO a nivel de proyecto.

**RN-O03**: El Owner tiene acceso total y automático a la organización y TODOS sus proyectos.

**RN-O04**: El Owner tiene bypass completo de verificación de permisos.

**RN-O05**: El Owner puede asignar y remover Super Admins.

**RN-O06**: El Owner puede modificar cualquier aspecto de cualquier usuario, incluidos Super Admins.

**RN-O07**: El Owner NO puede remover su propio rol de Owner (solo transferir).

**RN-O08**: El Owner puede eliminar la organización completa.

**RN-O09**: El Owner tiene todos los permisos del feature "permissions-management" siempre activos.

**RN-O10**: Nadie puede remover o modificar al Owner excepto el Owner mismo.

### 12.6 Reglas de Super Admin

**RN-SA01**: Super Admin solo existe a nivel de organización.

**RN-SA02**: Se identifica mediante la tabla `organization_super_admins`.

**RN-SA03**: Solo el Owner puede asignar Super Admins.

**RN-SA04**: Puede haber múltiples Super Admins en una organización.

**RN-SA05**: El Super Admin tiene acceso total a la organización y todos sus proyectos.

**RN-SA06**: El Super Admin tiene bypass de verificación de permisos normales.

**RN-SA07**: El Super Admin NO puede:
- Modificar al Owner
- Remover al Owner
- Asignar Super Admin a otros
- Remover Super Admin de otros
- Modificar otros Super Admins
- Remover su propio rol de Super Admin
- Eliminar la organización

**RN-SA08**: El Super Admin puede gestionar usuarios normales sin restricciones.

**RN-SA09**: El Owner puede remover a un Super Admin en cualquier momento.

### 12.7 Reglas de Usuarios Normales

**RN-UN01**: Los usuarios normales tienen permisos según sus roles asignados en cada workspace.

**RN-UN02**: Un usuario con permiso de gestión (ej: `members.assign_roles`) puede gestionar otros usuarios normales.

**RN-UN03**: Un usuario normal NUNCA puede:
- Modificar al Owner
- Modificar a Super Admins
- Asignar rol de Super Admin
- Acceder a workspaces donde no tiene roles asignados

**RN-UN04**: Un usuario normal solo ve en la UI los features donde tiene al menos un permiso.

**RN-UN05**: Los permisos de un usuario normal son estrictamente contextuales al workspace.

### 12.8 Reglas de Creación de Proyectos

**RN-CP01**: Pueden crear proyectos:
- Owner de la organización
- Super Admins de la organización
- Usuarios con permiso `projects.create` en la organización

**RN-CP02**: Al crear un proyecto, el creador recibe automáticamente un rol "Admin" (rol normal).

**RN-CP03**: El creador NO recibe un rol especial de "Owner del proyecto".

**RN-CP04**: El proyecto se crea con `parent_id` apuntando a la organización.

**RN-CP05**: El feature "permissions-management" se activa automáticamente en el proyecto.

**RN-CP06**: El Owner y Super Admins de la organización tienen acceso automático al nuevo proyecto.

### 12.9 Reglas de Visibilidad

**RN-V01**: Los usuarios solo ven en la UI los features donde tienen al menos un permiso.

**RN-V02**: Owner y Super Admin ven TODOS los features activos en un workspace.

**RN-V03**: Si un usuario no tiene ningún permiso de un feature, ese feature NO aparece en su menú.

**RN-V04**: La visibilidad se evalúa feature por feature, no de forma global.

**RN-V05**: Dentro de un feature visible, las acciones individuales (botones) se muestran según permisos específicos.

**Ejemplo**:
```
Usuario tiene: boards.read, boards.create
└─ Ve: Feature Kanban
└─ Ve: Botón "New Board"
└─ NO ve: Botón "Delete Board" (sin permiso)
```

### 12.10 Reglas de Feature Permissions Management

**RN-PM01**: El feature "permissions-management" es obligatorio y no puede desactivarse.

**RN-PM02**: A nivel organización, incluye permisos de gestión de proyectos.

**RN-PM03**: A nivel proyecto, NO incluye permisos de gestión de proyectos.

**RN-PM04**: Owner tiene todos los permisos de este feature siempre activos.

**RN-PM05**: Super Admin tiene todos los permisos de este feature siempre activos (con restricciones).

**RN-PM06**: Usuarios normales NO tienen permisos de este feature por defecto.

**RN-PM07**: Los permisos deben ser asignados explícitamente por Owner o Super Admin.

**RN-PM08**: Un usuario con permisos de gestión NO puede:
- Modificar Owner
- Modificar Super Admins
- Asignar rol de Super Admin

### 12.11 Reglas de Transferencia de Ownership

**RN-TO01**: Solo el Owner actual puede transferir ownership.

**RN-TO02**: La transferencia debe ser a otro usuario existente en la organización.

**RN-TO03**: Al transferir:
```
1. Se actualiza workspaces.owner_id
2. El anterior Owner pasa a ser un usuario normal
3. El nuevo Owner obtiene todos los privilegios
```

**RN-TO04**: La transferencia es irreversible sin hacer otra transferencia.

**RN-TO05**: El Owner NO puede transferir ownership a sí mismo (no-op).

### 12.12 Reglas de Eliminación

**RN-E01**: Solo el Owner puede eliminar una organización.

**RN-E02**: Al eliminar una organización, se eliminan en cascada:
- Todos los proyectos
- Todas las asignaciones de roles
- Todas las activaciones de features
- Todos los Super Admins

**RN-E03**: Owner y Super Admins pueden eliminar proyectos.

**RN-E04**: Usuarios con permiso específico pueden eliminar proyectos.

**RN-E05**: Al eliminar un proyecto, se eliminan en cascada:
- Todas las asignaciones de roles del proyecto
- Todas las activaciones de features del proyecto
- Todos los datos asociados al proyecto

---

## 13. IMPLEMENTACIÓN EN BIBLIOTECA

### 13.1 Interfaz del Cliente Principal

```typescript
class RBACClient {
  // Gestión de contexto
  async setActiveWorkspace(workspaceId: string): Promise<void>
  async getActiveWorkspace(): Promise<Workspace | null>
  
  // Verificación de permisos
  async can(action: string, resource: string): Promise<boolean>
  async canInWorkspace(action: string, resource: string, workspaceId: string): Promise<boolean>
  
  // Obtener permisos efectivos
  async getUserPermissions(workspaceId?: string): Promise<Permission[]>
  async buildAbility(workspaceId?: string): Promise<Ability>  // CASL
  
  // Features
  async getActiveFeatures(workspaceId?: string): Promise<Feature[]>
  async isFeatureActive(featureSlug: string, workspaceId?: string): Promise<boolean>
  async getFeatureVisibility(workspaceId?: string): Promise<Map<string, boolean>>
  
  // Roles especiales
  async isOwner(workspaceId?: string): Promise<boolean>
  async isSuperAdmin(workspaceId?: string): Promise<boolean>
  
  // Gestión de usuarios (requiere permisos)
  async getWorkspaceMembers(workspaceId: string): Promise<User[]>
  async assignRole(userId: string, roleId: string, workspaceId: string): Promise<void>
  async removeRole(userId: string, roleId: string, workspaceId: string): Promise<void>
  
  // Gestión de Super Admins (solo Owner)
  async assignSuperAdmin(userId: string, organizationId: string): Promise<void>
  async removeSuperAdmin(userId: string, organizationId: string): Promise<void>
}
```

### 13.2 React Hooks

```typescript
// Hook principal de permisos
function usePermissions(workspaceId?: string) {
  const { ability, loading, error } = ...
  return { ability, loading, error }
}

// Hook de visibilidad de features
function useFeatureVisibility(workspaceId?: string) {
  const visibilityMap = ...  // Map<featureSlug, boolean>
  return visibilityMap
}

// Hook de roles especiales
function useRoleStatus(workspaceId?: string) {
  const { isOwner, isSuperAdmin, loading } = ...
  return { isOwner, isSuperAdmin, loading }
}

// Hook de workspace activo
function useActiveWorkspace() {
  const { workspace, setWorkspace } = ...
  return { workspace, setWorkspace }
}
```

### 13.3 Componentes de UI

```typescript
// Renderizado condicional por permiso
<Can I="create" a="boards" ability={ability}>
  <CreateBoardButton />
</Can>

// Renderizado condicional por feature
<FeatureGate feature="kanban">
  <KanbanBoard />
</FeatureGate>

// Menú dinámico
<NavigationMenu>
  <DynamicFeatureLinks workspace={workspace} />
</NavigationMenu>
```

### 13.4 Server-Side Middleware

```typescript
// Middleware de Next.js para proteger rutas
export async function middleware(request: NextRequest) {
  const workspaceId = extractWorkspaceFromUrl(request.url)
  const user = await getAuthUser(request)
  
  // Verificar acceso al workspace
  const hasAccess = await rbac.canAccessWorkspace(user.id, workspaceId)
  if (!hasAccess) {
    return NextResponse.redirect('/unauthorized')
  }
  
  return NextResponse.next()
}
```

---

## 14. CONSIDERACIONES DE PERFORMANCE

### 14.1 Estrategias de Cache

**Cache en Cliente**:
```
L1: Memoria local (React state)
└─ Permisos del workspace actual
└─ Features activos
└─ TTL: Hasta cambio de workspace

L2: LocalStorage
└─ Última configuración conocida
└─ Se invalida al re-login
```

**Cache en Servidor**:
```
L1: Redis
└─ Permisos por usuario + workspace
└─ TTL: 5 minutos
└─ Invalidación: Al cambiar roles/permisos

L2: PostgreSQL Materialized Views
└─ Permisos agregados
└─ Refresh: Cada X tiempo o on-demand
```

### 14.2 Optimizaciones de Consultas

**Índices Críticos**:
```sql
-- Para verificación de permisos
CREATE INDEX idx_user_workspace_roles_user_workspace 
ON user_workspace_roles(user_id, workspace_id);

-- Para features activos
CREATE INDEX idx_workspace_features_enabled 
ON workspace_features(workspace_id, enabled) 
WHERE enabled = true;

-- Para Super Admins
CREATE INDEX idx_org_super_admins_user_org 
ON organization_super_admins(user_id, organization_id);
```

**Consultas Optimizadas**:
```sql
-- Vista materializada de permisos efectivos
CREATE MATERIALIZED VIEW user_effective_permissions AS
SELECT 
  uwr.user_id,
  uwr.workspace_id,
  p.full_name,
  p.resource,
  p.action
FROM user_workspace_roles uwr
JOIN role_permissions rp ON rp.role_id = uwr.role_id
JOIN permissions p ON p.id = rp.permission_id;

-- Refresh automático
CREATE TRIGGER refresh_user_permissions
AFTER INSERT OR UPDATE OR DELETE ON user_workspace_roles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_effective_permissions();
```

### 14.3 Lazy Loading

**Features**:
```typescript
// Cargar features solo cuando se navega a un workspace
async function navigateToWorkspace(workspaceId: string) {
  // Cambiar contexto
  await rbac.setActiveWorkspace(workspaceId)
  
  // Cargar features de forma lazy
  const features = await rbac.getActiveFeatures(workspaceId)
  
  // Cargar permisos de forma lazy
  const permissions = await rbac.getUserPermissions(workspaceId)
  
  // Construir ability
  const ability = await rbac.buildAbility(workspaceId)
}
```

---

## 15. SEGURIDAD

### 15.1 Row Level Security (RLS)

**Políticas en Supabase**:

```sql
-- Workspaces: Solo miembros pueden ver
CREATE POLICY "Users can view workspaces they belong to"
ON workspaces FOR SELECT
TO authenticated
USING (
  is_user_owner(auth.uid(), id) OR
  is_user_super_admin(auth.uid(), id) OR
  EXISTS (
    SELECT 1 FROM user_workspace_roles
    WHERE user_id = auth.uid() AND workspace_id = workspaces.id
  )
);

-- Features: Solo si workspace es accesible
CREATE POLICY "Users can view features of accessible workspaces"
ON workspace_features FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT id FROM workspaces
    WHERE is_user_owner(auth.uid(), id) OR
          is_user_super_admin(auth.uid(), id) OR
          EXISTS (
            SELECT 1 FROM user_workspace_roles
            WHERE user_id = auth.uid() AND workspace_id = workspaces.id
          )
  )
);

-- Permisos: Solo propios
CREATE POLICY "Users can view their own permissions"
ON user_workspace_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### 15.2 Validación en Backend

**Siempre validar en servidor**:
```typescript
// API Route: /api/boards/create
export async function POST(request: Request) {
  const { workspaceId, boardData } = await request.json()
  const user = await getAuthUser(request)
  
  // Verificación exhaustiva
  const { allowed, reason } = await rbac.canUserDoAction(
    user.id,
    'create',
    'boards',
    workspaceId
  )
  
  if (!allowed) {
    return Response.json(
      { error: reason },
      { status: 403 }
    )
  }
  
  // Proceder con creación
  const board = await createBoard(workspaceId, boardData)
  return Response.json(board)
}
```

### 15.3 Protección contra Ataques

**Prevención de Privilege Escalation**:
```typescript
// Antes de asignar rol, verificar restricciones
async function assignRole(
  assignerId: string,
  targetId: string,
  roleId: string,
  workspaceId: string
) {
  // Obtener usuarios
  const assigner = await getUser(assignerId)
  const target = await getUser(targetId)
  const role = await getRole(roleId)
  
  // Verificar si assigner puede hacer esto
  if (target.isOwner()) {
    throw new Error('Cannot modify owner')
  }
  
  if (target.isSuperAdmin() && !assigner.isOwner()) {
    throw new Error('Only owner can modify super admins')
  }
  
  if (role.slug === 'super_admin' && !assigner.isOwner()) {
    throw new Error('Only owner can assign super admin')
  }
  
  // Si pasa todas las verificaciones, asignar
  await db.insertUserWorkspaceRole(...)
}
```

---

## 16. TESTING

### 16.1 Tests Unitarios

```typescript
describe('Permission Verification', () => {
  it('should allow owner to do anything', async () => {
    const result = await rbac.can('delete', 'boards', workspace.id)
    expect(result).toBe(true)
  })
  
  it('should deny user without permission', async () => {
    const result = await rbac.can('delete', 'boards', workspace.id)
    expect(result).toBe(false)
  })
  
  it('should deny if feature is disabled', async () => {
    await deactivateFeature('kanban', workspace.id)
    const result = await rbac.can('create', 'boards', workspace.id)
    expect(result).toBe(false)
  })
})
```

### 16.2 Tests de Integración

```typescript
describe('Super Admin Restrictions', () => {
  it('should prevent super admin from modifying owner', async () => {
    await expect(
      rbac.removeRole(owner.id, adminRole.id, workspace.id)
    ).rejects.toThrow('Cannot modify owner')
  })
  
  it('should prevent super admin from assigning super admin', async () => {
    await expect(
      rbac.assignSuperAdmin(user.id, org.id)
    ).rejects.toThrow('Only owner can assign super admin')
  })
})
```

---

## 17. MIGRACIÓN Y VERSIONADO

### 17.1 Migración Inicial

```sql
-- V1: Crear estructura base
-- workspaces, features, permissions, roles

-- V2: Agregar Super Admins
-- organization_super_admins

-- V3: Agregar feature obligatorio
-- Auto-enable permissions-management
```

### 17.2 Añadir Nuevos Features

```sql
-- 1. Insertar feature en catálogo
INSERT INTO features (slug, name, description) VALUES
  ('time-tracking', 'Time Tracking', 'Track time spent on tasks');

-- 2. Definir recursos
INSERT INTO feature_resources (feature_id, resource) VALUES
  (time_tracking_id, 'time_entries'),
  (time_tracking_id, 'timesheets');

-- 3. Definir permisos
INSERT INTO feature_permissions (feature_id, resource, action) VALUES
  (time_tracking_id, 'time_entries', 'create'),
  (time_tracking_id, 'time_entries', 'read'),
  (time_tracking_id, 'time_entries', 'update'),
  (time_tracking_id, 'time_entries', 'delete');

-- 4. Ya disponible para activar en workspaces
```

---

## 18. GLOSARIO

**Workspace**: Contenedor de trabajo, puede ser organización (raíz) o proyecto (hijo).

**Organization**: Workspace raíz que contiene proyectos y usuarios.

**Project**: Workspace hijo contenido en una organización.

**Feature**: Módulo funcional autocontenido con recursos y permisos propios.

**Resource**: Entidad sobre la cual se realizan operaciones (ej: boards, cards, users).

**Permission**: Capacidad de realizar una acción específica sobre un recurso (`resource.action`).

**Role**: Colección de permisos asignada a usuarios en un workspace.

**Owner**: Usuario que creó la organización, tiene control absoluto e intocable.

**Super Admin**: Usuario con privilegios elevados pero con restricciones respecto al Owner.

**RBAC**: Role-Based Access Control, control de acceso basado en roles.

**RLS**: Row Level Security, seguridad a nivel de fila en PostgreSQL.

**Contexto**: Workspace actual donde opera el usuario.

**Visibilidad**: Capacidad de ver un feature en la UI según permisos.

**Scope**: Alcance de un rol o permiso (organization o project).

**Bypass**: Saltar verificación de permisos (solo Owner y Super Admin).

---

## 19. REFERENCIAS

### 19.1 Tecnologías Base

- **Supabase**: https://supabase.com
- **PostgreSQL**: https://postgresql.org
- **CASL**: https://casl.js.org
- **Next.js**: https://nextjs.org

### 19.2 Patrones de Diseño

- Multi-Tenant Table (MTT)
- Hierarchical RBAC
- Feature Flags
- Context-Aware Authorization

### 19.3 Documentación Relacionada

- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- CASL Abilities: https://casl.js.org/v6/en/guide/intro
- PostgreSQL Row Security: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

**FIN DEL DOCUMENTO**

---

> **Nota para Implementadores**: Este documento es la fuente de verdad para la implementación del sistema. Cualquier duda o ambigüedad debe resolverse consultando este documento o solicitando aclaraciones al arquitecto del sistema. NO improvisar lógica que no esté explícitamente definida aquí.
