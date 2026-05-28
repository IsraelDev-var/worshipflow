import { eventRepository } from '@/repositories/event.repository';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/AppError';
import type {
  CreateEventDto,
  UpdateEventDto,
  AssignMemberDto,
  UpdateMemberDto,
  RespondToAssignmentDto,
  EventQueryDto,
} from '@/dtos/event.dto';

export class EventService {
  static async list(organizationId: string, query: EventQueryDto) {
    const { page, limit, type, upcoming } = query;

    if (upcoming) {
      return { data: await eventRepository.getUpcoming(organizationId), meta: null };
    }

    const where: any = { organizationId };
    if (type) where.type = type;

    return eventRepository.paginate(where, page, limit);
  }

  static async findById(id: string, organizationId: string) {
    const event = await eventRepository.findWithMembers(id);

    if (!event || event.organizationId !== organizationId) {
      throw new AppError('Evento no encontrado', 404);
    }

    return event;
  }

  static async create(data: CreateEventDto, userId: string, organizationId: string) {
    return prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
        organizationId,
        createdById: userId,
      },
    });
  }

  static async update(id: string, data: UpdateEventDto, organizationId: string) {
    await EventService.findById(id, organizationId);

    return prisma.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  static async delete(id: string, organizationId: string) {
    await EventService.findById(id, organizationId);
    await prisma.event.delete({ where: { id } });
  }

  // ── Members ───────────────────────────────────────────────

  static async assignMember(eventId: string, data: AssignMemberDto, organizationId: string) {
    await EventService.findById(eventId, organizationId);

    const existing = await prisma.eventMember.findFirst({
      where: { eventId, userId: data.userId },
    });
    if (existing) throw new AppError('El miembro ya está asignado a este evento', 409);

    return prisma.eventMember.create({
      data: { ...data, eventId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        instrument: true,
      },
    });
  }

  static async updateMember(
    eventId: string,
    memberId: string,
    data: UpdateMemberDto,
    organizationId: string,
  ) {
    await EventService.findById(eventId, organizationId);

    const member = await prisma.eventMember.findFirst({ where: { id: memberId, eventId } });
    if (!member) throw new AppError('Asignación no encontrada', 404);

    return prisma.eventMember.update({
      where: { id: memberId },
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        instrument: true,
      },
    });
  }

  static async removeMember(eventId: string, memberId: string, organizationId: string) {
    await EventService.findById(eventId, organizationId);

    const member = await prisma.eventMember.findFirst({ where: { id: memberId, eventId } });
    if (!member) throw new AppError('Asignación no encontrada', 404);

    await prisma.eventMember.delete({ where: { id: memberId } });
  }

  static async respondToAssignment(
    eventId: string,
    memberId: string,
    data: RespondToAssignmentDto,
    userId: string,
    organizationId: string,
  ) {
    await EventService.findById(eventId, organizationId);

    const member = await prisma.eventMember.findFirst({
      where: { id: memberId, eventId, userId },
    });
    if (!member) throw new AppError('Asignación no encontrada', 404);

    return prisma.eventMember.update({
      where: { id: memberId },
      data: { status: data.status },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        instrument: true,
      },
    });
  }
}
