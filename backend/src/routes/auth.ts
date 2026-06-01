import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { CookieOptions, Response, Router } from 'express';
import type { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { ApiError } from '../utils/errors';
import { isStrongPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { detail: 'Too many requests, try later' },
  standardHeaders: true,
  legacyHeaders: false
});

const reservedUsernames = new Set(['admin', 'root', 'system']);
const isReservedUsername = (username: string) => reservedUsernames.has(username.trim().toLowerCase());

const authSchema = z.object({
  username: z.string().min(3).max(64),
  email: z.email(),
  phone: z.string().min(5).max(32).optional(),
  password: z.string().min(8).max(20)
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8)
});

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth'
});

const issueTokens = async (user: { id: number; role: Role }, res: Response) => {
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });
  res.cookie(env.refreshCookieName, refreshToken, getCookieOptions());
  return { accessToken };
};

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const parsed = authSchema.parse(req.body);
    if (isReservedUsername(parsed.username)) {
      throw new ApiError(422, 'Username is reserved');
    }

    if (!isStrongPassword(parsed.password)) {
      throw new ApiError(422, 'Password must contain upper/lower latin letters, number and special char');
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: parsed.username },
          { email: parsed.email },
          ...(parsed.phone ? [{ phone: parsed.phone }] : [])
        ]
      }
    });

    if (existing) {
      if (existing.username === parsed.username) throw new ApiError(409, 'Username already exists');
      if (existing.email === parsed.email) throw new ApiError(409, 'Email already exists');
      throw new ApiError(409, 'Phone already exists');
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({
      data: {
        username: parsed.username,
        email: parsed.email,
        phone: parsed.phone,
        passwordHash,
        role: Role.USER
      }
    });

    const tokens = await issueTokens({ id: user.id, role: user.role }, res);

    res.status(201).json({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: parsed.username }, { email: parsed.username }]
      }
    });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid credentials');

    const tokens = await issueTokens({ id: user.id, role: user.role }, res);

    res.json({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies[env.refreshCookieName] as string | undefined;
    if (!token) throw new ApiError(401, 'Missing refresh token');

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user?.refreshTokenHash) throw new ApiError(401, 'Invalid refresh token');

    const ok = await bcrypt.compare(token, user.refreshTokenHash);
    if (!ok) throw new ApiError(401, 'Invalid refresh token');

    const tokens = await issueTokens({ id: user.id, role: user.role }, res);

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    await prisma.user.update({ where: { id: req.user.id }, data: { refreshTokenHash: null } });
    res.clearCookie(env.refreshCookieName, getCookieOptions());
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id }, select: { id: true, username: true, email: true, role: true } });
    if (!user) throw new ApiError(404, 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

const claimAdminBodySchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(8).max(20),
  claimKey: z.string().optional()
});

const resolveClaimSecret = (req: Request, bodyClaimKey?: string) => {
  const querySecret = typeof req.query.secret === 'string' ? req.query.secret : undefined;
  return querySecret ?? bodyClaimKey;
};

const claimAdminHandler = async (req: Request, res: Response, next: (err?: unknown) => void) => {
  try {
    const adminExists = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminExists > 0) {
      throw new ApiError(404, 'Not found');
    }

    const body = claimAdminBodySchema.parse(req.body);
    const secret = resolveClaimSecret(req, body.claimKey);

    if (!secret || secret !== env.claimAdminSecret) {
      throw new ApiError(403, 'Invalid claim key');
    }

    if (!isStrongPassword(body.password)) {
      throw new ApiError(422, 'Password must contain upper/lower latin letters, number and special char');
    }

    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, 12),
        role: Role.ADMIN
      }
    });

    const tokens = await issueTokens({ id: user.id, role: user.role }, res);

    res.status(201).json({ ...tokens, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

router.post('/claim-admin', claimAdminHandler);
router.post('/claim-admin-x9k4m2', claimAdminHandler);

export default router;
