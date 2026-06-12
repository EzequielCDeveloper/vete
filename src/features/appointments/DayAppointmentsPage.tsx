import { useState, useEffect, useCallback } from 'react';
import { FaCalendarDay, FaArrowLeft } from 'react-icons/fa';
import { appointmentApi, patientApi, procedureApi, userApi } from '../../data/services/apiService';
import type { Appointment, Patient, Procedure } from '../../data/services/apiService';
import { Card, Badge, Breadcrumbs, Modal } from '../../shared/ui';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import styles from './DayAppointmentsPage.module.css';

interface DayAppointmentsPageProps {
  date: string;
  onNavigate?: (view: string) => void;
}

function formatDateTitle(date: string): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DayAppointmentsPage({ date, onNavigate }: DayAppointmentsPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, Patient>>({});
  const [proceduresMap, setProceduresMap] = useState<Record<string, Procedure>>({});
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!date) return;
    try {
      const [apts, pats, procs, users] = await Promise.all([
        appointmentApi.getAll(),
        patientApi.getAll(),
        procedureApi.getAll(),
        userApi.getAll(),
      ]);
      setAppointments(apts.filter((a) => a.fecha === date));
      setPatientsMap(Object.fromEntries(pats.map(p => [p.id, p])));
      setProceduresMap(Object.fromEntries(procs.map(p => [p.id, p])));
      setUsersMap(Object.fromEntries(users.map(u => [u.username, u.nombre])));
    } catch {
      // silent
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPatientName = (id: string) => patientsMap[id]?.nombre || '—';
  const getPatientPropietario = (id: string) => patientsMap[id]?.propietario || '—';
  const getProcedureName = (id: string) => proceduresMap[id]?.nombre || '—';
  const getUserName = (username: string) => usersMap[username] || username;

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'success';
      case 'Completada': return 'info';
      case 'Cancelada': return 'danger';
      default: return 'info';
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentApi.complete(id);
      await loadData();
    } catch {
      // silent
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await appointmentApi.cancel(id);
      await loadData();
    } catch {
      // silent
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Buscar Cita', view: 'gestion-citas' },
          { label: formatDateTitle(date) },
        ]}
        onNavigate={onNavigate}
      />

      <div className={styles.viewHeader}>
        <button className={styles.backBtn} onClick={() => onNavigate?.('gestion-citas')}>
          <FaArrowLeft /> Volver
        </button>
        <h3>
          <FaCalendarDay className={styles.headerIcon} /> Citas del Día
        </h3>
        <p className={styles.viewDesc}>{formatDateTitle(date)}</p>
      </div>

      <Card>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Paciente</th>
                <th>Propietario</th>
                <th>Hora</th>
                <th>Procedimiento</th>
                <th>Estado</th>
                <th>Creada por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    No hay citas para esta fecha.
                  </td>
                </tr>
              ) : (
                appointments.map((apt, idx) => (
                  <tr key={apt.id}>
                    <td>{idx + 1}</td>
                    <td>{getPatientName(apt.pacienteId)}</td>
                    <td>{getPatientPropietario(apt.pacienteId)}</td>
                    <td>{apt.hora}</td>
                    <td>{getProcedureName(apt.procedimientoId)}</td>
                    <td>
                      <Badge variant={getEstadoBadgeVariant(apt.estado)}>
                        {apt.estado}
                      </Badge>
                    </td>
                    <td>{getUserName(apt.creadaPor)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setDetailId(apt.id)}
                        >
                          Ver Detalles
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setDetailId(apt.id)}
                        >
                          Editar
                        </button>
                        {apt.estado === 'Activo' && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.actionComplete}`}
                              onClick={() => handleComplete(apt.id)}
                            >
                              Completar
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionCancel}`}
                              onClick={() => setCancelConfirmId(apt.id)}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelConfirmId !== null}
        onClose={() => setCancelConfirmId(null)}
        title="Cancelar Cita"
        size="sm"
      >
        <p className={styles.confirmText}>¿Está seguro de cancelar esta cita?</p>
        <p className={styles.confirmSubtext}>La cita se marcará como cancelada y ya no aparecerá en las citas activas.</p>
        <div className={styles.confirmActions}>
          <button
            className={`${styles.actionBtn} ${styles.actionCancel}`}
            onClick={() => {
              if (cancelConfirmId) handleCancel(cancelConfirmId);
              setCancelConfirmId(null);
            }}
          >
            Sí, Cancelar Cita
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => setCancelConfirmId(null)}
          >
            No, Mantener
          </button>
        </div>
      </Modal>

      <AppointmentDetailModal
        appointmentId={detailId}
        onClose={() => setDetailId(null)}
        onSaved={loadData}
      />
    </div>
  );
}
