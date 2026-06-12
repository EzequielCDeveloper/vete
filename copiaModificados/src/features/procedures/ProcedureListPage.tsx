import { useState, useEffect, useCallback } from 'react';
import { FaSyringe, FaPlus, FaList } from 'react-icons/fa';
import { mockService } from '../../data/mock/mockService';
import type { Procedure } from '../../shared/types';
import { Card, Breadcrumbs } from '../../shared/ui';
import { formatCurrency } from '../../shared/utils';
import { ProcedureEditModal } from './ProcedureEditModal';
import styles from './ProcedureListPage.module.css';

interface ProcedureListPageProps {
  onNavigate?: (view: string) => void;
}

export default function ProcedureListPage({ onNavigate }: ProcedureListPageProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getUserName = (username: string | undefined) => {
    if (!username) return '—';
    const user = mockService.getUsers().find((u) => u.username === username);
    return user?.nombre || username;
  };

  const loadProcedures = useCallback(() => {
    setProcedures(mockService.getProcedures());
  }, []);

  useEffect(() => {
    loadProcedures();
  }, [loadProcedures]);

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
    </div>
  );
}
