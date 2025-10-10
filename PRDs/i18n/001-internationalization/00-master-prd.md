# PRD: Application Internationalization System

## Metadata
- **Feature ID:** i18n-001
- **Version:** 1.0
- **Created:** 2025-10-09
- **Status:** Draft
- **Dependencies:** None
- **Assigned Architect:** Architect Agent

---

## 1. User Story
> Como un **Usuario de cualquier región**, quiero **ver la aplicación completa en mi idioma preferido (Inglés o Español)** para poder **navegar y usar todas las funcionalidades sin barreras de idioma**.

### Contexto del Negocio
La aplicación actualmente solo está disponible en un idioma. Para expandir el alcance global y mejorar la experiencia de usuarios de habla hispana, necesitamos implementar un sistema de internacionalización (i18n) que permita:
- Traducción completa de la interfaz de usuario
- Persistencia de la preferencia de idioma del usuario
- Cambio fluido entre idiomas sin afectar la experiencia de usuario

Este sistema establece la base para futuras expansiones a otros idiomas.

### Usuarios Objetivo
- **Primarios:** Usuarios de habla hispana que prefieren usar la aplicación en Español
- **Secundarios:** Usuarios multilingües que desean cambiar entre idiomas
- **Beneficiados:** Equipo de desarrollo (infraestructura escalable para futuros idiomas)

---

## 2. Criterios de Aceptación

### Funcionales
- **DEBE** soportar exactamente dos idiomas: Inglés (en) y Español (es)
- **DEBE** usar Inglés como idioma por defecto para nuevos usuarios
- **DEBE** permitir cambio de idioma mediante selector visual en la UI
- **DEBE** persistir la preferencia de idioma en cookie (no requiere autenticación)
- **DEBE** traducir TODA la interfaz de usuario (no solo partes)
- **DEBE** mantener la URL sin prefijos de idioma (sin `/es/` o `/en/`)
- **NO DEBE** traducir contenido dinámico generado por usuarios
- **NO DEBE** cambiar la URL cuando el usuario cambia de idioma
- **PUEDE** detectar idioma del navegador en primera visita (opcional)

### No Funcionales
- **Performance:** DEBE cargar traducciones sin impacto perceptible (<50ms)
- **Accesibilidad:** Selector de idioma DEBE cumplir WCAG 2.1 AA
- **Responsividad:** Selector DEBE funcionar en móvil (375px+), tablet (768px+) y desktop (1024px+)
- **Seguridad:** Cookie DEBE tener configuración segura (httpOnly: false para JS access, sameSite: lax)
- **Escalabilidad:** Arquitectura DEBE permitir agregar nuevos idiomas sin refactorización mayor
- **Maintainability:** Archivos JSON DEBE estar organizados por namespace/feature

---

## 3. Contrato de Datos (Entities & Zod Schema)

### Entidades Principales
- **Nueva Entidad:** `Locale` en `app/src/features/i18n/entities.ts`
- **Entidades Modificadas:** Ninguna

