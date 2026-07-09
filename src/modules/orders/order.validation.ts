import { z } from 'zod';

const shippingAddressSchema = z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(7),
    addressLine1: z.string().trim().min(5),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(2),
    postalCode: z.string().trim().min(3),
    country: z.string().trim().min(2),
});

export const placeOrderSchema = z.object({
    body: z.object({
        shippingAddress: shippingAddressSchema,
        paymentMethod: z.enum(['cash_on_delivery', 'esewa', 'khalti']),
    }),
});

export const updateItemStatusSchema = z.object({
    body: z.object({
        status: z.enum(['shipped', 'delivered', 'cancelled']),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
        itemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid item ID'),
    }),
});

export const cancelOrderSchema = z.object({
    body: z.object({
        reason: z.string().trim().min(3, 'Please provide a reason').max(500),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    }),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>['body'];
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>['body'];