/**
 * MODEL — TicketStore (Firestore)
 * Responsabilidad: Operaciones CRUD de tickets contra Cloud Firestore.
 * Reemplaza la versión localStorage anterior.
 *
 * Estructura Firestore:
 *   tickets/{TKT-XXXX}    → documento de ticket
 *   metadata/config       → { lastTicketNumber: N } contador atómico
 */
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const TICKETS_COL = 'tickets';
const META_DOC    = 'metadata/config';

/**
 * Suscribe en tiempo real a la colección de tickets.
 * Se llama cada vez que hay un cambio en Firestore.
 *
 * @param {function} onData  - Recibe el array de tickets actualizado
 * @param {function} onError - Recibe el error si falla la suscripción
 * @returns {function} Unsubscribe — llamar en el cleanup de useEffect
 */
export function subscribeToTickets(onData, onError) {
  const q = query(collection(db, TICKETS_COL), orderBy('timestamp', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const tickets = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(tickets);
    },
    onError
  );
}

/**
 * Crea un nuevo ticket en Firestore usando una transacción atómica.
 * El ID del documento es el propio TKT-XXXX para mantener la legibilidad.
 *
 * @param {Object} ticketData - Datos del ticket (sin id ni counter)
 * @returns {Promise<string>} El ID del ticket creado (TKT-XXXX)
 */
export async function createTicket(ticketData) {
  const metaRef    = doc(db, META_DOC);
  const ticketsCol = collection(db, TICKETS_COL);

  let ticketId;
  await runTransaction(db, async (transaction) => {
    const metaSnap = await transaction.get(metaRef);
    const lastNum  = metaSnap.exists() ? (metaSnap.data().lastTicketNumber || 0) : 0;
    const nextNum  = lastNum + 1;

    ticketId = `TKT-${String(nextNum).padStart(4, '0')}`;

    const ticketRef = doc(ticketsCol, ticketId);
    transaction.set(ticketRef, { ...ticketData, id: ticketId });
    transaction.set(metaRef, { lastTicketNumber: nextNum }, { merge: true });
  });

  return ticketId;
}

/**
 * Actualiza campos específicos de un ticket existente.
 * @param {string} ticketId
 * @param {Object} changes - Campos a actualizar (se hace merge parcial)
 */
export async function updateTicket(ticketId, changes) {
  const ticketRef = doc(db, TICKETS_COL, ticketId);
  await updateDoc(ticketRef, changes);
}
