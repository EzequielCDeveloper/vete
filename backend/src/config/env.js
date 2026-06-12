// ─── Environment & Configuration ──────────────────────────────
// Centralized config — reads from process.env with sensible defaults.
// The .env file at backend/.env is loaded automatically by the runtime
// (not via dotenv — we keep it simple for MVP).

if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET no está definido en el entorno.');
  console.error('[FATAL] Genera un secret con: openssl rand -base64 32');
  console.error('[FATAL] Y agrégalo al archivo backend/.env');
  process.exit(1);
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 4000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: '24h',

  DB: {
    socketPath: process.env.DB_SOCKET || '/tmp/mariadb-vet.sock',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'Veterinaria_pet_land',
    waitForConnections: true,
    connectionLimit: 10,
  },
};
