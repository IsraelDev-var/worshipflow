import { Response } from 'express';
import { UserService } from '@/services/user.service';
import { asyncHandler, AppRequest } from '@/utils/asyncHandler';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class UserController {
  static list = asyncHandler(async (req: AppRequest, res: Response) => {
    const { page, limit } = ListQuerySchema.parse(req.query);
    const data = await UserService.list(req.organizationId!, page, limit);
    res.json({ success: true, data });
  });

  static findById = asyncHandler(async (req: AppRequest, res: Response) => {
    const user = await UserService.findById(req.params.id, req.organizationId!);
    res.json({ success: true, data: user });
  });

  static update = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateUserSchema.parse(req.body);
    const user = await UserService.update(req.params.id, req.organizationId!, dto);
    res.json({ success: true, data: user });
  });

  static updateMe = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateUserSchema.parse(req.body);
    const user = await UserService.update(req.userId!, req.organizationId!, dto);
    res.json({ success: true, data: user });
  });

  static deactivate = asyncHandler(async (req: AppRequest, res: Response) => {
    const user = await UserService.deactivate(req.params.id, req.organizationId!);
    res.json({ success: true, data: user });
  });
}
