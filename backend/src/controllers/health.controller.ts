import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma.service';

export async function healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    next(err);
  }
}
