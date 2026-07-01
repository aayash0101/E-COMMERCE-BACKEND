import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { vendorService } from './vendor.service';

export const vendorController = {
  apply: asyncHandler(async (req: Request, res: Response) => {
    const profile = await vendorService.apply(
      req.user!.userId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully. Awaiting admin approval.',
      data: { profile },
    });
  }),

  getMyProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await vendorService.getMyProfile(req.user!.userId);
    res.status(200).json({ success: true, data: { profile } });
  }),

  updateMyProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await vendorService.updateMyProfile(
      req.user!.userId,
      req.body
    );
    res.status(200).json({ success: true, data: { profile } });
  }),

  getAllVendors: asyncHandler(async (_req: Request, res: Response) => {
    const vendors = await vendorService.getAllVendors();
    res.status(200).json({ success: true, data: { vendors } });
  }),

  getVendorById: asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.status(200).json({ success: true, data: { vendor } });
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.approve(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: { vendor },
    });
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.reject(
      req.params.id,
      req.body.reason
    );
    res.status(200).json({
      success: true,
      message: 'Vendor rejected',
      data: { vendor },
    });
  }),
};