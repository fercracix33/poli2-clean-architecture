# Planning Agent Creator - Assets

Assets are **templates and examples** used when creating v3.0 planning agents and their deliverables.

---

## Available Assets

### 1. **planning-agent-template.md**
**Purpose**: Base template for creating new planning agents

**When to use**: Phase 4 (Agent Body Structure) - starting a new planning agent from scratch

**How to use**:
1. Copy this template
2. Replace all `{placeholders}` with domain-specific content
3. Customize YAML frontmatter with specific examples
4. Adjust sections for domain requirements
5. Validate against checklist in SKILL.md Phase 5

**Key sections**:
- YAML frontmatter (name, description, model, color)
- IDENTITY & ROLE (planning-specific mission)
- PLANNING & REVIEW WORKFLOW v3.0
- MANDATORY SKILL INVOCATION
- QUICK REFERENCE

**Validation**: Must emphasize planning/reviewing, NOT implementing

---

### 2. **plan-document-template.md**
**Purpose**: Template for `01-plan.md` deliverables that planning agents create

**When to use**: Showing planning agents what their plan documents should look like

**How to use**:
1. Planning agents copy this structure when creating `01-plan.md`
2. Fill in domain-specific specifications
3. Include Context7 consultations
4. Define phased approach
5. Provide detailed patterns (NOT code)

**Key sections**:
- Overview and success criteria
- Context7 consultation findings
- Detailed specifications by phase
- File structure guidance
- Quality checklists
- Integration points

**Critical**: Plans contain specifications and patterns, NOT actual code

---

### 3. **review-checkpoint-template.md**
**Purpose**: Template for `review-checkpoint-N.md` deliverables that planning agents create

**When to use**: Showing planning agents how to structure review reports

**How to use**:
1. Planning agents copy this structure at checkpoints
2. Assess Claude Code's implementation
3. Document what's correct
4. Identify issues with Context7 references
5. Provide specific, actionable fixes

**Key sections**:
- Implementation assessed (scope and files)
- Correctly implemented aspects
- Issues found (with severity and fixes)
- Improvement suggestions
- Quality metrics
- Action items prioritized

**Critical**: Reviews reference specific files, lines, and Context7 best practices

---

## Usage Patterns

### For Agent Creation
```markdown
1. Use planning-agent-template.md as base
2. Customize for specific domain
3. Reference plan-document-template.md in agent instructions
4. Reference review-checkpoint-template.md in agent instructions
```

### For Agent Skills
When creating companion skills for planning agents:
- Include links to these templates
- Explain when and how to use them
- Provide domain-specific examples

---

## Customization Guidelines

### Domain-Specific Adaptations

**Backend Planning**:
- Emphasize use case orchestration
- Focus on TanStack Query patterns
- Highlight Zod validation

**Database Planning**:
- Emphasize schema and RLS
- Focus on query optimization
- Highlight migration strategies

**Frontend Planning**:
- Emphasize component hierarchy
- Focus on accessibility
- Highlight UX flows

**Security Planning**:
- Emphasize CASL + RLS alignment
- Focus on defense-in-depth
- Highlight OWASP compliance

{Similar for other domains}

---

## Template Maintenance

**When to update**:
- v3.0 workflow changes
- New sections become standard
- Review patterns evolve
- Context7 integration requirements change

**How to update**:
1. Identify what changed
2. Update template
3. Update metadata.json (last_updated)
4. Document changes in this README

---

**Last Updated**: 2025-10-29
**Maintained by**: planning-agent-creator skill
