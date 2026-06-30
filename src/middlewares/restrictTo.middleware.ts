import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { UserRole } from '@models/user.model';

export function restrictTo(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Defensive check — should never trigger if `protect` ran first,
      // but guards against someone reordering middleware by mistake.
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`This action requires one of these roles: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
}