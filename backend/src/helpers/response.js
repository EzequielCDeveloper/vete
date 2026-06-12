// ─── Response Helpers ─────────────────────────────────────────
// Consistent JSON responses across all controllers.
const logger = require('./logger');

function json(res, data, status = 200) {
  res.status(status).json(data);
}

function error(res, msg, status = 400) {
  res.status(status).json({ error: msg });
}

function serverError(res, err) {
  logger.error({ err }, '[500] Internal server error');
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { json, error, serverError };
