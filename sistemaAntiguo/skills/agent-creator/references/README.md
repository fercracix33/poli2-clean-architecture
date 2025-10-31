# Agent Creator Skill - References

References are loaded **on demand** when specific technical guidance is needed during agent creation.

## Available References

### 1. **combined-workflow.md** - Agent-Creator + Skill-Creator Integration
- **When to consult**: Understanding how agent-creator and skill-creator work together
- **Contains**:
  - Complete workflow diagram (both skills)
  - Automatic handoff mechanism (Phase 6)
  - Context propagation between skills
  - Integration patterns and benefits
  - Troubleshooting common coordination issues
- **Context7 equivalent**: N/A (project-specific integration)

### 2. **agent-structure.md** - Complete Agent Template Structure
- **When to consult**: Creating or refactoring agent files, understanding required sections
- **Contains**:
  - Standard ~150 line agent structure
  - Section-by-section breakdown
  - Common mistakes to avoid
  - Validation tips
- **Context7 equivalent**: `get-library-docs "/anthropics/claude-code" topic="agent file structure"`

### 2. **yaml-frontmatter-guide.md** - YAML Validation & Best Practices
- **When to consult**: Writing YAML frontmatter, debugging YAML syntax errors
- **Contains**:
  - Required field specifications
  - Description structure with examples
  - Validation checklist
  - Common YAML errors and fixes
  - Testing methods
- **Context7 equivalent**: `get-library-docs "/anthropics/claude-code" topic="yaml frontmatter agent configuration"`

### 3. **context7-queries.md** - Pre-Built Context7 Queries
- **When to consult**: Need to verify latest Anthropic best practices, unsure about current conventions
- **Contains**:
  - 5 pre-built query patterns for agent creation
  - When to consult Context7
  - Refresh workflow for updating references
  - Query strategy guidelines
- **Context7 equivalent**: Meta-reference for querying Context7 itself

### 4. **color-conventions.md** - Agent Color Coding System
- **When to consult**: Choosing color for new agent, understanding visual organization
- **Contains**:
  - Color mapping by role type (red=Architect, blue=Testing, etc.)
  - Usage guidelines
  - Multi-role agent color selection
  - Validation checklist
- **Context7 equivalent**: `get-library-docs "/anthropics/claude-code" topic="agent color coding conventions"`

## Update Policy

References should be refreshed when:
- ✅ Context7 documentation changes (query quarterly or when major Claude Code updates)
- ✅ New best practices emerge from Anthropic
- ✅ YAML frontmatter format changes
- ✅ Common mistakes are identified through usage
- ✅ Agent structure template evolves

## Progressive Disclosure Pattern

**Don't load all references upfront**. Reference them by name in SKILL.md:
- "See `references/agent-structure.md` for complete structure guide"
- "Consult `references/yaml-frontmatter-guide.md` for validation rules"

Agent loads specific reference when needed, keeping context focused.

---

**Last Updated**: 2025-10-24
