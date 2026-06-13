import { useState, useEffect, useCallback } from 'react';
import { FaFolderOpen, FaCalendarAlt, FaChevronDown, FaChevronUp, FaHistory, FaArchive, FaUndo } from 'react-icons/fa';
import { medicalRecordApi, userApi } from '../../data/services/apiService';
import type { MedicalRecord } from '../../data/services/apiService';
import { sanitizeDate } from '../../shared/utils';
import { Card, Badge, Breadcrumbs, FormError } from '../../shared/ui';
import { AppointmentDetailModal } from '../appointments/AppointmentDetailModal';
import styles from './ArchivedHistoryPage.module.css';

interface ArchivedHistoryPageProps {
  onNavigate?: (view: string) => void;
}

export default function ArchivedHistoryPage({ onNavigate }: ArchivedHistoryPageProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCitaId, setDetailCitaId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoadError(null);
    try {
      const [recs, users] = await Promise.all([
        medicalRecordApi.getArchived(),
        userApi.getAll(),
      ]);
      setRecords(recs);
      setUsersMap(Object.fromEntries(users.map(u => [u.username, u.nombre])));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar los historiales archivados');
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getUserName = (username: string) => usersMap[username] || username;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleUnarchive = async (id: string) => {
    setUnarchivingId(id);
    try {
      await medicalRecordApi.unarchive(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // silent
    } finally {
      setUnarchivingId(null);
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Historial Médico', view: 'historial-medico' },
          { label: 'Archivados' },
        ]}
        onNavigate={onNavigate}
      />

      <div className={styles.viewHeader}>
        <h3>
          <FaArchive className={styles.headerIcon} /> Historiales Archivados
        </h3>
        <p className={styles.viewDesc}>
          Historiales médicos que han sido archivados. Puede restaurarlos para que vuelvan a la lista principal.
        </p>
        <button
          className={styles.backBtn}
          onClick={() => onNavigate?.('historial-medico')}
          type="button"
        >
          <FaHistory /> Volver a Historial Médico
        </button>
      </div>

      {loadError && <FormError message={loadError} />}

      {records.length === 0 ? (
        <Card>
          <div className={styles.emptyState}>
            <FaArchive className={styles.emptyIcon} />
            <h4>No hay historiales archivados</h4>
            <p>No se ha archivado ningún historial médico todavía.</p>
            <p className={styles.emptyHint}>
              Para archivar un historial, use el botón "Archivar" desde la lista principal de historiales.
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.recordsGrid}>
          {records.map((record) => (
            <Card key={record.id} className={styles.recordCard}>
              <div className={styles.recordHeader} onClick={() => toggleExpand(record.id)}>
                <div className={styles.recordInfo}>
                  <h4 className={styles.patientName}>
                    <FaFolderOpen className={styles.patientIcon} /> {record.nombre || record.pacienteNombre}
                  </h4>
                  <Badge variant="info">{record.pacienteNombre}</Badge>
                  <Badge variant="info">{record.pacienteEspecie}</Badge>
                </div>
                <div className={styles.recordMeta}>
                  <span className={styles.metaItem}>
                    {record.citas?.length || 0} cita{(record.citas?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.metaDivider}>|</span>
                  <span className={styles.metaItem}>Creado: {sanitizeDate(record.fechaCreacion)}</span>
                  <span className={styles.metaDivider}>|</span>
                  <span className={styles.metaItem}>Creado por: {getUserName(record.createdBy)}</span>
                  {record.ultimaActualizacion !== record.fechaCreacion && (
                    <>
                      <span className={styles.metaDivider}>|</span>
                      <span className={styles.metaItem}>Actualizado: {sanitizeDate(record.ultimaActualizacion)}</span>
                    </>
                  )}
                </div>
                <button
                  className={styles.unarchiveBtn}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleUnarchive(record.id); }}
                  disabled={unarchivingId === record.id}
                  title="Restaurar historial"
                >
                  <FaUndo /> {unarchivingId === record.id ? 'Restaurando...' : 'Restaurar'}
                </button>
                <button className={styles.expandBtn} type="button">
                  {expandedId === record.id ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {expandedId === record.id && (record.citas?.length || 0) > 0 && (
                <div className={styles.citasList}>
                  <h5 className={styles.citasTitle}>
                    <FaCalendarAlt /> Citas guardadas
                  </h5>
                  <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Procedimiento</th>
                          <th>Notas</th>
                          <th>Historial Médico</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.citas.map((cita) => (
                          <tr key={cita.citaId}>
                            <td>{sanitizeDate(cita.fecha)}</td>
                            <td>{cita.hora}</td>
                            <td>{cita.procedimientoNombre}</td>
                            <td>{cita.notas || '—'}</td>
                            <td>{cita.historialMedico || '—'}</td>
                            <td>
                              <button className={styles.actionBtn} onClick={() => setDetailCitaId(cita.citaId)}>
                                Ver Detalles
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <AppointmentDetailModal
        appointmentId={detailCitaId}
        onClose={() => setDetailCitaId(null)}
        onSaved={loadRecords}
      />
    </div>
  );
}
