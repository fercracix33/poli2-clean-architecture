import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { createOrganization } from '@/features/organizations/use-cases/createOrganization';
import { getUserOrganizations } from '@/features/organizations/use-cases/getUserOrganizations';
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

    if (normalized === 'Organization identifier already exists') {
      return Response.json({ error: normalized }, { status: 409 });
    }

    if (
      normalized === 'Invalid JSON payload' ||
      normalized.startsWith('Invalid') ||
      normalized.startsWith('Organization name')
    ) {
      return Response.json({ error: normalized }, { status: 400 });
    }

    return Response.json({ error: normalized }, { status: 500 });
  }

  return Response.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Starting GET /api/organizations');
    console.log('[DEBUG] Request URL:', request.url);

    const user = await requireAuthenticatedUser(request);
    console.log('[DEBUG] Authenticated user ID:', user.id);

    const organizations = await getUserOrganizations(user.id);
    console.log('[DEBUG] Organizations fetched:', organizations);

    return Response.json(organizations, { status: 200 });
  } catch (error) {
    console.error('[ERROR] GET /api/organizations failed');
    console.error('[ERROR] Error type:', error?.constructor?.name);
    console.error('[ERROR] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return handleError(error, 'Error fetching user organizations');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await requireAuthenticatedUser(request);
    const payload = await parseJson<unknown>(request);

    const organization = await createOrganization(payload, id);

    return Response.json(organization, { status: 201 });
  } catch (error) {
    return handleError(error, 'Error creating organization');
  }
}
