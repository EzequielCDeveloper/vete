// ─── Audit Logger ──────────────────────────────────────────────
// REQ-09: Register who did what in the audit_log table.
// ───────────────────────────────────────────────────────────────

/**
 * Inserts a row into audit_log.
 *
 * @param {import('mysql2/promise').Pool} pool - MariaDB connection pool
 * @param {number|null} userId - User who performed the action (req.user.id)
 * @param {string} action - Action key (e.g. 'login.success', 'create', 'update')
 * @param {string|null} entityType - Affected entity type (e.g. 'user', 'appointment')
 * @param {number|null} entityId - Affected entity ID
 * @param {object} [details={}] - Optional metadata (will be JSON stringified)
 */
async function log(pool, userId, action, entityType, entityId, details = {}) {
  await pool.execute(
    `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, action, entityType || null, entityId || null, JSON.stringify(details)],
  );
}

module.exports = { log };
