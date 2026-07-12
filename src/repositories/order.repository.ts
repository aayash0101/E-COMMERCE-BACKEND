import { Order, IOrder, PaymentStatus } from '@models/order.model';
interface CreateOrderInput {
  customerId: string;
  items: {
    productId: string;
    vendorId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  paymentMethod: string;
}
export const orderRepository = {
  async create(data: CreateOrderInput): Promise<IOrder> {
    return Order.create(data);
  },
  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name images')
      .exec();
  },
  async findByIdRaw(id: string): Promise<IOrder | null> {
    return Order.findById(id).exec();
  },
  async findByTransactionUuid(transactionUuid: string): Promise<IOrder | null> {
    return Order.findOne({ transactionUuid }).exec();
  },
  async findByCustomerId(customerId: string): Promise<IOrder[]> {
    return Order.find({ customerId })
      .sort('-createdAt')
      .populate('items.productId', 'name images')
      .exec();
  },
  async findByVendorId(vendorId: string): Promise<IOrder[]> {
    return Order.find({ 'items.vendorId': vendorId })
      .sort('-createdAt')
      .populate('customerId', 'name email')
      .exec();
  },
  async setTransactionUuid(id: string, transactionUuid: string): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(id, { transactionUuid }, { new: true }).exec();
  },
  async updatePaymentStatus(
    id: string,
    status: PaymentStatus
  ): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    ).exec();
  },
  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: string
  ): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.itemStatus': status } },
      { new: true }
    ).exec();
  },
  async cancelOrder(
    orderId: string,
    reason: string,
    paymentStatus?: PaymentStatus
  ): Promise<IOrder | null> {
    const update: Record<string, unknown> = {
      'items.$[].itemStatus': 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date(),
    };
    if (paymentStatus) {
      update.paymentStatus = paymentStatus;
    }
    return Order.findByIdAndUpdate(orderId, { $set: update }, { new: true }).exec();
  },
};