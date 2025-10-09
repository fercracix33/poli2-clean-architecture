# Status Tracking: [Feature Name]

## Información General
- **Feature ID:** [feature-id]
- **Nombre:** [Feature Name]
- **Versión:** [X.Y]
- **Estado General:** 🔴 Not Started | 🟡 In Progress | 🟢 Completed | 🔵 Testing | ⚫ Blocked

---

## Timeline del Proyecto

### Fechas Clave
- **Inicio:** [YYYY-MM-DD]
- **Estimación de Completitud:** [YYYY-MM-DD]
- **Fecha Real de Completitud:** [YYYY-MM-DD o TBD]
- **Última Actualización:** [YYYY-MM-DD HH:MM]

---

## Estado por Agente

### 🏗️ Arquitecto (architect-agent)
- **Estado:** ✅ Completado | 🔄 En Progreso | ⏳ Pendiente | ❌ Bloqueado
- **Fecha de Inicio:** [YYYY-MM-DD]
- **Fecha de Completitud:** [YYYY-MM-DD]
- **Artefactos Entregados:**
  - [ ] PRD Master (`00-master-prd.md`)
  - [ ] Estructura de directorios creada
  - [ ] Archivo `entities.ts` implementado
  - [ ] Validación de schemas de Zod
- **Notas:** [Observaciones específicas del arquitecto]

### 🗄️ Supabase Agent (supabase-agent)
- **Estado:** ✅ Completado | 🔄 En Progreso | ⏳ Pendiente | ❌ Bloqueado
- **Fecha de Inicio:** [YYYY-MM-DD]
- **Fecha de Completitud:** [YYYY-MM-DD]
- **Artefactos Entregados:**
  - [ ] Schema de base de datos (`01-supabase-spec.md`)
  - [ ] Migraciones ejecutadas
  - [ ] Políticas RLS implementadas
  - [ ] Servicios de datos implementados
  - [ ] Funciones de base de datos (si aplican)
- **Métricas:**
  - **Tablas creadas:** [N]
  - **Políticas RLS:** [N]
  - **Servicios implementados:** [N]
- **Notas:** [Observaciones específicas de Supabase]

### 🧪 Test Agent (test-agent)
- **Estado:** ✅ Completado | 🔄 En Progreso | ⏳ Pendiente | ❌ Bloqueado
- **Fecha de Inicio:** [YYYY-MM-DD]
- **Fecha de Completitud:** [YYYY-MM-DD]
- **Artefactos Entregados:**
  - [ ] Especificaciones de testing (`02-test-spec.md`)
  - [ ] Tests unitarios implementados
  - [ ] Tests de integración implementados
  - [ ] Mocks configurados
  - [ ] Fixtures de datos de prueba
- **Métricas:**
  - **Tests Totales:** [N]
  - **Tests Pasando:** [N]
  - **Tests Fallando:** [N]
  - **Cobertura:** [X]%
- **Notas:** [Observaciones específicas de testing]

### ⚙️ Implementer Agent (implementer-agent)
- **Estado:** ✅ Completado | 🔄 En Progreso | ⏳ Pendiente | ❌ Bloqueado
- **Fecha de Inicio:** [YYYY-MM-DD]
- **Fecha de Completitud:** [YYYY-MM-DD]
- **Artefactos Entregados:**
  - [ ] Guía de implementación (`03-implementation-spec.md`)
  - [ ] Use cases implementados
  - [ ] API endpoints implementados
  - [ ] Validaciones de negocio
  - [ ] Manejo de errores
- **Métricas:**
  - **Use Cases:** [N/N] implementados
  - **Endpoints:** [N/N] implementados
  - **Tests Pasando:** [N/N]
  - **Performance API:** < [X]ms promedio
- **Notas:** [Observaciones específicas de implementación]

### 🎨 UI/UX Expert Agent (ui-ux-expert-agent)
- **Estado:** ✅ Completado | 🔄 En Progreso | ⏳ Pendiente | ❌ Bloqueado
- **Fecha de Inicio:** [YYYY-MM-DD]
- **Fecha de Completitud:** [YYYY-MM-DD]
- **Artefactos Entregados:**
  - [ ] Especificaciones UI/UX (`04-ui-spec.md`)
  - [ ] Componentes implementados
  - [ ] Páginas integradas
  - [ ] Tests E2E implementados
  - [ ] Validación de accesibilidad
- **Métricas:**
  - **Componentes:** [N/N] implementados
  - **Tests E2E:** [N/N] pasando
  - **Accessibility Score:** [X]/100
  - **Performance Score:** [X]/100
- **Notas:** [Observaciones específicas de UI/UX]

---

## Métricas Consolidadas

### Progreso General
```
Arquitecto     ████████████████████ 100%
Supabase       ████████████████████  85%
Testing        ████████████████████  90%
Implementer    ████████████████████  75%
UI/UX          ████████████████████  60%
                                    ----
TOTAL                               82%
```

### Calidad del Código
- **Cobertura de Tests:** [X]% (Objetivo: >90%)
- **Tests Unitarios:** [X/Y] pasando
- **Tests de Integración:** [X/Y] pasando
- **Tests E2E:** [X/Y] pasando
- **Linting:** ✅ Sin errores | ⚠️ [N] warnings | ❌ [N] errores

