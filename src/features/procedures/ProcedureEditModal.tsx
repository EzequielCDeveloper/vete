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

// ── Sanitizers ──────────────────────────────────────────────

const sanitizeLettersAndNumbers = (value: string) =>
  value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]/g, '');

const sanitizeDigitsAndDecimal = (value: string) =>
  value.replace(/[^\d.]/g, '');

const handleLetterNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const key = e.key;
  if (key.length === 1 && !/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s]$/.test(key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
};

const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const key = e.key;
  if (key.length === 1 && !/^[\d.]$/.test(key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
};

// ── Component ───────────────────────────────────────────────

export function ProcedureEditModal({ procedureId, isOpen, onClose, onSaved }: ProcedureEditModalProps) {
  const isCreating = procedureId === null;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (procedureId) {
      procedureApi.getById(procedureId).then((proc) => {
        setNombre(proc.nombre);
        setDescripcion(proc.descripcion);
        setPrecio(String(proc.precio));
        setError(null);
        setFieldErrors({});
      }).catch(() => {});
    } else {
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setError(null);
      setFieldErrors({});
    }
  }, [procedureId, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errs: Record<string, string> = {};

    const cleanNombre = sanitizeLettersAndNumbers(nombre).trim();
    if (!cleanNombre) {
      errs.nombre = 'El nombre del procedimiento es obligatorio.';
    } else if (cleanNombre.length < 2) {
      errs.nombre = 'El nombre debe tener al menos 2 caracteres.';
    } else if (cleanNombre.length > 30) {
      errs.nombre = 'El nombre no puede exceder los 30 caracteres.';
    }

    const cleanDesc = sanitizeLettersAndNumbers(descripcion).trim();
    if (!cleanDesc) {
      errs.descripcion = 'La descripción es obligatoria.';
    } else if (cleanDesc.length < 2) {
      errs.descripcion = 'La descripción debe tener al menos 2 caracteres.';
    } else if (cleanDesc.length > 30) {
      errs.descripcion = 'La descripción no puede exceder los 30 caracteres.';
    }

    const cleanPrecio = sanitizeDigitsAndDecimal(precio);
    if (!cleanPrecio) {
      errs.precio = 'El precio es obligatorio.';
    } else if (cleanPrecio.length > 5) {
      errs.precio = 'El precio no puede exceder los 5 caracteres.';
    } else {
      const precioNum = parseFloat(cleanPrecio);
      if (isNaN(precioNum) || precioNum < 0) {
        errs.precio = 'El precio debe ser un número válido mayor o igual a 0.';
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);

    try {
      const payload = {
        nombre: cleanNombre,
        descripcion: cleanDesc,
        precio: parseFloat(cleanPrecio),
      };
      if (isCreating) {
        await procedureApi.create(payload);
      } else if (procedureId) {
        await procedureApi.update(procedureId, payload);
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
            onChange={(e) => setNombre(sanitizeLettersAndNumbers(e.target.value))}
            onKeyDown={handleLetterNumberKeyDown}
            maxLength={30}
            className={fieldErrors.nombre ? styles.inputError : ''}
            required
          />
          {fieldErrors.nombre && <span className={styles.fieldError}>{fieldErrors.nombre}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Descripción</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(sanitizeLettersAndNumbers(e.target.value))}
            onKeyDown={handleLetterNumberKeyDown}
            maxLength={30}
            className={fieldErrors.descripcion ? styles.inputError : ''}
            required
          />
          {fieldErrors.descripcion && <span className={styles.fieldError}>{fieldErrors.descripcion}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Precio ($)</label>
          <input
            type="text"
            inputMode="decimal"
            value={precio}
            onChange={(e) => setPrecio(sanitizeDigitsAndDecimal(e.target.value))}
            onKeyDown={handlePriceKeyDown}
            maxLength={5}
            placeholder="0.00"
            className={fieldErrors.precio ? styles.inputError : ''}
            required
          />
          {fieldErrors.precio && <span className={styles.fieldError}>{fieldErrors.precio}</span>}
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
