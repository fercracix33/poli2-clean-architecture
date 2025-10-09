import { createClient } from './supabase-server';
import type { NextRequest } from 'next/server';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const BEARER_PREFIX = 'Bearer ';

export function extractBearerToken(request: NextRequest): string {
  const authorization = request.headers.get('authorization') ?? '';

  if (!authorization.startsWith(BEARER_PREFIX)) {
    throw new AuthError('Unauthorized', 401);
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    throw new AuthError('Unauthorized', 401);
  }

  return token;
}

export async function validateAuthToken(request: NextRequest): Promise<string> {
  return extractBearerToken(request);
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export async function getCurrentUser(token?: string): Promise<AuthenticatedUser> {
  const supabase = await createClient();

  const { data, error } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  if (error || !data?.user) {
    throw new AuthError('Unauthorized', 401, error?.code);
  }

  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
  };
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser & { token?: string }> {
  let token: string | undefined;

  try {
    token = extractBearerToken(request);
  } catch (error) {
    if (!(error instanceof AuthError)) {
      throw error;
    }
    // No bearer token provided, fallback to cookie-based session
    token = undefined;
  }

  try {
    const user = await getCurrentUser(token);
    return token ? { ...user, token } : { ...user };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Unauthorized', 401);
  }
}
