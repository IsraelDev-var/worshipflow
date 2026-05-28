import { Response } from 'express';
import { OrganizationService } from '@/services/organization.service';
import { asyncHandler, AppRequest } from '@/utils/asyncHandler';
import { z } from 'zod';

const UpdateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().url().optional(),
  timezone: z.string().optional(),
});

export class OrganizationController {
  static getCurrent = asyncHandler(async (req: AppRequest, res: Response) => {
    const org = await OrganizationService.getCurrent(req.organizationId!);
    res.json({ success: true, data: org });
  });

  static update = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateOrganizationSchema.parse(req.body);
    const org = await OrganizationService.update(req.organizationId!, dto);
    res.json({ success: true, data: org });
  });

  static getStats = asyncHandler(async (req: AppRequest, res: Response) => {
    const stats = await OrganizationService.getStats(req.organizationId!);
    res.json({ success: true, data: stats });
  });
}
