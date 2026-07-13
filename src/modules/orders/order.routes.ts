import { Router } from 'express';
import { orderController } from './order.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { requireApprovedVendor } from '@middlewares/requireApprovedVendor.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
  placeOrderSchema,
  updateItemStatusSchema,
  cancelOrderSchema,
  esewaVerifySchema,
  khaltiVerifySchema,
} from './order.validation';

const router = Router();

router.post(
  '/',
  protect,
  restrictTo('customer'),
  validate(placeOrderSchema),
  orderController.placeOrder
);

router.get('/', protect, restrictTo('customer'), orderController.getMyOrders);

router.put(
  '/:id/cancel',
  protect,
  restrictTo('customer'),
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

router.post(
  '/:id/esewa/initiate',
  protect,
  restrictTo('customer'),
  orderController.initiateEsewaPayment
);

router.post(
  '/esewa/verify',
  validate(esewaVerifySchema),
  orderController.verifyEsewaPayment
);

router.post(
  '/:id/khalti/initiate',
  protect,
  restrictTo('customer'),
  orderController.initiateKhaltiPayment
);

router.post(
  '/khalti/verify',
  validate(khaltiVerifySchema),
  orderController.verifyKhaltiPayment
);

router.get(
  '/vendor/mine',
  protect,
  restrictTo('vendor'),
  requireApprovedVendor,
  orderController.getVendorOrders
);

router.put(
  '/:id/items/:itemId',
  protect,
  restrictTo('vendor'),
  requireApprovedVendor,
  validate(updateItemStatusSchema),
  orderController.updateItemStatus
);

router.get('/:id', protect, orderController.getOrderById);

export default router;