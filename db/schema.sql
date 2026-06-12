-- ============================================================
-- VETCARE — Schema Completo + Stored Procedures + Seed Data
-- Basado en el diseño original de Veterinaria_pet_land
-- Corregido y normalizado para funcionar con el frontend
-- ============================================================

DROP DATABASE IF EXISTS Veterinaria_pet_land;
CREATE DATABASE IF NOT EXISTS Veterinaria_pet_land CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Veterinaria_pet_land;

-- ─── TABLAS ───────────────────────────────────────────────────

CREATE TABLE Rols_user (
	id_rol_user INT AUTO_INCREMENT NOT NULL,
	rol VARCHAR(255) NOT NULL,
	making_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	active TINYINT NOT NULL DEFAULT 1,
	UNIQUE (rol),
	PRIMARY KEY (id_rol_user)
) ENGINE=InnoDB;

CREATE TABLE Users (
	id_user INT AUTO_INCREMENT NOT NULL,
	username VARCHAR(100) NOT NULL,
	password TEXT NOT NULL,
	name VARCHAR(100) NOT NULL,
	last_name VARCHAR(255) NOT NULL DEFAULT '',
	id_rols_user INT NOT NULL,
	active TINYINT NOT NULL DEFAULT 1,
	making_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE (username),
	PRIMARY KEY (id_user),
	FOREIGN KEY (id_rols_user) REFERENCES Rols_user(id_rol_user)
) ENGINE=InnoDB;

CREATE TABLE Species (
	id_specie INT AUTO_INCREMENT NOT NULL,
	id_user INT NOT NULL,
	name VARCHAR(255) NOT NULL,
	making_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id_specie),
	FOREIGN KEY (id_user) REFERENCES Users(id_user)
) ENGINE=InnoDB;

CREATE TABLE Patients (
	id_patient INT AUTO_INCREMENT NOT NULL,
	id_user INT NOT NULL,
	name VARCHAR(255) NOT NULL,
	specie VARCHAR(100) NOT NULL DEFAULT '',
	age VARCHAR(100) DEFAULT NULL,
	breed VARCHAR(255) DEFAULT NULL,
	propietary VARCHAR(255) DEFAULT NULL,
	phone VARCHAR(50) DEFAULT NULL,
	making_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id_patient),
	FOREIGN KEY (id_user) REFERENCES Users(id_user)
) ENGINE=InnoDB;

CREATE TABLE Veterian_procedures (
	id_veterian_procedure INT AUTO_INCREMENT NOT NULL,
	id_user INT NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	price DECIMAL(10,2) NOT NULL,
	made_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE (name),
	PRIMARY KEY (id_veterian_procedure),
	FOREIGN KEY (id_user) REFERENCES Users(id_user)
) ENGINE=InnoDB;

CREATE TABLE States (
	id_state INT AUTO_INCREMENT NOT NULL,
	name_state VARCHAR(255) NOT NULL,
	PRIMARY KEY (id_state)
) ENGINE=InnoDB;

-- Registro de intentos de login para bloqueo de cuenta (REQ-07)
CREATE TABLE login_attempts (
	id INT AUTO_INCREMENT NOT NULL,
	username VARCHAR(100) NOT NULL,
	attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	INDEX idx_login_attempts_user (username),
	INDEX idx_login_attempts_time (attempted_at)
) ENGINE=InnoDB;

-- Auditoría de acciones críticas (REQ-09)
CREATE TABLE audit_log (
	id INT AUTO_INCREMENT NOT NULL,
	user_id INT DEFAULT NULL,
	action VARCHAR(50) NOT NULL,
	entity_type VARCHAR(50) DEFAULT NULL,
	entity_id INT DEFAULT NULL,
	details JSON DEFAULT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	INDEX idx_audit_user (user_id),
	INDEX idx_audit_action (action),
	INDEX idx_audit_time (created_at),
	FOREIGN KEY (user_id) REFERENCES Users(id_user)
) ENGINE=InnoDB;

