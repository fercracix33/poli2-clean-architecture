/**
 * GET /api/organizations/[slug]/stats
 *
 * Retrieves organization statistics (member count, project count, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationStats } from '@/features/organizations/use-cases/getOrganizationStats';
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

    // Get organization ID from slug
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const stats = await getOrganizationStats(org.id, user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching organization stats:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
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
