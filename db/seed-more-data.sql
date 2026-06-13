-- ============================================================
-- seed-more-data.sql — Datos adicionales para Veterinaria_pet_land
-- ============================================================
-- Uso: mysql -u root -p Veterinaria_pet_land < db/seed-more-data.sql
-- ============================================================

USE Veterinaria_pet_land;

-- ###################################################################
-- 1. MÁS USUARIOS (activos)
-- ###################################################################
-- Passwords: usuario + "123" hasheadas con bcrypt (cost=10)
-- Reusamos hashes existentes para que sean válidos al hacer login.

INSERT INTO Users (username, password, name, last_name, id_rols_user, active) VALUES
('secre4', '$2b$10$nnhGuFo.BxzCnMal1y4hK.I4sXE6RMXDLDrYDbpUOzqHrldLPGk6W', 'Ana',      'Ramírez',   2, 1),
('vet4',   '$2b$10$n41k.e3wqnXYc04zBBugQu4DNCqB7lIrUI25CeJlqS1r6I7hBGazK', 'Dr. Luis', 'Hernández', 3, 1),
('secre5', '$2b$10$nnhGuFo.BxzCnMal1y4hK.I4sXE6RMXDLDrYDbpUOzqHrldLPGk6W', 'Carmen',   'López',     2, 1),
('vet5',   '$2b$10$n41k.e3wqnXYc04zBBugQu4DNCqB7lIrUI25CeJlqS1r6I7hBGazK', 'Dr. Pedro','Castillo',  3, 1);

-- ###################################################################
-- 2. MÁS PACIENTES
-- ###################################################################

INSERT INTO Patients (id_user, name, specie, age, breed, propietary, phone) VALUES
-- Dueños registrados por secre4 (id_user = 10)
(10, 'Bruno',   'Canino', '4 años',  'Border Collie',    'Ricardo Flores',  '555-0401'),
(10, 'Mía',     'Felino', '2 años',  'Angora Turco',     'Patricia Vega',   '555-0402'),
(10, 'Rex',     'Canino', '5 años',  'Doberman',         'Fernando Ríos',   '555-0403'),
(10, 'Luna',    'Felino', '1 año',   'Esfinge',          'Gabriela Cruz',   '555-0404'),
(10, 'Piolín',  'Ave',    '3 años',  'Canario',          'Marta Salinas',   '555-0405'),

-- Dueños registrados por vet4 (id_user = 11)
(11, 'Titan',   'Canino', '6 años',  'Rottweiler',       'Oscar Méndez',    '555-0410'),
(11, 'Cleo',    'Felino', '7 años',  'Ragdoll',          'Liliana Peña',    '555-0411'),
(11, 'Rocky',   'Roedor', '8 meses', 'Hámster Sirio',    'Santiago Rojas',  '555-0412'),
(11, 'Kiara',   'Canino', '3 años',  'Schnauzer',        'Daniela Torres',  '555-0413'),
(11, 'Manchas', 'Reptil', '2 años',  'Tortuga de Tierra','Héctor Navarro',  '555-0414'),

-- Dueños registrados por secre5 (id_user = 12)
(12, 'Bobby',   'Canino', '10 años', 'Cocker Spaniel',   'Rosa Martínez',   '555-0420'),
(12, 'Nina',    'Felino', '4 años',  'Burmés',           'Jorge Salazar',   '555-0421'),
(12, 'Copito',  'Roedor', '1 año',   'Conejo Belier',    'Elena Castro',    '555-0422'),
(12, 'Lola',    'Canino', '2 años',  'Pomerania',        'Alberto Vargas',  '555-0423'),
(12, 'Max',     'Felino', '5 años',  'Común Europeo',    'Sara Mendoza',    '555-0424'),

-- Dueños registrados por vet5 (id_user = 13)
(13, 'Thor',    'Canino', '8 años',  'Gran Danés',       'Diego Herrera',   '555-0430'),
(13, 'Salem',   'Felino', '3 años',  'Siberiano',        'Valentina Ortiz', '555-0431'),
(13, 'Paco',    'Ave',    '1 año',   'Cacatúa',          'Andrés Molina',   '555-0432'),
(13, 'Zeus',    'Reptil', '4 años',  'Iguana Verde',     'Camila Ruiz',     '555-0433');

