-- ─── SP Migration: copiaModificados-integracion ──────────────────
-- Ejecutar DENTRO del contenedor con: source /tmp/migrate-sp-standalone.sql
-- ────────────────────────────────────────────────────────────────

-- 1. Actualizar sp_get_medical_records (LEFT JOIN + id_medical_appointment + nombre)
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
DELIMITER ;

-- 2. Actualizar sp_get_medical_record_by_patient
DROP PROCEDURE IF EXISTS sp_get_medical_record_by_patient;
DELIMITER //
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
