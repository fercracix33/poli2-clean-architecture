/**
 * Auth Feature - Data Service
 *
 * Pure data access layer for user profiles and authentication.
 * NO business logic, NO validations (use cases handle business logic).
 *
 * Updated by: Architect Agent (Architectural Refactoring Phase 0)
 * Date: 2025-10-10
 * Changes: Removed organization-related functions (moved to features/organizations/services/organization.service.ts)
 */

import { createClient } from '@/lib/supabase-server';
import {
  UserProfile,
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
