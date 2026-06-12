# Tasks: OWASP Top 10 2021 — Mitigation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500-600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 (feature-branch-chain) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes (resolved: stacked-to-main PR 1/3)
Chained PRs recommended: Yes (resolved)
Chain strategy: stacked-to-main
400-line budget risk: High (mitigated via PR split)

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation + Auth security | PR 1 | base: feature/owasp-mitigation |
| 2 | HTTP security + Zod validation | PR 2 | base: PR 1 branch |
| 3 | Observability + Access control | PR 3 | base: PR 2 branch |

## Phase 1: Foundation

- [x] 1.1 Add deps (`bcrypt`, `zod`, `helmet`, `express-rate-limit`, `pino`, `pino-roll`) to `package.json`
- [x] 1.2 Make `JWT_SECRET` mandatory in `config/env.js`; `process.exit(1)` if missing
- [x] 1.3 Update `.env` with strong JWT_SECRET from `openssl rand -base64 32`

## Phase 2: Auth Security

- [x] 2.1 Update `db/schema.sql`: `sp_login` returns hash (no SQL compare), `sp_create_user` accepts hash, seed data with bcrypt hashes
- [x] 2.2 Add `login_attempts` + `audit_log` tables to `db/schema.sql`
- [x] 2.3 Modify `authController.js`: bcrypt.compare + account lockout (5 attempts / 30min rolling window) + audit
- [x] 2.4 Add rate limiter (10 req / 15min per IP) to `authRoutes.js`
- [x] 2.5 Modify `userController.js`: bcrypt.hash on user create

## Phase 3: HTTP Security

- [x] 3.1 Add helmet + CORS origin from `CORS_ORIGIN` env + `express.json({ limit: '1mb' })` in `index.js`

## Phase 4: Zod Validation

- [x] 4.1 Create `src/helpers/validate.js`: `validate(schema)` + `validateId(paramName)` middleware (400 on error)
- [x] 4.2 Create `src/helpers/schemas.js`: Zod schemas for patient, appointment, procedure, user, medical record
- [x] 4.3 Wire `validate()` and `validateId()` into all POST/PUT/PATCH routes

## Phase 5: Observability

- [x] 5.1 Create `src/helpers/logger.js`: Pino instance with daily rotation + `./logs/vetcare.log`
- [x] 5.2 Replace `console.log/error` in `response.js` and `index.js` with `logger.info/error`
- [x] 5.3 Create `src/helpers/audit.js`: `log(pool, userId, action, entityType, entityId, details)`
- [x] 5.4 Wire audit calls into auth, appointment, procedure, user controllers

## Phase 6: Access Control

- [x] 6.1 Add `requireRole(...roles)` variadic middleware to `middlewares/auth.js`
- [x] 6.2 Restrict procedure create/update with `requireRole('administrador', 'veterinario')`

## Phase 7: Polish

- [x] 7.1 Add `"audit": "npm audit --production"` script to `package.json`
- [x] 7.2 Verify server starts, 3 seed users authenticate, CRUD smoke test
