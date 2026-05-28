import { z } from 'zod';

const EVENT_TYPES = ['SERVICE', 'REHEARSAL', 'SPECIAL'] as const;
const ASSIGNMENT_STATUSES = ['PENDING', 'CONFIRMED', 'DECLINED'] as const;

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  type: z.enum(EVENT_TYPES),
  date: z.string().min(1, 'La fecha es requerida'),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  endTime: z.string().optional(),
  location: z.string().max(255).optional(),
  setlistId: z.string().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const AssignMemberSchema = z.object({
  userId: z.string().min(1, 'userId es requerido'),
  instrumentId: z.string().min(1, 'instrumentId es requerido'),
  notes: z.string().optional(),
});

export const UpdateMemberSchema = z.object({
  instrumentId: z.string().optional(),
  notes: z.string().optional(),
});

export const RespondToAssignmentSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED']),
});

export const EventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(EVENT_TYPES).optional(),
  upcoming: z.coerce.boolean().optional(),
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
export type AssignMemberDto = z.infer<typeof AssignMemberSchema>;
export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;
export type RespondToAssignmentDto = z.infer<typeof RespondToAssignmentSchema>;
export type EventQueryDto = z.infer<typeof EventQuerySchema>;
