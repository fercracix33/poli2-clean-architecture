# Handoff Coordination Guide

Guide for enabling parallelism between agents via handoff documents in the iterative v2.0 workflow.

---

## Core Concept

**Default workflow**: Sequential (one agent at a time)
```
Test Agent → Review → Approve
                ↓
         Implementer → Review → Approve
                ↓
         Supabase Agent → Review → Approve
                ↓
         UI/UX Expert → Review → Approve
```

**With handoffs**: Parallel (overlapping work)
```
Test Agent (iteration 02)
         ↓ (handoff)
    Implementer starts (using handoff)
         ↓
    Both work in parallel
```

---

## When to Use Handoffs

### ✅ Use Handoffs When:

1. **Interfaces are stable** and won't change
2. **Iteration corrections are minor** (not structural changes)
3. **Want to accelerate delivery** (parallel work)
4. **Clear contract** exists between agents
5. **Risk is manageable** (interface changes are unlikely)

### ❌ Don't Use Handoffs When:

1. **First iteration** (interfaces not proven yet)
2. **Structural changes** likely in current iteration
3. **Requirements unclear** or changing
4. **High uncertainty** about design
5. **Sequential dependency** is critical

---

## Handoff Document Structure

**Location**: `PRDs/{domain}/{feature}/{current-agent}/handoff-{number}.md`

**Template**: `PRDs/_templates/agent-handoff-template.md`

**Example**: `PRDs/tasks/001-comments/test-agent/handoff-001.md`

---

## Handoff Document Contents

### Section 1: Context and Purpose

```markdown
# Handoff from {Current Agent} to {Next Agent}

**Feature**: {feature-name}
**Date**: YYYY-MM-DD
**From**: {Current Agent}
**To**: {Next Agent}
**Handoff Number**: 001

## Context

{Current Agent} is working on iteration {X} to address {specific issues}.

However, the **interfaces are stable** and {Next Agent} can begin work using
the stable contracts defined below.

## Purpose of This Handoff

Enable {Next Agent} to start work in parallel while {Current Agent} completes
corrections, accelerating overall delivery.
```

**Purpose**: Explain why handoff is being created and what it enables.

### Section 2: Stable Interfaces

```markdown
## Stable Interfaces

The following interfaces are **STABLE** and will NOT change in current iteration:

### Function Signatures

\`\`\`typescript
// Use Case: createComment
export async function createComment(
  input: CommentCreate,
  userId: string
): Promise<Comment>

// Use Case: getComments
export async function getComments(
  taskId: string,
  userId: string
): Promise<Comment[]>
\`\`\`

### Data Contracts

\`\`\`typescript
// From entities.ts (already approved)
export type Comment = z.infer<typeof CommentSchema>;
export type CommentCreate = z.infer<typeof CommentCreateSchema>;
\`\`\`

These schemas are **IMMUTABLE** (architect-approved).
```

**Purpose**: Define exact contracts next agent can depend on.

### Section 3: Service Interfaces

```markdown
## Service Interfaces Required

{Next Agent} will need the following service methods:

\`\`\`typescript
// Comment Service Interface
export interface CommentService {
  create(
    data: CommentCreate & { userId: string; organizationId: string }
  ): Promise<Comment>;

  findByTaskId(
    taskId: string,
    organizationId: string
  ): Promise<Comment[]>;

  update(
    id: string,
    data: CommentUpdate,
    userId: string
  ): Promise<Comment>;

  delete(
    id: string,
    userId: string
  ): Promise<void>;
}
\`\`\`

**Status**: These interfaces are **defined but not implemented** yet.
{Next Agent} should implement against these contracts.
```

**Purpose**: Specify service layer contracts for next agent.

### Section 4: What's NOT Stable

```markdown
## What's NOT Stable (Do NOT Depend On)

The following are **UNDER REVISION** and may change:

- ❌ **Error handling patterns** in use cases (may be refactored)
- ❌ **Specific error messages** (may change wording)
- ❌ **Internal helper functions** (may be renamed/refactored)

{Next Agent} should **NOT** depend on implementation details, only on
the stable interfaces defined above.
```

**Purpose**: Clearly mark what's NOT safe to depend on.

### Section 5: Constraints and Assumptions

```markdown
## Constraints for {Next Agent}

When working with this handoff, {Next Agent} must:

1. **Use ONLY stable interfaces** defined in Section 2
2. **Implement against service contracts** from Section 3
3. **NOT assume implementation details** from current iteration
4. **Be prepared for minor interface adjustments** (edge cases)
5. **Coordinate with Architect** if assumptions prove incorrect

## Assumptions

This handoff assumes:

- ✅ Zod schemas in `entities.ts` are approved and immutable
- ✅ Function signatures won't change (inputs/outputs stable)
- ✅ Service interface contracts are final
- ❌ Error handling MAY still evolve
- ❌ Internal implementation MAY change
```

