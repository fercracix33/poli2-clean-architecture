/**
 * DELETE /api/organizations/[slug]/members/[memberId]
 *
 * Removes a member from an organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeOrganizationMember } from '@/features/organizations/use-cases/manageOrganizationMembers';
import { createClient } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; memberId: string }> }
) {
  try {
    const { slug, memberId } = await params;
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

    await removeOrganizationMember(org.id, memberId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('creator') || error.message.includes('last admin')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
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
