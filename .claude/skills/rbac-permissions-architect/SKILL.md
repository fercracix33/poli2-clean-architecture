---
name: rbac-permissions-architect
description: Use this skill when architecting new features within the RBAC modular permissions system. Guides architects through workspace design, feature definition, permission mapping, and role hierarchy. Critical for understanding Owner/Super Admin special roles, feature independence, and multi-tenant context isolation. Invoke when creating PRDs that involve permissions, workspaces, features, or role-based access control.
---

# RBAC Permissions Architect

## Purpose

This skill enables the Architect Agent to design features that correctly integrate with the project's **RBAC modular permissions system** defined in `concepto-base.md`. It provides the necessary understanding of workspaces, features, permissions, and special roles to create compliant PRDs and entity designs.

## When to Use This Skill

Use this skill when:
- Creating a new feature that involves permissions or access control
- Designing features that operate within workspaces (organizations or projects)
- Defining resources and permissions for a new feature module
- Creating entities that need to respect workspace boundaries
- Architecting features that interact with Owner/Super Admin roles
- Any PRD that mentions: permissions, roles, access, workspaces, features, RLS

## Core Understanding Required

Before architecting any feature, understand these **immutable principles**:

### 1. The Three Pillars (Independent but Interconnected)

```
WORKSPACES (Containers)
    ↓
FEATURES (Modules)
    ↓
RBAC (Access Control)
```

- **Workspaces**: Organizations (root) and Projects (children)
- **Features**: Activatable modules with their own resources/permissions
- **RBAC**: Granular permissions grouped into roles

### 2. Critical Rules

- **NO inheritance**: Features and permissions DO NOT inherit between workspaces
- **Contextual permissions**: Permissions only apply in the workspace where assigned
- **Special roles**: Owner and Super Admin transcend normal permission rules
- **Mandatory feature**: `permissions-management` is always active
- **Independence**: Each workspace activates features explicitly

## Architect Workflow for RBAC-Aware Features

### Phase 1: Feature Scope Definition

**Questions to answer:**

1. **Workspace scope**: Does this feature apply to organizations, projects, or both?
2. **Resource identification**: What entities will users interact with?
3. **Permission granularity**: What actions can users perform on each resource?
4. **Role requirements**: Are there default roles needed for this feature?
5. **Special role interaction**: How do Owner/Super Admin interact with this feature?

**Reference files to consult:**
- **Basic concepts**: [CONCEPTS.md](references/CONCEPTS.md) - Workspace, Feature, Resource, Permission, Role definitions
- **Workspace architecture**: [WORKSPACES.md](references/WORKSPACES.md) - Organization vs Project behavior

### Phase 2: Permission Matrix Design

**Steps:**

1. **List all resources** in your feature (e.g., `boards`, `cards`, `comments`)
2. **Define CRUD+ actions** for each resource (create, read, update, delete, custom actions)
3. **Map to permission format**: `{resource}.{action}` (e.g., `boards.create`, `cards.move`)
4. **Consider visibility**: Which permission grants UI visibility? (usually `.read`)
5. **Document restrictions**: What can Owner/Super Admin do that normal users cannot?

**Example permission matrix:**

```
Feature: kanban

Resources:
├─ boards
├─ cards
└─ card_comments

Permissions:
├─ boards.create
├─ boards.read      ← Grants visibility of Kanban in UI
├─ boards.update
├─ boards.delete
├─ cards.create
├─ cards.read
├─ cards.update
├─ cards.delete
├─ cards.move       ← Custom action
├─ card_comments.create
└─ card_comments.delete
```

**Reference file to consult:**
- **Permission system**: [PERMISSIONS.md](references/PERMISSIONS.md) - Granular permissions, roles, verification flows

### Phase 3: Special Roles Integration

**Questions to answer:**

1. **Owner access**: Does Owner have automatic full access? (Usually yes)
2. **Super Admin access**: Does Super Admin have full access? (Usually yes, with restrictions)
3. **Protected actions**: Are there actions only Owner can perform?
4. **Project creation**: If this is an org-level feature, can it create projects?

