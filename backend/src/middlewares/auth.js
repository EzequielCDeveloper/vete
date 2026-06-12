// ─── JWT Middleware ───────────────────────────────────────────
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { error } = require('../helpers/response');

/**
 * Verifies the Bearer token and attaches decoded payload to req.user.
 * Rejects with 401 if missing / invalid / expired.
 */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'Token requerido', 401);
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = decoded; // { id, username, name, last_name, rol }
    next();
  } catch (_) {
    return error(res, 'Token inválido o expirado', 401);
  }
}

/**
 * Restricts a route to administrators only. Must be used AFTER `auth`.
 */
function isAdmin(req, res, next) {
  if (req.user?.rol !== 'administrador') {
    return error(res, 'Solo administradores pueden acceder a este recurso', 403);
  }
  next();
}

/**
 * Restricts a route to one or more roles. Must be used AFTER `auth`.
 * Checks req.user.rol against the allowed list.
 *
 * @param  {...string} roles - Allowed roles, e.g. 'administrador', 'veterinario'
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return error(res, 'No tiene permisos para realizar esta acción', 403);
    }
    next();
  };
}

module.exports = { auth, isAdmin, requireRole };
