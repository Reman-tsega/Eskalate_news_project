# Eskalate News Backend

Backend API for the Eskalate assessment built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## Tech Stack
- Node.js + Express: fast REST API layer with middleware support.
- TypeScript: static typing and safer refactoring.
- Prisma + PostgreSQL: strongly typed ORM with SQL-backed relational constraints.
- Zod: centralized request validation.
- JWT + RBAC middleware: authentication and role-based authorization.
- Swagger UI: API contract and endpoint discovery.
- Jest + Supertest: HTTP-level unit tests with mocked database calls.

## Project Setup (Local)
1. Install dependencies:
```bash
npm install
```
2. Copy env file:
```bash
cp .env.example .env
```
3. Update `.env` with your values.
4. Generate Prisma client:
```bash
npx prisma generate
```
5. Run migrations:
```bash
npx prisma migrate dev --name init
```
6. Start development server:
```bash
npm run dev
```

## Environment Variables
- `PORT`: server port (default `5000`)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiry (default `24h`)
- `REDIS_URL`: Redis connection URL (if used for queue/rate-limit)

See [.env.example](./.env.example) for defaults.

## API Documentation
- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/docs.json`

## Scripts
- `npm run dev`: run with hot-reload
- `npm run build`: compile TypeScript
- `npm start`: run compiled output
- `npm test`: run Jest tests

## Testing
Tests are HTTP-level and mock Prisma, so no database is required during test runs.

Run:
```bash
npm test
```

Covered endpoints:
- `GET /health`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/articles`
- `GET /api/v1/articles/me`
- `PUT /api/v1/articles/:id`
- `DELETE /api/v1/articles/:id`
- `GET /api/docs.json`

## Preventing ReadLog Spam (Refresh Abuse)
To prevent one user from generating 100 reads in 10 seconds:
- Use a dedup key in Redis: `read:{articleId}:{userOrIp}` with short TTL (e.g., 30-60s).
- Log read only if key is absent, then set key with TTL.
- For guests, use IP + user-agent hash; for authenticated users, use userId.
- Add per-user/IP rate limiting on read endpoints.
- Optionally aggregate in queue worker to collapse burst events into one count per time window.

