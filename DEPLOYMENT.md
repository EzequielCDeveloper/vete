# ─── VetCare — Guía de Despliegue en VPS ──────────────────────
# Arquitectura: nginx nativo ← backend (Docker) + frontend (Docker) + MariaDB (Docker)
# ───────────────────────────────────────────────────────────────

## Arquitectura

```
[Usuario] → Cloudflare (SSL)
              → nginx nativo (Debian, puertos 80/443)
                  ├── / → proxy_pass 127.0.0.1:3005 → frontend (Docker, nginx-alpine)
                  └── /api → proxy_pass 127.0.0.1:4000 → backend (Docker, Node.js)
                                                           └── mariadb (Docker, hostname: mariadb)
```

## Requisitos

- VPS con Debian (o Ubuntu)
- Docker + Docker Compose v2
- nginx
- Node.js 22 (para build del frontend)
- Git

## 1. Estructura de Archivos

```
/home/usuario/vetcare/
├── docker-compose.yml           # Backend + Frontend
├── docker-compose.mariadb.yml   # MariaDB (separado)
├── Dockerfile.frontend          # Frontend (nginx-alpine)
├── .env                         # Variables sensibles
├── secrets/
│   ├── db_password.txt          # Password app DB
│   └── db_root_password.txt     # Password root DB
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
└── nginx.conf                   # Referencia (copiar a /etc/nginx/sites-available/)
```

## 2. Configuración Inicial

### 2.1 Variables de entorno

Crear `.env` en la raíz del proyecto:

```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "DB_PASSWORD=$(cat secrets/db_password.txt)" >> .env
```

### 2.2 Secrets de base de datos

```bash
mkdir -p secrets
printf 'password_app_segura'   > secrets/db_password.txt
printf 'password_root_segura'  > secrets/db_root_password.txt
chmod 600 secrets/*.txt .env
```

### 2.3 nginx

Copiar `nginx.conf` a `/etc/nginx/sites-available/vetcare.conf` y crear symlink:

```bash
sudo ln -s /etc/nginx/sites-available/vetcare.conf /etc/nginx/sites-enabled/
```

⚠️ **Importante:** En nginx moderno (>1.25), `listen 443 ssl http2` está obsoleto. Usar:

```nginx
listen 443 ssl;
http2 on;
```

⚠️ `limit_req_zone` solo va en bloque `http`, no en `server`. Crear `/etc/nginx/conf.d/rate-limit.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
```

## 3. Errores Comunes y Soluciones

### 3.1 ❌ Backend no arranca: `EACCES: permission denied, mkdir '/app/logs'`

**Causa:** El Dockerfile crea un usuario `app` no-root, pero el directorio de logs no existe al iniciar.

**Solución en Dockerfile:** Crear el directorio ANTES de `USER app`:

```dockerfile
RUN mkdir -p /app/logs && chown app:app /app/logs
USER app
```

### 3.2 ❌ Backend no conecta a MariaDB: `connect ENOENT /tmp/mariadb-vet.sock`

**Causa:** `env.js` del backend solo usaba socket Unix (`DB_SOCKET`), ignoraba `DB_HOST`.

**Solución en `env.js`:** Detectar `DB_HOST` y cambiar a TCP automáticamente:

```js
DB: process.env.DB_HOST
  ? {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: getDbPassword(),  // ← leer de DB_PASS o DB_PASS_FILE
      database: process.env.DB_NAME || 'Veterinaria_pet_land',
    }
  : {
      socketPath: process.env.DB_SOCKET || '/tmp/mariadb-vet.sock',
      // ...config local
    }
```

### 3.3 ❌ Backend no puede leer contraseña: `Access denied for user 'mi_usuario_app'@'...' (using password: NO)`

**Causa:** Docker secrets (`/run/secrets/`) se montan con permisos `0400` para `root`. Si el contenedor corre como usuario no-root (`app`), no puede leerlos.

**Solución:** Usar variables de entorno en vez de Docker secrets:

```yaml
# docker-compose.yml (✅ correcto)
environment:
  DB_PASS: ${DB_PASSWORD}       # variable directa
  # ❌ NO usar:
  # DB_PASS_FILE: /run/secrets/db_password  # secreto Docker, no-readable por app user
```

Y en `.env`:

```
DB_PASSWORD=password_app_segura
```

**Helper `env.js` para leer password:**

