/**
 * MODEL — User
 * Responsabilidad: Metadatos de usuarios.
 * La autenticación real la maneja Firebase Auth — aquí solo están los perfiles.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/** Dominio interno usado para Firebase Auth */
export const EMAIL_DOMAIN = 'helpdesk.app';

/**
 * Convierte un username corto al email de Firebase Auth.
 * Ej: 'admin' → 'admin@helpdesk.app'
 * @param {string} username
 * @returns {string}
 */
export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

/**
 * Extrae el username desde un email de Firebase Auth.
 * Ej: 'admin@helpdesk.app' → 'admin'
 * @param {string} email
 * @returns {string}
 */
export function emailToUsername(email) {
  return email.split('@')[0];
}

/**
 * Metadatos de perfil iniciales para la siembra (seeding) automática.
 * El rol del administrador ha sido actualizado a 'admin'.
 */
export const INITIAL_PROFILES = {
  'admin@helpdesk.app':     { nombre: 'Administrador',     rol: 'admin',    avatar: '🛡️', username: 'admin' },
  'alejandro@helpdesk.app': { nombre: 'Alejandro Osorio',  rol: 'tecnico',  avatar: '🛠️', username: 'alejandro' },
  'giovanna@helpdesk.app':  { nombre: 'Giovanna Hernandez', rol: 'tecnico', avatar: '🛠️', username: 'giovanna' },
  'katia@helpdesk.app':     { nombre: 'Katia Hernandez',   rol: 'tecnico',  avatar: '🛠️', username: 'katia' },
  'hugo@helpdesk.app':      { nombre: 'Hugo',              rol: 'tecnico',  avatar: '🛠️', username: 'hugo' },
  'usuario@helpdesk.app':   { nombre: 'Usuario Final',     rol: 'usuario',  avatar: '👤', username: 'usuario' },
};

/**
 * Retorna el perfil de un usuario desde Firestore dado su email.
 * @param {string} email
 * @returns {Promise<Object | null>}
 */
export async function getPerfil(email) {
  const docRef = doc(db, 'users', email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

/**
 * Guarda o actualiza un perfil en Firestore.
 * @param {string} email
 * @param {Object} perfilData
 */
export async function savePerfil(email, perfilData) {
  const docRef = doc(db, 'users', email);
  await setDoc(docRef, perfilData, { merge: true });
}

/**
 * Lista de usuarios para mostrar en el panel de demo de la LoginPage.
 */
export const DEMO_USUARIOS = [
  { username: 'admin',     password: 'admin123',  rol: 'admin',   avatar: '🛡️' },
  { username: 'alejandro', password: 'pass123',   rol: 'tecnico', avatar: '🛠️' },
  { username: 'giovanna',  password: 'pass123',   rol: 'tecnico', avatar: '🛠️' },
  { username: 'katia',     password: 'pass123',   rol: 'tecnico', avatar: '🛠️' },
  { username: 'hugo',      password: 'pass123',   rol: 'tecnico', avatar: '🛠️' },
  { username: 'usuario',   password: 'user123',   rol: 'usuario', avatar: '👤' },
];
