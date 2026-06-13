// ─── Zod Schemas ──────────────────────────────────────────────
// Centralised validation schemas for all domain entities.
// Every schema uses safeParse-compatible coercion so route
// middleware can replace req.body with structured data.
//
// Conventions:
//   - Fechas : /^\d{4}-\d{2}-\d{2}$/
//   - Horas  : /^\d{2}:\d{2}$/
//   - Precios: números positivos
//   - IDs    : números enteros positivos (coerced)
//   - Texto  : strings no vacíos con mín/máx

const { z } = require('zod');

// ─── Patient ──────────────────────────────────────────────────

const patientSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]+$/, 'El nombre solo puede contener letras y números.'),
  especie: z.string().optional().default(''),
  edad: z.string().optional().nullable().default(''),
  raza: z
    .string()
    .min(3, 'La raza debe tener al menos 3 caracteres y solo letras.')
    .max(20, 'La raza no puede exceder los 20 caracteres.')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'La raza solo puede contener letras.')
    .optional()
    .default(''),
  propietario: z
    .string()
    .min(5, 'El propietario debe tener al menos 5 caracteres y solo letras.')
    .max(30, 'El propietario no puede exceder los 30 caracteres.')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'El propietario solo puede contener letras.')
    .transform(v => v.toUpperCase()),
  telefono: z
    .string()
    .min(5, 'Número telefónico incompleto. Debe tener al menos 5 dígitos.')
    .max(15, 'El teléfono no puede exceder los 15 dígitos.')
    .regex(/^\d+$/, 'El teléfono solo puede contener números.'),
});

// ─── Appointment ──────────────────────────────────────────────

const createAppointmentSchema = z.object({
  pacienteId: z.coerce.number().int().positive('ID de paciente inválido'),
  procedimientoId: z.coerce.number().int().positive('ID de procedimiento inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  notas: z.string().optional().nullable(),
  guardarHistorial: z.boolean().optional(),
  historialNotas: z.string().optional().nullable(),
  medicalRecordId: z.coerce.number().int().positive().optional(),
});

const updateAppointmentSchema = z.object({
  procedimientoId: z.coerce.number().int().positive('ID de procedimiento inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  notas: z.string().optional().nullable(),
  estado: z.string().optional(),
});

// ─── Procedure ────────────────────────────────────────────────

const procedureSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(30, 'El nombre no puede exceder los 30 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]+$/, 'El nombre solo puede contener letras y números.'),
  descripcion: z
    .string()
    .min(2, 'La descripción debe tener al menos 2 caracteres')
    .max(30, 'La descripción no puede exceder los 30 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]+$/, 'La descripción solo puede contener letras y números.'),
  precio: z.coerce.number().positive('El precio debe ser un número positivo'),
});

// ─── User ─────────────────────────────────────────────────────

const createUserSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  rol: z.enum(['administrador', 'secretario', 'veterinario'], { message: 'Rol inválido. Use: administrador, secretario o veterinario' }),
});

// ─── Medical Record ───────────────────────────────────────────

const medicalRecordSchema = z.object({
  citaId: z.coerce.number().int().positive('ID de cita inválido'),
  notas: z.string().optional().nullable(),
});

const standaloneMedicalRecordSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  pacienteId: z.coerce.number().int().positive('ID de paciente inválido'),
  pacienteNombre: z.string().min(1, 'El nombre del paciente es obligatorio'),
  pacienteEspecie: z.string().optional().default(''),
});

// ─── Password Change ───────────────────────────────────────────

const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const changeUserPasswordSchema = z.object({
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

module.exports = {
  patientSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  procedureSchema,
  createUserSchema,
  medicalRecordSchema,
  standaloneMedicalRecordSchema,
  changeOwnPasswordSchema,
  changeUserPasswordSchema,
};
