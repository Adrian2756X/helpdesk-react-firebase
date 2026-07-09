/**
 * VIEW — TicketDirectory
 * Responsabilidad: Renderizar la barra de filtros y la lista de tickets.
 * Recibe ticketsFiltrados ya procesados del Controller (useFilterController).
 * El useMemo ya no vive aquí — vive en el Controller.
 */
import { useState } from 'react';
import { useSettingsController } from '../controllers/useSettingsController';
import TicketItem from './TicketItem';
import TicketKanban from './TicketKanban';

const TECNICOS = [
  'Todos',
  'Sin asignar',
  'Alejandro Osorio',
  'Giovanna Hernandez',
  'Katia Hernandez',
  'Hugo',
];

export default function TicketDirectory({
  rol,
  ticketsFiltrados,
  filtros,
  onActualizarFiltro,
  onToggleOrden,
  onCambiarEstado,
  onAbrirModal,
  onExportarCSV,
}) {
  const { settings } = useSettingsController();
  const slaMatrix = settings?.slaMatrix;
  
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'kanban'

  return (
    <section className="list-col">
      <div className="card">
        {/* Header de sección */}
        <div className="section-header">
          <div
            className="card-title"
            style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}
          >
            <span className="card-title-icon">📁</span>
            Directorio de Tickets
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Toggle de vistas */}
            <div className="view-toggle">
              <button 
                className={`btn-small ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista de Lista"
              >
                🗂️ Lista
              </button>
              <button 
                className={`btn-small ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Vista Kanban"
              >
                📋 Kanban
              </button>
            </div>

            {(rol === 'tecnico' || rol === 'admin') && (
              <button id="btnExportar" className="btn-secondary" onClick={onExportarCSV}>
                📥 Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="buscarAsunto"
              type="text"
              className="search-input"
              placeholder="Buscar por ID o asunto..."
              value={filtros.busqueda}
              onChange={(e) => onActualizarFiltro('busqueda', e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              id="filtroEstado"
              className="form-select"
              style={{ width: 'auto', flex: 1 }}
              value={filtros.estado}
              onChange={(e) => onActualizarFiltro('estado', e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Abierto">Abiertos</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Resuelto">Resueltos</option>
            </select>

            {(rol === 'tecnico' || rol === 'admin') && (
              <select
                id="filtroTecnico"
                className="form-select"
                style={{ width: 'auto', flex: 1 }}
                value={filtros.tecnico}
                onChange={(e) => onActualizarFiltro('tecnico', e.target.value)}
              >
                {TECNICOS.map((t) => (
                  <option key={t} value={t}>
                    {t === 'Todos' ? 'Todos los técnicos' : t}
                  </option>
                ))}
              </select>
            )}

            <button
              id="btnOrdenar"
              className={`btn-secondary${filtros.orden === 'prioridad' ? ' active' : ''}`}
              onClick={onToggleOrden}
            >
              {filtros.orden === 'recientes' ? '🕐 Más Recientes' : '🔥 Por Prioridad'}
            </button>
          </div>
        </div>

        {/* Contenido (Lista o Kanban) */}
        {viewMode === 'list' ? (
          <div className="ticket-list">
            {ticketsFiltrados.length === 0 ? (
              <div className="ticket-empty">
                <div className="ticket-empty-icon">🎉</div>
                <p>No se encontraron tickets.</p>
              </div>
            ) : (
              ticketsFiltrados.map((ticket) => (
                <TicketItem
                  key={ticket.id}
                  ticket={ticket}
                  rol={rol}
                  onCambiarEstado={onCambiarEstado}
                  onAbrirModal={onAbrirModal}
                  slaMatrix={slaMatrix}
                />
              ))
            )}
          </div>
        ) : (
          <TicketKanban
            tickets={ticketsFiltrados}
            rol={rol}
            onCambiarEstado={onCambiarEstado}
            onAbrirModal={onAbrirModal}
            slaMatrix={slaMatrix}
          />
        )}
      </div>
    </section>
  );
}
