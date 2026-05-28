import { BaseRepository } from '@/repositories/base.repository';
import type { Song } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

export class SongRepository extends BaseRepository<Song> {
  constructor() {
    super(prisma.song);
  }

  /**
   * Buscar canciones por organización
   */
  async findByOrganization(organizationId: string): Promise<Song[]> {
    return this.findAll({ organizationId });
  }

  /**
   * Buscar canción por título
   */
  async findByTitle(title: string, organizationId: string): Promise<Song | null> {
    return this.findFirst({ title, organizationId });
  }

  /**
   * Buscar canciones por tonalidad
   */
  async findByKey(originalKey: string, organizationId: string): Promise<Song[]> {
    return this.search({ originalKey, organizationId });
  }

  /**
   * Buscar canciones con filtros
   */
  async searchSongs(
    organizationId: string,
    searchTerm?: string,
    key?: string,
    category?: string,
  ): Promise<Song[]> {
    const where: any = { organizationId };

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { author: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (key) {
      where.originalKey = key;
    }

    return this.search(where);
  }

  /**
   * Obtener canciones con paginación
   */
  async getSongsWithPagination(organizationId: string, page: number = 1, limit: number = 10) {
    return this.paginate({ organizationId }, page, limit);
  }

  /**
   * Actualizar última fecha de uso
   */
  async updateLastUsed(id: string): Promise<Song> {
    return this.update(id, { lastUsedAt: new Date() } as any);
  }

  /**
   * Obtener canciones más usadas
   */
  async getMostUsed(organizationId: string, limit: number = 10): Promise<Song[]> {
    return this.search({ organizationId }, null, { lastUsedAt: 'desc' });
  }
}

export const songRepository = new SongRepository();
