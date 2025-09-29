import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { joinOrganization } from '@/features/auth/use-cases/joinOrganization';
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

    if (normalized === 'Organization not found or invalid invite code') {
      return Response.json({ error: normalized }, { status: 404 });
    }

    if (normalized === 'User is already a member of this organization') {
      return Response.json({ error: normalized }, { status: 409 });
    }

    if (
      normalized === 'Invalid JSON payload' ||
      normalized.startsWith('Invalid')
    ) {
      return Response.json({ error: normalized }, { status: 400 });
    }

    return Response.json({ error: normalized }, { status: 500 });
  }

  return Response.json({ error: 'Internal server error' }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await requireAuthenticatedUser(request);
    const payload = await parseJson<{ slug: string; inviteCode: string }>(request);

    const membership = await joinOrganization(
      {
        slug: payload.slug,
        invite_code: payload.inviteCode,
      },
      id
    );

    return Response.json(membership, { status: 201 });
  } catch (error) {
    return handleError(error, 'Error joining organization');
  }
}
