# Architect Agent Skill Scripts

Automation scripts to enhance architect workflows.

## Available Scripts

Currently no scripts implemented. Future candidates:

1. **init-feature.sh** - Initialize complete feature directory structure
   - Usage: `./init-feature.sh <domain> <number> <feature-name>`
   - Creates: PRD folders, agent workspaces, _status.md template

2. **validate-prd.sh** - Validate PRD completeness (14 sections)
   - Usage: `./validate-prd.sh PRDs/domain/feature/architect/00-master-prd.md`
   - Checks: All required sections, Zod schemas defined, API specs complete

3. **validate-entities.sh** - Validate entities.ts compilation and Zod schemas
   - Usage: `./validate-entities.sh app/src/features/{feature}/entities.ts`
   - Checks: TypeScript compilation, Zod schema exports, type inference

4. **review-iteration.sh** - Interactive iteration review assistant
   - Usage: `./review-iteration.sh PRDs/domain/feature/{agent}/01-iteration.md`
   - Checks: Coverage against 00-request.md, file deliverables, quality criteria

## Script Implementation Guidelines

When implementing scripts:
- Use bash for portability
- Include detailed error messages
- Provide usage examples in `--help`
- Return appropriate exit codes (0 = success, 1 = error)
- Log to stderr for errors, stdout for output
- Make scripts idempotent where possible
