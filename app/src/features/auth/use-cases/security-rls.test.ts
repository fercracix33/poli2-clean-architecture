import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';
import { createOrganization } from './createOrganization';
import { joinOrganization } from './joinOrganization';
import * as authService from '../services/auth.service';
import { createClient } from '@/lib/supabase-server';

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  createOrganizationInDB: vi.fn(),
  isOrganizationSlugAvailable: vi.fn(),
  getRoleByNameFromDB: vi.fn(),
  addUserToOrganizationInDB: vi.fn(),
  getOrganizationBySlugAndCodeFromDB: vi.fn(),
  isUserMemberOfOrganization: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const createOrganizationInDB = vi.mocked(authService.createOrganizationInDB);
const isOrganizationSlugAvailable = vi.mocked(authService.isOrganizationSlugAvailable);
const getRoleByNameFromDB = vi.mocked(authService.getRoleByNameFromDB);
const addUserToOrganizationInDB = vi.mocked(authService.addUserToOrganizationInDB);
const getOrganizationBySlugAndCodeFromDB = vi.mocked(authService.getOrganizationBySlugAndCodeFromDB);
const isUserMemberOfOrganization = vi.mocked(authService.isUserMemberOfOrganization);

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ORGANIZATION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ORGANIZATION_DATA = {
  name: 'ACME Corporation',
  slug: 'acme-corp',
  description: 'Innovation at scale',
};

const JOIN_PAYLOAD = {
  slug: 'acme-corp',
  inviteCode: 'INVITE01',
};

describe('Security-sensitive organization flows', () => {
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
    it('creates organization, assigns admin role and logs the operation', async () => {
      isOrganizationSlugAvailable.mockResolvedValue(true);
      createOrganizationInDB.mockResolvedValue({ id: ORGANIZATION_ID, ...ORGANIZATION_DATA } as any);
      getRoleByNameFromDB.mockResolvedValue({ id: 'admin-role-id' } as any);
      addUserToOrganizationInDB.mockResolvedValue({} as any);

      const result = await createOrganization(ORGANIZATION_DATA, USER_ID);

      expect(isOrganizationSlugAvailable).toHaveBeenCalledWith('acme-corp');
      expect(createOrganizationInDB).toHaveBeenCalledWith(
        {
          name: ORGANIZATION_DATA.name,
          slug: ORGANIZATION_DATA.slug,
          description: ORGANIZATION_DATA.description,
        },
        USER_ID,
      );
      expect(addUserToOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, USER_ID, 'admin-role-id');
      expect(result.id).toBe(ORGANIZATION_ID);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Organization created',
        expect.objectContaining({
          organizationId: ORGANIZATION_ID,
          userId: USER_ID,
          slug: 'acme-corp',
        }),
      );
    });

    it('rejects when slug is already taken', async () => {
      isOrganizationSlugAvailable.mockResolvedValue(false);

      await expect(createOrganization(ORGANIZATION_DATA, USER_ID)).rejects.toThrow(
        'Organization identifier already exists',
      );
      expect(createOrganizationInDB).not.toHaveBeenCalled();
    });

    it('rejects malicious descriptions', async () => {
      const malicious = { ...ORGANIZATION_DATA, description: '<script>alert(1)</script>' };
      isOrganizationSlugAvailable.mockResolvedValue(true);

      await expect(createOrganization(malicious, USER_ID)).rejects.toThrow(
        'Invalid characters in description',
      );
      expect(createOrganizationInDB).not.toHaveBeenCalled();
    });
  });

  describe('joinOrganization', () => {
    it('adds the user as member when invite data is valid', async () => {
      getOrganizationBySlugAndCodeFromDB.mockResolvedValue({ id: ORGANIZATION_ID, name: 'ACME' } as any);
      isUserMemberOfOrganization.mockResolvedValue(false);
      getRoleByNameFromDB.mockResolvedValue({ id: 'member-role-id' } as any);
      addUserToOrganizationInDB.mockResolvedValue({ id: 'membership-id' } as any);

      const result = await joinOrganization({ slug: JOIN_PAYLOAD.slug, invite_code: JOIN_PAYLOAD.inviteCode }, USER_ID);

      expect(getOrganizationBySlugAndCodeFromDB).toHaveBeenCalledWith('acme-corp', 'INVITE01');
      expect(isUserMemberOfOrganization).toHaveBeenCalledWith(USER_ID, ORGANIZATION_ID);
      expect(addUserToOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, USER_ID, 'member-role-id');
      expect(result).toEqual({ id: 'membership-id' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'User joined organization',
        expect.objectContaining({ organizationId: ORGANIZATION_ID, userId: USER_ID }),
      );
    });

    it('rejects when the invite code is invalid', async () => {
      await expect(
        joinOrganization({ slug: 'acme-corp', invite_code: 'SHORT' }, USER_ID),
      ).rejects.toThrow(ZodError);
      expect(getOrganizationBySlugAndCodeFromDB).not.toHaveBeenCalled();
    });

    it('rejects when the user is already a member', async () => {
      getOrganizationBySlugAndCodeFromDB.mockResolvedValue({ id: ORGANIZATION_ID, name: 'ACME' } as any);
      isUserMemberOfOrganization.mockResolvedValue(true);

      await expect(
        joinOrganization({ slug: JOIN_PAYLOAD.slug, invite_code: JOIN_PAYLOAD.inviteCode }, USER_ID),
      ).rejects.toThrow('User is already a member of this organization');
      expect(addUserToOrganizationInDB).not.toHaveBeenCalled();
    });
  });
});
