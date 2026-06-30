import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(5000),
    price: z.coerce.number().positive('Price must be greater than 0'),
    stock: z.coerce.number().int().min(0),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(['active', 'inactive']).optional(), 
  }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    sortBy: z.enum(['price', '-price', '-createdAt', '-averageRating']).default('-createdAt'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>['query'];