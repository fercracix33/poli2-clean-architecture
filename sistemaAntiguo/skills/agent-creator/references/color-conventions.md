# Agent Color Conventions

**Last Updated**: 2025-10-24

---

## Purpose

Colors provide visual identification of agent roles in Claude Code UI. Use consistent colors to help users quickly identify agent types.

---

## Color Mapping by Role

| Color | Role Type | Examples | Reasoning |
|-------|-----------|----------|-----------|
| **red** | Chief/Architect roles | architect-agent | Authority, leadership |
| **blue** | Testing/QA roles | test-architect | Reliability, trust |
| **yellow** | Implementation roles | implementer-agent | Caution, construction |
| **green** | Data/Database roles | supabase-data-specialist | Growth, data |
| **pink** | UI/UX roles | ui-ux-expert | Creativity, design |
| **purple** | Security/Review roles | security-auditor, bug-fixer | Protection, inspection |
| **orange** | DevOps/Infrastructure | devops-engineer | Energy, deployment |
| **gray** | Utility/Helper roles | file-organizer | Neutral, support |

---

## Usage Guidelines

### When Choosing a Color

1. **Match primary role**: Choose color that best represents agent's main function
2. **Be consistent**: Similar agents should use similar colors
3. **Consider hierarchy**: Chief roles use stronger colors (red, purple)
4. **Think visually**: Users will see multiple agents at once

### Examples

**✅ Good Color Choices**:
```yaml
# Architect role → red (leadership)
name: architect-agent
color: red

# Testing role → blue (reliability)
name: test-architect
color: blue

# UI/UX role → pink (creativity)
name: ui-ux-expert
color: pink
```

**❌ Bad Color Choices**:
```yaml
# Testing role with orange (wrong domain)
name: test-architect
color: orange

# Multiple unrelated agents with same color
name: database-expert
color: yellow  # Should be green

name: implementer
color: yellow  # Correct, but confusing with database-expert
```

---

## Available Colors

Based on Claude Code documentation:

- `red`
- `blue`
- `yellow`
- `green`
- `pink`
- `purple`
- `orange`
- `gray`
- `brown`
- `cyan`
- `magenta`

**Recommendation**: Stick to primary colors (red, blue, yellow, green, pink, purple, orange) for clarity.

---

## Multi-Role Agents

If an agent serves multiple roles, choose the color of the **primary** role:

**Example**: Agent that does both testing and implementation
- **Primary role**: Testing
- **Secondary role**: Implementation
- **Color choice**: `blue` (testing takes precedence)

```yaml
name: test-and-implement
description: Tests first, then implements fixes
color: blue  # Primary is testing
```

---

## Validation

Before finalizing color choice:

- [ ] Color matches agent's primary role
- [ ] Color is consistent with similar agents
- [ ] Color is in the available colors list
- [ ] Color choice is documented in agent frontmatter

---

**Maintained by**: Agent Creator Skill
