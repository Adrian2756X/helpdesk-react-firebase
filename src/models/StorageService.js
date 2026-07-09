/**
 * MODEL — StorageService (Firebase Storage)
 * Responsabilidad: Manejar la subida de archivos adjuntos y obtener sus URLs.
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Sube un archivo a Firebase Storage
 * @param {File} file - El archivo a subir
 * @param {string} folder - Carpeta donde se subirá (ej: 'tickets' o 'comentarios')
 * @returns {Promise<{ url: string, name: string }>} URL de descarga y nombre original
 */
export async function uploadAttachment(file, folder = 'attachments') {
  if (!file) return null;

  // Creamos una ruta única para evitar colisiones
  const uniqueName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${folder}/${uniqueName}`);

  // Subimos el archivo
  await uploadBytes(storageRef, file);

  // Obtenemos la URL de descarga
  const url = await getDownloadURL(storageRef);

  return { url, name: file.name };
}
