/**
 * Projects API Endpoints
 *
 * POST   /api/projects - Create new project
 * GET    /api/projects - List projects with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createProject } from '@/features/projects/use-cases/createProject';
import { getProjects } from '@/features/projects/use-cases/getProjects';
import { ProjectCreateSchema, ProjectFilterSchema } from '@/features/projects/entities';

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ProjectCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Call use case
    const project = await createProject(user.id, validationResult.data);

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);

    // Handle specific business logic errors
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'You do not have permission to create projects' },
        { status: 403 }
      );
    }
    if (error.message === 'SLUG_ALREADY_EXISTS') {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 409 }
      );
    }
    if (error.message === 'MAX_PROJECTS_REACHED') {
      return NextResponse.json(
        { error: 'Maximum project limit reached for this organization' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects?organization_id=xxx&status=active&is_favorite=true&search=xxx
 * List projects with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      organization_id: searchParams.get('organization_id') || '',
      status: searchParams.get('status') || undefined,
      is_favorite: searchParams.get('is_favorite') === 'true' ? true : searchParams.get('is_favorite') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
      created_by: searchParams.get('created_by') || undefined,
    };

    // Validate filters
    const validationResult = ProjectFilterSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Call use case
    const projects = await getProjects(user.id, validationResult.data);

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching projects:', error);

    // Handle specific business logic errors
    if (error.message === 'NOT_MEMBER_OF_ORGANIZATION') {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'You do not have permission to view projects' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
