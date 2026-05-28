import { z } from 'zod';

const SECTION_TYPES = [
  'INTRO',
  'VERSE',
  'CHORUS',
  'BRIDGE',
  'OUTRO',
  'PRECHORUS',
  'INTERLUDE',
] as const;

export const CreateSongSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  author: z.string().max(255).optional(),
  originalKey: z.string().min(1, 'La tonalidad es requerida').max(5),
  tempo: z.number().int().min(20).max(300).optional(),
  timeSignature: z.string().default('4/4'),
  durationSeconds: z.number().int().positive().optional(),
  content: z.string().min(1, 'El contenido es requerido'),
  categoryIds: z.array(z.string()).optional(),
});

export const UpdateSongSchema = CreateSongSchema.partial();

export const CreateSectionSchema = z.object({
  type: z.enum(SECTION_TYPES),
  order: z.number().int().min(0),
  content: z.string().min(1),
  label: z.string().max(50).optional(),
});

export const UpdateSectionSchema = CreateSectionSchema.partial();

export const SongQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  key: z.string().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'lastUsedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateSongDto = z.infer<typeof CreateSongSchema>;
export type UpdateSongDto = z.infer<typeof UpdateSongSchema>;
export type CreateSectionDto = z.infer<typeof CreateSectionSchema>;
export type UpdateSectionDto = z.infer<typeof UpdateSectionSchema>;
export type SongQueryDto = z.infer<typeof SongQuerySchema>;
