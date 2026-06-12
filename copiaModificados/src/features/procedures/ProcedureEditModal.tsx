import { useState, useEffect, type FormEvent } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { mockService } from '../../data/mock/mockService';
import { useAuth } from '../../context/AuthContext';
import { Modal, FormError } from '../../shared/ui';
import styles from './ProcedureEditModal.module.css';

interface ProcedureEditModalProps {
  procedureId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProcedureEditModal({ procedureId, isOpen, onClose, onSaved }: ProcedureEditModalProps) {
  const { user } = useAuth();
  const isCreating = procedureId === null;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (procedureId) {
      const proc = mockService.getProcedureById(procedureId);
      if (proc) {
        setNombre(proc.nombre);
        setDescripcion(proc.descripcion);
        setPrecio(String(proc.precio));
        setError(null);
        return;
      }
    }
    // Create mode or no procedure found
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setError(null);
  }, [procedureId, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!nombre.trim() || !descripcion.trim() || !precio) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0.');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));

    try {
      if (isCreating) {
        mockService.createProcedure({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: precioNum,
          createdBy: user?.username || 'unknown',
        });
      } else if (procedureId) {
        mockService.updateProcedure(procedureId, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: precioNum,
        });
      }
      onSaved();
    } catch {
      setError('Error al guardar los cambios. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const title = isCreating ? 'Nuevo Procedimiento' : 'Editar Procedimiento';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre del procedimiento</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Descripción</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Precio ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>

        <FormError message={error} />

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <FaSave /> {saving ? 'Guardando...' : isCreating ? 'Crear Procedimiento' : 'Guardar Cambios'}
          </button>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