### Schemas de Zod
```typescript
import { z } from 'zod';

// ============================================================================
// LOCALE SCHEMA
// ============================================================================

/**
 * Locale represents the supported languages in the application
 *
 * Only two valid values:
 * - 'en': English (default)
 * - 'es': Spanish
 *
 * @example
 * const userLocale: Locale = 'es';
 * const isValid = LocaleSchema.safeParse(userLocale).success; // true
 */
export const LocaleSchema = z.enum(['en', 'es'], {
  errorMap: () => ({ message: 'Locale must be either "en" or "es"' })
});

// ============================================================================
// LOCALE COOKIE SCHEMA
// ============================================================================

/**
 * LocaleCookie represents the structure of the locale cookie value
 *
 * This schema validates the cookie value to ensure it's a valid locale
 * before using it in the application.
 */
export const LocaleCookieSchema = z.object({
  name: z.literal('NEXT_LOCALE'),
  value: LocaleSchema,
  maxAge: z.number().positive().default(31536000), // 1 year in seconds
});

// ============================================================================
// TRANSLATION KEY SCHEMA (for type safety)
// ============================================================================

/**
 * TranslationNamespace represents the top-level organization of translations
 *
 * Namespaces group related translations (e.g., all auth-related strings)
 */
export const TranslationNamespaceSchema = z.enum([
  'common',      // Shared UI elements (buttons, labels, etc.)
  'auth',        // Authentication & authorization
  'navigation',  // Navigation menus, links
  'errors',      // Error messages
  'validation',  // Form validation messages
]);

/**
 * TranslationKey represents a nested path to a specific translation
 *
 * Format: "namespace.key" or "namespace.nested.key"
 * Examples: "common.welcome", "auth.login.title"
 */
export const TranslationKeySchema = z.string()
  .regex(
    /^[a-z]+(\.[a-z]+)+$/,
    'Translation key must be in format: namespace.key or namespace.nested.key'
  );

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Locale = z.infer<typeof LocaleSchema>;
export type LocaleCookie = z.infer<typeof LocaleCookieSchema>;
export type TranslationNamespace = z.infer<typeof TranslationNamespaceSchema>;
export type TranslationKey = z.infer<typeof TranslationKeySchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default locale configuration
 *
 * The application ALWAYS starts with English for new users.
 * This can be overridden by:
 * - Existing locale cookie
 * - Browser accept-language header (optional future enhancement)
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * All supported locales
 *
 * This array is used for:
 * - Locale validation
 * - Rendering locale selector options
 * - Loading translation files
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'es'] as const;

/**
 * Locale cookie configuration
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Locale labels for UI display
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Locale
 *
 * @param value - Value to check
 * @returns true if value is 'en' or 'es'
 *
 * @example
 * const userInput = 'es';
 * if (isLocale(userInput)) {
 *   // TypeScript knows userInput is Locale
 *   console.log(userInput); // 'es'
 * }
 */
export function isLocale(value: unknown): value is Locale {
  return LocaleSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid TranslationKey
 */
export function isTranslationKey(value: unknown): value is TranslationKey {
  return TranslationKeySchema.safeParse(value).success;
}
```

### Relaciones
- **Locale** es usado por **User** (preferencia almacenada en cookie)
- **TranslationNamespace** organiza **TranslationKey** (estructura de archivos JSON)

---

## 4. Contrato de API Endpoints

### No Aplica (API-Less Feature)

Esta feature NO requiere endpoints de API porque:
- Las traducciones son archivos JSON estáticos servidos por Next.js
- La cookie se maneja client-side mediante JavaScript
- next-intl maneja la resolución de traducciones server-side en RSC

### Acción Client-Side: Cambiar Idioma

**Trigger:** Usuario hace clic en selector de idioma
**Acción:** Actualizar cookie y refrescar página
**Input:** `Locale` (validado con `LocaleSchema`)
**Output:** Cookie actualizada + página recargada con nuevo idioma

---

## 5. Especificaciones de UI/UX

### Componentes Requeridos

#### Componente Principal: `LocaleSelector`
**Ubicación:** `app/src/features/i18n/components/LocaleSelector.tsx`

**Responsabilidades:**
- Mostrar idioma actual
- Permitir selección de idioma alternativo
- Actualizar cookie al cambiar idioma
- Refrescar página para aplicar cambios

**Estados:**
- **Default:** Muestra idioma actual con ícono de idioma
- **Hover:** Indicador visual de interacción disponible
- **Active:** Menú desplegable con opciones de idioma
- **Loading:** (Opcional) Indicador durante recarga de página

#### Componente de Utilidad: `useLocale` Hook
**Ubicación:** `app/src/features/i18n/hooks/useLocale.ts`

**Responsabilidades:**
- Obtener locale actual
- Proporcionar función para cambiar locale
- Manejar cookie update + page refresh

#### Provider: `NextIntlClientProvider`
**Ubicación:** `app/src/app/providers.tsx` (integrado en providers existentes)

**Responsabilidades:**
- Proveer contexto de traducciones a componentes client
- Integrar con next-intl

### Flujos de Usuario

