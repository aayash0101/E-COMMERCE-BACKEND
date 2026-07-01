import { Router } from 'express';
import { vendorController } from './vendor.controller';
import { protect } from '@middlewares/auth.middleware';
import { restrictTo } from '@middlewares/restrictTo.middleware';
import { requireApprovedVendor } from '@middlewares/requireApprovedVendor.middleware';
import { validate } from '@middlewares/validate.middleware';
import {
    applyAsVendorSchema,
    updateStoreProfileSchema,
    rejectVendorSchema,
} from './vendor.validation';

const router = Router();

router.post(
    '/apply',
    protect,
    restrictTo('customer'),
    validate(applyAsVendorSchema),
    vendorController.apply
);

router.get('/profile', protect, restrictTo('vendor'), vendorController.getMyProfile);
router.put(
  '/profile',
  protect,
  restrictTo('vendor'),
  requireApprovedVendor,
  validate(updateStoreProfileSchema),
  vendorController.updateMyProfile
);

router.get('/', protect, restrictTo('admin'), vendorController.getAllVendors);
router.get('/:id', protect, restrictTo('admin'), vendorController.getVendorById);
router.put('/:id/approve', protect, restrictTo('admin'), vendorController.approve);
router.put(
  '/:id/reject',
  protect,
  restrictTo('admin'),
  validate(rejectVendorSchema),
  vendorController.reject
);

export default router;