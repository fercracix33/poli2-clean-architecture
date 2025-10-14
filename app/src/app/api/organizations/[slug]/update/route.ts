/**
 * PATCH /api/organizations/[slug]/update
 *
 * Updates organization details (name, description)
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateOrganizationDetails } from '@/features/organizations/use-cases/updateOrganizationDetails';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const UpdateOrgSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function PATCH(
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

    // Parse request body
    const body = await request.json();
    const validatedData = UpdateOrgSchema.parse(body);

    await updateOrganizationDetails(org.id, user.id, validatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating organization:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('permission') || error.message.includes('admin')) {
        return NextResponse.json(
          { error: 'Access denied. Admin permissions required.' },
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
