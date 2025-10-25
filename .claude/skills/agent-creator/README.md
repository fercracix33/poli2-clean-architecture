# Agent Creator Skill

> **Purpose**: Guide creation and refactoring of Claude Code agents following Anthropic official best practices.

**Version**: 1.0.0
**Last Updated**: 2025-10-24
**Author**: Agent Creator Skill (self-referential)

---

## 📋 Quick Start

### Creating a New Agent (Complete Workflow)

```bash
# PHASE 1: Create Agent with agent-creator
Skill: agent-creator

User: "Create a security-auditor agent for vulnerability scanning"

[Agent-creator executes 6 phases]
✅ Created: .claude/agents/security-auditor.md (~150 lines)
✅ Created: .claude/skills/security-auditor-skill/ (structure)

# PHASE 2: Populate Skill with skill-creator (AUTOMATIC HANDOFF)
[Agent-creator automatically suggests:]

Skill: skill-creator

Agent: security-auditor
Role: Security review and vulnerability scanning
Technologies: OWASP, npm audit, Snyk
MCPs: context7, chrome-devtools

[Skill-creator executes 6 phases]
✅ Created: SKILL.md with 6-phase workflow
✅ Created: references/ with security best practices
✅ Created: scripts/ with vulnerability scanning automation
✅ Created: assets/ with audit report templates

# RESULT: Complete agent + skill package ready to use
```

**Alternative: Quick Start with Scripts**

```bash
# 1. Initialize from template
./scripts/init-agent.sh security-auditor purple "Security review and vulnerability scanning"

# 2. Edit the created file (.claude/agents/security-auditor.md)
# Replace FILL_THIS placeholders
# Add 2-3 examples to YAML description
# Complete Core Mission, Authority & Boundaries

# 3. Validate
./scripts/validate-agent.sh .claude/agents/security-auditor.md

# 4. Agent-creator will suggest invoking skill-creator
# Follow the handoff instructions to complete the skill
```

### Refactoring an Existing Agent

```bash
# 1. Backup current agent
cp .claude/agents/old-agent.md .claude/agents/old-agent.md.backup

# 2. Extract identity (who, what can/cannot do)
# Extract technical content (workflows, examples, references)

# 3. Create minimal agent using template
# Move identity to new agent file (~150 lines)

# 4. Validate
./scripts/validate-agent.sh .claude/agents/old-agent.md

# 5. Create skill with technical content
# Use skill-creator for SKILL.md
# Move workflows → SKILL.md
# Move references → references/
# Move examples → assets/
```

---

## 📁 Structure

```
agent-creator/
├── README.md                       # This file
├── SKILL.md                        # Main skill workflow (6 phases)
├── metadata.json                   # Skill metadata
│
├── references/                     # Load on demand
│   ├── README.md                  # Reference catalog
│   ├── agent-structure.md         # Complete agent template breakdown
│   ├── yaml-frontmatter-guide.md  # YAML validation rules
│   ├── context7-queries.md        # Pre-built Context7 queries
│   └── color-conventions.md       # Color coding by role
│
├── scripts/                        # Automation
│   ├── README.md                  # Script documentation
│   ├── init-agent.sh              # Initialize new agent
│   └── validate-agent.sh          # Validate agent structure
│
└── assets/                         # Templates & examples
    ├── README.md                  # Asset catalog
    ├── agent-minimal-template.md  # Base agent template
    └── yaml-examples.yml          # Working YAML examples
```

---

## 🔄 Synergy with Skill-Creator

### Combined Workflow

This skill is designed to work seamlessly with the `skill-creator` skill:

```
┌─────────────────────────────────────────┐
│  AGENT-CREATOR (This Skill)             │
│  Creates: Agent .md (~150 lines)        │
│  Creates: Skill structure (empty)       │
└─────────────────────────────────────────┘
                 ↓ HANDOFF
┌─────────────────────────────────────────┐
│  SKILL-CREATOR                          │
│  Populates: SKILL.md (workflow)         │
│  Populates: references/ (best practices)│
│  Populates: scripts/ (automation)       │
│  Populates: assets/ (templates)         │
└─────────────────────────────────────────┘
                 ↓
        COMPLETE PACKAGE
  Agent + Skill ready for use
```

### Automatic Handoff (Phase 6)

At the end of Phase 6, agent-creator automatically:

1. ✅ Creates skill directory structure
2. ✅ Generates metadata.json template
3. ✅ Prepares handoff parameters for skill-creator
4. 🎯 **Suggests invoking skill-creator** with all necessary context

**You provide once**, both skills coordinate:
- Agent name, color, role
- Primary responsibilities
- Technologies involved
- Required MCP integrations

**Result**: Consistent, complete agent + skill package following Anthropic best practices.

### Benefits

1. **No manual coordination**: Agent-creator prepares everything skill-creator needs
2. **Consistency**: Both skills follow the same architectural patterns
3. **Completeness**: Ensures you don't forget to create the skill
4. **Efficiency**: Reuses structure created by agent-creator
5. **Validation**: Skills validate each other's outputs

