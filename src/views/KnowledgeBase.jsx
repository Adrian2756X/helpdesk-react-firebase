import { useState } from 'react';
import { useFaqController } from '../controllers/useFaqController';

export default function KnowledgeBase({ rol }) {
  const { faqs, loadingFaqs, crearFaq, actualizarFaq, eliminarFaq } = useFaqController();
  const [busqueda, setBusqueda] = useState('');
  const [abiertoId, setAbiertoId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [formData, setFormData] = useState({ pregunta: '', respuesta: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaff = rol === 'admin' || rol === 'tecnico';

  const filtrados = faqs.filter(f => 
    f.pregunta.toLowerCase().includes(busqueda.toLowerCase()) || 
    f.respuesta.toLowerCase().includes(busqueda.toLowerCase())
  );

  const openNewModal = () => {
    setEditingFaqId(null);
    setFormData({ pregunta: '', respuesta: '' });
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setEditingFaqId(faq.id);
    setFormData({ pregunta: faq.pregunta, respuesta: faq.respuesta });
    setShowModal(true);
  };

  const handleDelete = async (id, pregunta) => {
    if (confirm(`¿Eliminar el artículo "${pregunta}"?`)) {
      await eliminarFaq(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingFaqId) {
        await actualizarFaq(editingFaqId, formData);
      } else {
        await crearFaq(formData);
      }
      setShowModal(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="layout" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none' }}>
          <div>
            <span className="card-title-icon">📚</span>
            Base de Conocimientos (FAQ)
          </div>
          {isStaff && (
            <button className="btn-primary" onClick={openNewModal}>
              + Nuevo Artículo
            </button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Encuentra respuestas rápidas a los problemas más comunes antes de crear un ticket.
        </p>

        <div className="search-wrapper" style={{ marginBottom: '2rem' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar artículos o palabras clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {loadingFaqs ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Cargando artículos...
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No se encontraron artículos que coincidan con tu búsqueda.
            </div>
          ) : (
            filtrados.map((faq) => (
              <div 
                key={faq.id} 
                style={{ 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  background: 'var(--surface-2)',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    padding: '1rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold'
                  }}
                  onClick={() => setAbiertoId(abiertoId === faq.id ? null : faq.id)}
                >
                  <span>{faq.pregunta}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isStaff && (
                      <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn-icon" onClick={() => openEditModal(faq)} title="Editar" style={{ color: 'var(--text)' }}>✏️</button>
                        <button className="btn-icon" onClick={() => handleDelete(faq.id, faq.pregunta)} title="Eliminar" style={{ color: 'var(--danger)' }}>🗑️</button>
                      </div>
                    )}
                    <span>{abiertoId === faq.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {abiertoId === faq.id && (
                  <div style={{ padding: '0 1rem 1rem 1rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingFaqId ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pregunta</label>
                  <input type="text" className="form-input" required value={formData.pregunta} onChange={e => setFormData({...formData, pregunta: e.target.value})} placeholder="Ej. ¿Cómo reseteo la contraseña?" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Respuesta</label>
                  <textarea className="form-input" required rows="5" value={formData.respuesta} onChange={e => setFormData({...formData, respuesta: e.target.value})} placeholder="Escribe la solución detallada..."></textarea>
                </div>

                <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
