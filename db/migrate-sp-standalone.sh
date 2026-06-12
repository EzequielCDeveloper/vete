#!/bin/bash
# ─── Migración SPs: copiaModificados-integracion ─────────────────
# Ejecutar en el VPS.
# ────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT="db/migrate-sp-standalone.sql"
CONTAINER="mariadb_prod"
DB_NAME="Veterinaria_pet_land"

echo "🚀 Migrando SPs de Medical Records..."

# Preguntar password
echo -n "🔑 Password de root: "
read -rs DB_PASS
echo

# Copiar script al contenedor
docker cp "$SCRIPT" "$CONTAINER:/tmp/migrate-sp-standalone.sql"

# Ejecutar dentro del contenedor via mysql source
docker exec -i "$CONTAINER" mysql -u root -p"$DB_PASS" "$DB_NAME" -e "source /tmp/migrate-sp-standalone.sql"

echo "✅ SPs migrados correctamente."
echo ""
echo "Ahora redeployá el backend:"
echo "  docker compose build backend && docker compose up -d backend --force-recreate"
