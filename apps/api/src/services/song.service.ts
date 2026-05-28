import { songRepository } from '@/repositories/song.repository';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/AppError';
import { transposeChordPro, getSemitones } from '@/utils/transpose';
import type {
  CreateSongDto,
  UpdateSongDto,
  CreateSectionDto,
  UpdateSectionDto,
  SongQueryDto,
} from '@/dtos/song.dto';

export class SongService {
  static async list(organizationId: string, query: SongQueryDto) {
    const { page, limit, search, key, categoryId, sortBy, sortOrder } = query;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (key) where.originalKey = key;
    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { categories: true },
      }),
      prisma.song.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  static async findById(id: string, organizationId: string) {
    const song = await prisma.song.findUnique({
      where: { id },
      include: { categories: true, sections: { orderBy: { order: 'asc' } } },
    });

    if (!song || song.organizationId !== organizationId) {
      throw new AppError('Canción no encontrada', 404);
    }

    return song;
  }

  static async create(data: CreateSongDto, userId: string, organizationId: string) {
    const { categoryIds, ...songData } = data;

    return prisma.song.create({
      data: {
        ...songData,
        organizationId,
        createdById: userId,
        ...(categoryIds && {
          categories: { connect: categoryIds.map((id) => ({ id })) },
        }),
      },
      include: { categories: true },
    });
  }

  static async update(id: string, data: UpdateSongDto, organizationId: string) {
    await SongService.findById(id, organizationId);

    const { categoryIds, ...songData } = data;

    return prisma.song.update({
      where: { id },
      data: {
        ...songData,
        ...(categoryIds !== undefined && {
          categories: { set: categoryIds.map((cid) => ({ id: cid })) },
        }),
      },
      include: { categories: true },
    });
  }

  static async delete(id: string, organizationId: string) {
    await SongService.findById(id, organizationId);
    await prisma.song.delete({ where: { id } });
  }

  static async transpose(id: string, organizationId: string, targetKey: string) {
    const song = await SongService.findById(id, organizationId);
    const semitones = getSemitones(song.originalKey, targetKey);
    const transposedContent = transposeChordPro(song.content, semitones);

    return {
      ...song,
      originalKey: targetKey,
      content: transposedContent,
      sections: song.sections?.map((s: any) => ({
        ...s,
        content: transposeChordPro(s.content, semitones),
      })),
    };
  }

  // ── Sections ──────────────────────────────────────────────

  static async getSections(songId: string, organizationId: string) {
    await SongService.findById(songId, organizationId);
    return prisma.songSection.findMany({
      where: { songId },
      orderBy: { order: 'asc' },
    });
  }

  static async createSection(songId: string, data: CreateSectionDto, organizationId: string) {
    await SongService.findById(songId, organizationId);
    return prisma.songSection.create({ data: { ...data, songId } });
  }

  static async updateSection(sectionId: string, data: UpdateSectionDto, organizationId: string) {
    const section = await prisma.songSection.findUnique({ where: { id: sectionId } });
    if (!section) throw new AppError('Sección no encontrada', 404);
    await SongService.findById(section.songId, organizationId);
    return prisma.songSection.update({ where: { id: sectionId }, data });
  }

  static async deleteSection(sectionId: string, organizationId: string) {
    const section = await prisma.songSection.findUnique({ where: { id: sectionId } });
    if (!section) throw new AppError('Sección no encontrada', 404);
    await SongService.findById(section.songId, organizationId);
    await prisma.songSection.delete({ where: { id: sectionId } });
  }
}
