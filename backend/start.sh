#!/bin/bash
# ============================================================
# VetCare — Start API Server
# ============================================================
# Requiere: MariaDB corriendo en /tmp/mariadb-vet.sock
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[VetCare] Starting API server..."
cd "$SCRIPT_DIR" && node src/index.js
