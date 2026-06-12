# OWASP Top 10 2021 — Plan de Mitigación

- **Proyecto:** ProyectVet / VetCare
- **Versión spec:** 2.0.0
- **Estado:** Implementación completada y verificada — 2026-06-11
- **Prioridad global:** 🔴 Crítica
- **Auditoría inicial:** 2026-06-11
- **Stack:** Node.js + Express 5 + MariaDB + JWT (backend) · React 19 + Vite 8 + TypeScript 6 (frontend)
- **Idioma de implementación:** español para comentarios públicos, inglés para código y artefactos técnicos

---

## 1. Contexto

El proyecto VetCare es un sistema de gestión veterinaria con autenticación JWT,
roles (administrador, secretario, veterinario) y operaciones CRUD sobre pacientes,
citas, procedimientos, historial médico y usuarios. Se realizó una auditoría de
seguridad basada en OWASP Top 10 2021 y se identificaron los hallazgos detallados
en las secciones siguientes.

---

## 2. Hallazgos por categoría OWASP

### 🔴 A02:2021 – Cryptographic Failures (CRÍTICO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A02-01 | Contraseñas almacenadas en texto plano | `db/schema.sql` | `sp_login` compara `u.password = p_password` |
| A02-02 | JWT_SECRET hardcodeado con fallback débil | `backend/src/config/env.js` | L8: `'vetcare-mvp-secret-2026'` |
| A02-03 | Seed data con contraseñas en texto plano | `db/schema.sql` | L476-478 |

### 🔴 A07:2021 – Identification & Authentication Failures (CRÍTICO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A07-01 | Sin rate limiting en `/api/auth/login` | `backend/src/controllers/authController.js` | L7-46 |
| A07-02 | Sin bloqueo de cuenta por intentos fallidos | — | — |
| A07-03 | JWT almacenado en localStorage | `src/data/services/apiService.ts` | L19-20 |
| A07-04 | Sin refresh token | — | — |

### 🔴 A05:2021 – Security Misconfiguration (ALTO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A05-01 | CORS `origin: '*'` | `backend/src/index.js` | L14 |
| A05-02 | Sin helmet (no hay headers de seguridad) | `backend/src/index.js` | — |
| A05-03 | express.json sin límite de tamaño | `backend/src/index.js` | L15 |
| A05-04 | MariaDB con `--skip-grant-tables` | `db/start-db.sh` | L18 |

### 🟡 A01:2021 – Broken Access Control (MEDIO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A01-01 | Sin granularidad de roles (solo admin/no-admin) | `backend/src/middlewares/auth.js` | L27-31 |
| A01-02 | No se valida que el usuario del JWT siga activo | — | — |
| A01-03 | `Number(req.params.id)` puede producir NaN | Todos los controllers | — |

### 🟡 A03:2021 – Injection (MEDIO-BAJO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A03-01 | Sin validación de entrada en ningún controller | Todos | — |
| A03-02 | Parámetros de ruta sin validar | Todos | — |

### 🟡 A09:2021 – Logging & Monitoring Failures (MEDIO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A09-01 | Solo console.error para errores | `backend/src/helpers/response.js` | L12 |
| A09-02 | Sin registro de intentos de login fallidos | — | — |
| A09-03 | Sin auditoría de acciones (quién creó/modificó/eliminó) | — | — |

### 🟢 A06:2021 – Vulnerable Components (BAJO)

| ID | Hallazgo | Archivo | Línea |
|----|----------|---------|-------|
| A06-01 | No se ejecuta `npm audit` en CI | — | — |

---

## 3. Requirements

### REQ-01: Hashing de contraseñas con bcrypt

**Descripción:** Migrar el almacenamiento y verificación de contraseñas de texto
plano a bcrypt con factor de costo 10+.

**Criterios de aceptación:**
- El SP `sp_login` se modifica para devolver el hash en vez de compararlo en SQL
- El authController usa `bcrypt.compare()` para validar la contraseña
- El SP `sp_create_user` recibe el hash ya generado desde el controller
- El seed data se migra con hashes generados por `bcrypt.hashSync()`
- La dependencia `bcrypt` se agrega a `package.json`
- Los 3 seed users existentes (admin, secre1, vet1) mantienen sus credenciales funcionales
- Un intento de login con contraseña incorrecta falla con 401 sin revelar si el usuario existe

### REQ-02: Rate limiting en login

**Descripción:** Proteger `/api/auth/login` contra fuerza bruta.

**Criterios de aceptación:**
- Se instala `express-rate-limit`
- El rate limiter permite máximo 10 intentos por ventana de 15 minutos por IP
- Superado el límite, responde con 429 y mensaje en español
- Usa `standardHeaders: true` para compatibilidad con headers estándar
- No afecta a otras rutas

### REQ-03: JWT_SECRET obligatorio

**Descripción:** Eliminar el default hardcodeado y fallar en startup si no está definido.

