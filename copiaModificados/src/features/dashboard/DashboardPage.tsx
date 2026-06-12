import { useState, useEffect } from 'react';
import { FaChartPie, FaCalendarCheck, FaCheckCircle, FaClock, FaUsers, FaList } from 'react-icons/fa';
import { mockService } from '../../data/mock/mockService';
import type { Appointment } from '../../shared/types';
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
  const today = getTodayISO();

  const handleSelectDay = (date: string) => {
    onSelectDay?.(date);
  };

  useEffect(() => {
    const all = mockService.getAppointments();
    setAppointments(all);
  }, []);

  const todayAppointments = appointments.filter((a) => a.fecha === today && a.estado !== 'Cancelada');
  const totalHoy = todayAppointments.length;
  const activas = todayAppointments.filter((a) => a.estado === 'Activo').length;
  const pendientes = appointments.filter((a) => a.estado === 'Activo').length;

  // Unique patients across today's appointments
  const uniquePatients = new Set(todayAppointments.map((a) => a.pacienteId)).size;

  // Lookup helpers
  const getPatientName = (id: string) => {
    const p = mockService.getPatientById(id);
    return p?.nombre || '—';
  };
  const getPatientEspecie = (id: string) => {
    const p = mockService.getPatientById(id);
    return p?.especie || '—';
  };
  const getPatientPropietario = (id: string) => {
    const p = mockService.getPatientById(id);
    return p?.propietario || '—';
  };
  const getProcedureName = (id: string) => {
    const p = mockService.getProcedureById(id);
    return p?.nombre || '—';
  };

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
                    <td>{getPatientName(apt.pacienteId)}</td>
                    <td>{getPatientEspecie(apt.pacienteId)}</td>
                    <td>{getPatientPropietario(apt.pacienteId)}</td>
                    <td>{getProcedureName(apt.procedimientoId)}</td>
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
