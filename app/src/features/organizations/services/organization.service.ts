/**
 * Organizations Feature - Data Service
 *
 * Pure data access layer for organizations, members, roles, and permissions.
 * NO business logic, NO validations (use cases handle business logic).
 *
 * Created by: Architect Agent (Architectural Refactoring Phase 0)
 * Date: 2025-10-10
 * Extracted from: features/auth/services/auth.service.ts
 */

import { createClient } from '@/lib/supabase-server';
import {
  Organization,
  OrganizationMember,
  OrganizationCreate,
} from '../entities';

// Import UserProfile from auth feature for member queries
import { UserProfile } from '@/features/auth/entities';

// ============================================================================
// ORGANIZATION SERVICES
// ============================================================================

/**
 * Verificar disponibilidad de slug de organización
 */
export async function isOrganizationSlugAvailable(
  slug: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle(); // Returns null if no rows, doesn't throw PGRST116

  if (error) {
    console.error('Error checking slug availability:', error);
    // If there's an error checking availability, assume it's available
    // The database unique constraint will catch actual duplicates during INSERT
    return true;
  }

  // null = no row found = slug available
  // row exists = slug not available
  return data === null;
}

/**
 * Generar código de invitación único
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Crear organización en base de datos
 */
export async function createOrganizationInDB(
  data: OrganizationCreate,
  userId: string
): Promise<Organization> {
  const supabase = await createClient();

  // Generar código de invitación único
  const inviteCode = generateInviteCode();

  // Since invite codes have 36^8 possibilities (~2.8 trillion),
  // collision is extremely unlikely. Skip uniqueness check for empty table
  // and let database unique constraint handle actual duplicates

  try {
    // Verify user is authenticated in Supabase context
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated in Supabase context');
    }

    console.log('[DEBUG] Supabase auth.uid():', user.id);
    console.log('[DEBUG] Passed userId:', userId);
    console.log('[DEBUG] Match:', user.id === userId);

    const { data: organization, error } = await supabase
      .from('organizations')
      .insert({
        ...data,
        invite_code: inviteCode,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Organization name or identifier already exists.');
      }
      throw new Error('Could not create organization.');
    }

    return organization;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not create organization.');
  }
}

/**
 * Obtener organización por slug (without invite code requirement)
 */
export async function getOrganizationBySlugFromDB(
  slug: string
): Promise<Organization | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error fetching organization:', error);
      throw new Error('Could not fetch organization.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Could not fetch organization.') {
      throw error;
    }
    return null;
  }
}

/**
 * Obtener organización por slug e invite code
 */
export async function getOrganizationBySlugAndCodeFromDB(
  slug: string,
  inviteCode: string
): Promise<Organization | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .eq('invite_code', inviteCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error fetching organization:', error);
      throw new Error('Could not fetch organization.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Could not fetch organization.') {
      throw error;
    }
    return null;
  }
}

/**
 * Obtener organización por ID
 */
export async function getOrganizationByIdFromDB(
  organizationId: string
): Promise<Organization | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching organization:', error);
      throw new Error('Could not fetch organization.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Could not fetch organization.') {
      throw error;
    }
    return null;
  }
}

/**
 * Obtener organizaciones del usuario
 *
 * FIXED: Uses SECURITY DEFINER function to avoid RLS infinite recursion
 * The function get_user_organizations() bypasses RLS and handles the JOIN internally
 */
export async function getUserOrganizationsFromDB(
  userId: string
): Promise<Organization[]> {
  const supabase = await createClient();

  try {
    // Use the SECURITY DEFINER function to avoid RLS recursion
    const { data, error } = await supabase
      .rpc('get_user_organizations', { p_user_id: userId });

    if (error) {
      // Si no hay resultados, devolver array vacío (no es error)
      if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
        return [];
      }
      console.error('Error fetching user organizations:', error);
      throw new Error('Could not fetch user organizations.');
    }

    return data || [];
  } catch (error) {
    // Si es un error de "no rows", devolver array vacío
    if (error instanceof Error && error.message.includes('No rows')) {
      return [];
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not fetch user organizations.');
  }
}

