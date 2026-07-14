import { Router } from 'express';
import { supportController } from './support.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
  sendMessageSchema,
  adminSendMessageSchema,
  getConversationSchema,
} from './support.validation';

const router = Router();

// Customer's own conversation
router.get('/me', protect, restrictTo('customer'), supportController.getMyConversation);
router.post(
  '/me',
  protect,
  restrictTo('customer'),
  validate(sendMessageSchema),
  supportController.sendMyMessage
);

// Admin inbox
router.get(
  '/conversations',
  protect,
  restrictTo('admin'),
  supportController.getConversations
);
router.get(
  '/conversations/:customerId',
  protect,
  restrictTo('admin'),
  validate(getConversationSchema),
  supportController.getConversationById
);
router.post(
  '/conversations/:customerId',
  protect,
  restrictTo('admin'),
  validate(adminSendMessageSchema),
  supportController.sendAdminMessage
);

export default router;