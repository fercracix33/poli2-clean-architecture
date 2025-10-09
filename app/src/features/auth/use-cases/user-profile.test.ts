import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { createUserProfile } from './createUserProfile';
import { getUserProfile } from './getUserProfile';
import { updateUserProfile } from './updateUserProfile';
import { validateUserAccess } from './validateUserAccess';

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  createUserProfileInDB: vi.fn(),
  getUserProfileFromDB: vi.fn(),
  updateUserProfileInDB: vi.fn(),
  isUserMemberOfOrganization: vi.fn(),
  userHasPermissionInOrganization: vi.fn(),
}));

import * as authService from '../services/auth.service';
import { createClient } from '@/lib/supabase-server';
const ADMIN_USER_ID = '11111111-1111-4111-8111-111111111111';
const MEMBER_USER_ID = '22222222-2222-4222-8222-222222222222';
const EXTERNAL_USER_ID = '33333333-3333-4333-8333-333333333333';
const NEW_USER_ID = '44444444-4444-4444-8444-444444444444';
const ORGANIZATION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const ADMIN_PROFILE = {
  id: ADMIN_USER_ID,
  email: 'admin@example.com',
  name: 'Admin User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockCreateClient = vi.mocked(createClient);
const createUserProfileInDB = vi.mocked(authService.createUserProfileInDB);
const getUserProfileFromDB = vi.mocked(authService.getUserProfileFromDB);
const updateUserProfileInDB = vi.mocked(authService.updateUserProfileInDB);
const isUserMemberOfOrganization = vi.mocked(authService.isUserMemberOfOrganization);
const userHasPermissionInOrganization = vi.mocked(authService.userHasPermissionInOrganization);

describe('User profile use cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock createClient to return a mock supabase client
    mockCreateClient.mockResolvedValue({} as any);
  });

  describe('createUserProfile', () => {
    it('creates a profile with sanitized name and propagates Supabase data', async () => {
      const userId = NEW_USER_ID;
      const rawName = 'User Name';
      const email = 'user@example.com';
      const sanitizedName = 'User Name';
      const expectedProfile = {
        id: userId,
        email,
        name: sanitizedName,
        created_at: new Date().toISOString(),
      };

      createUserProfileInDB.mockResolvedValue(expectedProfile as any);

      const result = await createUserProfile(userId, email, rawName);

      expect(createUserProfileInDB).toHaveBeenCalledWith(userId, {
        email,
        name: sanitizedName,
      });
      expect(result).toEqual(expectedProfile);
    });

    it('rejects invalid UUIDs before touching Supabase', async () => {
      await expect(createUserProfile('invalid-uuid', 'user@example.com', 'User'))
        .rejects.toThrow('Invalid User ID format');
      expect(createUserProfileInDB).not.toHaveBeenCalled();
    });

    it('rejects invalid email format', async () => {
      await expect(createUserProfile(NEW_USER_ID, 'invalid-email', 'User'))
        .rejects.toThrow('Invalid email format');
      expect(createUserProfileInDB).not.toHaveBeenCalled();
    });

    it('rethrows known Supabase errors', async () => {
      createUserProfileInDB.mockRejectedValue(new Error('Email already exists.'));

      await expect(createUserProfile(NEW_USER_ID, 'user@example.com', 'User'))
        .rejects.toThrow('Email already exists.');
    });

    it('wraps unknown errors with generic message', async () => {
      createUserProfileInDB.mockRejectedValue(new Error('Unexpected failure'));

      await expect(createUserProfile(NEW_USER_ID, 'user@example.com', 'User'))
        .rejects.toThrow('Could not create user profile.');
    });
  });

  describe('getUserProfile', () => {
    it('returns the profile when Supabase finds it', async () => {
      const profile = ADMIN_PROFILE;
      getUserProfileFromDB.mockResolvedValue(profile);

      const result = await getUserProfile(ADMIN_USER_ID);

      expect(getUserProfileFromDB).toHaveBeenCalledWith(ADMIN_USER_ID);
      expect(result).toEqual(profile);
    });

    it('returns null when Supabase returns null', async () => {
      getUserProfileFromDB.mockResolvedValue(null);

      const result = await getUserProfile(ADMIN_USER_ID);

      expect(result).toBeNull();
    });

    it('propagates Supabase errors', async () => {
      getUserProfileFromDB.mockRejectedValue(new Error('Could not fetch user profile.'));

      await expect(getUserProfile(ADMIN_USER_ID)).rejects.toThrow('Could not fetch user profile.');
    });
  });

  describe('updateUserProfile', () => {
    const baseProfile = ADMIN_PROFILE;

    beforeEach(() => {
      getUserProfileFromDB.mockResolvedValue(baseProfile);
    });

    it('updates and sanitizes incoming data', async () => {
      const updatePayload = {
        name: 'New Name',
        avatar_url: 'https://example.com/avatar.png',
      };
      const sanitizedName = 'New Name';
      const updatedProfile = {
        ...baseProfile,
        name: sanitizedName,
        avatar_url: updatePayload.avatar_url,
        updated_at: new Date().toISOString(),
      };

      updateUserProfileInDB.mockResolvedValue(updatedProfile as any);

      const result = await updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, updatePayload);

      expect(updateUserProfileInDB).toHaveBeenCalledWith(ADMIN_USER_ID, {
        name: sanitizedName,
        avatar_url: updatePayload.avatar_url,
      });
      expect(result).toEqual(updatedProfile);
    });

    it('rejects unauthorized updates', async () => {
      await expect(updateUserProfile(ADMIN_USER_ID, MEMBER_USER_ID, { name: 'Test' }))
        .rejects.toThrow('Unauthorized to update this profile');
      expect(updateUserProfileInDB).not.toHaveBeenCalled();
    });

    it('rejects empty update payloads', async () => {
      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, {}))
        .rejects.toThrow('No valid data provided for update');
      expect(updateUserProfileInDB).not.toHaveBeenCalled();
    });

    it('rejects invalid avatar URLs', async () => {
      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, { avatar_url: 'not-a-url' }))
        .rejects.toThrow(ZodError);
    });

    it('rejects malicious avatar URLs', async () => {
      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, { avatar_url: 'javascript:alert(1)' }))
        .rejects.toThrow('Invalid data format');
    });

    it('rejects malicious names', async () => {
      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, { name: '<script>alert(1)</script>' }))
        .rejects.toThrow('Invalid data format');
    });

    it('throws when target profile does not exist', async () => {
      getUserProfileFromDB.mockResolvedValueOnce(null);

      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, { name: 'Test' }))
        .rejects.toThrow('User profile not found.');
    });

    it('rethrows known Supabase not-found errors', async () => {
      updateUserProfileInDB.mockRejectedValue(new Error('User profile not found.'));

      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, { name: 'Test' }))
        .rejects.toThrow('User profile not found.');
    });

    it('wraps unexpected Supabase errors with generic message', async () => {
      updateUserProfileInDB.mockRejectedValue(new Error('Permission denied'));

      await expect(updateUserProfile(ADMIN_USER_ID, ADMIN_USER_ID, { name: 'Test' }))
        .rejects.toThrow('Could not update user profile.');
    });
  });

  describe('validateUserAccess', () => {
    const organizationId = ORGANIZATION_ID;

    it('returns false when the user is not a member', async () => {
      isUserMemberOfOrganization.mockResolvedValue(false);

      const result = await validateUserAccess(EXTERNAL_USER_ID, organizationId);

      expect(result).toBe(false);
      expect(userHasPermissionInOrganization).not.toHaveBeenCalled();
    });

    it('returns true for members when no specific permission is required', async () => {
      isUserMemberOfOrganization.mockResolvedValue(true);

      const result = await validateUserAccess(MEMBER_USER_ID, organizationId);

      expect(result).toBe(true);
    });

    it('checks permissions when required', async () => {
      isUserMemberOfOrganization.mockResolvedValue(true);
      userHasPermissionInOrganization.mockResolvedValue(true);

      const result = await validateUserAccess(ADMIN_USER_ID, organizationId, 'organization.manage');

      expect(userHasPermissionInOrganization).toHaveBeenCalledWith(
        ADMIN_USER_ID,
        organizationId,
        'organization.manage',
      );
      expect(result).toBe(true);
    });

    it('returns false when permission check fails', async () => {
      isUserMemberOfOrganization.mockResolvedValue(true);
      userHasPermissionInOrganization.mockResolvedValue(false);

      const result = await validateUserAccess(ADMIN_USER_ID, organizationId, 'organization.manage');

      expect(result).toBe(false);
    });

    it('propagates errors from membership check', async () => {
      isUserMemberOfOrganization.mockRejectedValue(new Error('Connection error'));

      await expect(validateUserAccess(ADMIN_USER_ID, organizationId, 'organization.manage'))
        .rejects.toThrow('Connection error');
    });
  });
});
