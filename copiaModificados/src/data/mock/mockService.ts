import type { User, UserSession, Patient, Procedure, Appointment, MedicalRecord, SavedCitaInfo } from '../../shared/types';
import type { IVetCareService, LoginResult } from '../services/types';
import {
  patients as seedPatients,
  procedures as seedProcedures,
  users as seedUsers,
  appointments as seedAppointments,
} from './data';

export class MockService implements IVetCareService {
  private patients: Patient[];
  private procedures: Procedure[];
  private users: User[];
  private appointments: Appointment[];
  private medicalRecords: MedicalRecord[] = [];
  private currentUser: UserSession | null = null;
  private nextId: number;

  constructor(
    patients?: Patient[],
    procedures?: Procedure[],
    users?: User[],
    appointments?: Appointment[],
  ) {
    this.patients = patients ? [...patients] : [...seedPatients];
    this.procedures = procedures ? [...procedures] : [...seedProcedures];
    this.users = users ? [...users] : [...seedUsers];
    this.appointments = appointments ? [...appointments] : [...seedAppointments];
    this.nextId = 100;
  }

  private generateId(): string {
    return `gen-${this.nextId++}-${Date.now()}`;
  }

  // ─── Auth ──────────────────────────────────────────────────────

  login(username: string, password: string): LoginResult {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    this.currentUser = user;
    const { password: _, ...session } = user;
    return { success: true, user: session };
  }

  // ─── Patients ──────────────────────────────────────────────────

  getPatients(): Patient[] {
    return [...this.patients];
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  createPatient(data: Omit<Patient, 'id'>): Patient {
    const id = this.generateId();
    const patient: Patient = { id, ...data };
    this.patients.push(patient);
    return patient;
  }

  // ─── Procedures ────────────────────────────────────────────────

  getProcedures(): Procedure[] {
    return [...this.procedures];
  }

  getProcedureById(id: string): Procedure | undefined {
    return this.procedures.find((p) => p.id === id);
  }

  createProcedure(data: Omit<Procedure, 'id'>): Procedure {
    const id = this.generateId();
    const procedure: Procedure = { id, ...data };
    this.procedures.push(procedure);
    return procedure;
  }

  updateProcedure(id: string, data: Partial<Procedure>): Procedure {
    const index = this.procedures.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Procedure ${id} not found`);
    this.procedures[index] = { ...this.procedures[index], ...data };
    return this.procedures[index];
  }

  // ─── Appointments ──────────────────────────────────────────────

  getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find((a) => a.id === id);
  }

  createAppointment(
    data: Omit<Appointment, 'id' | 'creadaPor'> & { creadaPor: string },
  ): Appointment {
    const appointment: Appointment = {
      ...data,
      id: this.generateId(),
    };
    this.appointments.push(appointment);
    return appointment;
  }

  updateAppointment(id: string, data: Partial<Appointment>): Appointment {
    const index = this.appointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Appointment ${id} not found`);
    this.appointments[index] = { ...this.appointments[index], ...data };
    return this.appointments[index];
  }

  cancelAppointment(id: string): Appointment {
    return this.updateAppointment(id, { estado: 'Cancelada' });
  }

  completeAppointment(id: string): Appointment {
    return this.updateAppointment(id, { estado: 'Completada' });
  }

  // ─── Medical Records ────────────────────────────────────────────

  getMedicalRecords(): MedicalRecord[] {
    return [...this.medicalRecords];
  }

  getMedicalRecordByPatientId(pacienteId: string): MedicalRecord | undefined {
    return this.medicalRecords.find(r => r.pacienteId === pacienteId);
  }

  saveAppointmentToHistory(citaId: string, notasHistorial?: string, medicalRecordId?: string): MedicalRecord {
    const cita = this.appointments.find(a => a.id === citaId);
    if (!cita) throw new Error('Cita no encontrada');

    const paciente = this.patients.find(p => p.id === cita.pacienteId);
    if (!paciente) throw new Error('Paciente no encontrado');

    const procedimiento = this.procedures.find(p => p.id === cita.procedimientoId);

    const citaInfo: SavedCitaInfo = {
      citaId: cita.id,
      fecha: cita.fecha,
      hora: cita.hora,
      procedimientoNombre: procedimiento?.nombre || 'Desconocido',
      notas: cita.notas,
      historialMedico: notasHistorial || '',
    };

    // If a specific medical record ID is given, find and update it
    if (medicalRecordId) {
      const record = this.medicalRecords.find(r => r.id === medicalRecordId);
      if (!record) throw new Error('Historial médico no encontrado');
      
      if (!record.citas.some(c => c.citaId === citaId)) {
        record.citas.push(citaInfo);
      }
      record.ultimaActualizacion = new Date().toISOString().split('T')[0];
      if (notasHistorial) record.notas = notasHistorial;
      return record;
    }

    // Fallback: find or create by patient (legacy path)
    let record = this.medicalRecords.find(r => r.pacienteId === cita.pacienteId);
    if (record) {
      if (!record.citas.some(c => c.citaId === citaId)) {
        record.citas.push(citaInfo);
      }
      record.ultimaActualizacion = new Date().toISOString().split('T')[0];
      if (notasHistorial) record.notas = notasHistorial;
    } else {
      record = {
        id: this.generateId(),
        nombre: paciente.nombre,
        pacienteId: cita.pacienteId,
        pacienteNombre: paciente.nombre,
        pacienteEspecie: paciente.especie,
        citas: [citaInfo],
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimaActualizacion: new Date().toISOString().split('T')[0],
        notas: notasHistorial || '',
        createdBy: cita.creadaPor,
      };
      this.medicalRecords.push(record);
    }
    return record;
  }

  createMedicalRecordWithName(data: { nombre: string; pacienteId: string; pacienteNombre: string; pacienteEspecie: string; createdBy: string }): MedicalRecord {
    const record: MedicalRecord = {
      id: this.generateId(),
      nombre: data.nombre,
      pacienteId: data.pacienteId,
      pacienteNombre: data.pacienteNombre,
      pacienteEspecie: data.pacienteEspecie,
      citas: [],
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      notas: '',
      createdBy: data.createdBy,
    };
    this.medicalRecords.push(record);
    return record;
  }

  createMedicalRecord(_pacienteId: string, citaId?: string, notas?: string): MedicalRecord {
    const paciente = this.patients.find(p => p.id === _pacienteId);
    if (!paciente) throw new Error('Paciente no encontrado');
    
    const record: MedicalRecord = {
      id: this.generateId(),
      nombre: paciente.nombre,
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      pacienteEspecie: paciente.especie,
      citas: [],
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      notas: notas || '',
      createdBy: 'unknown',
    };
    this.medicalRecords.push(record);
    
    if (citaId) {
      return this.saveAppointmentToHistory(citaId, notas, record.id);
    }
    return record;
  }

  // ─── Users ─────────────────────────────────────────────────────

  getUsers(): User[] {
    return [...this.users];
  }

  createUser(data: Omit<User, 'id'>): User {
    const user: User = { ...data, id: this.generateId() };
    this.users.push(user);
    return user;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  getCurrentUser(): UserSession | null {
    return this.currentUser;
  }
}

export const mockService = new MockService(seedPatients, seedProcedures, seedUsers, seedAppointments);
