import { useState, useEffect } from 'react';
import { useSettingsController } from '../controllers/useSettingsController';

export default function Settings({ rol }) {
  const { settings, loadingSettings, updateSettings } = useSettingsController();
  const [localSla, setLocalSla] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !localSla) {
      setLocalSla(settings.slaMatrix);
    }
  }, [settings, localSla]);

  if (rol !== 'admin') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Acceso denegado. Solo administradores.</div>;
  }

  if (loadingSettings || !localSla) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando configuración...</div>;
  }

  const handleSlaChange = (tipo, prioridad, valor) => {
    setLocalSla(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [prioridad]: Number(valor)
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ ...settings, slaMatrix: localSla });
      alert("Configuración guardada exitosamente");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="layout" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-title" style={{ borderBottom: 'none' }}>
          <div>
            <span className="card-title-icon">⚙️</span>
            Configuración General
          </div>
        </div>
        
        <h3 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Tiempos de SLA (Horas)</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Define el tiempo límite de resolución en horas según el Tipo de Ticket y su Prioridad.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: '500px' }}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Alta</th>
                <th>Media</th>
                <th>Baja</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(localSla).map(tipo => (
                <tr key={tipo}>
                  <td style={{ fontWeight: 'bold' }}>{tipo}</td>
                  {['Alta', 'Media', 'Baja'].map(prioridad => (
                    <td key={prioridad}>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ width: '80px', padding: '0.4rem' }}
                        value={localSla[tipo][prioridad]}
                        onChange={(e) => handleSlaChange(tipo, prioridad, e.target.value)}
                        min="1"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Catálogo de Categorías y Subcategorías</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
            Las categorías y subcategorías que se muestran en el formulario de creación de tickets se cargan dinámicamente desde Firestore <strong>(/config/system)</strong>. 
            Actualmente puedes modificarlas editando directamente el documento en tu Consola de Firebase. La interfaz visual para gestionarlas se añadirá en una futura actualización.
          </p>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </main>
  );
}
