# Agent Creator Skill - Scripts

Automation scripts for agent creation, validation, and initialization.

## Available Scripts

### 1. **validate-agent.sh** - Agent Validation Script
**Purpose**: Validate Claude Code agent structure and YAML frontmatter

**Usage**:
```bash
./scripts/validate-agent.sh path/to/agent.md
```

**Checks**:
- ✅ YAML frontmatter exists and is valid
- ✅ Required fields (name, description, model, color)
- ✅ Name is kebab-case format
- ✅ Description starts with "Use this agent when..."
- ✅ Description contains 2+ examples with commentary
- ✅ Color is valid
- ✅ All required sections present
- ✅ File length is reasonable (~80-250 lines)

**Exit codes**:
- `0` - Validation passed (no errors)
- `1` - Validation failed (errors found)

**Example output**:
```
🔍 Validating agent: .claude/agents/test-architect.md

✅ YAML frontmatter detected

📋 Checking required YAML fields...
  ✅ name: test-architect (valid kebab-case)
  ✅ description starts with 'Use this agent when...'
  ✅ description contains 2 examples
  ✅ description includes <commentary> tags
  ✅ model: sonnet (recommended)
  ✅ color: blue (valid)

📐 Checking agent structure sections...
  ✅ Found: # IDENTITY & ROLE
  ✅ Found: ## Core Mission
  ✅ Found: ## Authority & Boundaries
  ✅ Found: # ITERATIVE WORKFLOW v2.0
  ✅ Found: ## Your Workspace
  ✅ Found: # 🎯 MANDATORY SKILL INVOCATION
  ✅ Found: # QUICK REFERENCE
  ✅ Contains skill invocation pattern

📏 Agent file metrics:
  Lines: 147
  ✅ Length is reasonable (80-250 lines)

═══════════════════════════════════════
✅ VALIDATION PASSED - Agent is valid!
```

---

### 2. **init-agent.sh** - Agent Initialization Script
**Purpose**: Initialize a new Claude Code agent from template

**Usage**:
```bash
./scripts/init-agent.sh <agent-name> <color> "<role-description>"
```

**Example**:
```bash
./scripts/init-agent.sh security-auditor purple "Security review and vulnerability scanning"
```

**Available colors**:
- `red` - Architect/Chief roles
- `blue` - Testing/QA roles
- `yellow` - Implementation roles
- `green` - Data/Database roles
- `pink` - UI/UX roles
- `purple` - Security/Review roles
- `orange` - DevOps/Infrastructure roles
- `gray` - Utility/Helper roles

**What it does**:
1. Validates agent name is kebab-case
2. Validates color is valid
3. Creates agent file from template
4. Replaces basic placeholders
5. Provides next steps guidance
6. Optionally opens file in editor

**Created file location**: `.claude/agents/{agent-name}.md`

**Next steps after running**:
1. Edit agent file and replace FILL_THIS placeholders
2. Add 2-3 examples to YAML description
3. Complete Core Mission section
4. Define Authority & Boundaries
5. Run validation: `./scripts/validate-agent.sh .claude/agents/{agent-name}.md`
6. Create skill structure

---

## Script Requirements

**Dependencies**:
- `bash` (version 4.0+)
- `grep`, `sed`, `awk` (standard Unix utilities)
- `wc` for line counting

**Optional**:
- `code` (VS Code CLI) for automatic file opening
- `nano` for in-terminal editing

**Platform compatibility**:
- ✅ Linux
- ✅ macOS
- ✅ Windows (WSL, Git Bash, or Cygwin)

---

## Common Use Cases

### Creating a new agent from scratch
```bash
# Initialize agent
./scripts/init-agent.sh data-migrator orange "Database migration and data transformation"

# Edit the created file
# (script will open in VS Code if available)

# Validate
./scripts/validate-agent.sh .claude/agents/data-migrator.md
```

### Validating existing agent after edits
```bash
# Make changes to agent file
vim .claude/agents/test-architect.md

# Validate
./scripts/validate-agent.sh .claude/agents/test-architect.md

# Fix any errors reported
# Re-validate until passing
```

### Batch validation of all agents
```bash
# Validate all agents in directory
for agent in .claude/agents/*.md; do
  echo "Validating $agent..."
  ./scripts/validate-agent.sh "$agent" || echo "❌ Failed: $agent"
done
```

---

**Last Updated**: 2025-10-24
