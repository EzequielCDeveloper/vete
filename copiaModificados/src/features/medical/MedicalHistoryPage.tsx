import { useState, useEffect, useCallback } from 'react';
import { FaFolderOpen, FaCalendarAlt, FaChevronDown, FaChevronUp, FaHistory, FaFilter, FaTimes } from 'react-icons/fa';
import { mockService } from '../../data/mock/mockService';
import type { MedicalRecord } from '../../shared/types';
import { Card, Badge, Breadcrumbs, SearchBox } from '../../shared/ui';
import { AppointmentDetailModal } from '../appointments/AppointmentDetailModal';
import styles from './MedicalHistoryPage.module.css';

interface MedicalHistoryPageProps {
  onNavigate?: (view: string) => void;
}

export default function MedicalHistoryPage({ onNavigate }: MedicalHistoryPageProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCitaId, setDetailCitaId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterAnimal, setFilterAnimal] = useState('');
  const [filterDueno, setFilterDueno] = useState('');
  const [filterEspecie, setFilterEspecie] = useState('');
  const [filterProcedimiento, setFilterProcedimiento] = useState('');
  const [filterHora, setFilterHora] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  const loadRecords = useCallback(() => {
    setRecords(mockService.getMedicalRecords());
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = records.filter((r) => {
    // General search
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        r.nombre.toLowerCase().includes(q) ||
        r.pacienteNombre.toLowerCase().includes(q) ||
        r.pacienteEspecie.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Advanced filters — record level
    if (filterAnimal && !r.pacienteNombre.toLowerCase().includes(filterAnimal.toLowerCase())) return false;
    if (filterEspecie && !r.pacienteEspecie.toLowerCase().includes(filterEspecie.toLowerCase())) return false;

    // Dueño — lookup patient
    if (filterDueno) {
      const propietario = getPatientPropietario(r.pacienteId).toLowerCase();
      if (!propietario.includes(filterDueno.toLowerCase())) return false;
    }

    // Citas-level filters — check if ANY cita in the record matches
    if (filterProcedimiento || filterHora || filterFecha) {
      if (r.citas.length === 0) return false;
      const hasMatchingCita = r.citas.some((c) => {
        if (filterProcedimiento && !c.procedimientoNombre.toLowerCase().includes(filterProcedimiento.toLowerCase())) return false;
        if (filterHora && !c.hora.toLowerCase().includes(filterHora.toLowerCase())) return false;
        if (filterFecha && c.fecha !== filterFecha) return false;
        return true;
      });
      if (!hasMatchingCita) return false;
    }

    return true;
  });

  const getUserName = (username: string) => {
    const user = mockService.getUsers().find((u) => u.username === username);
    return user?.nombre || username;
  };

  const getPatientPropietario = (id: string) => mockService.getPatientById(id)?.propietario || '';

  const clearAdvancedFilters = () => {
    setFilterAnimal('');
    setFilterDueno('');
    setFilterEspecie('');
    setFilterProcedimiento('');
    setFilterHora('');
    setFilterFecha('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

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
          {/* Search bar */}
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
            <Card className={styles.filtersCard}>
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
            </Card>
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
                        <FaFolderOpen className={styles.patientIcon} /> {record.nombre}
                      </h4>
              <Badge variant="info">{record.pacienteNombre}</Badge>
                  <Badge variant="info">{record.pacienteEspecie}</Badge>
                    </div>
                    <div className={styles.recordMeta}>
                      <span className={styles.metaItem}>
                        {record.citas.length} cita{record.citas.length !== 1 ? 's' : ''}
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

                  {expandedId === record.id && (
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
