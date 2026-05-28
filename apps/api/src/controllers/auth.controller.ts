import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '@/dtos/auth.dto';
import { ZodError } from 'zod';
import { userRepository } from '@/repositories/index';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * @summary Registrar nuevo usuario
   * @tags Auth
   * @requestBody
   *   required: true
   *   content:
   *     application/json:
   *       schema:
   *         type: object
   *         required: [email, password, firstName, lastName, organizationId]
   *         properties:
   *           email:
   *             type: string
   *             format: email
   *             example: user@iglesia.com
   *           password:
   *             type: string
   *             format: password
   *             example: SecurePass123!
   *             description: Mín 8 caracteres, 1 mayúscula, 1 número, 1 especial
   *           firstName:
   *             type: string
   *             example: Juan
   *           lastName:
   *             type: string
   *             example: Pérez
   *           organizationId:
   *             type: string
   *             example: clxxxxx
   * @responses
   *   201:
   *     description: Usuario registrado exitosamente
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/AuthResponse'
   *   400:
   *     description: Validación fallida o email ya registrado
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/Error'
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validación fallida',
          errors: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
        });
      }
    }
  }

  /**
   * POST /api/v1/auth/login
   * @summary Login de usuario
   * @tags Auth
   * @requestBody
   *   required: true
   *   content:
   *     application/json:
   *       schema:
   *         type: object
   *         required: [email, password]
   *         properties:
   *           email:
   *             type: string
   *             format: email
   *             example: user@iglesia.com
   *           password:
   *             type: string
   *             format: password
   *             example: SecurePass123!
   * @responses
   *   200:
   *     description: Login exitoso
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/AuthResponse'
   *   401:
   *     description: Credenciales inválidas
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/Error'
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validación fallida',
          errors: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
        });
      }
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * @summary Refrescar tokens
   * @tags Auth
   * @requestBody
   *   required: true
   *   content:
   *     application/json:
   *       schema:
   *         type: object
   *         required: [refreshToken]
   *         properties:
   *           refreshToken:
   *             type: string
   *             example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * @responses
   *   200:
   *     description: Tokens refrescados
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           properties:
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *             data:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                 refreshToken:
   *                   type: string
   *   401:
   *     description: Token inválido o expirado
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = RefreshTokenSchema.parse(req.body);
      const { accessToken, refreshToken } = await AuthService.refreshToken(
        validatedData.refreshToken,
      );

      res.status(200).json({
        success: true,
        message: 'Tokens refrescados',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validación fallida',
          errors: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
        });
      }
    }
  }

  /**
   * GET /api/v1/auth/me
   * @summary Obtener perfil del usuario autenticado
   * @tags Auth
   * @security
   *   - bearerAuth: []
   * @responses
   *   200:
   *     description: Perfil del usuario
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           properties:
   *             success:
   *               type: boolean
   *               example: true
   *             data:
   *               $ref: '#/components/schemas/User'
   *   401:
   *     description: No autenticado
   *     content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/Error'
   *   404:
   *     description: Usuario no encontrado
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = ForgotPasswordSchema.parse(req.body);
      await AuthService.requestPasswordReset(email);
      res.status(200).json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ success: false, message: 'Validación fallida', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
      }
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = ResetPasswordSchema.parse(req.body);
      await AuthService.resetPassword(token, password);
      res.status(200).json({ success: true, message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ success: false, message: 'Validación fallida', errors: error.issues });
      } else if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
      }
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = VerifyEmailSchema.parse(req.body);
      await AuthService.verifyEmail(token);
      res.status(200).json({ success: true, message: 'Email verificado exitosamente' });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ success: false, message: 'Validación fallida', errors: error.issues });
      } else if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
      }
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'Sesión cerrada' });
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
        return;
      }

      const user = await AuthService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}
