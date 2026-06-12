# Mitigación de Seguridad — VetCare

Configuraciones generadas a partir del reporte ZAP (2026-06-12).

## Resumen de Hallazgos Corregidos

| Alerta ZAP | Riesgo | Solución |
|---|---|---|
| CSP no configurada | Medio | `security-headers.conf` — política CSP |
| HSTS no establecido | Bajo | `security-headers.conf` — Strict-Transport-Security |
| Falta X-Content-Type-Options | Bajo | Ya existía, se consolida en `security-headers.conf` |
| Banner nginx/1.31.1 expuesto | Bajo | `server-hardening.conf` — `server_tokens off` |

## Archivos

| Archivo | Dónde va | Propósito |
|---|---|---|
| `security-headers.conf` | `/etc/nginx/snippets/security-headers.conf` | Headers de seguridad (HSTS, CSP, etc.) |
| `server-hardening.conf` | `/etc/nginx/snippets/server-hardening.conf` | Oculta versión de nginx, timeouts, buffers |
| `rate-limit.conf` | `/etc/nginx/snippets/rate-limit.conf` | Zona de rate limiting compartida |

## Instrucciones de Instalación

Conectate por SSH al servidor y ejecutá:

```bash
# 1. Subir los archivos al servidor
scp auditoria_seguridad/conf/*.conf usuario@vps:/etc/nginx/snippets/

# 2. Editar el site config (/etc/nginx/sites-available/veterinaria.conf)
#    Agregar DENTRO del bloque server (después de la apertura):
include /etc/nginx/snippets/security-headers.conf;

# 3. Editar /etc/nginx/nginx.conf
#    Agregar DENTRO del bloque http (después de la apertura):
include /etc/nginx/snippets/server-hardening.conf;
include /etc/nginx/snippets/rate-limit.conf;

# 4. Verificar sintaxis
nginx -t

# 5. Recargar (sin downtime)
systemctl reload nginx   # o nginx -s reload
```

## Notas

- El CSP asume que el frontend SPA se sirve desde `veterinaria.ezequielcastellanosleyva.net` y usa Cloudflare Insights (`static.cloudflareinsights.com`).
- La alerta de CORS (`access-control-allow-origin: *`) es de un endpoint de Cloudflare Challenge Platform, no controlable desde nginx.
- Las cookies con SameSite=None y Loosely Scoped (`cf_clearance`) son de Cloudflare, no de tu app.
- Después de aplicar, ejecutá otro scan ZAP para confirmar que las alertas bajas y medias desaparecieron.
