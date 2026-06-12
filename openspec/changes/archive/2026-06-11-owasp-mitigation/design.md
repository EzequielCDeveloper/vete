# Design: OWASP Top 10 2021 — Mitigation

## Technical Approach

Implement 11 security requirements in priority order per spec §4. Each layer is independently revertible — all additions are middleware, new files, or schema extensions. Architecture follows existing patterns: CommonJS modules, Express middleware chain, MariaDB SPs, JWT auth. The critical path is REQ-01 (bcrypt) since it modifies auth SP and seed data.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| bcrypt comparison | `sp_login` returns hash; controller calls `bcrypt.compare()` | SP must never see plain-text passwords. No MariaDB bcrypt UDF exists. |
| Account lockout window | Rolling 30-min from first attempt: count attempts WHERE `created_at > NOW()-30min`, block at ≥ 5 | Resolves spec ambiguity. No cron needed; cleanup on every check. |
| Zod schemas location | Single `schemas.js` file | ~15 endpoints across 5 controllers — one file is navigable. |
| Pino rotation | `pino-roll` daily rotation + `fs.mkdirSync('./logs', {recursive: true})` at startup | Without rotation, logs fill disk. Dev mode uses `pino-pretty` to stdout. |
| Role middleware | `requireRole(...roles)` variadic; keep `isAdmin` as thin wrapper | Enables granularity without refactoring admin-only routes. |
| Rate limiter scope | Route-level on `authRoutes.js` only | Global limiter would block dashboard/patient queries. 10 req/15 min per IP. |

## Data Flow

### Login (most complex path)
```
POST /api/auth/login
  → rateLimiter (10/15min per IP) → 429 if exceeded
  → authController.login
    → SELECT COUNT(*) FROM login_attempts WHERE username=? AND created_at > NOW()-30min
    → if ≥ 5: 429 + audit('login.blocked')
    → CALL sp_login(?) → returns { user data + hash } (no longer compares in SQL)
    → bcrypt.compare(password, hash)
    → if mismatch: INSERT login_attempts + audit('login.failed') → 401
    → if match: DELETE login_attempts + audit('login.success') → sign JWT → 200
```

### Middleware chain (all protected routes)
```
Req → helmet → cors(origin) → express.json(1mb) → routes
  → auth (JWT verify) → requireRole(...) → validate(schema|Id) → controller → DB → response
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `config/env.js` | Modify | Remove JWT_SECRET fallback; `process.exit(1)` if missing |
| `src/index.js` | Modify | Add helmet, CORS origin from env, `express.json({ limit: '1mb' })` |
| `src/middlewares/auth.js` | Modify | Add `requireRole(...roles)` |
| `src/controllers/authController.js` | Modify | bcrypt.compare, account lockout, audit |
| `src/controllers/userController.js` | Modify | bcrypt.hash on create, Zod validation |
| `src/controllers/patientController.js` | Modify | Zod validation + audit |
| `src/controllers/appointmentController.js` | Modify | Zod + audit for create/update/cancel/complete |
| `src/controllers/procedureController.js` | Modify | Zod + audit for create/update |
| `src/controllers/medicalRecordController.js` | Modify | Zod validation |
| `src/routes/authRoutes.js` | Modify | Add rate limiter |
| `src/routes/*.js` (5 files) | Modify | Add `validate()` and `validateId()` middleware |
| `src/routes/procedureRoutes.js` | Modify | Add `requireRole('administrador','veterinario')` |
| `src/helpers/validate.js` | Create | `validate(schema)` and `validateId(name)` middleware |
| `src/helpers/schemas.js` | Create | Zod schemas for all entities |
| `src/helpers/logger.js` | Create | Pino instance, env-aware transport, dir guard |
| `src/helpers/audit.js` | Create | `log(pool, userId, action, entityType, entityId, details)` |
| `backend/package.json` | Modify | Add bcrypt, zod, helmet, express-rate-limit, pino, pino-roll |
| `backend/.env` | Modify | Replace JWT_SECRET with `openssl rand -base64 32` |
| `db/schema.sql` | Modify | sp_login/sp_create_user hash-aware; add login_attempts + audit_log tables; seed hashes |

## Interfaces / Contracts

```js
// validate.js — Express higher-order middleware
function validate(schema)       // req.body against Zod schema → 400 on error
function validateId(paramName)  // req.params[name] as positive int → 400

// middlewares/auth.js — additive
function requireRole(...roles)  // req.user.rol in roles → 403 if not

// audit.js
async function log(pool, userId, action, entityType, entityId, details = {})
// INSERT INTO audit_log (...) VALUES (...)
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Manual | Seed login | admin/secre1/vet1 auth with bcrypt hashes |
| Manual | Lockout | 5 failed → 6th = 429; success clears counter |
| Manual | Rate limit | 11 POST /login → 11th = 429 |
| Manual | Zod | Missing fields, bad date format, negative price → 400 |
| Manual | Role guard | secretario POST /procedures → 403 |
| Manual | JWT_SECRET | Unset env → `process.exit(1)` |
| Manual | Pino | `./logs/vetcare.log` created, rotations work |

## Migration / Rollout

1. Run `scripts/hash-seed-passwords.js` once to produce bcrypt hashes for admin123, secre123, vet123
2. Deploy `schema.sql` FIRST (new tables, modified SPs, hashed seeds)
3. Deploy code changes (helpers, controllers, routes, env.js)
4. Update `.env` JWT_SECRET with strong value
5. Start server, validate all 3 seed users
6. Smoke test CRUD on all entities

Only seed passwords change — no data migration needed.

## Open Questions

None. Account lockout window clarified (rolling 30-min from first attempt). Log rotation + directory guard added. sp_login uses parameterized query returning hash instead of comparing in SQL.
