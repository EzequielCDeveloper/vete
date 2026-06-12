// ─── User Controller (admin only) ─────────────────────────────
// REQ-01: bcrypt.hashSync al crear usuario
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { json, error, serverError } = require('../helpers/response');
const audit = require('../helpers/audit');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_users()');
    json(res, rows[0].map(r => ({ ...r, id: String(r.id) })));
  } catch (err) { serverError(res, err); }
};

exports.create = async (req, res) => {
  try {
    const { username, password, nombre, rol } = req.body;
    if (!username || !password || !nombre || !rol) {
      return error(res, 'Usuario, contraseña, nombre y rol son obligatorios');
    }

    const rolMap = { administrador: 1, secretario: 2, veterinario: 3 };
    const idRol = rolMap[rol];
    if (!idRol) return error(res, 'Rol inválido');

    const nameParts = nombre.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Hash de la contraseña antes de almacenar (REQ-01)
    const hashedPassword = bcrypt.hashSync(password, 10);

    const [rows] = await pool.execute('CALL sp_create_user(?,?,?,?,?)', [
      username, hashedPassword, firstName, lastName, idRol,
    ]);
    const result = rows[0]?.[0];

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'create', 'user', result?.id, { username, rol });

    json(res, { id: String(result?.id || '0'), username, nombre, password: '', rol }, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'El nombre de usuario ya existe');
    serverError(res, err);
  }
};

exports.delete = async (req, res) => {
  try {
    await pool.execute('CALL sp_delete_user(?)', [Number(req.params.id)]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'delete', 'user', Number(req.params.id));

    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};

/**
 * POST /api/auth/password — Change own password.
 * Requires currentPassword to verify identity, then hashes and updates.
 */
exports.changeOwnPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch current hash from DB
    const [rows] = await pool.execute('SELECT password AS hash FROM Users WHERE id_user = ?', [userId]);
    if (rows.length === 0) return error(res, 'Usuario no encontrado', 404);

    // Verify current password
    const match = await bcrypt.compare(currentPassword, rows[0].hash);
    if (!match) return error(res, 'La contraseña actual es incorrecta', 401);

    // Hash and update
    const newHash = bcrypt.hashSync(newPassword, 10);
    await pool.execute('CALL sp_update_password(?, ?)', [userId, newHash]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, userId, 'password.change', 'user', userId);

    json(res, { success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) { serverError(res, err); }
};

/**
 * POST /api/users/:id/password — Admin changes any user's password.
 * Admin only. No current password required.
 */
exports.changeUserPassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;

    const newHash = bcrypt.hashSync(newPassword, 10);
    await pool.execute('CALL sp_update_password(?, ?)', [userId, newHash]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'password.reset', 'user', userId, { resetBy: req.user.id });

    json(res, { success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) { serverError(res, err); }
};
