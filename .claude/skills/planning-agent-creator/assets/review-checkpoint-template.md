# {Domain} Review - Checkpoint {N}

**Feature**: {Feature name}
**Agent**: {agent-name}
**Checkpoint**: {N}
**Date**: {YYYY-MM-DD}
**Reviewer**: {agent-name}

---

## Implementation Assessed

### Scope of Review
- **Phase Covered**: {Phase name from plan}
- **Files Reviewed**:
  - `{file path 1}`
  - `{file path 2}`
  - `{file path 3}`
- **Review Date**: {YYYY-MM-DD}
- **Implementation Date**: {YYYY-MM-DD}

### Plan Reference
- **Original Plan**: `01-plan.md`
- **Planned Patterns**: {List key patterns expected}
- **Success Criteria**: {Criteria being evaluated}

---

## ✅ Correctly Implemented

### 1. {Aspect/Component Name}
**Location**: `{file path}:{line range}`
**What Was Done Well**: {Description of correct implementation}
**Best Practice Followed**: {Which Context7 best practice was applied}
**Impact**: {Why this is important}

### 2. {Aspect/Component Name}
**Location**: `{file path}`
**What Was Done Well**: {Description}
**Best Practice Followed**: {Context7 reference}
**Impact**: {Benefit}

### 3. {Aspect/Component Name}
{Similar structure}

---

## ⚠️ Issues Found

### Issue 1: {Issue Title}

**Location**: `{file path}:{line number}`

**Severity**:
- [ ] Critical (Blocks functionality or creates security risk)
- [ ] High (Violates architecture or best practices significantly)
- [ ] Medium (Sub-optimal approach, should be improved)
- [ ] Low (Minor improvement, nice-to-have)

**Description**:
{Clear explanation of what's wrong}

**Current Implementation**:
```{language}
{Problematic code snippet}
```

**Why This is Problematic**:
- {Reason 1}
- {Reason 2}

**Context7 Reference**:
- Library: /{org}/{project}
- Topic: "{topic}"
- Best Practice: {What Context7 recommends}

**Recommended Fix**:
```{language}
{Corrected code example}
```

**Explanation**:
{Why this fix is better}

**Additional Resources**:
- Context7: /{org}/{project} - "{related topic}"
- {Other reference if applicable}

---

### Issue 2: {Issue Title}

**Location**: `{file path}:{line number}`

**Severity**: {Critical | High | Medium | Low}

**Description**: {What's wrong}

**Current Implementation**:
```{language}
{Code}
```

**Why This is Problematic**:
{Explanation}

**Context7 Reference**: /{org}/{project} - "{topic}"

**Recommended Fix**:
```{language}
{Solution}
```

**Explanation**: {Why}

---

### Issue 3: {Issue Title}

{Similar structure}

---

## 🔄 Improvement Suggestions

### Suggestion 1: {Improvement Title}

**Category**: Performance | Maintainability | Scalability | UX

**Current State**: {How it works now}

**Suggested Improvement**: {How to make it better}

**Benefits**:
- {Benefit 1}
- {Benefit 2}

**Context7 Reference**: /{org}/{project} - "{topic}"

**Implementation Approach**:
{How to implement this improvement}

**Priority**: High | Medium | Low

---

### Suggestion 2: {Improvement Title}

{Similar structure}

---

## 📊 Quality Metrics

### Code Quality
- **Test Coverage**: {percentage}% (Target: >90%)
- **Type Safety**: {percentage}% typed
- **Lint Issues**: {count} (Target: 0)
- **Code Smells**: {count identified}

### {Domain}-Specific Metrics

#### For Backend:
- **Use Case Complexity**: {metric}
- **Service Purity**: ✅ Pure | ⚠️ Has business logic
- **Error Handling**: {coverage percentage}

#### For Frontend:
- **Component Complexity**: {metric}
- **Accessibility Score**: {WCAG level achieved}
- **Bundle Size Impact**: {KB added}

#### For Database:
- **RLS Policy Coverage**: {percentage}%
- **Query Performance**: {avg response time}
- **Index Usage**: {count} indexes used

#### For Testing:
- **Test Coverage**: {percentage}%
- **E2E Flow Coverage**: {count} flows covered
- **Accessibility Tests**: {count} a11y assertions

### Best Practices Compliance
- **Context7 Patterns**: {count} followed / {count} recommended
- **Anti-Patterns Avoided**: {count} avoided / {count} checked
- **Architecture Compliance**: ✅ Compliant | ⚠️ Violations found

---

## 🎯 Summary

### Overall Assessment
{1-2 paragraph summary of implementation quality}

**Strengths**:
- {Major strength 1}
- {Major strength 2}
- {Major strength 3}

**Areas for Improvement**:
- {Key area 1}
- {Key area 2}

**Compliance Status**:
- ✅ **Passes**: {What meets standards}
- ⚠️ **Needs Work**: {What requires fixes}
- ❌ **Blocks**: {Critical issues if any}

---

## 📋 Action Items

### Priority 1: Critical (Fix Before Proceeding)
1. **{Issue Title}**
   - Location: `{file}:{line}`
   - Action: {What to do}
   - Estimated effort: {time estimate}

### Priority 2: High (Should Fix Soon)
1. **{Issue Title}**
   - Location: `{file}:{line}`
   - Action: {What to do}
   - Estimated effort: {time estimate}

### Priority 3: Medium (Address When Possible)
1. **{Issue Title}**
   - Location: `{file}:{line}`
   - Action: {What to do}
   - Estimated effort: {time estimate}

### Priority 4: Low (Nice to Have)
1. **{Suggestion Title}**
   - Location: `{file}:{line}`
   - Action: {What to do}
   - Estimated effort: {time estimate}

---

## Next Steps

### For Claude Code (Implementer)
1. {First action to take}
2. {Second action to take}
3. {Third action to take}

### For User
1. {Decision needed if any}
2. {Approval needed if any}

### For Next Checkpoint
- **When to Re-Review**: {After which fixes}
- **What to Verify**: {Specific items to check}
- **Expected Timeline**: {Estimate}

---

## References

### Context7 Consultations for Review
1. /{org}/{project} - "{topic}" - Used for Issue 1
2. /{org}/{project} - "{topic}" - Used for Issue 2
3. /{org}/{project} - "{topic}" - Used for Suggestion 1

### Related Documentation
- Original Plan: `{agent-name}/01-plan.md`
- Architect PRD: `architect/00-master-prd.md`
- Previous Checkpoint: `{agent-name}/review-checkpoint-{N-1}.md` (if applicable)

---

## Sign-off

**Reviewed by**: {agent-name}
**Review Status**:
- [ ] ✅ Approved - Ready to proceed
- [ ] ⚠️ Conditional - Fix critical issues first
- [ ] ❌ Rejected - Major rework required

**Next Checkpoint**: {When review should happen again}

**Notes**: {Any additional comments}

---

**Generated by**: {agent-name} v3.0 Planning Expert
**Review Date**: {YYYY-MM-DD}
**Checkpoint**: {N}
