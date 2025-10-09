# Concepto del Proyecto: SaaS de Gestión de Proyectos

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Propósito:** Herramienta de gestión de proyectos para pequeñas y medianas empresas de software

---

## 1. Visión General

### 1.1 Propuesta de Valor

Ofrecer una experiencia fluida y satisfactoria con una **curva de aprendizaje muy suave sin perder potencia**, donde todo sea muy personalizable:

- **Campos personalizados** en todas las entidades
- **Roles y permisos personalizados** a todos los niveles
- **Conexiones entre todo** (vincular tareas → notas → eventos → mensajes)
- **Automatizaciones avanzadas** (flujos if-then entre cualquier feature)

**Diferenciador clave:** "Comienza tan simple como Trello. Crece tan potente como Jira. Sin la complejidad de ninguno."

### 1.2 Público Objetivo

Pequeñas y medianas empresas de software (5-50 personas) que:
- Necesitan más potencia que Trello/Asana
- No quieren la complejidad de Jira
- Buscan alta personalización sin sacrificar usabilidad
- Valoran la integración fluida entre features

---

## 2. Arquitectura de Tres Niveles

### 2.1 Jerarquía del Sistema

```
ORGANIZACIÓN (Empresa)
  ├─── Proyectos (N)
  │     ├─── Usuarios asignados
  │     ├─── Tableros Kanban
  │     ├─── Diagramas Gantt
  │     ├─── Sistema de archivos/notas
  │     ├─── Hilos de mensajería
  │     ├─── Calendario
  │     └─── Tareas/ToDo
  │
  └─── Usuarios (N)
        └─── Espacio Personal Privado
              ├─── Mis tableros Kanban
              ├─── Mis tareas agregadas
              ├─── Mis notas privadas
              ├─── Mi calendario
              └─── Mis ToDos
```

### 2.2 Modelo de Datos por Nivel

#### **Nivel Usuario (Privado)**
- **Espacio personal** donde el usuario ve agregaciones de TODO su trabajo
- **Tareas privadas** que solo él puede ver
- **Notas privadas** no vinculadas a proyectos
- **Vistas filtradas** de tareas de proyectos asignadas a él
- **Calendario personal** con eventos propios + eventos de proyectos

**Características:**
- El usuario puede crear contenido totalmente privado
- Puede ver proyecciones/reflejos de tareas asignadas en proyectos
- Puede filtrar por: "todas mis tareas", "por proyecto", "por organización"

#### **Nivel Proyecto (Colaborativo)**
- **Espacio compartido** del equipo del proyecto
- **Tareas del proyecto** visibles según permisos
- **Tableros Kanban** del proyecto
- **Gantt** del proyecto
- **Notas y archivos** del proyecto
- **Hilos de mensajería** del proyecto
- **Calendario del proyecto** con eventos compartidos

**Características:**
- Usuarios asignados al proyecto tienen acceso según roles
- Las tareas viven aquí (son la fuente de verdad)
- Modificar tarea aquí → se actualiza automáticamente en vistas personales de usuarios asignados

#### **Nivel Organización (Corporativo)**
- **Vista panorámica** de toda la empresa
- **Dashboard ejecutivo** con métricas agregadas
- **Todos los proyectos** de la organización
- **Gestión de usuarios** y permisos globales
- **Features agregadas** a nivel organizacional

**Características:**
- Managers y admins tienen vista de alto nivel
- Gestión centralizada de usuarios y proyectos
- Políticas y configuraciones globales

### 2.3 Modelo de Entidades: Escenario B (Híbrido)

**Regla de oro:** Las entidades viven en el nivel donde se crean, pero se proyectan a otros niveles según asignación y permisos.

#### **Tareas:**
- **Tarea Personal** (scope: Usuario) → Solo el usuario la ve
- **Tarea de Proyecto** (scope: Proyecto) → Equipo la ve según permisos
  - Si se asigna a un usuario → aparece en su espacio personal (es una vista, no copia)
  - Modificar desde cualquier lugar actualiza la fuente de verdad
- **Tarea de Organización** (scope: Organización) → Nivel corporativo

#### **Subtareas:**
- **Heredan el scope de su tarea padre**
- No se pueden "promover" entre niveles en MVP
- Regla simple: Tarea Personal → Subtareas Personales, Tarea Proyecto → Subtareas Proyecto

