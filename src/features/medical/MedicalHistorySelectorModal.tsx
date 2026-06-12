import { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaTimes, FaFolderOpen } from 'react-icons/fa';
import { medicalRecordApi } from '../../data/services/apiService';
import type { MedicalRecord } from '../../data/services/apiService';
import { Modal, SearchBox } from '../../shared/ui';
import styles from './MedicalHistorySelectorModal.module.css';

interface MedicalHistorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: MedicalRecord) => void;
  pacienteNombre?: string;
  pacienteId?: string;
}

export default function MedicalHistorySelectorModal({
  isOpen,
  onClose,
  onConfirm,
  pacienteNombre: propPacienteNombre,
  pacienteId,
}: MedicalHistorySelectorModalProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Creation mode
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      medicalRecordApi.getAll()
        .then(setRecords)
        .catch(() => setRecords([]));
      setSearch('');
      setSelectedId(null);
      setCreating(false);
      setNewName('');
      setCreateError('');
    }
  }, [isOpen]);

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.nombre || '').toLowerCase().includes(q) ||
      r.pacienteNombre.toLowerCase().includes(q) ||
      r.pacienteEspecie.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleConfirmCreate = () => {
    if (!newName.trim()) {
      setCreateError('Debe ingresar un nombre para el historial.');
      return;
    }
    if (!pacienteId) {
      setCreateError('Error: no se pudo identificar el paciente.');
      return;
    }

    // For MVP, the backend requires an appointment to create history.
    // When creating from selector before an appointment exists, we let the
    // caller handle it via the guardarHistorial flow on appointment creation.
    setCreateError('Use la opción "Guardar en Historial Médico" al crear la cita para generar el historial automáticamente.');
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    const record = records.find((r) => r.id === selectedId);
    if (record) onConfirm(record);
  };

  // If in creation mode, show name input
  if (creating) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Historial Médico" size="sm">
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.desc}>
              Para crear un historial médico, registre la cita con la opción
              "Guardar en Historial Médico" activada — el sistema lo generará automáticamente.
            </p>
          </div>

          <div className={styles.createForm}>
            <label className={styles.label}>Nombre del historial</label>
            <input
              type="text"
              className={styles.nameInput}
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(''); }}
              placeholder="ej: Historial de Luna - 2026"
              autoFocus
            />
            {createError && <p className={styles.createError}>{createError}</p>}
          </div>

          <div className={styles.actions}>
            <button className={styles.createConfirmBtn} onClick={handleConfirmCreate} disabled>
              <FaPlus /> Crear Historial
            </button>
            <button className={styles.cancelBtn} onClick={() => setCreating(false)}>
              <FaTimes /> Volver
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Normal selection mode
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Historial Médico" size="md">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.desc}>
            Seleccione un historial existente para{' '}
            <strong>{propPacienteNombre || 'el paciente'}</strong>.
          </p>
        </div>

        <div className={styles.searchRow}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre de historial o paciente..."
          />
        </div>

        <div className={styles.recordsList}>
          {filtered.length === 0 ? (
            <p className={styles.noRecords}>
              {search
                ? 'No se encontraron historiales con ese término.'
                : 'No hay historiales médicos registrados.'}
            </p>
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                className={`${styles.recordItem} ${selectedId === record.id ? styles.selected : ''}`}
                onClick={() => toggleSelect(record.id)}
              >
                <div className={styles.recordInfo}>
                  <FaFolderOpen className={styles.recordIcon} />
                  <div>
                    <span className={styles.recordName}>{record.nombre || record.pacienteNombre}</span>
                    <span className={styles.recordSub}>{record.pacienteNombre} — {record.pacienteEspecie}</span>
                  </div>
                </div>
                <span className={styles.recordCount}>
                  {record.citas?.length || 0} cita{(record.citas?.length || 0) !== 1 ? 's' : ''}
                </span>
                {selectedId === record.id && (
                  <FaCheck className={styles.checkIcon} />
                )}
              </div>
            ))
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            <FaCheck /> Confirmar
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            <FaTimes /> Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
