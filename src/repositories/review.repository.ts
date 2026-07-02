import { Review, IReview } from '@models/review.model';
import { Product } from '@models/product.model';

export const reviewRepository = {
  async create(data: {
    productId: string;
    customerId: string;
    orderId: string;
    rating: number;
    comment: string;
  }): Promise<IReview> {
    return Review.create(data);
  },

  async findById(id: string): Promise<IReview | null> {
    return Review.findById(id).exec();
  },

  async findByProductId(productId: string): Promise<IReview[]> {
    return Review.find({ productId })
      .populate('customerId', 'name')
      .sort('-createdAt')
      .exec();
  },

  async findByCustomerAndProduct(
    customerId: string,
    productId: string
  ): Promise<IReview | null> {
    return Review.findOne({ customerId, productId }).exec();
  },

  async update(
    id: string,
    updates: { rating?: number; comment?: string }
  ): Promise<IReview | null> {
    return Review.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async delete(id: string): Promise<void> {
    await Review.findByIdAndDelete(id).exec();
  },

  async recalculateProductRating(productId: string): Promise<void> {
    const result = await Review.aggregate([
      { $match: { productId: productId } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        reviewCount: result[0].reviewCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  },
};