#!/bin/bash
# ─── VetCare — Deploy Script ──────────────────────────────────
# Ejecutar en el VPS después de hacer git pull.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

echo "🚀 VetCare Deploy"
echo "─────────────────"

# 1. Backend — build + redeploy en Docker
echo "📦 Construyendo backend..."
docker compose build backend
echo "🔄 Recreando backend..."
docker compose up -d backend --force-recreate

# 2. Frontend — build directo en el VPS (sin Docker)
echo "📦 Construyendo frontend..."
npm ci
npm run build

echo "📂 Copiando archivos a /var/www/vetcare..."
sudo mkdir -p /var/www/vetcare
sudo cp -r dist/* /var/www/vetcare/
sudo chown -R www-data:www-data /var/www/vetcare

# 3. Nginx — validar y recargar
echo "🔄 Recargando nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deploy completado"
