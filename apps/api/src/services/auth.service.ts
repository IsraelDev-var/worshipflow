import { User } from '../generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { userRepository } from '@/repositories/user.repository';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/crypto';
import {
  generateVerificationToken,
  generatePasswordResetToken,
  getExpirationDate,
  isTokenExpired,
} from '@/utils/tokens';
import { RegisterDto, LoginDto } from '@/dtos/auth.dto';
import { EmailService } from '@/services/email/email.service';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export class AuthService {
  /**
   * Registrar nuevo usuario
   */
  static async register(data: RegisterDto): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = getExpirationDate(1440);

    const { user, org } = await prisma.$transaction(async (tx) => {
      let org;

      if (data.organizationSlug) {
        // Unirse a organización existente
        org = await tx.organization.findUnique({ where: { slug: data.organizationSlug } });
        if (!org)
          throw new Error('Código de organización inválido. Verifica con tu administrador.');
      } else {
        // Crear nueva organización
        const slug = (data.organizationName ?? '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 90);
        org = await tx.organization.create({
          data: { name: data.organizationName!, slug: `${slug}-${Date.now()}` },
        });
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationId: org.id,
          role: data.organizationSlug ? 'MUSICIAN' : 'ADMIN',
          emailVerificationToken: verificationToken,
          emailVerificationExpiresAt: verificationExpiresAt,
        },
      });
      return { user, org };
    });

    const verificationLink = `${APP_URL}/verify-email?token=${verificationToken}`;
    EmailService.sendVerificationEmail(user.email, user.firstName, verificationLink).catch(
      () => {},
    );

    const accessToken = generateAccessToken(user.id, org.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  /**
   * Verificar email del usuario
   */
  static async verifyEmail(token: string): Promise<User> {
    // Buscar usuario por token
    const user = await userRepository.findByVerificationToken(token);

    if (!user) {
      throw new Error('Token de verificación inválido');
    }

    // Validar que el token no haya expirado
    if (isTokenExpired(user.emailVerificationExpiresAt)) {
      throw new Error('Token de verificación expirado');
    }

    // Marcar email como verificado
    const updatedUser = await userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    } as any);

    // Enviar email de bienvenida
    await EmailService.sendWelcomeEmail(updatedUser.email, updatedUser.firstName);

    return updatedUser;
  }

  /**
   * Login de usuario
   */
  static async login(data: LoginDto): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    // Buscar usuario por email
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    if (!user.isActive) {
      throw new Error('Usuario desactivado');
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar tokens
    const accessToken = generateAccessToken(user.id, user.organizationId, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  /**
   * Solicitar recuperación de contraseña
   */
  static async requestPasswordReset(email: string): Promise<void> {
    // Buscar usuario por email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // No revelar si el email existe o no (seguridad)
      console.info(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generar token de reset
    const resetToken = generatePasswordResetToken();
    const resetExpiresAt = getExpirationDate(60); // 1 hora

    // Guardar token en usuario
    await userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiresAt,
    } as any);

    // Enviar email de recuperación
    const resetLink = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    await EmailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
  }

  /**
   * Restablecer contraseña con token
   */
  static async resetPassword(token: string, newPassword: string): Promise<User> {
    // Buscar usuario por token
    const user = await userRepository.findByPasswordResetToken(token);

    if (!user) {
      throw new Error('Token de recuperación inválido');
    }

    // Validar que el token no haya expirado
    if (isTokenExpired(user.passwordResetExpiresAt)) {
      throw new Error('Token de recuperación expirado');
    }

    // Hash de la nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    const updatedUser = await userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    } as any);

    return updatedUser;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verificar refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('Refresh token inválido o expirado');
    }

    // Buscar usuario
    const user = await userRepository.findById(payload.userId);

    if (!user || !user.isActive) {
      throw new Error('Usuario no encontrado o desactivado');
    }

    // Generar nuevos tokens
    const newAccessToken = generateAccessToken(user.id, user.organizationId, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await userRepository.findById(id);

    if (!user) {
      return null;
    }

    // No retornar el hash de contraseña
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
