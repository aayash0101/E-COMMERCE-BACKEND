import { orderRepository } from '@repositories/order.repository';
import { cartRepository } from '@repositories/cart.repository';
import { productRepository } from '@repositories/product.repository';
import { esewaService } from '@modules/payments/esewa.service';
import { khaltiService } from '@modules/payments/khalti.service';
import { ApiError } from '@utils/ApiError';
import { IOrder } from '@models/order.model';
import { IProduct } from '@models/product.model';
import { PlaceOrderInput } from './order.validation';

export const orderService = {
  async placeOrder(userId: string, input: PlaceOrderInput): Promise<IOrder> {
    const cart = await cartRepository.findByUserIdWithProducts(userId);
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty');
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId as unknown as IProduct;
      if (!product || product.status !== 'active') {
        throw ApiError.badRequest(
          `Product "${product?.name ?? 'unknown'}" is no longer available`
        );
      }
      if (product.stock < cartItem.quantity) {
        throw ApiError.badRequest(
          `Only ${product.stock} units of "${product.name}" are available`
        );
      }
      const subtotal = product.price * cartItem.quantity;
      totalAmount += subtotal;
      orderItems.push({
        productId: product._id.toString(),
        vendorId: product.vendorId.toString(),
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    for (const item of orderItems) {
      await productRepository.decrementStock(item.productId, item.quantity);
    }

    const order = await orderRepository.create({
      customerId: userId,
      items: orderItems,
      shippingAddress: input.shippingAddress,
      totalAmount,
      paymentMethod: input.paymentMethod,
    });

    await cartRepository.clearCart(userId);
    return order;
  },

  async getMyOrders(customerId: string): Promise<IOrder[]> {
    return orderRepository.findByCustomerId(customerId);
  },

  async getOrderById(
    orderId: string,
    userId: string,
    role: string
  ): Promise<IOrder> {
    const rawOrder = await orderRepository.findByIdRaw(orderId);
    if (!rawOrder) throw ApiError.notFound('Order not found');

    if (role === 'customer' && rawOrder.customerId.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this order');
    }

    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  },

  async cancelOrder(
    orderId: string,
    userId: string,
    reason: string
  ): Promise<IOrder> {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.customerId.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this order');
    }

    const allPending = order.items.every(
      (item) => item.itemStatus === 'pending'
    );
    if (!allPending) {
      throw ApiError.badRequest(
        'This order can no longer be cancelled since it is already being processed'
      );
    }

    for (const item of order.items) {
      await productRepository.decrementStock(
        item.productId.toString(),
        -item.quantity
      );
    }

    const refundNeeded = order.paymentStatus === 'paid';
    const updated = await orderRepository.cancelOrder(
      orderId,
      reason,
      refundNeeded ? 'refunded' : undefined
    );
    if (!updated) throw ApiError.notFound('Order not found');
    return updated;
  },

  async initiateEsewaPayment(orderId: string, userId: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.customerId.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this order');
    }
    if (order.paymentMethod !== 'esewa') {
      throw ApiError.badRequest('This order is not set up for eSewa payment');
    }
    if (order.paymentStatus === 'paid') {
      throw ApiError.badRequest('This order has already been paid');
    }

    const transactionUuid = `${orderId}-${Date.now()}`;
    await orderRepository.setTransactionUuid(orderId, transactionUuid);

    return esewaService.buildPaymentForm(order.totalAmount, transactionUuid);
  },

  async verifyEsewaPayment(base64Data: string): Promise<IOrder> {
    const decoded = esewaService.decodeAndVerifyCallback(base64Data);
    if (!decoded) {
      throw ApiError.badRequest('Invalid or tampered payment response');
    }

    const order = await orderRepository.findByTransactionUuid(
      decoded.transaction_uuid
    );
    if (!order) {
      throw ApiError.notFound('Order not found for this transaction');
    }

    const status = await esewaService.checkTransactionStatus(
      decoded.total_amount,
      decoded.transaction_uuid
    );

    if (status !== 'COMPLETE') {
      await orderRepository.updatePaymentStatus(order._id.toString(), 'failed');
      throw ApiError.badRequest('Payment was not completed');
    }

    const updated = await orderRepository.updatePaymentStatus(
      order._id.toString(),
      'paid'
    );
    if (!updated) throw ApiError.notFound('Order not found');
    return updated;
  },

  async initiateKhaltiPayment(
    orderId: string,
    userId: string
  ): Promise<{ pidx: string; paymentUrl: string }> {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.customerId.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this order');
    }
    if (order.paymentMethod !== 'khalti') {
      throw ApiError.badRequest('This order is not set up for Khalti payment');
    }
    if (order.paymentStatus === 'paid') {
      throw ApiError.badRequest('This order has already been paid');
    }

    const orderName = `Order #${orderId.slice(-6).toUpperCase()}`;

    const { pidx, paymentUrl } = await khaltiService.initiatePayment(
      orderId,
      order.totalAmount,
      orderName
    );

    await orderRepository.setKhaltiPidx(orderId, pidx);

    return { pidx, paymentUrl };
  },

  async verifyKhaltiPayment(pidx: string): Promise<IOrder> {
  
    const order = await orderRepository.findByKhaltiPidx(pidx);
    if (!order) {
      throw ApiError.notFound('Order not found for this payment');
    }

    const result = await khaltiService.verifyPayment(pidx);

    if (result.status !== 'Completed') {
      await orderRepository.updatePaymentStatus(order._id.toString(), 'failed');
      throw ApiError.badRequest(
        `Payment was not completed. Status: ${result.status}`
      );
    }

    const updated = await orderRepository.updatePaymentStatus(
      order._id.toString(),
      'paid'
    );
    if (!updated) throw ApiError.notFound('Order not found');
    return updated;
  },

  // ─── Vendor & shared ────────────────────────────────────────────────
  async getVendorOrders(vendorId: string): Promise<IOrder[]> {
    const orders = await orderRepository.findByVendorId(vendorId);
    return orders.map((order) => {
      const vendorItems = order.items.filter(
        (item) => item.vendorId.toString() === vendorId
      );
      order.items = vendorItems;
      return order;
    });
  },

  async updateItemStatus(
    orderId: string,
    itemId: string,
    vendorId: string,
    status: string
  ): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    const item = order.items.find(
      (i) => i._id?.toString() === itemId &&
             i.vendorId.toString() === vendorId
    );
    if (!item) {
      throw ApiError.forbidden('This item does not belong to your store');
    }

    let updated = await orderRepository.updateItemStatus(orderId, itemId, status);
    if (!updated) throw ApiError.notFound('Order not found');

    if (
      updated.paymentMethod === 'cash_on_delivery' &&
      updated.paymentStatus !== 'paid' &&
      updated.items.every((i) => i.itemStatus === 'delivered')
    ) {
      const withPayment = await orderRepository.updatePaymentStatus(
        orderId,
        'paid'
      );
      if (withPayment) updated = withPayment;
    }

    return updated;
  },
};