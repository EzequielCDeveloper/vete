import { useState, useEffect } from 'react';
import { FaChartPie, FaCalendarCheck, FaCheckCircle, FaClock, FaUsers, FaList } from 'react-icons/fa';
import { appointmentApi, patientApi, procedureApi } from '../../data/services/apiService';
import type { Appointment, Patient, Procedure } from '../../data/services/apiService';
import { sanitizeDate } from '../../shared/utils';
import { Card, StatCard, Badge, Breadcrumbs } from '../../shared/ui';
import { WeekCalendar } from './WeekCalendar';
import styles from './DashboardPage.module.css';

interface DashboardPageProps {
  onNavigate?: (view: string) => void;
  onSelectDay?: (date: string) => void;
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getEstadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'Activo': return 'success';
    case 'Completada': return 'info';
    case 'Cancelada': return 'danger';
    default: return 'info';
  }
}

export default function DashboardPage({ onNavigate, onSelectDay }: DashboardPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, Patient>>({});
  const [proceduresMap, setProceduresMap] = useState<Record<string, Procedure>>({});
  const today = getTodayISO();

  const handleSelectDay = (date: string) => {
    onSelectDay?.(date);
  };

  useEffect(() => {
    Promise.all([
      appointmentApi.getAll(),
      patientApi.getAll(),
      procedureApi.getAll(),
    ]).then(([apts, pats, procs]) => {
      setAppointments(apts);
      setPatientsMap(Object.fromEntries(pats.map(p => [p.id, p])));
      setProceduresMap(Object.fromEntries(procs.map(p => [p.id, p])));
    }).catch(() => {});
  }, []);

  const todayAppointments = appointments.filter((a) => sanitizeDate(a.fecha) === today && a.estado !== 'Cancelada');
  const totalHoy = todayAppointments.length;
  const activas = todayAppointments.filter((a) => a.estado === 'Activo').length;
  const pendientes = appointments.filter((a) => a.estado === 'Activo').length;
  const uniquePatients = new Set(todayAppointments.map((a) => a.pacienteId)).size;

  return (
    <div>
      <Breadcrumbs
        items={[{ label: 'Inicio' }]}
        onNavigate={onNavigate}
      />
      <div className={styles.viewHeader}>
        <h3>
          <FaChartPie className={styles.headerIcon} /> Resumen del Día
        </h3>
        <p className={styles.viewDesc}>Vista general de citas y actividad del día.</p>
      </div>

      <WeekCalendar onSelectDay={handleSelectDay} />

      <div className={styles.statsGrid}>
        <StatCard
          icon={<FaCalendarCheck />}
          value={totalHoy}
          label="Total Citas Hoy"
          variant="primary"
        />
        <StatCard
          icon={<FaCheckCircle />}
          value={activas}
          label="Activas"
          variant="success"
        />
        <StatCard
          icon={<FaClock />}
          value={pendientes}
          label="Pendientes"
          variant="warning"
        />
        <StatCard
          icon={<FaUsers />}
          value={uniquePatients}
          label="Pacientes"
          variant="info"
        />
      </div>

      <Card header={<h4><FaList /> Citas del Día</h4>}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Especie</th>
                <th>Propietario</th>
                <th>Procedimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No hay citas para hoy.
                  </td>
                </tr>
              ) : (
                todayAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>{apt.hora}</td>
                    <td>{patientsMap[apt.pacienteId]?.nombre || '—'}</td>
                    <td>{patientsMap[apt.pacienteId]?.especie || '—'}</td>
                    <td>{patientsMap[apt.pacienteId]?.propietario || '—'}</td>
                    <td>{proceduresMap[apt.procedimientoId]?.nombre || '—'}</td>
                    <td>
                      <Badge variant={getEstadoBadgeVariant(apt.estado)}>
                        {apt.estado}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
