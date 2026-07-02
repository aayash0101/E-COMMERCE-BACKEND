import { userRepository } from '@repositories/user.repository';
import { vendorProfileRepository } from '@repositories/vendorProfile.repository';
import { productRepository } from '@repositories/product.repository';
import { ApiError } from '@utils/ApiError';
import { User } from '@models/user.model';
import { Order } from '@models/order.model';
import { Product } from '@models/product.model';
import { VendorProfile } from '@models/vendorProfile.model';

export const adminService = {
  async getStats() {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      VendorProfile.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    return {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
    };
  },

  async getAllUsers() {
    return userRepository.findAll();
  },

  async deactivateUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (user.role === 'admin') {
      throw ApiError.forbidden('Cannot deactivate an admin account');
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    if (!updated) throw ApiError.notFound('User not found');
    return updated;
  },

  async activateUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const updated = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    if (!updated) throw ApiError.notFound('User not found');
    return updated;
  },

  async getAllProducts() {
    return Product.find()
      .populate('vendorId', 'storeName')
      .populate('categoryId', 'name')
      .sort('-createdAt')
      .exec();
  },

  async flagProduct(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    const updated = await productRepository.update(productId, {
      status: 'flagged',
    });
    if (!updated) throw ApiError.notFound('Product not found');
    return updated;
  },

  async unflagProduct(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    if (product.status !== 'flagged') {
      throw ApiError.badRequest('Product is not flagged');
    }

    const updated = await productRepository.update(productId, {
      status: 'active',
    });
    if (!updated) throw ApiError.notFound('Product not found');
    return updated;
  },

  async deleteProduct(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');
    await productRepository.delete(productId);
  },

  async getAllOrders() {
    return Order.find()
      .populate('customerId', 'name email')
      .sort('-createdAt')
      .exec();
  },

  async getPendingVendors() {
    return vendorProfileRepository.findAllByStatus('pending');
  },

  async getRevenueByMonth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  },
};