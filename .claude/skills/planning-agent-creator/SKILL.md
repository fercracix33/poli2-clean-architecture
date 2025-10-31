---
name: planning-agent-creator
description: Use this skill when creating Claude Code planning/reviewing agents for the v3.0 system. Specializes in agents that plan implementations and review work (NOT agents that implement code). Examples: <example>Context: User wants to create a backend planning expert for v3.0 system user: 'Create a backend-planning-expert agent' assistant: 'I'll use the planning-agent-creator skill to build a planner/reviewer agent following v3.0 best practices' <commentary>Planning agents require different structure than implementer agents - they plan and review, not implement</commentary></example> <example>Context: User needs a security planning specialist user: 'Create a security-planning-expert agent' assistant: 'I'll use the planning-agent-creator skill to create a security planner that creates plans and reviews implementations' <commentary>Each planning agent follows the same pattern: read PRD, create plan, review at checkpoints</commentary></example>
color: orange
---

# Planning Agent Creator Skill

**Purpose**: Create Claude Code planning/reviewing agents for the v3.0 system where agents **plan** implementations and **review** work instead of implementing code themselves.

**When to use**: Creating new v3.0 planning agents, understanding v3.0 vs v2.0 differences.

---

## 🎯 Core Principles

### v3.0 System Philosophy

**CRITICAL INVERSION**: In v3.0, the workflow is inverted from v2.0:

```
v2.0 (OLD - Archived):
- Subagents IMPLEMENT code
- Thread principal coordinates
- Sequential handoffs

v3.0 (NEW - Current):
- Subagents PLAN & REVIEW
- Thread principal (Claude Code) IMPLEMENTS
- Parallel planning → Sequential implementation with checkpoints
```

### Planning Agent Characteristics

