import { categoryRepository } from '@repositories/category.repository';
import { ApiError } from '@utils/ApiError';
import { ICategory } from '@models/category.model';
import { CreateCategoryInput } from './category.validation';

export const categoryService = {
  async list(): Promise<ICategory[]> {
    return categoryRepository.findAll();
  },

  async create(input: CreateCategoryInput): Promise<ICategory> {
    const existing = await categoryRepository.findBySlug(input.slug);
    if (existing) {
      throw ApiError.conflict('A category with this slug already exists');
    }
    return categoryRepository.create({
      name: input.name,
      slug: input.slug,
      parentCategory: input.parentCategory ?? null,
    });
  },
};