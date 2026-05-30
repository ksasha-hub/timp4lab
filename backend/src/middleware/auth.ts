import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/errors';
import { verifyAccessToken } from '../utils/tokens';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const payload = verifyAccessToken(auth.slice(7));
    req.user = { id: payload.id, role: payload.role as Role };
    next();
  } catch {
    next(new ApiError(401, 'Unauthorized'));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }
    next();
  };
};
