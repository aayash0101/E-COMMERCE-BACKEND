import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        productId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
        orderId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
        rating: z
            .number()
            .int()
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        comment: z
            .string()
            .trim()
            .min(10, 'Review must be at least 10 characters')
            .max(1000),
    }),
});

export const updateReviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5).optional(),
        comment: z.string().trim().min(10).max(1000).optional(),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
    }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
