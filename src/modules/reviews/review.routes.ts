import { Router } from 'express';
import { reviewController } from './review.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { validate } from '@middlewares/validate.middleware';
import { createReviewSchema, updateReviewSchema } from './review.validation';

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);

router.post(
    '/',
    protect,
    restrictTo('customer'),
    validate(createReviewSchema),
    reviewController.create
);

router.put(
    '/:id',
    protect,
    restrictTo('customer'),
    validate(updateReviewSchema),
    reviewController.update
);

router.delete(
    '/:id',
    protect,
    restrictTo('customer'),
    reviewController.delete
);

export default router;