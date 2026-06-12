// ─── Patient Controller ───────────────────────────────────────
const pool = require('../config/db');
const { json, error, serverError } = require('../helpers/response');
const audit = require('../helpers/audit');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_patients()');
    json(res, rows[0].map(r => ({ ...r, id: String(r.id) })));
  } catch (err) { serverError(res, err); }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL sp_get_patient_by_id(?)', [Number(req.params.id)]);
    const patients = rows[0];
    if (!patients || patients.length === 0) return error(res, 'Paciente no encontrado', 404);
    json(res, { ...patients[0], id: String(patients[0].id) });
  } catch (err) { serverError(res, err); }
};

exports.create = async (req, res) => {
  try {
    const { nombre, especie, edad, raza, propietario, telefono } = req.body;
    if (!nombre) return error(res, 'El nombre del paciente es obligatorio');

    const [rows] = await pool.execute('CALL sp_create_patient(?,?,?,?,?,?,?)', [
      req.user.id, nombre, especie || '', edad || null, raza || '', propietario || '', telefono || '',
    ]);
    const result = rows[0]?.[0];
    const id = String(result?.id || '0');

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'create', 'patient', result?.id, { nombre, especie });

    json(res, { id, nombre, especie: especie || '', edad: edad || '', raza: raza || '', propietario: propietario || '', telefono: telefono || '' }, 201);
  } catch (err) { serverError(res, err); }
};