CREATE TABLE Medical_appointment (
	id_medical_appointment INT AUTO_INCREMENT NOT NULL,
	id_veterian_procedure INT NOT NULL,
	id_patient INT NOT NULL,
	id_user INT NOT NULL,
	time_appointment TIME NOT NULL,
	date_appointment DATE NOT NULL,
	id_state INT NOT NULL DEFAULT 1,
	additional_note TEXT,
	active_medical_history TINYINT NOT NULL DEFAULT 0,
	making_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id_medical_appointment),
	FOREIGN KEY (id_veterian_procedure) REFERENCES Veterian_procedures(id_veterian_procedure),
	FOREIGN KEY (id_patient) REFERENCES Patients(id_patient),
	FOREIGN KEY (id_user) REFERENCES Users(id_user),
	FOREIGN KEY (id_state) REFERENCES States(id_state)
) ENGINE=InnoDB;

CREATE TABLE Medical_history (
	id_medical_history INT AUTO_INCREMENT NOT NULL,
	id_medical_appointment INT NOT NULL,
	id_user INT NOT NULL,
	name VARCHAR(255) NOT NULL DEFAULT '',
	medical_notes TEXT,
	made_at DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id_medical_history),
	FOREIGN KEY (id_medical_appointment) REFERENCES Medical_appointment(id_medical_appointment) ON DELETE CASCADE,
	FOREIGN KEY (id_user) REFERENCES Users(id_user)
) ENGINE=InnoDB;

-- ─── STORED PROCEDURES ────────────────────────────────────────

DELIMITER //

-- Autenticación: devuelve datos del usuario + hash para bcrypt.compare en JS
-- NOTA: La comparación de contraseña se hace en el controlador con bcrypt.compare()
CREATE PROCEDURE sp_login(
	IN p_username VARCHAR(100)
)
BEGIN
	SELECT
		u.id_user AS id,
		u.username,
		u.password AS hash,
		u.name,
		u.last_name,
		rr.rol
	FROM Users u
	INNER JOIN Rols_user rr ON u.id_rols_user = rr.id_rol_user
	WHERE u.username = p_username
	  AND u.active = 1
	LIMIT 1;
END //

-- Listar pacientes
CREATE PROCEDURE sp_get_patients()
BEGIN
	SELECT
		p.id_patient AS id,
		p.name AS nombre,
		p.specie AS especie,
		p.age AS edad,
		p.breed AS raza,
		p.propietary AS propietario,
		p.phone AS telefono
	FROM Patients p
	WHERE p.id_patient > 0
	ORDER BY p.name ASC;
END //

CREATE PROCEDURE sp_get_patient_by_id(IN p_id INT)
BEGIN
	SELECT
		p.id_patient AS id,
		p.name AS nombre,
		p.specie AS especie,
		p.age AS edad,
		p.breed AS raza,
		p.propietary AS propietario,
		p.phone AS telefono
	FROM Patients p
	WHERE p.id_patient = p_id;
END //

CREATE PROCEDURE sp_create_patient(
	IN p_id_user INT,
	IN p_name VARCHAR(255),
	IN p_specie VARCHAR(100),
	IN p_age VARCHAR(100),
	IN p_breed VARCHAR(255),
	IN p_propietary VARCHAR(255),
	IN p_phone VARCHAR(50)
)
BEGIN
	INSERT INTO Patients (id_user, name, specie, age, breed, propietary, phone)
	VALUES (p_id_user, p_name, p_specie, p_age, p_breed, p_propietary, p_phone);

	SELECT LAST_INSERT_ID() AS id;
END //

-- Listar procedimientos
CREATE PROCEDURE sp_get_procedures()
BEGIN
	SELECT
		vp.id_veterian_procedure AS id,
		vp.name AS nombre,
		vp.description AS descripcion,
		vp.price AS precio,
		u.username AS createdBy
	FROM Veterian_procedures vp
	INNER JOIN Users u ON vp.id_user = u.id_user
	ORDER BY vp.name ASC;
END //

CREATE PROCEDURE sp_get_procedure_by_id(IN p_id INT)
BEGIN
	SELECT
		vp.id_veterian_procedure AS id,
		vp.name AS nombre,
		vp.description AS descripcion,
		vp.price AS precio,
		u.username AS createdBy
	FROM Veterian_procedures vp
	INNER JOIN Users u ON vp.id_user = u.id_user
	WHERE vp.id_veterian_procedure = p_id;
END //

