# Sistema de Agentes v2.0 (Archivado)

**Fecha de archivo:** 2025-10-29
**Razón:** Migración a Sistema v3.0 con inversión de roles (agentes planificadores → Claude implementador)

---

## 📦 Contenido Archivado

Este directorio preserva el sistema de agentes v2.0 que fue reemplazado por el sistema v3.0.

### Estructura:
```
sistemaAntiguo/
├── agentes/          # 7 agentes del sistema v2.0
└── skills/           # 8 skills especializadas
```

---

## 🤖 Agentes Preservados

### 1. **architect-agent.md**
- **Rol:** Coordinador y revisor arquitectónico
- **Responsabilidades:** Crear PRD, entities.ts, coordinar iteraciones
- **Skill asociada:** `architect-agent-skill`

### 2. **test-agent.md**
- **Rol:** Test Architect (especificación viviente)
- **Responsabilidades:** Crear suite de tests failing (unit, integration, E2E)
- **Skill asociada:** `test-agent-skill`

### 3. **implementer-agent.md**
- **Rol:** Business Logic Developer
- **Responsabilidades:** Implementar use cases que pasen tests
- **Skill asociada:** `implementer-agent-skill`

### 4. **supabase-expert.md**
- **Rol:** Data Specialist
- **Responsabilidades:** Implementar data services, RLS, migraciones
- **Skill asociada:** `supabase-expert-skill`

### 5. **ui-ux-expert.md**
- **Rol:** Interface Specialist
- **Responsabilidades:** Crear componentes React accesibles (shadcn/ui)
- **Skill asociada:** `ui-ux-expert-skill`

### 6. **bug-fixer.md**
- **Rol:** Diagnostic Specialist
- **Responsabilidades:** Diagnóstico y corrección de bugs fuera del flujo TDD
- **Skill asociada:** `bug-fixer-diagnostic`

### 7. **ui-improver.md**
- **Rol:** Visual Enhancement Specialist
- **Responsabilidades:** Mejoras visuales sin tocar lógica de negocio
- **Skill asociada:** `ui-improver-addictive-ux`

---

## 🎯 Skills Preservadas

### Workflow TDD (4 skills principales):
1. **architect-agent-skill**: Deep analysis, PRD creation, entity design
2. **test-agent-skill**: Comprehensive test suite (TDD Red phase)
3. **implementer-agent-skill**: Use case implementation (TDD Green phase)
4. **supabase-expert-skill**: Data services + RLS (TDD Green phase)
5. **ui-ux-expert-skill**: React components + E2E compliance (TDD Green phase)

### Specialists (2 skills):
6. **bug-fixer-diagnostic**: Root cause analysis, Context7 consultations
7. **ui-improver-addictive-ux**: Visual improvements, Style Guide compliance

### Meta Skills (1 skill adicional):
8. **rbac-permissions-architect**: RBAC feature design (dominio específico)

---

## 🔄 Diferencias: v2.0 vs v3.0

| Aspecto | v2.0 (Archivado) | v3.0 (Nuevo) |
|---------|------------------|--------------|
| **Implementación** | Subagentes implementan código | Thread principal implementa |
| **Rol subagentes** | Implementadores (TDD) | Planificadores + Revisores |
| **Architect** | Coordinador + Revisor | Master Planner + Coordinador + Revisor |
| **Especialización** | 5 agentes TDD + 2 specialists | 7+ expertos especializados |
| **Flujo** | Secuencial rígido (handoffs) | Flexible con checkpoints manuales |
| **Revisión** | Por iteración completa | Por checkpoint manual |
| **Paralelismo** | Limitado | Amplio (planificación paralela) |
| **Context7** | Opcional | Obligatorio en cada plan |

---

## ⚠️ Por Qué Se Archivó

### Problemas del Sistema v2.0:
1. **Subagentes implementando código**: Pérdida de contexto entre handoffs
2. **Flujo rígido secuencial**: No aprovecha paralelismo de especialistas
3. **Revisiones tardías**: Solo al final de cada fase completa
4. **Falta de especialización profunda**: Security, Performance no cubiertos
5. **Architect sobrecargado**: Coordina handoffs + revisa arquitectura

### Ventajas del Sistema v3.0:
1. **Thread principal implementa**: Contexto continuo, sin handoffs
2. **Subagentes planifican en paralelo**: Mayor eficiencia
3. **Revisiones en checkpoints**: Feedback iterativo temprano
4. **7+ especialistas**: Security, Performance, shadcn UI/UX cubiertos
5. **Architect como Master Planner**: PRD único muy específico

---

## 🚫 NO USAR ESTE SISTEMA

**Este sistema está ARCHIVADO y NO debe usarse para nuevas features.**

Para desarrollo actual, consultar:
- `.claude/agents/` (sistema v3.0 activo)
- `PRDs/WORKFLOW-V3-PLANNING.md` (nuevo flujo)
- `PLAN-REFACTORIZACION-V3.md` (plan completo)

---

## 📚 Referencias Históricas

- **Sistema v2.0 operativo:** 2025-06 a 2025-10
- **Última feature completada:** RBAC Foundation (rbac/001-foundation)
- **Total features entregadas:** ~15 features en Clean Architecture
- **Éxitos:** TDD estricto, Clean Architecture, alta cobertura de tests
- **Lecciones aprendidas:** Necesidad de planificación paralela y checkpoints flexibles

---

**Preservado para referencia histórica y aprendizaje.**
**Para consultas sobre el sistema v3.0, ver documentación actualizada en `/PRDs/`**
