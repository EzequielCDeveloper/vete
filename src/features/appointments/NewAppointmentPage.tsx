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

  const handleNext = async () => {
    setError(null);
    if (!pacienteNombre || !pacienteEspecie || !pacienteEdad || !pacienteRaza || !pacientePropietario || !pacienteTelefono) {
      setError('Todos los campos del paciente son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      const patient = await patientApi.create({
        nombre: pacienteNombre,
        especie: pacienteEspecie,
        edad: pacienteEdad,
        raza: pacienteRaza,
        propietario: pacientePropietario,
        telefono: pacienteTelefono,
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
                      onChange={(e) => setPacienteNombre(e.target.value)}
                      required
                    />
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
                      type="number"
                      min="0"
                      max="100"
                      value={pacienteEdad}
                      onChange={(e) => setPacienteEdad(e.target.value)}
                      placeholder="ej: 3"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Raza <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacienteRaza}
                      onChange={(e) => setPacienteRaza(e.target.value)}
                      required
                    />
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
                      onChange={(e) => setPacientePropietario(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Teléfono <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={pacienteTelefono}
                      onChange={(e) => setPacienteTelefono(e.target.value)}
                      required
                    />
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
