import { OrganizationMember, OrganizationJoin, OrganizationJoinSchema } from '../entities';
import {
  getOrganizationBySlugAndCodeFromDB,
  isUserMemberOfOrganization,
  getRoleByNameFromDB,
  addUserToOrganizationInDB
} from '../services/auth.service';
import {
  validateUUID,
  validateOrganizationSlug,
  validateInviteCode
} from '@/lib/validation';

/**
 * Unirse a organización usando slug e invite code
 * @param data - Datos de unión (slug + invite_code)
 * @param userId - ID del usuario que se une
 * @returns Promise<OrganizationMember> - Membresía creada
 * @throws Error si la validación falla o hay error en BD
 */
export async function joinOrganization(
  data: unknown,
  userId: string
): Promise<OrganizationMember> {
  // Validación de UUID del usuario
  validateUUID(userId, 'User ID');
  
  // Validación con Zod schema
  const validatedData = OrganizationJoinSchema.parse(data);
  
  // Validaciones adicionales
  validateOrganizationSlug(validatedData.slug);
  validateInviteCode(validatedData.invite_code);

  // Buscar organización por slug e invite code
  const organization = await getOrganizationBySlugAndCodeFromDB(
    validatedData.slug,
    validatedData.invite_code
  );

  if (!organization) {
    throw new Error('Organization not found or invalid invite code');
  }

  // Verificar que el usuario no sea ya miembro
  const isAlreadyMember = await isUserMemberOfOrganization(userId, organization.id);
  if (isAlreadyMember) {
    throw new Error('User is already a member of this organization');
  }

  // Obtener rol de miembro por defecto
  const memberRole = await getRoleByNameFromDB('organization_member');
  if (!memberRole) {
    throw new Error('Default member role not found');
  }

  // Añadir usuario a la organización
  try {
    const membership = await addUserToOrganizationInDB(
      organization.id,
      userId,
      memberRole.id
    );
    
    // Log de operación sensible
    console.log('User joined organization', {
      organizationId: organization.id,
      userId,
      organizationName: organization.name,
      timestamp: new Date().toISOString()
    });
    
    return membership;
  } catch (error) {
    console.error('Error joining organization:', error);
    throw error; // Re-throw para mantener el mensaje específico
  }
}