#### Flujo Principal: Cambiar Idioma
1. Usuario hace clic en `LocaleSelector`
2. Sistema muestra menú con opciones: English, Español
3. Usuario selecciona idioma deseado
4. Sistema actualiza cookie `NEXT_LOCALE` con nuevo valor
5. Sistema recarga página automáticamente
6. Sistema renderiza toda la UI en nuevo idioma

#### Flujo Secundario: Primera Visita
1. Usuario accede a la aplicación por primera vez
2. Sistema verifica cookie `NEXT_LOCALE` → no existe
3. Sistema usa idioma por defecto (Inglés)
4. Usuario ve la aplicación en Inglés
5. (Opcional) Usuario puede cambiar a Español usando el selector

### Ubicación del Selector
- **Desktop:** Navbar superior derecha (junto a theme toggle)
- **Mobile:** Header collapse menu o navbar superior
- **Accesibilidad:** Navegable por teclado (Tab + Enter/Space)

### Wireframes/Mockups

**Selector Cerrado:**
```
┌──────────────────────────────────────────┐
│  Logo        Navigation          🌐 EN ▼ │
└──────────────────────────────────────────┘
```

**Selector Abierto:**
```
┌──────────────────────────────────────────┐
│  Logo        Navigation          🌐 EN ▼ │
│                              ┌─────────┐ │
│                              │ English │ │ ← Selected
│                              │ Español │ │
│                              └─────────┘ │
└──────────────────────────────────────────┘
```

---

## 6. Consideraciones Técnicas

### Arquitectura next-intl (Cookie-Based, No Routing)

#### Configuración Central: `i18n/routing.ts`
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',

  // CRITICAL: No locale prefix in URL
  localePrefix: 'never',

  // Cookie configuration for persistence
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});
```

#### Request Configuration: `i18n/request.ts`
```typescript
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE } from '@/features/i18n/entities';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  // Validate and use cookie value, fallback to default
  const locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default,
  };
});
```

#### NO Middleware Required
Como estamos usando `localePrefix: 'never'`, NO necesitamos middleware de next-intl. La resolución de locale ocurre en `request.ts` mediante la cookie.

### Estructura de Archivos de Traducción

```
app/src/locales/
├── en/
│   ├── common.json       # Shared UI elements
│   ├── auth.json         # Authentication strings
│   ├── navigation.json   # Navigation menus
│   ├── errors.json       # Error messages
│   └── validation.json   # Form validations
└── es/
    ├── common.json
    ├── auth.json
    ├── navigation.json
    ├── errors.json
    └── validation.json
```

#### Ejemplo: `locales/en/common.json`
```json
{
  "welcome": "Welcome",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "labels": {
    "email": "Email",
    "password": "Password"
  }
}
```

#### Ejemplo: `locales/es/common.json`
```json
{
  "welcome": "Bienvenido",
  "buttons": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar"
  },
  "labels": {
    "email": "Correo electrónico",
    "password": "Contraseña"
  }
}
```

### Uso en Componentes

#### Server Components (Recomendado)
```tsx
import { useTranslations } from 'next-intl';

