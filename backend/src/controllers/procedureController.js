// ─── Procedure Controller ─────────────────────────────────────
const pool = require('../config/db');
const { json, error, serverError } = require('../helpers/response');
const audit = require('../helpers/audit');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_procedures()');
    json(res, rows[0].map(r => ({ ...r, id: String(r.id), precio: Number(r.precio) })));
  } catch (err) { serverError(res, err); }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL sp_get_procedure_by_id(?)', [Number(req.params.id)]);
    const procs = rows[0];
    if (!procs || procs.length === 0) return error(res, 'Procedimiento no encontrado', 404);
    json(res, { ...procs[0], id: String(procs[0].id), precio: Number(procs[0].precio) });
  } catch (err) { serverError(res, err); }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio } = req.body;
    if (!nombre || !descripcion || precio === undefined) {
      return error(res, 'Nombre, descripción y precio son obligatorios');
    }
    const [rows] = await pool.execute('CALL sp_create_procedure(?,?,?,?)', [
      req.user.id, nombre, descripcion, Number(precio),
    ]);
    const result = rows[0]?.[0];

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'create', 'procedure', result?.id, { nombre, precio });

    json(res, { id: String(result?.id || '0'), nombre, descripcion, precio: Number(precio), createdBy: req.user.username }, 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'Ya existe un procedimiento con ese nombre');
    serverError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, descripcion, precio } = req.body;
    if (!nombre || !descripcion || precio === undefined) {
      return error(res, 'Nombre, descripción y precio son obligatorios');
    }
    await pool.execute('CALL sp_update_procedure(?,?,?,?)', [
      Number(req.params.id), nombre, descripcion, Number(precio),
    ]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'update', 'procedure', Number(req.params.id), { nombre, precio });

    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};