**Critical rules:**

- Owner and Super Admin **bypass normal permission checks**
- Owner can **always** manage Super Admins
- Super Admin **cannot** modify Owner or other Super Admins
- Super Admin **cannot** assign Super Admin role
- Only Owner can delete organizations

**Reference file to consult:**
- **Special roles**: [SPECIAL_ROLES.md](references/SPECIAL_ROLES.md) - Owner and Super Admin privileges, restrictions, hierarchy

### Phase 4: Feature Activation Strategy

**Questions to answer:**

1. **Default activation**: Should this feature auto-activate in new workspaces?
2. **Mandatory feature**: Is this feature required system-wide? (Rare, only `permissions-management`)
3. **Configuration options**: Does the feature need workspace-specific config?
4. **Dependencies**: Does this feature require other features to be active?

**Implementation in entities.ts:**

```typescript
// Feature definition (goes in global features catalog)
export const KanbanFeatureSchema = z.object({
  id: z.string().uuid(),
  slug: z.literal('kanban'),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  is_mandatory: z.boolean().default(false),
});

// Workspace feature activation
export const WorkspaceFeatureSchema = z.object({
  workspace_id: z.string().uuid(),
  feature_id: z.string().uuid(),
  enabled: z.boolean().default(true),
  config: z.record(z.unknown()).optional(), // JSONB config
});
```

**Reference file to consult:**
- **Feature system**: [FEATURES.md](references/FEATURES.md) - Feature catalog, activation, independence

### Phase 5: Visibility Rules

**Design how users see this feature in the UI:**

1. **Minimum permission**: What's the least permission needed to see the feature?
2. **Owner/Super Admin**: Always visible if feature is active
3. **Normal users**: Visible only if they have at least one permission
4. **Component-level**: Which UI elements require specific permissions?

**Example visibility logic:**

```typescript
// User sees "Kanban" in menu if:
// - Owner/Super Admin (always), OR
// - Has ANY permission from kanban feature (boards.read, boards.create, etc.)

// User sees "Create Board" button if:
// - Owner/Super Admin (always), OR
// - Has boards.create permission
```

**Reference file to consult:**
- **Visibility system**: [VISIBILITY.md](references/VISIBILITY.md) - UI visibility, feature gates, permission-based rendering

### Phase 6: Database Schema Considerations

**Design RLS-ready schema:**

1. **Workspace foreign key**: All feature tables MUST reference `workspaces.id`
2. **RLS policies**: Plan policies for Owner, Super Admin, and normal users
3. **Multi-tenancy**: Ensure workspace_id filters prevent cross-workspace access
4. **Cascading deletes**: Plan what happens when workspace is deleted

**Example schema pattern:**

```sql
CREATE TABLE kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can access boards in their workspaces"
ON kanban_boards FOR SELECT
TO authenticated
USING (
  -- Owner bypass
  workspace_id IN (
    SELECT id FROM workspaces
    WHERE owner_id = auth.uid()
  )
  OR
  -- Super Admin bypass
  workspace_id IN (
    SELECT organization_id FROM organization_super_admins
    WHERE user_id = auth.uid()
  )
  OR
  -- Normal user with permission
  user_can(auth.uid(), 'read', 'boards', workspace_id)
);
```

**Reference file to consult:**
- **Data model**: [DATA_MODEL.md](references/DATA_MODEL.md) - Tables, RLS patterns, database functions

### Phase 7: PRD Documentation

**Include in your PRD (`00-master-prd.md`):**

1. **Feature Metadata**
   - Feature slug (e.g., `kanban`)
   - Feature category (e.g., `productivity`)
   - Target workspaces (organization, project, or both)

2. **Permission Matrix**
   - Complete list of resources
   - All permissions with format `resource.action`
   - Visibility permission (usually `{primary_resource}.read`)

3. **Role Definitions** (if creating default roles)
   - Role name and scope (organization/project)
   - Permissions assigned to each role
   - Use cases for each role

4. **Special Role Behavior**
   - What Owner can do
   - What Super Admin can do
   - Any restrictions or protected actions

