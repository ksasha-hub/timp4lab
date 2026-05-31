import request from 'supertest';
import { app } from '../src/app';
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
      username: 'admin',
      email: 'admin@example.com',
      password: 'Strong#123'
    });

    expect(register.status).toBe(201);
    expect(register.body.accessToken).toBeDefined();
    expect(register.headers['set-cookie']).toBeDefined();

    const login = await request(app).post('/api/auth/login').send({
      login: 'admin',
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
    const claim = await request(app)
      .post('/api/auth/claim-admin?secret=claim_secret')
      .send({ username: 'anotheradmin', email: 'anotheradmin@example.com', password: 'Strong#123' });

    expect(claim.status).toBe(404);
  });
});
