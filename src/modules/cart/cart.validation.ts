import { z } from 'zod';

export const addToCartSchema = z.object({
    body: z.object({
        productId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
        quantity: z
            .number()
            .int()
            .positive('Quantity must be at least 1')
            .max(100, 'Quantity cannot exceed 100'),
    }),
});

export const updateCartItemSchema = z.object({
    body: z.object({
        quantity: z
            .number()
            .int()
            .positive('Quantity must be at least 1')
            .max(100, 'Quantity cannot exceed 100'),
    }),
    params: z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];