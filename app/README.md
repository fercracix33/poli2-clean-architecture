# Poli2 - Task Management App

Una aplicación moderna de gestión de tareas construida con **Arquitectura Limpia que Grita**, siguiendo estrictamente los principios de desarrollo dirigido por pruebas (TDD) y las mejores prácticas de la industria.

## 🏗️ Arquitectura

Este proyecto implementa una **Arquitectura Limpia** basada en capas, donde las dependencias siempre apuntan hacia el centro:

### Capas (Del centro hacia afuera)

1. **Entidades (Entities)** - `src/features/[feature]/entities.ts`
   - Estructuras de datos y reglas de negocio críticas
   - Objetos TypeScript/Zod puros sin dependencias externas

2. **Casos de Uso (Use Cases)** - `src/features/[feature]/use-cases/`
   - Lógica de negocio pura
   - Orquestan las entidades para realizar acciones

3. **Adaptadores de Interfaz** - `src/features/[feature]/services/` y `src/app/api/`
   - Traductores entre el mundo exterior y los casos de uso
   - Repositorios y controladores

4. **Frameworks y Drivers** - Next.js, Supabase, navegador
   - El mundo exterior

## 🛠️ Stack Tecnológico

### Framework Principal
- **Next.js 14+** con App Router
- **TypeScript** para type safety

### Base de Datos y Backend
- **Supabase** (Postgres + Auth + Storage + Realtime)
- **Row Level Security (RLS)** obligatorio

### Testing
- **Vitest** para tests unitarios y de integración (Jest está prohibido)
- **Playwright** para tests end-to-end
- **Testing Library** para tests de componentes

### UI y Estilos
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes base
- **Lucide React** para iconos

### Estado y Datos
- **TanStack Query** para estado del servidor (prohibido useEffect para fetching)
- **Zustand** para estado global del cliente
- **Zod** para validación de datos

### Formularios
- **React Hook Form** con resolvers de Zod

## 📁 Estructura de Directorios

```
src/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Páginas principales
│   │   └── [feature]/            # Páginas por feature
│   │       └── page.tsx          # Componente de página
│   ├── api/                      # API Routes
│   │   └── [feature]/            # Endpoints por feature
│   │       └── route.ts          # Controladores de API
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout raíz
│   └── providers.tsx             # Providers de React Query
│
├── features/                     # Features organizadas por dominio
│   └── [feature-name]/           # ej: "tasks", "projects"
│       ├── components/           # Componentes específicos de la feature
│       ├── use-cases/            # Lógica de negocio
│       │   ├── [use-case].ts
│       │   └── [use-case].test.ts
│       ├── services/             # Acceso a datos (Supabase)
│       │   └── [feature].service.ts
│       └── entities.ts           # Tipos y schemas de Zod
│
├── lib/                          # Utilidades compartidas
│   ├── supabase.ts              # Cliente de Supabase (browser)
│   ├── supabase-server.ts       # Cliente de Supabase (server)
│   ├── query-client.ts          # Configuración de TanStack Query
│   └── utils.ts                 # Utilidades generales
│
└── components/ui/                # Componentes de shadcn/ui

tests/
└── e2e/                          # Tests de Playwright
    └── [feature-name].spec.ts
```

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

## 🧪 Testing

### Tests Unitarios (Vitest)
```bash
# Ejecutar tests
npm run test

# Modo watch
npm run test:watch

# Con coverage
npm run test:coverage
```

### Tests End-to-End (Playwright)
```bash
# Ejecutar tests E2E
npm run test:e2e

# Con interfaz gráfica
npm run test:e2e:ui
```

## 📋 Principios de Desarrollo

### 1. TDD es la Ley
- Ninguna línea de código de lógica se escribe sin que exista primero una prueba que falle
- Los tests son la especificación viva del software

### 2. Fronteras Estrictas
- Las capas de la arquitectura son sagradas
- La comunicación entre capas se realiza a través de interfaces bien definidas
- No se permiten "atajos"

### 3. Prohibiciones Estrictas
- **Jest está prohibido** - Solo Vitest
- **useEffect para fetching está prohibido** - Solo TanStack Query
- **CSS tradicional está prohibido** - Solo Tailwind CSS
- **Datos mock/hardcodeados están prohibidos** - Solo datos reales

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting con ESLint
- `npm run test` - Tests unitarios
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Tests con coverage
- `npm run test:e2e` - Tests end-to-end
- `npm run test:e2e:ui` - Tests E2E con interfaz

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de TanStack Query](https://tanstack.com/query)
- [Documentación de shadcn/ui](https://ui.shadcn.com)
- [Documentación de Vitest](https://vitest.dev)
- [Documentación de Playwright](https://playwright.dev)

## 🤝 Contribución

Este proyecto sigue estrictamente las reglas definidas en `.trae/rules/project_rules.md`. Cualquier desviación de estas reglas se considera un error.

### Flujo de Desarrollo
1. Escribir tests que fallen (Red)
2. Implementar código mínimo para pasar tests (Green)
3. Refactorizar manteniendo tests verdes (Refactor)
4. Repetir

---

**Versión:** 0.1.0  
**Licencia:** MIT
