import { prisma } from '../lib/prisma';
import type { User } from '../generated/prisma/client';
import { BaseRepository } from '@/repositories/base.repository';

/**
 * User Repository - Extiende BaseRepository
 * Métodos específicos para Usuario
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string, organizationId?: string): Promise<User | null> {
    const where = organizationId ? { email, organizationId } : { email };
    return this.findFirst(where);
  }

  /**
   * Buscar usuario por token de verificación
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return this.findUnique({ emailVerificationToken: token });
  }

  /**
   * Buscar usuario por token de reset
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.findUnique({ passwordResetToken: token });
  }

  /**
   * Obtener usuarios de una organización
   */
  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.search({ organizationId, isActive: true }, null, { lastName: 'asc' });
  }

  /**
   * Buscar usuarios con filtros
   */
  async searchByRole(organizationId: string, role?: string): Promise<User[]> {
    const where = role
      ? { organizationId, role, isActive: true }
      : { organizationId, isActive: true };

    return this.search(where, null, { firstName: 'asc' });
  }

  /**
   * Desactivar usuario (soft delete)
   */
  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false } as any);
  }

  /**
   * Obtener usuarios activos de una organización
   */
  async getActiveUsers(organizationId: string, limit?: number): Promise<User[]> {
    return this.findAll({ organizationId, isActive: true }, 0, limit);
  }

  /**
   * Contar usuarios por rol
   */
  async countByRole(organizationId: string, role: string): Promise<number> {
    return this.count({ organizationId, role, isActive: true });
  }

  /**
   * Obtener usuarios con paginación
   */
  async getWithPagination(organizationId: string, page: number = 1, limit: number = 10) {
    return this.paginate({ organizationId, isActive: true }, page, limit);
  }
}

// Exportar instancia singleton
export const userRepository = new UserRepository();
