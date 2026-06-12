// ─── Appointment Controller ───────────────────────────────────
const pool = require('../config/db');
const { json, error, serverError } = require('../helpers/response');
const audit = require('../helpers/audit');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_appointments()');
    json(res, rows[0].map(r => ({
      ...r,
      id: String(r.id),
      pacienteId: String(r.pacienteId),
      procedimientoId: String(r.procedimientoId),
    })));
  } catch (err) { serverError(res, err); }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL sp_get_appointment_by_id(?)', [Number(req.params.id)]);
    const apts = rows[0];
    if (!apts || apts.length === 0) return error(res, 'Cita no encontrada', 404);
    const a = apts[0];
    json(res, { ...a, id: String(a.id), pacienteId: String(a.pacienteId), procedimientoId: String(a.procedimientoId) });
  } catch (err) { serverError(res, err); }
};

exports.create = async (req, res) => {
  try {
    const { pacienteId, procedimientoId, fecha, hora, notas, medicalRecordId } = req.body;
    if (!pacienteId || !procedimientoId || !fecha || !hora) {
      return error(res, 'Paciente, procedimiento, fecha y hora son obligatorios');
    }

    const [rows] = await pool.execute('CALL sp_create_appointment(?,?,?,?,?,?)', [
      Number(procedimientoId), Number(pacienteId), req.user.id,
      hora, fecha, notas || null,
    ]);
    const result = rows[0]?.[0];
    const id = String(result?.id || '0');

    // Save to medical history if requested
    if (req.body.guardarHistorial) {
      await pool.execute('CALL sp_save_appointment_to_history(?,?,?)', [
        Number(result?.id), req.user.id, req.body.historialNotas || null,
      ]);
    }

    // Link to an existing medical record if provided
    if (medicalRecordId && result?.id) {
      await pool.execute(
        'UPDATE Medical_history SET id_medical_appointment = ? WHERE id_medical_history = ?',
        [Number(result.id), Number(medicalRecordId)]
      );
    }

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'create', 'appointment', result?.id, {
      pacienteId, procedimientoId, fecha, hora,
    });

    json(res, {
      id,
      pacienteId,
      procedimientoId,
      fecha,
      hora,
      notas: notas || '',
      estado: 'Activo',
      creadaPor: req.user.username,
    }, 201);
  } catch (err) { serverError(res, err); }
};

exports.update = async (req, res) => {
  try {
    const { procedimientoId, fecha, hora, notas, estado } = req.body;
    if (!procedimientoId || !fecha || !hora) {
      return error(res, 'Procedimiento, fecha y hora son obligatorios');
    }

    let idState = 1; // Activo
    if (estado === 'Completada') idState = 2;
    else if (estado === 'Cancelada') idState = 3;

    await pool.execute('CALL sp_update_appointment(?,?,?,?,?,?)', [
      Number(req.params.id), Number(procedimientoId), hora, fecha, notas || null, idState,
    ]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'update', 'appointment', Number(req.params.id), {
      procedimientoId, fecha, hora, estado,
    });

    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};

exports.cancel = async (req, res) => {
  try {
    await pool.execute('CALL sp_cancel_appointment(?)', [Number(req.params.id)]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'cancel', 'appointment', Number(req.params.id));

    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};

exports.complete = async (req, res) => {
  try {
    await pool.execute('CALL sp_complete_appointment(?)', [Number(req.params.id)]);

    // ─── Audit log ────────────────────────────────────
    await audit.log(pool, req.user.id, 'complete', 'appointment', Number(req.params.id));

    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};
