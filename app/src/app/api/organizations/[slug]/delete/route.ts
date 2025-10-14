/**
 * DELETE /api/organizations/[slug]/delete
 *
 * Delete an organization (owner only)
 * Requires name confirmation in request body
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteOrganization } from '@/features/organizations/use-cases/deleteOrganization';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const DeleteOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required for confirmation'),
});

export async function DELETE(
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
    const validatedData = DeleteOrgSchema.parse(body);

    await deleteOrganization(org.id, user.id, { name: validatedData.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Organization name is required for confirmation' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('permission') || error.message.includes('owner')) {
        return NextResponse.json(
          { error: 'Only the organization owner can delete the organization' },
          { status: 403 }
        );
      }
      if (error.message.includes('does not match')) {
        return NextResponse.json(
          { error: 'Organization name does not match. Deletion cancelled.' },
          { status: 400 }
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
