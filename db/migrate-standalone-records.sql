-- ─── Migración: Medical Records Standalone ─────────────────────
-- Ejecutar contra la base de datos en producción.
-- Fecha: 2026-06-12
-- ───────────────────────────────────────────────────────────────

-- 1. Hacer id_medical_appointment NULLable (para standalone records)
ALTER TABLE Medical_history MODIFY id_medical_appointment INT NULL;

-- 2. Agregar columnas para standalone records
ALTER TABLE Medical_history ADD COLUMN paciente_id INT NULL AFTER id_user;
ALTER TABLE Medical_history ADD COLUMN paciente_nombre VARCHAR(255) DEFAULT '' AFTER paciente_id;
ALTER TABLE Medical_history ADD COLUMN paciente_especie VARCHAR(100) DEFAULT '' AFTER paciente_nombre;
ALTER TABLE Medical_history ADD COLUMN created_by VARCHAR(100) DEFAULT '' AFTER made_at;

-- 3. Poblar created_by desde Users para registros existentes
UPDATE Medical_history mh
SET mh.created_by = (SELECT u.username FROM Users u WHERE u.id_user = mh.id_user)
WHERE mh.created_by = '';

-- 4. Stored Procedure: sp_create_medical_record
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_create_medical_record(
	IN p_name VARCHAR(255),
	IN p_paciente_id INT,
	IN p_paciente_nombre VARCHAR(255),
	IN p_paciente_especie VARCHAR(100),
	IN p_id_user INT,
	IN p_created_by VARCHAR(100)
)
BEGIN
	INSERT INTO Medical_history (name, paciente_id, paciente_nombre, paciente_especie, id_medical_appointment, id_user, medical_notes, made_at, created_by)
	VALUES (p_name, p_paciente_id, p_paciente_nombre, p_paciente_especie, NULL, p_id_user, '', CURDATE(), p_created_by);

	SELECT LAST_INSERT_ID() AS id;
END //

DELIMITER ;

-- 5. Actualizar sp_get_medical_records (LEFT JOIN para standalone records)
DROP PROCEDURE IF EXISTS sp_get_medical_records;
DELIMITER //
CREATE PROCEDURE sp_get_medical_records()
BEGIN
	SELECT
		mh.id_medical_history AS id,
		mh.id_medical_appointment,
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
	ORDER BY mh.made_at DESC;
END //

CREATE PROCEDURE sp_get_medical_record_by_patient(IN p_id_patient INT)
BEGIN
	SELECT
		mh.id_medical_history AS id,
		mh.id_medical_appointment,
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
