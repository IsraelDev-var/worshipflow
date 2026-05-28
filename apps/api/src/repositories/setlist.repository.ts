import type { Setlist } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { BaseRepository } from '@/repositories/base.repository';

export class SetlistRepository extends BaseRepository<Setlist> {
  constructor() {
    super(prisma.setlist);
  }

  /**
   * Obtener setlists por organización
   */
  async findByOrganization(organizationId: string): Promise<Setlist[]> {
    return this.findAll({ organizationId });
  }

  /**
   * Obtener setlists con canciones
   */
  async findWithSongs(id: string) {
    return prisma.setlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: { song: true },
          orderBy: { position: 'asc' },
        },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Obtener setlists por fecha
   */
  async findByDate(date: Date, organizationId: string): Promise<Setlist[]> {
    return this.search({
      date,
      organizationId,
    });
  }

  /**
   * Obtener setlists próximos
   */
  async getUpcoming(organizationId: string): Promise<Setlist[]> {
    return this.search(
      {
        organizationId,
        date: { gte: new Date() },
      },
      null,
      { date: 'asc' },
    );
  }

  /**
   * Obtener setlists con paginación
   */
  async getWithPagination(organizationId: string, page: number = 1, limit: number = 10) {
    return this.paginate({ organizationId }, page, limit);
  }

  /**
   * Duplicar setlist
   */
  async duplicate(id: string): Promise<Setlist> {
    const original = await this.findWithSongs(id);

    if (!original) {
      throw new Error('Setlist no encontrado');
    }

    const newSetlist = await this.create({
      title: `${original.title} (Copia)`,
      date: original.date,
      eventType: original.eventType,
      organizationId: original.organizationId,
      createdById: original.createdById,
    } as any);

    // Copiar canciones
    if (original.songs && original.songs.length > 0) {
      await Promise.all(
        original.songs.map((setlistSong) =>
          prisma.setlistSong.create({
            data: {
              setlistId: newSetlist.id,
              songId: setlistSong.songId,
              position: setlistSong.position,
              customKey: setlistSong.customKey,
              capo: setlistSong.capo,
              notes: setlistSong.notes,
            },
          }),
        ),
      );
    }

    return newSetlist;
  }
}

export const setlistRepository = new SetlistRepository();
