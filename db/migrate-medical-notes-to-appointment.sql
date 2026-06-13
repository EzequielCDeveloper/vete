-- ─── Migración: Mover medical_notes de Medical_history a Medical_appointment ─
-- Cada cita tiene sus propias notas de historial médico en Medical_appointment.
-- Si active_medical_history = 0 → medical_notes debe ser NULL.
-- Ejecutar: docker exec -i mariadb_prod mysql -u root -p Veterinaria_pet_land < db/migrate-medical-notes-to-appointment.sql
-- ──────────────────────────────────────────────────────────────────────────────

USE Veterinaria_pet_land;

-- 1. Agregar columna medical_notes a Medical_appointment
ALTER TABLE Medical_appointment
  ADD COLUMN medical_notes TEXT NULL DEFAULT NULL AFTER additional_note;

-- 2. Migrar datos existentes: copiar medical_notes desde Medical_history
--    a las citas vinculadas (new FK: ma.id_medical_history)
UPDATE Medical_appointment ma
INNER JOIN Medical_history mh ON ma.id_medical_history = mh.id_medical_history
SET ma.medical_notes = mh.medical_notes
WHERE ma.id_medical_history IS NOT NULL
  AND mh.medical_notes IS NOT NULL;

-- 3. Migrar datos legacy (old FK: mh.id_medical_appointment)
UPDATE Medical_appointment ma
INNER JOIN Medical_history mh ON mh.id_medical_appointment = ma.id_medical_appointment
SET ma.medical_notes = mh.medical_notes
WHERE mh.id_medical_appointment IS NOT NULL
  AND ma.id_medical_history IS NULL
  AND mh.medical_notes IS NOT NULL;

-- 4. Reemplazar sp_save_appointment_to_history: ya no guarda medical_notes
--    en Medical_history, solo crea el folder y vincula
DROP PROCEDURE IF EXISTS sp_save_appointment_to_history;
DELIMITER //
CREATE PROCEDURE sp_save_appointment_to_history(
  IN p_id_appointment INT,
  IN p_id_user INT
)
BEGIN
  DECLARE existing_count INT;

  SELECT COUNT(*) INTO existing_count
  FROM Medical_history
  WHERE id_medical_appointment = p_id_appointment;

  IF existing_count = 0 THEN
    INSERT INTO Medical_history (id_medical_appointment, id_user, name, made_at)
    SELECT
      p_id_appointment,
      p_id_user,
      COALESCE(p.name, 'Historial'),
      CURDATE()
    FROM Medical_appointment ma
    INNER JOIN Patients p ON ma.id_patient = p.id_patient
    WHERE ma.id_medical_appointment = p_id_appointment;

    UPDATE Medical_appointment
    SET active_medical_history = 1
    WHERE id_medical_appointment = p_id_appointment;
  END IF;

  SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

-- 5. Reemplazar sp_get_history_citas: leer medical_notes desde Medical_appointment
DROP PROCEDURE IF EXISTS sp_get_history_citas;
DELIMITER //
CREATE PROCEDURE sp_get_history_citas(IN p_id_patient INT)
BEGIN
  SELECT
    ma.id_medical_appointment AS citaId,
    ma.date_appointment AS fecha,
    ma.time_appointment AS hora,
    vp.name AS procedimientoNombre,
    COALESCE(ma.additional_note, '') AS notas,
    COALESCE(ma.medical_notes, '') AS historialMedico
  FROM Medical_appointment ma
  INNER JOIN Veterian_procedures vp ON ma.id_veterian_procedure = vp.id_veterian_procedure
  LEFT JOIN Medical_history mh ON ma.id_medical_appointment = mh.id_medical_appointment
  WHERE ma.id_patient = p_id_patient
    AND ma.active_medical_history = 1
  ORDER BY ma.date_appointment DESC, ma.time_appointment DESC;
END //
DELIMITER ;

-- 6. Reemplazar sp_get_medical_records: citas ya no se leen desde Medical_history,
--    el controller usa su propia query; el campo mh.medical_notes AS notas se mantiene
--    pero ya no se usa para citas (backward compat)
DROP PROCEDURE IF EXISTS sp_get_medical_records;
DELIMITER //
CREATE PROCEDURE sp_get_medical_records()
BEGIN
  SELECT
    mh.id_medical_history AS id,
    COALESCE(ma.id_patient, mh.paciente_id) AS pacienteId,
    COALESCE(p.name, mh.paciente_nombre) AS pacienteNombre,
    COALESCE(p.specie, mh.paciente_especie) AS pacienteEspecie,
    mh.name AS nombre,
    mh.medical_notes AS notas,
    mh.made_at AS fechaCreacion,
    mh.created_at AS ultimaActualizacion,
    COALESCE(u.username, mh.created_by) AS createdBy
  FROM Medical_history mh
  LEFT JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
  LEFT JOIN Patients p ON ma.id_patient = p.id_patient
  LEFT JOIN Users u ON mh.id_user = u.id_user
  WHERE mh.archive = 0
  ORDER BY mh.made_at DESC;
END //
DELIMITER ;

-- 7. Reemplazar sp_get_archived_medical_records: igual que arriba con archive=1
DROP PROCEDURE IF EXISTS sp_get_archived_medical_records;
DELIMITER //
CREATE PROCEDURE sp_get_archived_medical_records()
BEGIN
  SELECT
    mh.id_medical_history AS id,
    COALESCE(ma.id_patient, mh.paciente_id) AS pacienteId,
    COALESCE(p.name, mh.paciente_nombre) AS pacienteNombre,
    COALESCE(p.specie, mh.paciente_especie) AS pacienteEspecie,
    mh.name AS nombre,
    mh.medical_notes AS notas,
    mh.made_at AS fechaCreacion,
    mh.created_at AS ultimaActualizacion,
    COALESCE(u.username, mh.created_by) AS createdBy
  FROM Medical_history mh
  LEFT JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
  LEFT JOIN Patients p ON ma.id_patient = p.id_patient
  LEFT JOIN Users u ON mh.id_user = u.id_user
  WHERE mh.archive = 1
  ORDER BY mh.made_at DESC;
END //
DELIMITER ;

-- 8. Reemplazar sp_get_medical_record_by_patient
DROP PROCEDURE IF EXISTS sp_get_medical_record_by_patient;
DELIMITER //
CREATE PROCEDURE sp_get_medical_record_by_patient(IN p_id_patient INT)
BEGIN
  SELECT
    mh.id_medical_history AS id,
    COALESCE(ma.id_patient, mh.paciente_id) AS pacienteId,
    COALESCE(p.name, mh.paciente_nombre) AS pacienteNombre,
    COALESCE(p.specie, mh.paciente_especie) AS pacienteEspecie,
    mh.name AS nombre,
    mh.medical_notes AS notas,
    mh.made_at AS fechaCreacion,
    mh.created_at AS ultimaActualizacion,
    COALESCE(u.username, mh.created_by) AS createdBy
  FROM Medical_history mh
  LEFT JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
  LEFT JOIN Patients p ON ma.id_patient = p.id_patient
  LEFT JOIN Users u ON mh.id_user = u.id_user
  WHERE COALESCE(ma.id_patient, mh.paciente_id) = p_id_patient
  ORDER BY mh.made_at DESC
  LIMIT 1;
END //
DELIMITER ;
