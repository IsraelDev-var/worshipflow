import { z } from 'zod';

const EVENT_TYPES = ['SERVICE', 'REHEARSAL', 'SPECIAL'] as const;
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const CreateSetlistSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  date: z.string().min(1, 'La fecha es requerida'),
  eventType: z.enum(EVENT_TYPES),
  notes: z.string().optional(),
});

export const UpdateSetlistSchema = CreateSetlistSchema.partial().extend({
  status: z.enum(STATUSES).optional(),
});

export const AddSongToSetlistSchema = z.object({
  songId: z.string().min(1, 'songId es requerido'),
  position: z.number().int().min(0),
  customKey: z.string().max(5).optional(),
  capo: z.number().int().min(0).max(12).default(0),
  notes: z.string().optional(),
});

export const UpdateSetlistSongSchema = AddSongToSetlistSchema.partial();

export const ReorderSetlistSchema = z.object({
  songs: z
    .array(
      z.object({
        id: z.string(),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const SetlistQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(STATUSES).optional(),
  eventType: z.enum(EVENT_TYPES).optional(),
});

export type CreateSetlistDto = z.infer<typeof CreateSetlistSchema>;
export type UpdateSetlistDto = z.infer<typeof UpdateSetlistSchema>;
export type AddSongToSetlistDto = z.infer<typeof AddSongToSetlistSchema>;
export type UpdateSetlistSongDto = z.infer<typeof UpdateSetlistSongSchema>;
export type ReorderSetlistDto = z.infer<typeof ReorderSetlistSchema>;
export type SetlistQueryDto = z.infer<typeof SetlistQuerySchema>;
