import { FilterQuery } from 'mongoose';
import { Product, IProduct, ProductStatus } from '@models/product.model';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
}

interface CreateProductInput {
  vendorId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

export const productRepository = {
  async create(data: CreateProductInput): Promise<IProduct> {
    return Product.create(data);
  },

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id).populate('categoryId', 'name slug').exec();
  },

  async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug }).exec();
  },

  async findWithFilters(
    filters: ProductFilters,
    pagination: PaginationOptions
  ): Promise<{ products: IProduct[]; total: number }> {
    const query: FilterQuery<IProduct> = {
      status: filters.status ?? 'active',
    };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.categoryId) {
      query.categoryId = filters.categoryId;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(pagination.sortBy)
        .skip(skip)
        .limit(pagination.limit)
        .populate('categoryId', 'name slug')
        .exec(),
      Product.countDocuments(query),
    ]);

    return { products, total };
  },

  async findByVendor(vendorId: string): Promise<IProduct[]> {
    return Product.find({ vendorId }).sort('-createdAt').exec();
  },

  async update(id: string, updates: Record<string, unknown>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).exec();
  },

  async delete(id: string): Promise<void> {
    await Product.findByIdAndDelete(id).exec();
  },

  async decrementStock(id: string, quantity: number): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, { $inc: { stock: -quantity } }, { new: true }).exec();
  },
};