/**
 * Obtener creador de organización
 */
export async function getOrganizationCreatorFromDB(
  organizationId: string
): Promise<string | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('created_by')
      .eq('id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error fetching organization creator:', error);
      throw new Error('Could not fetch organization creator.');
    }

    return data.created_by;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    return null;
  }
}

/**
 * Actualizar detalles de organización
 */
export async function updateOrganizationInDB(
  organizationId: string,
  updates: Partial<Pick<Organization, 'name' | 'description'>>
): Promise<Organization> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      throw new Error('Could not update organization.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not update organization.');
  }
}

/**
 * Eliminar organización
 */
export async function deleteOrganizationFromDB(
  organizationId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organizationId);

    if (error) {
      console.error('Error deleting organization:', error);
      throw new Error('Could not delete organization.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not delete organization.');
  }
}

/**
 * Regenerar código de invitación
 */
export async function regenerateInviteCodeInDB(
  organizationId: string
): Promise<string> {
  const supabase = await createClient();

  // Generate new invite code
  // Since invite codes have 36^8 possibilities (~2.8 trillion),
  // collision is extremely unlikely. Let database unique constraint handle duplicates
  const inviteCode = generateInviteCode();

  try {
    const { error } = await supabase
      .from('organizations')
      .update({ invite_code: inviteCode })
      .eq('id', organizationId);

    if (error) {
      console.error('Error regenerating invite code:', error);

      // If unique constraint violation, try one more time with a new code
      if (error.code === '23505') {
        const newInviteCode = generateInviteCode();
        const { error: retryError } = await supabase
          .from('organizations')
          .update({ invite_code: newInviteCode })
          .eq('id', organizationId);

        if (retryError) {
          throw new Error('Could not generate unique invite code. Please try again.');
        }

        return newInviteCode;
      }

      throw new Error('Could not regenerate invite code.');
    }

    return inviteCode;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not regenerate invite code.');
  }
}

// ============================================================================
// ORGANIZATION MEMBERSHIP SERVICES
// ============================================================================

/**
 * Añadir primer miembro a organización nueva (bypasses RLS)
 *
 * CRITICAL: This function uses a SECURITY DEFINER database function to bypass RLS
 * for the first member insertion. This resolves the RLS recursion issue where
 * the policy checks if user is admin (which requires querying an empty table).
 *
 * Security validations (enforced in database function):
 * - User must be the organization creator
 * - Organization must have exactly 0 members
 * - User must be adding themselves
 *
 * For subsequent members, use addUserToOrganizationInDB() which uses normal RLS.
 */
export async function addFirstOrganizationMemberInDB(
  organizationId: string,
  userId: string,
  roleId: string
): Promise<OrganizationMember> {
  const supabase = await createClient();

  try {
    // Call SECURITY DEFINER function that bypasses RLS
    const { data: newMemberId, error: rpcError } = await supabase
      .rpc('add_first_organization_member', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_role_id: roleId,
      });

    if (rpcError) {
      console.error('Error adding first member:', rpcError);
      throw new Error(`Could not add first member: ${rpcError.message}`);
    }

    if (!newMemberId) {
      throw new Error('Could not add first member: No ID returned');
    }

    // Fetch the created member record
    const { data: member, error: fetchError } = await supabase
      .from('organization_members')
      .select()
      .eq('id', newMemberId)
      .single();

    if (fetchError || !member) {
      console.error('Error fetching created member:', fetchError);
      throw new Error('Could not fetch created member.');
    }

    return member;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not add first organization member.');
  }
}

/**
 * Añadir usuario a organización (normal RLS-protected insertion)
 *
 * Use this for adding members AFTER the first member has been added.
 * For the first member, use addFirstOrganizationMemberInDB() instead.
 */
