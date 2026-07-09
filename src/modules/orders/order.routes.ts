import { Router } from 'express';
import { orderController } from './order.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { requireApprovedVendor } from '@middlewares/requireApprovedVendor.middleware';
import { validate } from '@middlewares/validate.middleware';
import { placeOrderSchema, updateItemStatusSchema, cancelOrderSchema } from './order.validation';
const router = Router();
router.post(
    '/',
    protect,
    restrictTo('customer'),
    validate(placeOrderSchema),
    orderController.placeOrder
);
router.get(
    '/',
    protect,
    restrictTo('customer'),
    orderController.getMyOrders
);
router.get(
    '/vendor/mine',
    protect,
    restrictTo('vendor'),
    requireApprovedVendor,
    orderController.getVendorOrders
);
router.put(
    '/:id/cancel',
    protect,
    restrictTo('customer'),
    validate(cancelOrderSchema),
    orderController.cancelOrder
);
router.put(
    '/:id/items/:itemId',
    protect,
    restrictTo('vendor'),
    requireApprovedVendor,
    validate(updateItemStatusSchema),
    orderController.updateItemStatus
);
router.get(
    '/:id',
    protect,
    orderController.getOrderById
);
export default router;