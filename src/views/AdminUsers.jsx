import React, { useState } from 'react';
import { useUsersController } from '../controllers/useUsersController';
import { Users, Plus, Pencil, Trash2, X, AlertCircle, User } from 'lucide-react';


export default function AdminUsers() {
  const { users, loadingUsers, crearUsuario, actualizarUsuario, eliminarUsuario } = useUsersController();
  const [showModal, setShowModal] = useState(false);
  const [editingUserEmail, setEditingUserEmail] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    password: '',
    rol: 'usuario',
    avatar: 'U'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openNewUserModal = () => {
    setEditingUserEmail(null);
    setFormData({ nombre: '', username: '', password: '', rol: 'usuario', avatar: 'U' });
    setError('');
    setShowModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUserEmail(user.email);
    setFormData({
      nombre: user.nombre || '',
      username: user.username || user.email.split('@')[0],
      password: '', // No se edita la contraseña desde aquí
      rol: user.rol || 'usuario',
      avatar: user.avatar || 'U'
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (editingUserEmail) {
        // Modo Edición
        await actualizarUsuario(editingUserEmail, {
          nombre: formData.nombre,
          rol: formData.rol,
          avatar: formData.avatar,
          username: formData.username.trim().toLowerCase()
        });
      } else {
        // Modo Creación
        const email = `${formData.username.trim().toLowerCase()}@helpdesk.app`;
        await crearUsuario(email, formData.password, {
          nombre: formData.nombre,
          rol: formData.rol,
          avatar: formData.avatar,
          username: formData.username.trim().toLowerCase()
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (email) => {
    if (confirm(`¿Estás seguro de eliminar el acceso para ${email}?`)) {
      await eliminarUsuario(email);
    }
  };

  return (
    <main className="layout" style={{ maxWidth: '1000px', margin: '0 auto', display: 'block' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title" style={{ marginBottom: 0, borderBottom: 'none', padding: 0 }}>
          <span className="card-title-icon"><Users size={16} /></span>
          Gestión de Usuarios
        </div>
        <button className="btn-primary" onClick={openNewUserModal}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="card">
        {loadingUsers ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando usuarios...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Avatar</th>
                  <th style={{ padding: '1rem' }}>Nombre</th>
                  <th style={{ padding: '1rem' }}>Username</th>
                  <th style={{ padding: '1rem' }}>Rol</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.avatar && u.avatar.length <= 2 ? u.avatar : <User size={16} />}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.nombre}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>@{u.username || u.email.split('@')[0]}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${u.rol === 'admin' ? 'high' : u.rol === 'tecnico' ? 'medium' : 'low'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button className="btn-icon" onClick={() => openEditUserModal(u)} title="Editar usuario" style={{ color: 'var(--text)' }}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleEliminar(u.email)} title="Eliminar acceso" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingUserEmail ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {editingUserEmail && (
                  <div style={{ padding: '0.8rem', background: 'var(--surface-2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Editando perfil de: <strong>{editingUserEmail}</strong>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-input" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Juan Pérez" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Username)</label>
                  <input type="text" className="form-input" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Ej. jperez" />
                </div>

                {!editingUserEmail && (
                  <div className="form-group">
                    <label className="form-label">Contraseña</label>
                    <input type="password" className="form-input" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Rol</label>
                    <select className="form-select" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                      <option value="usuario">Usuario Final</option>
                      <option value="tecnico">Soporte Técnico</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Avatar (Iniciales)</label>
                    <input type="text" className="form-input" maxLength={2} value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} />
                  </div>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertCircle size={14}/> {error}</div>}

                <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (editingUserEmail ? 'Guardar Cambios' : 'Crear Usuario')}
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
