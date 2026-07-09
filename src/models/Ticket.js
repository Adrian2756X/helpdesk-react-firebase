/**
 * MODEL — Ticket
 * Responsabilidad: Reglas de creación y estructura del dominio Ticket.
 * No tiene dependencias de React.
 */

/**
 * Genera un ID de ticket con formato TKT-XXXX.
 * @param {number} counter
 * @returns {string}
 */
export function generarTicketId(counter) {
  return `TKT-${String(counter).padStart(4, '0')}`;
}

/**
 * Factory: crea un objeto Ticket con todas las reglas de negocio aplicadas.
 * @param {Object} datos - Datos crudos del formulario
 * @param {number} counter - Contador actual de tickets
 * @returns {Object} Ticket nuevo
 */
export function crearTicket(datos, counter) {
  const { asunto, tipo, prioridad, tecnico, descripcion, impacto, rollback } = datos;

  return {
    id: generarTicketId(counter),
    asunto,
    tipo,
    prioridad,
    tecnico,
    descripcion,
    // Campos RFC solo aplican si el tipo es RFC
    impacto: tipo === 'RFC' ? impacto : null,
    rollback: tipo === 'RFC' ? rollback : null,
    estado: 'Abierto',
    fecha: new Date().toLocaleDateString(),
    timestamp: Date.now(),
    // Historial de auditoría inmutable — primer evento del sistema
    comentarios: [
      {
        texto: 'Ticket creado en el sistema.',
        fecha: new Date().toLocaleString(),
        esSistema: true,
      },
    ],
  };
}

/**
 * Factory para Firestore: crea los datos del ticket SIN el campo id.
 * El ID (TKT-XXXX) lo asigna TicketStore mediante transacción atómica.
 * @param {Object} datos - Datos crudos del formulario
 * @returns {Object} Datos del ticket (sin id)
 */
export function crearTicketData(datos) {
  const { asunto, tipo, prioridad, tecnico, descripcion, impacto, rollback, adjunto } = datos;

  return {
    asunto,
    tipo,
    prioridad,
    tecnico,
    descripcion,
    impacto: tipo === 'RFC' ? impacto : null,
    rollback: tipo === 'RFC' ? rollback : null,
    estado: 'Abierto',
    fecha: new Date().toLocaleDateString(),
    timestamp: Date.now(),
    adjunto: adjunto || null,
    comentarios: [
      {
        texto: 'Ticket creado en el sistema.',
        fecha: new Date().toLocaleString(),
        esSistema: true,
      },
    ],
  };
}


/**
 * Aplica un cambio de estado a un ticket, agregando el log de auditoría.
 * @param {Object} ticket - Ticket original
 * @param {string} nuevoEstado
 * @returns {Object} Ticket actualizado (inmutablemente)
 */
export function aplicarCambioEstado(ticket, nuevoEstado) {
  if (ticket.estado === nuevoEstado) return ticket;

  return {
    ...ticket,
    estado: nuevoEstado,
    comentarios: [
      ...ticket.comentarios,
      {
        texto: `Estado actualizado de '${ticket.estado}' a '${nuevoEstado}'.`,
        fecha: new Date().toLocaleString(),
        esSistema: true,
      },
    ],
  };
}

/**
 * Agrega un comentario de usuario a un ticket.
 * @param {Object} ticket
 * @param {string} texto
 * @returns {Object} Ticket actualizado (inmutablemente)
 */
export function agregarComentario(ticket, texto, adjunto = null) {
  if (!texto.trim() && !adjunto) return ticket;

  return {
    ...ticket,
    comentarios: [
      ...ticket.comentarios,
      {
        texto: texto.trim(),
        fecha: new Date().toLocaleString(),
        esSistema: false,
        adjunto: adjunto || null,
      },
    ],
  };
}
