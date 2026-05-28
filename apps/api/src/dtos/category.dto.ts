import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hex válido')
    .default('#3B82F6'),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