### Performance
- **API Response Time:** [X]ms promedio (Objetivo: <200ms)
- **Bundle Size:** [X]KB (Objetivo: <500KB)
- **Lighthouse Score:** [X]/100
- **Core Web Vitals:** ✅ Passing | ⚠️ Needs Improvement | ❌ Poor

### Seguridad
- **RLS Policies:** [X/Y] implementadas
- **Input Validation:** ✅ Implementada
- **Authentication:** ✅ Implementada
- **Authorization:** ✅ Implementada

---

## Bloqueadores Actuales

### 🚫 Bloqueadores Activos
1. **[Título del Bloqueador]**
   - **Descripción:** [Descripción detallada del problema]
   - **Agente Afectado:** [Nombre del agente]
   - **Impacto:** Alto | Medio | Bajo
   - **Fecha de Identificación:** [YYYY-MM-DD]
   - **Acción Requerida:** [Qué se necesita para resolver]
   - **Responsable:** [Quién debe resolverlo]

### ✅ Bloqueadores Resueltos
1. **[Título del Bloqueador Resuelto]**
   - **Fecha de Resolución:** [YYYY-MM-DD]
   - **Solución Aplicada:** [Cómo se resolvió]

---

## Próximos Pasos

### Inmediatos (Próximas 24h)
- [ ] [Tarea específica 1]
- [ ] [Tarea específica 2]
- [ ] [Tarea específica 3]

### Corto Plazo (Próxima semana)
- [ ] [Tarea de corto plazo 1]
- [ ] [Tarea de corto plazo 2]

### Mediano Plazo (Próximo mes)
- [ ] [Tarea de mediano plazo 1]
- [ ] [Tarea de mediano plazo 2]

---

## Dependencias

### Dependencias Externas
- **[Nombre de la Dependencia]**
  - **Tipo:** API Externa | Librería | Servicio
  - **Estado:** ✅ Disponible | ⏳ Pendiente | ❌ Bloqueada
  - **Impacto si no está disponible:** [Descripción del impacto]

### Dependencias Internas
- **[Feature Dependiente]**
  - **Relación:** Requiere | Requerida por
  - **Estado:** [Estado de la feature dependiente]
  - **Fecha Estimada:** [YYYY-MM-DD]

---

## Riesgos Identificados

### 🔴 Riesgos Altos
1. **[Nombre del Riesgo]**
   - **Probabilidad:** Alta | Media | Baja
   - **Impacto:** Alto | Medio | Bajo
   - **Mitigación:** [Plan de mitigación]

### 🟡 Riesgos Medios
1. **[Nombre del Riesgo]**
   - **Probabilidad:** Alta | Media | Baja
   - **Impacto:** Alto | Medio | Bajo
   - **Mitigación:** [Plan de mitigación]

---

## Decisiones Técnicas

### Decisiones Tomadas
1. **[Título de la Decisión]**
   - **Fecha:** [YYYY-MM-DD]
   - **Contexto:** [Por qué se tomó esta decisión]
   - **Alternativas Consideradas:** [Otras opciones evaluadas]
   - **Decisión:** [Qué se decidió]
   - **Impacto:** [Consecuencias de la decisión]

### Decisiones Pendientes
1. **[Título de la Decisión Pendiente]**
   - **Fecha Límite:** [YYYY-MM-DD]
   - **Opciones:** [Alternativas disponibles]
   - **Criterios de Decisión:** [Factores a considerar]
   - **Responsable:** [Quién debe decidir]

---

## Comunicación y Reportes

### Última Comunicación con Stakeholders
- **Fecha:** [YYYY-MM-DD]
- **Medio:** Email | Reunión | Slack | Documento
- **Participantes:** [Lista de participantes]
- **Temas Discutidos:** [Resumen de la comunicación]
- **Acuerdos:** [Decisiones tomadas]

### Próxima Comunicación Programada
- **Fecha:** [YYYY-MM-DD]
- **Tipo:** Status Update | Demo | Review
- **Agenda:** [Temas a tratar]

---

## Lecciones Aprendidas

### ✅ Qué Funcionó Bien
- [Práctica o decisión que funcionó bien]
- [Otra práctica exitosa]

### ❌ Qué No Funcionó
- [Problema o decisión que no funcionó]
- [Otro problema identificado]

### 💡 Mejoras para el Futuro
- [Sugerencia de mejora 1]
- [Sugerencia de mejora 2]

---

## Recursos y Enlaces

### Documentación
- **PRD Master:** `00-master-prd.md`
- **Supabase Spec:** `01-supabase-spec.md`
- **Test Spec:** `02-test-spec.md`
- **Implementation Guide:** `03-implementation-spec.md`
- **UI/UX Spec:** `04-ui-spec.md`

### Enlaces Útiles
- **Repositorio:** [URL del repositorio]
- **Deploy Preview:** [URL del preview]
- **Staging Environment:** [URL de staging]
- **Production:** [URL de producción]
- **Monitoring Dashboard:** [URL del dashboard]

### Contactos
- **Product Owner:** [Nombre y contacto]
- **Tech Lead:** [Nombre y contacto]
- **QA Lead:** [Nombre y contacto]

---

**Última Actualización:** [YYYY-MM-DD HH:MM] por [Nombre del actualizador]
**Próxima Actualización:** [YYYY-MM-DD]
**Frecuencia de Updates:** Diaria | Semanal | Según necesidad