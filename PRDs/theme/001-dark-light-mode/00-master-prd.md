# PRD: Dark/Light Mode Toggle

## Metadata
- **Feature ID:** theme-001
- **Version:** 1.0
- **Created:** 2025-10-07
- **Status:** Draft
- **Dependencies:** None (standalone UI feature)
- **Assigned Architect:** Architect Agent

---

## 1. User Story
> Como un **usuario de la aplicación**, quiero **cambiar entre modo oscuro y claro con un toggle en el header** para poder **usar la aplicación con la apariencia que prefiera en cada sesión**.

### Contexto del Negocio
Los usuarios tienen diferentes preferencias de interfaz dependiendo del contexto de uso (ambiente de luz, preferencias personales, fatiga visual). Implementar un sistema de temas permite mejorar la experiencia del usuario y reducir la fatiga visual.

**Decisión Técnica Clave:** La aplicación siempre arranca en modo oscuro y NO persiste la preferencia del usuario. Esto simplifica la implementación inicial y permite iteraciones futuras basadas en feedback real de usuarios.

### Usuarios Objetivo
- **Primarios:** Todos los usuarios de la aplicación (autenticados y no autenticados)
- **Secundarios:** N/A (feature universal)

---

## 2. Criterios de Aceptación

### Funcionales
- **DEBE** arrancar SIEMPRE en modo oscuro por defecto (dark mode)
- **DEBE** mostrar un toggle con icono en el header de la aplicación
- **DEBE** permitir cambiar entre modo oscuro y claro con un clic en el toggle
- **DEBE** aplicar el tema a TODA la aplicación inmediatamente (no por secciones)
- **DEBE** funcionar para usuarios no autenticados (sin login)
- **DEBE** resetear a modo oscuro al recargar la página o iniciar nueva sesión
- **NO DEBE** persistir la preferencia del usuario (localStorage, cookies, database)
- **NO DEBE** respetar la preferencia del sistema operativo
- **DEBE** mostrar transición CSS suave entre temas (300ms)

### No Funcionales
- **Performance:** El cambio de tema DEBE ser instantáneo (<50ms)
- **Accesibilidad:** El toggle DEBE cumplir WCAG 2.1 AA (keyboard navigation, aria-labels)
- **Responsividad:** El toggle DEBE funcionar correctamente en móvil (375px+), tablet (768px+) y desktop (1024px+)
- **Seguridad:** No aplica (solo UI, sin datos sensibles)
- **Escalabilidad:** DEBE soportar múltiples componentes reactivos al cambio de tema

---

## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales
- **Nueva Entidad:** `Theme` en `src/features/theme/entities.ts`
- **Entidades Modificadas:** Ninguna

### Schemas de Zod
```typescript
import { z } from 'zod';

/**
 * Theme Entity
 * Represents the application theme state
 *
 * ONLY two valid values: 'light' or 'dark'
 * Default is 'dark' (applied at Zustand store initialization)
 */
export const ThemeSchema = z.enum(['light', 'dark'], {
  errorMap: () => ({ message: 'Theme must be either "light" or "dark"' })
});

export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Default theme configuration
 * Always starts in dark mode
 */
export const DEFAULT_THEME: Theme = 'dark';
```

### Relaciones
- **Theme** no tiene relaciones con otras entidades (standalone UI state)
- **Theme** no se persiste en base de datos (Zustand store solamente)

---

## 4. Contrato de API Endpoints

### No API Endpoints Required
Este feature NO requiere endpoints de backend. El estado del tema se maneja completamente en el cliente con Zustand.

**Razón:** La decisión de NO persistir la preferencia del usuario elimina la necesidad de:
- POST/PATCH endpoints para guardar preferencia
- GET endpoint para recuperar preferencia
- Tabla en base de datos

---

## 5. Especificaciones de UI/UX

### Componentes Requeridos
- **Componente Principal:** `ThemeToggle` en `src/features/theme/components/ThemeToggle.tsx`
  - Toggle con icono que cambia según el tema actual
  - Icono de luna (🌙) para modo oscuro
  - Icono de sol (☀️) para modo claro
  - Accesible por teclado (Enter/Space para toggle)
  - Aria-label descriptivo ("Toggle theme" o "Cambiar tema")

