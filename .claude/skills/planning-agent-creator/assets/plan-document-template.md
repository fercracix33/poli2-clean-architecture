# {Domain} Implementation Plan

**Feature**: {Feature name from PRD}
**Agent**: {agent-name}
**Date**: {YYYY-MM-DD}
**Status**: Draft | Approved | Revised

---

## Overview

### Feature Scope for {Domain}
{Brief description of what this plan covers within the domain}

### Phased Approach
- **Phase 1**: {Phase name and objective}
- **Phase 2**: {Phase name and objective}
- **Phase 3**: {Phase name and objective}

### Success Criteria
- [ ] {Criterion 1 - measurable outcome}
- [ ] {Criterion 2 - quality metric}
- [ ] {Criterion 3 - architectural compliance}

---

## Context7 Consultation

### Queries Executed

**Query 1**: {Technology/Library}
```bash
mcp__context7__resolve-library-id "{library name}"
mcp__context7__get-library-docs "/{org}/{project}" topic="{specific topic}"
```

**Findings**:
- ✅ {Key best practice discovered}
- ⚠️ {Anti-pattern to avoid}
- 📚 {Relevant pattern or technique}

**Query 2**: {Technology/Library}
```bash
mcp__context7__get-library-docs "/{org}/{project}" topic="{another topic}"
```

**Findings**:
- ✅ {Key best practice}
- ⚠️ {Anti-pattern}
- 📚 {Pattern}

### Key Best Practices Identified
1. **{Practice 1}**: {Description and why it matters}
2. **{Practice 2}**: {Description and rationale}
3. **{Practice 3}**: {Description and benefit}

### Anti-Patterns to Avoid
1. ❌ **{Anti-pattern 1}**: {Why it's problematic}
2. ❌ **{Anti-pattern 2}**: {Common mistake}
3. ❌ **{Anti-pattern 3}**: {Outdated approach}

---

## Detailed Specifications

### Phase 1: {Phase Name}

**Objective**: {What this phase accomplishes}

**What to Implement**:
- {Specific component/module/feature 1}
- {Specific component/module/feature 2}
- {Specific component/module/feature 3}

**How to Implement**:

#### Pattern 1: {Pattern Name}
```
{Pseudocode or architectural description, NOT actual code}

Example structure:
- Create {entity} with Zod schema
- Define interface {InterfaceName}
- Implement {pattern} following {best practice}
```

**Context7 Reference**: /{org}/{project} - "{topic}"

#### Pattern 2: {Pattern Name}
```
{Architectural description}
```

**Context7 Reference**: /{org}/{project} - "{topic}"

**File Structure**:
```
src/features/{feature}/
├── {file1}.ts         # Purpose: {description}
├── {file2}.ts         # Purpose: {description}
└── {file3}.test.ts    # Purpose: {description}
```

**Dependencies**:
- Requires: {What must exist before this phase}
- Provides: {What this phase delivers for next phases}

**Quality Checklist**:
- [ ] {Domain-specific quality criterion}
- [ ] {Best practice compliance check}
- [ ] {Test coverage requirement}

---

### Phase 2: {Phase Name}

**Objective**: {What this phase accomplishes}

**What to Implement**:
- {Specific component/module/feature 1}
- {Specific component/module/feature 2}

**How to Implement**:

#### Pattern 1: {Pattern Name}
```
{Architectural description}
```

**Context7 Reference**: /{org}/{project} - "{topic}"

**File Structure**:
```
{Directory structure}
```

**Dependencies**:
- Requires: {Dependencies from Phase 1}
- Provides: {Deliverables}

**Quality Checklist**:
- [ ] {Criterion}
- [ ] {Criterion}

---

### Phase 3: {Phase Name}

{Similar structure to Phase 1 and 2}

---

## Integration Points

### With Other Domains
- **{Other Domain}**: {How this integrates}
- **{Other Domain}**: {Integration approach}

### With Existing Code
- **{Existing Module}**: {How to integrate}
- **{Existing System}**: {Compatibility considerations}

---

## Quality Assurance

### Testing Requirements
- **Unit Tests**: {What to test, coverage target}
- **Integration Tests**: {Integration scenarios}
- **E2E Tests**: {User workflows to cover}

### Code Quality
- **Type Safety**: {TypeScript requirements}
- **Linting**: {ESLint rules to follow}
- **Formatting**: {Prettier configuration}

### Performance
- **Metrics**: {Performance targets}
- **Optimization**: {Key optimization areas}

### Accessibility
- **WCAG Level**: {AA or AAA}
- **Requirements**: {Specific a11y needs}

---

## Risk Assessment

### Potential Challenges
1. **{Challenge 1}**: {Description}
   - **Mitigation**: {How to address}

2. **{Challenge 2}**: {Description}
   - **Mitigation**: {Strategy}

### Known Limitations
- {Limitation 1 and workaround}
- {Limitation 2 and workaround}

---

## Implementation Checklist

### Phase 1
- [ ] {Task 1}
- [ ] {Task 2}
- [ ] {Task 3}
- [ ] Tests passing for Phase 1

### Phase 2
- [ ] {Task 1}
- [ ] {Task 2}
- [ ] Tests passing for Phase 2

### Phase 3
- [ ] {Task 1}
- [ ] {Task 2}
- [ ] Tests passing for Phase 3

### Final
- [ ] All phases complete
- [ ] All tests passing (>90% coverage)
- [ ] Code reviewed
- [ ] Documentation updated

---

## References

### Context7 Consultations
1. /{org}/{project} - "{topic}" - {Key finding}
2. /{org}/{project} - "{topic}" - {Key finding}
3. /{org}/{project} - "{topic}" - {Key finding}

### Related Documentation
- Architect PRD: `architect/00-master-prd.md`
- {Other relevant docs}

### External Resources
- {Official documentation link}
- {Community resource if applicable}

---

## Approval

**Created by**: {agent-name}
**Reviewed by**: Architect + Usuario
**Status**: ⏳ Pending Approval | ✅ Approved | ❌ Needs Revision
**Approval Date**: {YYYY-MM-DD}

**Revision History**:
- v1.0 ({date}): Initial plan created
- v1.1 ({date}): {Revision description}
