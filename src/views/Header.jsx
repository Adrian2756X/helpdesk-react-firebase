/**
 * VIEW — Header
 * Responsabilidad: Renderizar el encabezado con info del usuario logueado,
 * botón de logout y toggle de tema.
 * El selector de rol se eliminó — el rol viene determinado por la sesión.
 */
import { useThemeController } from '../controllers/useThemeController';
import { Target, Ticket, BookOpen, BarChart, Settings, User, Shield, PenTool, Sun, Moon, LogOut, PlusCircle } from 'lucide-react';



export default function Header({ session, onLogout, activeTab, onTabChange }) {
  const { theme, toggleTheme } = useThemeController();

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="brand-icon">
            <Target size={22} />
          </div>
          <div>
            <div className="brand-title">Portal de Soporte TI</div>
          </div>
        </div>

        {/* Tabs / Navegación */}
        {onTabChange && (
          <div style={{ display: 'flex', gap: '1rem', marginRight: 'auto', marginLeft: '2rem', flex: 1 }}>
            {(session.rol === 'usuario' || session.rol === 'admin') && (
              <button 
                onClick={() => onTabChange('nuevo_ticket')}
                style={{ 
                  fontWeight: activeTab === 'nuevo_ticket' ? 'bold' : 'normal', 
                  fontSize: '0.95rem', 
                  background: activeTab === 'nuevo_ticket' ? 'var(--surface-2)' : 'transparent', 
                  color: 'var(--text)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px',
                  border: '1px solid ' + (activeTab === 'nuevo_ticket' ? 'var(--border)' : 'transparent'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <PlusCircle size={18} /> Nuevo Ticket
              </button>
            )}
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
              <Ticket size={18} /> {session.rol === 'usuario' ? 'Mis Tickets' : 'Tickets'}
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
              <BookOpen size={18} /> Base de Conocimiento
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
                <BarChart size={18} /> Reportes
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
                <Settings size={18} /> Usuarios
              </button>
            )}
          </div>
        )}

        {/* Controles de sesión */}
        <div className="header-controls">
          {/* Info del usuario logueado */}
          <div className="header-user">
            <span className="header-user-avatar">
              <User size={20} color="var(--primary)" />
            </span>
            <div className="header-user-info">
              <span className="header-user-name">{session.nombre}</span>
              <span className="header-user-role" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {session.rol === 'admin' ? <><Shield size={12}/> Admin</> : (session.rol === 'tecnico' ? <><PenTool size={12}/> Soporte TI</> : <><User size={12}/> Usuario</>)}
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
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cerrar sesión */}
          <button
            id="btnLogout"
            className="btn-logout"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}
