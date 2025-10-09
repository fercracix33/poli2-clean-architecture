# Implementation Guide: [Feature Name]

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Supabase Spec:** `01-supabase-spec.md`
- **Test Spec:** `02-test-spec.md`
- **Feature ID:** [feature-id]
- **Assigned Agent:** Implementer Agent
- **Status:** [Pending | In Progress | Completed]

---

## 1. Implementation Strategy

### Desarrollo Dirigido por Tests (TDD)
1. **Red:** Ejecutar tests y confirmar que fallan
2. **Green:** Implementar código mínimo para pasar tests
3. **Refactor:** Mejorar código manteniendo tests verdes

### Orden de Implementación
1. Use Cases (lógica de negocio)
2. API Endpoints (controladores)
3. Validaciones y manejo de errores
4. Optimizaciones y refactoring

---

## 2. Use Cases Implementation

### Archivo: `src/features/[feature-name]/use-cases/[use-case-name].ts`

```typescript
import { [EntityName]Create, [EntityName]CreateSchema, [EntityName] } from '../entities';
import { 
  create[EntityName]InDB,
  get[EntityName]ByIdFromDB,
  list[EntityName]sFromDB,
  update[EntityName]InDB,
  delete[EntityName]FromDB
} from '../services/[feature-name].service';

/**
 * Crear un nuevo [resource]
 * @param data - Datos del [resource] a crear
 * @param userId - ID del usuario autenticado
 * @returns Promise<[EntityName]> - [Resource] creado
 * @throws Error si la validación falla o hay error en BD
 */
export async function create[EntityName](
  data: unknown,
  userId: string
): Promise<[EntityName]> {
  // Validación de entrada
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a valid string');
  }

  // Validación con Zod schema
  const validatedData = [EntityName]CreateSchema.parse(data);

  // Validaciones de negocio adicionales
  await validateBusinessRules(validatedData, userId);

  // Crear en base de datos
  try {
    const created[EntityName] = await create[EntityName]InDB(validatedData, userId);
    return created[EntityName];
  } catch (error) {
    console.error('Error creating [resource]:', error);
    throw new Error('Failed to create [resource]. Please try again.');
  }
}

/**
 * Obtener [resource] por ID
 * @param id - ID del [resource]
 * @param userId - ID del usuario autenticado
 * @returns Promise<[EntityName] | null> - [Resource] encontrado o null
 */
export async function get[EntityName]ById(
  id: string,
  userId: string
): Promise<[EntityName] | null> {
  // Validaciones básicas
  if (!id || typeof id !== 'string') {
    throw new Error('[Resource] ID is required and must be a valid string');
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a valid string');
  }

  try {
    const [resource] = await get[EntityName]ByIdFromDB(id, userId);
    return [resource];
  } catch (error) {
    console.error('Error fetching [resource]:', error);
    throw new Error('Failed to fetch [resource]. Please try again.');
  }
}

/**
 * Listar [resources] del usuario
 * @param userId - ID del usuario autenticado
 * @param limit - Número máximo de resultados (default: 50)
 * @param offset - Número de resultados a saltar (default: 0)
 * @returns Promise<[EntityName][]> - Lista de [resources]
 */
export async function list[EntityName]s(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<[EntityName][]> {
  // Validaciones
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a valid string');
  }

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  if (offset < 0) {
    throw new Error('Offset must be non-negative');
  }

  try {
    const [resources] = await list[EntityName]sFromDB(userId, limit, offset);
    return [resources];
  } catch (error) {
    console.error('Error listing [resources]:', error);
    throw new Error('Failed to list [resources]. Please try again.');
  }
}

/**
 * Actualizar [resource] existente
 * @param id - ID del [resource] a actualizar
 * @param data - Datos a actualizar
 * @param userId - ID del usuario autenticado
 * @returns Promise<[EntityName]> - [Resource] actualizado
 */
export async function update[EntityName](
  id: string,
  data: unknown,
  userId: string
): Promise<[EntityName]> {
  // Validaciones básicas
  if (!id || typeof id !== 'string') {
    throw new Error('[Resource] ID is required and must be a valid string');
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a valid string');
  }

  // Validar que el [resource] existe y pertenece al usuario
  const existing[EntityName] = await get[EntityName]ById(id, userId);
  if (!existing[EntityName]) {
    throw new Error('[Resource] not found or access denied');
  }

  // Validación con Zod schema
  const validatedData = [EntityName]UpdateSchema.parse(data);

  // Validaciones de negocio adicionales
  await validateUpdateBusinessRules(validatedData, existing[EntityName], userId);

  try {
    const updated[EntityName] = await update[EntityName]InDB(id, validatedData, userId);
    return updated[EntityName];
  } catch (error) {
    console.error('Error updating [resource]:', error);
    throw new Error('Failed to update [resource]. Please try again.');
  }
}

/**
 * Eliminar [resource]
 * @param id - ID del [resource] a eliminar
 * @param userId - ID del usuario autenticado
 * @returns Promise<void>
 */
export async function delete[EntityName](
  id: string,
  userId: string
): Promise<void> {
  // Validaciones básicas
  if (!id || typeof id !== 'string') {
    throw new Error('[Resource] ID is required and must be a valid string');
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a valid string');
  }

  // Validar que el [resource] existe y pertenece al usuario
  const existing[EntityName] = await get[EntityName]ById(id, userId);
  if (!existing[EntityName]) {
    throw new Error('[Resource] not found or access denied');
  }

  // Validaciones de negocio para eliminación
  await validateDeleteBusinessRules(existing[EntityName], userId);

  try {
    await delete[EntityName]FromDB(id, userId);
  } catch (error) {
    console.error('Error deleting [resource]:', error);
    throw new Error('Failed to delete [resource]. Please try again.');
  }
}

/**
 * Validaciones de reglas de negocio para creación
 */
async function validateBusinessRules(
  data: [EntityName]Create,
  userId: string
): Promise<void> {
  // Ejemplo: Validar límites por usuario
  const userResourceCount = await getUserResourceCount(userId);
  if (userResourceCount >= 100) {
    throw new Error('Maximum number of [resources] reached (100)');
  }

  // Ejemplo: Validar unicidad
  if (data.[uniqueField]) {
    const existing = await checkUniqueField(data.[uniqueField], userId);
    if (existing) {
      throw new Error('[UniqueField] already exists');
    }
  }

  // Más validaciones específicas del dominio...
}

/**
 * Validaciones de reglas de negocio para actualización
 */
async function validateUpdateBusinessRules(
  data: [EntityName]Update,
  existing: [EntityName],
  userId: string
): Promise<void> {
  // Ejemplo: Validar que ciertos campos no se pueden cambiar
  if (data.[immutableField] && data.[immutableField] !== existing.[immutableField]) {
    throw new Error('[ImmutableField] cannot be changed after creation');
  }

  // Ejemplo: Validar estado de transición
  if (data.status && !isValidStatusTransition(existing.status, data.status)) {
    throw new Error(`Invalid status transition from ${existing.status} to ${data.status}`);
  }

  // Más validaciones específicas del dominio...
}

/**
 * Validaciones de reglas de negocio para eliminación
 */
async function validateDeleteBusinessRules(
  existing: [EntityName],
  userId: string
): Promise<void> {
  // Ejemplo: No permitir eliminar si tiene dependencias
  const hasDependencies = await checkDependencies(existing.id);
  if (hasDependencies) {
    throw new Error('Cannot delete [resource] with existing dependencies');
  }

  // Ejemplo: Validar estado
  if (existing.status === 'active') {
    throw new Error('Cannot delete active [resource]. Please deactivate first.');
  }

  // Más validaciones específicas del dominio...
}

// Funciones auxiliares
async function getUserResourceCount(userId: string): Promise<number> {
  const resources = await list[EntityName]sFromDB(userId, 1000, 0);
  return resources.length;
}

async function checkUniqueField(value: string, userId: string): Promise<boolean> {
  // Implementar lógica de verificación de unicidad
  // Retorna true si ya existe, false si es único
  return false;
}

function isValidStatusTransition(from: string, to: string): boolean {
  // Implementar lógica de transiciones válidas
  const validTransitions: Record<string, string[]> = {
    'draft': ['active', 'archived'],
    'active': ['archived', 'inactive'],
    'inactive': ['active', 'archived'],
    'archived': [] // No se puede cambiar desde archived
  };

  return validTransitions[from]?.includes(to) || false;
}

async function checkDependencies(resourceId: string): Promise<boolean> {
  // Implementar lógica para verificar dependencias
  // Retorna true si tiene dependencias, false si no
  return false;
}
```

