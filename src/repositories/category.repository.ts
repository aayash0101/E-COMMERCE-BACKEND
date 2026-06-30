import { Category, ICategory } from '@models/category.model';

export const categoryRepository = {
  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  },

  async exists(id: string): Promise<boolean> {
    const result = await Category.exists({ _id: id });
    return result !== null;
  },
};