export async function addUserToOrganizationInDB(
  organizationId: string,
  userId: string,
  roleId: string,
  invitedBy?: string
): Promise<OrganizationMember> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role_id: roleId,
        invited_by: invitedBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding user to organization:', error);
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User is already a member of this organization.');
      }
      throw new Error('Could not add user to organization.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not add user to organization.');
  }
}

/**
 * Verificar si usuario es miembro de organización
 */
export async function isUserMemberOfOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code === 'PGRST116') {
      return false; // No encontrado = no es miembro
    }

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Obtener rol de usuario en organización
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<string | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role_id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No es miembro
      }
      console.error('Error fetching user role:', error);
      throw new Error('Could not fetch user role.');
    }

    return data.role_id;
  } catch (error) {
    if (error instanceof Error && error.message === 'Could not fetch user role.') {
      throw error;
    }
    return null;
  }
}

/**
 * Obtener miembros de organización con paginación
 */
export async function getOrganizationMembersFromDB(
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<(OrganizationMember & { user_profile: UserProfile; role: { name: string } })[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        user_profile:user_profiles!organization_members_user_id_fkey(*),
        role:roles(name)
      `)
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching organization members:', error);
      throw new Error('Could not fetch organization members.');
    }

    return data || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not fetch organization members.');
  }
}

/**
 * Remover usuario de organización
 */
export async function removeUserFromOrganizationInDB(
  organizationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing user from organization:', error);
      throw new Error('Could not remove user from organization.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not remove user from organization.');
  }
}

/**
 * Contar administradores en organización
 */
export async function countOrganizationAdminsFromDB(
  organizationId: string,
  adminRoleId: string
): Promise<number> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('role_id', adminRoleId);

    if (error) {
      console.error('Error counting organization admins:', error);
      throw new Error('Could not count organization admins.');
    }

    return data?.length || 0;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    return 0;
  }
}

/**
 * Contar total de miembros en organización
 */
export async function countOrganizationMembersFromDB(
  organizationId: string
): Promise<number> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error counting organization members:', error);
      throw new Error('Could not count organization members.');
    }

    return data?.length || 0;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    return 0;
  }
}

// ============================================================================
// ROLES AND PERMISSIONS SERVICES
// ============================================================================

/**
 * Obtener rol por nombre
 */
export async function getRoleByNameFromDB(
  name: string,
  organizationId?: string
): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('roles')
      .select('id, name')
      .eq('name', name);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    } else {
      query = query.is('organization_id', null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error fetching role:', error);
      throw new Error('Could not fetch role.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Could not fetch role.') {
      throw error;
    }
    return null;
  }
}

/**
 * Obtener permisos de usuario en organización
 */
export async function getUserPermissionsInOrganization(
  userId: string,
  organizationId: string
): Promise<string[]> {
  const supabase = await createClient();

  try {
    // Consulta simplificada para evitar problemas de tipado
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('role_id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (memberError || !memberData) {
      console.error('Error fetching user role:', memberError);
      return [];
    }

    // Obtener permisos del rol
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('role_permissions')
      .select(`
        permissions!inner(name)
      `)
      .eq('role_id', memberData.role_id);

    if (permissionsError) {
      console.error('Error fetching role permissions:', permissionsError);
      return [];
    }

    // Manejar la estructura de datos correctamente
    if (!permissionsData || !Array.isArray(permissionsData)) {
      return [];
    }

    // TypeScript fix: Handle the actual structure returned by Supabase
    return permissionsData.map((item: any) => item.permissions.name);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Verificar si usuario tiene permiso específico
 */
export async function userHasPermissionInOrganization(
  userId: string,
  organizationId: string,
  permissionName: string
): Promise<boolean> {
  try {
    const permissions = await getUserPermissionsInOrganization(userId, organizationId);
    return permissions.includes(permissionName);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}
