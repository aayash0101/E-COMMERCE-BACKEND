import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(2000),
  }),
});

export const adminSendMessageSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(2000),
  }),
  params: z.object({
    customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID'),
  }),
});

export const getConversationSchema = z.object({
  params: z.object({
    customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID'),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type AdminSendMessageInput = z.infer<typeof adminSendMessageSchema>['body'];