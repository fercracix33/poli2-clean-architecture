# Handoff Document - [Source Agent] to [Target Agent]

**From**: [Source Agent Name]
**To**: [Target Agent Name]
**Feature**: [Feature Name]
**Date**: YYYY-MM-DD
**Handoff Number**: XXX
**Purpose**: [Brief explanation of why parallel work is enabled]

---

## ⚠️ Important Notice

This is a **handoff document** prepared by the Architect to enable **parallel work** between agents.

**Reading Permissions**:
- ✅ [Target Agent] MAY read this document
- ✅ This is the ONLY file from another agent's folder that [Target Agent] can access
- ❌ [Target Agent] MUST NOT read other files in `{source-agent}/` folder

**Status Dependency**:
- This handoff is valid ONLY if [Source Agent]'s work has been **approved** by Architect + User
- If [Source Agent]'s iteration is **rejected**, this handoff may be invalidated
- Always check with Architect before relying on information here

---

## 📋 Context

**Why this handoff exists**:
[Explanation of why parallel work is beneficial and what it enables]

**Current state of [Source Agent]'s work**:
- Iteration: [XX-iteration.md]
- Status: [Approved | In Review]
- Approval Date: YYYY-MM-DD (if approved)

---

## 📦 Information Transfer

### What [Source Agent] Has Completed

#### [Category 1]
**What was delivered**:
[Description of what is available]

**Location**:
- Files: `[file paths]`
- Tests: `[test paths]`

**Key Points**:
- [Important detail 1]
- [Important detail 2]

#### [Category 2]
**What was delivered**:
[Description of what is available]

**Location**:
- Files: `[file paths]`

**Key Points**:
- [Important detail 1]
- [Important detail 2]

---

## 🎯 What [Target Agent] Can Use

### Interfaces and Contracts

**Available for Integration**:
```typescript
// Example: If Test Agent → Implementer handoff
// Test signatures that Implementer can start implementing

export interface CreateTaskInput {
  // ...
}

export interface CreateTaskOutput {
  // ...
}

// Function signature defined by tests
export async function createTask(
  input: CreateTaskInput
): Promise<CreateTaskOutput>;
```

### Test Specifications

**Tests that define behavior**:
- File: `[path to test file]`
- Key tests to make pass:
  1. [Test description]
  2. [Test description]

### Data Contracts

**Entities already defined**:
- Schema: `[entity file path]`
- Types available: `[Type1, Type2, Type3]`

---

## 🚫 What [Target Agent] Should NOT Do

**Constraints**:
- ❌ Do NOT modify [Source Agent]'s test files
- ❌ Do NOT change interfaces defined by [Source Agent]
- ❌ Do NOT read other files in `{source-agent}/` folder
- ❌ Do NOT assume [Source Agent]'s work is complete without Architect confirmation

**Dependencies**:
- If [Source Agent]'s iteration gets rejected, this handoff may change
- Always verify with Architect before proceeding if unsure

---

## 📝 Specific Guidance for [Target Agent]

### What to Focus On
1. [Specific task 1]
2. [Specific task 2]
3. [Specific task 3]

### What to Avoid
1. [Constraint 1]
2. [Constraint 2]

### Open Questions
If you encounter these scenarios, ask Architect:
1. [Scenario 1]
2. [Scenario 2]

---

## 🔗 Coordination Points

### Dependencies

**[Target Agent] depends on**:
- [Dependency 1 from Source Agent]
- [Dependency 2 from Source Agent]

**[Target Agent] should deliver**:
- [Deliverable 1 that uses Source Agent's work]
- [Deliverable 2 that uses Source Agent's work]

### Integration Points

**Where work will merge**:
- Integration point 1: [Description]
- Integration point 2: [Description]

---

## ✅ Verification Checklist

Before using information from this handoff:

- [ ] Verified [Source Agent]'s iteration is **approved**
- [ ] Checked with Architect if unsure about any dependency
- [ ] Understand what interfaces/contracts to respect
- [ ] Know what constraints to follow
- [ ] Have read ONLY this handoff (not other files from source agent)

---

## 📊 Status Tracking

### [Source Agent] Status
- Latest Iteration: [XX-iteration.md]
- Status: [Approved | In Review | Rejected]
- Last Updated: YYYY-MM-DD

### [Target Agent] Status
- Current Iteration: [XX-iteration.md]
- Using Handoff: [Yes | No]
- Integration Status: [Not Started | In Progress | Complete]

---

## 🔄 Handoff Updates

### Version History

| Version | Date | Changes | Reason |
|---------|------|---------|--------|
| 001 | YYYY-MM-DD | Initial handoff | Enable parallel work |
| 002 | YYYY-MM-DD | [Updated section] | [Source Agent iteration changed] |

### Current Version: XXX

---

## 📞 Contact

**Questions about this handoff?**
- Contact: Architect Agent
- Document: This handoff may be updated if [Source Agent]'s work changes

**Questions about [Source Agent]'s work?**
- Do NOT contact [Source Agent] directly
- Ask Architect to coordinate information

---

**Prepared by**: Architect Agent
**Date**: YYYY-MM-DD
**Handoff ID**: [source-agent]-to-[target-agent]-XXX
