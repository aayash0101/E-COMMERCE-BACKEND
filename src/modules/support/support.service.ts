import { supportMessageRepository } from '@repositories/supportMessage.repository';
import { ApiError } from '@utils/ApiError';
import { ISupportMessage } from '@models/supportMessage.model';

const AUTO_REPLY_TEXT =
  "Thanks for reaching out! Our support team will get back to you shortly. In the meantime, feel free to add any more details about your issue.";

export const supportService = {
  async getMyConversation(customerId: string): Promise<ISupportMessage[]> {
    await supportMessageRepository.markReadByCustomer(customerId);
    return supportMessageRepository.findByCustomerId(customerId);
  },

  async sendCustomerMessage(customerId: string, message: string): Promise<ISupportMessage[]> {
    const existing = await supportMessageRepository.findByCustomerId(customerId);
    const isFirstMessage = existing.length === 0;

    await supportMessageRepository.create({
      customerId,
      senderRole: 'customer',
      senderId: customerId,
      message,
    });

    // Auto-reply only on the very first message of a brand-new conversation,
    // so it doesn't spam an ongoing thread every time the customer writes again.
    if (isFirstMessage) {
      await supportMessageRepository.create({
        customerId,
        senderRole: 'system',
        message: AUTO_REPLY_TEXT,
      });
    }

    return supportMessageRepository.findByCustomerId(customerId);
  },

  async getConversationSummaries() {
    return supportMessageRepository.findConversationSummaries();
  },

  async getConversationForAdmin(customerId: string): Promise<ISupportMessage[]> {
    await supportMessageRepository.markReadByAdmin(customerId);
    return supportMessageRepository.findByCustomerId(customerId);
  },

  async sendAdminMessage(
    customerId: string,
    adminId: string,
    message: string
  ): Promise<ISupportMessage[]> {
    const existing = await supportMessageRepository.findByCustomerId(customerId);
    if (existing.length === 0) {
      throw ApiError.notFound('No conversation exists for this customer yet');
    }

    await supportMessageRepository.create({
      customerId,
      senderRole: 'admin',
      senderId: adminId,
      message,
    });

    return supportMessageRepository.findByCustomerId(customerId);
  },
};