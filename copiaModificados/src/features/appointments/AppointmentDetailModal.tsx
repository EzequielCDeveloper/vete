import { useState, useEffect, type FormEvent } from 'react';
import { FaSave, FaTimes, FaInfoCircle, FaPaw, FaHistory, FaCheck, FaFolderOpen } from 'react-icons/fa';
import { mockService } from '../../data/mock/mockService';
import type { Appointment, Procedure, MedicalRecord } from '../../shared/types';
import { Modal, FormError } from '../../shared/ui';
import MedicalHistorySelectorModal from '../medical/MedicalHistorySelectorModal';
import styles from './AppointmentDetailModal.module.css';

interface AppointmentDetailModalProps {
  appointmentId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AppointmentDetailModal({ appointmentId, onClose, onSaved }: AppointmentDetailModalProps) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [procedimientoId, setProcedimientoId] = useState('');
  const [estado, setEstado] = useState('Activo');
  const [notas, setNotas] = useState('');
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Medical history state
  const [historialNotas, setHistorialNotas] = useState('');
  const [historySaving, setHistorySaving] = useState(false);
  const [historySuccess, setHistorySuccess] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const [pacienteId, setPacienteId] = useState('');

  // Patient info read-only
  const [patientNombre, setPatientNombre] = useState('—');
  const [patientEspecie, setPatientEspecie] = useState('—');
  const [patientEdad, setPatientEdad] = useState('—');
  const [patientRaza, setPatientRaza] = useState('—');
  const [patientPropietario, setPatientPropietario] = useState('—');
  const [patientTelefono, setPatientTelefono] = useState('—');

  useEffect(() => {
    setProcedures(mockService.getProcedures());

    if (appointmentId) {
      const apt = mockService.getAppointmentById(appointmentId);
      if (apt) {
        setPacienteId(apt.pacienteId);
        setFecha(apt.fecha);
        setHora(apt.hora);
        setProcedimientoId(apt.procedimientoId);
        setEstado(apt.estado);
        setNotas(apt.notas || '');
        setError(null);

        // Load patient info
        const patient = mockService.getPatientById(apt.pacienteId);
        if (patient) {
          setPatientNombre(patient.nombre);
          setPatientEspecie(patient.especie);
          setPatientEdad(patient.edad);
          setPatientRaza(patient.raza);
          setPatientPropietario(patient.propietario);
          setPatientTelefono(patient.telefono);
        }
      }
    }
  }, [appointmentId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!appointmentId) return;

    setError(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));

    try {
      mockService.updateAppointment(appointmentId, {
        fecha,
        hora,
        procedimientoId,
        estado: estado as Appointment['estado'],
        notas,
      });
      onSaved();
    } catch {
      setError('Error al guardar los cambios. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!appointmentId} onClose={onClose} title="Detalle de Cita" size="lg">
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Appointment info section */}
        <div className={styles.detailSection}>
          <h4 className={styles.sectionTitle}>
            <FaInfoCircle /> Información de la Cita
          </h4>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Procedimiento</label>
              <select
                value={procedimientoId}
                onChange={(e) => setProcedimientoId(e.target.value)}
                required
              >
                {procedures.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="Activo">Activo</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notas</label>
            <textarea
              rows={2}
              placeholder="Notas de la cita..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        {/* Patient info section (read-only) */}
        <div className={styles.patientSection}>
          <h4 className={styles.sectionTitle}>
            <FaPaw /> Información del Paciente
          </h4>
          <div className={styles.patientInfoGrid}>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>Nombre</span>
              <span className={styles.patientInfoValue}>{patientNombre}</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>Especie</span>
              <span className={styles.patientInfoValue}>{patientEspecie}</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>Edad</span>
              <span className={styles.patientInfoValue}>{patientEdad}</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>Raza</span>
              <span className={styles.patientInfoValue}>{patientRaza}</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>Propietario</span>
              <span className={styles.patientInfoValue}>{patientPropietario}</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>Teléfono</span>
              <span className={styles.patientInfoValue}>{patientTelefono}</span>
            </div>
          </div>
        </div>

        <FormError message={error} />

        {/* Medical History section */}
        {appointmentId && (
          <div className={styles.historySection}>
            <h4 className={styles.sectionTitle}>
              <FaHistory /> Historial Médico
            </h4>
            {historySuccess ? (
              <div className={styles.historySuccessMsg}>
                <FaCheck /> Cita guardada en el historial médico.
              </div>
            ) : selectedRecord ? (
              <>
                <div className={styles.selectedRecordBadge}>
                  <FaFolderOpen />
                  <span>Historial: {selectedRecord.nombre}</span>
                  <button className={styles.changeRecordBtn} onClick={() => setShowSelector(true)}>
                    Cambiar
                  </button>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Notas para el historial clínico
                  </label>
                  <textarea
                    rows={3}
                    value={historialNotas}
                    onChange={(e) => setHistorialNotas(e.target.value)}
                    placeholder="Diagnóstico, tratamiento, observaciones..."
                    disabled={historySaving}
                  />
                </div>
                <button
                  type="button"
                  className={styles.historyBtn}
                  onClick={async () => {
                    if (!appointmentId) return;
                    setHistorySaving(true);
                    await new Promise((r) => setTimeout(r, 200));
                    try {
                      mockService.saveAppointmentToHistory(appointmentId, historialNotas, selectedRecord?.id);
                      setHistorySuccess(true);
                    } catch {
                      // silent
                    } finally {
                      setHistorySaving(false);
                    }
                  }}
                  disabled={historySaving}
                >
                  <FaHistory /> {historySaving ? 'Guardando...' : 'Guardar en Historial Médico'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.historyBtn}
                onClick={() => setShowSelector(true)}
              >
                <FaHistory /> Guardar en Historial Médico
              </button>
            )}
          </div>
        )}

        <MedicalHistorySelectorModal
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
          onConfirm={(record: MedicalRecord) => {
            setShowSelector(false);
            setSelectedRecord(record);
          }}
          pacienteNombre={patientNombre}
          pacienteId={pacienteId}
          pacienteEspecie={patientEspecie}
        />

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <FaSave /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
