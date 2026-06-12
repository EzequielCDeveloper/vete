// ─── VetCare API Client ───────────────────────────────────────
// HTTP client that talks to the Express backend.
// Token is managed via localStorage — set on login, sent on every request.

const BASE_URL = '/api';

// ─── Token management ─────────────────────────────────────────

const TOKEN_KEY = 'vetcare_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredToken(): string | null {
  return getToken();
}

// ─── Helpers ──────────────────────────────────────────────────

interface ApiError {
  error: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Error de conexión' })) as ApiError;
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content (DELETE success, etc.)
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Types matching the API responses ─────────────────────────

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    nombre: string;
    rol: string;
  };
}

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

export interface Appointment {
  id: string;
  pacienteId: string;
  procedimientoId: string;
  fecha: string;
  hora: string;
  notas: string;
  estado: 'Activo' | 'Completada' | 'Cancelada';
  creadaPor: string;
}

export interface MedicalRecord {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteEspecie: string;
  citas: SavedCitaInfo[];
  fechaCreacion: string;
  ultimaActualizacion: string;
  notas: string;
  createdBy: string;
  nombre?: string;
}

export interface SavedCitaInfo {
  citaId: string;
  fecha: string;
  hora: string;
  procedimientoNombre: string;
  notas: string;
  historialMedico: string;
}

export interface User {
  id: string;
  username: string;
  nombre: string;
  password: string;
  rol: string;
}

export interface DashStats {
  totalHoy: number;
  activas: number;
  completadas: number;
  canceladas: number;
  pacientesUnicos: number;
}

// ─── Auth ─────────────────────────────────────────────────────

export const authApi = {
  login(username: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  changeOwnPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ─── Patients ─────────────────────────────────────────────────

export const patientApi = {
  getAll(): Promise<Patient[]> {
    return request<Patient[]>('/patients');
  },
  getById(id: string): Promise<Patient> {
    return request<Patient>(`/patients/${id}`);
  },
  create(data: Omit<Patient, 'id'>): Promise<Patient> {
    return request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ─── Procedures ───────────────────────────────────────────────

export const procedureApi = {
  getAll(): Promise<Procedure[]> {
    return request<Procedure[]>('/procedures');
  },
  getById(id: string): Promise<Procedure> {
    return request<Procedure>(`/procedures/${id}`);
  },
  create(data: Omit<Procedure, 'id'>): Promise<Procedure> {
    return request<Procedure>('/procedures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<Procedure>): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/procedures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ─── Appointments ─────────────────────────────────────────────

export const appointmentApi = {
  getAll(): Promise<Appointment[]> {
    return request<Appointment[]>('/appointments');
  },
  getById(id: string): Promise<Appointment> {
    return request<Appointment>(`/appointments/${id}`);
  },
  create(data: {
    pacienteId: string;
    procedimientoId: string;
    fecha: string;
    hora: string;
    notas?: string;
    guardarHistorial?: boolean;
    historialNotas?: string;
  }): Promise<Appointment> {
    return request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: {
    procedimientoId: string;
    fecha: string;
    hora: string;
    notas?: string;
    estado?: string;
  }): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  cancel(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  },
  complete(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/appointments/${id}/complete`, {
      method: 'PATCH',
    });
  },
};

// ─── Medical Records ──────────────────────────────────────────

export const medicalRecordApi = {
  getAll(): Promise<MedicalRecord[]> {
    return request<MedicalRecord[]>('/medical-records');
  },
  getByPatient(patientId: string): Promise<MedicalRecord> {
    return request<MedicalRecord>(`/medical-records/patient/${patientId}`);
  },
  create(data: { citaId: string; notas?: string }): Promise<MedicalRecord> {
    return request<MedicalRecord>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getCitasByPatient(patientId: string): Promise<SavedCitaInfo[]> {
    return request<SavedCitaInfo[]>(`/medical-records/${patientId}/citas`);
  },
};

// ─── Users (admin) ────────────────────────────────────────────

export const userApi = {
  getAll(): Promise<User[]> {
    return request<User[]>('/users');
  },
  create(data: { username: string; password: string; nombre: string; rol: string }): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  delete(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
  changePassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// ─── Dashboard ────────────────────────────────────────────────

export const dashboardApi = {
  stats(date?: string): Promise<DashStats> {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<DashStats>(`/dashboard/stats${qs}`);
  },
};

// ─── Convenience fetch for pages that need multiple resources ─

export async function getPatientName(id: string): Promise<string> {
  try {
    const p = await patientApi.getById(id);
    return p.nombre;
  } catch {
    return '—';
  }
}

export async function getPatientEspecie(id: string): Promise<string> {
  try {
    const p = await patientApi.getById(id);
    return p.especie;
  } catch {
    return '—';
  }
}

export async function getPatientPropietario(id: string): Promise<string> {
  try {
    const p = await patientApi.getById(id);
    return p.propietario;
  } catch {
    return '—';
  }
}

export async function getProcedureName(id: string): Promise<string> {
  try {
    const p = await procedureApi.getById(id);
    return p.nombre;
  } catch {
    return '—';
  }
}

export async function getUserName(username: string): Promise<string> {
  try {
    const users = await userApi.getAll();
    const user = users.find(u => u.username === username);
    return user?.nombre || username;
  } catch {
    return username;
  }
}
