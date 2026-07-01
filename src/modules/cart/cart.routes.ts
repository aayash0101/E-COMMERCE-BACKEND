import { Router } from 'express';
import { cartController } from './cart.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { validate } from '@middlewares/validate.middleware';
import { addToCartSchema, updateCartItemSchema } from './cart.validation';

const router = Router();

router.use(protect, restrictTo('customer'));

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addItem);
router.put('/:productId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;