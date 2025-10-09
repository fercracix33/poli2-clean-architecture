# UI/UX Specifications: [Feature Name]

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Implementation Guide:** `03-implementation-spec.md`
- **Feature ID:** [feature-id]
- **Assigned Agent:** UI/UX Expert Agent
- **Status:** [Pending | In Progress | Completed]

---

## 1. Design System & Components

### Base Components (shadcn/ui)
- **Button:** Acciones primarias y secundarias
- **Card:** Contenedores de información
- **Input:** Campos de formulario
- **Badge:** Estados y etiquetas
- **Dialog:** Modales y confirmaciones
- **Form:** Validación y manejo de formularios

### Custom Components
- **[ComponentName]:** [Descripción y propósito]
- **[AnotherComponent]:** [Descripción y propósito]

---

## 2. Component Implementation

### Componente Principal: [ComponentName]

#### Archivo: `src/features/[feature-name]/components/[ComponentName].tsx`

```typescript
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { [EntityName]CreateSchema, [EntityName]Create } from '../entities';
import { create[EntityName]Api } from '../api/[feature-name].api';
import { cn } from '@/lib/utils';
import { Loader2, Plus, X } from 'lucide-react';

interface [ComponentName]Props {
  onSuccess?: ([EntityName]) => void;
  onCancel?: () => void;
  className?: string;
}

export function [ComponentName]({ 
  onSuccess, 
  onCancel, 
  className 
}: [ComponentName]Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Form setup con react-hook-form y Zod
  const form = useForm<[EntityName]Create>({
    resolver: zodResolver([EntityName]CreateSchema),
    defaultValues: {
      [field]: '',
      [anotherField]: ''
    }
  });

  // Mutation para crear [resource]
  const createMutation = useMutation({
    mutationFn: create[EntityName]Api,
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['[resources]'] });
      
      // Callback de éxito
      onSuccess?.(data);
      
      // Reset form
      form.reset();
      
      // Mostrar notificación de éxito (implementar toast)
      console.log('[Resource] created successfully');
    },
    onError: (error) => {
      console.error('Error creating [resource]:', error);
      // Mostrar error al usuario (implementar toast)
    }
  });

  const onSubmit = async (data: [EntityName]Create) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create New [Resource]
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo principal */}
            <FormField
              control={form.control}
              name="[field]"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>[Field Label]</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter [field]..."
                      {...field}
                      disabled={isSubmitting}
                      aria-describedby="[field]-error"
                    />
                  </FormControl>
                  <FormMessage id="[field]-error" />
                </FormItem>
              )}
            />

            {/* Campo de texto largo */}
            <FormField
              control={form.control}
              name="[anotherField]"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>[Another Field Label]</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter [another field]..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                      aria-describedby="[anotherField]-error"
                    />
                  </FormControl>
                  <FormMessage id="[anotherField]-error" />
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                aria-label="Create [resource]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create [Resource]
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### Componente de Lista: [EntityName]List

#### Archivo: `src/features/[feature-name]/components/[EntityName]List.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { [EntityName] } from '../entities';
import { list[EntityName]sApi } from '../api/[feature-name].api';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';

interface [EntityName]ListProps {
  onEdit?: ([EntityName]) => void;
  onDelete?: ([EntityName]) => void;
  onCreate?: () => void;
  className?: string;
}

