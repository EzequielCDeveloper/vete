-- ─── Migración: Soft-delete para procedimientos ─────────────────
-- Agrega columna `active` y cambia sp_delete_procedure a UPDATE.
-- Ejecutar dentro del contenedor:
--   docker exec -i mariadb_prod mysql -u root -p Veterinaria_pet_land < db/migrate-procedure-active.sql
-- ───────────────────────────────────────────────────────────────

USE Veterinaria_pet_land;

-- 1. Agregar columna active con default TRUE
ALTER TABLE Veterian_procedures
  ADD COLUMN active TINYINT NOT NULL DEFAULT 1 AFTER made_at;

-- Nota: DEFAULT 1 en el ALTER ya asigna active=1 a todos los registros existentes automáticamente.

-- 2. Reemplazar sp_delete_procedure con soft-delete
DROP PROCEDURE IF EXISTS sp_delete_procedure;
DELIMITER //
CREATE PROCEDURE sp_delete_procedure(IN p_id INT)
BEGIN
  -- Soft-delete: marcar como inactivo en lugar de eliminar
  UPDATE Veterian_procedures
  SET active = 0
  WHERE id_veterian_procedure = p_id;

  SELECT ROW_COUNT() AS affected;
END //
DELIMITER ;

-- 4. Reemplazar sp_get_procedures para que solo devuelva activos
DROP PROCEDURE IF EXISTS sp_get_procedures;
DELIMITER //
CREATE PROCEDURE sp_get_procedures()
BEGIN
  SELECT
    vp.id_veterian_procedure AS id,
    vp.name AS nombre,
    vp.description AS descripcion,
    vp.price AS precio,
    vp.active AS active,
    u.username AS createdBy
  FROM Veterian_procedures vp
  INNER JOIN Users u ON vp.id_user = u.id_user
  WHERE vp.active = 1
  ORDER BY vp.name ASC;
END //
DELIMITER ;

-- 5. Reemplazar sp_get_procedure_by_id para respetar active
DROP PROCEDURE IF EXISTS sp_get_procedure_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_procedure_by_id(IN p_id INT)
BEGIN
  SELECT
    vp.id_veterian_procedure AS id,
    vp.name AS nombre,
    vp.description AS descripcion,
    vp.price AS precio,
    vp.active AS active,
    u.username AS createdBy
  FROM Veterian_procedures vp
  INNER JOIN Users u ON vp.id_user = u.id_user
  WHERE vp.id_veterian_procedure = p_id
    AND vp.active = 1;
END //
DELIMITER ;
