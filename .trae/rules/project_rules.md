# **Project Constitution & Architectural Guide**

Este documento es la **única fuente de verdad** para el desarrollo de este proyecto. Todos los agentes y supervisores humanos deben adherirse estrictamente a las reglas y arquitecturas aquí definidas. Cualquier desviación se considera un error.

## **1\. Principios Fundamentales**

1. **Arquitectura Limpia que Grita (Screaming Clean Architecture):** Nuestra estructura de carpetas y código refleja el dominio de nuestro negocio (tasks, projects), no las herramientas que usamos. La lógica de negocio es la reina y no depende de ningún framework externo.  
2. **Desarrollo Guiado por Pruebas (TDD) es la Ley:** Ninguna línea de código de lógica se escribe sin que exista primero una prueba que falle y que la justifique. Los tests son la especificación viva de nuestro software.  
3. **Fronteras Estrictas:** Las capas de la arquitectura son sagradas. La comunicación entre ellas se realiza a través de interfaces bien definidas. No se permiten "atajos".

## **2\. El Stack Tecnológico Canónico**

Este es el único stack tecnológico aprobado. El uso de cualquier otra librería o herramienta para una función cubierta aquí está estrictamente prohibido.

* **Framework Principal:** **Next.js 14+ (App Router)**  
  * *Consideración:* Usaremos las API Routes para el backend y Server Components siempre que sea posible para optimizar el rendimiento.  
* **Base de Datos y Backend Services:** **Supabase**  
  * *Consideración:* Se utilizará para la base de datos Postgres, autenticación (Auth) y almacenamiento (Storage). Las políticas de seguridad a nivel de fila (RLS) son obligatorias para el acceso a datos.  
* **Testing de Lógica (Unitario y de Integración):** **Vitest**  
  * **¡REGLA CRÍTICA!** **Jest está prohibido.** Vitest ha sido seleccionado por su velocidad superior, su API compatible con Jest y su integración nativa con el ecosistema moderno (Vite, TypeScript, ESM), lo cual es esencial para un ciclo TDD rápido y eficiente.  
* **Testing End-to-End (E2E):** **Playwright**  
  * *Consideración:* Se usará para simular flujos de usuario completos en un navegador real. Sus capacidades de auto-wait, selectores resilientes y trace viewer son fundamentales para crear tests fiables y fáciles de depurar.  
* **UI y Estilos:** **Tailwind CSS + shadcn/ui**  
  * *Consideración:* No se escribirá CSS tradicional. La UI se construirá componiendo utilidades de Tailwind y usando los componentes de shadcn/ui como base accesible y no opinionada.  
* **Gestión de Estado del Servidor (Frontend):** **TanStack Query (React Query)**  
  * *Consideración:* Es la herramienta obligatoria para gestionar el fetching, caching y mutación de datos de la API. Está prohibido usar useEffect para hacer fetching de datos.  
* **Gestión de Estado Global (Frontend):** **Zustand**  
  * *Consideración:* Se usará para estado global simple que no provenga del servidor (ej: estado del UI como "sidebar abierta/cerrada"). Es la única librería de estado global permitida por su simplicidad.  
* **Validación de Datos y Tipos:** **Zod**  
  * *Consideración:* Todos los datos que crucen las fronteras de la red (API) y las validaciones de formularios deben tener un schema de Zod. Esto garantiza la seguridad y la coherencia de los tipos.

## **3\. La Arquitectura Limpia: Un Mapa Detallado**

Nuestra arquitectura se basa en el concepto de "La Cebolla", con dependencias que siempre apuntan hacia el centro.

### **Capas (Del centro hacia afuera)**

1. **Entidades (Entities):** El corazón. Definen las estructuras de datos y reglas de negocio críticas. Son objetos TypeScript/Zod puros que no saben nada del mundo exterior.  
2. **Casos de Uso (Use Cases):** La lógica de negocio. Orquestan las entidades para realizar acciones. No saben cómo se guardan los datos ni cómo se muestran, solo ejecutan la lógica.  
3. **Adaptadores de Interfaz (Interface Adapters):** Los traductores. Convierten los datos del mundo exterior (HTTP, base de datos) a un formato que los casos de uso entiendan. Aquí viven los repositorios y controladores.  
4. **Frameworks y Drivers:** El mundo exterior. Next.js, Supabase, el navegador.

## **4\. Proceso TDD Puro Obligatorio**

### **Orden Secuencial de Agentes (INMUTABLE)**
```
1. Arquitecto → 2. Test Agent → 3. Implementer Agent → 4. Supabase Agent → 5. UI/UX Expert Agent
```

**JUSTIFICACIÓN DEL ORDEN TDD PURO:**
- **Arquitecto:** Define entidades y contratos (sin implementación)
- **Test Agent:** Crea tests de TODAS las capas que FALLAN (especificación viva completa)
- **Implementer Agent:** Implementa casos de uso para pasar tests
- **Supabase Agent:** Implementa servicios de datos para pasar tests
- **UI/UX Expert:** Crea interfaz para pasar tests E2E

