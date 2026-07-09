/**
 * CONTROLLER — useAuthController (Firebase Auth)
 * Responsabilidad: Gestionar el estado de sesión usando Firebase Auth.
 * Usa onAuthStateChanged para reactividad automática (persistencia incluida).
 */
import { useState, useEffect, useCallback } from 'react';
import * as AuthStore from '../models/AuthStore';
import { usernameToEmail, emailToUsername, getPerfil, savePerfil, INITIAL_PROFILES } from '../models/User';

export function useAuthController() {
  // null = sin sesión, objeto = usuario logueado, undefined = cargando
  const [session, setSession] = useState(undefined);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Escucha cambios de sesión de Firebase (incluye recargas de página)
  useEffect(() => {
    const unsubscribe = AuthStore.subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email;
        let perfil = await getPerfil(email);

        // Si el perfil no existe en Firestore, intentar "auto-siembra" (seeding)
        if (!perfil && INITIAL_PROFILES[email]) {
          perfil = INITIAL_PROFILES[email];
          await savePerfil(email, perfil);
          console.log(`[useAuthController] Perfil de ${email} sembrado en Firestore.`);
        }

        if (perfil) {
          const username = emailToUsername(email);
          setSession({ ...perfil, username, uid: firebaseUser.uid, email });
        } else {
          // Usuario en Firebase Auth sin perfil en Firestore → cerrar sesión
          console.warn(`[useAuthController] No se encontró perfil para ${email}. Cerrando sesión.`);
          AuthStore.signOutUser();
          setSession(null);
        }
      } else {
        setSession(null);
      }
    });
    return unsubscribe; // cleanup al desmontar
  }, []);

  /**
   * Inicia sesión convirtiendo el username a email de Firebase si es necesario.
   */
  const login = useCallback(async (inputUsername, password) => {
    setLoading(true);
    setError('');
    try {
      // Si el input ya es un correo, úsalo directo. Si no, conviértelo.
      const email = inputUsername.includes('@') 
        ? inputUsername.trim().toLowerCase() 
        : usernameToEmail(inputUsername);
        
      await AuthStore.signIn(email, password);
      // onAuthStateChanged actualiza session automáticamente

    } catch (err) {
      console.error("Firebase Auth Error:", err);
      // Mostramos el código de error exacto de Firebase para depurar
      setError(`Error Firebase: ${err.code} - ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierra la sesión activa.
   */
  const logout = useCallback(async () => {
    await AuthStore.signOutUser();
    // onAuthStateChanged actualiza session a null automáticamente
  }, []);

  const recuperarContrasena = useCallback(async (inputUsername) => {
    setLoading(true);
    setError('');
    try {
      const email = inputUsername.includes('@') 
        ? inputUsername.trim().toLowerCase() 
        : usernameToEmail(inputUsername);
      await AuthStore.sendResetEmail(email);
    } catch (err) {
      console.error("Firebase Auth Reset Error:", err);
      setError(`Error al recuperar: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    session,   // undefined=cargando | null=sin sesión | objeto=logueado
    error,
    loading,
    login,
    logout,
    recuperarContrasena,
  };
}
