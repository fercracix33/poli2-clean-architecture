/**
 * Single Project API Endpoints
 *
 * GET    /api/projects/:id - Get project by ID
 * PATCH  /api/projects/:id - Update project
 * DELETE /api/projects/:id - Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getProjectById } from '@/features/projects/use-cases/getProjectById';
import { updateProject } from '@/features/projects/use-cases/updateProject';
import { deleteProject } from '@/features/projects/use-cases/deleteProject';
import { ProjectUpdateSchema } from '@/features/projects/entities';

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/:id
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await getProjectById(user.id, id);

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching project:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to view this project' }, { status: 403 });
    }
    if (error.message.includes('Invalid uuid')) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/:id
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = ProjectUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const project = await updateProject(user.id, id, validationResult.data);

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error('Error updating project:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to update this project' }, { status: 403 });
    }
    if (error.message.includes('Invalid uuid')) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/:id
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteProject(user.id, id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting project:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to delete this project' }, { status: 403 });
    }
    if (error.message.includes('Invalid uuid')) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