#### **Notas/Archivos:**
- Pueden ser privadas (Usuario), de Proyecto, o de Organización
- Sistema de archivos organizado por nivel de visibilidad
- Notas en formato Markdown con vinculación tipo Obsidian

#### **Eventos de Calendario:**
- Eventos personales (solo usuario)
- Eventos de proyecto (todos los miembros)
- Eventos de organización (toda la empresa)

---

## 3. Features Principales

### 3.1 Tableros Kanban

**A nivel Usuario:**
- Tablero personal con SOLO tareas asignadas al usuario
- Filtros: por proyecto, por organización, combinaciones
- Puede crear tareas privadas personales
- Conviven tareas privadas con tareas reflejadas de proyectos

**A nivel Proyecto:**
- Múltiples tableros por proyecto
- Todos los usuarios del proyecto los ven según permisos
- Configuración de columnas personalizable

**A nivel Organización:**
- Vista agregada de todos los proyectos
- Tableros corporativos para iniciativas transversales

### 3.2 Diagramas de Gantt

Similar comportamiento a Kanban en los tres niveles:
- Usuario: vista personal timeline de sus tareas
- Proyecto: timeline completo del proyecto con dependencias
- Organización: roadmap de alto nivel

### 3.3 Sistema de Archivos y Notas Markdown

**Características:**
- Editor Markdown robusto
- Soporte para vinculaciones tipo `[[nota-título]]` o `[[TASK-123]]`
- Organización jerárquica con carpetas
- Tres niveles de visibilidad (Usuario/Proyecto/Organización)

**Vinculaciones:**
- Una nota puede estar vinculada a tareas, eventos, mensajes, otras notas
- Sintaxis: `[[tipo:identificador]]` ejemplo `[[tarea:PROJ-123]]`, `[[nota:Arquitectura]]`

### 3.4 Hilos de Mensajería Instantánea

**Estructura:**
- Hilos organizados por proyecto o temas
- Mensajes en tiempo real (WebSockets)
- Menciones de usuarios `@usuario`
- Vinculación a tareas, notas, eventos desde mensajes

**Niveles:**
- Usuario: mensajes directos privados
- Proyecto: hilos del equipo del proyecto
- Organización: anuncios y comunicaciones generales

### 3.5 Calendario con Notificaciones

**Funcionalidad:**
- Calendario personal (Usuario)
- Calendario de proyecto (Proyecto)
- Calendario corporativo (Organización)
- Notificaciones configurables por tipo de evento
- Integración con deadlines de tareas y milestones de Gantt

### 3.6 Sistema de Tareas/ToDo

**Características:**
- Lista tipo checklist de tareas pendientes
- A nivel usuario: agregación de todas las tareas asignadas
- Vista "Mis tareas" con ordenamiento por prioridad, fecha, proyecto
- Checkbox para marcar completadas
- Vinculación bidireccional con tareas en Kanban/Gantt

---

## 4. Sistema de Vinculaciones

### 4.1 Regla de Vinculación Jerárquica

**Regla de oro:** "Solo puedes vincular hacia igual o mayor visibilidad"

```
PERMITIDO ✅:
- Nota privada → Tarea pública de proyecto
- Tarea personal → Evento de proyecto
- Nota de proyecto → Tarea de organización

NO PERMITIDO ❌:
- Tarea pública de proyecto → Nota privada de usuario
  (otros verían enlace roto)
```

**Razón:** 
- Tu nota privada puede referenciar algo público (solo tú ves el vínculo)
- Pero algo público NO puede referenciar algo privado (sería enlace roto para otros)

### 4.2 Comportamiento de Vínculos con Cambios de Permisos

**Escenario:** Usuario vincula su nota privada a tarea de proyecto → luego pierde acceso al proyecto

**Comportamiento:**
- El vínculo NO se rompe
- Al hacer clic muestra: "No tienes permisos para ver esto"
- Si recupera acceso, el vínculo vuelve a funcionar
- Validación de permisos en tiempo real (externa al vínculo)

**Visualización de vínculos:**
- Vínculo activo: color normal, clickeable
- Vínculo sin permisos: gris, desactivado con tooltip explicativo
- Opción B: "Este vínculo apunta a un proyecto al que ya no tienes acceso"

### 4.3 Sintaxis de Vinculación (Markdown)

