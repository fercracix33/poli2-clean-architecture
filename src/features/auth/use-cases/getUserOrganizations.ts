import { Organization } from '../entities';
import { getUserOrganizationsFromDB } from '../services/auth.service';
import { validateUUID } from '@/lib/validation';

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  validateUUID(userId, 'User ID');

  try {
    const organizations = await getUserOrganizationsFromDB(userId);
    return organizations;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    throw new Error('Could not fetch user organizations.');
  }
}