```js
function getDbPassword() {
  if (process.env.DB_PASS) return process.env.DB_PASS;
  if (process.env.DB_PASS_FILE) {
    try {
      const fs = require('fs');
      return fs.readFileSync(process.env.DB_PASS_FILE, 'utf8').replace(/\n$/, '');
    } catch { /* fallback */ }
  }
  return '';
}
```

### 3.4 ❌ Error 500 en login: `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`

**Causa:** `express-rate-limit` recibe header `X-Forwarded-For` de nginx, pero Express tiene `trust proxy: false`.

**Solución en `index.js`:** Agregar después de `const app = express()`:

```js
app.set('trust proxy', 1);
```

### 3.5 ❌ nginx: `zero size shared memory zone "api"`

**Causa:** `limit_req zone=api burst=50 nodelay;` referencia una zona `api` que no existe.

**Solución:** El zone debe definirse en bloque `http` (no en `server`):

```nginx
# /etc/nginx/conf.d/rate-limit.conf (dentro del bloque http)
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
```

```nginx
# /etc/nginx/sites-enabled/vetcare.conf (dentro del server)
limit_req zone=api burst=50 nodelay;
```

### 3.6 ❌ nginx: `"listen ... http2" directive is deprecated`

**Causa:** nginx 1.25+ separó `http2` de `listen`.

**Solución:**

```nginx
# ❌ Obsoleto
listen 443 ssl http2;

# ✅ Correcto
listen 443 ssl;
http2 on;
```

### 3.7 ❌ TypeScript build falla en Docker: `error TS2322`, `TS6133`, etc.

**Causa:** `tsc -b` corre en modo estricto. Errores como tipos incorrectos o imports no usados cortan el build.

**Solución:** Corregir los errores de tipo y variables/imports no usados. Los más comunes:

```ts
// Error: Type 'string' is not assignable to type 'UserRole'
rol: res.user.rol as UserRole;  // ← castear al tipo

// Error: 'User' is declared but never used
import type { Appointment, Patient, Procedure } from './api';  // ← sacar User si no se usa
```

### 3.8 ❌ Frontend build cachea versión vieja

**Solución:** Siempre usar `--build` en `up`:

```bash
docker compose up -d --build
```

## 4. Comandos Rápidos

```bash
# Levantar base
docker compose -f docker-compose.mariadb.yml up -d

# Build+deploy completo
docker compose down
docker compose up -d --build

# Logs
docker logs vetcare-backend 2>&1 | tail -30
docker logs vetcare-frontend 2>&1 | tail -10

# Shell dentro del contenedor
docker exec -it vetcare-backend sh

# Probar API directo
curl -s http://127.0.0.1:4000/api/health

# Login test
curl -s -X POST http://127.0.0.1:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 5. Debugging Flow

Cuando algo no funciona, seguir este orden:

```
1. docker ps                       → ¿Los contenedores están UP?
2. docker logs vetcare-backend     → ¿Error en backend?
3. curl http://127.0.0.1:4000/api/health  → ¿Backend responde directo?
4. nginx -t                        → ¿Config de nginx válida?
5. docker exec vetcare-backend env | grep DB  → ¿Variables correctas?
6. cat .env                        → ¿JWT_SECRET y DB_PASSWORD presentes?
```

## 6. Resumen de Bugs Encontrados (este proyecto)

| # | Síntoma | Causa | Fix |
|---|---------|-------|-----|
| 1 | Backend no arranca (`EACCES`) | `/app/logs` no existe para user `app` | `mkdir -p /app/logs && chown` en Dockerfile |
| 2 | Backend no conecta DB (`ENOENT socket`) | Solo socket Unix configurado, ignoraba `DB_HOST` | Detectar `DB_HOST` → TCP en `env.js` |
| 3 | Login 500 (`password: NO`) | Docker secrets no-legibles por user no-root | Usar variable de entorno `DB_PASS` |
| 4 | Login 500 (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`) | `trust proxy` falso en Express | `app.set('trust proxy', 1)` |
| 5 | nginx error (`zero size shared memory zone`) | `limit_req` sin `limit_req_zone` definido | Mover zone a bloque `http` |
| 6 | nginx error (`http2 deprecated`) | Sintaxis obsoleta de nginx | Separar `listen` y `http2 on;` |
| 7 | Build TS falla en Docker | Errores de tipos TS en modo estricto | Castear tipos, eliminar imports no usados |
| 8 | Frontend puerto incorrecto | `3005:3005` en vez de `3005:80` | Mapear host:contenedor correctamente |