CREATE PROCEDURE sp_create_procedure(
	IN p_id_user INT,
	IN p_name VARCHAR(255),
	IN p_description TEXT,
	IN p_price DECIMAL(10,2)
)
BEGIN
	INSERT INTO Veterian_procedures (id_user, name, description, price)
	VALUES (p_id_user, p_name, p_description, p_price);

	SELECT LAST_INSERT_ID() AS id;
END //

CREATE PROCEDURE sp_update_procedure(
	IN p_id INT,
	IN p_name VARCHAR(255),
	IN p_description TEXT,
	IN p_price DECIMAL(10,2)
)
BEGIN
	UPDATE Veterian_procedures
	SET name = p_name,
		description = p_description,
		price = p_price
	WHERE id_veterian_procedure = p_id;

	SELECT ROW_COUNT() AS affected;
END //

-- Listar citas
CREATE PROCEDURE sp_get_appointments()
BEGIN
	SELECT
		ma.id_medical_appointment AS id,
		ma.id_patient AS pacienteId,
		ma.id_veterian_procedure AS procedimientoId,
		ma.date_appointment AS fecha,
		ma.time_appointment AS hora,
		COALESCE(ma.additional_note, '') AS notas,
		s.name_state AS estado,
		u.username AS creadaPor
	FROM Medical_appointment ma
	INNER JOIN States s ON ma.id_state = s.id_state
	INNER JOIN Users u ON ma.id_user = u.id_user
	ORDER BY ma.date_appointment DESC, ma.time_appointment ASC;
END //

CREATE PROCEDURE sp_get_appointment_by_id(IN p_id INT)
BEGIN
	SELECT
		ma.id_medical_appointment AS id,
		ma.id_patient AS pacienteId,
		ma.id_veterian_procedure AS procedimientoId,
		ma.date_appointment AS fecha,
		ma.time_appointment AS hora,
		COALESCE(ma.additional_note, '') AS notas,
		s.name_state AS estado,
		u.username AS creadaPor
	FROM Medical_appointment ma
	INNER JOIN States s ON ma.id_state = s.id_state
	INNER JOIN Users u ON ma.id_user = u.id_user
	WHERE ma.id_medical_appointment = p_id;
END //

CREATE PROCEDURE sp_create_appointment(
	IN p_id_procedure INT,
	IN p_id_patient INT,
	IN p_id_user INT,
	IN p_time TIME,
	IN p_date DATE,
	IN p_notes TEXT
)
BEGIN
	INSERT INTO Medical_appointment
		(id_veterian_procedure, id_patient, id_user, time_appointment, date_appointment, additional_note, id_state)
	VALUES
		(p_id_procedure, p_id_patient, p_id_user, p_time, p_date, p_notes, 1);

	SELECT LAST_INSERT_ID() AS id;
END //

CREATE PROCEDURE sp_update_appointment(
	IN p_id INT,
	IN p_id_procedure INT,
	IN p_time TIME,
	IN p_date DATE,
	IN p_notes TEXT,
	IN p_id_state INT
)
BEGIN
	UPDATE Medical_appointment
	SET id_veterian_procedure = p_id_procedure,
		time_appointment = p_time,
		date_appointment = p_date,
		additional_note = p_notes,
		id_state = p_id_state
	WHERE id_medical_appointment = p_id;

	SELECT ROW_COUNT() AS affected;
END //

CREATE PROCEDURE sp_cancel_appointment(IN p_id INT)
BEGIN
	UPDATE Medical_appointment
	SET id_state = 3
	WHERE id_medical_appointment = p_id;

	SELECT ROW_COUNT() AS affected;
END //

CREATE PROCEDURE sp_complete_appointment(IN p_id INT)
BEGIN
	UPDATE Medical_appointment
	SET id_state = 2
	WHERE id_medical_appointment = p_id;

	SELECT ROW_COUNT() AS affected;
END //

-- Historial médico
CREATE PROCEDURE sp_get_medical_records()
BEGIN
	SELECT
		mh.id_medical_history AS id,
		ma.id_patient AS pacienteId,
		p.name AS pacienteNombre,
		p.specie AS pacienteEspecie,
		mh.name AS notas,
		mh.made_at AS fechaCreacion,
		mh.created_at AS ultimaActualizacion,
		u.username AS createdBy
	FROM Medical_history mh
	INNER JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
	INNER JOIN Patients p ON ma.id_patient = p.id_patient
	INNER JOIN Users u ON mh.id_user = u.id_user
	ORDER BY mh.made_at DESC;