-- ###################################################################
-- 3. MÁS CITAS MÉDICAS
-- ###################################################################

INSERT INTO Medical_appointment (id_veterian_procedure, id_patient, id_user, time_appointment, date_appointment, id_state, additional_note, active_medical_history) VALUES

-- Citas pasadas (completadas)
(1, 18, 11, '09:00', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 2, 'Primera consulta, todo normal', 1),
(6, 19, 10, '10:30', DATE_SUB(CURDATE(), INTERVAL 28 DAY), 2, 'Desparasitación de rutina', 0),
(4, 20, 11, '11:00', DATE_SUB(CURDATE(), INTERVAL 25 DAY), 2, 'Análisis prequirúrgico', 0),
(2, 21, 13, '14:00', DATE_SUB(CURDATE(), INTERVAL 21 DAY), 2, 'Vacuna triple felina', 0),
(7, 22, 11, '09:30', DATE_SUB(CURDATE(), INTERVAL 18 DAY), 2, 'Radiografía de cadera', 0),

-- Citas completadas con historial activo
(9, 23, 12, '08:00', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 2, 'Limpieza dental completa', 1),
(1, 24, 10, '10:00', DATE_SUB(CURDATE(), INTERVAL 12 DAY), 2, 'Control pediátrico', 1),
(11, 25, 12, '15:00', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 2, 'Hospitalización por gastroenteritis', 1),

-- Citas canceladas
(10, 26, 11, '11:00', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 3, 'El dueño reprogramó', 0),
(12, 27, 13, '09:00', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 3, 'Cancelado por lluvia', 0),

-- Citas activas de hoy
(1, 28, 10, '08:00', CURDATE(), 1, 'Consulta general', 0),
(6, 29, 13, '09:00', CURDATE(), 1, 'Desparasitación mensual', 0),
(3, 30, 11, '10:00', CURDATE(), 1, 'Esterilización programada', 0),
(8, 31, 11, '11:30', CURDATE(), 1, 'Ecografía abdominal', 0),
(5, 32, 12, '13:00', CURDATE(), 1, 'Baño y corte de uñas', 0),

