import { BaseRepository } from '@/repositories/base.repository';
import type { Event } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(prisma.event);
  }

  /**
   * Obtener eventos por organización
   */
  async findByOrganization(organizationId: string): Promise<Event[]> {
    return this.findAll({ organizationId });
  }

  /**
   * Obtener evento con miembros asignados
   */
  async findWithMembers(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            instrument: true,
          },
        },
        setlist: {
          include: {
            songs: { include: { song: true }, orderBy: { position: 'asc' } },
          },
        },
      },
    });
  }

  /**
   * Obtener eventos próximos
   */
  async getUpcoming(organizationId: string, days: number = 30): Promise<Event[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.search(
      {
        organizationId,
        date: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      null,
      { date: 'asc' },
    );
  }

  /**
   * Obtener eventos por tipo
   */
  async findByType(organizationId: string, type: string): Promise<Event[]> {
    return this.search({ organizationId, type });
  }

  /**
   * Obtener eventos con paginación
   */
  async getWithPagination(organizationId: string, page: number = 1, limit: number = 10) {
    return this.paginate({ organizationId }, page, limit);
  }

  /**
   * Contar miembros asignados a un evento
   */
  async countMembers(eventId: string): Promise<number> {
    return prisma.eventMember.count({ where: { eventId } });
  }
}

export const eventRepository = new EventRepository();