export function [EntityName]List({ 
  onEdit, 
  onDelete, 
  onCreate, 
  className 
}: [EntityName]ListProps) {
  const [page, setPage] = useState(0);
  const limit = 10;

  // Query para obtener lista de [resources]
  const { 
    data: [resources] = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['[resources]', page],
    queryFn: () => list[EntityName]sApi(limit, page * limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Error loading [resources]</p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header con botón de crear */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">[Resources]</h2>
        {onCreate && (
          <Button onClick={onCreate} aria-label="Create new [resource]">
            <Plus className="mr-2 h-4 w-4" />
            New [Resource]
          </Button>
        )}
      </div>

      {/* Lista de [resources] */}
      <div className="grid gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : [resources].length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>No [resources] found</p>
                {onCreate && (
                  <Button 
                    variant="outline" 
                    onClick={onCreate}
                    className="mt-2"
                  >
                    Create your first [resource]
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Lista de [resources]
          [resources].map(([resource]) => (
            <[EntityName]Card
              key={[resource].id}
              [resource]={[resource]}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Paginación */}
      {[resources].length === limit && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente individual de [resource]
interface [EntityName]CardProps {
  [resource]: [EntityName];
  onEdit?: ([EntityName]) => void;
  onDelete?: ([EntityName]) => void;
}

function [EntityName]Card({ [resource], onEdit, onDelete }: [EntityName]CardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {[resource].[titleField]}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {[resource].status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit([resource])}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete([resource])}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {[resource].[descriptionField]}
        </p>
        <div className="text-sm text-muted-foreground">
          Created: {new Date([resource].createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 3. API Integration Layer

### Archivo: `src/features/[feature-name]/api/[feature-name].api.ts`

```typescript
import { [EntityName], [EntityName]Create, [EntityName]Update } from '../entities';

const API_BASE = '/api/[feature]';

/**
 * Crear nuevo [resource]
 */
export async function create[EntityName]Api(data: [EntityName]Create): Promise<[EntityName]> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create [resource]');
  }

  return response.json();
}

/**
 * Obtener [resource] por ID
 */
export async function get[EntityName]Api(id: string): Promise<[EntityName]> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch [resource]');
  }

  return response.json();
}

/**
 * Listar [resources]
 */
export async function list[EntityName]sApi(
  limit: number = 50,
  offset: number = 0
): Promise<[EntityName][]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`${API_BASE}?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list [resources]');
  }

  return response.json();
}

/**
 * Actualizar [resource]
 */
export async function update[EntityName]Api(
  id: string,
  data: [EntityName]Update
): Promise<[EntityName]> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update [resource]');
  }

  return response.json();
}

/**
 * Eliminar [resource]
 */
export async function delete[EntityName]Api(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete [resource]');
  }
}
```

---

## 4. Page Integration

### Archivo: `src/app/(main)/[feature]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { [ComponentName] } from '@/features/[feature-name]/components/[ComponentName]';
import { [EntityName]List } from '@/features/[feature-name]/components/[EntityName]List';
import { [EntityName] } from '@/features/[feature-name]/entities';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { delete[EntityName]Api } from '@/features/[feature-name]/api/[feature-name].api';
import { useQueryClient } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function [Feature]Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <[Feature]PageContent />
    </QueryClientProvider>
  );
}

function [Feature]PageContent() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<[EntityName] | null>(null);
  const [deletingResource, setDeletingResource] = useState<[EntityName] | null>(null);
  const queryClient = useQueryClient();

  const handleCreate = () => {
    setShowCreateDialog(true);
  };

  const handleCreateSuccess = ([resource]: [EntityName]) => {
    setShowCreateDialog(false);
    // Optionally show success toast
  };

  const handleEdit = ([resource]: [EntityName]) => {
    setEditingResource([resource]);
  };

  const handleEditSuccess = ([resource]: [EntityName]) => {
    setEditingResource(null);
    // Optionally show success toast
  };

  const handleDelete = ([resource]: [EntityName]) => {
    setDeletingResource([resource]);
  };

  const confirmDelete = async () => {
    if (!deletingResource) return;

    try {
      await delete[EntityName]Api(deletingResource.id);
      queryClient.invalidateQueries({ queryKey: ['[resources]'] });
      setDeletingResource(null);
      // Optionally show success toast
    } catch (error) {
      console.error('Error deleting [resource]:', error);
      // Optionally show error toast
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <[EntityName]List
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New [Resource]</DialogTitle>
            </DialogHeader>
            <[ComponentName]
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingResource} onOpenChange={() => setEditingResource(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit [Resource]</DialogTitle>
            </DialogHeader>
            {editingResource && (
              <Edit[ComponentName]
                [resource]={editingResource}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingResource(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingResource} onOpenChange={() => setDeletingResource(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete [Resource]</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingResource?.[titleField]}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

---

## 5. End-to-End Tests

### Archivo: `tests/e2e/[feature-name].spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('[Feature Name] E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login and navigate to feature page
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    await page.goto('/[feature]');
  });

  test('should create new [resource] successfully', async ({ page }) => {
    // Click create button
    await page.click('[data-testid="create-[resource]-button"]');
    
    // Fill form
    await page.fill('[data-testid="[field]-input"]', 'Test [Resource]');
    await page.fill('[data-testid="[anotherField]-input"]', 'Test description for the [resource]');
    
    // Submit form
    await page.click('[data-testid="submit-[resource]-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="[resource]-card"]')).toContainText('Test [Resource]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click create button
    await page.click('[data-testid="create-[resource]-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-[resource]-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="[field]-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="[field]-error"]')).toContainText('required');
  });

  test('should edit existing [resource]', async ({ page }) => {
    // Assume there's already a [resource] in the list
    await page.click('[data-testid="[resource]-menu-button"]').first();
    await page.click('[data-testid="edit-[resource]-button"]');
    
    // Update fields
    await page.fill('[data-testid="[field]-input"]', 'Updated [Resource]');
    
    // Submit changes
    await page.click('[data-testid="submit-[resource]-button"]');
    
    // Verify update
    await expect(page.locator('[data-testid="[resource]-card"]')).toContainText('Updated [Resource]');
  });

  test('should delete [resource] with confirmation', async ({ page }) => {
    // Click delete option
    await page.click('[data-testid="[resource]-menu-button"]').first();
    await page.click('[data-testid="delete-[resource]-button"]');
    
    // Confirm deletion
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify deletion
    await expect(page.locator('[data-testid="[resource]-card"]')).not.toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Navigate using Tab
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="create-[resource]-button"]')).toBeFocused();
    
    // Activate with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="[resource]-form"]')).toBeVisible();
    
    // Navigate form fields
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="[field]-input"]')).toBeFocused();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify responsive layout
    await expect(page.locator('[data-testid="[resource]-grid"]')).toHaveCSS('grid-template-columns', '1fr');
    
    // Test mobile interactions
    await page.click('[data-testid="create-[resource]-button"]');
    await expect(page.locator('[data-testid="[resource]-form"]')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Intercept API call to simulate slow response
    await page.route('/api/[feature]', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.reload();
    
    // Verify loading skeleton
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Intercept API call to simulate error
    await page.route('/api/[feature]', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.reload();
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
```

---

## 6. Accessibility Implementation

### ARIA Labels and Semantic HTML
```typescript
// Ejemplo de implementación accesible
<form role="form" aria-labelledby="form-title">
  <h2 id="form-title">Create [Resource]</h2>
  
  <div role="group" aria-labelledby="basic-info">
    <h3 id="basic-info">Basic Information</h3>
    
    <Input
      id="[field]"
      aria-describedby="[field]-help [field]-error"
      aria-required="true"
      aria-invalid={!!errors.[field]}
    />
    <div id="[field]-help">Enter a descriptive name</div>
    {errors.[field] && (
      <div id="[field]-error" role="alert" aria-live="polite">
        {errors.[field].message}
      </div>
    )}
  </div>
</form>
```

### Keyboard Navigation
```typescript
// Implementar navegación por teclado
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      onCancel?.();
      break;
    case 'Enter':
      if (event.ctrlKey || event.metaKey) {
        form.handleSubmit(onSubmit)();
      }
      break;
  }
};

useEffect(() => {
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 7. Performance Optimizations

### Code Splitting
```typescript
// Lazy loading de componentes pesados
const Heavy[Component] = lazy(() => import('./Heavy[Component]'));

// Uso con Suspense
<Suspense fallback={<Skeleton />}>
  <Heavy[Component] />
</Suspense>
```

### Memoization
```typescript
// Memoizar componentes costosos
const Memoized[Component] = memo(function [Component]({ data }: Props) {
  return <ExpensiveComponent data={data} />;
});

// Memoizar callbacks
const handleClick = useCallback((id: string) => {
  onEdit?.(id);
}, [onEdit]);
```

---

## 8. State Management

### TanStack Query Setup
```typescript
// Query keys factory
export const [feature]QueryKeys = {
  all: ['[resources]'] as const,
  lists: () => [...[feature]QueryKeys.all, 'list'] as const,
  list: (filters: string) => [...[feature]QueryKeys.lists(), { filters }] as const,
  details: () => [...[feature]QueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...[feature]QueryKeys.details(), id] as const,
};

// Custom hooks
export function use[EntityName]s(filters?: [EntityName]Filters) {
  return useQuery({
    queryKey: [feature]QueryKeys.list(JSON.stringify(filters)),
    queryFn: () => list[EntityName]sApi(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function use[EntityName](id: string) {
  return useQuery({
    queryKey: [feature]QueryKeys.detail(id),
    queryFn: () => get[EntityName]Api(id),
    enabled: !!id,
  });
}
```

---

## 9. Checklist de Completitud

### Components
- [ ] Componente principal implementado
- [ ] Componente de lista implementado
- [ ] Componente de edición implementado
- [ ] Estados de loading implementados
- [ ] Estados de error implementados
- [ ] Estados vacíos implementados

### Accessibility
- [ ] ARIA labels implementados
- [ ] Navegación por teclado funcional
- [ ] Contraste de colores validado
- [ ] Screen reader compatible
- [ ] Focus management implementado

### Responsiveness
- [ ] Mobile (375px+) funcional
- [ ] Tablet (768px+) funcional
- [ ] Desktop (1024px+) funcional
- [ ] Breakpoints intermedios validados

### Performance
- [ ] Code splitting implementado
- [ ] Lazy loading configurado
- [ ] Memoization aplicada
- [ ] Bundle size optimizado

### Testing
- [ ] Tests E2E implementados
- [ ] Tests de accesibilidad incluidos
- [ ] Tests de responsividad incluidos
- [ ] Tests de performance incluidos

### Integration
- [ ] API integration funcional
- [ ] Error handling robusto
- [ ] Loading states apropiados
- [ ] State management configurado

---

**Completado por:** [Nombre del UI/UX Expert Agent]
**Fecha de Completitud:** [YYYY-MM-DD]
**Accessibility Score:** [X]/100
**Performance Score:** [X]/100
**E2E Tests:** [X/Y] passing