import { Router } from 'express';
import { categoryController } from './category.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { validate } from '@middlewares/validate.middleware';
import { createCategorySchema } from './category.validation';

const router = Router();

router.get('/', categoryController.list);

router.post(
  '/',
  protect,
  restrictTo('admin'),
  validate(createCategorySchema),
  categoryController.create
);

export default router;