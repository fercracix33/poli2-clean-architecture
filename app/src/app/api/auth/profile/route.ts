import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { createUserProfile } from '@/features/auth/use-cases/createUserProfile';
import { updateUserProfile } from '@/features/auth/use-cases/updateUserProfile';
import { getUserProfile } from '@/features/auth/use-cases/getUserProfile';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';

async function parseJson<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON payload');
  }
}

function handleError(error: unknown, logLabel: string): Response {
  console.error(logLabel, error);

  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const message = error.errors[0]?.message ?? 'Invalid request body';
    return Response.json({ error: message }, { status: 400 });
  }

  if (error instanceof Error) {
    const normalized = error.message;

    if (normalized === 'Profile not found') {
      return Response.json({ error: normalized }, { status: 404 });
    }

    if (normalized === 'Unauthorized to update this profile') {
      return Response.json({ error: normalized }, { status: 403 });
    }

    if (
      normalized === 'Email is required and must be a valid string' ||
      normalized === 'Invalid JSON payload' ||
      normalized === 'No valid data provided for update' ||
      normalized.startsWith('Invalid')
    ) {
      return Response.json({ error: normalized }, { status: 400 });
    }

    return Response.json({ error: normalized }, { status: 500 });
  }

  return Response.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { id } = await requireAuthenticatedUser(request);
    const profile = await getUserProfile(id);

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json(profile, { status: 200 });
  } catch (error) {
    return handleError(error, 'Error fetching user profile');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, email: userEmail } = await requireAuthenticatedUser(request);
    const payload = await parseJson<{ email?: string; name: string; avatar_url?: string }>(request);

    const email = payload.email ?? userEmail;

    if (!email) {
      throw new Error('Email is required and must be a valid string');
    }

    const profile = await createUserProfile(id, email, payload.name, payload.avatar_url);

    return Response.json(profile, { status: 201 });
  } catch (error) {
    return handleError(error, 'Error creating user profile');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id } = await requireAuthenticatedUser(request);
    const payload = await parseJson<Record<string, unknown>>(request);

    const updatedProfile = await updateUserProfile(id, id, payload);

    return Response.json(updatedProfile, { status: 200 });
  } catch (error) {
    return handleError(error, 'Error updating user profile');
  }
}
