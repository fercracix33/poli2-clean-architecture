# Test Specifications: [Feature Name]

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Supabase Spec:** `01-supabase-spec.md`
- **Feature ID:** [feature-id]
- **Assigned Agent:** Test Agent
- **Status:** [Pending | In Progress | Completed]

---

## 1. Estrategia de Testing

### Cobertura Objetivo
- **Unitarios:** > 90% cobertura de líneas
- **Integración:** Todos los endpoints de API
- **E2E:** Flujos críticos de usuario

### Herramientas
- **Framework:** Vitest
- **Mocking:** vi.mock()
- **Assertions:** expect()
- **Coverage:** c8

---

## 2. Tests Unitarios - Use Cases

### Archivo: `src/features/[feature-name]/use-cases/[use-case-name].test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { [useCaseName] } from './[use-case-name]';
import { [serviceFunctions] } from '../services/[feature-name].service';

// Mock del servicio de datos
vi.mock('../services/[feature-name].service');

describe('[UseCaseName] Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange
      const mockData = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };
      const expectedResult = {
        id: 'test-id',
        ...mockData,
        createdAt: new Date()
      };

      vi.mocked([serviceFunction]).mockResolvedValue(expectedResult);

      // Act
      const result = await [useCaseName](mockData, 'user-id');

      // Assert
      expect(result).toEqual(expectedResult);
      expect([serviceFunction]).toHaveBeenCalledWith(mockData, 'user-id');
      expect([serviceFunction]).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty [field] gracefully', async () => {
      // Arrange
      const invalidData = {
        [field]: '',
        [anotherField]: '[valid_value]'
      };

      // Act & Assert
      await expect([useCaseName](invalidData, 'user-id'))
        .rejects
        .toThrow('[Expected error message]');
    });

    it('should handle maximum length [field]', async () => {
      // Arrange
      const maxLengthData = {
        [field]: 'a'.repeat(1000), // Máximo permitido
        [anotherField]: '[valid_value]'
      };
      const expectedResult = {
        id: 'test-id',
        ...maxLengthData,
        createdAt: new Date()
      };

      vi.mocked([serviceFunction]).mockResolvedValue(expectedResult);

      // Act
      const result = await [useCaseName](maxLengthData, 'user-id');

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should reject [field] exceeding maximum length', async () => {
      // Arrange
      const tooLongData = {
        [field]: 'a'.repeat(1001), // Excede el máximo
        [anotherField]: '[valid_value]'
      };

      // Act & Assert
      await expect([useCaseName](tooLongData, 'user-id'))
        .rejects
        .toThrow('[Expected validation error]');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const validData = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };

      vi.mocked([serviceFunction]).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect([useCaseName](validData, 'user-id'))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should handle service layer errors', async () => {
      // Arrange
      const validData = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };

      vi.mocked([serviceFunction]).mockRejectedValue(
        new Error('Could not create the [resource]')
      );

      // Act & Assert
      await expect([useCaseName](validData, 'user-id'))
        .rejects
        .toThrow('Could not create the [resource]');
    });
  });

  describe('Security & Authorization', () => {
    it('should require valid user ID', async () => {
      // Arrange
      const validData = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };

      // Act & Assert
      await expect([useCaseName](validData, ''))
        .rejects
        .toThrow('[Expected authorization error]');
    });

    it('should validate user permissions', async () => {
      // Arrange
      const validData = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };

      vi.mocked([serviceFunction]).mockRejectedValue(
        new Error('Insufficient permissions')
      );

      // Act & Assert
      await expect([useCaseName](validData, 'unauthorized-user-id'))
        .rejects
        .toThrow('Insufficient permissions');
    });
  });
});
```

---

## 3. Tests de Integración - API Endpoints

### Archivo: `src/app/api/[feature]/route.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET, PUT, DELETE } from './route';
import { [useCaseName] } from '@/features/[feature-name]/use-cases/[use-case-name]';

// Mock de los use cases
vi.mock('@/features/[feature-name]/use-cases/[use-case-name]');

describe('/api/[feature] API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/[feature]', () => {
    it('should create [resource] successfully', async () => {
      // Arrange
      const requestBody = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };
      const mockResult = {
        id: 'test-id',
        ...requestBody,
        createdAt: new Date().toISOString()
      };

      const request = new Request('http://localhost/api/[feature]', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(requestBody)
      });

      vi.mocked([useCaseName]).mockResolvedValue(mockResult);

      // Act
      const response = await POST(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(responseData).toEqual(mockResult);
      expect([useCaseName]).toHaveBeenCalledWith(requestBody, 'user-id');
    });

    it('should return 400 for invalid request body', async () => {
      // Arrange
      const invalidBody = {
        [field]: '', // Campo requerido vacío
        [anotherField]: '[valid_value]'
      };

      const request = new Request('http://localhost/api/[feature]', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(invalidBody)
      });

      // Act
      const response = await POST(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toContain('[Expected validation error]');
    });

    it('should return 401 for missing authorization', async () => {
      // Arrange
      const validBody = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };

      const request = new Request('http://localhost/api/[feature]', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Sin Authorization header
        },
        body: JSON.stringify(validBody)
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 500 for internal server errors', async () => {
      // Arrange
      const validBody = {
        [field]: '[valid_value]',
        [anotherField]: '[valid_value]'
      };

      const request = new Request('http://localhost/api/[feature]', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(validBody)
      });

      vi.mocked([useCaseName]).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/[feature]', () => {
    it('should list [resources] successfully', async () => {
      // Arrange
      const mockResults = [
        {
          id: 'test-id-1',
          [field]: '[value1]',
          [anotherField]: '[value1]',
          createdAt: new Date().toISOString()
        },
        {
          id: 'test-id-2',
          [field]: '[value2]',
          [anotherField]: '[value2]',
          createdAt: new Date().toISOString()
        }
      ];

      const request = new Request('http://localhost/api/[feature]', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      vi.mocked([listUseCaseName]).mockResolvedValue(mockResults);

      // Act
      const response = await GET(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResults);
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      const request = new Request('http://localhost/api/[feature]?limit=10&offset=20', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      vi.mocked([listUseCaseName]).mockResolvedValue([]);

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      expect([listUseCaseName]).toHaveBeenCalledWith('user-id', 10, 20);
    });
  });

  // Tests similares para PUT y DELETE...
});
```

---

## 4. Mocking Strategy

### Service Layer Mocks
```typescript
// Mock completo del servicio
vi.mock('../services/[feature-name].service', () => ({
  create[EntityName]InDB: vi.fn(),
  get[EntityName]ByIdFromDB: vi.fn(),
  list[EntityName]sFromDB: vi.fn(),
  update[EntityName]InDB: vi.fn(),
  delete[EntityName]FromDB: vi.fn()
}));
```

### External Dependencies Mocks
```typescript
// Mock de Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock de autenticación
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  validateToken: vi.fn()
}));
```

---

## 5. Test Data & Fixtures

### Datos de Prueba
```typescript
// fixtures/[feature-name].ts
export const valid[EntityName]Data = {
  [field]: '[valid_test_value]',
  [anotherField]: '[valid_test_value]'
};

