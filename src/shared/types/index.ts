export type UserRole = 'administrador' | 'secretario' | 'veterinario';
export type AppointmentStatus = 'Activo' | 'Completada' | 'Cancelada';

export interface User {
  id: string;
  username: string;
  nombre: string;
  password: string;
  rol: UserRole;
}

export type UserSession = Omit<User, 'password'>;

export interface Patient {
  id: string;
  nombre: string;
  especie: string;
  edad: string;
  raza: string;
  propietario: string;
  telefono: string;
}

export interface Procedure {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  createdBy?: string;
}

export interface MedicalRecord {
  id: string;
  nombre: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteEspecie: string;
  citas: SavedCitaInfo[];
  fechaCreacion: string;
  ultimaActualizacion: string;
  notas: string;
  createdBy: string;
}

export interface SavedCitaInfo {
  citaId: string;
  fecha: string;
  hora: string;
  procedimientoNombre: string;
  notas: string;
  historialMedico: string;
}

export interface Appointment {
  id: string;
  pacienteId: string;
  procedimientoId: string;
  fecha: string;
  hora: string;
  notas: string;
  estado: AppointmentStatus;
  creadaPor: string;
}
