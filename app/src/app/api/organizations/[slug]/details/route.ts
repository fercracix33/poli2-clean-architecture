/**
 * GET /api/organizations/[slug]/details
 *
 * Returns organization details with user permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationDetails } from '@/features/organizations/use-cases/getOrganizationDetails';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getOrganizationDetails(slug, user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching organization details:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('not a member')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