```markdown
# Ejemplo de nota con vinculaciones

## Bugs encontrados en Sprint 14

- [[PROJ-123]] Login fallando en Safari
- Relacionado con [[nota:Arquitectura Auth]]
- Verificar con [[usuario:@maria]]
- Deadline: [[evento:Demo Viernes]]
- [[tablero:Sprint 14 Kanban]]
```

**Tipos de vinculación:**
- `[[PROJ-123]]` → Tarea en proyecto (ID único)
- `[[nota:título]]` → Otra nota
- `[[usuario:@nombre]]` → Mención de usuario
- `[[evento:título]]` → Evento de calendario
- `[[tablero:nombre]]` → Tablero Kanban específico
- `[[archivo:nombre]]` → Archivo adjunto

**Detección automática:**
- Parser detecta patrón `[[...]]`
- Crea enlace clicable con mini-preview al hover
- Click → navega al recurso vinculado
- Cmd/Ctrl+Click → abre en nueva pestaña

---

## 5. Sistema de Roles y Permisos

### 5.1 Filosofía de Permisos

**Objetivo:** Granularidad sin complejidad

- Permisos a nivel de **Organización**
- Permisos a nivel de **Proyecto**
- Permisos a nivel de **Feature** (CRUD en cada funcionalidad)

### 5.2 Estructura de Permisos

#### **Por Feature (ejemplo Kanban):**

```yaml
Tableros_Kanban:
  - Ver tableros
  - Crear tableros
  - Editar tableros
  - Eliminar tableros
  - Crear tareas
  - Editar tareas propias
  - Editar todas las tareas
  - Eliminar tareas
  - Mover tareas entre columnas
  - Gestionar columnas
```

#### **Mismo patrón para todas las features:**
- Diagramas Gantt: permisos CRUD
- Notas/Archivos: permisos CRUD
- Mensajería: crear/editar/eliminar mensajes, gestionar hilos
- Calendario: crear/editar/eliminar eventos
- Automatizaciones: ver/crear/editar/eliminar

### 5.3 Roles Pre-definidos (Templates)

**Para arrancar rápido, incluir roles comunes:**

1. **Admin** - Control total sobre todo
2. **Project Manager** - Gestión completa del proyecto, no puede gestionar roles
3. **Developer** - Puede trabajar en tareas, ver todo, no puede eliminar
4. **QA Tester** - Ver todo, crear/editar tareas asignadas, comentar
5. **Client View** - Solo lectura con comentarios limitados

### 5.4 UI de Gestión de Permisos (NO Jira-style)

**Interfaz Visual con Checkboxes:**

```
Crear/Editar Rol: "QA Tester"

📋 TABLEROS KANBAN
  ☑ Ver todos los tableros
  ☑ Crear tareas
  ☑ Editar tareas asignadas
  ☐ Eliminar tareas
  ☐ Gestionar tableros

📊 DIAGRAMAS GANTT
  ☑ Ver timeline
  ☐ Editar dependencias
  ☐ Modificar fechas
  
📝 NOTAS Y ARCHIVOS
  ☑ Crear notas
  ☑ Comentar en notas
  ☐ Eliminar notas del proyecto
  
💬 MENSAJERÍA
  ☑ Participar en hilos
  ☑ Crear hilos nuevos
  ☐ Archivar conversaciones

[Vista previa del rol] [Guardar]
```

**Características:**
- Agrupado por feature visualmente
- Checkboxes simples (no tablas de texto)
- "Vista previa" simula cómo usuario verá la UI con ese rol
- Colores: Verde (permitido), Gris (no permitido)

---

## 6. Automatizaciones (Fase Post-MVP)

### 6.1 Concepto

Flujos if-then entre cualquier feature de cualquier nivel.

**Ejemplos:**
```
SI tarea cambia a "Completado" en Kanban del Proyecto X
ENTONCES:
  - Actualizar progreso en Gantt
  - Crear nota automática "Tarea completada"
  - Enviar mensaje en hilo "General"
  - Notificar en calendario
```

### 6.2 Niveles de Complejidad (Post-MVP)

**Nivel 1 - Templates (Recetas):**
- Pre-hechas, un click para activar
- "Cuando tarea completada → notificar en chat"

**Nivel 2 - Constructor Visual:**
- Dropdowns para elegir trigger y acciones
- Sin código

**Nivel 3 - Modo Código:**
- Para power users
- JavaScript/TypeScript para lógica compleja

### 6.3 Nota para MVP

