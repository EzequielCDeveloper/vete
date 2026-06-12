// ─── Pino Logger ───────────────────────────────────────────────
// REQ-08: Structured logging with daily rotation to ./logs/vetcare.log
// ───────────────────────────────────────────────────────────────

const pino = require('pino');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists at module load time
const logsDir = path.join(__dirname, '..', '..', 'logs');
fs.mkdirSync(logsDir, { recursive: true });

// pino-roll transport for daily rotation
const transport = pino.transport({
  target: 'pino-roll',
  options: {
    file: path.join(logsDir, 'vetcare.log'),
    frequency: 'daily',
    mkdir: true,
  },
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  transport,
);

module.exports = logger;