---

## 3. API Endpoints Implementation

### Archivo: `src/app/api/[feature]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { 
  create[EntityName],
  list[EntityName]s
} from '@/features/[feature-name]/use-cases/[use-case-name]';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-utils';

/**
 * POST /api/[feature] - Crear nuevo [resource]
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticación
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parsear body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Ejecutar use case
    const created[EntityName] = await create[EntityName](body, user.id);

    return NextResponse.json(created[EntityName], { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/[feature] - Listar [resources] del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticación
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parsear query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50'),
      100
    );
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0'),
      0
    );

    // Ejecutar use case
    const [resources] = await list[EntityName]s(user.id, limit, offset);

    return NextResponse.json([resources]);

  } catch (error) {
    return handleApiError(error);
  }
}
```

### Archivo: `src/app/api/[feature]/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { 
  get[EntityName]ById,
  update[EntityName],
  delete[EntityName]
} from '@/features/[feature-name]/use-cases/[use-case-name]';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-utils';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/[feature]/[id] - Obtener [resource] por ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Autenticación
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Ejecutar use case
    const [resource] = await get[EntityName]ById(params.id, user.id);

    if (![resource]) {
      return NextResponse.json(
        { error: '[Resource] not found' },
        { status: 404 }
      );
    }

    return NextResponse.json([resource]);

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/[feature]/[id] - Actualizar [resource]
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Autenticación
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parsear body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Ejecutar use case
    const updated[EntityName] = await update[EntityName](params.id, body, user.id);

    return NextResponse.json(updated[EntityName]);

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/[feature]/[id] - Eliminar [resource]
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Autenticación
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Ejecutar use case
    await delete[EntityName](params.id, user.id);

    return NextResponse.json(
      { message: '[Resource] deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 4. Error Handling & Utilities

### Archivo: `src/lib/api-utils.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Manejo centralizado de errores de API
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Error de validación Zod
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));

    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: formattedErrors
      },
      { status: 400 }
    );
  }

  // Error personalizado con mensaje
  if (error instanceof Error) {
    // Errores de negocio conocidos
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('Authentication required') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (error.message.includes('Forbidden') || error.message.includes('permission')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    // Error de validación o negocio
    if (error.message.includes('required') || 
        error.message.includes('invalid') || 
        error.message.includes('must be') ||
        error.message.includes('cannot')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  // Error desconocido
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

/**
 * Validar parámetros de paginación
 */
