import { categoryRepository } from '@/repositories/category.repository';
import { AppError } from '@/utils/AppError';
import type { CreateCategoryDto, UpdateCategoryDto } from '@/dtos/category.dto';

export class CategoryService {
  static async list(organizationId: string) {
    return categoryRepository.findByOrganization(organizationId);
  }

  static async findById(id: string, organizationId: string) {
    const category = await categoryRepository.findById(id);
    if (!category || category.organizationId !== organizationId) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return category;
  }

  static async create(data: CreateCategoryDto, organizationId: string) {
    const existing = await categoryRepository.findByName(data.name, organizationId);
    if (existing) throw new AppError('Ya existe una categoría con ese nombre', 409);

    return categoryRepository.create({ ...data, organizationId });
  }

  static async update(id: string, data: UpdateCategoryDto, organizationId: string) {
    await CategoryService.findById(id, organizationId);
    return categoryRepository.update(id, data);
  }

  static async delete(id: string, organizationId: string) {
    await CategoryService.findById(id, organizationId);
    await categoryRepository.delete(id);
  }
}
