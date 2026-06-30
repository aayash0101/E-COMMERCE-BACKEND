import { AccessTokenPayload } from '@utils/token';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      vendorProfileId?: string;
    }
  }
}

export {};