import { BaseRepository } from '@/repositories/base.repository';
import type { Organization } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor() {
    super(prisma.organization);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.findUnique({ slug });
  }
}

export const organizationRepository = new OrganizationRepository();
