/**
 * Single Project Member API Endpoints
 *
 * PATCH  /api/projects/:id/members/:memberId - Update member role
 * DELETE /api/projects/:id/members/:memberId - Remove member
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { updateProjectMemberRole } from '@/features/projects/use-cases/updateProjectMemberRole';
import { removeProjectMember } from '@/features/projects/use-cases/removeProjectMember';

type Params = {
  params: Promise<{ id: string; memberId: string }>;
};

/**
 * PATCH /api/projects/:id/members/:memberId
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id, memberId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role_id } = body;

    if (!role_id) {
      return NextResponse.json({ error: 'role_id is required' }, { status: 400 });
    }

    await updateProjectMemberRole(user.id, id, memberId, role_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating project member role:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'USER_NOT_MEMBER') {
      return NextResponse.json({ error: 'User is not a project member' }, { status: 404 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to update member roles' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/:id/members/:memberId
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id, memberId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await removeProjectMember(user.id, id, memberId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error removing project member:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'USER_NOT_MEMBER') {
      return NextResponse.json({ error: 'User is not a project member' }, { status: 404 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to remove project members' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
