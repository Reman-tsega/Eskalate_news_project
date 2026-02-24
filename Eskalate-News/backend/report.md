# Eskalate Backend Assessment Report

## Implementation Strategy
- Build feature by feature with clean commits.
- Keep strict API response shape aligned to the guideline.
- Enforce validation, centralized error handling, and RBAC from the start.

## Feature Progress

### Feature 1: Secure Signup and Authentication
Status: Completed

Implemented:
- Strong password policy validation.
- Name validation (letters and spaces only).
- Role validation (`author` or `reader`).
- Duplicate email handling with HTTP 409 and proper `Errors` array.
- Password hashing with `bcryptjs`.
- Standard base response format.

### Feature 2: Identity Management (Login)
Status: Completed

Implemented:
- Login with hashed password verification.
- JWT generation including `sub` and `role` claims.
- Configurable expiration (`JWT_EXPIRES_IN`, default 24h).
- Standard success/error responses.

### Feature 3: Content Lifecycle and Soft Deletion (Author-only)
Status: Completed

Implemented:
- POST `/api/v1/articles` for authors only.
- GET `/api/v1/articles/me` for authors only, paginated, includes both Draft and Published.
- PUT `/api/v1/articles/:id` for authors only with ownership checks.
- DELETE `/api/v1/articles/:id` uses soft deletion by setting `deletedAt`.
- Forbidden behavior when modifying another author's article returns `Success: false` and message `Forbidden`.
- Title/content/category/status validations centralized through zod.
- Optional `includeDeleted=true` query on `/articles/me`.

## Data Model Foundation
Status: Completed for baseline

Implemented Prisma models and constraints for:
- User
- Article
- ReadLog
- DailyAnalytics
- Enums: `Role`, `ArticleStatus`

## Next Feature (Planned)
Feature 4: Public News Feed
- GET `/articles` with filters (`category`, `author`, `q`), published-only, non-deleted, paginated.
