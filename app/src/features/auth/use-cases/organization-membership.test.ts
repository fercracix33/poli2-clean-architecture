import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listOrganizationMembers, removeOrganizationMember } from './manageOrganizationMembers';
import * as authService from '../services/auth.service';
import { createClient } from '@/lib/supabase-server';

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  getOrganizationMembersFromDB: vi.fn(),
  removeUserFromOrganizationInDB: vi.fn(),
  getUserRoleInOrganization: vi.fn(),
  userHasPermissionInOrganization: vi.fn(),
  getRoleByNameFromDB: vi.fn(),
  getOrganizationCreatorFromDB: vi.fn(),
  countOrganizationAdminsFromDB: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const getOrganizationMembersFromDB = vi.mocked(authService.getOrganizationMembersFromDB);
const removeUserFromOrganizationInDB = vi.mocked(authService.removeUserFromOrganizationInDB);
const getUserRoleInOrganization = vi.mocked(authService.getUserRoleInOrganization);
const userHasPermissionInOrganization = vi.mocked(authService.userHasPermissionInOrganization);
const getRoleByNameFromDB = vi.mocked(authService.getRoleByNameFromDB);
const getOrganizationCreatorFromDB = vi.mocked(authService.getOrganizationCreatorFromDB);
const countOrganizationAdminsFromDB = vi.mocked(authService.countOrganizationAdminsFromDB);

const ORGANIZATION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const REQUESTING_USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const TARGET_USER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ADMIN_ROLE_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const MEMBERS = [
  {
    id: 'membership-1',
    organization_id: ORGANIZATION_ID,
    user_id: REQUESTING_USER_ID,
    role_id: ADMIN_ROLE_ID,
    joined_at: new Date().toISOString(),
    invited_by: null,
    user_profile: {
      id: REQUESTING_USER_ID,
      email: 'owner@example.com',
      name: 'Owner',
      created_at: new Date().toISOString(),
    },
    role: { name: 'organization_admin' },
  },
];

describe('Organization membership use cases', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({} as any);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('listOrganizationMembers', () => {
    it('returns members when requester has permission', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);
      getOrganizationMembersFromDB.mockResolvedValue(MEMBERS as any);

      const result = await listOrganizationMembers(ORGANIZATION_ID, REQUESTING_USER_ID, 25, 0);

      expect(userHasPermissionInOrganization).toHaveBeenCalledWith(
        REQUESTING_USER_ID,
        ORGANIZATION_ID,
        'user.read',
      );
      expect(getOrganizationMembersFromDB).toHaveBeenCalledWith(ORGANIZATION_ID, 25, 0);
      expect(result).toEqual(MEMBERS);
    });

    it('throws when requester lacks permission', async () => {
      userHasPermissionInOrganization.mockResolvedValue(false);

      await expect(listOrganizationMembers(ORGANIZATION_ID, REQUESTING_USER_ID)).rejects.toThrow(
        'Access denied to organization members',
      );
      expect(getOrganizationMembersFromDB).not.toHaveBeenCalled();
    });

    it('validates pagination window', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);

      await expect(listOrganizationMembers(ORGANIZATION_ID, REQUESTING_USER_ID, 0)).rejects.toThrow(
        'Limit must be between 1 and 100',
      );

      await expect(listOrganizationMembers(ORGANIZATION_ID, REQUESTING_USER_ID, 10, -5)).rejects.toThrow(
        'Offset must be non-negative',
      );
    });

    it('wraps database errors with a generic message', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);
      getOrganizationMembersFromDB.mockRejectedValue(new Error('connection lost'));

      await expect(listOrganizationMembers(ORGANIZATION_ID, REQUESTING_USER_ID)).rejects.toThrow(
        'Could not fetch organization members.',
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('removeOrganizationMember', () => {
    it('removes member and logs the operation when validations pass', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);
      getOrganizationCreatorFromDB.mockResolvedValue('creator-id');
      getUserRoleInOrganization.mockResolvedValue(ADMIN_ROLE_ID);
      getRoleByNameFromDB.mockResolvedValue({ id: ADMIN_ROLE_ID } as any);
      countOrganizationAdminsFromDB.mockResolvedValue(2);
      removeUserFromOrganizationInDB.mockResolvedValue();

      await removeOrganizationMember(ORGANIZATION_ID, TARGET_USER_ID, REQUESTING_USER_ID);

      expect(removeUserFromOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, TARGET_USER_ID);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'User removed from organization',
        expect.objectContaining({
          organizationId: ORGANIZATION_ID,
          targetUserId: TARGET_USER_ID,
          requestingUserId: REQUESTING_USER_ID,
          action: 'remove_member',
        }),
      );
    });

    it('rejects when requester lacks manage permission', async () => {
      userHasPermissionInOrganization.mockResolvedValue(false);

      await expect(
        removeOrganizationMember(ORGANIZATION_ID, TARGET_USER_ID, REQUESTING_USER_ID),
      ).rejects.toThrow('Insufficient permissions to remove user');
      expect(removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });

    it('prevents removing the organization creator', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);
      getOrganizationCreatorFromDB.mockResolvedValue(TARGET_USER_ID);

      await expect(
        removeOrganizationMember(ORGANIZATION_ID, TARGET_USER_ID, REQUESTING_USER_ID),
      ).rejects.toThrow('Cannot remove organization creator');
      expect(removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });

    it('prevents removing the last administrator', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);
      getOrganizationCreatorFromDB.mockResolvedValue('another-creator');
      getUserRoleInOrganization.mockResolvedValue(ADMIN_ROLE_ID);
      getRoleByNameFromDB.mockResolvedValue({ id: ADMIN_ROLE_ID } as any);
      countOrganizationAdminsFromDB.mockResolvedValue(1);

      await expect(
        removeOrganizationMember(ORGANIZATION_ID, TARGET_USER_ID, REQUESTING_USER_ID),
      ).rejects.toThrow('Cannot remove last administrator');
      expect(removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });

    it('propagates database errors from removal', async () => {
      userHasPermissionInOrganization.mockResolvedValue(true);
      getOrganizationCreatorFromDB.mockResolvedValue('another-creator');
      getUserRoleInOrganization.mockResolvedValue(null);
      getRoleByNameFromDB.mockResolvedValue({ id: ADMIN_ROLE_ID } as any);
      countOrganizationAdminsFromDB.mockResolvedValue(2);
      removeUserFromOrganizationInDB.mockRejectedValue(new Error('Unexpected failure'));

      await expect(
        removeOrganizationMember(ORGANIZATION_ID, TARGET_USER_ID, REQUESTING_USER_ID),
      ).rejects.toThrow('Unexpected failure');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
