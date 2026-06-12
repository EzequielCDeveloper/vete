import type { User, Patient, Procedure, Appointment } from '../../shared/types';

export const patients: Patient[] = [
  { id: 'p1', nombre: 'Max', especie: 'Canino', edad: '3 años', raza: 'Labrador', propietario: 'Carlos López', telefono: '555-0101' },
  { id: 'p2', nombre: 'Luna', especie: 'Felino', edad: '5 años', raza: 'Persa', propietario: 'Ana Martínez', telefono: '555-0102' },
  { id: 'p3', nombre: 'Rocky', especie: 'Canino', edad: '2 años', raza: 'Bulldog Francés', propietario: 'Pedro Sánchez', telefono: '555-0103' },
  { id: 'p4', nombre: 'Coco', especie: 'Ave', edad: '1 año', raza: 'Perico', propietario: 'Laura Gómez', telefono: '555-0104' },
  { id: 'p5', nombre: 'Milo', especie: 'Canino', edad: '7 años', raza: 'Golden Retriever', propietario: 'Roberto Díaz', telefono: '555-0105' },
];

export const procedures: Procedure[] = [
  { id: 'proc1', nombre: 'Consulta General', descripcion: 'Revisión completa del paciente', precio: 500, createdBy: 'admin' },
  { id: 'proc2', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas', precio: 350, createdBy: 'admin' },
  { id: 'proc3', nombre: 'Cirugía Menor', descripcion: 'Procedimientos quirúrgicos simples', precio: 1500, createdBy: 'admin' },
  { id: 'proc4', nombre: 'Análisis Clínicos', descripcion: 'Exámenes de laboratorio', precio: 800, createdBy: 'admin' },
  { id: 'proc5', nombre: 'Estética', descripcion: 'Baño y corte de uñas', precio: 400, createdBy: 'admin' },
];

export const users: User[] = [
  { id: 'u1', username: 'admin', nombre: 'Admin Principal', password: 'admin123', rol: 'administrador' },
  { id: 'u2', username: 'secre1', nombre: 'María García', password: 'secre123', rol: 'secretario' },
  { id: 'u3', username: 'vet1', nombre: 'Dr. Juan Pérez', password: 'vet123', rol: 'veterinario' },
];

const today = new Date().toISOString().split('T')[0];

export const appointments: Appointment[] = [
  { id: 'c1', pacienteId: 'p1', procedimientoId: 'proc1', fecha: today, hora: '09:00', notas: 'Revisión anual de rutina', estado: 'Activo', creadaPor: 'secre1' },
  { id: 'c2', pacienteId: 'p3', procedimientoId: 'proc2', fecha: today, hora: '10:30', notas: 'Vacuna antirrábica', estado: 'Activo', creadaPor: 'vet1' },
  { id: 'c3', pacienteId: 'p2', procedimientoId: 'proc4', fecha: '2026-06-08', hora: '11:00', notas: 'Análisis de sangre completo', estado: 'Completada', creadaPor: 'admin' },
  { id: 'c4', pacienteId: 'p5', procedimientoId: 'proc5', fecha: '2026-06-07', hora: '15:00', notas: 'El dueño canceló', estado: 'Cancelada', creadaPor: 'secre1' },
];
