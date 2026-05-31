import { z } from 'zod';
import { Router } from 'express';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { buildCrudRouter } from './crudFactory';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/errors';
import { requireAuth, requireRole } from '../../middleware/auth';
import { isStrongPassword } from '../../utils/password';
import { getPagination } from '../../utils/pagination';

const router = Router();

const departmentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional()
});

const assetSchema = z.object({
  name: z.string().min(2).max(100),
  room: z.string().min(1).max(100),
  departmentId: z.number().int().positive()
});

const incidentSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(1000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  departmentId: z.number().int().positive(),
  assetId: z.number().int().positive().nullable().optional(),
  reporterId: z.number().int().positive().nullable().optional()
});

const auditSchema = z.object({
  title: z.string().min(2).max(150),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'DONE']),
  date: z.string().datetime(),
  departmentId: z.number().int().positive()
});

const vulnerabilitySchema = z.object({
  title: z.string().min(2).max(150),
  cvss: z.number().min(0).max(10),
  assetId: z.number().int().positive(),
  status: z.enum(['OPEN', 'MITIGATED'])
});

const mitigationSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(1000),
  vulnerabilityId: z.number().int().positive(),
  dueDate: z.string().datetime().nullable().optional()
});

router.use('/departments', buildCrudRouter('department', departmentSchema, departmentSchema.partial(), 'name', {
  beforeDelete: async (id: number) => {
    const [assets, users, incidents] = await Promise.all([
      prisma.asset.count({ where: { departmentId: id } }),
      prisma.user.count({ where: { departmentId: id } }),
      prisma.incident.count({ where: { departmentId: id } })
    ]);

    if (assets + users + incidents > 0) {
      throw new ApiError(400, 'Cannot delete department: remove related assets/users/incidents first');
    }
  }
}));

router.use('/assets', buildCrudRouter('asset', assetSchema, assetSchema.partial(), 'name'));
router.use('/incidents', buildCrudRouter('incident', incidentSchema, incidentSchema.partial(), 'title'));
router.use('/audits', buildCrudRouter('audit', auditSchema, auditSchema.partial(), 'title'));
router.use('/vulnerabilities', buildCrudRouter('vulnerability', vulnerabilitySchema, vulnerabilitySchema.partial(), 'title'));
router.use('/mitigations', buildCrudRouter('mitigation', mitigationSchema, mitigationSchema.partial(), 'title'));

router.get('/users', requireAuth, requireRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page as string, req.query.limit as string);
    const search = String(req.query.search ?? '').trim();
    const where: Prisma.UserWhereInput | undefined = search
      ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
      : undefined;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, username: true, email: true, phone: true, role: true, departmentId: true },
        orderBy: { id: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

router.post('/users', requireAuth, requireRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const body = z.object({
      username: z.string().min(3),
      email: z.email(),
      password: z.string().min(8).max(20),
      role: z.enum(['ADMIN', 'SUPERVISOR', 'USER']),
      departmentId: z.number().int().positive().nullable().optional()
    }).parse(req.body);
    if (!isStrongPassword(body.password)) {
      throw new ApiError(422, 'Weak password');
    }
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        role: body.role,
        departmentId: body.departmentId ?? null,
        passwordHash: await bcrypt.hash(body.password, 12)
      },
      select: { id: true, username: true, email: true, role: true, departmentId: true }
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', requireAuth, requireRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = z.object({ role: z.enum(['ADMIN', 'SUPERVISOR', 'USER']).optional(), departmentId: z.number().int().positive().nullable().optional() }).parse(req.body);
    const user = await prisma.user.update({ where: { id }, data: body, select: { id: true, username: true, email: true, role: true, departmentId: true } });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', requireAuth, requireRole([Role.ADMIN]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (req.user?.id === id) {
      throw new ApiError(400, 'Admin cannot delete self');
    }
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
