/**
 * ORQUESTADOR — App
 *
 * Punto de entrada de la aplicación. Responsabilidades:
 *   1. Instanciar los Controllers
 *   2. Routing condicional: LoginPage ↔ Portal
 *   3. Pasar datos y callbacks a las Views
 *
 * Flujo MVC con Auth:
 *   LoginPage → useAuthController → User Model → session
 *   session === null → mostrar LoginPage
 *   session !== null → mostrar Portal (con rol de la sesión)
 */
import { useCallback } from 'react';

// ── Controllers ───────────────────────────────────────────────────────────────
import { useAuthController }   from './controllers/useAuthController';
import { useTicketController } from './controllers/useTicketController';
import { useFilterController } from './controllers/useFilterController';
import { useSettingsController } from './controllers/useSettingsController';

// ── Views ─────────────────────────────────────────────────────────────────────
import LoginPage       from './views/LoginPage';
import Header          from './views/Header';
import KpiDashboard    from './views/KpiDashboard';
import TicketForm      from './views/TicketForm';
import TicketDirectory from './views/TicketDirectory';
import TicketModal     from './views/TicketModal';
import KnowledgeBase   from './views/KnowledgeBase';
import ReportsDashboard from './views/ReportsDashboard';
import AdminUsers from './views/AdminUsers';
import Settings from './views/Settings';

import './index.css';
import { useState } from 'react';

export default function App() {
  // ── Auth Controller ───────────────────────────────────────────────────────
  const { session, error, loading, login, logout, recuperarContrasena } = useAuthController();

  // ── Routing condicional ───────────────────────────────────────────────────
  // undefined = Firebase aún verificando sesión (splash screen)
  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
        gap: '1rem',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', animation: 'logo-pulse 1.5s ease-in-out infinite',
        }}>🎯</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando sesión...</p>
      </div>
    );
  }

  // null = sin sesión activa → mostrar login
  if (!session) {
    return (
      <LoginPage
        onLogin={login}
        error={error}
        loading={loading}
        onRecuperarContrasena={recuperarContrasena}
      />
    );
  }

  // Sesión activa → mostrar el portal
  return <Portal session={session} onLogout={logout} />;
}

/**
 * Portal — renderiza la aplicación principal una vez autenticado.
 * Se extrae como componente separado para que los controllers de tickets
 * solo se monten cuando hay una sesión activa.
 */
function Portal({ session, onLogout }) {
  const rol = session.rol;
  const isStaff = rol === 'tecnico' || rol === 'admin';
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');

  // ── Controllers del portal ────────────────────────────────────────────────
  const { settings } = useSettingsController();
  const slaMatrix = settings?.slaMatrix;
  const ticketCtrl = useTicketController(slaMatrix);
  const filterCtrl = useFilterController(ticketCtrl.tickets, rol);

  // Ticket activo para el modal
  const ticketSeleccionado =
    ticketCtrl.tickets.find((t) => t.id === selectedTicketId) || null;

  // RBAC: inyecta el rol en el cambio de estado
  const handleCambiarEstado = useCallback(
    (id, nuevoEstado) => ticketCtrl.cambiarEstado(id, nuevoEstado, rol),
    [ticketCtrl, rol]
  );

  const handleAsignarTecnico = useCallback(
    (id, nuevoTecnico) => ticketCtrl.asignarTecnico(id, nuevoTecnico, rol),
    [ticketCtrl, rol]
  );

  return (
    <>
      {/* VIEW: Header — muestra info de sesión y botón de logout */}
      <Header session={session} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'tickets' && (
        <main className={`layout ${isStaff ? 'layout-full' : ''}`}>
          {/* VIEW: KpiDashboard — solo visible para técnicos/admin */}
          <KpiDashboard kpis={ticketCtrl.kpis} visible={isStaff} />

          {/* VIEW: TicketForm — oculto para staff para dar espacio al Kanban */}
          {!isStaff && (
            <TicketForm rol={rol} onCrearTicket={ticketCtrl.crearTicket} />
          )}

          {/* VIEW: TicketDirectory — recibe tickets ya filtrados */}
          <TicketDirectory
            rol={rol}
            ticketsFiltrados={filterCtrl.ticketsFiltrados}
            filtros={filterCtrl.filtros}
            onActualizarFiltro={filterCtrl.actualizarFiltro}
            onToggleOrden={filterCtrl.toggleOrden}
            onCambiarEstado={handleCambiarEstado}
            onAbrirModal={setSelectedTicketId}
            onExportarCSV={ticketCtrl.exportarCSV}
          />
        </main>
      )}

      {activeTab === 'faq' && <KnowledgeBase rol={rol} />}
      
      {activeTab === 'reportes' && isStaff && <ReportsDashboard />}

      {activeTab === 'usuarios' && rol === 'admin' && <AdminUsers />}

      {activeTab === 'configuracion' && rol === 'admin' && <Settings rol={rol} />}

      {/* VIEW: TicketModal */}
      {ticketSeleccionado && (
        <TicketModal
          ticket={ticketSeleccionado}
          rol={rol}
          session={session}
          onCerrar={() => setSelectedTicketId(null)}
          onAgregarComentario={ticketCtrl.agregarComentario}
          onAsignarTecnico={handleAsignarTecnico}
          onEnviarCalificacion={ticketCtrl.enviarCalificacion}
          slaMatrix={slaMatrix}
        />
      )}
    </>
  );
}
