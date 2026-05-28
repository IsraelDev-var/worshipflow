import { Response } from 'express';
import { CategoryService } from '@/services/category.service';
import { asyncHandler, AppRequest } from '@/utils/asyncHandler';
import { CreateCategorySchema, UpdateCategorySchema } from '@/dtos/category.dto';

export class CategoryController {
  static list = asyncHandler(async (req: AppRequest, res: Response) => {
    const data = await CategoryService.list(req.organizationId!);
    res.json({ success: true, data });
  });

  static create = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = CreateCategorySchema.parse(req.body);
    const category = await CategoryService.create(dto, req.organizationId!);
    res.status(201).json({ success: true, data: category });
  });

  static update = asyncHandler(async (req: AppRequest, res: Response) => {
    const dto = UpdateCategorySchema.parse(req.body);
    const category = await CategoryService.update(req.params.id, dto, req.organizationId!);
    res.json({ success: true, data: category });
  });

  static delete = asyncHandler(async (req: AppRequest, res: Response) => {
    await CategoryService.delete(req.params.id, req.organizationId!);
    res.status(204).send();
  });
}
