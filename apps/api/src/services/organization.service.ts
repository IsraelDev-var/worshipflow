import { organizationRepository } from '@/repositories/organization.repository';
import { userRepository } from '@/repositories/user.repository';
import { songRepository } from '@/repositories/song.repository';
import { setlistRepository } from '@/repositories/setlist.repository';
import { eventRepository } from '@/repositories/event.repository';
import { AppError } from '@/utils/AppError';

export class OrganizationService {
  static async getCurrent(organizationId: string) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new AppError('Organización no encontrada', 404);
    return org;
  }

  static async update(
    organizationId: string,
    data: { name?: string; logoUrl?: string; timezone?: string },
  ) {
    await OrganizationService.getCurrent(organizationId);
    return organizationRepository.update(organizationId, data as any);
  }

  static async getStats(organizationId: string) {
    const [totalUsers, totalSongs, totalSetlists, upcomingEvents] = await Promise.all([
      userRepository.count({ organizationId, isActive: true }),
      songRepository.count({ organizationId }),
      setlistRepository.count({ organizationId }),
      eventRepository.count({ organizationId, date: { gte: new Date() } }),
    ]);

    return { totalUsers, totalSongs, totalSetlists, upcomingEvents };
  }
}
