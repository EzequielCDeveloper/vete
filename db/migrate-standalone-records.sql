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

-- 5. Actualizar sp_get_medical_records para incluir standalone records
-- (Ejecutar solo si no se actualizaron antes)
-- Nota: Reemplazar INNER JOIN por LEFT JOIN para incluir records sin cita asociada