- **Hook Personalizado:** `useApplyTheme` en `src/features/theme/hooks/useApplyTheme.ts`
  - Aplica clase `.dark` al elemento `<html>` cuando theme === 'dark'
  - Remueve clase `.dark` cuando theme === 'light'
  - Se ejecuta automáticamente cuando Zustand store cambia

- **Store Zustand:** `themeStore` en `src/features/theme/store/theme.store.ts`
  - Estado inicial: `theme: 'dark'`
  - Acción: `toggleTheme()` - alterna entre light/dark
  - Acción opcional: `setTheme(theme: Theme)` - establece tema específico

- **Páginas:** Se integra en el layout principal existente (header global)

### Flujos de Usuario

1. **Flujo Principal: Toggle de Tema**
   - Usuario abre la aplicación → Sistema carga en modo oscuro
   - Usuario hace clic en el toggle del header → Sistema cambia a modo claro instantáneamente
   - Usuario hace clic nuevamente → Sistema vuelve a modo oscuro
   - Usuario recarga página → Sistema resetea a modo oscuro

2. **Flujo Alternativo: Navegación con Teclado**
   - Usuario navega con Tab hasta el toggle
   - Usuario presiona Enter/Space → Sistema cambia el tema
   - Toggle mantiene foco visual (focus ring)

### Estados de la Interfaz
- **Default (Dark Mode):**
  - Fondo oscuro (bg-slate-900)
  - Texto claro (text-slate-100)
  - Icono de luna visible en el toggle

- **Light Mode:**
  - Fondo claro (bg-white)
  - Texto oscuro (text-slate-900)
  - Icono de sol visible en el toggle

- **Transition:**
  - Transición CSS suave de 300ms aplicada a todos los elementos
  - Clase CSS: `transition-colors duration-300`

### Wireframes/Mockups
**Header con Toggle:**
```
┌────────────────────────────────────────────────┐
│  Logo    Navigation    [🌙/☀️ Toggle]  User    │
└────────────────────────────────────────────────┘
```

---

## 6. Consideraciones Técnicas

### Decisión Arquitectónica: Zustand vs Context API

**Opción Elegida:** Zustand Store (ya instalado en el proyecto)

**Razones:**
1. **Zustand ya está instalado** (version 5.0.2 confirmada en package.json)
2. **No requiere provider wrapping** - más simple que Context API
3. **Performance superior** - solo re-renderiza componentes que consumen el estado
4. **TypeScript-first** - tipado robusto sin boilerplate
5. **No necesitamos persistencia** - elimina complejidad de localStorage/zustand-persist
6. **Coherencia con el stack** - Zustand es el estándar del proyecto para client state

**Alternativas Rechazadas:**
- ❌ Context API: Más verbose, re-renders innecesarios
- ❌ localStorage directo: Viola principio de single source of truth
- ❌ Tailwind dark:class con local state: No permite reactividad global

### Implementación Técnica

**1. Zustand Store (`theme.store.ts`):**
```typescript
import { create } from 'zustand'
import { Theme, DEFAULT_THEME } from '../entities'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME, // Always 'dark' initially
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  })),
  setTheme: (theme) => set({ theme }),
}))
```

**2. Theme Application Hook (`useApplyTheme.ts`):**
```typescript
import { useEffect } from 'react'
import { useThemeStore } from '../store/theme.store'

export function useApplyTheme() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])
}
```

**3. Integration in Root Layout:**
```typescript
// app/src/app/layout.tsx
import { useApplyTheme } from '@/features/theme/hooks/useApplyTheme'

export default function RootLayout({ children }) {
  useApplyTheme() // Apply theme globally

  return (
    <html lang="es">
      <body className="transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}
```

**4. ThemeToggle Component:**
```typescript
// Pseudocode - will be implemented by UI/UX Expert Agent
'use client'

import { useThemeStore } from '../store/theme.store'
import { Moon, Sun } from 'lucide-react' // shadcn icons

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? <Moon /> : <Sun />}
    </button>
  )
}
```

