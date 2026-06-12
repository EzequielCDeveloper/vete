// ─── Medical Record Controller ────────────────────────────────
const pool = require('../config/db');
const { json, error, serverError } = require('../helpers/response');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_medical_records()');
    json(res, rows[0].map(r => ({ ...r, id: String(r.id), pacienteId: String(r.pacienteId) })));
  } catch (err) { serverError(res, err); }
};

exports.getByPatient = async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL sp_get_medical_record_by_patient(?)', [Number(req.params.patientId)]);
    const records = rows[0];
    if (!records || records.length === 0) return error(res, 'No hay historial para este paciente', 404);
    json(res, { ...records[0], id: String(records[0].id), pacienteId: String(records[0].pacienteId) });
  } catch (err) { serverError(res, err); }
};

exports.create = async (req, res) => {
  try {
    const { citaId, notas, medicalRecordId } = req.body;
    if (!citaId) return error(res, 'ID de cita requerido');

    if (medicalRecordId) {
      // Link existing appointment to existing medical record
      await pool.execute(
        'UPDATE Medical_history SET id_medical_appointment = ?, medical_notes = COALESCE(?, medical_notes) WHERE id_medical_history = ?',
        [Number(citaId), notas || null, Number(medicalRecordId)]
      );
      await pool.execute(
        'UPDATE Medical_appointment SET active_medical_history = 1 WHERE id_medical_appointment = ?',
        [Number(citaId)]
      );
    } else {
      // Original behavior: create a new medical record from appointment
      const [rows] = await pool.execute('CALL sp_save_appointment_to_history(?,?,?)', [
        Number(citaId), req.user.id, notas || null,
      ]);
    }

    // Build response with appointment + patient info
    const [aRows] = await pool.execute('CALL sp_get_appointment_by_id(?)', [Number(citaId)]);
    const apt = aRows[0]?.[0];

    const [pRows] = await pool.execute('CALL sp_get_patient_by_id(?)', [Number(apt?.pacienteId)]);
    const patient = pRows[0]?.[0];

    json(res, {
      id: String(apt?.id || citaId),
      pacienteId: apt ? String(apt.pacienteId) : '',
      pacienteNombre: patient?.nombre || '',
      pacienteEspecie: patient?.especie || '',
      citas: [],
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      notas: notas || '',
      createdBy: req.user.username,
    }, 201);
  } catch (err) { serverError(res, err); }
};

exports.createStandalone = async (req, res) => {
  try {
    const { nombre, pacienteId, pacienteNombre, pacienteEspecie } = req.body;

    const [rows] = await pool.execute('CALL sp_create_medical_record(?,?,?,?,?,?)', [
      nombre,
      Number(pacienteId),
      pacienteNombre,
      pacienteEspecie || '',
      req.user.id,
      req.user.username,
    ]);
    const result = rows[0]?.[0];
    const id = String(result?.id || '0');

    json(res, {
      id,
      pacienteId: String(pacienteId),
      pacienteNombre,
      pacienteEspecie: pacienteEspecie || '',
      nombre,
      notas: '',
      citas: [],
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      createdBy: req.user.username,
    }, 201);
  } catch (err) { serverError(res, err); }
};

exports.getCitasByPatient = async (req, res) => {
  try {
    const [rows] = await pool.execute('CALL sp_get_history_citas(?)', [Number(req.params.patientId)]);
    json(res, rows[0]);
  } catch (err) { serverError(res, err); }
};
