import { useState, useEffect, type FormEvent } from 'react';
import { FaCalendarPlus, FaSave, FaEraser, FaPaw, FaCalendarAlt, FaHistory, FaArrowRight, FaArrowLeft, FaCheck, FaFolderOpen } from 'react-icons/fa';
import { mockService } from '../../data/mock/mockService';
import { useAuth } from '../../context/AuthContext';
import type { Procedure, MedicalRecord } from '../../shared/types';
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
  const { user } = useAuth();
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

  // Medical history toggle
  const [guardarHistorial, setGuardarHistorial] = useState(false);
  const [historialNotas, setHistorialNotas] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);

  // Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProcedures(mockService.getProcedures());
  }, []);

  const handleNext = () => {
    setError(null);
    if (!pacienteNombre || !pacienteEspecie || !pacienteEdad || !pacienteRaza || !pacientePropietario || !pacienteTelefono) {
      setError('Todos los campos del paciente son obligatorios.');
      return;
    }
    // Create patient early so we have the ID for medical history
    const patient = mockService.createPatient({
      nombre: pacienteNombre,
      especie: pacienteEspecie,
      edad: pacienteEdad,
      raza: pacienteRaza,
      propietario: pacientePropietario,
      telefono: pacienteTelefono,
    });
    setCreatedPatientId(patient.id);
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!procedimientoId || !fecha || !hora) {
      setError('Todos los campos de la cita son obligatorios.');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    try {
      if (!createdPatientId) {
        setError('Error al crear el paciente.');
        setSaving(false);
        return;
      }

      const newAppointment = mockService.createAppointment({
        pacienteId: createdPatientId,
        procedimientoId,
        fecha,
        hora,
        notas,
        estado: 'Activo',
        creadaPor: user?.username || 'unknown',
      });

      if (guardarHistorial && selectedRecord) {
        mockService.saveAppointmentToHistory(newAppointment.id, historialNotas, selectedRecord.id);
      }

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
      setHistorialNotas('');
      setStep(1);
      onCollapseSidebar?.();
      onNavigate?.('gestion-citas');
    } catch {
      setError('Error al registrar la cita. Intente nuevamente.');
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
    setHistorialNotas('');
    setSelectedRecord(null);
    setShowSelector(false);
    setCreatedPatientId(null);
    setStep(1);
    setError(null);
    setSuccess(null);
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
                      onChange={(e) => setPacienteEdad(e.target.value)}
                      placeholder="ej: 3 años"
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
                <button type="button" className={styles.nextBtn} onClick={handleNext}>
                  Siguiente <FaArrowRight />
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
                    >
                      <option value="">Seleccione un procedimiento...</option>
                      {procedures.map((pr) => (
                        <option key={pr.id} value={pr.id}>
                          {pr.nombre}
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

              {/* Medical History Toggle */}
              <div className={styles.historyToggleSection}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={guardarHistorial}
                    onChange={(e) => {
                      setGuardarHistorial(e.target.checked);
                      if (e.target.checked) {
                        // Open selector when toggling on
                        setShowSelector(true);
                      } else {
                        setSelectedRecord(null);
                        setHistorialNotas('');
                      }
                    }}
                  />
                  <FaHistory /> Activar Historial Médico
                </label>
                <p className={styles.toggleHint}>
                  Al activar esta opción, la cita se guardará en el historial médico del paciente.
                </p>
                {guardarHistorial && (
                  <div className={styles.medicalSection}>
                    {selectedRecord ? (
                      <>
                        <div className={styles.selectedRecordBadge}>
                          <FaFolderOpen />
                          <span>
                            {selectedRecord.nombre
                              ? `Historial: ${selectedRecord.nombre}`
                              : 'Nuevo historial médico'}
                          </span>
                          <button
                            type="button"
                            className={styles.changeRecordBtn}
                            onClick={() => setShowSelector(true)}
                          >
                            Cambiar
                          </button>
                        </div>
                        <label htmlFor="historialNotas">Notas para el historial médico</label>
                        <textarea
                          id="historialNotas"
                          value={historialNotas}
                          onChange={(e) => setHistorialNotas(e.target.value)}
                          rows={3}
                          placeholder="Ingrese notas clínicas, diagnóstico, tratamiento..."
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles.selectRecordBtn}
                        onClick={() => setShowSelector(true)}
                      >
                        Seleccionar Historial Médico
                      </button>
                    )}
                  </div>
                )}
              </div>

              <MedicalHistorySelectorModal
                isOpen={showSelector}
                onClose={() => {
                  setShowSelector(false);
                  // If user cancels without selecting, un-toggle
                  if (!selectedRecord) {
                    setGuardarHistorial(false);
                  }
                }}
                onConfirm={(record: MedicalRecord) => {
                  setShowSelector(false);
                  setSelectedRecord(record);
                }}
                pacienteNombre={pacienteNombre}
                pacienteId={createdPatientId || ''}
                pacienteEspecie={pacienteEspecie}
              />

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
    </div>
  );
}
