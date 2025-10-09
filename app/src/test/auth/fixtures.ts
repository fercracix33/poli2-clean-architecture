// Test fixtures for auth feature
import { 
  UserProfile, 
  Organization, 
  OrganizationMember, 
  Role, 
  Permission 
} from '../entities';

// Mock User IDs
export const MOCK_USER_IDS = {
  ADMIN: 'admin-user-id-123',
  MEMBER: 'member-user-id-456',
  EXTERNAL: 'external-user-id-789',
  NEW_USER: 'new-user-id-000',
} as const;

// Mock Organization IDs
export const MOCK_ORG_IDS = {
  ACME_CORP: 'org-acme-corp-123',
  TECH_STARTUP: 'org-tech-startup-456',
  CONSULTING: 'org-consulting-789',
} as const;

// Mock Role IDs
export const MOCK_ROLE_IDS = {
  SYSTEM_ADMIN: 'role-system-admin-123',
  ORG_ADMIN: 'role-org-admin-456',
  ORG_MEMBER: 'role-org-member-789',
  PROJECT_MANAGER: 'role-project-manager-000',
} as const;

// Valid User Profiles
export const mockUserProfiles: Record<string, UserProfile> = {
  admin: {
    id: MOCK_USER_IDS.ADMIN,
    email: 'admin@acmecorp.com',
    name: 'Admin User',
    avatar_url: 'https://example.com/avatar-admin.jpg',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  },
  member: {
    id: MOCK_USER_IDS.MEMBER,
    email: 'member@acmecorp.com',
    name: 'Member User',
    created_at: new Date('2024-01-02T00:00:00Z'),
  },
  external: {
    id: MOCK_USER_IDS.EXTERNAL,
    email: 'external@othercorp.com',
    name: 'External User',
    created_at: new Date('2024-01-03T00:00:00Z'),
  },
};

// Valid Organizations
export const mockOrganizations: Record<string, Organization> = {
  acmeCorp: {
    id: MOCK_ORG_IDS.ACME_CORP,
    name: 'ACME Corporation',
    slug: 'acme-corp',
    invite_code: 'ACME1234',
    description: 'A leading technology company',
    created_by: MOCK_USER_IDS.ADMIN,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  },
  techStartup: {
    id: MOCK_ORG_IDS.TECH_STARTUP,
    name: 'Tech Startup Inc',
    slug: 'tech-startup',
    invite_code: 'TECH5678',
    description: 'Innovative startup focused on AI',
    created_by: MOCK_USER_IDS.MEMBER,
    created_at: new Date('2024-01-02T00:00:00Z'),
  },
  consulting: {
    id: MOCK_ORG_IDS.CONSULTING,
    name: 'Consulting Solutions',
    slug: 'consulting-solutions',
    invite_code: 'CONS9012',
    created_by: MOCK_USER_IDS.EXTERNAL,
    created_at: new Date('2024-01-03T00:00:00Z'),
  },
};

// Valid Organization Members
export const mockOrganizationMembers: OrganizationMember[] = [
  {
    id: 'member-1',
    organization_id: MOCK_ORG_IDS.ACME_CORP,
    user_id: MOCK_USER_IDS.ADMIN,
    role_id: MOCK_ROLE_IDS.ORG_ADMIN,
    joined_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'member-2',
    organization_id: MOCK_ORG_IDS.ACME_CORP,
    user_id: MOCK_USER_IDS.MEMBER,
    role_id: MOCK_ROLE_IDS.ORG_MEMBER,
    joined_at: new Date('2024-01-02T00:00:00Z'),
    invited_by: MOCK_USER_IDS.ADMIN,
  },
];

// Valid Permissions
export const mockPermissions: Permission[] = [
  {
    id: 'perm-org-manage',
    name: 'organization.manage',
    description: 'Control total de la organización',
    resource: 'organization',
    action: 'manage',
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'perm-user-invite',
    name: 'user.invite',
    description: 'Invitar usuarios a la organización',
    resource: 'user',
    action: 'invite',
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'perm-project-create',
    name: 'project.create',
    description: 'Crear nuevos proyectos',
    resource: 'project',
    action: 'create',
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
];

// Valid Roles
export const mockRoles: Role[] = [
  {
    id: MOCK_ROLE_IDS.ORG_ADMIN,
    name: 'organization_admin',
    description: 'Administrador de organización con control total',
    organization_id: undefined, // Sistema
    is_system_role: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: MOCK_ROLE_IDS.ORG_MEMBER,
    name: 'organization_member',
    description: 'Miembro básico de organización',
    organization_id: undefined, // Sistema
    is_system_role: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
];

// Invalid data for testing validation
export const invalidData = {
  userProfile: {
    emptyName: {
      id: MOCK_USER_IDS.NEW_USER,
      email: 'test@example.com',
      name: '', // Inválido: muy corto
      created_at: new Date(),
    },
    longName: {
      id: MOCK_USER_IDS.NEW_USER,
      email: 'test@example.com',
      name: 'a'.repeat(101), // Inválido: muy largo
      created_at: new Date(),
    },
    invalidEmail: {
      id: MOCK_USER_IDS.NEW_USER,
      email: 'invalid-email', // Inválido: formato incorrecto
      name: 'Valid Name',
      created_at: new Date(),
    },
  },
  organization: {
    emptyName: {
      name: '', // Inválido: muy corto
      slug: 'valid-slug',
      description: 'Valid description',
    },
    invalidSlug: {
      name: 'Valid Organization',
      slug: 'Invalid Slug!', // Inválido: caracteres especiales
      description: 'Valid description',
    },
    longDescription: {
      name: 'Valid Organization',
      slug: 'valid-slug',
      description: 'a'.repeat(501), // Inválido: muy largo
    },
  },
  inviteCode: {
    tooShort: 'ABC123', // Inválido: menos de 8 caracteres
    tooLong: 'ABCDEFGHI', // Inválido: más de 8 caracteres
    invalidChars: 'ABC123!@', // Inválido: caracteres especiales
  },
};

// Mock Supabase responses
export const mockSupabaseResponses = {
  success: {
    data: mockUserProfiles.admin,
    error: null,
  },
  notFound: {
    data: null,
    error: { code: 'PGRST116', message: 'Not found' },
  },
  uniqueViolation: {
    data: null,
    error: { code: '23505', message: 'Unique constraint violation' },
  },
  connectionError: {
    data: null,
    error: { code: 'CONNECTION_ERROR', message: 'Database connection failed' },
  },
  authError: {
    data: null,
    error: { code: 'AUTH_ERROR', message: 'Authentication required' },
  },
};

// Mock auth.uid() responses
export const mockAuthUid = {
  admin: () => MOCK_USER_IDS.ADMIN,
  member: () => MOCK_USER_IDS.MEMBER,
  external: () => MOCK_USER_IDS.EXTERNAL,
  unauthenticated: () => null,
};