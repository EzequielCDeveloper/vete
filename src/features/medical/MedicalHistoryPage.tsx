import { useState, useEffect, useCallback } from 'react';
import { FaFolderOpen, FaCalendarAlt, FaChevronDown, FaChevronUp, FaHistory, FaFilter, FaTimes } from 'react-icons/fa';
import { medicalRecordApi, userApi } from '../../data/services/apiService';
import type { MedicalRecord } from '../../data/services/apiService';
import { Card, Badge, Breadcrumbs, SearchBox } from '../../shared/ui';
import { AppointmentDetailModal } from '../appointments/AppointmentDetailModal';
import styles from './MedicalHistoryPage.module.css';

interface MedicalHistoryPageProps {
  onNavigate?: (view: string) => void;
}

export default function MedicalHistoryPage({ onNavigate }: MedicalHistoryPageProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCitaId, setDetailCitaId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Advanced filter state (no dueño filter — medical records don't have propietario info)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterAnimal, setFilterAnimal] = useState('');
  const [filterEspecie, setFilterEspecie] = useState('');
  const [filterProcedimiento, setFilterProcedimiento] = useState('');
  const [filterHora, setFilterHora] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  const loadRecords = useCallback(async () => {
    try {
      const [recs, users] = await Promise.all([
        medicalRecordApi.getAll(),
        userApi.getAll(),
      ]);
      setRecords(recs);
      setUsersMap(Object.fromEntries(users.map(u => [u.username, u.nombre])));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getUserName = (username: string) => usersMap[username] || username;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const clearAdvancedFilters = () => {
    setFilterAnimal('');
    setFilterEspecie('');
    setFilterProcedimiento('');
    setFilterHora('');
    setFilterFecha('');
  };

  // Filter logic — AND across all active filters
  const filteredRecords = records.filter((r) => {
    // Basic search
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        (r.nombre || '').toLowerCase().includes(q) ||
        r.pacienteNombre.toLowerCase().includes(q) ||
        r.pacienteEspecie.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Advanced filters
    if (filterAnimal && !r.pacienteNombre.toLowerCase().includes(filterAnimal.toLowerCase())) return false;
    if (filterEspecie && !r.pacienteEspecie.toLowerCase().includes(filterEspecie.toLowerCase())) return false;
    if (filterFecha && !r.fechaCreacion.startsWith(filterFecha)) return false;

    // Procedimiento filter — check citas array
    if (filterProcedimiento && r.citas) {
      const hasProcedure = r.citas.some(c =>
        c.procedimientoNombre.toLowerCase().includes(filterProcedimiento.toLowerCase())
      );
      if (!hasProcedure) return false;
    }

    // Hora filter — check citas array
    if (filterHora && r.citas) {
      const hasHora = r.citas.some(c =>
        c.hora.toLowerCase().includes(filterHora.toLowerCase())
      );
      if (!hasHora) return false;
    }

    return true;
  });

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Inicio', view: 'dashboard' },
          { label: 'Historial Médico' },
        ]}
        onNavigate={onNavigate}
      />

      <div className={styles.viewHeader}>
        <h3>
          <FaFolderOpen className={styles.headerIcon} /> Historial Médico
        </h3>
        <p className={styles.viewDesc}>
          Expedientes digitales con el historial clínico de los pacientes.
        </p>
      </div>

      {records.length === 0 ? (
        <Card>
          <div className={styles.emptyState}>
            <FaHistory className={styles.emptyIcon} />
            <h4>No hay historiales médicos</h4>
            <p>Aún no se ha guardado ninguna cita en el historial médico.</p>
            <p className={styles.emptyHint}>
              Para guardar una cita en el historial, use el botón "Guardar en Historial"
              desde la gestión de citas o active la opción al registrar una nueva cita.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Search + Filter toolbar */}
          <div className={styles.searchSection}>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Buscar por paciente, especie..."
            />
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
                  <label>Especie</label>
                  <input
                    type="text"
                    value={filterEspecie}
                    onChange={(e) => setFilterEspecie(e.target.value)}
                    placeholder="Canino, Felino..."
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
              </div>
              <div className={styles.filterActions}>
                <button className={styles.clearFilters} onClick={clearAdvancedFilters}>
                  <FaTimes /> Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {filteredRecords.length === 0 ? (
            <p className={styles.noResults}>No se encontraron historiales.</p>
          ) : (
            <div className={styles.recordsGrid}>
              {filteredRecords.map((record) => (
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
                      <span className={styles.metaItem}>Creado: {record.fechaCreacion}</span>
                      <span className={styles.metaDivider}>|</span>
                      <span className={styles.metaItem}>Creado por: {getUserName(record.createdBy)}</span>
                      {record.ultimaActualizacion !== record.fechaCreacion && (
                        <>
                          <span className={styles.metaDivider}>|</span>
                          <span className={styles.metaItem}>Actualizado: {record.ultimaActualizacion}</span>
                        </>
                      )}
                    </div>
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
                                <td>{cita.fecha}</td>
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
        </>
      )}

      <AppointmentDetailModal
        appointmentId={detailCitaId}
        onClose={() => setDetailCitaId(null)}
        onSaved={loadRecords}
      />
    </div>
  );
}
