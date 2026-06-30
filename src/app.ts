import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '@config/env';
import { errorMiddleware } from '@middlewares/error.middleware';
import { ApiError } from '@utils/ApiError';
import authRoutes from '@modules/auth/auth.routes';
import productRoutes from '@modules/products/product.routes';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'API is healthy' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);

  app.use((req: Request, _res: Response) => {
    throw ApiError.notFound(`Route ${req.originalUrl} not found`);
  });

  app.use(errorMiddleware);

  return app;
}