import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { vendorProfileRepository } from '@repositories/vendorProfile.repository';

export async function requireApprovedVendor(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  const vendorProfile = await vendorProfileRepository.findByUserId(req.user.userId);

  if (!vendorProfile) {
    return next(ApiError.forbidden('No vendor profile found. Apply to become a vendor first.'));
  }

  if (vendorProfile.approvalStatus !== 'approved') {
    return next(
      ApiError.forbidden(
        `Your vendor account is ${vendorProfile.approvalStatus}. You cannot perform this action until approved.`
      )
    );
  }

  req.vendorProfileId = vendorProfile._id.toString();
  next();
}