import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock server-only module to allow testing of server components
vi.mock('server-only', () => ({}))

// Mock organization service for use case tests
vi.mock('@/features/organizations/services/organization.service', () => ({
  isUserMemberOfOrganization: vi.fn().mockResolvedValue(true),
  getUserPermissionsInOrganization: vi.fn().mockResolvedValue(['project.create', 'project.update', 'project.delete']),
  getRoleByNameFromDB: vi.fn().mockResolvedValue({ id: 'admin-role-id', name: 'Admin' }),
}))