import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('department CRUD', () => {
  let accessToken = '';

  beforeAll(async () => {
    await prisma.mitigation.deleteMany();
    await prisma.vulnerability.deleteMany();
    await prisma.audit.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    const register = await request(app).post('/api/auth/register').send({
      username: 'admin2',
      email: 'admin2@example.com',
      password: 'Strong#123'
    });
    accessToken = register.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('can create/list/update/delete department', async () => {
    const authHeader = ['Bearer', accessToken].join(' ');

    const create = await request(app)
      .post('/api/departments')
      .set('Authorization', authHeader)
      .send({ name: 'SOC', description: 'Security operations center' });

    expect(create.status).toBe(201);

    const list = await request(app)
      .get('/api/departments?page=1&limit=10')
      .set('Authorization', authHeader);

    expect(list.status).toBe(200);
    expect(list.body.total).toBeGreaterThanOrEqual(1);

    const id = create.body.id as number;
    const update = await request(app)
      .put(`/api/departments/${id}`)
      .set('Authorization', authHeader)
      .send({ description: 'Updated' });

    expect(update.status).toBe(200);

    const del = await request(app)
      .delete(`/api/departments/${id}`)
      .set('Authorization', authHeader);

    expect(del.status).toBe(204);
  });
});
