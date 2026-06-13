-- ─── Migración: Archive para historiales médicos ──────────────
-- Agrega columna `archive` y SPs para archivar/desarchivar.
-- Ejecutar dentro del contenedor:
--   docker exec -i mariadb_prod mysql -u root -p Veterinaria_pet_land < db/migrate-medical-history-archive.sql
-- ───────────────────────────────────────────────────────────────

USE Veterinaria_pet_land;

-- 1. Agregar columna archive con default FALSE (0)
-- NOTA: active_medical_history está en Medical_appointment, no en Medical_history
ALTER TABLE Medical_history
  ADD COLUMN archive TINYINT NOT NULL DEFAULT 0 AFTER made_at;

-- 2. Actualizar registros existentes a archive = 0 (redundante por el DEFAULT, pero explícito)
UPDATE Medical_history SET archive = 0 WHERE archive IS NULL;

-- 3. Reemplazar sp_get_medical_records para que excluya archivados
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

-- 4. SP para obtener historiales archivados
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

-- 5. SP para archivar un historial médico
DROP PROCEDURE IF EXISTS sp_archive_medical_record;
DELIMITER //
CREATE PROCEDURE sp_archive_medical_record(IN p_id INT)
BEGIN
  UPDATE Medical_history
  SET archive = 1
  WHERE id_medical_history = p_id;

  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- 6. SP para desarchivar un historial médico
DROP PROCEDURE IF EXISTS sp_unarchive_medical_record;
DELIMITER //
CREATE PROCEDURE sp_unarchive_medical_record(IN p_id INT)
BEGIN
  UPDATE Medical_history
  SET archive = 0
  WHERE id_medical_history = p_id;

  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;
