import { Cart, ICart } from '@models/cart.model';

export const cartRepository = {
  async findByUserId(userId: string): Promise<ICart | null> {
    return Cart.findOne({ userId }).exec();
  },

  async findByUserIdWithProducts(userId: string): Promise<ICart | null> {
    return Cart.findOne({ userId })
      .populate('items.productId', 'name price images stock status vendorId')
      .exec();
  },

  async upsert(userId: string): Promise<ICart> {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { upsert: true, new: true }
    ).exec();
    return cart!;
  },

  async addOrUpdateItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<ICart | null> {
    const existingCart = await Cart.findOne({
      userId,
      'items.productId': productId,
    });

    if (existingCart) {
      return Cart.findOneAndUpdate(
        { userId, 'items.productId': productId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
      ).exec();
    }

    return Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, quantity } } },
      { new: true, upsert: true }
    ).exec();
  },

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    return Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    ).exec();
  },

  async clearCart(userId: string): Promise<ICart | null> {
    return Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    ).exec();
  },
};