### Seguridad
- **Políticas RLS:** N/A (no database persistence)
- **Validaciones:** Zod schema valida que solo 'light' o 'dark' sean valores permitidos
- **Sanitización:** N/A (no user input storage)
- **XSS Prevention:** Iconos renderizados con componentes de React (auto-escaped)

### Performance
- **Optimizaciones:**
  - Zustand solo re-renderiza componentes suscritos al store
  - useEffect hook evita aplicar clase si theme no cambió
  - CSS transitions en GPU (transform/opacity cuando sea posible)
- **Caching:** N/A (no network requests)
- **Paginación:** N/A (no data lists)

### Integraciones
- **APIs Externas:** Ninguna
- **Webhooks:** Ninguno
- **Background Jobs:** Ninguno

---

## 7. Referencias a Documentos Específicos
- **Supabase:** N/A (no database required)
- **Testing:** `02-test-spec.md` (Test Agent will create)
- **Implementation:** `03-implementation-spec.md` (Implementer Agent will create)
- **UI/UX:** `04-ui-spec.md` (UI/UX Expert Agent will create)
- **Status:** `_status.md`

---

## 8. Criterios de Definición de Terminado (DoD)

### Para Architect Agent (COMPLETED)
- [x] PRD completo creado
- [x] Feature directory structure created (`src/features/theme/`)
- [x] `entities.ts` implementado con Zod schemas
- [x] `_status.md` inicializado
- [x] Placeholders creados para otros agentes

### Para Test Agent (NOT STARTED)
- [ ] Suite de tests unitarios creada para:
  - [ ] Zustand store (default state, toggleTheme, setTheme)
  - [ ] useApplyTheme hook (HTML class application)
  - [ ] Theme entity validation (Zod schema)
- [ ] Tests de integración para:
  - [ ] ThemeToggle component interaction
- [ ] Mocks configurados (si necesarios)
- [ ] Cobertura de tests > 90%
- [ ] Todos los tests FALLAN inicialmente ("function not defined")

### Para Implementer Agent (NOT STARTED)
- [ ] Zustand store implementado (`theme.store.ts`)
- [ ] useApplyTheme hook implementado
- [ ] Todos los tests pasando
- [ ] Validaciones de Zod implementadas (si aplica)

### Para Supabase Agent (N/A)
- No se requiere implementación de base de datos para este feature

### Para UI/UX Expert Agent (NOT STARTED)
- [ ] ThemeToggle component implementado
- [ ] Integrado en header/layout principal
- [ ] Tests E2E pasando (Playwright)
- [ ] Accesibilidad validada (WCAG 2.1 AA):
  - [ ] Keyboard navigation funcional
  - [ ] Aria-labels presentes
  - [ ] Focus indicators visibles
- [ ] Responsividad confirmada (375px, 768px, 1024px)
- [ ] Transiciones CSS suaves implementadas

---

## 9. Notas y Observaciones

### Decisiones Técnicas Importantes

1. **No Persistencia de Preferencia:**
   - Simplifica arquitectura inicial
   - Evita sincronización localStorage/server
   - Permite validar adopción antes de agregar complejidad
   - **Iteración Futura:** Si usuarios solicitan persistencia, agregar:
     - Zustand persist middleware
     - localStorage para usuarios no autenticados
     - Columna `preferred_theme` en tabla `user_profiles` para autenticados

2. **No Respetar Preferencia del Sistema:**
   - Siempre dark por defecto
   - Simplifica lógica de inicialización
   - **Iteración Futura:** Detectar con `window.matchMedia('(prefers-color-scheme: dark)')`

3. **Zustand como Única Fuente de Verdad:**
   - No usar Tailwind dark:class directamente
   - Store centralizado permite extensibilidad (ej: múltiples temas en futuro)
   - Facilita testing con store mockeable

### Extensibilidad Futura

Este diseño permite escalar a:
- **Múltiples temas:** Extender `ThemeSchema` a `z.enum(['light', 'dark', 'auto', 'high-contrast'])`
- **Persistencia:** Agregar zustand-persist middleware
- **Modo automático:** Sincronizar con preferencia del sistema
- **Temas personalizados:** Permitir selección de paletas de colores

