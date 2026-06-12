import { useState, type FormEvent } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { authApi, userApi } from '../../data/services/apiService';
import { Modal, FormError, FormSuccess } from '../../shared/ui';
import styles from './PasswordChangeModal.module.css';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'own' | 'admin';
  /** Only used in admin mode — the target user's id */
  targetUserId?: string;
  /** Only used in admin mode — the target user's name */
  targetUserName?: string;
  onChanged?: () => void;
}

export function PasswordChangeModal({
  isOpen,
  onClose,
  mode,
  targetUserId,
  targetUserName,
  onChanged,
}: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (mode === 'own' && !currentPassword) {
      setError('Debe ingresar su contraseña actual.');
      return;
    }

    setSaving(true);

    try {
      if (mode === 'own') {
        const res = await authApi.changeOwnPassword(currentPassword, newPassword);
        setSuccess(res.message || 'Contraseña actualizada correctamente.');
      } else {
        if (!targetUserId) throw new Error('ID de usuario no especificado');
        const res = await userApi.changePassword(targetUserId, newPassword);
        setSuccess(res.message || 'Contraseña actualizada correctamente.');
        onChanged?.();
      }

      // Reset form after 1.5s
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'own' ? 'Cambiar mi contraseña' : `Restablecer contraseña de ${targetUserName || ''}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <form onSubmit={handleSubmit} autoComplete="off">
        {mode === 'own' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Contraseña actual <span className="required">*</span>
            </label>
            <input
              type="password"
              placeholder="Ingrese su contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Nueva contraseña <span className="required">*</span>
          </label>
          <input
            type="password"
            placeholder="Mín. 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
            autoFocus={mode === 'admin'}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Confirmar nueva contraseña <span className="required">*</span>
          </label>
          <input
            type="password"
            placeholder="Repita la nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" className={styles.btnSecondary} onClick={handleClose} disabled={saving}>
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
