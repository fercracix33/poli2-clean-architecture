# Agent Structure Reference

**Last Updated**: 2025-10-24

---

## Standard Agent Structure (~150 lines)

Every agent follows this minimal structure:

```markdown
---
name: agent-name
description: Use this agent when {trigger}. Specializes in {expertise}. Examples: <example>Context: {situation} user: '{request}' assistant: '{response}' <commentary>{reasoning}</commentary></example>
model: sonnet
color: {color}
---

# IDENTITY & ROLE

You are the **{Title}**—{one-sentence mission}.

## Core Mission

{2-3 paragraphs explaining role and responsibilities}

## Authority & Boundaries

**YOU ARE THE ONLY AGENT AUTHORIZED TO**:
- {Responsibility 1}
- {Responsibility 2}
- {Responsibility 3}

**YOU ARE STRICTLY PROHIBITED FROM**:
- {Prohibition 1}
- {Prohibition 2}
- {Prohibition 3}

---

# ITERATIVE WORKFLOW v2.0

## Your Workspace

**Isolated folder**: `PRDs/{domain}/{feature}/{agent-name}/`

**Files YOU read**:
- ✅ `{agent-name}/00-request.md` (Architect writes)
- ✅ `architect/00-master-prd.md` (reference)
- ✅ Handoffs if enabled

**Files you CANNOT read**:
- ❌ Other agent folders

---

# 🎯 MANDATORY SKILL INVOCATION

**CRITICAL**: Before ANY work, invoke your technical skill:

```
Skill: {agent-name}-skill
```

**The skill provides**:
- ✅ Step-by-step technical procedures
- ✅ Context7 consultation checkpoints (MANDATORY phases)
- ✅ MCP integration workflows
- ✅ Technology-specific references (loaded on demand)
- ✅ Code patterns and best practices

**This skill is NOT optional—it is your complete technical manual.**

---

# QUICK REFERENCE

**Triggers**: {When to use this agent}
**Deliverables**: {What this agent produces}
**Success metrics**: {How to measure completion}

---

**Complete technical guide**: `.claude/skills/{agent-name}-skill/SKILL.md`
```

---

## Section Breakdown

### 1. YAML Frontmatter (REQUIRED)

See `yaml-frontmatter-guide.md` for complete validation rules.

### 2. Identity & Role

**Purpose**: Define who the agent is in 2-3 paragraphs

**Best practices**:
- Clear one-sentence mission statement
- Explain dual/triple responsibility
- Connect to overall system architecture

### 3. Authority & Boundaries

**Purpose**: Crystal clear permissions and prohibitions

**Format**:
- Use "YOU ARE THE ONLY AGENT AUTHORIZED TO" for permissions
- Use "YOU ARE STRICTLY PROHIBITED FROM" for boundaries
- Be specific, not vague

### 4. Iterative Workflow v2.0

**Purpose**: Explain workspace isolation and file access

**Key elements**:
- Isolated folder path
- Explicit "Files YOU read" list
- Explicit "Files you CANNOT read" list

### 5. Mandatory Skill Invocation

**Purpose**: Force agent to use its technical skill

**Critical**:
- Must use "MANDATORY" and "CRITICAL"
- Must state "NOT optional"
- Must list what skill provides

### 6. Quick Reference

**Purpose**: Summary for fast lookup

**Format**:
- Triggers (when to use)
- Deliverables (what it produces)
- Success metrics (how to measure)
- Link to full skill

---

## Common Mistakes

**❌ Too verbose**: Keep under 200 lines
**❌ Duplicating skill content**: Agent .md is identity, skill is procedures
**❌ Vague boundaries**: Be specific about what agent can/cannot do
**❌ Missing examples in description**: YAML frontmatter must have usage examples
**❌ Wrong color**: See `color-conventions.md` for correct colors
