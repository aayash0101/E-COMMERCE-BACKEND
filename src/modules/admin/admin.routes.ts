import { Router } from 'express';
import { adminController } from './admin.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', adminController.getStats);
router.get('/revenue', adminController.getRevenueByMonth);

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/deactivate', adminController.deactivateUser);
router.put('/users/:userId/activate', adminController.activateUser);

router.get('/products', adminController.getAllProducts);
router.put('/products/:productId/flag', adminController.flagProduct);
router.put('/products/:productId/unflag', adminController.unflagProduct);
router.delete('/products/:productId', adminController.deleteProduct);

router.get('/orders', adminController.getAllOrders);

router.get('/vendors/pending', adminController.getPendingVendors);

export default router;