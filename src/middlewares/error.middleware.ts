import { NextFunction, Request, Response } from 'express';
import { env } from '@config/env';
import { ApiError } from '@utils/ApiError';

export function errorMiddleware(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Something went wrong';
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
    isOperational = true;
  }

  if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = 'A resource with this value already exists';
    isOperational = true;
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);

  res.status(statusCode).json({
    success: false,
    message: isOperational ? message : 'Something went wrong',
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
}