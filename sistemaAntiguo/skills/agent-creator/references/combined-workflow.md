# Combined Workflow: Agent-Creator + Skill-Creator

**Last Updated**: 2025-10-24

---

## Overview

The agent-creator and skill-creator skills work together to create complete agent + skill packages following Anthropic best practices.

---

## Complete Workflow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    USER REQUEST                                 │
│  "Create a security-auditor agent for vulnerability scanning"  │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  PHASE 1: AGENT-CREATOR                         │
│                  (This Skill - 6 Phases)                        │
└────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 1: Discovery & Analysis       │
        │ - Understand agent purpose          │
        │ - Define triggers and boundaries    │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 2: Context7 Research 🔍       │
        │ - Query /anthropics/claude-code     │
        │ - Verify latest best practices      │
        │ - Check YAML requirements           │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 3: YAML Frontmatter Design    │
        │ - Create name, description, model   │
        │ - Add 2-3 examples with commentary  │
        │ - Choose appropriate color          │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 4: Agent Body Structure       │
        │ - Use agent-minimal-template.md     │
        │ - Complete 4 required sections      │
        │ - Keep to ~150 lines                │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 5: Validation & Testing       │
        │ - Run validate-agent.sh             │
        │ - Manual checklist validation       │
        │ - Fix errors and warnings           │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 6: Skill Scaffold Creation    │
        │ - Create skill directory structure  │
        │ - Generate metadata.json            │
        │ - Prepare README files              │
        │ - 🎯 HANDOFF TO SKILL-CREATOR       │
        └─────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  DELIVERABLES (Phase 1)                         │
│  ✅ .claude/agents/security-auditor.md (~150 lines)            │
│  ✅ .claude/skills/security-auditor-skill/ (structure only)    │
│  ✅ metadata.json with agent reference                         │
│  ✅ README.md files in subdirectories                          │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              🎯 AUTOMATIC HANDOFF                               │
│                                                                 │
│  Agent-creator provides to skill-creator:                      │
│  - Agent name: security-auditor                                │
│  - Color: purple                                               │
│  - Role: Security review and vulnerability scanning            │
│  - Responsibilities: [from agent authorities]                  │
│  - Technologies: OWASP, npm audit, Snyk                        │
│  - MCPs: context7, chrome-devtools                             │
│                                                                 │
│  Command: Skill: skill-creator                                 │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  PHASE 2: SKILL-CREATOR                         │
│                  (Companion Skill - 6 Phases)                   │
└────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 1: Analyze Examples           │
        │ - Review existing agent skills      │
        │ - Identify patterns                 │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 2: Plan Resources             │
        │ - Define reference documents        │
        │ - Plan automation scripts           │
        │ - Identify asset templates          │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 3: Initialize Structure       │
        │ - Verify existing structure         │
        │ - Update metadata.json              │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 4: Create References 🔍       │
        │ - Query Context7 for technologies   │
        │ - Write technology-specific guides  │
        │ - Create best practices catalogs    │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 5: Write SKILL.md             │
        │ - Create 6-phase workflow           │
        │ - Define Context7 checkpoints       │
        │ - Add MCP integration workflows     │
        └─────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ Phase 6: Package & Validate         │
        │ - Update metadata.json counts       │
        │ - Validate skill structure          │
        │ - Create final documentation        │
        └─────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  DELIVERABLES (Phase 2)                         │
│  ✅ SKILL.md with complete 6-phase workflow                    │
│  ✅ references/owasp-top10.md                                  │
│  ✅ references/security-checklist.md                           │
│  ✅ references/vulnerability-patterns.md                       │
│  ✅ scripts/scan-dependencies.sh                               │
│  ✅ assets/audit-report-template.md                            │
│  ✅ Updated metadata.json with accurate counts                 │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  🎉 COMPLETE PACKAGE                            │
│                                                                 │
│  📁 .claude/agents/security-auditor.md                         │
│     - Identity, role, boundaries                               │
│     - Mandatory skill invocation                               │
│     - ~150 lines                                               │
│                                                                 │
│  📁 .claude/skills/security-auditor-skill/                     │
│     ├── SKILL.md (complete workflow)                           │
│     ├── references/ (4 documents)                              │
│     ├── scripts/ (automation)                                  │
│     └── assets/ (templates)                                    │
│                                                                 │
│  ✅ Ready to use in Claude Code                                │
│  ✅ Follows Anthropic best practices                           │
│  ✅ Complete documentation                                     │
│  ✅ Validated and tested                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## Key Integration Points

