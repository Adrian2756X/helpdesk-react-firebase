import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const DEFAULT_SETTINGS = {
  categorias: {
    'Hardware': ['Impresoras', 'Laptops', 'Periféricos', 'Red/WiFi'],
    'Software': ['Office 365', 'ERP', 'Sistema Operativo', 'Antivirus'],
    'Accesos': ['Carpetas Compartidas', 'VPN', 'Correo Electrónico', 'Portales']
  },
  slaMatrix: {
    Incidente: { Alta: 4, Media: 8, Baja: 24 },
    Solicitud: { Alta: 8, Media: 24, Baja: 72 },
    RFC:       { Alta: 24, Media: 72, Baja: 120 }
  }
};

export function useSettingsController() {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const docRef = doc(db, 'config', 'system');
    
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
        setLoadingSettings(false);
      } else {
        // Seeding si no existe
        console.log("No se encontró configuración, inicializando valores por defecto...");
        try {
          await setDoc(docRef, DEFAULT_SETTINGS);
          // Snapshot lo capturará automáticamente
        } catch (err) {
          console.error("Error creando la configuración por defecto:", err);
          setError("Error de permisos al inicializar la configuración.");
          setLoadingSettings(false);
        }
      }
    }, (err) => {
      console.error("Error obteniendo config:", err);
      setError(err.message);
      setLoadingSettings(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      await setDoc(doc(db, 'config', 'system'), newSettings);
    } catch (err) {
      console.error("Error actualizando settings:", err);
      throw err;
    }
  };

  return {
    settings,
    loadingSettings,
    error,
    updateSettings
  };
}
