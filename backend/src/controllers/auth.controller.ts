import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

const SALT_ROUNDS = 12;
const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  const msIn7Days = 7 * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,                              // not accessible via JS
    secure: env.NODE_ENV === 'production',       // HTTPS only in prod
    sameSite: 'strict' as const,
    maxAge: msIn7Days,
  };
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };

    if (!email || !password) throw new AppError('Email and password are required', 400);
    if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already in use', 409);

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, role: true, name: true },
    });

    res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Persist refresh token (hashed) in DB
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: hashedRefresh, userId: user.id, expiresAt } });

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.json({
      status: 'success',
      data: {
        accessToken,
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new AppError('No refresh token', 401);

    const payload = verifyRefreshToken(token); // throws if expired/invalid

    // Find a stored token that matches
    const stored = await prisma.refreshToken.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });
    const match = await Promise.any(
      stored.map(async (r) => {
        const ok = await bcrypt.compare(token, r.token);
        if (!ok) throw new Error('no match');
        return r;
      })
    ).catch(() => null);

    if (!match) throw new AppError('Refresh token invalid or expired', 401);

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: match.id } });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    const newPayload = { sub: user.id, email: user.email, role: user.role };
    const newAccess = signAccessToken(newPayload);
    const newRefresh = signRefreshToken(newPayload);

    const hashedRefresh = await bcrypt.hash(newRefresh, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: hashedRefresh, userId: user.id, expiresAt } });

    res.cookie(REFRESH_COOKIE, newRefresh, refreshCookieOptions());
    res.json({ status: 'success', data: { accessToken: newAccess } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      // Best-effort: delete all tokens for user identified by the cookie
      try {
        const payload = verifyRefreshToken(token);
        await prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });
      } catch {
        // token already expired — still clear cookie
      }
    }
    res.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ status: 'success', message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}
