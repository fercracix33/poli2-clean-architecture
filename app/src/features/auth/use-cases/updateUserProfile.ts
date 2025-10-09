import { UserProfile, UserProfileUpdate, UserProfileUpdateSchema } from '../entities';
import { updateUserProfileInDB, getUserProfileFromDB } from '../services/auth.service';
import { validateUUID, validateUpdateData, validateAndSanitizeUserName } from '@/lib/validation';

/**
 * Actualizar perfil de usuario con validaciones de autorizaci�n
 * @param userId - ID del usuario que actualiza
 * @param targetUserId - ID del usuario a actualizar
 * @param data - Datos a actualizar
 * @returns Promise<UserProfile> - Perfil actualizado
 * @throws Error si la validaci�n falla o no tiene autorizaci�n
 */
export async function updateUserProfile(
  userId: string,
  targetUserId: string,
  data: unknown
): Promise<UserProfile> {
  validateUUID(userId, 'User ID');
  validateUUID(targetUserId, 'Target User ID');

  if (userId !== targetUserId) {
    throw new Error('Unauthorized to update this profile');
  }

  validateUpdateData(data as Record<string, unknown>);

  const validatedData = UserProfileUpdateSchema.parse(data);

  if (validatedData.avatar_url) {
    if (typeof validatedData.avatar_url !== 'string') {
      throw new Error('Avatar URL must be a string');
    }

    try {
      new URL(validatedData.avatar_url);
    } catch {
      throw new Error('Invalid avatar URL format');
    }

    if (/javascript:|data:|vbscript:/i.test(validatedData.avatar_url)) {
      throw new Error('Invalid data format');
    }
  }

  if (validatedData.name) {
    try {
      validatedData.name = validateAndSanitizeUserName(validatedData.name);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid characters in name')) {
        throw new Error('Invalid data format');
      }

      throw error;
    }
  }

  const existingProfile = await getUserProfileFromDB(targetUserId);
  if (!existingProfile) {
    throw new Error('User profile not found.');
  }

  try {
    return await updateUserProfileInDB(targetUserId, validatedData);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User profile not found.') {
        throw error;
      }
    }

    throw new Error('Could not update user profile.');
  }
}