**Purpose**: Set clear expectations and boundaries.

### Section 6: Coordination Notes

```markdown
## Coordination Notes

### If Interfaces Change

If {Current Agent}'s iteration causes interface changes:

1. **Architect will notify {Next Agent} immediately**
2. **New handoff document** will be created (handoff-002.md)
3. **{Next Agent} adjusts** work based on new contracts
4. **No blame** - this is an accepted risk of parallel work

### Communication Protocol

- **Architect** is the single point of coordination
- **Agents do NOT communicate directly**
- **All interface changes** go through Architect review
- **Urgent changes** will be escalated to user

### Risk Mitigation

To minimize rework risk:

- {Current Agent} will **avoid interface changes** if possible
- {Next Agent} will **focus on implementation**, not optimization
- **Architect will monitor** both iterations for conflicts
```

**Purpose**: Define how to handle conflicts and changes.

---

## Handoff Creation Workflow

### Step 1: Identify Handoff Opportunity

**Trigger**: Current agent is on iteration 02+, and you notice:
- Corrections are minor (no structural changes)
- Interfaces defined in iteration 01 are stable
- Next agent could start work without blocking

**Decision**: Create handoff to enable parallelism

### Step 2: Create Handoff Document

```bash
# Copy template
cp PRDs/_templates/agent-handoff-template.md \
   PRDs/{domain}/{feature}/{current-agent}/handoff-001.md

# Edit with stable interfaces
```

**Contents**:
- Context and purpose
- Stable interfaces (function signatures)
- Service contracts
- What's NOT stable
- Constraints and assumptions
- Coordination notes

### Step 3: Include in Next Agent's Request

**Update `{next-agent}/00-request.md`**:

```markdown
## Additional Resources

**Handoff Document**: `{current-agent}/handoff-001.md`

You MAY begin work using the stable interfaces defined in the handoff,
while {Current Agent} completes their iteration.

**CRITICAL**: Only depend on interfaces marked as STABLE in the handoff.
```

### Step 4: Monitor Both Iterations

**Your responsibility as Architect**:
- Watch for interface changes in current agent's iteration
- Notify next agent immediately if conflicts arise
- Create new handoff (002) if interfaces change
- Escalate to user if risk becomes too high

### Step 5: Reconcile When Both Complete

**When both agents finish**:
1. Review current agent's final iteration
2. Review next agent's iteration
3. Check for conflicts or mismatches
4. If conflicts exist: Decide which agent adjusts
5. Document resolution in `_status.md`

---

## Example Scenarios

### Scenario 1: Test Agent to Implementer

**Situation**: Test Agent on iteration 02, fixing test descriptions. Interfaces unchanged.

**Handoff contents**:
- Stable: All function signatures from iteration 01
- Stable: Test expectations and assertions
- NOT stable: Test description wording
- Service interfaces: Defined in tests

**Result**: Implementer starts using iteration 01 function signatures

### Scenario 2: Implementer to Supabase Agent

**Situation**: Implementer on iteration 02, refactoring error handling. Service interfaces unchanged.

**Handoff contents**:
- Stable: Service interface methods
- Stable: Input/output types
- NOT stable: Error handling patterns
- Database schema: Defined in PRD

**Result**: Supabase Agent starts implementing service methods

### Scenario 3: Handoff Canceled (Interface Change)

**Situation**: Test Agent's iteration 03 changes a function signature.

**Action**:
1. Architect notifies Implementer: "handoff-001 is invalidated"
2. Architect creates handoff-002 with new interfaces
3. Implementer adjusts code to match new contract
4. Document rework in iteration notes

---

## Handoff vs Sequential Trade-offs

### Handoff Benefits ✅

- **Faster delivery**: Parallel work reduces total time
- **Higher throughput**: More agents working simultaneously
- **Flexibility**: Can accelerate critical features

### Handoff Risks ❌

- **Rework risk**: Interface changes cause downstream rework
- **Coordination overhead**: More monitoring required
- **Complexity**: More moving parts to track

### Decision Matrix

| Situation | Recommendation |
|-----------|----------------|
| First iteration | Sequential (no handoff) |
| Minor corrections | Handoff (low risk) |
| Structural changes | Sequential (high risk) |
| Stable interfaces | Handoff (accelerate) |
| Uncertain requirements | Sequential (reduce rework) |
| Time pressure | Handoff (with user approval) |

---

## Handoff Numbering

**Naming convention**: `handoff-{number}.md`

- `handoff-001.md`: First handoff (from iteration 01 → next agent)
- `handoff-002.md`: Updated handoff (if iteration 02 changes interfaces)
- `handoff-003.md`: Another update (if iteration 03 changes again)

