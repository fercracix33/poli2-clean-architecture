import { getUserPermissionsInOrganization } from '../services/organization.service';
import { validateUUID } from '@/lib/validation';

/**
 * Obtener permisos de usuario en una organización con validaciones
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @returns Promise<string[]> - Lista de nombres de permisos del usuario
 * @throws Error si la validación falla o hay error en BD
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<string[]> {
  // Validación de UUIDs
  validateUUID(userId, 'User ID');
  validateUUID(organizationId, 'Organization ID');

  // Obtener permisos desde la base de datos
  try {
    const permissions = await getUserPermissionsInOrganization(userId, organizationId);
    return permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    throw error; // Re-throw para mantener el mensaje específico
  }
}