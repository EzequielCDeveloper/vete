import { useState, useEffect, useCallback } from 'react';
import { FaCalendarCheck, FaFilter, FaTimes, FaHistory } from 'react-icons/fa';
import { appointmentApi, patientApi, procedureApi, userApi, medicalRecordApi } from '../../data/services/apiService';
import type { Appointment, Patient, Procedure } from '../../data/services/apiService';
import { Card, Badge, SearchBox, Breadcrumbs, Modal, FormSuccess } from '../../shared/ui';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import styles from './AppointmentListPage.module.css';

interface AppointmentListPageProps {
  onNavigate?: (view: string) => void;
}

export default function AppointmentListPage({ onNavigate }: AppointmentListPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, Patient>>({});
  const [proceduresMap, setProceduresMap] = useState<Record<string, Procedure>>({});
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  // Advanced filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterAnimal, setFilterAnimal] = useState('');
  const [filterDueno, setFilterDueno] = useState('');
  const [filterEspecie, setFilterEspecie] = useState('');
  const [filterProcedimiento, setFilterProcedimiento] = useState('');
  const [filterHora, setFilterHora] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  // Cancel confirmation state
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  // Save to history modal state
  const [historyModalId, setHistoryModalId] = useState<string | null>(null);
  const [historyNotas, setHistoryNotas] = useState('');
  const [historySuccess, setHistorySuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [apts, pats, procs, users] = await Promise.all([
        appointmentApi.getAll(),
        patientApi.getAll(),
        procedureApi.getAll(),
        userApi.getAll(),
      ]);
      setAppointments(apts);
      setPatientsMap(Object.fromEntries(pats.map(p => [p.id, p])));
      setProceduresMap(Object.fromEntries(procs.map(p => [p.id, p])));
      setUsersMap(Object.fromEntries(users.map(u => [u.username, u.nombre])));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lookup helpers
  const getPatientName = (id: string) => patientsMap[id]?.nombre || '—';
  const getPatientEspecie = (id: string) => patientsMap[id]?.especie || '—';
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

  // Filter logic — AND across all active filters
  const filtered = appointments.filter((apt) => {
    if (statusFilter && apt.estado !== statusFilter) return false;
    if (filterFecha && apt.fecha !== filterFecha) return false;
    if (filterHora && !apt.hora.toLowerCase().includes(filterHora.toLowerCase())) return false;

    if (search) {
      const q = search.toLowerCase();
      const patientName = getPatientName(apt.pacienteId).toLowerCase();
      const procedureName = getProcedureName(apt.procedimientoId).toLowerCase();
      if (!patientName.includes(q) && !procedureName.includes(q)) return false;
    }

    const patientName = getPatientName(apt.pacienteId).toLowerCase();
    const patientDueno = getPatientPropietario(apt.pacienteId).toLowerCase();
    const patientEspecie = getPatientEspecie(apt.pacienteId).toLowerCase();
    const procedureName = getProcedureName(apt.procedimientoId).toLowerCase();

    if (filterAnimal && !patientName.includes(filterAnimal.toLowerCase())) return false;
    if (filterDueno && !patientDueno.includes(filterDueno.toLowerCase())) return false;
    if (filterEspecie && !patientEspecie.includes(filterEspecie.toLowerCase())) return false;
    if (filterProcedimiento && !procedureName.includes(filterProcedimiento.toLowerCase())) return false;

    return true;
  });

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

  const clearAdvancedFilters = () => {
    setFilterAnimal('');
    setFilterDueno('');
    setFilterEspecie('');
    setFilterProcedimiento('');
    setFilterHora('');
    setFilterFecha('');
  };

  const handleSaveToHistory = async () => {
    if (!historyModalId) return;
    try {
      await medicalRecordApi.create({ citaId: historyModalId, notas: historyNotas || undefined });
      setHistorySuccess('Cita guardada en el historial médico correctamente.');
      setTimeout(() => {
        setHistoryModalId(null);
        setHistorySuccess(null);
      }, 1500);
    } catch {
      setHistorySuccess(null);
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Gestión de Citas' },
        ]}
        onNavigate={onNavigate}
      />
      <div className={styles.viewHeader}>
        <h3>
          <FaCalendarCheck className={styles.headerIcon} /> Gestión de Citas
        </h3>
        <p className={styles.viewDesc}>Administre todas las citas registradas.</p>
      </div>

      <Card>
        <div className={styles.toolbar}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Buscar por paciente o procedimiento..."
          />
          <div className={styles.filterGroup}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <button
            className={`${styles.filterToggle} ${showAdvancedFilters ? styles.filterToggleActive : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <FaFilter /> Filtros avanzados
          </button>
        </div>

        {showAdvancedFilters && (
          <div className={styles.advancedFilters}>
            <div className={styles.filterRow}>
              <div className={styles.filterField}>
                <label>Animal</label>
                <input
                  type="text"
                  value={filterAnimal}
                  onChange={(e) => setFilterAnimal(e.target.value)}
                  placeholder="Nombre del paciente"
                />
              </div>
              <div className={styles.filterField}>
                <label>Dueño</label>
                <input
                  type="text"
                  value={filterDueno}
                  onChange={(e) => setFilterDueno(e.target.value)}
                  placeholder="Nombre del propietario"
                />
              </div>
              <div className={styles.filterField}>
                <label>Especie</label>
                <input
                  type="text"
                  value={filterEspecie}
                  onChange={(e) => setFilterEspecie(e.target.value)}
                  placeholder="Canino, Felino..."
                />
              </div>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.filterField}>
                <label>Procedimiento</label>
                <input
                  type="text"
                  value={filterProcedimiento}
                  onChange={(e) => setFilterProcedimiento(e.target.value)}
                  placeholder="Nombre del procedimiento"
                />
              </div>
              <div className={styles.filterField}>
                <label>Hora</label>
                <input
                  type="text"
                  value={filterHora}
                  onChange={(e) => setFilterHora(e.target.value)}
                  placeholder="ej: 10:00"
                />
              </div>
              <div className={styles.filterField}>
                <label>Fecha</label>
                <input
                  type="date"
                  value={filterFecha}
                  onChange={(e) => setFilterFecha(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.filterActions}>
              <button className={styles.clearFilters} onClick={clearAdvancedFilters}>
                <FaTimes /> Limpiar filtros
              </button>
            </div>
          </div>
        )}

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Paciente</th>
                <th>Propietario</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Procedimiento</th>
                <th>Estado</th>
                <th>Creada por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    No hay citas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((apt, idx) => (
                  <tr key={apt.id}>
                    <td>{idx + 1}</td>
                    <td>{getPatientName(apt.pacienteId)}</td>
                    <td>{getPatientPropietario(apt.pacienteId)}</td>
                    <td>{apt.fecha}</td>
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
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setHistoryModalId(apt.id);
                            setHistoryNotas('');
                            setHistorySuccess(null);
                          }}
                        >
                          <FaHistory /> Historial
                        </button>
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

      {/* Save to History Modal */}
      <Modal
        isOpen={historyModalId !== null}
        onClose={() => { setHistoryModalId(null); setHistorySuccess(null); }}
        title="Guardar en Historial Médico"
        size="md"
      >
        {historySuccess ? (
          <FormSuccess message={historySuccess} />
        ) : (
          <div>
            <p className={styles.historyInfo}>
              Guardando cita para: <strong>{historyModalId ? getPatientName(appointments.find(a => a.id === historyModalId)?.pacienteId || '') : ''}</strong>
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notas para el historial médico</label>
              <textarea
                className={styles.historyTextarea}
                rows={4}
                value={historyNotas}
                onChange={(e) => setHistoryNotas(e.target.value)}
                placeholder="Ingrese diagnóstico, tratamiento, observaciones clínicas..."
              />
            </div>
            <div className={styles.formActions}>
              <button className={styles.btnPrimary} onClick={handleSaveToHistory}>
                <FaHistory /> Guardar en Historial
              </button>
              <button className={styles.btnSecondary} onClick={() => { setHistoryModalId(null); setHistorySuccess(null); }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
