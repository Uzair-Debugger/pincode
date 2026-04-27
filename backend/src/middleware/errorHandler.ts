import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Programmer error — log it, don't leak internals
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