export function validatePaginationParams(
  limit?: string | null,
  offset?: string | null
): { limit: number; offset: number } {
  const parsedLimit = limit ? parseInt(limit) : 50;
  const parsedOffset = offset ? parseInt(offset) : 0;

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new Error('Limit must be a number between 1 and 100');
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    throw new Error('Offset must be a non-negative number');
  }

  return { limit: parsedLimit, offset: parsedOffset };
}
```

---

## 5. Authentication & Authorization

### Archivo: `src/lib/auth.ts`

```typescript
import { NextRequest } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  role?: string;
}

/**
 * Obtener usuario actual desde el request
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.user_metadata?.role
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Validar token de autorización
 */
export async function validateAuthToken(token: string): Promise<User | null> {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role
    };
  } catch (error) {
    console.error('Error validating auth token:', error);
    return null;
  }
}

/**
 * Verificar permisos de usuario
 */
export function hasPermission(user: User, permission: string): boolean {
  // Implementar lógica de permisos según el dominio
  const rolePermissions: Record<string, string[]> = {
    'admin': ['create', 'read', 'update', 'delete', 'manage'],
    'user': ['create', 'read', 'update', 'delete'],
    'viewer': ['read']
  };

  const userRole = user.role || 'user';
  return rolePermissions[userRole]?.includes(permission) || false;
}
```

---

## 6. Validation & Business Rules

### Validaciones Centralizadas
```typescript
// src/lib/validation.ts
import { z } from 'zod';

