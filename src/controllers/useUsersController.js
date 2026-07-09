import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createAuthUser } from '../models/AuthStore';

export function useUsersController() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Escuchar todos los usuarios en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userList = snapshot.docs.map((docSnap) => ({
          email: docSnap.id,
          ...docSnap.data(),
        }));
        setUsers(userList);
        setLoadingUsers(false);
      },
      (err) => {
        console.error('[useUsersController] Error al obtener usuarios:', err);
        setLoadingUsers(false);
      }
    );
    return unsubscribe;
  }, []);

  const crearUsuario = useCallback(async (email, password, perfilData) => {
    // 1. Crear en Firebase Auth (app secundaria)
    await createAuthUser(email, password);
    
    // 2. Crear documento en Firestore
    const userRef = doc(db, 'users', email);
    await setDoc(userRef, {
      ...perfilData,
      email // Guardamos el email adentro también para referencia fácil
    });
  }, []);

  const actualizarUsuario = useCallback(async (email, updates) => {
    const userRef = doc(db, 'users', email);
    await updateDoc(userRef, updates);
  }, []);

  const eliminarUsuario = useCallback(async (email) => {
    // NOTA: Para eliminar el usuario de Firebase Auth desde el cliente 
    // se requeriría iniciar sesión como ese usuario. En la web, 
    // lo más práctico sin backend es eliminar su documento, 
    // lo que le impedirá acceder a la plataforma (ver useAuthController).
    const userRef = doc(db, 'users', email);
    await deleteDoc(userRef);
  }, []);

  return {
    users,
    loadingUsers,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
  };
}
