import crypto from 'crypto';

/**
 * Generar token aleatorio para verificación de email
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generar token aleatorio para reset de contraseña
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcular fecha de expiración
 */
export function getExpirationDate(minutes: number = 60): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Validar si un token ha expirado
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}
