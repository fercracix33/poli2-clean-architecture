import { OrganizationMember } from '../entities';
import { UserProfile } from '@/features/auth/entities';
import {
  getOrganizationMembersFromDB,
  removeUserFromOrganizationInDB,
  getUserRoleInOrganization,
  userHasPermissionInOrganization,
  getRoleByNameFromDB,
  getOrganizationCreatorFromDB,
  countOrganizationAdminsFromDB
} from '../services/organization.service';
import { validateUUID } from '@/lib/validation';

/**
 * Listar miembros de organización con validación de permisos
 * @param organizationId - ID de la organización
 * @param requestingUserId - ID del usuario que solicita
 * @param limit - Límite de resultados
 * @param offset - Offset para paginación
 * @returns Promise<OrganizationMember[]> - Lista de miembros
 */
export async function listOrganizationMembers(
  organizationId: string,
  requestingUserId: string,
  limit: number = 50,
  offset: number = 0
): Promise<(OrganizationMember & { user_profile: UserProfile; role: { name: string } })[]> {
  // Validaciones básicas
  validateUUID(organizationId, 'Organization ID');
  validateUUID(requestingUserId, 'User ID');

  // Verificar que el usuario tiene permiso para ver miembros
  const hasPermission = await userHasPermissionInOrganization(
    requestingUserId,
    organizationId,
    'user.read'
  );

  if (!hasPermission) {
    throw new Error('Access denied to organization members');
  }

  // Validar parámetros de paginación
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  if (offset < 0) {
    throw new Error('Offset must be non-negative');
  }

  try {
    const members = await getOrganizationMembersFromDB(organizationId, limit, offset);
    return members;
  } catch (error) {
    console.error('Error listing organization members:', error);
    throw new Error('Could not fetch organization members.');
  }
}

/**
 * Remover usuario de organización con validaciones de negocio
 * @param organizationId - ID de la organización
 * @param targetUserId - ID del usuario a remover
 * @param requestingUserId - ID del usuario que solicita la remoción
 * @returns Promise<void>
 */
export async function removeOrganizationMember(
  organizationId: string,
  targetUserId: string,
  requestingUserId: string
): Promise<void> {
  // Validaciones básicas
  validateUUID(organizationId, 'Organization ID');
  validateUUID(targetUserId, 'Target User ID');
  validateUUID(requestingUserId, 'Requesting User ID');

  // Verificar que el usuario tiene permiso para gestionar miembros
  const hasPermission = await userHasPermissionInOrganization(
    requestingUserId,
    organizationId,
    'user.manage'
  );

  if (!hasPermission) {
    throw new Error('Insufficient permissions to remove user');
  }

  // Obtener información de la organización para validaciones
  const orgCreator = await getOrganizationCreatorFromDB(organizationId);
  if (!orgCreator) {
    throw new Error('Organization not found');
  }

  // Prevenir remover al creador de la organización
  if (targetUserId === orgCreator) {
    throw new Error('Cannot remove organization creator');
  }

  // Verificar si es el último administrador
  const targetUserRole = await getUserRoleInOrganization(targetUserId, organizationId);
  if (targetUserRole) {
    const role = await getRoleByNameFromDB('organization_admin');
    if (role && targetUserRole === role.id) {
      // Contar administradores en la organización
      const adminCount = await countOrganizationAdminsFromDB(organizationId, role.id);

      if (adminCount <= 1) {
        throw new Error('Cannot remove last administrator');
      }
    }
  }

  // Remover usuario de la organización
  try {
    await removeUserFromOrganizationInDB(organizationId, targetUserId);
    
    // Log de operación sensible
    console.log('User removed from organization', {
      organizationId,
      targetUserId,
      requestingUserId,
      action: 'remove_member',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing user from organization:', error);
    throw error; // Re-throw para mantener el mensaje específico
  }
}