### **Test Agent: Responsabilidad Total de Testing**
- **DEBE:** Testear TODAS las capas (casos de uso, servicios, APIs)
- **DEBE:** Crear tests que FALLEN apropiadamente
- **DEBE:** Definir interfaces esperadas para todas las funciones
- **DEBE:** Mockear dependencias externas (Supabase client, etc.)
- **PROHIBIDO:** Implementar cualquier lógica funcional
- **PROHIBIDO:** Modificar tests una vez creados

### **Implementer Agent: Solo Casos de Uso**
- **DEBE:** Implementar SOLO casos de uso (Use Case Layer)
- **DEBE:** Hacer pasar tests sin modificarlos
- **DEBE:** Crear lógica de negocio, validaciones, orquestación
- **PROHIBIDO:** Modificar archivos de test
- **PROHIBIDO:** Tocar servicios de datos
- **PROHIBIDO:** Tocar entidades

### **Supabase Agent: Solo Servicios de Datos**
- **DEBE:** Implementar SOLO servicios de datos (Interface Adapter Layer)
- **DEBE:** Crear acceso puro a base de datos
- **DEBE:** Hacer pasar tests de servicios sin modificarlos
- **PROHIBIDO:** Añadir validaciones de negocio a servicios
- **PROHIBIDO:** Tocar casos de uso
- **PROHIBIDO:** Modificar tests

### **Principios TDD Inmutables**
1. **Red:** Test Agent crea tests de TODO que FALLAN
2. **Green:** Cada agente hace pasar SUS tests sin modificarlos
3. **Refactor:** Cada agente mejora código manteniendo tests verdes
4. **PROHIBIDO:** Cualquier agente modificar tests para hacer pasar implementación

### **Validación de Cumplimiento TDD**
- **Tests inmutables:** Una vez creados por Test Agent, NO se modifican NUNCA
- **Cobertura completa:** Tests para casos de uso, servicios, APIs, validaciones
- **Fallos apropiados:** Tests fallan porque funciones no existen (correcto)
- **Fronteras respetadas:** Cada agente solo implementa su capa asignada

## **4\. La Arquitectura Limpia: Un Mapa Detallado**

Nuestra arquitectura se basa en el concepto de "La Cebolla", con dependencias que siempre apuntan hacia el centro.

### **Capas (Del centro hacia afuera)**

1. **Entidades (Entities):** El corazón. Definen las estructuras de datos y reglas de negocio críticas. Son objetos TypeScript/Zod puros que no saben nada del mundo exterior.  
2. **Casos de Uso (Use Cases):** La lógica de negocio. Orquestan las entidades para realizar acciones. No saben cómo se guardan los datos ni cómo se muestran, solo ejecutan la lógica.  
3. **Adaptadores de Interfaz (Interface Adapters):** Los traductores. Convierten los datos del mundo exterior (HTTP, base de datos) a un formato que los casos de uso entiendan. Aquí viven los repositorios y controladores.  
4. **Frameworks y Drivers:** El mundo exterior. Next.js, Supabase, el navegador.

### **Estructura de Directorios: El Mapa de Ruta**

Esta es la única estructura de directorios permitida. Cada nueva funcionalidad debe seguir este patrón.

src/  
├── app/  
│   ├── (main)/             # Directorio para las páginas principales de la app  
│   │   └── [feature]/      # Ejemplo: /tasks, /projects  
│   │       └── page.tsx    # El componente de página de React (UI Layer)  
│  
│   └── api/  
│       └── [feature]/      # Endpoint de la API (Interface Adapter Layer)  
│           └── route.ts    # La lógica del controlador que llama a los Use Cases  
│  
├── features/  
│   └── [feature-name]/     # Ejemplo: "tasks", "projects"  
│       │  
│       ├── components/     # Componentes de React específicos de esta feature (UI Layer)  
│       │   └── CreateTaskForm.tsx  
│       │  
│       ├── use-cases/      # La lógica de negocio pura (Use Case Layer)  
│       │   ├── createTask.ts  
│       │   └── createTask.test.ts  # Tests de Vitest para el Use Case  
│       │  
│       ├── services/       # La capa de acceso a datos (Interface Adapter Layer)  
│       │   └── task.service.ts     # Aquí vive el código de Supabase. NUNCA en otro lugar.  
│       │  
│       └── entities.ts       # Los tipos y schemas de Zod (Entity Layer)  
│  
├── lib/                      # Utilidades compartidas (cliente de Supabase, hooks, etc.)  
│  
└── components/ui/            # Componentes de UI genéricos de shadcn (Button, Card, Input)

tests/  
└── e2e/                      # Tests de Playwright  
    └── [feature-name].spec.ts  

# UNA CONSIDERACION IMPORTANTE ES QUE SI NO SE PUEDE REALIZAR UNA SOLUCION A UN PROBLEMA, NO CREAR "SOLUCIONES SIMPLIFICADAS", PREGUNTAR AL HUMANO ANTES. Y NUNCA PONER COSAS MOCK O HARDOCODEADAS. Y NUNCA BORRAR LA TABLA WAITLIST