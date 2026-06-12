-- ─── Migración: FK carpeta→citas (one-to-many) ─────────────────
-- Ejecutar DENTRO del contenedor:
--   docker cp db/migrate-folder-fk.sql mariadb_prod:/tmp/
--   docker exec mariadb_prod mysql -u root -p Veterinaria_pet_land -e "source /tmp/migrate-folder-fk.sql"
-- ───────────────────────────────────────────────────────────────

-- 1. Agregar FK de appointment → medical_history (una carpeta tiene muchas citas)
ALTER TABLE Medical_appointment ADD COLUMN id_medical_history INT NULL AFTER active_medical_history;

-- 2. Backfill: para registros existentes vinculados por el viejo FK
UPDATE Medical_appointment ma
INNER JOIN Medical_history mh ON ma.id_medical_appointment = mh.id_medical_appointment
SET ma.id_medical_history = mh.id_medical_history
WHERE mh.id_medical_appointment IS NOT NULL;
