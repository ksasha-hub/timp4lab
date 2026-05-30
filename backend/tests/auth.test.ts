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
      .set('Cookie', login.headers['set-cookie']);

    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toBeDefined();
  });
});
