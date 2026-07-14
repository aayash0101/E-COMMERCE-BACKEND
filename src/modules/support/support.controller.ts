import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { supportService } from './support.service';

export const supportController = {
  getMyConversation: asyncHandler(async (req: Request, res: Response) => {
    const messages = await supportService.getMyConversation(req.user!.userId);
    res.status(200).json({ success: true, data: { messages } });
  }),

  sendMyMessage: asyncHandler(async (req: Request, res: Response) => {
    const messages = await supportService.sendCustomerMessage(
      req.user!.userId,
      req.body.message
    );
    res.status(201).json({ success: true, data: { messages } });
  }),

  getConversations: asyncHandler(async (_req: Request, res: Response) => {
    const conversations = await supportService.getConversationSummaries();
    res.status(200).json({ success: true, data: { conversations } });
  }),

  getConversationById: asyncHandler(async (req: Request, res: Response) => {
    const messages = await supportService.getConversationForAdmin(req.params.customerId);
    res.status(200).json({ success: true, data: { messages } });
  }),

  sendAdminMessage: asyncHandler(async (req: Request, res: Response) => {
    const messages = await supportService.sendAdminMessage(
      req.params.customerId,
      req.user!.userId,
      req.body.message
    );
    res.status(201).json({ success: true, data: { messages } });
  }),
};