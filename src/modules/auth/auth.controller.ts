import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { authService } from './auth.service';
import { env } from '@config/env';
import { ApiError } from '@utils/ApiError';

const refreshCookieOptions = {
  httpOnly: true, 
  secure: env.nodeEnv === 'production', 
  sameSite: 'strict' as const, 
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw ApiError.unauthorized('No refresh token provided');
    }
    const { accessToken, user } = await authService.refresh(token);
    res.status(200).json({ success: true, data: { accessToken, user } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      await authService.logout(req.user.userId);
    }
    res.clearCookie('refreshToken', refreshCookieOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }),
};