**Criterios de aceptación:**
- `config/env.js` falla con `process.exit(1)` si `JWT_SECRET` no está en el entorno
- El `.env` de desarrollo tiene un secret generado con `openssl rand -base64 32`
- `.gitignore` ya excluye `.env`

### REQ-04: Helmet + CORS restringido

**Descripción:** Agregar headers de seguridad HTTP y restringir CORS por entorno.

**Criterios de aceptación:**
- Se instala y configura `helmet` en `src/index.js`
- `cors.origin` se lee de `process.env.CORS_ORIGIN` con fallback `'*'` solo en desarrollo
- Los headers `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `CSP` se envían en todas las respuestas

### REQ-05: Validación de entrada con Zod

**Descripción:** Validar todos los inputs (body, params, query) con esquemas Zod.

**Criterios de aceptación:**
- Se instala `zod`
- Se crea `src/helpers/validate.js` con middleware `validate(schema)` y `validateId(paramName)`
- `validateId` rechaza IDs no numéricos o menores a 1 con 400
- Cada ruta POST/PUT tiene un esquema Zod que valida tipo, formato, y longitud de cada campo
- Fechas se validan con regex `^\d{4}-\d{2}-\d{2}$`
- Horas se validan con regex `^\d{2}:\d{2}$`
- Precios se validan como números positivos

### REQ-06: Límite de tamaño en JSON body

**Descripción:** Prevenir DoS por payloads grandes.

**Criterios de aceptación:**
- `express.json()` tiene `limit: '1mb'`

### REQ-07: Bloqueo de cuenta por intentos fallidos

**Descripción:** Bloquear temporalmente una cuenta tras 5 intentos fallidos en 30 minutos.

**Criterios de aceptación:**
- Se crea tabla `login_attempts` con username y timestamp
- Antes de validar credenciales, se verifica si la cuenta está bloqueada
- Tras 5 intentos fallidos en 30 minutos, se responde 429
- El bloqueo expira automáticamente a los 30 minutos del primer intento
- Un login exitoso limpia los intentos fallidos

### REQ-08: Logging estructurado con Pino

**Descripción:** Reemplazar console.log/error con logger estructurado.

**Criterios de aceptación:**
- Se instala `pino`
- Se crea `src/helpers/logger.js`
- Todos los console.log/error se reemplazan por `logger.info/error`
- El logger escribe a `./logs/vetcare.log`
- Incluye timestamp, nivel, mensaje y metadata relevante

### REQ-09: Auditoría de acciones críticas

**Descripción:** Registrar quién hizo qué en una tabla de auditoría.

**Criterios de aceptación:**
- Se crea tabla `audit_log` con user_id, action, entity_type, entity_id, details (JSON), created_at
- Se crea helper `src/helpers/audit.js` con función `log(pool, userId, action, entityType, entityId, details)`
- Se auditan: login fallido, login exitoso, creación de paciente, creación/actualización/cancelación/completado de cita, creación/actualización de procedimiento, creación/eliminación de usuario

### REQ-10: Granularidad de roles (opcional)

**Descripción:** Diferenciar permisos entre secretario y veterinario.

**Criterios de aceptación:**
- Se crea middleware `requireRole(...roles)`
- Solo veterinarios y administradores pueden crear/modificar procedimientos
- Solo administradores pueden gestionar usuarios
- Secretarios pueden crear citas y pacientes

### REQ-11: npm audit en CI (opcional)

**Descripción:** Agregar escaneo de vulnerabilidades en dependencias.

**Criterios de aceptación:**
- Se agrega script `"audit": "npm audit --production"` en package.json
- Se documenta el comando en README

---

## 4. Priorización e implementación

El orden de implementación sigue riesgo + dependencias:

| Orden | ID | Requisito | Depende de | Esfuerzo | Impacto |
|-------|----|-----------|------------|----------|---------|
| 1 | REQ-01 | bcrypt + mover validación | Ninguna | 2-3h | 🔴 Elimina el peor agujero |
| 2 | REQ-03 | JWT_SECRET obligatorio | Ninguna | 15min | 🔴 Suplantación trivial |
| 3 | REQ-02 | Rate limiting login | Ninguna | 15min | 🔴 Frena fuerza bruta |
| 4 | REQ-04 | Helmet + CORS | Ninguna | 20min | 🟡 Headers de seguridad |
| 5 | REQ-06 | Límite JSON body | Ninguna | 5min | 🟡 Anti-DoS |
| 6 | REQ-07 | Bloqueo de cuenta | REQ-02 | 2-3h | 🟡 Defensa profunda |
| 7 | REQ-05 | Validación Zod | Ninguna | 4-6h | 🟡 Validación completa |
| 8 | REQ-08 | Pino logger | Ninguna | 1-2h | 🟡 Trazabilidad |
| 9 | REQ-09 | Auditoría | REQ-08 | 4-6h | 🟡 Trazabilidad acciones |
| 10 | REQ-10 | Granularidad roles | REQ-05 | 1-2h | 🟢 Backlog |
| 11 | REQ-11 | npm audit | Ninguna | 30min | 🟢 Backlog |

---

## 5. No alcanza este spec

Quedan fuera del alcance de esta iteración pero documentados para el futuro:

- Refresh tokens + httpOnly cookies (requiere reestructurar frontend)
- CSP header fino (viene con helmet, pero hay que afinarlo)
- Pruebas de seguridad automatizadas
- Migración a TypeScript en el backend
- Autenticación en MariaDB (eliminar `--skip-grant-tables`)

---

## 6. Structure de archivos a modificar/crear

```
backend/
├── src/
│   ├── config/
│   │   └── env.js                      ← REQ-03: Validar JWT_SECRET
│   ├── helpers/
│   │   ├── response.js                 ← (sin cambios)
│   │   ├── validate.js                 ← REQ-05: NUEVO - Middleware Zod
│   │   ├── logger.js                   ← REQ-08: NUEVO - Pino logger
│   │   └── audit.js                    ← REQ-09: NUEVO - Auditoría
│   ├── middlewares/
│   │   ├── auth.js                     ← REQ-10: Agregar requireRole
│   │   └── (sin cambios estructurales)
│   ├── controllers/
│   │   ├── authController.js           ← REQ-01, REQ-07: bcrypt + bloqueo
│   │   ├── patientController.js        ← REQ-05: Zod validation
│   │   ├── procedureController.js      ← REQ-05: Zod validation
│   │   ├── appointmentController.js    ← REQ-05: Zod validation
│   │   ├── medicalRecordController.js  ← REQ-05: Zod validation
│   │   ├── userController.js           ← REQ-01, REQ-05: bcrypt + Zod
│   │   └── dashboardController.js      ← (sin cambios)
│   ├── routes/
│   │   ├── authRoutes.js               ← REQ-02: Rate limiter
│   │   └── (resto: agregar validate middleware)
│   └── index.js                        ← REQ-04, REQ-06: Helmet + JSON limit + CORS
├── package.json                        ← REQ-01, REQ-04: bcrypt, helmet, zod, pino
├── .env                                ← REQ-03: Nuevo JWT_SECRET
└── db/
    └── schema.sql                      ← REQ-01, REQ-07, REQ-09: Nuevos SPs + tablas
