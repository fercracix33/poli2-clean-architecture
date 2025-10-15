/**
 * Test Fixtures - Standardized UUIDs and Test Data
 *
 * Provides consistent, valid test data across all test files.
 * All IDs are valid UUIDs to pass Zod validation in entities.
 *
 * Created by: Implementer Agent
 * Date: 2025-10-15
 */

/**
 * Standard UUIDs for testing
 * These are v4 UUIDs that will pass z.string().uuid() validation
 */
export const TEST_UUIDS = {
  // Users
  user1: '550e8400-e29b-41d4-a716-446655440001',
  user2: '550e8400-e29b-41d4-a716-446655440002',
  user3: '550e8400-e29b-41d4-a716-446655440003',
  adminUser: '550e8400-e29b-41d4-a716-446655440004',
  guestUser: '550e8400-e29b-41d4-a716-446655440005',

  // Organizations
  org1: '650e8400-e29b-41d4-a716-446655440001',
  org2: '650e8400-e29b-41d4-a716-446655440002',
  org3: '650e8400-e29b-41d4-a716-446655440003',

  // Projects
  project1: '750e8400-e29b-41d4-a716-446655440001',
  project2: '750e8400-e29b-41d4-a716-446655440002',
  project3: '750e8400-e29b-41d4-a716-446655440003',
  archivedProject: '750e8400-e29b-41d4-a716-446655440010',
  completedProject: '750e8400-e29b-41d4-a716-446655440011',

  // Roles
  adminRole: '850e8400-e29b-41d4-a716-446655440001',
  memberRole: '850e8400-e29b-41d4-a716-446655440002',
  viewerRole: '850e8400-e29b-41d4-a716-446655440003',

  // Project Members
  member1: '950e8400-e29b-41d4-a716-446655440001',
  member2: '950e8400-e29b-41d4-a716-446655440002',
  member3: '950e8400-e29b-41d4-a716-446655440003',

  // Permissions
  projectCreate: 'a50e8400-e29b-41d4-a716-446655440001',
  projectUpdate: 'a50e8400-e29b-41d4-a716-446655440002',
  projectDelete: 'a50e8400-e29b-41d4-a716-446655440003',
};

/**
 * Sample project data for testing
 */
export const SAMPLE_PROJECTS = {
  basic: {
    organization_id: TEST_UUIDS.org1,
    name: 'Test Project',
    slug: 'test-project',
    description: 'A test project for unit tests',
    status: 'active' as const,
    color: '#3B82F6',
    icon: '📁',
    is_favorite: false,
    settings: {},
  },
  minimal: {
    organization_id: TEST_UUIDS.org1,
    name: 'Minimal Project',
    slug: 'minimal-project',
    status: 'active' as const,
    is_favorite: false,
  },
  withLongName: {
    organization_id: TEST_UUIDS.org1,
    name: 'A'.repeat(100), // Max length
    slug: 'long-name-project',
    status: 'active' as const,
    is_favorite: false,
  },
  archived: {
    organization_id: TEST_UUIDS.org1,
    name: 'Archived Project',
    slug: 'archived-project',
    status: 'archived' as const,
    is_favorite: false,
  },
};

/**
 * Sample project member data for testing
 */
export const SAMPLE_PROJECT_MEMBERS = {
  admin: {
    project_id: TEST_UUIDS.project1,
    user_id: TEST_UUIDS.user1,
    role_id: TEST_UUIDS.adminRole,
  },
  member: {
    project_id: TEST_UUIDS.project1,
    user_id: TEST_UUIDS.user2,
    role_id: TEST_UUIDS.memberRole,
  },
  viewer: {
    project_id: TEST_UUIDS.project1,
    user_id: TEST_UUIDS.user3,
    role_id: TEST_UUIDS.viewerRole,
  },
};

/**
 * Full project object with all fields (for mocking service responses)
 */
export const createMockProject = (overrides: Partial<any> = {}) => ({
  id: TEST_UUIDS.project1,
  organization_id: TEST_UUIDS.org1,
  name: 'Mock Project',
  slug: 'mock-project',
  description: 'A mocked project',
  status: 'active' as const,
  color: '#3B82F6',
  icon: '📁',
  is_favorite: false,
  settings: {},
  created_by: TEST_UUIDS.user1,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  archived_at: null,
  ...overrides,
});

/**
 * Full project member object with all fields (for mocking service responses)
 */
export const createMockProjectMember = (overrides: Partial<any> = {}) => ({
  id: TEST_UUIDS.member1,
  project_id: TEST_UUIDS.project1,
  user_id: TEST_UUIDS.user1,
  role_id: TEST_UUIDS.adminRole,
  joined_at: new Date('2024-01-01T00:00:00Z'),
  invited_by: TEST_UUIDS.user1,
  ...overrides,
});
