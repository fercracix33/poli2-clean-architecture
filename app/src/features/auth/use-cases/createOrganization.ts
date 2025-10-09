import { Organization, OrganizationCreate, OrganizationCreateSchema } from '../entities';
import {
  createOrganizationInDB,
  isOrganizationSlugAvailable,
  getRoleByNameFromDB,
  addUserToOrganizationInDB
} from '../services/auth.service';
import {
  validateUUID,
  validateAndSanitizeOrganizationName,
  validateOrganizationSlug,
  checkRateLimit
} from '@/lib/validation';

/**
 * Crear organización con validaciones completas
 * @param data - Datos de la organización
 * @param userId - ID del usuario creador
 * @returns Promise<Organization> - Organización creada
 * @throws Error si la validación falla o hay error en BD
 */
export async function createOrganization(
  data: unknown,
  userId: string
): Promise<Organization> {
  // Validación de UUID del usuario
  validateUUID(userId, 'User ID');
  
  // Rate limiting - máximo 5 organizaciones por hora por usuario
  checkRateLimit(`create_org_${userId}`, 5, 60 * 60 * 1000);
  
  // Validación con Zod schema
  const validatedData = OrganizationCreateSchema.parse(data);
  
  // Validación y sanitización del nombre
  const sanitizedName = validateAndSanitizeOrganizationName(validatedData.name);
  
  // Validación del slug
  validateOrganizationSlug(validatedData.slug);
  
  // Sanitización de descripción si existe
  let sanitizedDescription: string | undefined;
  if (validatedData.description) {
    // Detectar caracteres peligrosos
    if (/<script|javascript:|on\w+=/i.test(validatedData.description)) {
      throw new Error('Invalid characters in description');
    }
    
    sanitizedDescription = validatedData.description
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
      
    if (sanitizedDescription.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
  }

  // Verificar que el slug esté disponible
  const isSlugAvailable = await isOrganizationSlugAvailable(validatedData.slug);
  if (!isSlugAvailable) {
    throw new Error('Organization identifier already exists');
  }

  // Crear organización en base de datos
  try {
    const organization = await createOrganizationInDB({
      name: sanitizedName,
      slug: validatedData.slug,
      description: sanitizedDescription,
    }, userId);

    // Obtener rol de administrador del sistema
    const adminRole = await getRoleByNameFromDB('organization_admin');
    if (!adminRole) {
      throw new Error('System admin role not found');
    }

    // Añadir el creador como administrador automáticamente
    await addUserToOrganizationInDB(organization.id, userId, adminRole.id);
    
    // Log de operación sensible
    console.log('Organization created', {
      organizationId: organization.id,
      userId,
      name: sanitizedName,
      slug: validatedData.slug,
      timestamp: new Date().toISOString()
    });
    
    return organization;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error; // Re-throw para mantener el mensaje específico
  }
}