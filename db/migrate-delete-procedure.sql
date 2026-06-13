-- ─── Migración: sp_delete_procedure ─────────────────────────────
-- Crea el stored procedure para eliminar procedimientos.
-- Ejecutar dentro del contenedor:
--   docker exec -i mariadb_prod mysql -u root -p Veterinaria_pet_land < db/migrate-delete-procedure.sql
-- ───────────────────────────────────────────────────────────────

DROP PROCEDURE IF EXISTS sp_delete_procedure;
DELIMITER //
CREATE PROCEDURE sp_delete_procedure(IN p_id INT)
BEGIN
	-- Verificar si hay citas que referencian este procedimiento
	DECLARE appointment_count INT;

	SELECT COUNT(*) INTO appointment_count
	FROM Medical_appointment
	WHERE id_veterian_procedure = p_id;

	IF appointment_count > 0 THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'No se puede eliminar el procedimiento porque tiene citas asociadas.';
	ELSE
		DELETE FROM Veterian_procedures WHERE id_veterian_procedure = p_id;
	END IF;
END //
DELIMITER ;

-- También agregar columna deleted_at por si se requiere soft delete en el futuro
-- (opcional, comentado por ahora)
-- ALTER TABLE Veterian_procedures ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER made_at;
