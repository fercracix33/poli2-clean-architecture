/**
 * Project Members API Endpoints
 *
 * GET  /api/projects/:id/members - Get project members
 * POST /api/projects/:id/members - Add project member
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getProjectMembers } from '@/features/projects/use-cases/getProjectMembers';
import { addProjectMember } from '@/features/projects/use-cases/addProjectMember';
import { ProjectMemberCreateSchema } from '@/features/projects/entities';

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/:id/members
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const members = await getProjectMembers(user.id, id);

    return NextResponse.json(members, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching project members:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to view project members' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects/:id/members
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Ensure project_id matches URL parameter
    const memberData = {
      ...body,
      project_id: id,
    };

    const validationResult = ProjectMemberCreateSchema.safeParse(memberData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await addProjectMember(user.id, validationResult.data);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding project member:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'USER_NOT_IN_ORGANIZATION') {
      return NextResponse.json({ error: 'User is not a member of this organization' }, { status: 400 });
    }
    if (error.message === 'ALREADY_MEMBER') {
      return NextResponse.json({ error: 'User is already a project member' }, { status: 409 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to add project members' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
