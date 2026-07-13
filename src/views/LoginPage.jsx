import { useState } from 'react';
import { Target, User, Lock, EyeOff, Eye, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';


export default function LoginPage({ onLogin, error, loading, onRecuperarContrasena }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState(null);
  const [recoveryError, setRecoveryError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryMessage(null);
    setRecoveryError(null);
    try {
      await onRecuperarContrasena(recoveryEmail);
      setRecoveryMessage("Se ha enviado un correo con las instrucciones para restablecer tu contraseña.");
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Target size={32} />
          </div>
          <h1 className="login-title">Portal de Soporte TI</h1>
          <p className="login-subtitle">Inicia sesión para acceder al sistema</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} id="loginForm">
          <div className="login-field">
            <label className="login-label" htmlFor="loginUsername">Usuario o Correo</label>
            <div className="login-input-wrapper">
              <input
                id="loginUsername"
                type="text"
                className="login-input"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
              <span className="login-input-icon"><User size={18} /></span>
            </div>
          </div>

          <div className="login-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="login-label" htmlFor="loginPassword">Contraseña</label>
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryModal(true);
                  setRecoveryMessage(null);
                  setRecoveryError(null);
                  setRecoveryEmail(username.includes('@') ? username : '');
                }}
                style={{
                  background: 'none', border: 'none', fontSize: '0.75rem',
                  color: 'var(--primary)', cursor: 'pointer', padding: 0
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="login-input-wrapper">
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <span className="login-input-icon"><Lock size={18} /></span>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                alignSelf: 'flex-end', background: 'none', border: 'none',
                fontSize: '0.75rem', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 0, marginTop: '0.2rem'
              }}
            >
              {showPassword ? <><EyeOff size={14}/> Ocultar</> : <><Eye size={14}/> Mostrar contraseña</>}
            </button>
          </div>

          {error && (
            <div className="login-error" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            id="loginBtn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Verificando...
              </>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <ArrowRight size={18} /> Iniciar sesión
              </span>
            )}
          </button>
        </form>
      </div>

      {showRecoveryModal && (
        <div className="modal-overlay" onClick={() => setShowRecoveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Recuperar Contraseña</h2>
              <button className="modal-close" onClick={() => setShowRecoveryModal(false)} title="Cerrar">✕</button>
            </div>
            <div className="modal-body">
              {recoveryMessage ? (
                <div style={{ padding: '1rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} /> {recoveryMessage}
                </div>
              ) : (
                <form onSubmit={handleRecuperar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Ingresa el correo electrónico asociado a tu cuenta para recibir un enlace de recuperación.
                  </p>
                  <div className="form-group">
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={recoveryEmail} 
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="correo@empresa.com"
                    />
                  </div>
                  {recoveryError && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={14} /> {recoveryError}
                    </div>
                  )}
                  <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" disabled={recoveryLoading}>
                      {recoveryLoading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
