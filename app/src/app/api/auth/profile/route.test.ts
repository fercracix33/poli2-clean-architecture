import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, PUT, GET } from './route';
import { createUserProfile } from '@/features/auth/use-cases/createUserProfile';
import { updateUserProfile } from '@/features/auth/use-cases/updateUserProfile';
import { getUserProfile } from '@/features/auth/use-cases/getUserProfile';
import { requireAuthenticatedUser, AuthError } from '@/lib/auth';

const FIXED_ISO_DATE = '2024-01-01T00:00:00.000Z';

// Mock use cases
vi.mock('@/features/auth/use-cases/createUserProfile', () => ({
  createUserProfile: vi.fn(),
}));

vi.mock('@/features/auth/use-cases/updateUserProfile', () => ({
  updateUserProfile: vi.fn(),
}));

vi.mock('@/features/auth/use-cases/getUserProfile', () => ({
  getUserProfile: vi.fn(),
}));

// Mock auth utilities (partial mock to keep AuthError)
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return {
    ...actual,
    requireAuthenticatedUser: vi.fn(),
  };
});

const createUserProfileMock = vi.mocked(createUserProfile);
const updateUserProfileMock = vi.mocked(updateUserProfile);
const getUserProfileMock = vi.mocked(getUserProfile);
const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAuthenticatedUserMock.mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
    });

    createUserProfileMock.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date(FIXED_ISO_DATE),
      updated_at: undefined,
      avatar_url: undefined,
    });

    updateUserProfileMock.mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Updated Name',
      created_at: new Date(FIXED_ISO_DATE),
      updated_at: new Date(FIXED_ISO_DATE),
      avatar_url: 'https://example.com/avatar.jpg',
    });

    getUserProfileMock.mockResolvedValue({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Existing User',
      created_at: new Date(FIXED_ISO_DATE),
      updated_at: new Date(FIXED_ISO_DATE),
      avatar_url: 'https://example.com/avatar.jpg',
    });
  });

  describe('POST /api/auth/profile', () => {
    it('should create user profile with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const payload = await response.json();
      expect(payload).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: FIXED_ISO_DATE,
      });
      expect(createUserProfileMock).toHaveBeenCalledWith(
        'user-123',
        'test@example.com',
        'Test User',
        undefined,
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      requireAuthenticatedUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401));

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
      expect(createUserProfileMock).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid request body', async () => {
      createUserProfileMock.mockRejectedValueOnce(new Error('Invalid email format'));

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Invalid email format' });
    });

    it('should create profile using authenticated user email when payload omits it', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(createUserProfileMock).toHaveBeenCalledWith(
        'user-123',
        'user@example.com',
        'Test User',
        undefined,
      );
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Name',
          avatar_url: 'https://example.com/avatar.jpg',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload).toMatchObject({
        id: 'user-123',
        name: 'Updated Name',
        updated_at: FIXED_ISO_DATE,
      });
      expect(updateUserProfileMock).toHaveBeenCalledWith(
        'user-123',
        'user-123',
        {
          name: 'Updated Name',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      requireAuthenticatedUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401));

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Name',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
      expect(updateUserProfileMock).not.toHaveBeenCalled();
    });

    it('should return 403 for unauthorized profile updates', async () => {
      updateUserProfileMock.mockRejectedValueOnce(new Error('Unauthorized to update this profile'));

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Name',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await PUT(request);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Unauthorized to update this profile' });
    });

    it('should return 400 for invalid update data', async () => {
      updateUserProfileMock.mockRejectedValueOnce(new Error('No valid data provided for update'));

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: '',
          avatar_url: 'invalid-url',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'No valid data provided for update' });
    });

    it('should return 200 with updated profile', async () => {
      const updatedProfile = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Another Name',
        created_at: new Date(FIXED_ISO_DATE),
        updated_at: new Date('2024-01-02T00:00:00.000Z'),
        avatar_url: 'https://example.com/updated-avatar.jpg',
      };
      updateUserProfileMock.mockResolvedValueOnce(updatedProfile);

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Another Name',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload).toMatchObject({
        id: 'user-123',
        name: 'Another Name',
        updated_at: '2024-01-02T00:00:00.000Z',
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload).toMatchObject({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Existing User',
        created_at: FIXED_ISO_DATE,
      });
      expect(getUserProfileMock).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 for unauthenticated requests', async () => {
      requireAuthenticatedUserMock.mockRejectedValueOnce(new AuthError('Unauthorized', 401));

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'GET',
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
      expect(getUserProfileMock).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent profile', async () => {
      getUserProfileMock.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Profile not found' });
    });

    it('should return 200 with profile data', async () => {
      const profile = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Existing User',
        created_at: new Date(FIXED_ISO_DATE),
        updated_at: new Date('2024-01-03T00:00:00.000Z'),
        avatar_url: undefined,
      };
      getUserProfileMock.mockResolvedValueOnce(profile);

      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload).toMatchObject({
        id: 'user-123',
        name: 'Existing User',
        created_at: FIXED_ISO_DATE,
        updated_at: '2024-01-03T00:00:00.000Z',
      });
    });
  });
});
