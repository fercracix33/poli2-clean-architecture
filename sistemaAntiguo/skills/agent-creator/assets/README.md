# Agent Creator Skill - Assets

Templates, examples, and reference materials for agent creation.

## Available Assets

### 1. **agent-minimal-template.md** - Complete Agent Template
**Purpose**: Base template for creating new Claude Code agents

**Usage**: Copy this file as starting point for new agents, or use `scripts/init-agent.sh` which automates the process.

**Structure** (~150 lines):
```
YAML frontmatter (name, description, model, color)
↓
# IDENTITY & ROLE
  - You are the **{Title}**
  - Core Mission (2-3 paragraphs)
  - Authority & Boundaries (can/cannot do)
↓
# ITERATIVE WORKFLOW v2.0
  - Isolated workspace
  - File access permissions
↓
# 🎯 MANDATORY SKILL INVOCATION
  - Skill invocation requirement
  - What the skill provides
↓
# QUICK REFERENCE
  - Triggers, deliverables, success metrics
```

**Placeholders to replace**:
- `{agent-name}` - Kebab-case agent name
- `{color}` - Visual identification color
- `{Agent Title}` - Capitalized agent title
- `{one-sentence mission}` - Brief mission statement
- `{trigger scenario}` - When to use this agent
- `{key expertise areas}` - Agent specializations
- `{domain}` - Feature domain
- `{feature}` - Feature name
- `{Specific responsibility X}` - Exclusive authorities
- `{Specific prohibition X}` - Strict limitations

**Manual creation**:
```bash
# Copy template
cp .claude/skills/agent-creator/assets/agent-minimal-template.md .claude/agents/new-agent.md

# Replace all placeholders
# Add 2-3 examples to YAML description
# Validate
./scripts/validate-agent.sh .claude/agents/new-agent.md
```

**Automated creation**: Use `scripts/init-agent.sh` instead (recommended)

---

### 2. **yaml-examples.yml** - Working YAML Frontmatter Examples
**Purpose**: Reference examples of valid YAML frontmatter for different agent types

**Contents**:
1. **Architect Agent** (Chief role, red color)
2. **Test Architect** (Testing role, blue color)
3. **UI/UX Expert** (Creative role, pink color)
4. **Bug Fixer** (Review role, purple color)
5. **Supabase Data Specialist** (Data role, green color)

**Each example shows**:
- ✅ Proper kebab-case naming
- ✅ Complete description with "Use this agent when..."
- ✅ 2 examples with Context, user, assistant, commentary
- ✅ Correct model and color

**How to use**:
1. Find example closest to your new agent's role
2. Copy the YAML structure
3. Modify description and examples for your agent
4. Adjust name and color to match your agent
5. Validate with `scripts/validate-agent.sh`

**Example extraction**:
```bash
# View specific example
grep -A 10 "Example 1: Architect" .claude/skills/agent-creator/assets/yaml-examples.yml

# Copy to new agent file
# Then customize for your needs
```

---

## Asset Update Policy

Assets should be updated when:
- ✅ Anthropic changes agent structure requirements
- ✅ New YAML fields are added or required
- ✅ Best practices evolve through community feedback
- ✅ Common patterns emerge from created agents
- ✅ Template improvements identified through usage

Check Context7 quarterly or after major Claude Code updates:
```bash
mcp__context7__get-library-docs "/anthropics/claude-code" topic="agent template changes"
```

---

## Future Assets (Candidates for Addition)

As the skill evolves, consider adding:
- **agent-refactoring-checklist.md** - Step-by-step refactoring guide
- **skill-structure-diagram.png** - Visual of agent + skill architecture
- **common-mistakes.md** - Catalog of frequent errors and fixes
- **agent-workflow-flowchart.svg** - Decision tree for agent triggers

---

**Last Updated**: 2025-10-24
