# Test Agent Skill Scripts

Automation scripts to enhance test creation workflow.

## Available Scripts

### Test Generation

1. **generate-test-template.sh** - Generate test file from template
   - Usage: `./generate-test-template.sh <type> <feature> <entity>`
   - Types: entity, use-case, service, api, e2e
   - Example: `./generate-test-template.sh use-case tasks createTask`

2. **verify-test-failures.sh** - Verify all tests fail appropriately
   - Usage: `./verify-test-failures.sh <feature>`
   - Checks: No passing tests, proper failure messages
   - Example: `./verify-test-failures.sh tasks`

### Validation

3. **check-coverage-targets.sh** - Verify coverage configuration
   - Usage: `./check-coverage-targets.sh <feature>`
   - Validates: >90% threshold, all layers covered
   - Example: `./check-coverage-targets.sh comments`

4. **validate-mock-setup.sh** - Verify mocks are configured correctly
   - Usage: `./validate-mock-setup.sh <feature>`
   - Checks: Supabase mocked, use cases mocked, no real calls
   - Example: `./validate-mock-setup.sh auth`

### Quality Checks

5. **audit-test-quality.sh** - Run quality checks on test suite
   - Usage: `./audit-test-quality.sh <feature>`
   - Checks: Naming conventions, Arrange-Act-Assert, assertions
   - Example: `./audit-test-quality.sh projects`

## Script Standards

All scripts should:
- Return exit code 0 on success, non-zero on failure
- Output clear, actionable error messages
- Support dry-run mode with `--dry-run` flag
- Include usage documentation in comments
- Be idempotent (can run multiple times safely)

## Usage in Workflow

Test Agent should use scripts:
- **Before starting**: `generate-test-template.sh` for boilerplate
- **After creating tests**: `verify-test-failures.sh` to confirm RED phase
- **Before handoff**: `check-coverage-targets.sh` and `validate-mock-setup.sh`
- **During iteration**: `audit-test-quality.sh` for quality gates

**Automation goal**: Reduce manual work, enforce quality, catch mistakes early.