**Why sequential numbering**:
- Clear version history
- Next agent knows which is latest
- Traceability of interface evolution

---

## Template Usage

**Template location**: `PRDs/_templates/agent-handoff-template.md`

**Sections in template**:
1. Context and Purpose
2. Stable Interfaces
3. Service Interfaces
4. What's NOT Stable
5. Constraints and Assumptions
6. Coordination Notes
7. Approval and Sign-off

**How to use**:
1. Copy template to agent's folder
2. Fill in all sections
3. Mark interfaces as STABLE or NOT STABLE
4. Define coordination protocol
5. Reference in next agent's `00-request.md`

---

## Coordination Checklist

Before creating handoff:

- [ ] Current agent is on iteration 02 or higher
- [ ] Iteration 01 interfaces are stable (approved)
- [ ] Current iteration changes don't affect interfaces
- [ ] Next agent has clear contracts to implement against
- [ ] Risk of interface changes is low
- [ ] Benefit of parallelism justifies coordination overhead
- [ ] User approves parallel work (if high-stakes feature)

While handoff is active:

- [ ] Monitor current agent's iteration for interface changes
- [ ] Monitor next agent's progress
- [ ] Communicate immediately if conflicts arise
- [ ] Update handoff document if interfaces change (new version)
- [ ] Document any rework needed

After both agents complete:

- [ ] Verify no interface mismatches
- [ ] Resolve any conflicts
- [ ] Document outcome in `_status.md`
- [ ] Update process learnings

---

## Common Handoff Mistakes

### ❌ Mistake 1: Handoff Too Early

**Problem**: Creating handoff from iteration 01 before it's approved

**Why wrong**: Iteration 01 interfaces may still change during review

**Solution**: Only create handoffs AFTER iteration 01 is approved

### ❌ Mistake 2: Too Much in "Stable"

**Problem**: Marking implementation details as stable

**Why wrong**: Next agent depends on things that will change

**Solution**: Only mark true contracts as stable (function signatures, types)

### ❌ Mistake 3: Not Updating Handoff

**Problem**: Interfaces change, but handoff-001 isn't superseded

**Why wrong**: Next agent uses outdated contracts

**Solution**: Create handoff-002 when interfaces change

### ❌ Mistake 4: Direct Agent Communication

**Problem**: Agents coordinate directly without Architect

**Why wrong**: Breaks isolation, introduces hidden dependencies

**Solution**: ALL coordination goes through Architect

### ❌ Mistake 5: Ignoring Handoff Risks

**Problem**: Creating handoff for unstable/changing interfaces

**Why wrong**: High rework risk, wastes time

**Solution**: Only handoff when interfaces are truly stable

---

## Success Metrics

**Handoff is successful when**:
- ✅ Next agent completes work without interface changes
- ✅ No rework needed due to conflicts
- ✅ Total delivery time reduced
- ✅ Both agents' iterations approved first try

**Handoff is problematic when**:
- ❌ Interface changes force next agent's rework
- ❌ Coordination overhead exceeds time savings
- ❌ Multiple handoff versions needed (001, 002, 003...)
- ❌ Conflicts discovered late in process

---

## Your Role as Coordinator

As Architect, you are the **ONLY** coordinator:

**You decide**:
- When to create handoffs
- What interfaces are stable
- How to handle conflicts
- Whether to continue or abort parallelism

**You monitor**:
- Current agent's iteration progress
- Next agent's work against handoff
- Interface stability
- Risk levels

**You communicate**:
- Interface changes to next agent
- Conflicts to both agents
- Status to user
- Resolution decisions

**You don't**:
- Let agents communicate directly
- Allow unstable handoffs
- Ignore coordination overhead
- Create handoffs by default

---

## Advanced: Multi-Level Handoffs

**Scenario**: Test Agent → Implementer → Supabase Agent (all parallel)

**Approach**:
1. Test Agent creates handoff-001 for Implementer
2. Implementer (using handoff) creates handoff-001 for Supabase Agent
3. All three work in parallel

**Risks**:
- High coordination overhead
- Cascading changes if interfaces shift
- Complex conflict resolution

**When to use**:
- Extreme time pressure
- Very stable requirements
- User explicitly approves risk
- You're confident in interface stability

**Recommendation**: Usually not worth the risk. Stick to one handoff at a time.

---

## Summary

**Handoffs enable parallelism** when:
- Interfaces are stable
- Risk is manageable
- Time savings justify coordination overhead

**As Architect**:
- You create and manage handoffs
- You coordinate between isolated agents
- You decide when parallelism is worth it
- You monitor and resolve conflicts

**Best practice**: Start sequential, handoff only when confidence is high.

---

**Last Updated**: 2025-10-24
