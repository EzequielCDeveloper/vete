import { useState } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { userApi } from '../../data/services/apiService';
import { useAuth } from '../../context/AuthContext';
import { Modal, FormError } from '../../shared/ui';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  userId: string | null;
  userName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmModal({ userId, userName, onClose, onDeleted }: DeleteConfirmModalProps) {
  const { isAdmin, user: currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async () => {
    if (!userId) return;

    // Cannot delete own account
    if (currentUser?.id === userId) {
      setError('No puede eliminar su propia cuenta.');
      return;
    }

    setError(null);
    setDeleting(true);

    try {
      await userApi.delete(userId);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el usuario.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={!!userId} onClose={onClose} title="Confirmar Eliminación" size="sm">
      <div className={styles.body}>
        <p>
          ¿Está seguro de eliminar al usuario <strong>{userName}</strong>?
        </p>
        <p className={styles.muted}>Esta acción no se puede deshacer.</p>

        <FormError message={error} />

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={handleDelete}
            disabled={deleting}
          >
            <FaTrash /> {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
          >
            <FaTimes /> Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