---

## 🎯 Core Principles

### Agent Architecture Philosophy

**Minimal agents (~150 lines)**:
- Identity and role
- Authority and boundaries
- Workspace isolation
- Mandatory skill invocation
- Quick reference

**Comprehensive skills**:
- Technical workflows (6 phases)
- Context7 checkpoints (mandatory)
- MCP integrations
- Best practices
- References (loaded on demand)

### Progressive Disclosure Pattern

```
Metadata (metadata.json)
    ↓
Agent .md (~150 lines) - Identity, role, skill invocation
    ↓
SKILL.md - Complete workflow, procedures
    ↓
References (on demand) - Detailed technical guidance
```

**Don't load everything upfront**. Agent invokes skill, skill references specific documents as needed.

---

## 📖 Using the Skill

### Invoke from Main Conversation

```
User: "Create a new security-auditor agent"
Assistant: "I'll use the agent-creator skill to build this agent following Anthropic best practices"

[Invokes agent-creator skill]
```

### 6-Phase Workflow

1. **Discovery & Analysis**
   - Understand agent's purpose and role
   - Define triggers, authorities, prohibitions

2. **Context7 Research** (MANDATORY)
   - Query `/anthropics/claude-code` for latest practices
   - Verify YAML frontmatter requirements
   - Check for structural changes

3. **YAML Frontmatter Design**
   - Create valid frontmatter (name, description, model, color)
   - Include 2-3 examples with commentary
   - Validate with checklist

4. **Agent Body Structure**
   - Use `assets/agent-minimal-template.md`
   - Complete 4 required sections
   - Keep to ~150 lines

5. **Validation & Testing**
   - Run `scripts/validate-agent.sh`
   - Manual validation checklist
   - Fix errors and warnings

6. **Skill Scaffold Creation**
   - Create skill directory structure
   - Prepare for content with skill-creator
   - Document references and scripts

---

## 🛠️ Utilities

### Scripts

**`scripts/init-agent.sh`**
```bash
./scripts/init-agent.sh <agent-name> <color> "<role-description>"
```
- Creates agent from template
- Validates naming conventions
- Guides next steps

**`scripts/validate-agent.sh`**
```bash
./scripts/validate-agent.sh path/to/agent.md
```
- Validates YAML frontmatter
- Checks required sections
- Verifies file structure
- Reports errors and warnings

### References (Load on Demand)

- **`agent-structure.md`** - Section-by-section breakdown
- **`yaml-frontmatter-guide.md`** - YAML validation rules
- **`context7-queries.md`** - Pre-built queries for best practices
- **`color-conventions.md`** - Color selection guide

### Assets

- **`agent-minimal-template.md`** - Copy-paste template
- **`yaml-examples.yml`** - 5 working examples by role type

---

## ✅ Success Criteria

Agent is complete when:
- [ ] YAML frontmatter is valid
- [ ] Agent file is 80-250 lines
- [ ] All required sections present
- [ ] Boundaries are specific and actionable
- [ ] Skill invocation is mandatory
- [ ] `validate-agent.sh` passes
- [ ] Skill structure created
- [ ] Agent triggers as expected

---

## 🔄 Update Policy

**Refresh references when**:
- Anthropic releases major Claude Code updates
- YAML frontmatter format changes
- New best practices emerge
- Common mistakes identified

**How to refresh**:
```bash
# Query latest Anthropic docs
mcp__context7__resolve-library-id "claude code"
mcp__context7__get-library-docs "/anthropics/claude-code" topic="agent creation latest changes"

# Update affected references
# Test with validation script
# Update metadata.json last_updated
```

---

## 📚 Related Resources

- **Official**: Anthropic Claude Code docs (`/anthropics/claude-code` via Context7)
- **Community**: Claude Code templates (`/davila7/claude-code-templates` via Context7)
- **Project**: Iterative workflow (`.claude/agents/README-ITERATIVE-V2.md`)
- **Companion**: Skill Creator (`skill-creator` skill)

---

## 🐛 Troubleshooting

### "YAML parsing error"
- Check for unescaped colons in description
- Wrap description in quotes if it contains special characters
- Validate with: `python -c "import yaml; yaml.safe_load(open('agent.md').read().split('---')[1])"`

### "Agent not triggering in Claude Code"
- Verify YAML frontmatter has `name` and `description`
- Ensure description has clear trigger scenarios
- Add more specific examples with commentary
- Restart Claude Code to reload agents

### "Validation script fails"
- Check that all required sections are present
- Verify name is kebab-case
- Ensure description starts with "Use this agent when..."
- Confirm color is valid (see color-conventions.md)

### "Agent file too long"
- Extract technical procedures → move to SKILL.md
- Extract code examples → move to assets/
- Extract reference docs → move to references/
- Keep only identity, boundaries, and skill invocation

---

**Questions?** Consult `SKILL.md` for complete workflow or invoke the skill directly:
```
Skill: agent-creator
```
