# Context7 Queries for Agent Creation

**Last Updated**: 2025-10-24

---

## When to Consult Context7

Use Context7 to verify latest best practices when:
- Creating a new agent type not covered in existing examples
- Uncertain about YAML frontmatter conventions
- Need to verify Claude Code agent structure changes
- Want to see how other projects structure agents

---

## Pre-Built Queries

### Query 1: General Agent Best Practices

**When**: Starting any new agent creation

```bash
Context7: resolve-library-id "claude code"
# Returns: /anthropics/claude-code

Context7: get-library-docs "/anthropics/claude-code" topic="custom agents creation best practices"
```

**Expected info**:
- Agent file structure
- YAML frontmatter requirements
- Description formatting
- Example patterns

---

### Query 2: Agent Templates and Examples

**When**: Need reference implementations

```bash
Context7: resolve-library-id "claude code templates"
# Returns: /davila7/claude-code-templates

Context7: get-library-docs "/davila7/claude-code-templates" topic="agent creation yaml structure examples"
```

**Expected info**:
- Real-world agent examples
- Template structures
- Common patterns
- Best practices from community

---

### Query 3: YAML Frontmatter Validation

**When**: Unsure about frontmatter format

```bash
Context7: get-library-docs "/anthropics/claude-code" topic="yaml frontmatter agent configuration"
```

**Expected info**:
- Required fields
- Optional fields
- Format specifications
- Validation rules

---

### Query 4: Description Best Practices

**When**: Writing agent descriptions

```bash
Context7: get-library-docs "/davila7/claude-code-templates" topic="agent description examples context"
```

**Expected info**:
- How to structure descriptions
- Example formatting
- When to trigger agents
- Commentary patterns

---

### Query 5: Color Conventions

**When**: Choosing agent color

```bash
Context7: get-library-docs "/anthropics/claude-code" topic="agent color coding conventions"
```

**Expected info**:
- Color meanings
- Visual organization
- UI considerations

---

## Refresh Workflow

If agent best practices change:

1. **Check for updates**:
```bash
Context7: get-library-docs "/anthropics/claude-code" topic="agent creation latest changes"
```

2. **Update references**:
   - Update `agent-structure.md` if structure changed
   - Update `yaml-frontmatter-guide.md` if frontmatter changed
   - Update `color-conventions.md` if colors changed

3. **Test with real agent**:
   - Create test agent using updated practices
   - Verify it works in Claude Code
   - Update this file with any learnings

---

## Query Strategy

**General principle**: Query early, iterate based on results

**Pattern**:
1. Query general best practices first
2. Query specific examples if needed
3. Query validation/troubleshooting if issues arise

**Don't over-query**: If existing references are sufficient, skip Context7.

---

**Maintained by**: Agent Creator Skill
