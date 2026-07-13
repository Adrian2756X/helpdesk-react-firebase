/**
 * VIEW — TicketItem
 * Responsabilidad: Renderizar una tarjeta individual de ticket.
 * Importa verificarSLA del MODEL directamente (es una función pura, sin React).
 */
import { verificarSLA, calcularTiempoAbierto } from '../models/SLAService';
import { AlertTriangle, Clock, Target, Folder, User, Monitor, Calendar } from 'lucide-react';


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
            <span className="sla-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={12} /> SLA VENCIDO</span>
          )}
          {sla.estadoVisual === 'warning' && !incumplioSLA && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={12} /> SLA en Riesgo
            </span>
          )}
        </div>
        <span className={`badge badge-${ticket.tipo}`}>{ticket.tipo}</span>
      </div>

      {/* Asunto */}
      <div className="ticket-asunto">{ticket.asunto}</div>

      {/* Meta */}
      <div className="ticket-meta">
        <span className="meta-item"><Target size={12} /> <strong>{ticket.prioridad}</strong></span>
        <span className="meta-item"><Folder size={12} /> {ticket.categoria || 'General'} &gt; {ticket.subcategoria || 'Otros'}</span>
        <span className="meta-item"><User size={12} /> {ticket.tecnico}</span>
        {ticket.activo && ticket.activo !== 'Ninguno' && (
          <span className="meta-item"><Monitor size={12} /> {ticket.activo}</span>
        )}
        <span className="meta-item"><Calendar size={12} /> {ticket.fecha}</span>
        <span className="meta-item" style={{ color: colorSla, fontWeight: sla.estadoVisual !== 'ok' ? 'bold' : 'normal' }}>
          <Clock size={12} /> {calcularTiempoAbierto(ticket)}
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
