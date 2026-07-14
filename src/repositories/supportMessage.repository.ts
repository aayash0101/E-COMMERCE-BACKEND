import { SupportMessage, ISupportMessage } from '@models/supportMessage.model';

interface CreateMessageInput {
  customerId: string;
  senderRole: 'customer' | 'admin' | 'system';
  senderId?: string;
  message: string;
}

export const supportMessageRepository = {
  async create(data: CreateMessageInput): Promise<ISupportMessage> {
    const readByAdmin = data.senderRole === 'admin';
    const readByCustomer = data.senderRole === 'customer';
    return SupportMessage.create({ ...data, readByAdmin, readByCustomer });
  },

  async findByCustomerId(customerId: string): Promise<ISupportMessage[]> {
    return SupportMessage.find({ customerId }).sort('createdAt').exec();
  },

  async markReadByCustomer(customerId: string): Promise<void> {
    await SupportMessage.updateMany(
      { customerId, readByCustomer: false },
      { readByCustomer: true }
    ).exec();
  },

  async markReadByAdmin(customerId: string): Promise<void> {
    await SupportMessage.updateMany(
      { customerId, readByAdmin: false },
      { readByAdmin: true }
    ).exec();
  },

  /** One row per customer thread, with their most recent message + unread count for the admin inbox list. */
  async findConversationSummaries() {
    return SupportMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$customerId',
          lastMessage: { $first: '$message' },
          lastMessageAt: { $first: '$createdAt' },
          lastSenderRole: { $first: '$senderRole' },
          unreadByAdminCount: {
            $sum: { $cond: [{ $eq: ['$readByAdmin', false] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          customerId: '$_id',
          customerName: '$customer.name',
          customerEmail: '$customer.email',
          lastMessage: 1,
          lastMessageAt: 1,
          lastSenderRole: 1,
          unreadByAdminCount: 1,
          _id: 0,
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);
  },
};