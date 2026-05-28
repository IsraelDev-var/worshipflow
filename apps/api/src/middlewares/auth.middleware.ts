import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/crypto';

/**
 * Middleware para verificar JWT
 * Agrega userId a req si el token es válido
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      });
      return;
    }

    // Agregar userId y organizationId al request
    (req as any).userId = payload.userId;
    (req as any).organizationId = payload.organizationId;
    (req as any).role = payload.role;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Error al verificar token',
    });
  }
}

/**
 * Middleware para verificar rol
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso',
      });
      return;
    }

    next();
  };
}
