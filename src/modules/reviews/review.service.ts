import { reviewRepository } from '@repositories/review.repository';
import { orderRepository } from '@repositories/order.repository';
import { productRepository } from '@repositories/product.repository';
import { ApiError } from '@utils/ApiError';
import { IReview } from '@models/review.model';
import { CreateReviewInput, UpdateReviewInput } from './review.validation';

export const reviewService = {
  async create(
    customerId: string,
    input: CreateReviewInput
  ): Promise<IReview> {
    const product = await productRepository.findById(input.productId);
    if (!product) throw ApiError.notFound('Product not found');

    const order = await orderRepository.findById(input.orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.customerId.toString() !== customerId) {
      throw ApiError.forbidden('This order does not belong to you');
    }

    const orderItem = order.items.find(
      (item) => item.productId.toString() === input.productId
    );
    if (!orderItem) {
      throw ApiError.badRequest(
        'You can only review products you have ordered'
      );
    }

    
    if (orderItem.itemStatus !== 'delivered') {
      throw ApiError.badRequest(
        'You can only review products that have been delivered'
      );
    }

    const existingReview = await reviewRepository.findByCustomerAndProduct(
      customerId,
      input.productId
    );
    if (existingReview) {
      throw ApiError.conflict('You have already reviewed this product');
    }

    const review = await reviewRepository.create({
      productId: input.productId,
      customerId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
    });

    await reviewRepository.recalculateProductRating(input.productId);

    return review;
  },

  async getProductReviews(productId: string): Promise<IReview[]> {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    return reviewRepository.findByProductId(productId);
  },

  async update(
    reviewId: string,
    customerId: string,
    input: UpdateReviewInput
  ): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');

    if (review.customerId.toString() !== customerId) {
      throw ApiError.forbidden('You can only edit your own reviews');
    }

    const updated = await reviewRepository.update(reviewId, input);
    if (!updated) throw ApiError.notFound('Review not found');

    await reviewRepository.recalculateProductRating(
      review.productId.toString()
    );

    return updated;
  },

  async delete(reviewId: string, customerId: string): Promise<void> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');

    if (review.customerId.toString() !== customerId) {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    const productId = review.productId.toString();
    await reviewRepository.delete(reviewId);

    await reviewRepository.recalculateProductRating(productId);
  },
};