Planning agents in v3.0:
- **Plan** detailed implementation strategies (NOT code)
- **Review** Claude Code's implementation at checkpoints
- **Consult** Context7 for latest best practices (MANDATORY)
- **Work** in isolated folders (cannot read other agents' folders)
- **Deliver** plans and review reports (NOT working code)

---

## 📋 6-PHASE WORKFLOW

### PHASE 1: Discovery & Agent Type Selection

**Objective**: Understand which type of planning agent to create.

**Agent Types Available** (see `references/agent-types-matrix.md` for complete matrix):

1. **Backend Planning Expert** - Plans use cases, services, TanStack Query patterns
2. **Database Planning Expert** - Plans schema, RLS policies, migrations
3. **Frontend Planning Expert** - Plans React components, UX flows, accessibility
4. **Testing Planning Expert** - Plans test strategy (ALWAYS FIRST, sequential)
5. **shadcn UI/UX Planning Expert** - Plans component composition, animations
6. **Security Planning Expert** - Plans CASL, RLS, defense-in-depth
7. **Performance Planning Expert** - Plans optimizations, caching, Core Web Vitals

**Questions to answer**:
- Which domain does this agent specialize in?
- What technologies will it plan for?
- What will it review in implementations?
- When should it be invoked in the workflow?

**Deliverable**: Clear understanding of agent type and domain

---

### PHASE 2: Context7 Research (MANDATORY)

**Objective**: Consult official best practices for both agent creation AND the domain.

**⚠️ CRITICAL**: You MUST query Context7 before creating planning agents.

**Required queries**:

```bash
# Query 1: Agent creation best practices
mcp__context7__resolve-library-id "claude code"
mcp__context7__get-library-docs "/anthropics/claude-code" topic="agent yaml structure planning reviewing"

# Query 2: Domain-specific best practices (example for backend agent)
mcp__context7__resolve-library-id "tanstack query"
mcp__context7__get-library-docs "/tanstack/query" topic="best practices patterns"

# Query 3: Technology-specific patterns (example for supabase agent)
mcp__context7__resolve-library-id "supabase"
mcp__context7__get-library-docs "/supabase/supabase" topic="rls policies performance"
```

**What to look for**:
- ✅ Latest agent YAML requirements
- ✅ Domain-specific best practices
- ✅ Technology version updates
- ✅ Common anti-patterns to avoid

**Reference**: `references/context7-integration.md` for query patterns

**Deliverable**: Notes on latest best practices for both agent structure and domain

---

### PHASE 3: YAML Frontmatter Design

**Objective**: Create valid, descriptive YAML frontmatter for the planning agent.

**Required fields**:
```yaml
---
name: {domain}-planning-expert    # e.g., backend-planning-expert
description: Use this agent when planning {domain} implementations. Specializes in {expertise}. Creates detailed plans and reviews implementations at checkpoints. Examples: <example>Context: {situation} user: '{request}' assistant: '{response}' <commentary>{reasoning}</commentary></example>
model: sonnet
color: {color}                    # orange for planning/infrastructure
---
```

**Critical differences from v2.0**:
- Name suffix: `-planning-expert` (NOT just `-expert` or `-agent`)
- Description MUST mention "planning" and "reviewing"
- Examples should show planning scenarios, not implementation

**Color conventions for planners**:
- orange = Planning/Infrastructure specialists (all v3.0 planners)

**Validation checklist**:
- [ ] Name ends with `-planning-expert`
- [ ] Description mentions both "planning" and "reviewing"
- [ ] 2-3 examples show planning scenarios
- [ ] Color is orange
- [ ] YAML syntax is valid

**Reference**: `references/yaml-examples.yml` for complete examples

**Deliverable**: Complete YAML frontmatter block

---

### PHASE 4: Agent Body Structure

**Objective**: Create the minimal agent body for a planner/reviewer.

**Template**: Use `assets/planning-agent-template.md` as base.

**Required sections** (in order):

#### 1. IDENTITY & ROLE (Planning-Specific)
```markdown
# IDENTITY & ROLE

You are the **{Domain} Planning Expert**—you create detailed implementation plans and review implementations at checkpoints. You DO NOT implement code yourself.

## Core Mission

{2-3 paragraphs explaining:
 - What this agent plans
 - What this agent reviews
 - Why planning/reviewing is separate from implementing}

## Authority & Boundaries

**YOU ARE THE ONLY AGENT AUTHORIZED TO**:
- Create detailed implementation plans for {domain}
- Review Claude Code's {domain} implementation at checkpoints
- Consult Context7 for latest {domain} best practices
- Specify patterns, architectures, and approaches for {domain}

**YOU ARE STRICTLY PROHIBITED FROM**:
- Implementing any code (Claude Code implements, you plan)
- Modifying tests or business logic
- Reading other agents' folders (Architect coordinates)
- Approving your own plans (Architect + User approve)
```

#### 2. PLANNING & REVIEW WORKFLOW v3.0
```markdown
# PLANNING & REVIEW WORKFLOW v3.0

## Your Workspace

**Isolated folder**: `PRDs/{domain}/{feature}/{agent-name}/`

**Files YOU read**:
- ✅ `{agent-name}/00-request.md` (Architect writes)
- ✅ `architect/00-master-prd.md` (reference)
- ✅ (Optional) `{previous-agent}/handoff-XXX.md` (if parallelism enabled)

**Files you CANNOT read**:
- ❌ Other agent folders (Architect coordinates information)

## Your Deliverables

1. **`01-plan.md`**: Detailed implementation plan
   - NOT code, but specifications for Claude to follow
   - Patterns, architectures, file structure
   - Context7 best practices consulted
   - Phased approach if needed

2. **`review-checkpoint-N.md`**: Review reports
   - What Claude implemented correctly
   - What needs correction
   - Best practices violations
   - Specific improvement suggestions
```

#### 3. MANDATORY SKILL INVOCATION
```markdown
# 🎯 MANDATORY SKILL INVOCATION

**CRITICAL**: Before ANY work, invoke your technical skill:

\```
Skill: {agent-name}-skill
\```

**The skill provides**:
- ✅ Step-by-step planning procedures
- ✅ Context7 consultation checkpoints (MANDATORY phases)
- ✅ MCP integration workflows (if applicable)
- ✅ Domain-specific planning patterns
- ✅ Review checklists and quality criteria

**This skill is NOT optional—it is your complete planning manual.**
```

#### 4. QUICK REFERENCE
```markdown
# QUICK REFERENCE

**Triggers**: Planning {domain} implementations and reviewing Claude Code's work at checkpoints
**Deliverables**:
- `01-plan.md` - Detailed implementation plan (NOT code)
- `review-checkpoint-N.md` - Review reports with specific feedback
**Success metrics**:
- Plans are detailed enough for Claude to implement without ambiguity
- Reviews catch best practice violations and provide actionable feedback
- Context7 consulted for latest patterns

---

**Complete planning guide**: `.claude/skills/{agent-name}-skill/SKILL.md`
```

**Validation checklist**:
- [ ] Identity emphasizes "planning" and "reviewing" (NOT implementing)
- [ ] Authority section is specific to planning/reviewing
- [ ] Prohibitions explicitly forbid code implementation
- [ ] Workflow section mentions `01-plan.md` and `review-checkpoint-N.md`
- [ ] No references to implementing code
- [ ] File is ~100-200 lines (not too verbose)

**Deliverable**: Complete planning agent .md file

---

### PHASE 5: Validation

**Objective**: Verify the planning agent follows v3.0 patterns.

**Manual validation checklist**:
- [ ] Agent name ends with `-planning-expert`
- [ ] YAML description mentions both planning and reviewing
- [ ] Examples show planning scenarios (NOT implementation)
- [ ] Identity section emphasizes planning/reviewing role
- [ ] Authority section does NOT mention code implementation
- [ ] Prohibitions explicitly forbid implementing code
- [ ] Deliverables are `01-plan.md` and `review-checkpoint-N.md`
- [ ] No workspace files mention "XX-iteration.md" (that's v2.0)
- [ ] Skill invocation references correct skill name
- [ ] Color is orange (planning/infrastructure)

**Common mistakes to avoid**:
- ❌ Describing agent as "implementer" or mentioning code generation
- ❌ Including v2.0 iteration patterns (`XX-iteration.md`)
- ❌ Generic planning language ("help with X")
- ❌ Authorities that mention writing code
- ❌ Missing Context7 consultation requirements
- ❌ Wrong color (should be orange for all planners)

**Deliverable**: Validated planning agent file

---

### PHASE 6: Skill Scaffold Creation

**Objective**: Create the companion skill structure for this planning agent.

**⚠️ NOTE**: This phase creates the STRUCTURE only. The skill content is created separately using the `skill-creator` skill.

**Directory structure to create**:
```
.claude/skills/{agent-name}-skill/
├── SKILL.md                    # Main skill file (create with skill-creator)
├── metadata.json               # Skill metadata
├── references/                 # Planning patterns (loaded on demand)
│   ├── README.md              # Index of references
│   ├── context7-queries.md    # Pre-built Context7 queries
│   └── {domain}-patterns.md   # Domain-specific patterns
└── assets/                     # Planning templates
    ├── README.md              # Asset catalog
    ├── plan-template.md       # Template for 01-plan.md
    └── review-template.md     # Template for review-checkpoint-N.md
```

**Metadata template** (`metadata.json`):
```json
{
  "name": "{agent-name}-skill",
  "version": "1.0.0",
  "description": "Planning and review workflow for {agent-name} agent in v3.0 system",
  "agent": "{agent-name}",
  "agent_type": "planner_reviewer",
  "system_version": "v3.0",
  "technologies": ["list", "of", "technologies"],
  "mcps_required": ["context7"],
  "references_count": 2,
  "last_updated": "2025-10-29"
}
```

**Deliverable**: Skill directory structure ready for content population

---

### 🎯 AUTOMATIC HANDOFF TO SKILL-CREATOR

**⚠️ CRITICAL**: Planning agent creation is NOT complete until the skill is populated with technical content.

**Now invoke the skill-creator to complete the skill**:

```
Skill: skill-creator
```

**Provide the skill-creator with this information**:

```markdown
Agent: {agent-name}
Agent Type: Planning/Reviewing (v3.0)
Color: orange
Domain: {domain}

Primary Responsibilities (planning/reviewing):
- Create detailed implementation plans for {domain}
- Review Claude Code's implementation at checkpoints
- Consult Context7 for latest {domain} best practices

Technologies Involved:
- {List technologies this agent plans for}
- {e.g., TanStack Query, Zod for backend-planning-expert}
- {e.g., Supabase, PostgreSQL, RLS for database-planning-expert}

Required MCP Integrations:
- context7 (MANDATORY for all planning agents)
- {Other MCPs: supabase, chrome-devtools, etc.}

Skill Content to Include:
- 6-phase planning workflow (NOT implementation workflow)
- Context7 checkpoints (mandatory consultation phases)
- Planning pattern examples (NOT code examples)
- Review checklist templates
- Common planning mistakes and how to avoid them

**CRITICAL**: This is a PLANNING skill, not an IMPLEMENTATION skill.
Focus on how to create plans and review implementations, NOT how to implement code.
```

---

## 📚 REFERENCES

### Bundled References (Load on Demand)

1. **`references/planning-workflow-v3.md`**
   - When to use: Understanding complete v3.0 workflow
   - Contains: Step-by-step v3.0 flow, v2.0 vs v3.0 comparison

2. **`references/agent-types-matrix.md`**
   - When to use: Selecting agent type or understanding domain
   - Contains: Complete matrix of 7 specialist types

3. **`references/yaml-examples.yml`**
   - When to use: Writing YAML frontmatter
   - Contains: Complete examples for all agent types

4. **`references/context7-integration.md`**
   - When to use: Integrating Context7 consultations
   - Contains: Query patterns, when to consult, best practices

### Bundled Assets (Copy/Modify)

1. **`assets/planning-agent-template.md`**
   - When to use: Starting new planning agent
   - Usage: Copy and customize for specific domain

2. **`assets/plan-document-template.md`**
   - When to use: Creating example `01-plan.md` structure
   - Usage: Show agents what their deliverables should look like

3. **`assets/review-checkpoint-template.md`**
   - When to use: Creating example review report structure
   - Usage: Show agents how to structure review feedback

---

## ✅ SUCCESS CRITERIA

Planning agent creation is complete when:

- [ ] YAML frontmatter emphasizes planning/reviewing (NOT implementing)
- [ ] Agent file is 100-200 lines (concise and focused)
- [ ] Name ends with `-planning-expert`
- [ ] All required sections present
- [ ] Boundaries explicitly prohibit code implementation
- [ ] Deliverables are plans and reviews (NOT code)
- [ ] Skill invocation is mandatory and emphasized
- [ ] Skill directory structure created
- [ ] Color is orange (planning/infrastructure)
- [ ] No v2.0 patterns (`XX-iteration.md`, implementation language)

---

**Last Updated**: 2025-10-29
**System Version**: v3.0
**Maintained by**: Planning Agent Creator Skill
