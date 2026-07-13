/**
 * VIEW — TicketModal
 * Responsabilidad: Renderizar el modal de detalles de un ticket.
 * Estado local permitido para el input de comentario (UI state).
 * Delega la persistencia al Controller vía prop onAgregarComentario.
 */
import { useState, useRef, useEffect } from 'react';
import { calcularTiempoAbierto, verificarSLA } from '../models/SLAService';
import { X, Target, Folder, User, Monitor, Calendar, Clock, Paperclip, Settings as SettingsIcon, RotateCcw, MessageSquare, Star } from 'lucide-react';


const TECNICOS = [
  'Sin asignar',
  'Alejandro Osorio',
  'Giovanna Hernandez',
  'Katia Hernandez',
  'Hugo',
];

const PLANTILLAS = [
  "Por favor, reinicia tu equipo e intenta de nuevo.",
  "Se ha restablecido tu contraseña a la original.",
  "Hemos escalado tu caso al nivel 2.",
  "¿Podrías adjuntar una captura del error?"
];

export default function TicketModal({ ticket, rol, session, onCerrar, onAgregarComentario, onAsignarTecnico, onEnviarCalificacion, slaMatrix }) {
  const [comentario, setComentario] = useState('');
  const [comentarioAdjunto, setComentarioAdjunto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [csatRating, setCsatRating] = useState(0);
  const [csatFeedback, setCsatFeedback] = useState('');
  
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [ticket?.comentarios]);

  if (!ticket) return null;

  const sla = verificarSLA(ticket, slaMatrix);
  let slaColor = 'var(--primary)';
  if (sla.estadoVisual === 'warning') slaColor = 'var(--warning)';
  if (sla.estadoVisual === 'breached') slaColor = 'var(--danger)';
  if (ticket.estado === 'Resuelto' && !sla.incumplio) slaColor = 'var(--success)';

  const handleAgregar = async () => {
    if (!comentario.trim() && !comentarioAdjunto) return;
    setIsSubmitting(true);
    await onAgregarComentario(ticket.id, comentario, comentarioAdjunto, session?.nombre || 'Soporte TI');
    setComentario('');
    setComentarioAdjunto(null);
    setIsSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAgregar();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      id="ticketModal"
    >
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-ticket-id">{ticket.id}</div>
            <div className="modal-title">{ticket.asunto}</div>
          </div>
          <button className="modal-close" onClick={onCerrar} title="Cerrar"><X size={18} /></button>
        </div>

        {/* Badges de resumen */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span className={`badge badge-${ticket.tipo}`}>{ticket.tipo}</span>
          <span className={`badge badge-estado estado-${ticket.estado.replace(' ', '-')}`}>
            {ticket.estado}
          </span>
          <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Target size={12} /> {ticket.prioridad}
          </span>
          <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Folder size={12} /> {ticket.categoria || 'General'} &gt; {ticket.subcategoria || 'Otros'}
          </span>
          {(rol === 'tecnico' || rol === 'admin') ? (
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={12} /> 
              <select
                value={ticket.tecnico}
                onChange={(e) => onAsignarTecnico(ticket.id, e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer', fontSize: 'inherit' }}
              >
                {TECNICOS.map((t) => (
                  <option key={t} value={t} style={{ color: '#000' }}>{t}</option>
                ))}
              </select>
            </span>
          ) : (
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={12} /> {ticket.tecnico}
            </span>
          )}
          {ticket.activo && ticket.activo !== 'Ninguno' && (
            <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Monitor size={12} /> {ticket.activo}
            </span>
          )}
          <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={12} /> {ticket.fecha}
          </span>
          <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} /> {calcularTiempoAbierto(ticket)}
          </span>
        </div>

        {/* Barra de progreso SLA */}
        <div style={{ marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 'bold' }}>SLA: {sla.horasLimite} horas</span>
            <span style={{ color: slaColor, fontWeight: 'bold' }}>
              {ticket.estado === 'Resuelto' 
                ? (sla.incumplio ? 'Incumplido' : 'Cumplido') 
                : (sla.incumplio ? 'Vencido' : `${Math.round(sla.porcentaje)}% Consumido`)}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${sla.porcentaje}%`, 
              height: '100%', 
              background: slaColor,
              transition: 'width 0.3s ease, background 0.3s ease'
            }} />
          </div>
        </div>

        {/* Descripción */}
        <div className="modal-desc">
          <div className="modal-desc-label">Descripción original</div>
          {ticket.descripcion}
          {ticket.adjunto && (
            <div style={{ marginTop: '0.8rem' }}>
              <a href={ticket.adjunto.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', width: 'auto' }}>
                <Paperclip size={14} /> Ver adjunto ({ticket.adjunto.name})
              </a>
            </div>
          )}
        </div>

        {/* Detalles RFC (solo si aplica) */}
        {ticket.tipo === 'RFC' && (
          <div className="rfc-detail">
            <div style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <strong style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><SettingsIcon size={14} /> Nivel de Impacto:</strong>{' '}
              {ticket.impacto}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <strong style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><RotateCcw size={14} /> Plan de Rollback:</strong>{' '}
              {ticket.rollback || 'No especificado'}
            </div>
          </div>
        )}

        {/* Historial de actividad (Chat UI) */}
        <div className="activity-section">
          <div className="activity-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MessageSquare size={16} /> Comentarios e Historial</div>
          <div className="activity-list" id="listaComentarios" ref={chatRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', maxHeight: '320px', overflowY: 'auto' }}>
            {ticket.comentarios.map((c, i) => (
              <div
                key={i}
                style={{
                  alignSelf: c.esSistema ? 'center' : (c.autor === 'Soporte TI' ? 'flex-end' : 'flex-start'),
                  background: c.esSistema ? 'transparent' : 'var(--surface)',
                  border: c.esSistema ? 'none' : '1px solid var(--border)',
                  padding: c.esSistema ? '0.2rem' : '0.8rem 1rem',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  fontSize: c.esSistema ? '0.75rem' : '0.88rem',
                  color: c.esSistema ? 'var(--text-muted)' : 'var(--text)',
                  textAlign: c.esSistema ? 'center' : 'left',
                  boxShadow: c.esSistema ? 'none' : 'var(--shadow)'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: c.esSistema ? '0' : '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {c.esSistema ? '' : (c.autor ? <><User size={10} /> {c.autor} • </> : <><User size={10} /> </>)} {c.fecha}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: c.esSistema ? 'center' : 'flex-start' }}>{c.esSistema ? <><SettingsIcon size={12} /> [SISTEMA] {c.texto}</> : c.texto}</div>
                {c.adjunto && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <a href={c.adjunto.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Paperclip size={12} /> {c.adjunto.name}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Agregar comentario */}
          <div className="add-comment" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {(rol === 'tecnico' || rol === 'admin') && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                {PLANTILLAS.map((p, i) => (
                  <button key={i} className="btn-small" onClick={() => setComentario(p)} title={p} style={{ background: 'var(--surface)' }}>
                    {p.substring(0, 22)}...
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input
                  id="nuevoComentario"
                  type="text"
                  className="form-input"
                  placeholder="Escribe tu mensaje..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" style={{ width: 'auto' }} onClick={handleAgregar} disabled={isSubmitting}>
                  {isSubmitting ? '...' : 'Enviar'}
                </button>
              </div>
              <input 
                type="file" 
                onChange={(e) => setComentarioAdjunto(e.target.files[0] || null)}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
              />
          </div>

          {/* Encuesta CSAT */}
          {ticket.estado === 'Resuelto' && rol === 'usuario' && !ticket.csat && (
            <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>¡Ticket Resuelto! Califica nuestro servicio</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.8rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} onClick={() => setCsatRating(star)} style={{ color: csatRating >= star ? 'var(--warning)' : 'var(--text-muted)' }}>★</span>
                ))}
              </div>
              {csatRating > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input type="text" className="form-input" placeholder="Déjanos un comentario opcional..." value={csatFeedback} onChange={e => setCsatFeedback(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn-primary" style={{ width: 'auto' }} onClick={() => onEnviarCalificacion(ticket.id, csatRating, csatFeedback)}>Enviar Calificación</button>
                </div>
              )}
            </div>
          )}
          {ticket.csat && (
             <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius)', border: '1px solid rgba(16,185,129,0.3)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}><Star size={16} /> Calificaste este servicio con <strong>{ticket.csat.rating} estrellas</strong>.</div>
               {ticket.csat.feedback && <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>"{ticket.csat.feedback}"</span>}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
