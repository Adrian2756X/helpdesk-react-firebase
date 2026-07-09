/**
 * VIEW — Header
 * Responsabilidad: Renderizar el encabezado con info del usuario logueado,
 * botón de logout y toggle de tema.
 * El selector de rol se eliminó — el rol viene determinado por la sesión.
 */
import { useThemeController } from '../controllers/useThemeController';

export default function Header({ session, onLogout, activeTab, onTabChange }) {
  const { theme, toggleTheme } = useThemeController();

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="brand-icon">🎯</div>
          <div>
            <div className="brand-title">Portal de Soporte TI</div>
            <div className="brand-subtitle">Gestión de Incidentes, Solicitudes y Cambios</div>
          </div>
        </div>

        {/* Tabs / Navegación */}
        {onTabChange && (
          <div style={{ display: 'flex', gap: '1rem', marginRight: 'auto', marginLeft: '2rem', flex: 1 }}>
            <button 
              onClick={() => onTabChange('tickets')}
              style={{ 
                fontWeight: activeTab === 'tickets' ? 'bold' : 'normal', 
                fontSize: '0.95rem', 
                background: activeTab === 'tickets' ? 'var(--surface-2)' : 'transparent', 
                color: 'var(--text)', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px',
                border: '1px solid ' + (activeTab === 'tickets' ? 'var(--border)' : 'transparent'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              🎫 Tickets
            </button>
            <button 
              onClick={() => onTabChange('faq')}
              style={{ 
                fontWeight: activeTab === 'faq' ? 'bold' : 'normal', 
                fontSize: '0.95rem', 
                background: activeTab === 'faq' ? 'var(--surface-2)' : 'transparent', 
                color: 'var(--text)', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px',
                border: '1px solid ' + (activeTab === 'faq' ? 'var(--border)' : 'transparent'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              📚 Base de Conocimiento
            </button>
            {session.rol === 'tecnico' || session.rol === 'admin' ? (
              <button 
                onClick={() => onTabChange('reportes')}
                style={{ 
                  fontWeight: activeTab === 'reportes' ? 'bold' : 'normal', 
                  fontSize: '0.95rem', 
                  background: activeTab === 'reportes' ? 'var(--surface-2)' : 'transparent', 
                  color: 'var(--text)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px',
                  border: '1px solid ' + (activeTab === 'reportes' ? 'var(--border)' : 'transparent'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                📊 Reportes
              </button>
            ) : null}
            {session.rol === 'admin' && (
              <button 
                onClick={() => onTabChange('usuarios')}
                style={{ 
                  fontWeight: activeTab === 'usuarios' ? 'bold' : 'normal', 
                  fontSize: '0.95rem', 
                  background: activeTab === 'usuarios' ? 'var(--surface-2)' : 'transparent', 
                  color: 'var(--text)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px',
                  border: '1px solid ' + (activeTab === 'usuarios' ? 'var(--border)' : 'transparent'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                ⚙️ Usuarios
              </button>
            )}
          </div>
        )}

        {/* Controles de sesión */}
        <div className="header-controls">
          {/* Info del usuario logueado */}
          <div className="header-user">
            <span className="header-user-avatar">{session.avatar}</span>
            <div className="header-user-info">
              <span className="header-user-name">{session.nombre}</span>
              <span className="header-user-role">
                {session.rol === 'admin' ? '🛡️ Admin' : (session.rol === 'tecnico' ? '🛠️ Soporte TI' : '👤 Usuario')}
              </span>
            </div>
          </div>

          {/* Toggle de tema */}
          <button
            id="themeToggle"
            className="btn-icon"
            onClick={toggleTheme}
            title="Cambiar tema"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Cerrar sesión */}
          <button
            id="btnLogout"
            className="btn-logout"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            ↩ Salir
          </button>
        </div>
      </div>
    </header>
  );
}
