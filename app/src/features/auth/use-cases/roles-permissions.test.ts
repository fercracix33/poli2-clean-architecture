import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserPermissions } from './getUserPermissions';
import * as authService from '../services/auth.service';
import { createClient } from '@/lib/supabase-server';

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  getUserPermissionsInOrganization: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const getUserPermissionsInOrganization = vi.mocked(authService.getUserPermissionsInOrganization);

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ORGANIZATION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PERMISSIONS = [
  {
    id: 'perm-organization-manage',
    name: 'organization.manage',
    description: 'Manage organization',
    resource: 'organization',
    action: 'manage',
    created_at: new Date().toISOString(),
  },
];

describe('getUserPermissions use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({} as any);
  });

  it('returns permissions provided by the data layer', async () => {
    getUserPermissionsInOrganization.mockResolvedValue(PERMISSIONS as any);

    const result = await getUserPermissions(USER_ID, ORGANIZATION_ID);

    expect(getUserPermissionsInOrganization).toHaveBeenCalledWith(USER_ID, ORGANIZATION_ID);
    expect(result).toEqual(PERMISSIONS);
  });

  it('validates UUIDs before calling Supabase', async () => {
    await expect(getUserPermissions('invalid-uuid', ORGANIZATION_ID)).rejects.toThrow(
      'Invalid User ID format',
    );
    expect(getUserPermissionsInOrganization).not.toHaveBeenCalled();

    await expect(getUserPermissions(USER_ID, 'invalid-org')).rejects.toThrow(
      'Invalid Organization ID format',
    );
    expect(getUserPermissionsInOrganization).not.toHaveBeenCalled();
  });

  it('propagates errors from the data layer', async () => {
    getUserPermissionsInOrganization.mockRejectedValue(new Error('Connection error'));

    await expect(getUserPermissions(USER_ID, ORGANIZATION_ID)).rejects.toThrow('Connection error');
  });
});