### Restricciones Confirmadas

- ✅ Stack: Zustand 5.0.2 (instalado), Tailwind v4, shadcn/ui icons
- ✅ NO localStorage (decisión confirmada)
- ✅ NO sistema operativo (decisión confirmada)
- ✅ NO persistencia backend (decisión confirmada)

---

## 🤝 Agent Handoff

### ✅ Architect → Test Agent

**Artifacts Delivered:**
- ✅ Complete PRD at `/PRDs/theme/001-dark-light-mode/00-master-prd.md`
- ✅ Directory structure created in `src/features/theme/`
- ✅ `entities.ts` implemented with Zod schemas
- ✅ Status tracking initialized at `_status.md`
- ✅ Placeholder files created for implementation

**Test Agent Tasks:**
1. **Read this PRD completely** to understand:
   - Default dark mode behavior
   - No persistence logic (no localStorage to mock)
   - Zustand store as single source of truth
   - HTML class application mechanism

2. **Copy Template:** Use `/PRDs/_templates/02-test-template.md` to create `02-test-spec.md`

3. **Create Failing Tests** for:
   - ✅ **entities.test.ts**: Validate Zod schemas
     - Valid themes ('light', 'dark') are accepted
     - Invalid themes ('blue', 'auto', null) are rejected
     - DEFAULT_THEME is 'dark'

   - ✅ **store/theme.store.test.ts**: Zustand store behavior
     - Initial state is { theme: 'dark' }
     - toggleTheme() switches from dark → light → dark
     - setTheme() sets specific theme

   - ✅ **hooks/useApplyTheme.test.ts**: HTML class application
     - Adds 'dark' class to <html> when theme is 'dark'
     - Removes 'dark' class when theme is 'light'
     - Reacts to Zustand store changes

   - ✅ **components/ThemeToggle.test.ts**: Component interaction
     - Renders Moon icon in dark mode
     - Renders Sun icon in light mode
     - Calls toggleTheme() on click
     - Has proper aria-label
     - Keyboard accessible (Enter/Space keys)

4. **Configure Mocks:**
   - Mock Zustand store for component tests
   - Mock document.documentElement for hook tests
   - NO need to mock localStorage (not used)

5. **Verify Tests FAIL:** All tests must fail with:
   - "function not defined"
   - "module not found"
   - "component not implemented"

6. **Update Status:** Run `/agent-handoff theme/001-dark-light-mode test-agent completed`

**Critical Requirements for Test Agent:**
- ❌ **DO NOT** implement any functional code
- ❌ **DO NOT** modify entities.ts
- ❌ **DO NOT** create tests for localStorage (not used)
- ❌ **DO NOT** create tests for API endpoints (N/A)
- ✅ **MUST** create comprehensive test coverage (>90%)
- ✅ **MUST** verify all tests fail appropriately
- ✅ Tests become **IMMUTABLE SPECIFICATION** for Implementer and UI/UX agents

**Files Test Agent Will Create:**
```
src/features/theme/
├── entities.test.ts              # ← YOU create
├── store/
│   └── theme.store.test.ts       # ← YOU create
├── hooks/
│   └── useApplyTheme.test.ts     # ← YOU create
└── components/
    └── ThemeToggle.test.tsx      # ← YOU create
```

**Expected Test Failures:**
```bash
# Expected output after creating tests
FAIL  src/features/theme/entities.test.ts
  ● Test suite failed to run
    Cannot find module '../entities' from 'entities.test.ts'

FAIL  src/features/theme/store/theme.store.test.ts
  ● Test suite failed to run
    Cannot find module './theme.store' from 'theme.store.test.ts'

FAIL  src/features/theme/hooks/useApplyTheme.test.ts
  ● Test suite failed to run
    Cannot find module './useApplyTheme' from 'useApplyTheme.test.ts'

FAIL  src/features/theme/components/ThemeToggle.test.tsx
  ● Test suite failed to run
    Cannot find module './ThemeToggle' from 'ThemeToggle.test.tsx'
```

**Ready to proceed, Test Agent?**

---

**Última Actualización:** 2025-10-07
**Próxima Revisión:** After Test Agent completes test suite