END //

CREATE PROCEDURE sp_get_medical_record_by_patient(IN p_id_patient INT)
BEGIN
	SELECT
		mh.id_medical_history AS id,
		ma.id_patient AS pacienteId,
		p.name AS pacienteNombre,
		p.specie AS pacienteEspecie,
		mh.name AS notas,
		mh.made_at AS fechaCreacion,
		mh.created_at AS ultimaActualizacion,
		u.username AS createdBy
	FROM Medical_history mh
	INNER JOIN Medical_appointment ma ON mh.id_medical_appointment = ma.id_medical_appointment
	INNER JOIN Patients p ON ma.id_patient = p.id_patient
	INNER JOIN Users u ON mh.id_user = u.id_user
	WHERE ma.id_patient = p_id_patient
	ORDER BY mh.made_at DESC
	LIMIT 1;
END //

CREATE PROCEDURE sp_save_appointment_to_history(
	IN p_id_appointment INT,
	IN p_id_user INT,
	IN p_medical_notes TEXT
)
BEGIN
	DECLARE existing_count INT;

	SELECT COUNT(*) INTO existing_count
	FROM Medical_history
	WHERE id_medical_appointment = p_id_appointment;

	IF existing_count = 0 THEN
		INSERT INTO Medical_history (id_medical_appointment, id_user, medical_notes, name, made_at)
		SELECT
			p_id_appointment,
			p_id_user,
			p_medical_notes,
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

-- Obtener todas las citas de un historial (para armar el array citas[])
CREATE PROCEDURE sp_get_history_citas(IN p_id_patient INT)
BEGIN
	SELECT
		ma.id_medical_appointment AS citaId,
		ma.date_appointment AS fecha,
		ma.time_appointment AS hora,
		vp.name AS procedimientoNombre,
		COALESCE(ma.additional_note, '') AS notas,
		COALESCE(mh.medical_notes, '') AS historialMedico
	FROM Medical_appointment ma
	INNER JOIN Veterian_procedures vp ON ma.id_veterian_procedure = vp.id_veterian_procedure
	LEFT JOIN Medical_history mh ON ma.id_medical_appointment = mh.id_medical_appointment
	WHERE ma.id_patient = p_id_patient
	  AND ma.active_medical_history = 1
	ORDER BY ma.date_appointment DESC, ma.time_appointment DESC;
END //

-- Usuarios (admin)
CREATE PROCEDURE sp_get_users()
BEGIN
	SELECT
		u.id_user AS id,
		u.username,
		CONCAT(u.name, ' ', u.last_name) AS nombre,
		'' AS password,
		rr.rol
	FROM Users u
	INNER JOIN Rols_user rr ON u.id_rols_user = rr.id_rol_user
	WHERE u.active = 1
	ORDER BY u.name ASC;
END //

CREATE PROCEDURE sp_create_user(
	IN p_username VARCHAR(100),
	IN p_password TEXT,
	IN p_name VARCHAR(100),
	IN p_last_name VARCHAR(255),
	IN p_id_rol INT
)
BEGIN
	INSERT INTO Users (username, password, name, last_name, id_rols_user, active)
	VALUES (p_username, p_password, p_name, p_last_name, p_id_rol, 1);

	SELECT LAST_INSERT_ID() AS id;
END //

CREATE PROCEDURE sp_delete_user(IN p_id INT)
BEGIN
	-- Soft delete: desactivar en lugar de eliminar
	UPDATE Users SET active = 0 WHERE id_user = p_id;
	SELECT ROW_COUNT() AS affected;
END //

-- Actualizar contraseña de usuario (hasheada desde el controller)
CREATE PROCEDURE sp_update_password(
	IN p_id INT,
	IN p_password_hash TEXT
)
BEGIN
	UPDATE Users
	SET password = p_password_hash
	WHERE id_user = p_id;

	SELECT ROW_COUNT() AS affected;
END //

