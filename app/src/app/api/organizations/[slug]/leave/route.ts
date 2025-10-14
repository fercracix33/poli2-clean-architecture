/**
 * POST /api/organizations/[slug]/leave
 *
 * Leave an organization (cannot be used by owner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { leaveOrganization } from '@/features/organizations/use-cases/leaveOrganization';
import { createClient } from '@/lib/supabase-server';

export async function POST(
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

    await leaveOrganization(org.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving organization:', error);

    if (error instanceof Error) {
      if (error.message.includes('owner') || error.message.includes('creator')) {
        return NextResponse.json(
          { error: 'Organization owner cannot leave. Transfer ownership or delete the organization instead.' },
          { status: 400 }
        );
      }
      if (error.message.includes('not found') || error.message.includes('not a member')) {
        return NextResponse.json(
          { error: 'You are not a member of this organization' },
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
