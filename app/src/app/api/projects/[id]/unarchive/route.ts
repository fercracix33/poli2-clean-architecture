/**
 * Unarchive Project API Endpoint
 *
 * POST /api/projects/:id/unarchive - Unarchive project
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { unarchiveProject } from '@/features/projects/use-cases/unarchiveProject';

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await unarchiveProject(user.id, id);

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error('Error unarchiving project:', error);

    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (error.message === 'NOT_ARCHIVED') {
      return NextResponse.json({ error: 'Project is not archived' }, { status: 409 });
    }
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'You do not have permission to unarchive this project' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
