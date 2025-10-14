import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';
import { createOrganization } from './createOrganization';
import { joinOrganization } from './joinOrganization';
import { getUserOrganizations } from './getUserOrganizations';
import * as authService from '../services/organization.service';
import { createClient } from '@/lib/supabase-server';

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../services/organization.service', () => ({
  createOrganizationInDB: vi.fn(),
  isOrganizationSlugAvailable: vi.fn(),
  getRoleByNameFromDB: vi.fn(),
  addUserToOrganizationInDB: vi.fn(),
  getOrganizationBySlugAndCodeFromDB: vi.fn(),
  isUserMemberOfOrganization: vi.fn(),
  getUserOrganizationsFromDB: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const createOrganizationInDB = vi.mocked(authService.createOrganizationInDB);
const isOrganizationSlugAvailable = vi.mocked(authService.isOrganizationSlugAvailable);
const getRoleByNameFromDB = vi.mocked(authService.getRoleByNameFromDB);
const addUserToOrganizationInDB = vi.mocked(authService.addUserToOrganizationInDB);
const getOrganizationBySlugAndCodeFromDB = vi.mocked(authService.getOrganizationBySlugAndCodeFromDB);
const isUserMemberOfOrganization = vi.mocked(authService.isUserMemberOfOrganization);
const getUserOrganizationsFromDB = vi.mocked(authService.getUserOrganizationsFromDB);

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ORGANIZATION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const ORGANIZATION_PAYLOAD = {
  name: 'Acme Corp',
  slug: 'acme-corp',
  description: 'Leading the future',
};

const ORGANIZATION_RESPONSE = {
  id: ORGANIZATION_ID,
  ...ORGANIZATION_PAYLOAD,
  invite_code: 'INVITE01',
  created_by: USER_ID,
  created_at: new Date().toISOString(),
};

describe('Organization use cases', () => {
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

  describe('createOrganization', () => {
    it('creates the organization and assigns the creator as admin', async () => {
      vi.mocked(authService.isOrganizationSlugAvailable).mockResolvedValue(true);
      vi.mocked(authService.createOrganizationInDB).mockResolvedValue(ORGANIZATION_RESPONSE as any);
      vi.mocked(authService.getRoleByNameFromDB).mockResolvedValue({ id: 'admin-role-id' } as any);
      vi.mocked(authService.addUserToOrganizationInDB).mockResolvedValue({} as any);

      const result = await createOrganization(ORGANIZATION_PAYLOAD, USER_ID);

      expect(isOrganizationSlugAvailable).toHaveBeenCalledWith('acme-corp');
      expect(createOrganizationInDB).toHaveBeenCalledWith(
        {
          name: 'Acme Corp',
          slug: 'acme-corp',
          description: 'Leading the future',
        },
        USER_ID,
      );
      expect(addUserToOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, USER_ID, 'admin-role-id');
      expect(result).toEqual(ORGANIZATION_RESPONSE);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('fails when the system admin role is missing', async () => {
      vi.mocked(authService.isOrganizationSlugAvailable).mockResolvedValue(true);
      vi.mocked(authService.createOrganizationInDB).mockResolvedValue(ORGANIZATION_RESPONSE as any);
      vi.mocked(authService.getRoleByNameFromDB).mockResolvedValue(null);

      await expect(createOrganization(ORGANIZATION_PAYLOAD, USER_ID)).rejects.toThrow(
        'System admin role not found',
      );
      expect(addUserToOrganizationInDB).not.toHaveBeenCalled();
    });

    it('rejects invalid slugs before hitting the database', async () => {
      await expect(
        createOrganization({ ...ORGANIZATION_PAYLOAD, slug: 'Invalid Slug!' }, USER_ID),
      ).rejects.toThrow(ZodError);
      expect(isOrganizationSlugAvailable).not.toHaveBeenCalled();
    });
  });

  describe('joinOrganization', () => {
    it('enrolls the user when the invite is valid', async () => {
      vi.mocked(authService.getOrganizationBySlugAndCodeFromDB).mockResolvedValue({ id: ORGANIZATION_ID, name: 'Acme' } as any);
      vi.mocked(authService.isUserMemberOfOrganization).mockResolvedValue(false);
      vi.mocked(authService.getRoleByNameFromDB).mockResolvedValue({ id: 'member-role-id' } as any);
      vi.mocked(authService.addUserToOrganizationInDB).mockResolvedValue({ id: 'membership-id' } as any);

      const result = await joinOrganization({ slug: 'acme-corp', invite_code: 'INVITE01' }, USER_ID);

      expect(result).toEqual({ id: 'membership-id' });
      expect(addUserToOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, USER_ID, 'member-role-id');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('rejects when the user is already a member', async () => {
      vi.mocked(authService.getOrganizationBySlugAndCodeFromDB).mockResolvedValue({ id: ORGANIZATION_ID, name: 'Acme' } as any);
      vi.mocked(authService.isUserMemberOfOrganization).mockResolvedValue(true);

      await expect(
        joinOrganization({ slug: 'acme-corp', invite_code: 'INVITE01' }, USER_ID),
      ).rejects.toThrow('User is already a member of this organization');
      expect(addUserToOrganizationInDB).not.toHaveBeenCalled();
    });

    it('relies on Zod validation for malformed invites', async () => {
      await expect(joinOrganization({ slug: 'acme-corp', invite_code: 'short' }, USER_ID)).rejects.toThrow(
        ZodError,
      );
    });
  });

  describe('getUserOrganizations', () => {
    it('returns organizations fetched from the data layer', async () => {
      vi.mocked(authService.getUserOrganizationsFromDB).mockResolvedValue([ORGANIZATION_RESPONSE] as any);

      const result = await getUserOrganizations(USER_ID);

      expect(getUserOrganizationsFromDB).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual([ORGANIZATION_RESPONSE]);
    });

    it('validates user ID format', async () => {
      await expect(getUserOrganizations('invalid-uuid')).rejects.toThrow('Invalid User ID format');
      expect(getUserOrganizationsFromDB).not.toHaveBeenCalled();
    });

    it('propagates Supabase errors', async () => {
      vi.mocked(authService.getUserOrganizationsFromDB).mockRejectedValue(new Error('Connection error'));

      await expect(getUserOrganizations(USER_ID)).rejects.toThrow('Could not fetch user organizations.');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
