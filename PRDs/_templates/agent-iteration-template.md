# [Agent Name] - Iteration XX

**Agent**: [Test Agent | Implementer | Supabase Agent | UI/UX Expert]
**Iteration Number**: XX
**Date**: YYYY-MM-DD HH:MM
**Status**: [In Progress | Ready for Review | Approved | Rejected]
**Based on**: [00-request.md | Previous iteration reference]

---

## 📋 Context and Scope

**What was requested**:
[Brief summary of what was asked in 00-request.md or previous iteration feedback]

**What changed from previous iteration** (if iteration > 01):
[What feedback was addressed, what was corrected]

---

## ✅ Work Completed

### Summary
[High-level overview of what was accomplished in this iteration]

### Detailed Breakdown

#### [Work Category 1]
**Description**: [What was done]
**Rationale**: [Why this approach was chosen]
**Result**: [What is now working/available]

#### [Work Category 2]
**Description**: [What was done]
**Rationale**: [Why this approach was chosen]
**Result**: [What is now working/available]

---

## 🔍 Technical Decisions

### Decision 1: [Decision Title]
**Context**: [Why this decision was needed]
**Options Considered**:
1. Option A: [Description]
2. Option B: [Description]

**Decision Made**: [Chosen option]
**Justification**: [Why this option was selected]

### Decision 2: [Decision Title]
[Same structure as above]

---

## 🚧 Blockers Encountered and Resolved

### Blocker 1: [Blocker Description]
**Impact**: [How it affected the work]
**Root Cause**: [What caused it]
**Resolution**: [How it was resolved]
**Time Lost**: [Estimate of delay]

### Blocker 2: [Blocker Description]
[Same structure as above]

---

## 📎 Artifacts and Deliverables

### Files Created
```
app/src/features/[feature]/
├── [file1.ts]
├── [file2.test.ts]
└── [file3.tsx]
```

### Files Modified
```
app/src/
├── [modified-file1.ts] (lines XX-YY)
└── [modified-file2.ts] (lines AA-BB)
```

### Database Changes (if applicable)
- Migration: `[migration-name].sql`
- Tables affected: `[table1]`, `[table2]`
- RLS policies: [policy names]

### Tests Created/Modified (if applicable)
```
tests/
├── unit/[feature]/[test-file].test.ts (XX tests)
├── integration/api/[feature]/route.test.ts (YY tests)
└── e2e/[feature].spec.ts (ZZ scenarios)
```

---

## 🧪 Evidence and Validation

### Test Results
```
[Paste test output or summary]

✅ Passing: XX tests
❌ Failing: YY tests (intentional if Test Agent, else needs fix)
⏭️ Skipped: ZZ tests
Coverage: XX%
```

### Screenshots (if UI work)
[Include screenshots or links to images]
- Screenshot 1: [Description]
- Screenshot 2: [Description]

### Performance Metrics (if applicable)
- API response time: XX ms
- Database query time: YY ms
- Lighthouse score: ZZ
- Core Web Vitals: [LCP, FID, CLS values]

### Code Quality Checks
```bash
# Linting
npm run lint
✅ No errors

# Type checking
npm run typecheck
✅ No type errors

# Build
npm run build
✅ Build successful
```

---

## 📊 Coverage Against Requirements

### Requirements from 00-request.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| [Requirement 1] | ✅ Complete | [Notes if needed] |
| [Requirement 2] | ✅ Complete | [Notes if needed] |
| [Requirement 3] | ⚠️ Partial | [What's missing and why] |
| [Requirement 4] | ❌ Not started | [Reason] |

### Acceptance Criteria Met

- [x] Criterion 1: [Evidence]
- [x] Criterion 2: [Evidence]
- [ ] Criterion 3: [Reason not met / will address in next iteration]

---

## 💡 Learnings and Notes

### What Went Well
- [Positive point 1]
- [Positive point 2]

### Challenges
- [Challenge 1 and how overcome]
- [Challenge 2 and how overcome]

### Recommendations for Future Work
- [Recommendation 1]
- [Recommendation 2]

---

## ⏭️ Next Steps

### If Approved
[What happens next? Hand-off to next agent? Feature complete?]

### If Rejected
[What areas need correction? What feedback is needed?]

### Open Questions
1. [Question 1]
2. [Question 2]

---

## 🔄 Handoff Preparation (Optional)

**Is handoff needed?**: [Yes/No]

If Yes:
- Handoff document: `handoff-00X.md`
- Target agent: [Agent name]
- Key information to transfer: [Summary]

---

## ✅ Quality Checklist

Self-assessment before requesting review:

- [ ] All work from 00-request.md objectives is complete
- [ ] All acceptance criteria met (or documented why not)
- [ ] Artifacts follow Clean Architecture principles
- [ ] Only canonical tech stack used (no prohibited technologies)
- [ ] Tests are passing (or failing appropriately if Test Agent)
- [ ] Code is linted and type-checked
- [ ] Performance is acceptable
- [ ] Accessibility verified (if UI work)
- [ ] Documentation is complete
- [ ] Evidence provided (screenshots, logs, test results)
- [ ] Technical decisions are documented
- [ ] Blockers are resolved or escalated
- [ ] Ready for Architect + User review

---

## 🎯 Review Status

**Submitted for Review**: YYYY-MM-DD HH:MM

### Architect Review
**Date**: [To be filled by Architect]
**Status**: [Approved | Rejected | Needs Changes]
**Feedback**: [Architect comments]

### User Review
**Date**: [To be filled by User]
**Status**: [Approved | Rejected | Needs Changes]
**Feedback**: [User comments]

---

## 📝 Revision History

| Iteration | Date | Changes Made | Outcome |
|-----------|------|--------------|---------|
| 01 | YYYY-MM-DD | Initial submission | [Approved/Rejected] |
| 02 | YYYY-MM-DD | [Changes based on feedback] | [Approved/Rejected] |

---

**Prepared by**: [Agent Name]
**Date**: YYYY-MM-DD
**Version**: [Iteration Number]
