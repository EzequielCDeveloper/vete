// ─── Auth Controller ──────────────────────────────────────────
// REQ-01: bcrypt.compare para validar contraseña
// REQ-07: Bloqueo de cuenta (5 intentos / 30min rolling window)
// REQ-09: Auditoría de intentos de login
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES } = require('../config/env');
const { json, error, serverError } = require('../helpers/response');
const audit = require('../helpers/audit');

/**
 * Verifica si la cuenta está bloqueada por intentos fallidos.
 * Ventana rolling de 30 minutos desde el PRIMER intento.
 * @returns {Promise<{locked: boolean, attempts: number}>}
 */
async function checkLockout(username) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt
     FROM login_attempts
     WHERE username = ?
       AND attempted_at > NOW() - INTERVAL 30 MINUTE`,
    [username],
  );
  const count = rows[0]?.cnt || 0;
  return { locked: count >= 5, attempts: count };
}

/**
 * Registra un intento fallido de login.
 */
async function recordFailedAttempt(username) {
  await pool.execute(
    'INSERT INTO login_attempts (username) VALUES (?)',
    [username],
  );
}

/**
 * Limpia los intentos fallidos tras un login exitoso.
 */
async function clearFailedAttempts(username) {
  await pool.execute(
    'DELETE FROM login_attempts WHERE username = ?',
    [username],
  );
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return error(res, 'Usuario y contraseña requeridos');
    }

    // ─── 1. Verificar bloqueo de cuenta ─────────────────────
    const { locked, attempts } = await checkLockout(username);
    if (locked) {
      await audit.log(pool, null, 'login.blocked', 'user', null, { username, attempts });
      return error(res, 'Cuenta bloqueada temporalmente. Intente de nuevo en 30 minutos.', 429);
    }

    // ─── 2. Obtener usuario y hash desde la BD ───────────────
    // sp_login ya NO compara passwords en SQL — devuelve el hash
    const [rows] = await pool.execute('CALL sp_login(?)', [username]);
    const users = rows[0];

    if (!users || users.length === 0) {
      // Usuario no existe — registrar intento para no revelar existencia
      await recordFailedAttempt(username);
      await audit.log(pool, null, 'login.failed', 'user', null, { username, reason: 'user_not_found' });
      return error(res, 'Credenciales inválidas', 401);
    }

    const user = users[0];

    // ─── 3. Comparar contraseña con bcrypt ──────────────────
    const passwordMatch = await bcrypt.compare(password, user.hash);

    if (!passwordMatch) {
      await recordFailedAttempt(username);
      await audit.log(pool, null, 'login.failed', 'user', null, { username, reason: 'wrong_password' });
      return error(res, 'Credenciales inválidas', 401);
    }

    // ─── 4. Login exitoso — limpiar intentos y generar token ──
    await clearFailedAttempts(username);
    await audit.log(pool, user.id, 'login.success', 'user', user.id, { username });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        last_name: user.last_name,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    json(res, {
      token,
      user: {
        id: String(user.id),
        username: user.username,
        nombre: `${user.name} ${user.last_name}`.trim(),
        rol: user.rol,
      },
    });
  } catch (err) {
    serverError(res, err);
  }
};
