# Proposal: OWASP Top 10 2021 — Mitigación

## Intent

Remediate 11 security findings across 7 OWASP 2021 categories in the VetCare API. The backend stores plain-text passwords, hardcodes a JWT secret, has no rate limiting, no security headers, no input validation, no audit logging, and no account lockout — making the system trivially exploitable.

## Scope

### In Scope
- 11 requirements (REQ-01 through REQ-11) per prioritized spec order
- Backend-layer mitigations only: auth, middlewares, helpers, controllers, routes, config, DB schema
- All changes are backend-only; no frontend modifications

### Out of Scope
- Refresh tokens + httpOnly cookies (needs frontend rework)
- Fine-tuned CSP header
- Automated security tests
- Backend TypeScript migration
- MariaDB auth hardening (`--skip-grant-tables`)

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `owasp-mitigation`: 11 requirements from `openspec/specs/owasp-mitigation.md`. Covers bcrypt hashing, rate limiting, JWT_SECRET enforcement, Helmet + restricted CORS, Zod input validation, 1MB JSON body limit, account lockout, Pino structured logging, audit trail, role granularity, and npm audit script.

## Approach

Implement in priority order per spec §4: independent layers stacked sequentially — (1) bcrypt + JWT_SECRET, (2) rate limiting + account lockout, (3) Helmet + CORS + JSON body limit, (4) Zod validation across all controllers, (5) Pino logger + audit logging, (6) role granularity + npm audit. Each layer is independently revertible.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/config/env.js` | Modified | JWT_SECRET required at startup |
| `backend/src/index.js` | Modified | Helmet, CORS origin, JSON limit |
| `backend/src/middlewares/auth.js` | Modified | `requireRole()` granular middleware |
| `backend/src/controllers/authController.js` | Modified | bcrypt compare + account lockout |
| `backend/src/controllers/*.js` | Modified | Zod validation wrappers |
| `backend/src/routes/authRoutes.js` | Modified | Rate limiter |
| `backend/src/routes/*.js` | Modified | Zod validate middleware |
| `backend/src/helpers/validate.js` | New | Zod validation middleware |
| `backend/src/helpers/logger.js` | New | Pino logger |
| `backend/src/helpers/audit.js` | New | Action audit helper |
| `backend/package.json` | Modified | bcrypt, helmet, zod, pino deps |
| `backend/db/schema.sql` | Modified | bcrypt SPs, login_attempts, audit_log |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| bcrypt migration breaks seed user logins | Low | Pre-compute hashes, test all 3 accounts |
| Rate limiter blocks legitimate users | Low | 10 req/15min with clear 429 response |
| Zod schemas reject valid production data | Medium | Validate schemas against known data shapes before deploy |

## Rollback Plan

Revert `package.json` deps, restore `env.js` JWT fallback, revert `index.js` middlewares, restore `schema.sql` SPs, remove new files. All changes are additive or reversible — no data migration needed.

## Dependencies

- bcrypt, helmet, zod, express-rate-limit, pino (all npm)

## Success Criteria

- [ ] All 11 REQs implemented per acceptance criteria
- [ ] Server starts without errors (`node src/index.js`)
- [ ] 3 seed users authenticate correctly
- [ ] All CRUD operations continue working
- [ ] No plain-text passwords in logs or responses
