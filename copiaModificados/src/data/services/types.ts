import type { User, UserSession, Patient, Procedure, Appointment, MedicalRecord } from '../../shared/types';

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

export interface IVetCareService {
  // Auth
  login(username: string, password: string): LoginResult;

  // Patients
  getPatients(): Patient[];
  getPatientById(id: string): Patient | undefined;
  createPatient(data: Omit<Patient, 'id'>): Patient;

  // Procedures
  getProcedures(): Procedure[];
  getProcedureById(id: string): Procedure | undefined;
  createProcedure(data: Omit<Procedure, 'id'>): Procedure;
  updateProcedure(id: string, data: Partial<Procedure>): Procedure;

  // Appointments
  getAppointments(): Appointment[];
  getAppointmentById(id: string): Appointment | undefined;
  createAppointment(data: Omit<Appointment, 'id' | 'creadaPor'> & { creadaPor: string }): Appointment;
  updateAppointment(id: string, data: Partial<Appointment>): Appointment;
  cancelAppointment(id: string): Appointment;
  completeAppointment(id: string): Appointment;

  // Medical Records
  getMedicalRecords(): MedicalRecord[];
  getMedicalRecordByPatientId(pacienteId: string): MedicalRecord | undefined;
  saveAppointmentToHistory(citaId: string, notasHistorial?: string, medicalRecordId?: string): MedicalRecord;
  createMedicalRecord(pacienteId: string, citaId?: string, notas?: string): MedicalRecord;
  createMedicalRecordWithName(data: { nombre: string; pacienteId: string; pacienteNombre: string; pacienteEspecie: string; createdBy: string }): MedicalRecord;

  // Users (admin)
  getUsers(): User[];
  createUser(data: Omit<User, 'id'>): User;
  deleteUser(id: string): boolean;
  getCurrentUser(): UserSession | null;
}
