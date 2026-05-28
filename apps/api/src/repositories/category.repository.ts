import { BaseRepository } from '@/repositories/base.repository';
import type { Category } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(prisma.category);
  }

  async findByOrganization(organizationId: string): Promise<Category[]> {
    return this.model.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findByName(name: string, organizationId: string): Promise<Category | null> {
    return this.findFirst({ name, organizationId });
  }
}

export const categoryRepository = new CategoryRepository();
