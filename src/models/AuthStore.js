/**
 * MODEL — AuthStore (Firebase Auth)
 * Responsabilidad: Operaciones de autenticación contra Firebase Auth.
 * Reemplaza la versión localStorage anterior.
 */
import { initializeApp, deleteApp } from 'firebase/app';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth as getFirebaseAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, firebaseConfig } from '../firebase/config';

/**
 * Inicia sesión con email y contraseña en Firebase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  return signOut(auth);
}

/**
 * Suscribe un callback que se llama cuando cambia el estado de auth.
 * Firebase gestiona la persistencia de sesión automáticamente.
 * @param {function} callback - Recibe el usuario de Firebase (o null)
 * @returns {function} Función de cleanup para cancelar la suscripción
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Crea un usuario en Firebase Auth usando una instancia secundaria
 * para evitar cerrar la sesión del administrador activo.
 * @param {string} email
 * @param {string} password
 */
export async function createAuthUser(email, password) {
  // Inicializamos una app secundaria para no interferir con la sesión actual
  const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp_${Date.now()}`);
  const secondaryAuth = getFirebaseAuth(secondaryApp);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await deleteApp(secondaryApp);
    return userCredential.user;
  } catch (error) {
    await deleteApp(secondaryApp);
    throw error;
  }
}

/**
 * Envía un correo de recuperación de contraseña.
 * @param {string} email 
 */
export async function sendResetEmail(email) {
  return sendPasswordResetEmail(auth, email);
}
