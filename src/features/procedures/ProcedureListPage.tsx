import { useState, useEffect, useCallback } from 'react';
import { FaSyringe, FaPlus, FaList, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { procedureApi, userApi } from '../../data/services/apiService';
import type { Procedure } from '../../data/services/apiService';
import { Card, Breadcrumbs, Modal } from '../../shared/ui';
import { formatCurrency } from '../../shared/utils';
import { ProcedureEditModal } from './ProcedureEditModal';
import styles from './ProcedureListPage.module.css';

interface ProcedureListPageProps {
  onNavigate?: (view: string) => void;
}

export default function ProcedureListPage({ onNavigate }: ProcedureListPageProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Procedure | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getUserName = (username: string | undefined) => {
    if (!username) return '—';
    return usersMap[username] || username;
  };

  const loadProcedures = useCallback(async () => {
    try {
      const [procs, users] = await Promise.all([
        procedureApi.getAll(),
        userApi.getAll(),
      ]);
      setProcedures(procs);
      setUsersMap(Object.fromEntries(users.map(u => [u.username, u.nombre])));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadProcedures();
  }, [loadProcedures]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await procedureApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadProcedures();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el procedimiento');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Procedimientos' },
        ]}
        onNavigate={onNavigate}
      />
      <div className={styles.viewHeader}>
        <h3>
          <FaSyringe className={styles.headerIcon} /> Tipos de Procedimientos
        </h3>
        <p className={styles.viewDesc}>
          Gestione los procedimientos veterinarios ofrecidos por la clínica.
        </p>
      </div>

      <Card header={<h4><FaList /> Lista de Procedimientos</h4>}>
        <div className={styles.toolbar}>
          <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Nuevo Procedimiento
          </button>
        </div>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Creado por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {procedures.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No hay procedimientos registrados.
                  </td>
                </tr>
              ) : (
                procedures.map((proc, idx) => (
                  <tr key={proc.id}>
                    <td>{idx + 1}</td>
                    <td>{proc.nombre}</td>
                    <td>{proc.descripcion}</td>
                    <td>{formatCurrency(proc.precio)}</td>
                    <td>{getUserName(proc.createdBy)}</td>
                    <td>
                      <button
                        className={styles.editBtn}
                        onClick={() => setEditId(proc.id)}
                        title="Editar procedimiento"
                      >
                        Modificar
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(proc)}
                        title="Eliminar procedimiento"
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create modal */}
      {showCreateModal && (
        <ProcedureEditModal
          procedureId={null}
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => { setShowCreateModal(false); loadProcedures(); }}
        />
      )}

      {/* Edit modal */}
      <ProcedureEditModal
        procedureId={editId}
        isOpen={editId !== null}
        onClose={() => setEditId(null)}
        onSaved={() => { loadProcedures(); setEditId(null); }}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        title="Eliminar Procedimiento"
        size="sm"
      >
        <div className={styles.deleteConfirm}>
          <FaExclamationTriangle className={styles.deleteWarningIcon} />
          <p className={styles.deleteConfirmText}>
            ¿Está seguro de eliminar <strong>{deleteTarget?.nombre}</strong>?
          </p>
          <p className={styles.deleteConfirmSubtext}>
            Esta acción no se puede deshacer.
          </p>
          {deleteError && <p className={styles.deleteError}>{deleteError}</p>}
          <div className={styles.deleteActions}>
            <button
              className={styles.deleteConfirmBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </button>
            <button
              className={styles.deleteCancelBtn}
              onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
              disabled={deleting}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
