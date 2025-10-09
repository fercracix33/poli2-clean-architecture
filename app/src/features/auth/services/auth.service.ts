import { createClient } from '@/lib/supabase-server';
import {
  UserProfile,
  Organization,
  OrganizationMember,
  OrganizationCreate,
  UserProfileUpdate
} from '../entities';

// ============================================================================
// USER PROFILE SERVICES
// ============================================================================

/**
 * Crear perfil de usuario en base de datos
 * Acceso directo a Supabase sin lógica de negocio
 */
export async function createUserProfileInDB(
  userId: string,
  profileData: { email: string; name: string; avatar_url?: string }
): Promise<UserProfile> {
  const supabase = await createClient();

  const response = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: profileData.email,
      name: profileData.name,
      avatar_url: profileData.avatar_url,
    })
    .select()
    .single();

  const data = response?.data as UserProfile | null;
  const error = response?.error;

  if (error) {
    console.error('Error creating user profile:', error);

    if (error.code === '23505') {
      if (error.message.includes('email')) {
        throw new Error('Email already exists.');
      }

      throw new Error('User profile already exists.');
    }

    throw new Error('Could not create user profile.');
  }

  if (!data) {
    throw new Error('Could not create user profile.');
  }

  return data;
}

export async function getUserProfileFromDB(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const response = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const data = response?.data as UserProfile | null;
  const error = response?.error;

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching user profile:', error);
    throw new Error('Could not fetch user profile.');
  }

  return data ?? null;
}

export async function updateUserProfileInDB(
  userId: string,
  data: UserProfileUpdate
): Promise<UserProfile> {
  const supabase = await createClient();

  const response = await supabase
    .from('user_profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  const result = response?.data as UserProfile | null;
  const error = response?.error;

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('User profile not found.');
    }

    console.error('Error updating user profile:', error);
    throw new Error('Could not update user profile.');
  }

  if (!result) {
    throw new Error('Could not update user profile.');
  }

  return result;
}
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

  try {
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error && error.code === 'PGRST116') {
      return true; // No encontrado = disponible
    }

    return false; // Encontrado = no disponible
  } catch {
    // Si hay error, asumimos que no está disponible por seguridad
    return false;
  }
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
  let inviteCode = generateInviteCode();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (!existing) {
      isUnique = true;
    } else {
      inviteCode = generateInviteCode();
      attempts++;
    }
  }

  if (!isUnique) {
    throw new Error('Could not generate unique invite code. Please try again.');
  }

  try {
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
      console.error('Error creating organization:', error);
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
 * Obtener organizaciones del usuario
 */
export async function getUserOrganizationsFromDB(
  userId: string
): Promise<Organization[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members!inner(user_id)
      `)
      .eq('organization_members.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user organizations:', error);
      throw new Error('Could not fetch user organizations.');
    }

    return data || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not fetch user organizations.');
  }
}

/**
 * Obtener creador de organización
 * NUEVA FUNCIÓN REQUERIDA POR CASOS DE USO
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

// ============================================================================
// ORGANIZATION MEMBERSHIP SERVICES
// ============================================================================

/**
 * Añadir usuario a organización
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
        user_profile:user_profiles(*),
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
 * NUEVA FUNCIÓN REQUERIDA POR CASOS DE USO
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

    return permissionsData.map((item: { permissions: { name: string } }) => item.permissions.name);
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