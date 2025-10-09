import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserProfileInDB, updateUserProfileInDB, getUserProfileFromDB } from './auth.service';
import { MOCK_USER_IDS } from '../../../test/auth/fixtures';
import * as supabaseServer from '@/lib/supabase-server';

// Mock the createClient function
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

// Create a proper Supabase client mock
const createSupabaseMock = () => ({
  from: vi.fn(),
});

type SupabaseMock = ReturnType<typeof createSupabaseMock>;
let supabaseMock: SupabaseMock;

describe('Auth Service - Data Access Layer', () => {
  beforeEach(() => {
    supabaseMock = createSupabaseMock();
    vi.mocked(supabaseServer.createClient).mockResolvedValue(supabaseMock as any);
  });

  describe('createUserProfileInDB', () => {
    it('should create user profile in database and return the stored record', async () => {
      const payload = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const expectedProfile = {
        id: MOCK_USER_IDS.NEW_USER,
        email: payload.email,
        name: payload.name,
        created_at: new Date().toISOString(),
      };

      const single = vi.fn().mockResolvedValue({ data: expectedProfile, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      supabaseMock.from.mockReturnValue({ insert } as unknown as never);

      const result = await createUserProfileInDB(MOCK_USER_IDS.NEW_USER, payload);

      expect(result).toEqual(expectedProfile);
      expect(supabaseMock.from).toHaveBeenCalledWith('user_profiles');
      expect(insert).toHaveBeenCalledWith({
        id: MOCK_USER_IDS.NEW_USER,
        email: payload.email,
        name: payload.name,
      });
      expect(select).toHaveBeenCalledWith();
      expect(single).toHaveBeenCalledWith();
    });

    it('should throw explicit error when email already exists', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "user_profiles_email_key"' },
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      supabaseMock.from.mockReturnValue({ insert } as unknown as never);

      await expect(
        createUserProfileInDB(MOCK_USER_IDS.NEW_USER, {
          email: 'existing@example.com',
          name: 'Existing User',
        }),
      ).rejects.toThrow('Email already exists.');
    });

    it('should throw specific error when user profile already exists with another constraint', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "user_profiles_pkey"' },
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      supabaseMock.from.mockReturnValue({ insert } as unknown as never);

      await expect(
        createUserProfileInDB(MOCK_USER_IDS.NEW_USER, {
          email: 'new@example.com',
          name: 'New User',
        }),
      ).rejects.toThrow('User profile already exists.');
    });

    it('should throw generic error when Supabase insert fails for another reason', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'permission denied' },
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      supabaseMock.from.mockReturnValue({ insert } as unknown as never);

      await expect(
        createUserProfileInDB(MOCK_USER_IDS.NEW_USER, {
          email: 'test@example.com',
          name: 'Test User',
        }),
      ).rejects.toThrow('Could not create user profile.');
    });

    it('should throw if Supabase returns no data and no error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      supabaseMock.from.mockReturnValue({ insert } as unknown as never);

      await expect(
        createUserProfileInDB(MOCK_USER_IDS.NEW_USER, {
          email: 'test@example.com',
          name: 'Test User',
        }),
      ).rejects.toThrow('Could not create user profile.');
    });
  });

  describe('getUserProfileFromDB', () => {
    it('should retrieve user profile by ID', async () => {
      const expectedProfile = {
        id: MOCK_USER_IDS.ADMIN,
        email: 'admin@example.com',
        name: 'Admin User',
        created_at: new Date().toISOString(),
      };
      const single = vi.fn().mockResolvedValue({ data: expectedProfile, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ select } as unknown as never);

      const result = await getUserProfileFromDB(MOCK_USER_IDS.ADMIN);

      expect(result).toEqual(expectedProfile);
      expect(supabaseMock.from).toHaveBeenCalledWith('user_profiles');
      expect(select).toHaveBeenCalledWith('*');
      expect(eq).toHaveBeenCalledWith('id', MOCK_USER_IDS.ADMIN);
      expect(single).toHaveBeenCalledWith();
    });

    it('should return null when profile is not found', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ select } as unknown as never);

      const result = await getUserProfileFromDB('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error when query fails with unexpected error code', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'permission denied' },
      });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ select } as unknown as never);

      await expect(getUserProfileFromDB(MOCK_USER_IDS.ADMIN)).rejects.toThrow('Could not fetch user profile.');
    });

    it('should return null when Supabase resolves with undefined data and no error', async () => {
      const single = vi.fn().mockResolvedValue({ data: undefined, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ select } as unknown as never);

      const result = await getUserProfileFromDB(MOCK_USER_IDS.ADMIN);

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfileInDB', () => {
    it('should update existing user profile and return the new data', async () => {
      const updatePayload = { name: 'Updated Name', avatar_url: 'https://example.com/avatar.png' };
      const expectedProfile = {
        id: MOCK_USER_IDS.ADMIN,
        email: 'admin@example.com',
        name: updatePayload.name,
        avatar_url: updatePayload.avatar_url,
        updated_at: new Date().toISOString(),
      };
      const single = vi.fn().mockResolvedValue({ data: expectedProfile, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ update } as unknown as never);

      const result = await updateUserProfileInDB(MOCK_USER_IDS.ADMIN, updatePayload);

      expect(result).toEqual(expectedProfile);
      expect(supabaseMock.from).toHaveBeenCalledWith('user_profiles');
      expect(update).toHaveBeenCalledWith(updatePayload);
      expect(eq).toHaveBeenCalledWith('id', MOCK_USER_IDS.ADMIN);
      expect(select).toHaveBeenCalledWith();
      expect(single).toHaveBeenCalledWith();
    });

    it('should throw when user profile is not found', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ update } as unknown as never);

      await expect(
        updateUserProfileInDB(MOCK_USER_IDS.ADMIN, { name: 'Updated Name' }),
      ).rejects.toThrow('User profile not found.');
    });

    it('should throw generic error when Supabase update fails with unexpected code', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'permission denied' },
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ update } as unknown as never);

      await expect(
        updateUserProfileInDB(MOCK_USER_IDS.ADMIN, { name: 'Updated Name' }),
      ).rejects.toThrow('Could not update user profile.');
    });

    it('should throw when Supabase returns no data after update', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      supabaseMock.from.mockReturnValue({ update } as unknown as never);

      await expect(
        updateUserProfileInDB(MOCK_USER_IDS.ADMIN, { name: 'Updated Name' }),
      ).rejects.toThrow('Could not update user profile.');
    });
  });
});
