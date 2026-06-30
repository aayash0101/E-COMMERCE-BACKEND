import { Router } from 'express';
import { productController } from './product.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { requireApprovedVendor } from '@middlewares/requireApprovedVendor.middleware';
import { validate } from '@middlewares/validate.middleware';
import { uploadProductImages } from '@middlewares/upload.middleware';
import { createProductSchema, updateProductSchema, listProductsQuerySchema } from './product.validation';

const router = Router();

router.get('/', validate(listProductsQuerySchema), productController.list);

router.get(
  '/vendor/mine',
  protect,
  restrictTo('vendor'),
  requireApprovedVendor,
  productController.getMine
);

router.post(
  '/',
  protect,
  restrictTo('vendor'),
  requireApprovedVendor,
  uploadProductImages,
  validate(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  protect,
  restrictTo('vendor'),
  requireApprovedVendor,
  validate(updateProductSchema),
  productController.update
);

router.delete('/:id', protect, restrictTo('vendor'), requireApprovedVendor, productController.remove);

router.get('/:id', productController.getById);

export default router;