// ─── Environment & Configuration ──────────────────────────────
// Centralized config — reads from process.env with sensible defaults.
// Compatible con Docker secrets (DB_PASS_FILE) y variables directas.
// ───────────────────────────────────────────────────────────────

if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET no está definido en el entorno.');
  console.error('[FATAL] Genera un secret con: openssl rand -base64 32');
  console.error('[FATAL] Y agrégalo al archivo backend/.env');
  process.exit(1);
}

// ─── Helper: leer password desde archivo o variable ────────────
function getDbPassword() {
  if (process.env.DB_PASS) return process.env.DB_PASS;
  if (process.env.DB_PASS_FILE) {
    try {
      const fs = require('fs');
      return fs.readFileSync(process.env.DB_PASS_FILE, 'utf8').replace(/\n$/, '');
    } catch {
      // fallback — no tirar error para no romper el startup
    }
  }
  return '';
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 4000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: '24h',

  DB: process.env.DB_HOST
    ? {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: getDbPassword(),
        database: process.env.DB_NAME || 'Veterinaria_pet_land',
        waitForConnections: true,
        connectionLimit: 10,
      }
    : {
        socketPath: process.env.DB_SOCKET || '/tmp/mariadb-vet.sock',
        user: process.env.DB_USER || 'root',
        password: getDbPassword(),
        database: process.env.DB_NAME || 'Veterinaria_pet_land',
        waitForConnections: true,
        connectionLimit: 10,
      },
};
