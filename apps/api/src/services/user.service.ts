import { userRepository } from '@/repositories/user.repository';
import { AppError } from '@/utils/AppError';

export class UserService {
  private static safeUser(user: any) {
    const { passwordHash, emailVerificationToken, passwordResetToken, ...safe } = user;
    return safe;
  }

  static async list(organizationId: string, page = 1, limit = 20) {
    const result = await userRepository.getWithPagination(organizationId, page, limit);
    return {
      ...result,
      data: result.data.map(UserService.safeUser),
    };
  }

  static async findById(id: string, organizationId: string) {
    const user = await userRepository.findById(id);
    if (!user || user.organizationId !== organizationId) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return UserService.safeUser(user);
  }

  static async update(
    id: string,
    organizationId: string,
    data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string },
  ) {
    await UserService.findById(id, organizationId);
    const updated = await userRepository.update(id, data as any);
    return UserService.safeUser(updated);
  }

  static async deactivate(id: string, organizationId: string) {
    await UserService.findById(id, organizationId);
    const updated = await userRepository.deactivate(id);
    return UserService.safeUser(updated);
  }
}
