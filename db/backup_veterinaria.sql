/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: Veterinaria_pet_land
-- ------------------------------------------------------
-- Server version	11.8.8-MariaDB-ubu2404-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Medical_appointment`
--

DROP TABLE IF EXISTS `Medical_appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Medical_appointment` (
  `id_medical_appointment` int(11) NOT NULL AUTO_INCREMENT,
  `id_veterian_procedure` int(11) NOT NULL,
  `id_patient` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `time_appointment` time NOT NULL,
  `date_appointment` date NOT NULL,
  `id_state` int(11) NOT NULL DEFAULT 1,
  `additional_note` text DEFAULT NULL,
  `active_medical_history` tinyint(4) NOT NULL DEFAULT 0,
  `making_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_medical_appointment`),
  KEY `id_veterian_procedure` (`id_veterian_procedure`),
  KEY `id_patient` (`id_patient`),
  KEY `id_user` (`id_user`),
  KEY `id_state` (`id_state`),
  CONSTRAINT `Medical_appointment_ibfk_1` FOREIGN KEY (`id_veterian_procedure`) REFERENCES `Veterian_procedures` (`id_veterian_procedure`),
  CONSTRAINT `Medical_appointment_ibfk_2` FOREIGN KEY (`id_patient`) REFERENCES `Patients` (`id_patient`),
  CONSTRAINT `Medical_appointment_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `Users` (`id_user`),
  CONSTRAINT `Medical_appointment_ibfk_4` FOREIGN KEY (`id_state`) REFERENCES `States` (`id_state`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Medical_appointment`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Medical_appointment` WRITE;
/*!40000 ALTER TABLE `Medical_appointment` DISABLE KEYS */;
INSERT INTO `Medical_appointment` VALUES
(1,1,1,2,'09:00:00','2026-06-12',1,'Revisión anual de rutina',0,'2026-06-12 06:49:56'),
(2,2,3,3,'10:30:00','2026-06-12',1,'Vacuna antirrábica',0,'2026-06-12 06:49:56'),
(3,4,2,1,'11:00:00','2026-06-09',2,'Análisis de sangre completo',0,'2026-06-12 06:49:56'),
(4,5,5,2,'15:00:00','2026-06-08',3,'El dueño canceló',0,'2026-06-12 06:49:56'),
(5,6,6,5,'08:30:00','2026-06-12',1,'Desparasitación mensual',0,'2026-06-12 06:49:56'),
(6,7,7,6,'09:45:00','2026-06-12',1,'Control post-operatorio',0,'2026-06-12 06:49:56'),
(7,11,8,5,'14:00:00','2026-06-12',1,'Hospitalización por deshidratación',1,'2026-06-12 06:49:56'),
(8,1,10,6,'16:30:00','2026-06-12',1,'Primera consulta',1,'2026-06-12 06:49:56'),
(9,9,4,1,'10:00:00','2026-06-13',1,'Limpieza dental programada',1,'2026-06-12 06:49:56'),
(10,3,9,3,'11:30:00','2026-06-13',1,'Esterilización',0,'2026-06-12 06:49:56'),
(11,8,13,7,'09:00:00','2026-06-05',2,'Ecografía abdominal completada',0,'2026-06-12 06:49:56'),
(12,12,14,9,'13:00:00','2026-06-10',3,'Cancelado por el veterinario',0,'2026-06-12 06:49:56'),
(13,12,17,1,'01:28:00','2026-06-12',1,'dsfa',1,'2026-06-12 08:28:42');
/*!40000 ALTER TABLE `Medical_appointment` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Medical_history`
--

DROP TABLE IF EXISTS `Medical_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Medical_history` (
  `id_medical_history` int(11) NOT NULL AUTO_INCREMENT,
  `id_medical_appointment` int(11) DEFAULT NULL,
  `id_user` int(11) NOT NULL,
  `paciente_id` int(11) DEFAULT NULL,
  `paciente_nombre` varchar(255) DEFAULT '',
  `paciente_especie` varchar(100) DEFAULT '',
  `name` varchar(255) NOT NULL DEFAULT '',
  `medical_notes` text DEFAULT NULL,
  `made_at` date NOT NULL,
  `created_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_medical_history`),
  KEY `id_medical_appointment` (`id_medical_appointment`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `Medical_history_ibfk_1` FOREIGN KEY (`id_medical_appointment`) REFERENCES `Medical_appointment` (`id_medical_appointment`) ON DELETE CASCADE,
  CONSTRAINT `Medical_history_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `Users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Medical_history`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Medical_history` WRITE;
/*!40000 ALTER TABLE `Medical_history` DISABLE KEYS */;
INSERT INTO `Medical_history` VALUES
(1,13,1,17,'fsd','dz','test1','','2026-06-12','admin','2026-06-12 08:28:37'),
(2,13,1,NULL,'','','fsd','sfgd','2026-06-12','','2026-06-12 08:28:42'),
(3,9,1,NULL,'','','Coco','aS','2026-06-12','','2026-06-12 08:39:40'),
(4,7,1,NULL,'','','Pelusa','fsda','2026-06-12','','2026-06-12 08:59:48'),
(5,8,1,NULL,'','','Pecas','safd','2026-06-12','','2026-06-12 09:00:36');
/*!40000 ALTER TABLE `Medical_history` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Patients`
--

DROP TABLE IF EXISTS `Patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patients` (
  `id_patient` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `specie` varchar(100) NOT NULL DEFAULT '',
  `age` varchar(100) DEFAULT NULL,
  `breed` varchar(255) DEFAULT NULL,
  `propietary` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `making_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_patient`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `Patients_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Patients`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Patients` WRITE;
/*!40000 ALTER TABLE `Patients` DISABLE KEYS */;
INSERT INTO `Patients` VALUES
(1,2,'Max','Canino','3 años','Labrador','Carlos López','555-0101','2026-06-12 06:49:56'),
(2,2,'Luna','Felino','5 años','Persa','Ana Martínez','555-0102','2026-06-12 06:49:56'),
(3,2,'Rocky','Canino','2 años','Bulldog Francés','Pedro Sánchez','555-0103','2026-06-12 06:49:56'),
(4,2,'Coco','Ave','1 año','Perico','Laura Gómez','555-0104','2026-06-12 06:49:56'),
(5,2,'Milo','Canino','7 años','Golden Retriever','Roberto Díaz','555-0105','2026-06-12 06:49:56'),
(6,5,'Bella','Felino','4 años','Siamés','Sofía Torres','555-0201','2026-06-12 06:49:56'),
(7,5,'Toby','Canino','1 año','Beagle','Miguel Ángel','555-0202','2026-06-12 06:49:56'),
(8,5,'Pelusa','Felino','8 años','Maine Coon','Elena Rivas','555-0203','2026-06-12 06:49:56'),
(9,6,'Canela','Canino','6 años','Pastor Alemán','Jorge Castillo','555-0204','2026-06-12 06:49:56'),
(10,6,'Pecas','Ave','2 años','Cacatúa','Diana Morales','555-0205','2026-06-12 06:49:56'),
(11,7,'Thor','Canino','9 años','Husky','Andrés Vega','555-0301','2026-06-12 06:49:56'),
(12,7,'Nala','Felino','3 años','Bengalí','Valeria Ríos','555-0302','2026-06-12 06:49:56'),
(13,8,'Simba','Felino','6 meses','Común Europeo','Pablo Navarro','555-0303','2026-06-12 06:49:56'),
(14,8,'Lassie','Canino','4 años','Collie','Carmen Ortega','555-0304','2026-06-12 06:49:56'),
(15,9,'Paco','Roedor','1 año','Cobaya','Raúl Mendoza','555-0305','2026-06-12 06:49:56'),
(16,1,'jhgfd','gfd','5','fgd','gf','6531379774','2026-06-12 08:18:15'),
(17,1,'fsd','dz','4','cxvz','sadf','34','2026-06-12 08:28:16');
/*!40000 ALTER TABLE `Patients` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Rols_user`
--

DROP TABLE IF EXISTS `Rols_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rols_user` (
  `id_rol_user` int(11) NOT NULL AUTO_INCREMENT,
  `rol` varchar(255) NOT NULL,
  `making_at` timestamp NULL DEFAULT current_timestamp(),
  `active` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_rol_user`),
  UNIQUE KEY `rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rols_user`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Rols_user` WRITE;
/*!40000 ALTER TABLE `Rols_user` DISABLE KEYS */;
INSERT INTO `Rols_user` VALUES
(1,'administrador','2026-06-12 06:49:55',1),
(2,'secretario','2026-06-12 06:49:55',1),
(3,'veterinario','2026-06-12 06:49:55',1);
/*!40000 ALTER TABLE `Rols_user` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Species`
--

DROP TABLE IF EXISTS `Species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Species` (
  `id_specie` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `making_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_specie`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `Species_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Species`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Species` WRITE;
/*!40000 ALTER TABLE `Species` DISABLE KEYS */;
INSERT INTO `Species` VALUES
(1,1,'Canino','2026-06-12 06:49:56'),
(2,1,'Felino','2026-06-12 06:49:56'),
(3,1,'Ave','2026-06-12 06:49:56'),
(4,1,'Roedor','2026-06-12 06:49:56'),
(5,1,'Reptil','2026-06-12 06:49:56');
/*!40000 ALTER TABLE `Species` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `States`
--

DROP TABLE IF EXISTS `States`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `States` (
  `id_state` int(11) NOT NULL AUTO_INCREMENT,
  `name_state` varchar(255) NOT NULL,
  PRIMARY KEY (`id_state`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `States`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `States` WRITE;
/*!40000 ALTER TABLE `States` DISABLE KEYS */;
INSERT INTO `States` VALUES
(1,'Activo'),
(2,'Completada'),
(3,'Cancelada');
/*!40000 ALTER TABLE `States` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` text NOT NULL,
  `name` varchar(100) NOT NULL,
  `last_name` varchar(255) NOT NULL DEFAULT '',
  `id_rols_user` int(11) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  `making_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`),
  KEY `id_rols_user` (`id_rols_user`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`id_rols_user`) REFERENCES `Rols_user` (`id_rol_user`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES
(1,'admin','$2b$10$Gs/3lgc5N4xS3Wz2ccTVp.qRVjOIjhx0CiIZJhQMKWOoDkHyoi6ze','Admin','Principal',1,1,'2026-06-12 06:49:55'),
(2,'secre1','$2b$10$nnhGuFo.BxzCnMal1y4hK.I4sXE6RMXDLDrYDbpUOzqHrldLPGk6W','María','García',2,1,'2026-06-12 06:49:55'),
(3,'vet1','$2b$10$n41k.e3wqnXYc04zBBugQu4DNCqB7lIrUI25CeJlqS1r6I7hBGazK','Dr. Juan','Pérez',3,1,'2026-06-12 06:49:55'),
(4,'admin2','$2b$10$ynDk2szr3RmWcY8ZjmS7A.EoDRT2KTne2yZiIxzfBnQqnReMP//qi','Admin','Secundario',1,0,'2026-06-12 06:49:55'),
(5,'secre2','$2b$10$Hyw47Ryc1M805/k4VGarp.62hWoyjhuyKjQoF7/F5o2I0DgrSOHj6','Lucía','Fernández',2,0,'2026-06-12 06:49:55'),
(6,'vet2','$2b$10$h5s1iea9rMJqSFWQzj5ae.UwJKel4mzwx7E7DKv3.0wVAYOaFBvHO','Dra. Laura','Martínez',3,0,'2026-06-12 06:49:55'),
(7,'admin3','$2b$10$RAtsJ5EEthUOPoHQG7.A7uowpcpTmYCS0hGerDZ3V0JgGOOw5zynC','Admin','Soporte',1,0,'2026-06-12 06:49:55'),
(8,'secre3','$2b$10$zG3UFgxIqpGEJMftG8uyFODCWXYq..yB.Dokg3JbfAQMaQgYZIsja','Carlos','López',2,0,'2026-06-12 06:49:55'),
(9,'vet3','$2b$10$phX3lkikGsXAtmC1Y6.PK.dW35VyV2vjByXKYGIgvltVXHIuMAwwC','Dr. Roberto','Díaz',3,0,'2026-06-12 06:49:55');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Veterian_procedures`
--

DROP TABLE IF EXISTS `Veterian_procedures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Veterian_procedures` (
  `id_veterian_procedure` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `made_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_veterian_procedure`),
  UNIQUE KEY `name` (`name`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `Veterian_procedures_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Veterian_procedures`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Veterian_procedures` WRITE;
/*!40000 ALTER TABLE `Veterian_procedures` DISABLE KEYS */;
INSERT INTO `Veterian_procedures` VALUES
(1,1,'Consulta General','Revisión completa del paciente',500.00,'2026-06-12 06:49:56'),
(2,1,'Vacunación','Aplicación de vacunas',350.00,'2026-06-12 06:49:56'),
(3,1,'Cirugía Menor','Procedimientos quirúrgicos simples',1500.00,'2026-06-12 06:49:56'),
(4,1,'Análisis Clínicos','Exámenes de laboratorio',800.00,'2026-06-12 06:49:56'),
(5,1,'Estética','Baño y corte de uñas',400.00,'2026-06-12 06:49:56'),
(6,1,'Desparasitación','Tratamiento antiparasitario interno y externo',450.00,'2026-06-12 06:49:56'),
(7,1,'Radiografía','Estudio radiológico completo',1200.00,'2026-06-12 06:49:56'),
(8,1,'Ecografía','Ultrasonido diagnóstico',1400.00,'2026-06-12 06:49:56'),
(9,1,'Limpieza Dental','Profilaxis dental con anestesia',950.00,'2026-06-12 06:49:56'),
(10,1,'Cirugía Mayor','Procedimientos quirúrgicos complejos',3500.00,'2026-06-12 06:49:56'),
(11,1,'Hospitalización','Estancia con monitoreo por día',2000.00,'2026-06-12 06:49:56'),
(12,1,'Pruebas Alérgicas','Panel de alergias completo',1100.00,'2026-06-12 06:49:56'),
(13,1,'Fisioterapia','Sesión de rehabilitación física',700.00,'2026-06-12 06:49:56'),
(14,1,'Eutanasia Humanitaria','Procedimiento con sedación y seguimiento',2500.00,'2026-06-12 06:49:56'),
(15,1,'Certificado Sanitario','Documentación para viajes nacionales e internacionales',600.00,'2026-06-12 06:49:56');
/*!40000 ALTER TABLE `Veterian_procedures` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_time` (`created_at`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES
(1,1,'login.success','user',1,'{\"username\":\"admin\"}','2026-06-12 07:04:26'),
(2,1,'login.success','user',1,'{\"username\":\"admin\"}','2026-06-12 07:04:41'),
(3,1,'delete','user',7,'{}','2026-06-12 07:08:26'),
(4,1,'delete','user',4,'{}','2026-06-12 07:08:31'),
(5,1,'delete','user',8,'{}','2026-06-12 07:08:38'),
(6,1,'delete','user',9,'{}','2026-06-12 07:08:43'),
(7,1,'delete','user',6,'{}','2026-06-12 07:08:47'),
(8,1,'delete','user',5,'{}','2026-06-12 07:08:50'),
(9,1,'login.success','user',1,'{\"username\":\"admin\"}','2026-06-12 07:45:17'),
(10,1,'login.success','user',1,'{\"username\":\"admin\"}','2026-06-12 08:17:31'),
(11,1,'create','patient',16,'{\"nombre\":\"jhgfd\",\"especie\":\"gfd\"}','2026-06-12 08:18:15'),
(12,1,'create','patient',17,'{\"nombre\":\"fsd\",\"especie\":\"dz\"}','2026-06-12 08:28:16'),
(13,1,'create','appointment',13,'{\"pacienteId\":17,\"procedimientoId\":12,\"fecha\":\"2026-06-12\",\"hora\":\"01:28\"}','2026-06-12 08:28:42'),
(14,1,'login.success','user',1,'{\"username\":\"admin\"}','2026-06-12 08:36:47');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `attempted_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_login_attempts_user` (`username`),
  KEY `idx_login_attempts_time` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'Veterinaria_pet_land'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cancel_appointment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_cancel_appointment`(IN p_id INT)
BEGIN
	UPDATE Medical_appointment
	SET id_state = 3
	WHERE id_medical_appointment = p_id;

	SELECT ROW_COUNT() AS affected;
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_complete_appointment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_complete_appointment`(IN p_id INT)
BEGIN
	UPDATE Medical_appointment
	SET id_state = 2
	WHERE id_medical_appointment = p_id;

	SELECT ROW_COUNT() AS affected;
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_appointment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_appointment`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_medical_record` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_medical_record`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_patient` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_patient`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_procedure` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_procedure`(
	IN p_id_user INT,
	IN p_name VARCHAR(255),
	IN p_description TEXT,
	IN p_price DECIMAL(10,2)
)
BEGIN
	INSERT INTO Veterian_procedures (id_user, name, description, price)
	VALUES (p_id_user, p_name, p_description, p_price);

	SELECT LAST_INSERT_ID() AS id;
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_user`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_delete_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_delete_user`(IN p_id INT)
BEGIN
	-- Soft delete: desactivar en lugar de eliminar
	UPDATE Users SET active = 0 WHERE id_user = p_id;
	SELECT ROW_COUNT() AS affected;
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_appointments` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_appointments`()
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_appointment_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_appointment_by_id`(IN p_id INT)
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_dashboard_stats` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_dashboard_stats`(IN p_date DATE)
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_history_citas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_history_citas`(IN p_id_patient INT)
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_medical_records` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_medical_records`()
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_medical_record_by_patient` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_medical_record_by_patient`(IN p_id_patient INT)
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_patients` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_patients`()
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_patient_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_patient_by_id`(IN p_id INT)
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_procedures` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_procedures`()
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_procedure_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_procedure_by_id`(IN p_id INT)
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_users` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_get_users`()
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_login` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_login`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_save_appointment_to_history` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_save_appointment_to_history`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_appointment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_appointment`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_password` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_password`(
	IN p_id INT,
	IN p_password_hash TEXT
)
BEGIN
	UPDATE Users
	SET password = p_password_hash
	WHERE id_user = p_id;

	SELECT ROW_COUNT() AS affected;
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_procedure` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_procedure`(
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
END
;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-06-12  2:09:21
