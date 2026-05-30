import { NextFunction, Request, Response } from 'express';

export const log5xx = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode >= 500) {
      console.error(`[5xx] ${req.method} ${req.path} ${res.statusCode}`);
    }
  });
  next();
};
