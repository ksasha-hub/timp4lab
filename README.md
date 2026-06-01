# Lab 4 — Интернет-безопасность (REST API + SPA)

Production-ready full-stack app:
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript + MUI (light theme)
- **Auth**: JWT access (15m) + refresh (7d, httpOnly cookie)
- **Infra**: Docker, docker-compose (dev/prod), Nginx reverse proxy

## Demo credentials
- `admin / Admin123!`
- all seeded users use `Admin123!`

## Entities
1. users
2. departments
3. assets
4. incidents
5. audits
6. vulnerabilities
7. mitigations

Frontend uses `frontend/src/entityConfig.ts` and reusable generic pages/components for list/details/create/edit/delete.

## Security/features
- bcrypt password hashing
- server-side password validation (8–20, upper+lower latin, digit, special)
- login/register rate limit (429)
- uniqueness checks on register (`username`, `email`, optional `phone`) with `409`
- public register always creates `USER` role (ignores submitted role) and blocks reserved usernames (e.g. `admin`)
- refresh token in `httpOnly` cookie with configurable `Secure` + `SameSite`
- automatic token refresh via Axios interceptor
- centralized error handling (`422` validation errors now returned in consistent schema)
- `POST /api/auth/claim-admin?secret=...` bootstrap route (disabled with `404` once any admin exists)
- admin cannot delete self (backend + UI)
- department delete blocked with `400` when related assets/users/incidents exist
- trust proxy enabled for nginx deployments
- health checks: `/health` and `/api/health`

## Local run (without Docker)
### Backend
```bash
cd backend
cp .env.example .env
# set DATABASE_URL and secrets
npm ci
npx prisma migrate dev --name init
npm run prisma:generate
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm ci
npm run dev
```

## Docker (dev)
```bash
cp .env.example .env
# set DATABASE_URL in .env using host `db`
docker compose up --build
```
Frontend: `http://localhost:5173`, Backend: `http://localhost:3001`, Swagger: `http://localhost:3001/api/docs`

## Docker (prod)
```bash
cp .env.example .env
# set production secrets + DATABASE_URL (host=db)
docker compose -f docker-compose.prod.yml up --build -d
```
Nginx serves SPA on port `80` and proxies `/api` to backend.

## Seed data
Deterministic seed includes 5–7 records per entity with linked relations.

```bash
cd backend
npm run prisma:seed
```

In docker:
```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

## Tests
### Backend
```bash
cd backend
npm test
```
Includes Jest + Supertest tests for auth and CRUD happy paths.

### Frontend
```bash
cd frontend
npm run test
npm run build
```

## CI/CD
GitHub Actions workflow: `.github/workflows/ci.yml`
- backend: install, prisma generate/migrate, lint, build, test (with PostgreSQL service)
- frontend: install, lint, test, build
