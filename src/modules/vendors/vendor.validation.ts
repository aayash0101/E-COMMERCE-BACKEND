import { z } from 'zod';

export const applyAsVendorSchema = z.object({
  body: z.object({
    storeName: z
      .string()
      .trim()
      .min(2, 'Store name must be at least 2 characters')
      .max(100),
    storeDescription: z.string().trim().max(1000).optional(),
  }),
});

export const updateStoreProfileSchema = z.object({
  body: z.object({
    storeName: z.string().trim().min(2).max(100).optional(),
    storeDescription: z.string().trim().max(1000).optional(),
  }),
});

export const rejectVendorSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(5, 'Please provide a reason for rejection'),
  }),
});

export type ApplyAsVendorInput = z.infer<typeof applyAsVendorSchema>['body'];
export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>['body'];