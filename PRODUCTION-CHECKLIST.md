# Production Deployment Checklist — VetCare

> Docker + Nginx + Cloudflare proxy · Basado en el plan de mitigación OWASP.

---

## 1. Environment Variables

Check | Detail
------|-------
`JWT_SECRET` | Generar con `openssl rand -base64 64`. NO usar el secret de desarrollo.
`CORS_ORIGIN` | Poner el dominio real: `https://vetcare.midominio.com`. En producción no debe tener fallback `*`.
`NODE_ENV` | `production`. Nginx + la app lo usan para activar restricciones.
`DB_PASS` | Password fuerte de MariaDB, no el default vacío.
`PORT` | Puerto interno del contenedor (ej: `4000`).

## 2. Docker

```dockerfile
# backend/Dockerfile — hardening mínimo
FROM node:22-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm audit --production
COPY . .
USER app
EXPOSE 4000
CMD ["node", "src/index.js"]
```

Checklist:

- [ ] **Non-root user**: `USER app` después de copiar archivos
- [ ] `npm ci` en vez de `npm install` — reproducible, bloquea cambios de versión
- [ ] `--only=production` — no instalar devDeps en la imagen
- [ ] `npm audit --production` en el build — falla si hay vulns medias+ (agregar `--audit-level=high`)
- [ ] **Read-only root**: `--read-only` en `docker run`, con volumen writeable solo para `./logs` si aplica
- [ ] No exponer puertos MariaDB al host — solo comunicación interna en la red de Docker

## 3. Nginx

```nginx
# /etc/nginx/sites-available/vetcare
upstream vetcare_api {
    server backend:4000;
}

server {
    listen 80;
    server_name vetcare.midominio.com;

    # ─── Redirigir a HTTPS ─────────────────────────
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vetcare.midominio.com;

    # ─── TLS (Cloudflare Origin CA o Let's Encrypt) ─
    ssl_certificate     /etc/ssl/certs/origin.pem;
    ssl_certificate_key /etc/ssl/private/origin.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # ─── Headers de seguridad (refuerzo a Helmet) ──
    add_header X-Content-Type-Options    "nosniff" always;
    add_header X-Frame-Options           "DENY" always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;

    # ─── Rate limiting por IP (capa Nginx) ────────
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req zone=api burst=50 nodelay;

    location / {
        proxy_pass http://vetcare_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Body size (coincide con express.json limit '1mb')
        client_max_body_size 1m;
    }

    location /api/auth/login {
        # Rate limiting más restrictivo para login
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://vetcare_api;
    }
}
```

Checklist:

- [ ] **HTTPS redirect** activo (80 → 443)
- [ ] **TLS 1.2 + 1.3 solamente**, sin SSLv3/TLSv1.0/1.1
- [ ] `client_max_body_size 1m` — coincide con express.json limit
- [ ] `limit_req` zona configurada — respaldo en caso de que el rate limiter de Node falle
- [ ] Headers de seguridad como respaldo (Helmet actúa dentro del contenedor, Nginx afuera)

## 4. Cloudflare

Checklist:

- [ ] **SSL/TLS — Full (Strict)**: Cloudflare usa el certificado ORIGIN real. No usar Flexible.
- [ ] **Origin Certificate**: generarlo desde Cloudflare dashboard → SSL/TLS → Origin Server. Instalar en Nginx.
- [ ] **WAF**: reglas de rate limiting a nivel Cloudflare (complementario al de Nginx + app).
- [ ] **DDoS**: dejar activado "Under Attack Mode" solo si es necesario.
- [ ] **Caching**: NO cachear `/api/auth/*`. Regla de Page Rule: `vetcare.midominio.com/api/auth/*` → Cache Level: Bypass.
- [ ] **Proxy (naranja)**: DNS en proxied (naranja) para todas las rutas API. Si no, Cloudflare no protege nada.
- [ ] **HSTS**: activar en Cloudflare (SSL/TLS → Edge Certificates) con `max-age=31536000`.

## 5. Base de Datos (MariaDB)

- [ ] **ELIMINAR `--skip-grant-tables`** del script de inicio. Usar autenticación normal de MariaDB.
- [ ] Crear usuario dedicado para la app: `CREATE USER 'vetcare'@'backend' IDENTIFIED BY '...';`
- [ ] `GRANT SELECT, INSERT, UPDATE, DELETE ON Veterinaria_pet_land.* TO 'vetcare'@'backend';`
- [ ] No exponer puerto 3306 al host. Solo comunicación interna en la red Docker.
- [ ] Backups automáticos + verificación periódica.

## 6. Logs & Monitoreo

Check | Detail
------|-------
Pino en Docker | En producción, logs a **stdout** (no a archivo). Docker recoge stdout. Ajustar `logger.js` si es necesario.
Log rotation | Docker maneja rotación por defecto con `--log-opt max-size=10m --log-opt max-file=3`
Auditoría | La tabla `audit_log` ya registra acciones críticas. Revisar periodicamente.
Monitoreo | Agregar healthcheck endpoint `GET /api/health` → 200 si DB responde.

## 7. Pre-deploy final

```bash
# 1. Verificar que no hay secrets hardcodeados
grep -rn 'vetcare-mvp-secret-2026\|secret\|password' backend/src/ --include='*.js'

# 2. npm audit
cd backend && npm audit --production

# 3. TypeScript check
cd .. && npx tsc --noEmit

# 4. Build Docker sin errores
docker build -t vetcare-api:latest -f backend/Dockerfile .

# 5. Verificar que JWT_SECRET no está en el código
grep -r 'vetcare-mvp-secret' . --include='*.js' --include='*.ts' --include='*.env' && echo "FALLA: secret hardcodeado!" || echo "OK"
```

---

## Checklist rápido de despliegue

- [ ] `JWT_SECRET` generado y en Docker secrets / env secreto
- [ ] `CORS_ORIGIN` apunta al dominio real
- [ ] `NODE_ENV=production`
- [ ] `--skip-grant-tables` eliminado
- [ ] Usuario MariaDB dedicado con password fuerte
- [ ] Docker: non-root user + `npm ci --only=production` + read-only
- [ ] Nginx: HTTPS, rate limiting, headers de seguridad, body size limit
- [ ] Cloudflare: Full (Strict), Origin Certificate, WAF, HSTS
- [ ] Logs a stdout no a archivo
- [ ] `npm audit` pasa sin vulns high+
- [ ] Sin secrets hardcodeados en el repo
