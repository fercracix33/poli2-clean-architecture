# Ejemplos de PRDs

Esta carpeta contiene ejemplos completos de PRDs para servir como referencia y guía para la creación de nuevas features.

## 📁 Contenido

### 001-example-task-comments/
**Feature:** Sistema de Comentarios en Tareas  
**Dominio:** tasks  
**Estado:** Completado (Ejemplo de referencia)

Este ejemplo muestra:
- ✅ PRD master completo con todos los detalles
- ✅ Archivo de status de una feature completada
- ✅ Uso correcto de schemas de Zod
- ✅ Definición clara de criterios de aceptación
- ✅ Especificaciones técnicas detalladas

## 🎯 Cómo Usar Estos Ejemplos

### Para Arquitectos
1. **Revisa el PRD master** (`00-master-prd.md`) para ver:
   - Cómo estructurar user stories efectivas
   - Formato correcto de criterios de aceptación
   - Definición completa de schemas de Zod
   - Especificaciones de API endpoints
   - Consideraciones técnicas importantes

2. **Observa las decisiones de diseño** documentadas en la sección de notas

### Para Todos los Agentes
1. **Consulta el archivo de status** (`_status.md`) para entender:
   - Cómo documentar progreso por agente
   - Formato de métricas y KPIs
   - Tracking de bloqueadores y resoluciones
   - Comunicación de decisiones técnicas

### Para Nuevas Features
1. **Usa como plantilla** copiando la estructura
2. **Adapta el contenido** a tu dominio específico
3. **Mantén el mismo nivel de detalle** y especificidad
4. **Sigue las convenciones** de naming y organización

## 🔍 Puntos Clave del Ejemplo

### Arquitectura de Datos
```typescript
// Ejemplo de schema bien definido
export const CommentSchema = z.object({
  id: z.string().cuid(),
  content: z.string()
    .min(1, "El comentario no puede estar vacío")
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .trim(),
  taskId: z.string().cuid("ID de tarea inválido"),
  authorId: z.string().cuid("ID de autor inválido"),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});
```

### Criterios de Aceptación Claros
- ✅ Funcionales: Qué debe hacer el sistema
- ✅ No funcionales: Performance, accesibilidad, seguridad
- ✅ Casos borde: Qué NO debe permitir
- ✅ Métricas específicas: Tiempos, límites, capacidades

### Consideraciones Técnicas Completas
- 🔒 Seguridad: RLS, validaciones, sanitización
- ⚡ Performance: Paginación, índices, caching
- 🔗 Integraciones: APIs, webhooks, jobs

## 📋 Checklist para Nuevos PRDs

Usa este checklist basado en el ejemplo:

### Metadata
- [ ] Feature ID único y descriptivo
- [ ] Versión inicial (1.0)
- [ ] Dependencias identificadas
- [ ] Arquitecto asignado

### User Story
- [ ] Tipo de usuario específico
- [ ] Acción clara y concreta
- [ ] Beneficio/valor explicado
- [ ] Contexto de negocio incluido

### Criterios de Aceptación
- [ ] Al menos 5 criterios funcionales
- [ ] Criterios no funcionales (performance, accesibilidad)
- [ ] Casos que NO debe permitir
- [ ] Métricas específicas y medibles

### Contratos de Datos
- [ ] Schemas de Zod completos con validaciones
- [ ] Tipos TypeScript derivados
- [ ] Relaciones entre entidades documentadas
- [ ] Schemas para diferentes operaciones (Create, Update)

### API Endpoints
- [ ] Rutas específicas definidas
- [ ] Métodos HTTP apropiados
- [ ] Schemas de request/response
- [ ] Códigos de error específicos
- [ ] Parámetros de query documentados

### Especificaciones UI/UX
- [ ] Componentes requeridos listados
- [ ] Flujos de usuario paso a paso
- [ ] Estados de interfaz definidos
- [ ] Wireframes o descripciones visuales

### Consideraciones Técnicas
- [ ] Seguridad: RLS, validaciones, sanitización
- [ ] Performance: Optimizaciones, límites, caching
- [ ] Integraciones: APIs externas, webhooks

### Definición de Terminado
- [ ] Checklist específico por agente
- [ ] Criterios medibles y verificables
- [ ] Métricas de calidad definidas

## 🚀 Próximos Pasos

1. **Estudia el ejemplo completo** antes de crear tu primer PRD
2. **Copia la estructura** y adapta el contenido
3. **Mantén el mismo nivel de detalle** y especificidad
4. **Consulta la guía principal** (`../GUIA-USO-PRD.md`) para el proceso completo

## 📞 Soporte

Si tienes dudas sobre cómo usar estos ejemplos:
1. Revisa la guía principal de PRDs
2. Consulta las plantillas en `_templates/`
3. Compara con este ejemplo de referencia
4. Escala a revisión humana si es necesario

---

**Mantenido por:** Arquitecto Principal  
**Última actualización:** 2024-01-21  
**Versión:** 1.0