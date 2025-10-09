import { z } from 'zod';

/**
 * Validadores comunes reutilizables
 */
export const CommonValidators = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format'),
  
  // Validadores de longitud para nombres
  shortText: z.string().min(1).max(100),
  mediumText: z.string().min(1).max(500),
  
  // Validadores específicos para auth
  userName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Name contains invalid characters"),
    
  organizationName: z.string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Organization name contains invalid characters"),
    
  organizationSlug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(/^[a-z0-9\-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens and underscores"),
    
  inviteCode: z.string()
    .length(8, "Invite code must be exactly 8 characters")
    .regex(/^[A-Z0-9]+$/, "Invite code can only contain uppercase letters and numbers"),
};

/**
 * Validar UUID
 */
export function validateUUID(id: string, fieldName: string = 'ID'): void {
  if (!id || typeof id !== 'string') {
    throw new Error(`${fieldName} is required and must be a valid string`);
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
}

/**
 * Sanitizar texto para prevenir XSS
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validar y sanitizar nombre de usuario
 */
export function validateAndSanitizeUserName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required');
  }
  
  // Detectar caracteres peligrosos
  if (/<script|javascript:|on\w+=/i.test(name)) {
    throw new Error('Invalid characters in name');
  }
  
  const sanitized = sanitizeText(name);
  
  // Validar con Zod después de sanitización
  const result = CommonValidators.userName.safeParse(sanitized);
  if (!result.success) {
    throw new Error(`Invalid name: ${result.error.errors[0].message}`);
  }
  
  return sanitized;
}

/**
 * Validar y sanitizar nombre de organización
 */
export function validateAndSanitizeOrganizationName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Organization name is required');
  }
  
  // Detectar caracteres peligrosos
  if (/<script|javascript:|on\w+=/i.test(name)) {
    throw new Error('Invalid characters in organization name');
  }
  
  const sanitized = sanitizeText(name);
  
  // Validar con Zod después de sanitización
  const result = CommonValidators.organizationName.safeParse(sanitized);
  if (!result.success) {
    throw new Error(`Invalid organization name: ${result.error.errors[0].message}`);
  }
  
  return sanitized;
}

/**
 * Validar slug de organización
 */
export function validateOrganizationSlug(slug: string): void {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Organization slug is required');
  }
  
  // Prevenir SQL injection
  if (/['";\\]|--|\*|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union|script/i.test(slug)) {
    throw new Error('Invalid slug format');
  }
  
  const result = CommonValidators.organizationSlug.safeParse(slug);
  if (!result.success) {
    throw new Error(`Invalid slug: ${result.error.errors[0].message}`);
  }
}

/**
 * Validar código de invitación
 */
export function validateInviteCode(code: string): void {
  if (!code || typeof code !== 'string') {
    throw new Error('Invite code is required');
  }
  
  const result = CommonValidators.inviteCode.safeParse(code);
  if (!result.success) {
    throw new Error(`Invalid invite code format: ${result.error.errors[0].message}`);
  }
}

/**
 * Validar que los datos de actualización no estén vacíos
 */
export function validateUpdateData(data: Record<string, any>): void {
  if (!data || typeof data !== 'object') {
    throw new Error('No valid data provided for update');
  }
  
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error('No valid data provided for update');
  }
  
  // Verificar que al menos un campo tenga valor
  const hasValidData = keys.some(key => {
    const value = data[key];
    return value !== null && value !== undefined && value !== '';
  });
  
  if (!hasValidData) {
    throw new Error('No valid data provided for update');
  }
}

/**
 * Validar formato de permiso
 */
export function validatePermissionName(permission: string): void {
  if (!permission || typeof permission !== 'string') {
    throw new Error('Permission name is required');
  }
  
  // Detectar caracteres peligrosos
  if (/<script|javascript:|on\w+=/i.test(permission)) {
    throw new Error('Invalid permission name format');
  }
  
  // Validar formato resource.action
  if (!/^[a-z_]+\.[a-z_]+$/.test(permission)) {
    throw new Error('Permission must follow resource.action format');
  }
}

/**
 * Rate limiting simple en memoria (para desarrollo)
 * En producción se debería usar Redis o similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  maxRequests: number = 5, 
  windowMs: number = 60 * 60 * 1000 // 1 hora
): void {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Nuevo período o primer request
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  if (record.count >= maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  record.count++;
  rateLimitStore.set(key, record);
}

/**
 * Limpiar rate limit store (para testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}