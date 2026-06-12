# ─── VetCare Backend — Dockerfile (multi-stage) ──────────────
# Usa node:22-alpine para imagen final pequeña.
# ──────────────────────────────────────────────────────────────

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo dependencias (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# ---- Production stage ----
FROM node:22-alpine
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copiar solo producción desde build stage
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

USER app
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "src/index.js"]