/**
 * Validadores comunes reutilizables
 */
export const CommonValidators = {
  id: z.string().cuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone format'),
  
  // Validadores de longitud
  shortText: z.string().min(1).max(100),
  mediumText: z.string().min(1).max(500),
  longText: z.string().min(1).max(2000),
  
  // Validadores numéricos
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),
  percentage: z.number().min(0).max(100)
};

/**
 * Validador de reglas de negocio
 */
export class BusinessRuleValidator {
  static async validateUserLimits(userId: string, resourceType: string): Promise<void> {
    // Implementar validación de límites por usuario
  }

  static validateStatusTransition(from: string, to: string): boolean {
    // Implementar validación de transiciones de estado
    return true;
  }

  static async validateUniqueness(
    field: string, 
    value: string, 
    userId: string,
    excludeId?: string
  ): Promise<void> {
    // Implementar validación de unicidad
  }
}
```

---

## 7. Performance Optimizations

### Caching Strategy
```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache';

/**
 * Cache para datos que cambian poco
 */
export const getCached[EntityName] = unstable_cache(
  async (id: string, userId: string) => {
    return await get[EntityName]ById(id, userId);
  },
  ['[entity-name]'],
  {
    revalidate: 300, // 5 minutos
    tags: ['[entity-name]']
  }
);

/**
 * Invalidar cache cuando se actualiza
 */
export function invalidate[EntityName]Cache(id: string): void {
  // Implementar invalidación de cache
}
```

### Database Query Optimization
```typescript
// Optimizaciones en los use cases
export async function list[EntityName]sOptimized(
  userId: string,
  filters?: [EntityName]Filters
): Promise<[EntityName][]> {
  // Implementar filtros eficientes
  // Usar índices apropiados
  // Limitar campos seleccionados si es necesario
}
```

---

## 8. Logging & Monitoring

### Structured Logging
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};
```

---

## 9. Testing Integration

### Test Execution Commands
```bash
# Ejecutar tests específicos de la feature
npm run test src/features/[feature-name]

# Ejecutar tests con coverage
npm run test:coverage src/features/[feature-name]

# Ejecutar tests en modo watch
npm run test:watch src/features/[feature-name]
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test && npm run lint"
    }
  }
}
```

---

## 10. Checklist de Completitud

### Use Cases
- [ ] Todas las funciones implementadas
- [ ] Validaciones de entrada implementadas
- [ ] Reglas de negocio aplicadas
- [ ] Manejo de errores robusto
- [ ] Logging apropiado añadido

### API Endpoints
- [ ] Todos los endpoints implementados
- [ ] Autenticación y autorización
- [ ] Validación de parámetros
- [ ] Manejo de errores HTTP
- [ ] Documentación de API

### Error Handling
- [ ] Errores de validación manejados
- [ ] Errores de negocio manejados
- [ ] Errores de base de datos manejados
- [ ] Respuestas HTTP apropiadas
- [ ] Logging de errores implementado

### Performance
- [ ] Optimizaciones implementadas
- [ ] Caching configurado (si aplica)
- [ ] Queries optimizadas
- [ ] Límites de paginación aplicados

### Security
- [ ] Autenticación implementada
- [ ] Autorización validada
- [ ] Sanitización de entrada
- [ ] Validación de permisos
- [ ] Logs de seguridad

### Tests
- [ ] Todos los tests pasando
- [ ] Coverage > 90% alcanzado
- [ ] Tests de integración funcionando
- [ ] Tests de seguridad incluidos

---

**Completado por:** [Nombre del Implementer Agent]
**Fecha de Completitud:** [YYYY-MM-DD]
**Tests Status:** [X/Y] passing
**Coverage:** [X]%