export const invalid[EntityName]Data = {
  [field]: '', // Inválido
  [anotherField]: '[valid_test_value]'
};

export const mock[EntityName]Response = {
  id: 'test-id-123',
  ...valid[EntityName]Data,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z')
};

export const mockUser = {
  id: 'user-id-123',
  email: 'test@example.com'
};
```

---

## 6. Performance Tests

### Load Testing Scenarios
```typescript
describe('Performance Tests', () => {
  it('should handle concurrent [resource] creation', async () => {
    // Arrange
    const concurrentRequests = 10;
    const requests = Array(concurrentRequests).fill(null).map(() => 
      [useCaseName](valid[EntityName]Data, 'user-id')
    );

    // Act
    const startTime = Date.now();
    const results = await Promise.all(requests);
    const endTime = Date.now();

    // Assert
    expect(results).toHaveLength(concurrentRequests);
    expect(endTime - startTime).toBeLessThan(1000); // < 1 segundo
  });

  it('should handle large data sets efficiently', async () => {
    // Arrange
    const largeDataSet = Array(1000).fill(null).map((_, index) => ({
      ...valid[EntityName]Data,
      [field]: `[value]_${index}`
    }));

    // Act & Assert
    const startTime = Date.now();
    for (const data of largeDataSet) {
      await [useCaseName](data, 'user-id');
    }
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(5000); // < 5 segundos
  });
});
```

---

## 7. Security Tests

### Authorization Tests
```typescript
describe('Security Tests', () => {
  it('should prevent unauthorized access', async () => {
    // Test sin token
    await expect([useCaseName](valid[EntityName]Data, ''))
      .rejects
      .toThrow('Unauthorized');
  });

  it('should prevent cross-user data access', async () => {
    // Test acceso a datos de otro usuario
    vi.mocked([serviceFunction]).mockRejectedValue(
      new Error('Access denied')
    );

    await expect([useCaseName](valid[EntityName]Data, 'other-user-id'))
      .rejects
      .toThrow('Access denied');
  });

  it('should sanitize input data', async () => {
    // Test inyección de código
    const maliciousData = {
      [field]: '<script>alert("xss")</script>',
      [anotherField]: 'DROP TABLE users;'
    };

    // Debería sanitizar o rechazar
    await expect([useCaseName](maliciousData, 'user-id'))
      .rejects
      .toThrow('[Expected sanitization error]');
  });
});
```

---

## 8. Coverage Requirements

### Minimum Coverage Targets
- **Statements:** 90%
- **Branches:** 85%
- **Functions:** 95%
- **Lines:** 90%

### Coverage Exclusions
```typescript
// Archivos excluidos de coverage
/* istanbul ignore file */

// Líneas específicas excluidas
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

---

## 9. Test Execution

### Scripts de Testing
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:[feature]": "vitest src/features/[feature-name]"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm run test:coverage
  
- name: Check Coverage
  run: |
    if [ $(npm run test:coverage | grep "All files" | awk '{print $4}' | sed 's/%//') -lt 90 ]; then
      echo "Coverage below 90%"
      exit 1
    fi
```

---

## 10. Checklist de Completitud

### Tests Unitarios
- [ ] Happy path scenarios cubiertos
- [ ] Edge cases identificados y probados
- [ ] Error handling implementado
- [ ] Security scenarios validados
- [ ] Performance tests incluidos

### Tests de Integración
- [ ] Todos los endpoints probados
- [ ] Validación de request/response
- [ ] Manejo de errores HTTP
- [ ] Autenticación y autorización

### Mocking
- [ ] Service layer mockeado
- [ ] External dependencies mockeadas
- [ ] Test data fixtures creados
- [ ] Mock cleanup implementado

### Coverage
- [ ] Cobertura > 90% alcanzada
- [ ] Reportes de coverage generados
- [ ] Exclusiones documentadas
- [ ] CI/CD integration configurada

---

**Completado por:** [Nombre del Test Agent]
**Fecha de Completitud:** [YYYY-MM-DD]
**Coverage Alcanzado:** [X]%
**Tests Totales:** [N] tests