export default function WelcomePage() {
  const t = useTranslations('common');

  return <h1>{t('welcome')}</h1>; // "Welcome" or "Bienvenido"
}
```

#### Client Components
```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function SaveButton() {
  const t = useTranslations('common.buttons');

  return <button>{t('save')}</button>; // "Save" or "Guardar"
}
```

### Seguridad
- **Cookie Configuration:**
  - `httpOnly: false` - Necesario para que JavaScript pueda leer/escribir
  - `sameSite: 'lax'` - Protección CSRF básica
  - `secure: true` - Solo en producción (HTTPS)
  - `maxAge: 1 year` - Persistencia de largo plazo

- **XSS Prevention:** next-intl escapa automáticamente strings de traducción
- **Validation:** Siempre validar locale value con Zod antes de usar

### Performance
- **Static JSON:** Archivos de traducción son estáticos, cacheable
- **Code Splitting:** next-intl solo carga el idioma activo
- **No Client Hydration:** Traducciones resueltas server-side (RSC)
- **Optimización:** Usar `useTranslations` con namespace específico (no global)

### Integraciones
- **next-intl:** Librería principal de i18n
- **Zod:** Validación de locales y translation keys
- **Cookie API:** Persistencia de preferencia de usuario
- **Next.js App Router:** Integración nativa con RSC

---

## 7. Referencias a Documentos Específicos
- **Supabase:** `01-supabase-spec.md` (No requerido - feature sin DB)
- **Testing:** `02-test-spec.md`
- **Implementation:** `03-implementation-spec.md`
- **UI/UX:** `04-ui-spec.md`
- **Status:** `_status.md`

---

## 8. Criterios de Definición de Terminado (DoD)

### Para Supabase Agent
- [ ] N/A - Esta feature no requiere cambios en base de datos

### Para Test Agent
- [ ] Suite de tests unitarios para entities.ts (Zod schemas)
- [ ] Tests para validación de locale values
- [ ] Tests para type guards (isLocale, isTranslationKey)
- [ ] Tests para constantes (DEFAULT_LOCALE, SUPPORTED_LOCALES)
- [ ] Cobertura de tests > 90% en entities layer
- [ ] Tests para `useLocale` hook (cambio de idioma + cookie update)
- [ ] Tests para `LocaleSelector` component (user interactions)

### Para Implementer Agent
- [ ] `i18n/routing.ts` configurado con `localePrefix: 'never'`
- [ ] `i18n/request.ts` implementado con cookie-based locale detection
- [ ] `useLocale` hook implementado (get locale + change locale)
- [ ] Cookie update logic implementado (client-side)
- [ ] Page refresh logic implementado post locale change
- [ ] Todos los tests unitarios pasando

### Para UI/UX Expert Agent
- [ ] `LocaleSelector` component implementado y funcional
- [ ] Selector accesible (WCAG 2.1 AA - navegación teclado, screen reader)
- [ ] Responsive design (móvil, tablet, desktop)
- [ ] Visual feedback en hover y active states
- [ ] Tests E2E pasando (cambio de idioma funcional end-to-end)
- [ ] Traducciones iniciales creadas (al menos common.json en/es)
- [ ] Integración con providers.tsx existente
- [ ] Documentación de uso para desarrolladores

---

## 9. Notas y Observaciones

### Decisiones de Arquitectura

#### ¿Por qué `localePrefix: 'never'`?
1. **Requisito del usuario:** No cambiar URLs al cambiar idioma
2. **SEO:** No hay impacto ya que es una aplicación privada con autenticación
3. **UX:** Usuarios comparten URLs sin preocuparse por prefijos de idioma
4. **Simplicidad:** No requiere middleware complejo de next-intl

#### ¿Por qué cookie en lugar de localStorage?
1. **SSR Compatibility:** Cookies disponibles en server-side para RSC
2. **Persistencia:** Funciona en usuarios autenticados y anónimos
3. **First Paint:** Idioma correcto desde el primer render (no flash de contenido)

#### ¿Por qué NO traducciones en base de datos?
1. **Scope:** Solo UI estática requiere traducción
2. **Performance:** JSON estático es más rápido que DB queries
3. **Maintainability:** Cambios de traducción no requieren migrations
4. **Git History:** Cambios en traducciones visible en commits

### Limitaciones Conocidas

1. **No detección automática de idioma del navegador**
   - Puede implementarse en futuro leyendo `Accept-Language` header
   - Por ahora, siempre usa inglés para nuevos usuarios

2. **No contenido dinámico multiidioma**
   - Contenido generado por usuarios NO se traduce
   - Solo UI de la aplicación

3. **Cambio de idioma requiere recarga de página**
   - No es posible cambiar idioma sin refresh debido a RSC
   - Es el trade-off de tener traducciones server-side

### Expansión Futura (Out of Scope)

- Soporte para más idiomas (francés, alemán, etc.)
- Traducciones de contenido dinámico/usuario
- Auto-detección de idioma del navegador
- RTL (Right-to-Left) support para idiomas árabes/hebreos
- Traducción de emails y notificaciones

---

**Última Actualización:** 2025-10-09
**Próxima Revisión:** Post-implementation (después de UI/UX Agent)