**NO implementar automatizaciones en MVP.** Agregar en versión 2.0 una vez validada la plataforma base.

---

## 7. Estrategia UX para MVP

### 7.1 Principios de Diseño

Basados en investigación de Linear, Notion, Trello, y análisis de fracasos de Jira/ClickUp:

1. **Onboarding: "El contenido es el tutorial"** (Modelo Trello)
2. **Navegación: Command Palette** (Modelo Linear)
3. **Permisos: Visuales, no texto** (Anti-Jira)
4. **Simplicidad inicial, poder progresivo**

### 7.2 Onboarding - Proyecto Demo Auto-generado

**Al crear organización por primera vez:**

Generar automáticamente:
- Proyecto "🎉 Bienvenida - Explora la plataforma"
- 1 Tablero Kanban con 4-5 tareas de ejemplo
  - "Tu primera tarea"
  - "Arrastra esta tarea a 'En progreso'"
  - "Vincula esta tarea a una nota →"
- 2-3 Notas Markdown pre-escritas
  - "Cómo funcionan las vinculaciones"
  - "Guía rápida de Kanban"
- 1 evento en calendario "Demo de features - Explora libremente"
- 1 hilo de mensajería con mensaje de bienvenida

**Objetivo:** Usuario aprende HACIENDO, no leyendo manual.

**Tiempo para "momento aha":** 2-3 minutos

### 7.3 Command Palette (Cmd+K / Ctrl+K)

**Funcionalidad:**
- Input de búsqueda global
- Acceso a TODAS las acciones principales
- Búsqueda fuzzy
- Navegación rápida a proyectos, tareas, notas

**Acciones sugeridas:**
```
Cmd+K → escribe:
  "nueva tarea" → Crear tarea
  "nueva nota" → Crear nota
  "calendario" → Abrir calendario
  "Proyecto X" → Ir a Proyecto X
  "crear tablero" → Crear tablero Kanban
```

**Implementación:**
- Librerías existentes: `kbar`, `cmdk`, `command-palette`
- Shortcut global Cmd+K o Ctrl+K
- Siempre accesible desde cualquier parte de la app

### 7.4 Sidebar: Jerarquía Visual Clara

```
┌─────────────────────────────┐
│ 🏢 Acme Corp                │
│   📊 Dashboard             │
│   👥 Miembros (45)         │
│                            │
│   📁 PROYECTOS             │
│   ├─ 🚀 App Mobile 2.0     │
│   ├─ 🎨 Rediseño Web       │
│   └─ 🛠️ Backend API        │
│                            │
│ ─────────────────────────  │
│                            │
│ 👤 MI ESPACIO PERSONAL     │
│   📋 Mis tareas (23)       │
│   📅 Mi calendario         │
│   📝 Mis notas privadas    │
│   🔔 Notificaciones (5)    │
└─────────────────────────────┘
```

**Características:**
- Línea divisoria separa visualmente Organización de Espacio Personal
- Iconos consistentes
- Números entre paréntesis (contexto inmediato)
- Collapsible por sección

### 7.5 Tooltips Contextuales Mínimos

**Solo en lugares críticos:**

- **Primera vez hover en "Mi Espacio":**
  > "Tu área privada. Solo tú ves esto. Puedes vincular tus notas privadas a tareas de proyectos."

- **Primera vez hover en "Proyecto":**
  > "Espacio colaborativo. Todos los miembros del proyecto ven esto según sus permisos."

- **Al intentar vincular algo privado a algo público:**
  > "⚠️ Intentas vincular desde algo público a algo privado. Otros verían un enlace roto. ¿Continuar?"

**Filosofía:** Help cuando se necesita, invisible cuando no.

### 7.6 Empty States Educativos

**Ejemplo - Tablero Kanban vacío:**

```
┌────────────────────────────────────┐
│                                    │
│         📋                         │
│  Todavía no tienes tableros        │
│                                    │
│  Los tableros Kanban organizan     │
│  tu trabajo visualmente.           │
│  Perfectos para:                   │
│  • Seguimiento de sprints          │
│  • Pipelines de desarrollo         │
│  • Gestión de bugs                 │
│                                    │
│  [Crear tablero] [Ver template]    │
│                                    │
└────────────────────────────────────┘
```

**Aplicar a:**
- Kanban vacío
- Gantt vacío
- Notas vacías
- Calendario vacío
- Mensajería vacía

