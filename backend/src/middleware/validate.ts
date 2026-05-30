import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next({
        status: 422,
        message: 'Validation error',
        errors: result.error.flatten().fieldErrors
      });
    }
    req.body = result.data;
    next();
  };
};
