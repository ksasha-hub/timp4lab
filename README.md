# Lab 4 — Интернет-безопасность (REST API + SPA)

Production-ready full-stack app:
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript
- **Auth**: JWT access (15m) + refresh (7d, httpOnly cookie)
- **Infra**: Docker, docker-compose (dev/prod), Nginx reverse proxy

## Entities
1. users
2. departments
3. assets
4. incidents
5. audits
6. vulnerabilities
7. mitigations

Frontend uses `frontend/src/entityConfig.ts` and reusable generic pages/components for list/details/create/edit/delete.

## Security features
- bcrypt password hashing
- server-side password validation (8–20, upper+lower latin, digit, special)
- login/register rate limit (429)
- uniqueness checks on register (`username`, `email`, optional `phone`) with `409`
- refresh token in `httpOnly` cookie with configurable `Secure` + `SameSite`
- automatic token refresh via Axios interceptor
- centralized error handling via `getApiError` + `ErrorNotice`
- `/api/auth/claim-admin-x9k4m2` bootstrap route (works only when no admin exists and secret is correct)
- admin cannot delete self (backend + UI)
- department delete blocked with `400` when related assets/users/incidents exist
- middleware logs all `5xx` responses

## Access token storage note
Frontend stores access token in `localStorage` (simplifies SPA refresh). Risk: token can be stolen via XSS. Mitigate with strict input handling/CSP and prefer memory-only storage in stricter environments.

## Local run (without Docker)
### Backend
```bash
cd backend
cp .env.example .env
# set DATABASE_URL and secrets
npm ci
npx prisma migrate dev --name init
npm run prisma:generate
npm run seed
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
# set DATABASE_URL in .env using your PostgreSQL connection string (host `db` in docker network)
docker compose up --build
```
Frontend: `http://localhost:5173`, Backend: `http://localhost:3001`, Swagger: `http://localhost:3001/api/docs`

## Docker (prod)
```bash
cp .env.example .env
# set production secrets + DATABASE_URL (host=db)
docker compose -f docker-compose.prod.yml up --build -d
```
Nginx serves SPA on port `80` and proxies `/api` to backend. Backend and DB are internal-only.

## Seed data
```bash
cd backend
npm run seed
```
Creates demo admin/user-linked security records.

## Tests
### Backend
```bash
cd backend
npm test
```
Includes Jest + Supertest tests for auth flow and department CRUD.

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
