// ─── Dashboard Controller ─────────────────────────────────────
const pool = require('../config/db');
const { json, serverError } = require('../helpers/response');

exports.stats = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute('CALL sp_get_dashboard_stats(?)', [date]);
    json(res, rows[0]?.[0] || { totalHoy: 0, activas: 0, completadas: 0, canceladas: 0, pacientesUnicos: 0 });
  } catch (err) { serverError(res, err); }
};