-- Dashboard stats
CREATE PROCEDURE sp_get_dashboard_stats(IN p_date DATE)
BEGIN
	SELECT
		COUNT(*) AS totalHoy,
		SUM(CASE WHEN s.name_state = 'Activo' THEN 1 ELSE 0 END) AS activas,
		SUM(CASE WHEN s.name_state = 'Completada' THEN 1 ELSE 0 END) AS completadas,
		SUM(CASE WHEN s.name_state = 'Cancelada' THEN 1 ELSE 0 END) AS canceladas,
		COUNT(DISTINCT ma.id_patient) AS pacientesUnicos
	FROM Medical_appointment ma
	INNER JOIN States s ON ma.id_state = s.id_state
	WHERE ma.date_appointment = p_date;
END //

DELIMITER ;

-- ─── SEED DATA ─────────────────────────────────────────────────

-- Roles (catálogo)
INSERT INTO Rols_user (rol) VALUES
	('administrador'),
	('secretario'),
	('veterinario');

-- Usuarios (passwords hasheadas con bcrypt cost=10)
-- admin:admin123, secre1:secre123, vet1:vet123, etc.
-- Todos los passwords siguen el patrón: <user> -> <user>123 (admin -> admin123)
INSERT INTO Users (username, password, name, last_name, id_rols_user) VALUES
	('admin',  '$2b$10$Gs/3lgc5N4xS3Wz2ccTVp.qRVjOIjhx0CiIZJhQMKWOoDkHyoi6ze', 'Admin',        'Principal', 1),
	('secre1', '$2b$10$nnhGuFo.BxzCnMal1y4hK.I4sXE6RMXDLDrYDbpUOzqHrldLPGk6W', 'María',        'García',    2),
	('vet1',   '$2b$10$n41k.e3wqnXYc04zBBugQu4DNCqB7lIrUI25CeJlqS1r6I7hBGazK', 'Dr. Juan',     'Pérez',     3),
	('admin2', '$2b$10$ynDk2szr3RmWcY8ZjmS7A.EoDRT2KTne2yZiIxzfBnQqnReMP//qi', 'Admin',        'Secundario', 1),
	('secre2', '$2b$10$Hyw47Ryc1M805/k4VGarp.62hWoyjhuyKjQoF7/F5o2I0DgrSOHj6', 'Lucía',        'Fernández',  2),
	('vet2',   '$2b$10$h5s1iea9rMJqSFWQzj5ae.UwJKel4mzwx7E7DKv3.0wVAYOaFBvHO', 'Dra. Laura',   'Martínez',   3),
	('admin3', '$2b$10$RAtsJ5EEthUOPoHQG7.A7uowpcpTmYCS0hGerDZ3V0JgGOOw5zynC', 'Admin',        'Soporte',    1),
	('secre3', '$2b$10$zG3UFgxIqpGEJMftG8uyFODCWXYq..yB.Dokg3JbfAQMaQgYZIsja', 'Carlos',       'López',      2),
	('vet3',   '$2b$10$phX3lkikGsXAtmC1Y6.PK.dW35VyV2vjByXKYGIgvltVXHIuMAwwC', 'Dr. Roberto',  'Díaz',       3);

-- Species (catálogo de referencia)
INSERT INTO Species (id_user, name) VALUES
	(1, 'Canino'),
	(1, 'Felino'),
	(1, 'Ave'),
	(1, 'Roedor'),
	(1, 'Reptil');

-- Estados de cita
INSERT INTO States (name_state) VALUES
	('Activo'),
	('Completada'),
	('Cancelada');

