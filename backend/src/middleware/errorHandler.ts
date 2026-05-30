import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ detail: err.message });
  }
  if (
    typeof err === 'object'
    && err !== null
    && 'status' in err
    && 'message' in err
    && typeof (err as { status: number }).status === 'number'
  ) {
    const typed = err as { status: number; message: string; errors?: unknown };
    return res.status(typed.status).json(
      typed.status === 422
        ? { detail: typed.message, errors: typed.errors ?? null }
        : { detail: typed.message }
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ detail: 'Unique constraint violation' });
    }
  }

  console.error(err);
  return res.status(500).json({ detail: 'Internal server error' });
};