-- Citas activas de mañana
(2, 33, 13, '08:30', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, 'Vacuna antirrábica anual', 0),
(4, 34, 10, '09:30', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, 'Análisis de sangre', 0),
(7, 35, 11, '11:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, 'Radiografía de tórax', 0),
(9, 36, 12, '14:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, 'Limpieza dental', 0),
(13, 37, 13, '15:30', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, 'Sesión de fisioterapia', 0),

-- Citas futuras (próxima semana)
(1, 38, 10, '09:00', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1, 'Primera consulta', 0),
(6, 18, 11, '10:00', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1, 'Desparasitación', 0),
(14, 39, 13, '11:00', DATE_ADD(CURDATE(), INTERVAL 8 DAY), 1, 'Procedimiento programado', 0),
(10, 20, 11, '09:00', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 1, 'Cirugía de rodilla', 0);

-- ###################################################################
-- 4. MÁS HISTORIALES MÉDICOS (vinculados a citas con active_medical_history=1)
-- ###################################################################

-- Historiales para las citas completadas que marcamos como activas
INSERT INTO Medical_history (id_medical_appointment, id_user, paciente_id, paciente_nombre, paciente_especie, name, medical_notes, made_at, created_by) VALUES
-- Cita 14: Bruno (id_patient=18) - Consulta General
(14, 11, 18, 'Bruno', 'Canino', 'Bruno - Consulta General',
 'Paciente en buen estado general. Frecuencia cardíaca normal, temperatura 38.5°C. Se recomienda revacunación en 30 días. Peso: 22 kg.',
 DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Dr. Luis'),

-- Cita 20: Coco (id_patient=23) - Limpieza Dental
(20, 12, 23, 'Coco', 'Roedor', 'Coco - Limpieza Dental',
 'Procedimiento exitoso. Se realizó profilaxis dental completa con anestesia inhalada. Se detectó sarro moderado. Se prescribe enjuague bucal veterinario por 7 días.',
 DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'Dr. Luis'),

-- Cita 21: Lola (id_patient=24) - Control Pediátrico
(21, 10, 24, 'Lola', 'Canino', 'Lola - Control Pediátrico',
 'Cachorra de 2 años en perfecto estado. Vacunación al día. Se recomienda iniciar plan de prevención dental. Peso: 5.5 kg. Crecimiento normal.',
 DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Ana'),

-- Cita 22: Max (id_patient=25) - Hospitalización
(22, 12, 25, 'Max', 'Felino', 'Max - Hospitalización por Gastroenteritis',
 'Ingresó con cuadro de gastroenteritis aguda. Se administró fluidoterapia durante 24 horas. Responde bien al tratamiento. Dieta blanda por 3 días post-alta. Evolución favorable.',
 DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Ana'),

-- Cita 7 (existente): Pelusa (id_patient=8) - Hospitalización
(7, 5, 8, 'Pelusa', 'Felino', 'Pelusa - Hospitalización',
 'Paciente ingresó con deshidratación severa. Se administraron 500ml de solución Ringer Lactato. Control cada 4 horas. Temperatura: 39.1°C. Evoluciona favorablemente.',
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Lucía'),

-- Cita 8 (existente): Pecas (id_patient=10) - Primera Consulta
(8, 6, 10, 'Pecas', 'Ave', 'Pecas - Primera Consulta',
 'Cacatúa de 2 años en revisión inicial. Plumas en buen estado. Se descarta psitacosis. Se recomienda suplemento vitamínico en agua por 15 días.',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Dra. Laura');

-- ###################################################################
-- 5. AUDIT LOG (entradas históricas simuladas)
-- ###################################################################

INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, created_at) VALUES
(1, 'login.success', 'user', 1, '{"username":"admin"}', DATE_SUB(CURDATE(), INTERVAL 45 DAY)),
(1, 'create', 'patient', 18, '{"nombre":"Bruno","especie":"Canino"}', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(1, 'create', 'appointment', 14, '{"pacienteId":18,"procedimientoId":1}', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(11, 'login.success', 'user', 11, '{"username":"vet4"}', DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(10, 'create', 'patient', 20, '{"nombre":"Rex","especie":"Canino"}', DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(1, 'create', 'user', 10, '{"username":"secre4","rol":"secretario"}', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(1, 'create', 'user', 11, '{"username":"vet4","rol":"veterinario"}', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(1, 'create', 'user', 12, '{"username":"secre5","rol":"secretario"}', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(1, 'create', 'user', 13, '{"username":"vet5","rol":"veterinario"}', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(13, 'login.success', 'user', 13, '{"username":"vet5"}', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(12, 'login.failed', 'user', 0, '{"username":"vet5","reason":"wrong_password"}', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(12, 'login.failed', 'user', 0, '{"username":"vet5","reason":"wrong_password"}', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(12, 'login.failed', 'user', 0, '{"username":"vet5","reason":"wrong_password"}', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(13, 'login.success', 'user', 13, '{"username":"vet5"}', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(1, 'update', 'appointment', 20, '{"nuevoEstado":"Completada"}', DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
(10, 'login.success', 'user', 10, '{"username":"secre4"}', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(13, 'create', 'patient', 38, '{"nombre":"Thor","especie":"Canino"}', DATE_SUB(CURDATE(), INTERVAL 3 DAY));

-- ###################################################################
-- 6. LOGIN ATTEMPTS (para probar bloqueo de cuenta)
-- ###################################################################

INSERT INTO login_attempts (username, attempted_at) VALUES
('admin', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('secre4', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

-- ###################################################################
-- RESUMEN
-- ###################################################################

SELECT '✅ seed-more-data.sql ejecutado correctamente' AS status;

SELECT CONCAT('Usuarios activos: ', (SELECT COUNT(*) FROM Users WHERE active = 1)) AS info;
SELECT CONCAT('Total pacientes: ', (SELECT COUNT(*) FROM Patients)) AS info;
SELECT CONCAT('Total citas: ', (SELECT COUNT(*) FROM Medical_appointment)) AS info;
SELECT CONCAT('Total historiales: ', (SELECT COUNT(*) FROM Medical_history)) AS info;
SELECT CONCAT('Total audit_log: ', (SELECT COUNT(*) FROM audit_log)) AS info;
SELECT CONCAT('Total login_attempts: ', (SELECT COUNT(*) FROM login_attempts)) AS info;
