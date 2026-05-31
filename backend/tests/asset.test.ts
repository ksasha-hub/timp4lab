import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('asset CRUD', () => {
  let accessToken = '';
  let departmentId = 0;

  beforeAll(async () => {
    await prisma.mitigation.deleteMany();
    await prisma.vulnerability.deleteMany();
    await prisma.audit.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    const register = await request(app).post('/api/auth/register').send({
      username: 'asset-admin',
      email: 'asset-admin@example.com',
      password: 'Strong#123'
    });

    accessToken = register.body.accessToken;

    const department = await request(app)
      .post('/api/departments')
      .set('Authorization', ['Bearer', accessToken].join(' '))
      .send({ name: 'IT Asset Team', description: 'Assets owner' });

    departmentId = department.body.id as number;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('can create/list/update/delete asset', async () => {
    const authHeader = ['Bearer', accessToken].join(' ');

    const create = await request(app)
      .post('/api/assets')
      .set('Authorization', authHeader)
      .send({ name: 'Edge Router', room: 'B-101', departmentId });

    expect(create.status).toBe(201);

    const list = await request(app)
      .get('/api/assets?page=1&limit=10')
      .set('Authorization', authHeader);

    expect(list.status).toBe(200);
    expect(list.body.total).toBeGreaterThanOrEqual(1);

    const id = create.body.id as number;
    const update = await request(app)
      .put(`/api/assets/${id}`)
      .set('Authorization', authHeader)
      .send({ room: 'B-202' });

    expect(update.status).toBe(200);
    expect(update.body.room).toBe('B-202');

    const del = await request(app)
      .delete(`/api/assets/${id}`)
      .set('Authorization', authHeader);

    expect(del.status).toBe(204);
  });
});
