/**
 * Firebase — Inicialización
 * Punto único de configuración. Exporta las instancias de Auth y Firestore.
 * Todos los models importan desde aquí, nunca directamente de 'firebase/*'.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyCyGUgmHiT4wpeSerIUtiF6j4lwJA0XQHY",
  authDomain: "helpdesk-soporte-bce91.firebaseapp.com",
  projectId: "helpdesk-soporte-bce91",
  storageBucket: "helpdesk-soporte-bce91.firebasestorage.app",
  messagingSenderId: "914882909467",
  appId: "1:914882909467:web:f6705a77167a54082befbe",
  measurementId: "G-XN8FM5612J"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);
