import { useState, useEffect, type FormEvent } from 'react';
import { FaCalendarPlus, FaSave, FaEraser, FaPaw, FaCalendarAlt, FaHistory, FaArrowRight, FaArrowLeft, FaFolderOpen, FaExchangeAlt, FaCheck } from 'react-icons/fa';
import { patientApi, appointmentApi, procedureApi } from '../../data/services/apiService';
import type { Procedure, MedicalRecord } from '../../data/services/apiService';
import { Card, FormError, FormSuccess, Breadcrumbs } from '../../shared/ui';
import MedicalHistorySelectorModal from '../medical/MedicalHistorySelectorModal';
import styles from './NewAppointmentPage.module.css';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

interface NewAppointmentPageProps {
  onNavigate?: (view: string) => void;
  onCollapseSidebar?: () => void;
}

export default function NewAppointmentPage({ onNavigate, onCollapseSidebar }: NewAppointmentPageProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  // Step 1: Patient data
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [pacienteEspecie, setPacienteEspecie] = useState('');
  const [pacienteEdad, setPacienteEdad] = useState('');
  const [pacienteRaza, setPacienteRaza] = useState('');
  const [pacientePropietario, setPacientePropietario] = useState('');
  const [pacienteTelefono, setPacienteTelefono] = useState('');

  // Step 2: Appointment details
  const [procedimientoId, setProcedimientoId] = useState('');
  const [fecha, setFecha] = useState(getTodayISO());
  const [hora, setHora] = useState(getCurrentTime());
  const [notas, setNotas] = useState('');

  // Medical history — selector flow replaces direct toggle + textarea
  const [guardarHistorial, setGuardarHistorial] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [historialNotas, setHistorialNotas] = useState('');

  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Wizard state
  const [step, setStep] = useState(1);

  // Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProcedures, setLoadingProcedures] = useState(true);

  useEffect(() => {
    procedureApi.getAll()
      .then(setProcedures)
      .catch(() => setError('Error al cargar procedimientos'))
      .finally(() => setLoadingProcedures(false));
  }, []);

  // ── Character sanitizers ──────────────────────────────────────

  const sanitizeLetters = (value: string) =>
    value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '');

  const sanitizeLettersAndNumbers = (value: string) =>
    value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]/g, '');

  const sanitizeDigits = (value: string) =>
    value.replace(/[^\d]/g, '');

  const sanitizeDigitsAndDecimal = (value: string) =>
    value.replace(/[^\d.]/g, '');

  // ── Input key filters ─────────────────────────────────────────

  const handleLetterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key.length === 1 && !/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]$/.test(key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handleLetterNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key.length === 1 && !/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]$/.test(key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handleDigitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key.length === 1 && !/^\d$/.test(key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  // ── Change handlers with sanitisation ─────────────────────────

  const handleLetterChange = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(sanitizeLetters(e.target.value));
    };

  const handleLetterNumberChange = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(sanitizeLettersAndNumbers(e.target.value));
    };

  const handleDigitChange = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(sanitizeDigits(e.target.value));
    };

  // ── Field validation ──────────────────────────────────────────

  const validatePatientFields = (): boolean => {
    const errors: Record<string, string> = {};

    const nombre = sanitizeLettersAndNumbers(pacienteNombre).trim();
    if (nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres (letras o números).';
    } else if (nombre.length > 20) {
      errors.nombre = 'El nombre no puede exceder los 20 caracteres.';
    }

    const edad = sanitizeDigits(pacienteEdad);
    if (edad.length === 0) {
      errors.edad = 'La edad es obligatoria (solo números).';
    } else if (edad.length > 2) {
      errors.edad = 'La edad no puede exceder los 2 dígitos.';
    }

    const raza = sanitizeLetters(pacienteRaza);
    if (raza.length < 3) {
      errors.raza = 'La raza debe tener al menos 3 caracteres y solo letras.';
    } else if (raza.length > 20) {
      errors.raza = 'La raza no puede exceder los 20 caracteres.';
    }

    const telefono = sanitizeDigits(pacienteTelefono);
    if (telefono.length < 5) {
      errors.telefono = 'Número telefónico incompleto. Debe tener al menos 5 dígitos.';
    } else if (telefono.length > 15) {
      errors.telefono = 'El teléfono no puede exceder los 15 dígitos.';
    }

    const propietario = sanitizeLetters(pacientePropietario);
    if (propietario.length < 5) {
      errors.propietario = 'El propietario debe tener al menos 5 caracteres y solo letras.';
    } else if (propietario.length > 30) {
      errors.propietario = 'El propietario no puede exceder los 30 caracteres.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    setError(null);
    setFieldErrors({});

    if (!validatePatientFields()) return;

    setSaving(true);
    try {
      const patient = await patientApi.create({
        nombre: sanitizeLettersAndNumbers(pacienteNombre),
        especie: pacienteEspecie,
        edad: pacienteEdad,
        raza: sanitizeLetters(pacienteRaza),
        propietario: sanitizeLetters(pacientePropietario).toUpperCase(),
        telefono: sanitizeDigits(pacienteTelefono),
      });
      setCreatedPatientId(patient.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el paciente');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!procedimientoId || !fecha || !hora) {
      setError('Todos los campos de la cita son obligatorios.');
      return;
    }

    if (notas.trim() && notas.trim().length < 5) {
      setError('Las notas adicionales deben tener al menos 5 caracteres.');
      return;
    }

    if (guardarHistorial && historialNotas.trim().length < 5) {
      setError('Las notas para el historial médico deben tener al menos 5 caracteres.');
      return;
    }

    // Validate date is not in the past
    const today = getTodayISO();
    if (fecha < today) {
      setError('La fecha no puede ser anterior a hoy.');
      return;
    }
    if (fecha === today) {
      const now = getCurrentTime();
      if (hora < now) {
        setError('La hora no puede ser anterior a la hora actual.');
        return;
      }
    }

    setSaving(true);

    try {
      if (!createdPatientId) {
        setError('Error al crear el paciente.');
        setSaving(false);
        return;
      }

      await appointmentApi.create({
        pacienteId: createdPatientId,
        procedimientoId,
        fecha,
        hora,
        notas,
        guardarHistorial: guardarHistorial && !!selectedRecord,
        historialNotas: guardarHistorial ? historialNotas : undefined,
        medicalRecordId: selectedRecord?.id,
      });

      setSuccess('Cita registrada exitosamente.');
      // Reset form
      setPacienteNombre('');
      setPacienteEspecie('');
      setPacienteEdad('');
      setPacienteRaza('');
      setPacientePropietario('');
      setPacienteTelefono('');
      setProcedimientoId('');
      setFecha(getTodayISO());
      setHora(getCurrentTime());
      setNotas('');
      setGuardarHistorial(false);
      setSelectedRecord(null);
      setHistorialNotas('');
      setStep(1);
      onCollapseSidebar?.();
      onNavigate?.('gestion-citas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la cita');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPacienteNombre('');
    setPacienteEspecie('');
    setPacienteEdad('');
    setPacienteRaza('');
    setPacientePropietario('');
    setPacienteTelefono('');
    setProcedimientoId('');
    setFecha(getTodayISO());
    setHora(getCurrentTime());
    setNotas('');
    setGuardarHistorial(false);
    setSelectedRecord(null);
    setHistorialNotas('');
    setCreatedPatientId(null);
    setStep(1);
    setError(null);
    setSuccess(null);
  };

  const handleToggleHistorial = () => {
    // When toggling ON, open the selector immediately
    if (!guardarHistorial) {
      setShowSelector(true);
      // Don't set guardarHistorial yet — wait for confirmation
    } else {
      setGuardarHistorial(false);
      setSelectedRecord(null);
      setHistorialNotas('');
    }
  };

  const handleRecordSelected = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowSelector(false);
    setGuardarHistorial(true);
    setHistorialNotas('');
  };

  const handleChangeRecord = () => {
    setShowSelector(true);
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Nueva Cita' },
        ]}
        onNavigate={onNavigate}
      />

      <div className={styles.viewHeader}>
        <h3>
          <FaCalendarPlus className={styles.headerIcon} /> Nueva Cita
        </h3>
        <p className={styles.viewDesc}>Registre una nueva cita en dos pasos.</p>
      </div>

      {/* Step indicator */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${step === 1 ? styles.stepActive : styles.stepDone}`}>
          <span className={styles.stepNum}>
            {step > 1 ? <FaCheck /> : '1'}
          </span>
          <span className={styles.stepLabel}>Datos del Paciente</span>
        </div>
        <div className={styles.stepConnector} />
        <div className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Detalles de Cita</span>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Step 1: Patient Data Only */}
          {step === 1 && (
            <>
              <div className={styles.patientSection}>
                <h4 className={styles.sectionTitle}>
                  <FaPaw /> Datos del Paciente
                </h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Nombre <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacienteNombre}
                      onChange={handleLetterNumberChange(setPacienteNombre)}
                      onKeyDown={handleLetterNumberKeyDown}
                      maxLength={20}
                      className={fieldErrors.nombre ? styles.inputError : ''}
                      required
                    />
                    {fieldErrors.nombre && <span className={styles.fieldError}>{fieldErrors.nombre}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Especie <span className="required">*</span>
                    </label>
                    <select
                      value={pacienteEspecie}
                      onChange={(e) => setPacienteEspecie(e.target.value)}
                      required
                    >
                      <option value="">Seleccione especie...</option>
                      <option value="Canino">Canino</option>
                      <option value="Felino">Felino</option>
                      <option value="Ave">Ave</option>
                      <option value="Roedor">Roedor</option>
                      <option value="Reptil">Reptil</option>
                      <option value="Equino">Equino</option>
                      <option value="Bovino">Bovino</option>
                      <option value="Porcino">Porcino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Edad <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacienteEdad}
                      onChange={handleDigitChange(setPacienteEdad)}
                      onKeyDown={handleDigitKeyDown}
                      maxLength={2}
                      placeholder="ej: 3 años"
                      className={fieldErrors.edad ? styles.inputError : ''}
                      required
                    />
                    {fieldErrors.edad && <span className={styles.fieldError}>{fieldErrors.edad}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Raza <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacienteRaza}
                      onChange={handleLetterChange(setPacienteRaza)}
                      onKeyDown={handleLetterKeyDown}
                      maxLength={20}
                      className={fieldErrors.raza ? styles.inputError : ''}
                      required
                    />
                    {fieldErrors.raza && <span className={styles.fieldError}>{fieldErrors.raza}</span>}
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Propietario <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacientePropietario}
                      onChange={handleLetterChange(setPacientePropietario)}
                      onKeyDown={handleLetterKeyDown}
                      maxLength={30}
                      className={fieldErrors.propietario ? styles.inputError : ''}
                      required
                    />
                    {fieldErrors.propietario && <span className={styles.fieldError}>{fieldErrors.propietario}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Teléfono <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacienteTelefono}
                      onChange={handleDigitChange(setPacienteTelefono)}
                      onKeyDown={handleDigitKeyDown}
                      maxLength={15}
                      className={fieldErrors.telefono ? styles.inputError : ''}
                      placeholder="Ej: 987654321"
                      required
                    />
                    {fieldErrors.telefono && <span className={styles.fieldError}>{fieldErrors.telefono}</span>}
                  </div>
                </div>
              </div>

              <FormError message={error} />

              <div className={styles.formActions}>
                <button type="button" className={styles.nextBtn} onClick={handleNext} disabled={saving}>
                  {saving ? 'Creando paciente...' : <>Siguiente <FaArrowRight /></>}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Appointment Details + Medical History */}
          {step === 2 && (
            <>
              <div className={styles.appointmentSection}>
                <h4 className={styles.sectionTitle}>
                  <FaCalendarAlt /> Datos de la Cita
                </h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Procedimiento <span className="required">*</span>
                    </label>
                    <select
                      value={procedimientoId}
                      onChange={(e) => setProcedimientoId(e.target.value)}
                      required
                      disabled={loadingProcedures}
                    >
                      <option value="">
                        {loadingProcedures ? 'Cargando...' : 'Seleccione un procedimiento...'}
                      </option>
                      {procedures.map((pr) => (
                        <option key={pr.id} value={pr.id}>
                          {pr.nombre} — ${pr.precio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Fecha <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      min={getTodayISO()}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Hora <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Notas adicionales</label>
                  <textarea
                    rows={3}
                    placeholder="Indicaciones, síntomas, observaciones..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Medical History Toggle + Selector */}
              <div className={styles.historyToggleSection}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={guardarHistorial}
                    onChange={handleToggleHistorial}
                  />
                  <FaHistory /> Guardar en Historial Médico
                </label>
                <p className={styles.toggleHint}>
                  Al activar esta opción, seleccione o cree un historial médico para asociar la cita.
                </p>
                {guardarHistorial && selectedRecord && (
                  <div className={styles.selectedRecordBadge}>
                    <FaFolderOpen /> Historial: <strong>{selectedRecord.nombre || selectedRecord.pacienteNombre}</strong>
                    <button type="button" className={styles.changeRecordBtn} onClick={handleChangeRecord}>
                      <FaExchangeAlt /> Cambiar
                    </button>
                  </div>
                )}
                {guardarHistorial && selectedRecord && (
                  <div className={styles.medicalSection}>
                    <label htmlFor="historialNotas">Notas para el historial médico</label>
                    <textarea
                      id="historialNotas"
                      value={historialNotas}
                      onChange={(e) => setHistorialNotas(e.target.value)}
                      rows={3}
                      maxLength={50}
                      placeholder="Ingrese notas clínicas, diagnóstico, tratamiento..."
                    />
                  </div>
                )}
              </div>

              <FormError message={error} />
              <FormSuccess message={success} />

              <div className={styles.formActions}>
                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                  <FaArrowLeft /> Atrás
                </button>
                <button type="submit" className={styles.submitBtn} disabled={saving}>
                  <FaSave /> {saving ? 'Registrando...' : 'Registrar Cita'}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={handleReset}>
                  <FaEraser /> Limpiar
                </button>
              </div>
            </>
          )}
        </form>
      </Card>

      {/* Medical History Selector Modal */}
      <MedicalHistorySelectorModal
        isOpen={showSelector}
        onClose={() => { setShowSelector(false); }}
        onConfirm={handleRecordSelected}
        pacienteNombre={pacienteNombre}
        pacienteId={createdPatientId || undefined}
        pacienteEspecie={pacienteEspecie}
      />
    </div>
  );
}
