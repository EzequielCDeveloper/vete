// ─── Medical Record Controller ────────────────────────────────
const pool = require('../config/db');
const { json, error, serverError } = require('../helpers/response');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_medical_records()');
    const records = rows[0];

    // Fetch citas — appointments linked to each Medical_history folder
    // Uses the NEW FK: ma.id_medical_history → mh.id_medical_history (one folder → many citas)
    // Falls back to OLD FK: mh.id_medical_appointment → ma.id_medical_appointment
    let citasMap;
    try {
      const [citasRows] = await pool.query(
        `SELECT recordId, citaId, fecha, hora, procedimientoNombre, notas, historialMedico FROM (
          -- New FK: appointment points to folder
          SELECT
            mh.id_medical_history AS recordId,
            ma.id_medical_appointment AS citaId,
            ma.date_appointment AS fecha,
            ma.time_appointment AS hora,
            vp.name AS procedimientoNombre,
            COALESCE(ma.additional_note, '') AS notas,
            COALESCE(ma.medical_notes, '') AS historialMedico
          FROM Medical_appointment ma
          INNER JOIN Medical_history mh ON ma.id_medical_history = mh.id_medical_history
          INNER JOIN Veterian_procedures vp ON ma.id_veterian_procedure = vp.id_veterian_procedure
          WHERE ma.id_medical_history IS NOT NULL

          UNION

          -- Old FK: history points to appointment (legacy rows, not already covered above)
          SELECT
            mh.id_medical_history AS recordId,
            ma.id_medical_appointment AS citaId,
            ma.date_appointment AS fecha,
            ma.time_appointment AS hora,
            vp.name AS procedimientoNombre,
            COALESCE(ma.additional_note, '') AS notas,
            COALESCE(ma.medical_notes, '') AS historialMedico
          FROM Medical_history mh
          INNER JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
          INNER JOIN Veterian_procedures vp ON ma.id_veterian_procedure = vp.id_veterian_procedure
          WHERE mh.id_medical_appointment IS NOT NULL
            AND ma.id_medical_history IS NULL
        ) AS combined_citas
        ORDER BY fecha DESC, hora DESC`
      );
      citasMap = new Map();
      for (const c of citasRows) {
        const rid = String(c.recordId);
        if (!citasMap.has(rid)) citasMap.set(rid, []);
        citasMap.get(rid).push({
          citaId: String(c.citaId),
          fecha: c.fecha,
          hora: c.hora,
          procedimientoNombre: c.procedimientoNombre,
          notas: c.notas || '',
          historialMedico: c.historialMedico,
        });
      }
    } catch {
      citasMap = new Map(); // fallback: no citas
    }

    json(res, records.map(r => ({
      ...r,
      id: String(r.id),
      pacienteId: String(r.pacienteId),
      citas: citasMap.get(String(r.id)) || [],
    })));
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
      // Link existing appointment to existing medical folder
      // NOTE: additional_note is the appointment's own note, NOT the historial notes.
      // We do NOT touch it here — it was set when the appointment was created.
      await pool.execute(
        'UPDATE Medical_appointment SET id_medical_history = ?, active_medical_history = 1 WHERE id_medical_appointment = ?',
        [Number(medicalRecordId), Number(citaId)]
      );
      // Save historial notes on the appointment itself
      if (notas) {
        await pool.execute(
          "UPDATE Medical_appointment SET medical_notes = CONCAT(COALESCE(medical_notes, ''), CASE WHEN COALESCE(medical_notes, '') = '' THEN '' ELSE '\n---\n' END, ?) WHERE id_medical_appointment = ?",
          [notas, Number(citaId)]
        );
      }
    } else {
      // Original behavior: create a new medical record from appointment
      const [rows] = await pool.execute('CALL sp_save_appointment_to_history(?,?)', [
        Number(citaId), req.user.id,
      ]);
      // Save historial notes on the appointment after creating folder
      if (notas) {
        await pool.execute(
          'UPDATE Medical_appointment SET medical_notes = ? WHERE id_medical_appointment = ?',
          [notas, Number(citaId)]
        );
      }
      // Also set the new FK on the appointment for the new query to work
      const folderId = rows[0]?.[0]?.id;
      if (folderId) {
        await pool.execute(
          'UPDATE Medical_appointment SET id_medical_history = ? WHERE id_medical_appointment = ?',
          [Number(folderId), Number(citaId)]
        );
      }
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

exports.getArchived = async (_req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_archived_medical_records()');
    const records = rows[0];

    // Fetch citas for archived records (same logic as getAll)
    let citasMap;
    try {
      const [citasRows] = await pool.query(
        `SELECT recordId, citaId, fecha, hora, procedimientoNombre, notas, historialMedico FROM (
          SELECT
            mh.id_medical_history AS recordId,
            ma.id_medical_appointment AS citaId,
            ma.date_appointment AS fecha,
            ma.time_appointment AS hora,
            vp.name AS procedimientoNombre,
            COALESCE(ma.additional_note, '') AS notas,
            COALESCE(ma.medical_notes, '') AS historialMedico
          FROM Medical_appointment ma
          INNER JOIN Medical_history mh ON ma.id_medical_history = mh.id_medical_history
          INNER JOIN Veterian_procedures vp ON ma.id_veterian_procedure = vp.id_veterian_procedure
          WHERE ma.id_medical_history IS NOT NULL

          UNION

          SELECT
            mh.id_medical_history AS recordId,
            ma.id_medical_appointment AS citaId,
            ma.date_appointment AS fecha,
            ma.time_appointment AS hora,
            vp.name AS procedimientoNombre,
            COALESCE(ma.additional_note, '') AS notas,
            COALESCE(ma.medical_notes, '') AS historialMedico
          FROM Medical_history mh
          INNER JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
          INNER JOIN Veterian_procedures vp ON ma.id_veterian_procedure = vp.id_veterian_procedure
          WHERE mh.id_medical_appointment IS NOT NULL
            AND ma.id_medical_history IS NULL
        ) AS combined_citas
        ORDER BY fecha DESC, hora DESC`
      );
      citasMap = new Map();
      for (const c of citasRows) {
        const rid = String(c.recordId);
        if (!citasMap.has(rid)) citasMap.set(rid, []);
        citasMap.get(rid).push({
          citaId: String(c.citaId),
          fecha: c.fecha,
          hora: c.hora,
          procedimientoNombre: c.procedimientoNombre,
          notas: c.notas || '',
          historialMedico: c.historialMedico,
        });
      }
    } catch {
      citasMap = new Map();
    }

    json(res, records.map(r => ({
      ...r,
      id: String(r.id),
      pacienteId: String(r.pacienteId),
      citas: citasMap.get(String(r.id)) || [],
    })));
  } catch (err) { serverError(res, err); }
};

exports.archive = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('CALL sp_archive_medical_record(?)', [Number(id)]);
    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};

exports.unarchive = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('CALL sp_unarchive_medical_record(?)', [Number(id)]);
    json(res, { success: true });
  } catch (err) { serverError(res, err); }
};
