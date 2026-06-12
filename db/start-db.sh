#!/bin/bash
# ============================================================
# VetCare — Start MariaDB + Create Schema + Seed Data
# ============================================================

DB_DIR="/tmp/mariadb-data"
SOCKET="/tmp/mariadb-vet.sock"

echo "[VetCare DB] Checking MariaDB..."

# Start MariaDB if not running
if [ ! -S "$SOCKET" ]; then
	echo "[VetCare DB] Starting MariaDB..."
	if [ ! -d "$DB_DIR" ]; then
		echo "[VetCare DB] Initializing data directory..."
		/home/linuxbrew/.linuxbrew/bin/mariadb-install-db --user=$(whoami) --datadir="$DB_DIR"
	fi
	nohup /home/linuxbrew/.linuxbrew/bin/mariadbd --datadir="$DB_DIR" --socket="$SOCKET" --skip-networking --skip-grant-tables &>/tmp/mariadb-start.log &
	sleep 3
	echo "[VetCare DB] MariaDB started."
else
	echo "[VetCare DB] MariaDB already running."
fi

# Create schema and seed data
echo "[VetCare DB] Loading schema + seed data..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
/home/linuxbrew/.linuxbrew/bin/mariadb -u root --socket="$SOCKET" < "$SCRIPT_DIR/schema.sql"

echo "[VetCare DB] Done."