---

## 8. Roadmap de Implementación

### 8.1 MVP (Versión 1.0) - 3 meses

**Features Mínimas Viables:**

✅ **Core:**
- Sistema de autenticación y usuarios
- Organizaciones, Proyectos, Espacio Personal
- Tableros Kanban básicos (3 niveles)
- Tareas con campos básicos (título, descripción, asignado, estado, fechas)

✅ **UX Esencial:**
- Onboarding con proyecto demo auto-generado
- Command Palette (Cmd+K)
- Sidebar jerárquico claro
- Empty states educativos

✅ **Permisos Básicos:**
- 3 roles pre-definidos: Admin, Member, Viewer
- UI visual de permisos (checkboxes)
- Permisos a nivel proyecto

✅ **Vinculaciones Básicas:**
- Vincular tareas entre sí
- Vincular tareas a notas (sintaxis `[[TASK-123]]`)
- Parser básico de Markdown

**NO incluir en MVP:**
- ❌ Diagramas Gantt (complejidad alta)
- ❌ Automatizaciones (complejidad alta)
- ❌ Mensajería en tiempo real (requiere WebSockets)
- ❌ Roles 100% personalizados (usar templates)
- ❌ Campos personalizados avanzados

### 8.2 Versión 2.0 - 6 meses

**Agregar:**
- Diagramas Gantt con dependencias
- Sistema de notas Markdown completo con editor robusto
- Calendario con eventos y notificaciones
- Roles y permisos totalmente personalizables
- Vinculaciones cross-feature completas
- Mensajería básica (sin tiempo real)

### 8.3 Versión 3.0 - 12 meses

**Agregar:**
- Automatizaciones (3 niveles de complejidad)
- Mensajería en tiempo real (WebSockets)
- Integraciones con herramientas externas (GitHub, Slack, etc.)
- Dashboard analytics y reportes
- API pública
- Mobile apps (iOS/Android)

---

## 9. Stack Tecnológico Recomendado (Sugerencia)

### 9.1 Frontend
- **Framework:** React + Next.js 14 (App Router)
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **State Management:** Zustand o Jotai
- **Forms:** React Hook Form + Zod
- **Drag & Drop:** dnd-kit
- **Command Palette:** cmdk
- **Markdown Editor:** TipTap o Novel

### 9.2 Backend
- **Framework:** Node.js + Next.js API Routes (para empezar)
  - Alternativa: NestJS, Fastify
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js o Clerk
- **Real-time (v2.0):** Socket.io o Supabase Realtime

### 9.3 Infraestructura
- **Hosting:** Vercel (frontend + API) o Railway
- **Database:** Supabase o Neon
- **Storage:** Supabase Storage o AWS S3
- **Email:** Resend o SendGrid

---

## 10. Modelo de Datos Básico (Esquema Conceptual)

### 10.1 Entidades Principales

```typescript
// ORGANIZACIÓN
Organization {
  id: string
  name: string
  slug: string
  createdAt: datetime
  settings: json
}

// USUARIO
User {
  id: string
  email: string
  name: string
  avatar: string
  organizations: Organization[]
}

// MEMBRESÍA (relación User-Organization)
Membership {
  id: string
  userId: string
  organizationId: string
  role: Role
  joinedAt: datetime
}

// PROYECTO
Project {
  id: string
  name: string
  description: string
  organizationId: string
  members: User[]
  createdAt: datetime
  visibility: 'public' | 'private'
}

// ROL
Role {
  id: string
  name: string
  permissions: Permission[]
  organizationId: string
  isCustom: boolean
}

// PERMISO
Permission {
  id: string
  resource: string // 'kanban', 'tasks', 'notes', etc.
  action: string   // 'create', 'read', 'update', 'delete'
  scope: 'organization' | 'project' | 'own'
}

// TAREA
Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assigneeId: string
  projectId: string | null  // null = tarea personal
  scope: 'user' | 'project' | 'organization'
  dueDate: datetime
  createdAt: datetime
  updatedAt: datetime
}

// TABLERO KANBAN
KanbanBoard {
  id: string
  name: string
  projectId: string | null  // null = tablero personal
  columns: Column[]
  scope: 'user' | 'project' | 'organization'
}

// COLUMNA KANBAN
Column {
  id: string
  name: string
  order: number
  boardId: string
  tasks: Task[]
}

// NOTA
Note {
  id: string
  title: string
  content: string  // Markdown
  authorId: string
  projectId: string | null  // null = nota personal
  scope: 'user' | 'project' | 'organization'
  createdAt: datetime
  updatedAt: datetime
}

// VINCULACIÓN
Link {
  id: string
  sourceType: string  // 'task', 'note', 'event', etc.
  sourceId: string
  targetType: string
  targetId: string
  createdById: string
  createdAt: datetime
}
```

