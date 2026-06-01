import request from 'supertest';
import { app } from '../src/app';
import { env } from '../src/config/env';
import { prisma } from '../src/config/prisma';

describe('auth flow', () => {
  beforeAll(async () => {
    await prisma.mitigation.deleteMany();
    await prisma.vulnerability.deleteMany();
    await prisma.audit.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('register/login/refresh works', async () => {
    const register = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Strong#123'
    });

    expect(register.status).toBe(201);
    expect(register.body.accessToken).toBeDefined();
    expect(register.headers['set-cookie']).toBeDefined();
    expect(register.body.user.role).toBe('USER');

    const login = await request(app).post('/api/auth/login').send({
      username: 'alice',
      password: 'Strong#123'
    });

    expect(login.status).toBe(200);

    const refresh = await request(app)
      .post('/api/auth/refresh')
      .set('Origin', 'http://localhost:5173')
      .set('Cookie', login.headers['set-cookie']);

    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toBeDefined();
  });

  it('register cannot create admin role from payload', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'bob',
      email: 'bob@example.com',
      password: 'Strong#123',
      role: 'ADMIN'
    });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('USER');

    const dbUser = await prisma.user.findUnique({ where: { username: 'bob' } });
    expect(dbUser?.role).toBe('USER');
  });

  it('reserved username cannot be registered', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'admin',
      email: 'reserved@example.com',
      password: 'Strong#123'
    });

    expect(response.status).toBe(422);
    expect(response.body.detail).toBe('Username is reserved');
  });

  it('returns 422 on invalid payload and exposes zod errors', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'ab',
      email: 'not-email',
      password: '123'
    });

    expect(response.status).toBe(422);
    expect(response.body.detail).toBe('Validation error');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  it('claim-admin route is disabled after first admin exists', async () => {
    const firstClaim = await request(app)
      .post(`/api/auth/claim-admin?secret=${env.claimAdminSecret}`)
      .send({ username: 'firstadmin', email: 'firstadmin@example.com', password: 'Strong#123' });

    expect(firstClaim.status).toBe(201);
    expect(firstClaim.body.user.role).toBe('ADMIN');

    const secondClaim = await request(app)
      .post(`/api/auth/claim-admin?secret=${env.claimAdminSecret}`)
      .send({ username: 'anotheradmin', email: 'anotheradmin@example.com', password: 'Strong#123' });

    expect(secondClaim.status).toBe(404);
  });
});
