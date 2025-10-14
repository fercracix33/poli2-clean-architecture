import {
  userHasPermissionInOrganization,
  isUserMemberOfOrganization
} from '../services/organization.service';
import { validateUUID } from '@/lib/validation';

/**
 * Validar acceso de usuario a una organización y operación específica
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @param requiredPermission - Permiso requerido (opcional)
 * @returns Promise<boolean> - true si el usuario tiene acceso
 * @throws Error si la validación falla o hay error en BD
 */
export async function validateUserAccess(
  userId: string,
  organizationId: string,
  requiredPermission?: string
): Promise<boolean> {
  // Validación de UUIDs
  validateUUID(userId, 'User ID');
  validateUUID(organizationId, 'Organization ID');

  try {
    // Verificar que el usuario es miembro de la organización
    const isMember = await isUserMemberOfOrganization(userId, organizationId);

    if (!isMember) {
      return false;
    }

    // Si no se requiere un permiso específico, con ser miembro es suficiente
    if (!requiredPermission) {
      return true;
    }

    // Verificar el permiso específico
    const hasPermission = await userHasPermissionInOrganization(
      userId,
      organizationId,
      requiredPermission
    );

    return hasPermission;
  } catch (error) {
    console.error('Error validating user access:', error);
    throw error; // Re-throw para mantener el mensaje específico
  }
}