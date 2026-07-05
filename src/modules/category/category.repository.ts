import { Category, ICategory } from '@models/category.model';

interface CreateCategoryInput {
  name: string;
  slug: string;
  parentCategory?: string | null;
}

export const categoryRepository = {
  async findAll(): Promise<ICategory[]> {
    return Category.find().sort('name').exec();
  },
  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  },
  async findBySlug(slug: string): Promise<ICategory | null> {
    return Category.findOne({ slug }).exec();
  },
  async create(data: CreateCategoryInput): Promise<ICategory> {
    return Category.create(data);
  },
};