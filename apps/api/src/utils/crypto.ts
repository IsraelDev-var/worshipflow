import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@/config/jwt';

/**
 * Hash de contraseña con bcrypt
 * @param password Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verificar contraseña
 * @param password Contraseña en texto plano
 * @param hash Hash almacenado en la BD
 * @returns true si coinciden
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generar JWT (access token)
 * @param userId ID del usuario
 * @param organizationId ID de la organización
 * @returns Token JWT
 */
export function generateAccessToken(userId: string, organizationId: string, role: string): string {
  return jwt.sign({ userId, organizationId, role }, JWT_CONFIG.accessTokenSecret, {
    expiresIn: JWT_CONFIG.accessTokenExpiration,
  });
}

/**
 * Generar refresh token
 * @param userId ID del usuario
 * @returns Refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_CONFIG.refreshTokenSecret, {
    expiresIn: JWT_CONFIG.refreshTokenExpiration,
  });
}

/**
 * Verificar access token
 * @param token Token JWT
 * @returns Payload del token
 */
export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, JWT_CONFIG.accessTokenSecret);
  } catch (error) {
    return null;
  }
}

/**
 * Verificar refresh token
 * @param token Refresh token
 * @returns Payload del token
 */
export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, JWT_CONFIG.refreshTokenSecret);
  } catch (error) {
    return null;
  }
}

/**
 * Decodificar token sin verificar (solo leer payload)
 * @param token Token JWT
 * @returns Payload del token
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}
