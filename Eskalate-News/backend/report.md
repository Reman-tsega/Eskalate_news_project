# Eskalate Backend Assessment Report

## Current Scope
Implemented and hardened:
- Feature 1: Secure Signup
- Feature 2: Login / Identity
- Feature 3: Author Content Lifecycle + Soft Delete
- Feature 4: Public News Feed
- Feature 5: Read Tracking
- Feature 6: Daily Analytics Processing (GMT)
- Feature 7: Author Dashboard
- Feature 8: Author Content List

## Engineering Improvements
- Standardized response format via shared utility.
- Centralized validation and error handling.
- Removed brittle Prisma runtime error dependency and replaced with stable error-code guard.
- Tightened pagination handling and query normalization.
- Added Swagger/OpenAPI docs for all current endpoints.
- Added mocked HTTP unit tests for all current endpoints.

## Feature Status

### Feature 1: Secure Signup & Authentication
Status: Completed

Implemented:
- Strong password validation (uppercase, lowercase, number, special char, min 8).
- Name validation (letters and spaces only).
- Strict role validation (`author`, `reader`).
- Duplicate email handling using `409 Conflict`.
- Password hashing with `bcryptjs`.

### Feature 2: Identity Management (Login)
Status: Completed

Implemented:
- Credential verification against hashed password.
- JWT issuance containing `sub` and `role`.
- Configurable token expiration (`JWT_EXPIRES_IN`, default `24h`).

### Feature 3: Content Lifecycle & Soft Deletion (Author-only)
Status: Completed

Implemented:
- `POST /api/v1/articles` (author only).
- `GET /api/v1/articles/me` (author only, paginated, includes drafts).
- `PUT /api/v1/articles/:id` (author ownership enforced).
- `DELETE /api/v1/articles/:id` soft delete via `deletedAt`.
- Forbidden updates/deletes return `Success: false` and message `Forbidden`.

### Feature 4: Public News Feed
Status: Completed

Implemented:
- `GET /api/v1/articles`.
- Returns only `Published` and non-deleted articles.
- Supports `category`, `author` (partial author name), and `q` (title keyword).
- Paginated response (default page 1, pageSize 10).

### Feature 5: Read Tracking
Status: Completed

Implemented:
- `GET /api/v1/articles/:id` for full article read.
- Deleted article returns `News article no longer available`.
- Successful reads queue non-blocking `ReadLog` insert.
- Captures `readerId` from JWT if present; otherwise logs as guest.

### Feature 6: Analytics Engine
Status: Completed

Implemented:
- Daily aggregation job processes `ReadLog` for GMT day windows.
- Upserts per `(articleId, date)` in `DailyAnalytics`.
- `dailyAggregationJob` delegates to analytics processor.

### Feature 7: Author Performance Dashboard
Status: Completed

Implemented:
- `GET /api/v1/author/dashboard` (author-only).
- Returns paginated list of non-deleted author articles.
- Includes `title`, `createdAt`, and `totalViews` (sum from `DailyAnalytics`).

### Feature 8: Author Content List
Status: Completed

Implemented:
- `GET /api/v1/articles/me` paginated by authenticated author.
- Returns draft and published items.
- Supports optional soft-deleted inclusion via `includeDeleted=true`.

## Swagger
- UI route: `/api/docs`
- Raw spec route: `/api/docs.json`

## Unit Test Coverage (Mocked DB)
HTTP tests implemented for:
- `GET /health`
- `POST /api/v1/auth/signup` (success, validation failure, duplicate email)
- `POST /api/v1/auth/login` (success, invalid credentials)
- `POST /api/v1/articles` (401, 403, 201)
- `GET /api/v1/articles/me` (200 paginated)
- `GET /api/v1/articles` public feed (200 paginated)
- `GET /api/v1/articles/:id` read flow (200 + deleted 404 path)
- `PUT /api/v1/articles/:id` (403 non-owner)
- `DELETE /api/v1/articles/:id` (200 soft delete path)
- `GET /api/v1/author/dashboard` (200 paginated with total views)
- `GET /api/docs.json`
- Unknown route 404 behavior
- Daily analytics aggregation job behavior

## Data Model Baseline
Prisma schema includes:
- `User`
- `Article`
- `ReadLog`
- `DailyAnalytics`
- Enums: `Role`, `ArticleStatus`

## Refresh Abuse Prevention (ReadLog Burst)
Recommended approach:
- Redis dedup key: `read:{articleId}:{userId|ipHash}` with short TTL (30-60s).
- Skip `ReadLog` insert when dedup key exists.
- Add endpoint-level rate limiting (per user/IP).
- Queue writes and aggregate bursts server-side to reduce write amplification.

## Remaining Gap
- No scheduler/worker runtime is wired yet (e.g., BullMQ/Cron runner). The daily job logic exists and is tested.
