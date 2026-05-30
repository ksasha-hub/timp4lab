import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../middleware/auth';
import { ApiError } from '../../utils/errors';
import { getPagination } from '../../utils/pagination';

type ModelName = 'department' | 'asset' | 'incident' | 'audit' | 'vulnerability' | 'mitigation';
type CrudModel = {
  findMany: (args: unknown) => Promise<unknown[]>;
  count: (args: unknown) => Promise<number>;
  findUnique: (args: unknown) => Promise<unknown | null>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
};

export const buildCrudRouter = (
  modelName: ModelName,
  createSchema: z.ZodType<Record<string, unknown>>,
  updateSchema: z.ZodType<Record<string, unknown>>,
  searchField: string,
  options?: {
    include?: Record<string, unknown>;
    beforeDelete?: (id: number) => Promise<void>;
  }
) => {
  const router = Router();
  const model = (prisma as unknown as Record<ModelName, CrudModel>)[modelName];

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query.page as string, req.query.limit as string);
      const search = String(req.query.search ?? '').trim();
      const where = search ? { [searchField]: { contains: search, mode: 'insensitive' } } : undefined;

      const [items, total] = await Promise.all([
        model.findMany({ where, skip, take: limit, orderBy: { id: 'desc' }, include: options?.include }),
        model.count({ where })
      ]);

      res.json({ items, total, page, limit });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const item = await model.findUnique({ where: { id }, include: options?.include });
      if (!item) throw new ApiError(404, 'Not found');
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const data = createSchema.parse(req.body);
      const item = await model.create({ data });
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = updateSchema.parse(req.body);
      const item = await model.update({ where: { id }, data });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (options?.beforeDelete) await options.beforeDelete(id);
      await model.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
