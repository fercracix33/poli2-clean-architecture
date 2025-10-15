/**
 * Get Project by Slug API Endpoint
 *
 * GET /api/projects/slug/:organizationId/:slug - Get project by organization and slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getProjectBySlug } from '@/features/projects/use-cases/getProjectBySlug';

type Params = {
  params: Promise<{ organizationId: string; slug: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { organizationId, slug } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await getProjectBySlug(user.id, organizationId, slug);

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching project by slug:', error);

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
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
