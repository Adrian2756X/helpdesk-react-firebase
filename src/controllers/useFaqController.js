import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, addDoc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const INITIAL_FAQS = [
  {
    pregunta: "¿Cómo reseteo mi contraseña?",
    respuesta: "Para resetear tu contraseña de red, visita el portal self-service en sso.empresa.com, ingresa tu correo y haz clic en 'Olvidé mi contraseña'. Recibirás un SMS con el código de verificación.",
    orden: 1
  },
  {
    pregunta: "¿Cómo configuro la impresora en mi equipo?",
    respuesta: "Abre 'Impresoras y escáneres' en la configuración de Windows. Haz clic en 'Agregar una impresora' y espera a que aparezca 'Impresora_Piso_2'. Selecciónala y el driver se instalará automáticamente.",
    orden: 2
  },
  {
    pregunta: "El internet está muy lento o no me conecta",
    respuesta: "Primero, reinicia tu equipo. Si usas WiFi, verifica estar conectado a 'Corp_WiFi'. Si estás por cable, asegúrate de que esté bien conectado. Si el problema persiste, crea un ticket de Incidente.",
    orden: 3
  },
  {
    pregunta: "¿Cómo solicito acceso a una carpeta compartida?",
    respuesta: "Debes crear un ticket del tipo 'Solicitud' indicando la ruta exacta de la carpeta y adjuntando la aprobación por correo de tu gerente.",
    orden: 4
  }
];

export function useFaqController() {
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Sembrar (Seed) FAQs iniciales si la colección está vacía
  const seedFaqsIfEmpty = async () => {
    try {
      const snap = await getDocs(collection(db, 'faqs'));
      if (snap.empty) {
        console.log('Sembrando FAQs iniciales...');
        const promises = INITIAL_FAQS.map(faq => 
          addDoc(collection(db, 'faqs'), faq)
        );
        await Promise.all(promises);
        console.log('FAQs sembrados exitosamente.');
      }
    } catch (error) {
      console.error("Error en seeding de FAQs:", error);
    }
  };

  useEffect(() => {
    seedFaqsIfEmpty();

    const faqsRef = collection(db, 'faqs');
    const unsubscribe = onSnapshot(faqsRef, (snapshot) => {
      const faqsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenar por campo 'orden' si existe
      faqsList.sort((a, b) => (a.orden || 99) - (b.orden || 99));
      setFaqs(faqsList);
      setLoadingFaqs(false);
    }, (error) => {
      console.error("Error obteniendo FAQs:", error);
      setLoadingFaqs(false);
    });

    return () => unsubscribe();
  }, []);

  const crearFaq = useCallback(async (faqData) => {
    try {
      await addDoc(collection(db, 'faqs'), {
        ...faqData,
        orden: faqs.length + 1
      });
    } catch (error) {
      console.error("Error creando FAQ:", error);
      throw error;
    }
  }, [faqs.length]);

  const actualizarFaq = useCallback(async (id, updates) => {
    try {
      const docRef = doc(db, 'faqs', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error actualizando FAQ:", error);
      throw error;
    }
  }, []);

  const eliminarFaq = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
    } catch (error) {
      console.error("Error eliminando FAQ:", error);
      throw error;
    }
  }, []);

  return {
    faqs,
    loadingFaqs,
    crearFaq,
    actualizarFaq,
    eliminarFaq
  };
}
