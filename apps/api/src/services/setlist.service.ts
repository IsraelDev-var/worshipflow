import { setlistRepository } from '@/repositories/setlist.repository';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/AppError';
import type {
  CreateSetlistDto,
  UpdateSetlistDto,
  AddSongToSetlistDto,
  UpdateSetlistSongDto,
  ReorderSetlistDto,
  SetlistQueryDto,
} from '@/dtos/setlist.dto';

export class SetlistService {
  static async list(organizationId: string, query: SetlistQueryDto) {
    const { page, limit, status, eventType } = query;

    const where: any = { organizationId };
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;

    return setlistRepository.paginate(where, page, limit);
  }

  static async findById(id: string, organizationId: string) {
    const setlist = await setlistRepository.findWithSongs(id);

    if (!setlist || setlist.organizationId !== organizationId) {
      throw new AppError('Setlist no encontrado', 404);
    }

    return setlist;
  }

  static async create(data: CreateSetlistDto, userId: string, organizationId: string) {
    return prisma.setlist.create({
      data: {
        ...data,
        date: new Date(data.date),
        organizationId,
        createdById: userId,
      },
    });
  }

  static async update(id: string, data: UpdateSetlistDto, organizationId: string) {
    await SetlistService.findById(id, organizationId);

    return prisma.setlist.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  static async delete(id: string, organizationId: string) {
    await SetlistService.findById(id, organizationId);
    await prisma.setlist.delete({ where: { id } });
  }

  static async addSong(setlistId: string, data: AddSongToSetlistDto, organizationId: string) {
    await SetlistService.findById(setlistId, organizationId);

    const song = await prisma.song.findFirst({
      where: { id: data.songId, organizationId },
    });
    if (!song) throw new AppError('Canción no encontrada', 404);

    const [entry] = await prisma.$transaction([
      prisma.setlistSong.create({
        data: { ...data, setlistId },
        include: { song: true },
      }),
      prisma.song.update({
        where: { id: data.songId },
        data: { lastUsedAt: new Date() },
      }),
    ]);

    return entry;
  }

  static async updateSong(
    setlistId: string,
    setlistSongId: string,
    data: UpdateSetlistSongDto,
    organizationId: string,
  ) {
    await SetlistService.findById(setlistId, organizationId);

    const setlistSong = await prisma.setlistSong.findFirst({
      where: { id: setlistSongId, setlistId },
    });
    if (!setlistSong) throw new AppError('Canción en setlist no encontrada', 404);

    return prisma.setlistSong.update({
      where: { id: setlistSongId },
      data,
      include: { song: true },
    });
  }

  static async removeSong(setlistId: string, setlistSongId: string, organizationId: string) {
    await SetlistService.findById(setlistId, organizationId);

    const setlistSong = await prisma.setlistSong.findFirst({
      where: { id: setlistSongId, setlistId },
    });
    if (!setlistSong) throw new AppError('Canción en setlist no encontrada', 404);

    await prisma.setlistSong.delete({ where: { id: setlistSongId } });
  }

  static async reorder(setlistId: string, data: ReorderSetlistDto, organizationId: string) {
    await SetlistService.findById(setlistId, organizationId);

    await Promise.all(
      data.songs.map(({ id, position }) =>
        prisma.setlistSong.update({ where: { id }, data: { position } }),
      ),
    );

    return SetlistService.findById(setlistId, organizationId);
  }

  static async duplicate(id: string, organizationId: string) {
    await SetlistService.findById(id, organizationId);
    return setlistRepository.duplicate(id);
  }

  static async publish(id: string, organizationId: string) {
    await SetlistService.findById(id, organizationId);
    return prisma.setlist.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }
}
