import { z } from 'zod';

/**
 * Schema para registro de usuario
 */
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener una mayúscula')
  .regex(/[0-9]/, 'La contraseña debe contener un número')
  .regex(/[!@#$%^&*]/, 'La contraseña debe contener un carácter especial (!@#$%^&*)');

export const RegisterSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: passwordSchema,
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    organizationName: z.string().min(2).optional(),
    organizationSlug: z.string().min(1).optional(),
  })
  .refine((d) => d.organizationName || d.organizationSlug, {
    message: 'Debes crear una iglesia o ingresar un código para unirte',
  });

export type RegisterDto = z.infer<typeof RegisterSchema>;

/**
 * Schema para login
 */
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

/**
 * Schema para refresh token
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

/**
 * Response de auth (lo que retorna el servidor)
 */
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        role: z.string(),
      }),
    })
    .optional(),
  message: z.string().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener un número')
    .regex(/[!@#$%^&*]/, 'La contraseña debe contener un carácter especial (!@#$%^&*)'),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
});
