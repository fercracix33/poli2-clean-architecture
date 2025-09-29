import { UserProfile } from '../entities';
import { getUserProfileFromDB } from '../services/auth.service';
import { validateUUID } from '@/lib/validation';

/**
 * Obtener perfil de usuario con validaciones
 * @param userId - ID del usuario
 * @returns Promise<UserProfile | null> - Perfil del usuario o null si no existe
 * @throws Error si la validación falla o hay error en BD
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Validación de UUID
  validateUUID(userId, 'User ID');

  // Obtener perfil desde la base de datos
  try {
    const userProfile = await getUserProfileFromDB(userId);
    return userProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error; // Re-throw para mantener el mensaje específico
  }
}