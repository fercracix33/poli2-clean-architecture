# Planning Agent Creator - References

References are loaded **on demand** when specific guidance is needed for creating v3.0 planning agents.

---

## Available References

### 1. **planning-workflow-v3.md**
**When to consult**: Understanding the complete v3.0 workflow and how planning agents fit

**Contains**:
- Complete v3.0 workflow with step-by-step diagrams
- v2.0 vs v3.0 comparison table
- Planning agent responsibilities
- Review phase workflows
- File structure examples
- Success metrics

**Use when**: Creating agents or explaining v3.0 system to users

---

### 2. **agent-types-matrix.md**
**When to consult**: Selecting agent type or understanding domain responsibilities

**Contains**:
- Complete matrix of all 7 specialist types
- Detailed specifications per agent type
- Technologies, MCPs, and Context7 queries per domain
- Workflow positioning (sequential vs parallel)
- Common patterns across all agents

**Use when**: Deciding which type of planning agent to create

---

### 3. **yaml-examples.yml**
**When to consult**: Writing YAML frontmatter for planning agents

**Contains**:
- Complete YAML examples for all 7 agent types
- Planning + Reviewing example patterns
- Validation checklists
- Common YAML mistakes to avoid

**Use when**: In Phase 3 (YAML Frontmatter Design)

---

### 4. **context7-integration.md**
**When to consult**: Integrating Context7 consultations into planning agents

**Contains**:
- Why Context7 is mandatory
- When to consult (creation, planning, review)
- Pre-built query patterns by agent type
- Query construction patterns
- Documenting Context7 findings
- Error handling strategies

**Use when**: In Phase 2 (Context7 Research) or explaining Context7 requirements

---

## Update Policy

References should be refreshed when:
- v3.0 workflow changes
- New agent types are added
- Context7 best practices evolve
- YAML frontmatter requirements change
- Common mistakes are identified

---

## Loading Strategy

**Progressive disclosure principle**: Don't load all references upfront.

1. **SKILL.md** mentions references by name
2. Agent loads specific reference when needed
3. References are self-contained and complete

**Example**:
```markdown
For complete workflow details, see references/planning-workflow-v3.md
```

Agent then reads that file only when workflow details are needed.

---

**Last Updated**: 2025-10-29
**Maintained by**: planning-agent-creator skill