-- Pacientes (15 registros)
INSERT INTO Patients (id_user, name, specie, age, breed, propietary, phone) VALUES
	(2, 'Max',    'Canino', '3 años',  'Labrador',           'Carlos López',   '555-0101'),
	(2, 'Luna',   'Felino', '5 años',  'Persa',              'Ana Martínez',   '555-0102'),
	(2, 'Rocky',  'Canino', '2 años',  'Bulldog Francés',    'Pedro Sánchez',  '555-0103'),
	(2, 'Coco',   'Ave',    '1 año',   'Perico',             'Laura Gómez',    '555-0104'),
	(2, 'Milo',   'Canino', '7 años',  'Golden Retriever',   'Roberto Díaz',   '555-0105'),
	(5, 'Bella',  'Felino', '4 años',  'Siamés',             'Sofía Torres',   '555-0201'),
	(5, 'Toby',   'Canino', '1 año',   'Beagle',             'Miguel Ángel',   '555-0202'),
	(5, 'Pelusa', 'Felino', '8 años',  'Maine Coon',         'Elena Rivas',    '555-0203'),
	(6, 'Canela', 'Canino', '6 años',  'Pastor Alemán',      'Jorge Castillo', '555-0204'),
	(6, 'Pecas',  'Ave',    '2 años',  'Cacatúa',            'Diana Morales',  '555-0205'),
	(7, 'Thor',   'Canino', '9 años',  'Husky',              'Andrés Vega',    '555-0301'),
	(7, 'Nala',   'Felino', '3 años',  'Bengalí',            'Valeria Ríos',   '555-0302'),
	(8, 'Simba',  'Felino', '6 meses', 'Común Europeo',      'Pablo Navarro',  '555-0303'),
	(8, 'Lassie', 'Canino', '4 años',  'Collie',             'Carmen Ortega',  '555-0304'),
	(9, 'Paco',   'Roedor', '1 año',   'Cobaya',             'Raúl Mendoza',   '555-0305');

-- Procedimientos veterinarios (15 registros)
INSERT INTO Veterian_procedures (id_user, name, description, price) VALUES
	(1, 'Consulta General',       'Revisión completa del paciente',                        500.00),
	(1, 'Vacunación',             'Aplicación de vacunas',                                  350.00),
	(1, 'Cirugía Menor',          'Procedimientos quirúrgicos simples',                    1500.00),
	(1, 'Análisis Clínicos',      'Exámenes de laboratorio',                                800.00),
	(1, 'Estética',               'Baño y corte de uñas',                                   400.00),
	(1, 'Desparasitación',        'Tratamiento antiparasitario interno y externo',          450.00),
	(1, 'Radiografía',            'Estudio radiológico completo',                           1200.00),
	(1, 'Ecografía',              'Ultrasonido diagnóstico',                                1400.00),
	(1, 'Limpieza Dental',        'Profilaxis dental con anestesia',                        950.00),
	(1, 'Cirugía Mayor',          'Procedimientos quirúrgicos complejos',                   3500.00),
	(1, 'Hospitalización',        'Estancia con monitoreo por día',                         2000.00),
	(1, 'Pruebas Alérgicas',      'Panel de alergias completo',                             1100.00),
	(1, 'Fisioterapia',           'Sesión de rehabilitación física',                         700.00),
	(1, 'Eutanasia Humanitaria',  'Procedimiento con sedación y seguimiento',               2500.00),
	(1, 'Certificado Sanitario',  'Documentación para viajes nacionales e internacionales',  600.00);

-- Citas de ejemplo (12 registros)
INSERT INTO Medical_appointment (id_veterian_procedure, id_patient, id_user, time_appointment, date_appointment, id_state, additional_note) VALUES
	(1,  1,  2, '09:00', CURDATE(),                                    1, 'Revisión anual de rutina'),
	(2,  3,  3, '10:30', CURDATE(),                                    1, 'Vacuna antirrábica'),
	(4,  2,  1, '11:00', DATE_SUB(CURDATE(), INTERVAL 3 DAY),          2, 'Análisis de sangre completo'),
	(5,  5,  2, '15:00', DATE_SUB(CURDATE(), INTERVAL 4 DAY),          3, 'El dueño canceló'),
	(6,  6,  5, '08:30', CURDATE(),                                    1, 'Desparasitación mensual'),
	(7,  7,  6, '09:45', CURDATE(),                                    1, 'Control post-operatorio'),
	(11, 8,  5, '14:00', CURDATE(),                                    1, 'Hospitalización por deshidratación'),
	(1,  10, 6, '16:30', CURDATE(),                                    1, 'Primera consulta'),
	(9,  4,  1, '10:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY),          1, 'Limpieza dental programada'),
	(3,  9,  3, '11:30', DATE_ADD(CURDATE(), INTERVAL 1 DAY),          1, 'Esterilización'),
	(8,  13, 7, '09:00', DATE_SUB(CURDATE(), INTERVAL 7 DAY),          2, 'Ecografía abdominal completada'),
	(12, 14, 9, '13:00', DATE_SUB(CURDATE(), INTERVAL 2 DAY),          3, 'Cancelado por el veterinario');
