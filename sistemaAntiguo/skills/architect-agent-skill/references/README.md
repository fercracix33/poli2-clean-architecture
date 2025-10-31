# Architect Agent Skill References

References are loaded **on demand** when specific technical guidance is needed.

## Available References

1. **prd-template-guide.md** - Complete guide to the 14-section PRD template
   - When to consult: Creating or validating master PRD
   - Context7 equivalent: Query Next.js App Router patterns, Zod schema best practices

2. **entity-design-patterns.md** - Zod schema design patterns and validation strategies
   - When to consult: Implementing entities.ts files
   - Context7 equivalent: `/colinhacks/zod` advanced validation patterns

3. **iteration-review-checklist.md** - Comprehensive checklist for reviewing agent iterations
   - When to consult: Approving or rejecting agent work
   - Context7 equivalent: N/A (project-specific)

4. **supabase-rls-patterns.md** - Row Level Security policy patterns for multi-tenancy
   - When to consult: Designing database schema sections in PRD
   - Context7 equivalent: `/supabase/supabase` RLS best practices

5. **handoff-coordination.md** - Guide for enabling parallelism via handoff documents
   - When to consult: Deciding when to create handoff-XXX.md
   - Context7 equivalent: N/A (project-specific)

## Update Policy

References should be refreshed when:
- Context7 documentation for Zod, Next.js, or Supabase changes
- New PRD template sections are added
- Iteration review process evolves
- Common architectural mistakes are identified
- Agent coordination patterns change

## Creating New References

When adding a new reference:
1. Create markdown file in this directory
2. Update this README with entry and trigger condition
3. Update `metadata.json` with new `references_count`
4. Add Context7 equivalent query if applicable