### 10.2 Reglas de Negocio Importantes

1. **Scope de entidades:**
   - Toda entidad tiene campo `scope`: 'user' | 'project' | 'organization'
   - Scope determina visibilidad y permisos

2. **Validación de vinculaciones:**
   - Antes de crear Link, validar regla jerárquica
   - No permitir vincular desde scope mayor a scope menor

3. **Proyección de tareas:**
   - Tarea de proyecto asignada a usuario → aparece en queries de "Mis tareas"
   - No se duplica, es vista filtrada

4. **Herencia de permisos:**
   - Usuario en Organización hereda permisos base
   - Usuario en Proyecto puede tener permisos específicos sobreescritos

---

## 11. Métricas de Éxito

### 11.1 KPIs de UX (Críticos)

- **Time to First Value:** < 5 minutos desde signup hasta crear primera tarea
- **Tasa de activación:** > 70% usuarios completan onboarding
- **Retención día 7:** > 50%
- **Retención día 30:** > 30%
- **NPS (Net Promoter Score):** > 40

### 11.2 KPIs de Producto

- **Usuarios activos diarios (DAU):** Objetivo +20% MoM
- **Features adoptadas:** % usuarios usando >3 features regularmente
- **Tiempo promedio en plataforma:** > 15 min/día
- **Tasa de invitación:** % usuarios que invitan a otros (objetivo >40%)

---

## 12. Preguntas Abiertas / Decisiones Pendientes

### 12.1 Técnicas

- [ ] ¿Self-hosted o SaaS puro?
- [ ] ¿Multi-tenancy con base de datos compartida o DBs separadas?
- [ ] ¿Qué nivel de real-time es necesario en MVP?
- [ ] ¿Offline-first con sincronización o requiere conexión?

### 12.2 UX/Producto

- [ ] ¿Versión móvil responsiva o apps nativas desde inicio?
- [ ] ¿Internacionalización (i18n) desde MVP?
- [ ] ¿Modo oscuro desde inicio?
- [ ] ¿Integraciones con qué herramientas priorizar? (GitHub, GitLab, Slack)

### 12.3 Negocio

- [ ] ¿Modelo de pricing? (por usuario, flat rate, freemium)
- [ ] ¿Plan gratuito? ¿Con qué limitaciones?
- [ ] ¿Versión open-source o propietario?

---

## 13. Referencias y Recursos

### 13.1 Inspiración de Diseño

- **Linear:** Command palette, velocidad, diseño minimalista
- **Notion:** Flexibilidad, bloques, vinculaciones
- **Trello:** Simplicidad, onboarding con contenido
- **Asana:** Jerarquía clara, roles visuales

### 13.2 Anti-patterns a Evitar

- **Jira:** Permisos text-heavy, complejidad inicial
- **ClickUp:** Mostrar todas las features desde día 1
- **Monday.com:** Blank slate sin guía inicial
- **Basecamp:** Rigidez excesiva

### 13.3 Principios de Nielsen Aplicados

1. **Visibilidad del estado del sistema:** Tooltips, empty states, notificaciones
2. **Control y libertad del usuario:** Deshacer, cancelar, navegar libremente
3. **Consistencia y estándares:** Iconos, terminología, comportamientos consistentes
4. **Prevención de errores:** Validaciones, confirmaciones en acciones destructivas
5. **Reconocimiento vs recuerdo:** Command palette, iconos, shortcuts visibles

---

## 14. Conclusión

Este documento establece la visión conceptual completa del proyecto. Los próximos pasos son:

1. **Validar concepto** con 5-10 usuarios potenciales (entrevistas)
2. **Crear wireframes** de pantallas principales
3. **Desarrollar MVP** enfocado en features core
4. **Testing con usuarios beta**
5. **Iterar basado en feedback**

**Principio rector:** Empezar simple, crecer con potencia, nunca sacrificar usabilidad.

---

**Fin del documento conceptual**