### 1. Metadata Consistency

**Agent .md YAML frontmatter**:
```yaml
---
name: security-auditor
description: Use this agent when...
model: sonnet
color: purple
---
```

**Skill metadata.json**:
```json
{
  "name": "security-auditor-skill",
  "agent": "security-auditor",
  "description": "Technical workflow for security-auditor agent",
  ...
}
```

Both reference each other, ensuring consistency.

### 2. Skill Invocation Pattern

**Agent .md** includes:
```markdown
# 🎯 MANDATORY SKILL INVOCATION

**CRITICAL**: Before ANY work, invoke your technical skill:

\```
Skill: security-auditor-skill
\```
```

**Skill SKILL.md** provides the complete workflow the agent executes.

### 3. Context Propagation

Information flows from agent-creator → skill-creator:

```
User provides:
  "Create security-auditor for vulnerability scanning"

Agent-creator extracts:
  - Agent name: security-auditor
  - Color: purple (security role)
  - Role: Security review and vulnerability scanning

Agent-creator infers:
  - Technologies: Security tools (OWASP, scanners)
  - MCPs: context7, chrome-devtools
  - Responsibilities: [from agent authorities]

Skill-creator receives ALL of this context automatically
```

### 4. Progressive Disclosure

```
Initial query → Agent .md
                ↓
         Skill invocation
                ↓
         SKILL.md (workflow)
                ↓
         References (on demand)
```

User sees minimal agent file, skill provides depth when needed.

---

## Benefits of Combined Workflow

### For Agent Creators

1. **Single request**: "Create X agent" → complete package
2. **No coordination**: Skills handle handoff automatically
3. **Consistency**: Both follow same architectural patterns
4. **Completeness**: Never forget to create the skill

### For System Architecture

1. **Separation of concerns**: Identity vs technical procedures
2. **Maintainability**: Update skill without touching agent
3. **Reusability**: Skill patterns apply to multiple agent types
4. **Validation**: Cross-validation between agent and skill

### For End Users

1. **Clarity**: Agent file is concise and readable
2. **Depth**: Skill provides detailed technical guidance
3. **Discovery**: Progressive disclosure pattern
4. **Quality**: Both skills consult Context7 for best practices

---

## Common Patterns

### Pattern 1: Create New Agent Type

```
User: "Create a data-migrator agent"
      ↓
Agent-creator: Creates minimal agent + skill structure
      ↓
Skill-creator: Populates skill with migration workflows
      ↓
Result: Complete data-migrator agent + skill
```

### Pattern 2: Refactor Existing Agent

```
User: "Refactor architect-agent to minimal structure"
      ↓
Agent-creator: Extracts identity, creates new minimal agent
      ↓
Skill-creator: Moves technical content to architect-skill
      ↓
Result: 2078 lines → 150 lines agent + comprehensive skill
```

### Pattern 3: Add Capability to Existing Agent

```
User: "Add RLS validation to supabase-agent"
      ↓
(Agent .md stays unchanged - just identity)
      ↓
Skill-creator: Updates supabase-agent-skill with RLS workflows
      ↓
Result: Agent unchanged, skill enhanced
```

---

## Troubleshooting

### Issue: Skills don't coordinate

**Solution**: Ensure agent-creator Phase 6 completes before invoking skill-creator.

### Issue: Metadata mismatch

**Solution**: Agent-creator sets `"agent": "{agent-name}"` in metadata.json, skill-creator validates this matches.

### Issue: Missing context in handoff

**Solution**: Agent-creator Phase 1-5 should extract ALL necessary context before Phase 6 handoff.

### Issue: Skill overrides agent identity

**Solution**: Skill-creator should NEVER modify agent .md file, only populate skill/ directory.

---

## Future Enhancements

1. **Fully automated handoff**: Single command triggers both skills sequentially
2. **Validation integration**: Cross-validate agent and skill reference each other correctly
3. **Update propagation**: Changes to agent automatically suggest skill updates
4. **Batch creation**: Create multiple agent + skill packages at once

---

**Maintained by**: Agent Creator Skill + Skill Creator Skill (collaborative)
