import slugify from 'slugify';
import { productRepository, ProductFilters, PaginationOptions } from '@repositories/product.repository';
import { categoryRepository } from '@repositories/category.repository';
import { ApiError } from '@utils/ApiError';
import { IProduct } from '@models/product.model';
import { CreateProductInput, UpdateProductInput } from './product.validation';

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (await productRepository.findBySlug(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export const productService = {
  async create(
    vendorId: string,
    input: CreateProductInput,
    imagePaths: string[]
  ): Promise<IProduct> {
    if (imagePaths.length === 0) {
      throw ApiError.badRequest('At least one product image is required');
    }

    const categoryExists = await categoryRepository.exists(input.categoryId);
    if (!categoryExists) {
      throw ApiError.badRequest('Selected category does not exist');
    }

    const slug = await generateUniqueSlug(input.name);

    return productRepository.create({
      vendorId,
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      images: imagePaths,
    });
  },

  async getById(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  async list(filters: ProductFilters, pagination: PaginationOptions) {
    const { products, total } = await productRepository.findWithFilters(filters, pagination);
    return {
      products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  },

  async getMine(vendorId: string): Promise<IProduct[]> {
    return productRepository.findByVendor(vendorId);
  },

  async update(
    productId: string,
    vendorId: string,
    updates: UpdateProductInput
  ): Promise<IProduct> {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    if (product.vendorId.toString() !== vendorId) {
      throw ApiError.forbidden('You do not have permission to modify this product');
    }

    if (updates.categoryId) {
      const categoryExists = await categoryRepository.exists(updates.categoryId);
      if (!categoryExists) throw ApiError.badRequest('Selected category does not exist');
    }

    const updated = await productRepository.update(productId, updates);
    if (!updated) throw ApiError.notFound('Product not found');
    return updated;
  },

  async remove(productId: string, vendorId: string): Promise<void> {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    if (product.vendorId.toString() !== vendorId) {
      throw ApiError.forbidden('You do not have permission to delete this product');
    }

    await productRepository.delete(productId);
  },
};