import { NextRequest } from 'next/server';
import { getUserOrganizations } from '@/features/organizations/use-cases/getUserOrganizations';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';

function handleError(error: unknown, logLabel: string): Response {
  console.error(logLabel, error);

  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { id } = await requireAuthenticatedUser(request);
    const organizations = await getUserOrganizations(id);

    return Response.json(organizations, { status: 200 });
  } catch (error) {
    return handleError(error, 'Error fetching user organizations');
  }
}