5. **Workspace Integration**
   - How feature activates
   - Configuration options
   - Dependencies on other features

6. **Data Contracts** (in entities.ts)
   - Zod schemas for all resources
   - Feature definition schema
   - Permission schemas

**Reference file to consult:**
- **Business rules**: [BUSINESS_RULES.md](references/BUSINESS_RULES.md) - Complete ruleset for workspaces, features, permissions, roles

## Common Architect Mistakes to Avoid

❌ **Assuming feature inheritance** between org and projects
✅ Each workspace activates features independently

❌ **Creating "Owner of project"** role
✅ Owner only exists at organization level

❌ **Hardcoding Owner/Super Admin permissions** in permission tables
✅ Owner/Super Admin use bypass logic, not permission tables

❌ **Mixing business logic with permissions**
✅ Permissions are pure access control; business rules go in use cases

❌ **Forgetting workspace_id in entities**
✅ All feature entities must reference workspace

❌ **Creating permissions without resources**
✅ Always define resources first, then permissions on those resources

❌ **Ignoring RLS in schema design**
✅ Plan RLS policies during entity design

## Quick Reference Checklist

Before delivering PRD, verify:

- [ ] Feature slug is unique and descriptive
- [ ] All resources identified and documented
- [ ] Permissions follow `resource.action` format
- [ ] Visibility permission clearly identified
- [ ] Owner behavior documented
- [ ] Super Admin restrictions documented
- [ ] Workspace scope defined (org/project/both)
- [ ] entities.ts includes all Zod schemas
- [ ] Schema includes workspace_id foreign keys
- [ ] RLS policies planned for all tables
- [ ] No assumptions about feature inheritance
- [ ] No "Owner of project" concepts

## Reference Files

Load these files as needed for detailed information:

- **[CONCEPTS.md](references/CONCEPTS.md)**: Core definitions (Workspace, Feature, Resource, Permission, Role)
- **[WORKSPACES.md](references/WORKSPACES.md)**: Organization vs Project architecture, independence rules
- **[FEATURES.md](references/FEATURES.md)**: Feature catalog, activation, configuration, independence
- **[PERMISSIONS.md](references/PERMISSIONS.md)**: Granular permissions, roles, assignment, verification
- **[SPECIAL_ROLES.md](references/SPECIAL_ROLES.md)**: Owner and Super Admin privileges, restrictions, hierarchy
- **[VISIBILITY.md](references/VISIBILITY.md)**: UI visibility system, feature gates, permission-based rendering
- **[DATA_MODEL.md](references/DATA_MODEL.md)**: Database schema patterns, RLS policies, functions
- **[BUSINESS_RULES.md](references/BUSINESS_RULES.md)**: Complete ruleset (all RN-* rules from concepto-base.md)

## Output Format

When using this skill, structure your PRD with these sections:

```markdown
## Feature Metadata
- Slug: [feature-slug]
- Category: [category]
- Workspace Scope: [organization|project|both]
- Mandatory: [yes|no]

## Resources and Permissions

### Resources
- [resource-name]: [description]

### Permissions
- [resource].[action]: [description]

### Visibility Permission
- [resource].[action]: Grants UI visibility

## Role Definitions (if applicable)

### [Role Name]
- Scope: [organization|project]
- Permissions: [list]
- Use Case: [description]

## Special Role Behavior

### Owner
- [specific behaviors]

### Super Admin
- [specific behaviors]
- Restrictions: [what they cannot do]

## Workspace Integration
- Activation: [automatic|manual]
- Configuration: [config options]
- Dependencies: [required features]

## Data Contracts (entities.ts)

[Zod schemas]
```

## Final Note

This system is **highly modular and flexible**. The key is understanding that:

1. **Workspaces are independent** - No sharing, no inheritance
2. **Features are modular** - Can be activated anywhere
3. **Permissions are contextual** - Only apply in specific workspace
4. **Owner/Super Admin are special** - Bypass normal rules with specific restrictions

When in doubt, consult the reference files and remember: **explicit is better than implicit**.