```

---

## 7. Escenarios de validación

### Escenario 1: Login con contraseña correcta

```
DADO un usuario existente con contraseña hasheada
CUANDO se hace POST /api/auth/login con username + password correctos
ENTONCES se devuelve 200 con token JWT y datos de usuario
Y se registra un audit_log con action='login.success'
Y se limpian los login_attempts de ese usuario
```

### Escenario 2: Login con contraseña incorrecta

```
DADO un usuario existente
CUANDO se hace POST /api/auth/login con password incorrecto
ENTONCES se devuelve 401 "Credenciales inválidas"
Y se registra un intento en login_attempts
Y se registra un audit_log con action='login.failed'
```

### Escenario 3: Bloqueo por fuerza bruta

```
DADO un usuario existente
CUANDO se hacen 5 intentos fallidos de login en menos de 30 minutos
ENTONCES el sexto intento devuelve 429 "Cuenta bloqueada temporalmente"
Y después de 30 minutos, el intento funciona normalmente
```

### Escenario 4: JWT_SECRET no configurado

```
DADO que JWT_SECRET no está en el entorno
CUANDO se inicia el servidor
ENTONCES el proceso termina con código 1 y mensaje de error
```

### Escenario 5: ID inválido en ruta

```
DADO cualquier ruta con parámetro :id
CUANDO se envía un id no numérico (ej: "abc")
ENTONCES se devuelve 400 "ID inválido"
```

### Escenario 6: CORS restringido

```
DADO que CORS_ORIGIN está configurado como "https://app.example.com"
CUANDO un origen diferente hace una solicitud
ENTONCES la respuesta no incluye Access-Control-Allow-Origin
```

### Escenario 7: Payload excedido

```
DADO el middleware express.json con limit '1mb'
CUANDO se envía un body de más de 1MB
ENTONCES se devuelve 413 Payload Too Large
```

---

## 8. Definition of Done

Una iteración se considera completa cuando:

- [x] Todos los REQ marcados para la iteración están implementados
- [x] Los escenarios de validación correspondientes pasan
- [x] El servidor arranca sin errores (`node src/index.js`)
- [x] El TypeScript check del frontend pasa (`tsc --noEmit`)
- [x] Los 3 seed users pueden loguearse correctamente
- [x] Las funcionalidades existentes no se rompen (CRUD de pacientes, citas, procedimientos, usuarios, historial)
- [x] No se exponen contraseñas en texto plano en logs ni respuestas
