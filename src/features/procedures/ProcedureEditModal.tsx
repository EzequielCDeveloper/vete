import { useState, useEffect, type FormEvent } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { procedureApi } from '../../data/services/apiService';
import { Modal, FormError } from '../../shared/ui';
import styles from './ProcedureEditModal.module.css';

interface ProcedureEditModalProps {
  procedureId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProcedureEditModal({ procedureId, isOpen, onClose, onSaved }: ProcedureEditModalProps) {
  const isCreating = procedureId === null;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (procedureId) {
      procedureApi.getById(procedureId).then((proc) => {
        setNombre(proc.nombre);
        setDescripcion(proc.descripcion);
        setPrecio(String(proc.precio));
        setError(null);
      }).catch(() => {});
    } else {
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setError(null);
    }
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

    try {
      if (isCreating) {
        await procedureApi.create({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: precioNum,
        });
      } else if (procedureId) {
        await procedureApi.update(procedureId, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          precio: precioNum,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
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
