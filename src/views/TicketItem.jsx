/**
 * VIEW — TicketItem
 * Responsabilidad: Renderizar una tarjeta individual de ticket.
 * Importa verificarSLA del MODEL directamente (es una función pura, sin React).
 */
import { verificarSLA, calcularTiempoAbierto } from '../models/SLAService';

export default function TicketItem({ ticket, rol, onCambiarEstado, onAbrirModal, slaMatrix }) {
  const sla = verificarSLA(ticket, slaMatrix);
  const incumplioSLA = sla.incumplio;
  const claseEstado = ticket.estado.replace(' ', '-');

  // Determinar color de SLA
  let colorSla = 'inherit';
  if (sla.estadoVisual === 'breached') colorSla = 'var(--danger)';
  else if (sla.estadoVisual === 'warning') colorSla = 'var(--warning)';

  return (
    <div className={`ticket-item${incumplioSLA ? ' sla-vencido' : ''}`} style={sla.estadoVisual === 'warning' ? { borderLeft: '4px solid var(--warning)' } : {}}>
      {/* Header del ticket */}
      <div className="ticket-header">
        <div className="ticket-header-left">
          <span className="ticket-id">{ticket.id}</span>
          <span className={`badge badge-estado estado-${claseEstado}`}>
            {ticket.estado}
          </span>
          {incumplioSLA && (
            <span className="sla-badge">⚠️ SLA VENCIDO</span>
          )}
          {sla.estadoVisual === 'warning' && !incumplioSLA && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
              ⏳ SLA en Riesgo
            </span>
          )}
        </div>
        <span className={`badge badge-${ticket.tipo}`}>{ticket.tipo}</span>
      </div>

      {/* Asunto */}
      <div className="ticket-asunto">{ticket.asunto}</div>

      {/* Meta */}
      <div className="ticket-meta">
        <span className="meta-item">🎯 <strong>{ticket.prioridad}</strong></span>
        <span className="meta-item">📁 {ticket.categoria || 'General'} &gt; {ticket.subcategoria || 'Otros'}</span>
        <span className="meta-item">👤 {ticket.tecnico}</span>
        {ticket.activo && ticket.activo !== 'Ninguno' && (
          <span className="meta-item">💻 {ticket.activo}</span>
        )}
        <span className="meta-item">📅 {ticket.fecha}</span>
        <span className="meta-item" style={{ color: colorSla, fontWeight: sla.estadoVisual !== 'ok' ? 'bold' : 'normal' }}>
          ⏱️ {calcularTiempoAbierto(ticket)}
        </span>
      </div>

      {/* Acciones */}
      <div className="ticket-actions">
        {/* Selector de estado (solo para técnico o admin) */}
        {(rol === 'tecnico' || rol === 'admin') ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estado:</label>
            <select
              className="select-estado"
              value={ticket.estado}
              onChange={(e) => onCambiarEstado(ticket.id, e.target.value)}
            >
              <option value="Abierto">Abierto</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Vista de lectura
          </span>
        )}
        <button
          className="btn-small"
          onClick={() => onAbrirModal(ticket.id)}
        >
          Ver Detalles →
        </button>
      </div>
    </div>
  );
}
