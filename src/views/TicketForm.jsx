/**
 * VIEW — TicketForm
 * Responsabilidad: Renderizar el formulario de creación de tickets.
 * Estado local de UI (form fields) permitido en la View.
 * Delega la creación al Controller vía prop onCrearTicket.
 */
import { useState, useEffect } from 'react';
import { useSettingsController } from '../controllers/useSettingsController';

const TECNICOS = [
  'Sin asignar',
  'Alejandro Osorio',
  'Giovanna Hernandez',
  'Katia Hernandez',
  'Hugo',
];

const ACTIVOS = [
  'Ninguno',
  'Mi Equipo (Laptop/Desktop)',
  'Impresora',
  'Red / WiFi',
  'Servidor',
  'Software / Sistema'
];

const INITIAL_STATE = {
  asunto: '',
  tipo: 'Incidente',
  categoria: '',
  subcategoria: '',
  prioridad: 'Baja',
  tecnico: 'Sin asignar',
  activo: 'Ninguno',
  descripcion: '',
  impacto: 'Bajo',
  rollback: '',
};

export default function TicketForm({ rol, onCrearTicket }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [adjuntoFile, setAdjuntoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { settings, loadingSettings } = useSettingsController();
  const categoriasConfig = settings?.categorias || { 'General': ['Otros'] };
  const categoriasList = Object.keys(categoriasConfig);
  const selectedCategoria = form.categoria || categoriasList[0] || 'General';
  const subcategoriasList = categoriasConfig[selectedCategoria] || ['Otros'];

  // Seleccionar categoría inicial si no está seteada
  useEffect(() => {
    if (!loadingSettings && settings && !form.categoria) {
      const firstCat = categoriasList[0] || 'General';
      const firstSub = categoriasConfig[firstCat]?.[0] || 'Otros';
      setForm(prev => ({ ...prev, categoria: firstCat, subcategoria: firstSub }));
    }
  }, [loadingSettings, settings, categoriasList, categoriasConfig, form.categoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoria') {
      const subs = categoriasConfig[value] || ['Otros'];
      setForm(prev => ({ ...prev, categoria: value, subcategoria: subs[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tecnicoFinal = (rol === 'tecnico' || rol === 'admin') ? form.tecnico : 'Sin asignar';
    await onCrearTicket({ ...form, tecnico: tecnicoFinal, adjuntoFile });
    
    // Resetear manteniendo la primera categoría
    const firstCat = categoriasList[0] || 'General';
    const firstSub = categoriasConfig[firstCat]?.[0] || 'Otros';
    setForm({ ...INITIAL_STATE, categoria: firstCat, subcategoria: firstSub });
    
    setAdjuntoFile(null);
    setIsSubmitting(false);
  };

  return (
    <section className="form-col">
      <div className="card">
        <div className="card-title">
          <span className="card-title-icon">🎫</span>
          Nuevo Ticket
        </div>

        <form id="ticketForm" onSubmit={handleSubmit}>
          {/* Asunto */}
          <div className="form-group">
            <label className="form-label" htmlFor="asunto">Asunto</label>
            <input
              id="asunto"
              name="asunto"
              type="text"
              className="form-input"
              placeholder="Ej. Falla en el sistema de correo"
              value={form.asunto}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo + Prioridad */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                name="tipo"
                className="form-select"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                <option value="Incidente">🔴 Incidente (Falla)</option>
                <option value="Solicitud">🔵 Solicitud (Nuevo servicio)</option>
                <option value="RFC">🟡 RFC (Request for Change)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prioridad">Prioridad</label>
              <select
                id="prioridad"
                name="prioridad"
                className="form-select"
                value={form.prioridad}
                onChange={handleChange}
                required
              >
                <option value="Baja">🟢 Baja</option>
                <option value="Media">🟡 Media</option>
                <option value="Alta">🔴 Alta</option>
              </select>
            </div>
          </div>

          {/* Categoría + Subcategoría + Equipo */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                className="form-select"
                value={form.categoria}
                onChange={handleChange}
                required
                disabled={loadingSettings}
              >
                {categoriasList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="subcategoria">Subcategoría</label>
              <select
                id="subcategoria"
                name="subcategoria"
                className="form-select"
                value={form.subcategoria}
                onChange={handleChange}
                required
                disabled={loadingSettings}
              >
                {subcategoriasList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="activo">Equipo Afectado</label>
              <select
                id="activo"
                name="activo"
                className="form-select"
                value={form.activo}
                onChange={handleChange}
                required
              >
                {ACTIVOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos RFC — dinámicos según tipo */}
          {form.tipo === 'RFC' && (
            <div className="rfc-section">
              <div className="rfc-title">⚙️ Evaluación del Cambio</div>
              <div className="form-group">
                <label className="form-label" htmlFor="impacto">Nivel de Impacto</label>
                <select
                  id="impacto"
                  name="impacto"
                  className="form-select"
                  value={form.impacto}
                  onChange={handleChange}
                >
                  <option value="Bajo">Bajo (Afecta a pocos usuarios)</option>
                  <option value="Medio">Medio (Afecta a un departamento)</option>
                  <option value="Alto">Alto (Afecta a toda la operación)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="rollback">Plan de Rollback</label>
                <textarea
                  id="rollback"
                  name="rollback"
                  className="form-textarea"
                  rows={2}
                  placeholder="Describa el plan si el cambio falla..."
                  value={form.rollback}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Opciones Avanzadas (Solo Técnicos/Admin) */}
          {(rol === 'tecnico' || rol === 'admin') && (
            <div className="form-group" id="asignacionGroup">
              <label className="form-label" htmlFor="tecnico">Asignar a</label>
              <select
                id="tecnico"
                name="tecnico"
                className="form-select"
                value={form.tecnico}
                onChange={handleChange}
              >
                {TECNICOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripción detallada</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="form-textarea"
              rows={6}
              placeholder="Describe el problema, solicitud o cambio..."
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          {/* Adjunto */}
          <div className="form-group">
            <label className="form-label">Archivo adjunto (opcional)</label>
            <label 
              className="file-upload-wrapper" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', 
                padding: '0.65rem 0.9rem', border: '1.5px dashed var(--border)', 
                borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', 
                transition: 'all var(--transition)' 
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '1.2rem' }}>📎</span>
              <span style={{ flex: 1, color: adjuntoFile ? 'var(--text)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                {adjuntoFile ? adjuntoFile.name : 'Haz clic para seleccionar un archivo...'}
              </span>
              <input
                id="adjunto"
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => setAdjuntoFile(e.target.files[0] || null)}
              />
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Subiendo...' : '✨ Generar Ticket'}
          </button>
        </form>
      </div>
    </section>
  );
}
