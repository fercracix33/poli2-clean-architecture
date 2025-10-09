import { UserProfile } from '../entities';
import { createUserProfileInDB } from '../services/auth.service';
import { validateUUID, validateAndSanitizeUserName } from '@/lib/validation';

/**
 * Crear perfil de usuario con validaciones completas
 * @param userId - ID del usuario (debe ser UUID válido)
 * @param email - Email del usuario
 * @param name - Nombre del usuario (será sanitizado)
 * @param avatarUrl - URL del avatar (opcional)
 * @returns Promise<UserProfile> - Perfil creado
 * @throws Error si la validación falla o hay error en BD
 */
export async function createUserProfile(
  userId: string,
  email: string,
  name: string,
  avatarUrl?: string
): Promise<UserProfile> {
  validateUUID(userId, 'User ID');

  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a valid string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  const sanitizedName = validateAndSanitizeUserName(name);

  try {
    return await createUserProfileInDB(userId, {
      email,
      name: sanitizedName,
      avatar_url: avatarUrl,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Email already exists.' || error.message === 'User profile already exists.') {
        throw error;
      }
    }

    throw new Error('Could not create user profile.');
  }
}