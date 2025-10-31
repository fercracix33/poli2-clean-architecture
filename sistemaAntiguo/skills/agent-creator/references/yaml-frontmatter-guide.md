# YAML Frontmatter Guide

**Last Updated**: 2025-10-24

---

## Required Structure

```yaml
---
name: agent-name
description: Use this agent when {trigger}. Specializes in {expertise}. Examples: <example>Context: {situation} user: '{request}' assistant: '{response}' <commentary>{reasoning}</commentary></example>
model: sonnet
color: {color}
---
```

---

## Field Specifications

### `name` (REQUIRED)

**Format**: lowercase-with-hyphens

**Rules**:
- Use kebab-case (lowercase with hyphens)
- Be descriptive and concise
- Match the agent's primary role

**Examples**:
```yaml
name: architect-agent        # ✅ GOOD
name: test-architect         # ✅ GOOD
name: ArchitectAgent         # ❌ BAD - Not kebab-case
name: arch                   # ❌ BAD - Too vague
```

---

### `description` (REQUIRED)

**Format**: Trigger + Specialization + Examples

**Structure**:
```
Use this agent when {trigger scenario}. Specializes in {key areas}.
Examples: <example>Context: {situation} user: '{user request}'
assistant: '{assistant response}' <commentary>{reasoning}</commentary></example>
```

**Rules**:
1. **Start with trigger**: "Use this agent when..."
2. **State specialization**: "Specializes in..."
3. **Include 2-3 examples**: Each with Context, user, assistant, commentary
4. **Examples must use XML tags**: `<example>`, `<commentary>`

**Complete Example**:
```yaml
description: Use this agent when you need to create comprehensive test suites that define the complete specification for a feature BEFORE any implementation begins. This agent should be invoked immediately after the Architect has created the PRD, entities, and directory structure. The agent creates failing tests for all layers (use cases, services, APIs) that serve as the living specification for what must be implemented.

Examples:
<example>
Context: The Architect has just delivered a PRD for a new task creation feature with entities and directory structure.
user: "The architect has finished the PRD for task creation. Now we need to define the tests."
assistant: "I'll use the test-architect agent to create the complete test suite that will define what needs to be implemented."
<commentary>
Since the architect has completed the PRD and structure, use the test-architect agent to create failing tests that will serve as the specification.
</commentary>
</example>
<example>
Context: A new authentication feature needs test specifications before implementation.
user: "We have the authentication PRD ready with user entities defined. Time for the test phase."
assistant: "Let me invoke the test-architect agent to create the comprehensive test suite for all authentication layers."
<commentary>
The PRD is complete, so the test-architect agent should create tests that define the expected behavior.
</commentary>
</example>
```

**Why examples matter**:
- Claude Code uses descriptions to decide which agent to invoke
- Good examples teach Claude when to use the agent
- Commentary explains the reasoning

---

### `model` (REQUIRED)

**Format**: Model name

**Current valid values**:
```yaml
model: sonnet    # ✅ Default - Use for all agents
model: opus      # Available but not recommended
```

**Recommendation**: Always use `sonnet` unless specific reasoning for opus.

---

### `color` (REQUIRED)

**Format**: Color name

**Purpose**: Visual identification in Claude Code UI

**Valid colors & conventions**:
```yaml
color: red       # Architect (chief roles)
color: blue      # Test/QA roles
color: yellow    # Implementation roles
color: green     # Data/Database roles
color: pink      # UI/UX roles
color: purple    # Security/Review roles
color: orange    # DevOps/Infrastructure roles
```

See `color-conventions.md` for complete guide.

---

## Validation Checklist

Before saving agent, verify:

- [ ] `name` is in kebab-case (lowercase-with-hyphens)
- [ ] `description` starts with "Use this agent when..."
- [ ] `description` includes "Specializes in..."
- [ ] `description` has 2-3 `<example>` blocks
- [ ] Each example has `Context:`, `user:`, `assistant:`, `<commentary>`
- [ ] `model` is set to `sonnet`
- [ ] `color` matches agent role convention
- [ ] YAML is valid (no syntax errors)

---

## Common YAML Errors

**Error 1: Invalid YAML syntax**
```yaml
---
description: This has a colon: which breaks YAML
---
```
**Fix**: Wrap in quotes
```yaml
---
description: "This has a colon: which is now safe"
---
```

**Error 2: Missing examples**
```yaml
description: Use this agent for testing.
```
**Fix**: Add examples with XML structure
```yaml
description: Use this agent for testing. Examples: <example>Context: ... user: '...' assistant: '...' <commentary>...</commentary></example>
```

**Error 3: Improper nesting**
```yaml
---
name:
  architect-agent
---
```
**Fix**: Use inline format
```yaml
---
name: architect-agent
---
```

---

## Testing Your YAML

**Quick validation**:
```bash
# Check YAML syntax
python -c "import yaml; yaml.safe_load(open('.claude/agents/your-agent.md').read().split('---')[1])"
```

If no error, YAML is valid.
