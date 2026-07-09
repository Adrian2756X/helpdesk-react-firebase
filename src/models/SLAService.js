/**
 * MODEL — SLAService
 * Responsabilidad: Reglas de negocio relacionadas con SLA y métricas (KPIs).
 * Funciones puras, sin dependencias de React ni de localStorage.
 */

/** 
 * Tiempos límite de SLA (en horas) por Tipo y Prioridad.
 * Usamos horas reales como solicitó el usuario.
 */
const SLA_MATRIX_HOURS = {
  Incidente: { Alta: 4, Media: 8, Baja: 24 },
  Solicitud: { Alta: 8, Media: 24, Baja: 72 },
  RFC:       { Alta: 24, Media: 72, Baja: 120 }
};

const MS_PER_HOUR = 3600000;

/** Pesos para ordenamiento por prioridad */
export const PESO_PRIORIDAD = { Alta: 3, Media: 2, Baja: 1 };

/**
 * Determina el estado detallado del SLA de un ticket.
 * Regla: Se calcula el límite según tipo y prioridad. 
 * Si el ticket está resuelto, se toma la fecha de resolución para calcular si incumplió.
 * @param {Object} ticket
 * @param {Object} [matrizSla]
 * @returns {Object} Estado del SLA
 */
export function verificarSLA(ticket, matrizSla = null) {
  const matrix = matrizSla || SLA_MATRIX_HOURS;
  const tipo = ticket.tipo || 'Incidente';
  const prioridad = ticket.prioridad || 'Media';
  const horasLimite = matrix[tipo]?.[prioridad] || 24;
  const limiteMs = horasLimite * MS_PER_HOUR;
  
  const endTimestamp = (ticket.estado === 'Resuelto' && ticket.fechaResolucion) 
    ? ticket.fechaResolucion 
    : Date.now();

  const consumidoMs = endTimestamp - ticket.timestamp;
  let porcentaje = (consumidoMs / limiteMs) * 100;
  if (porcentaje < 0) porcentaje = 0; // Evitar negativos

  const incumplio = consumidoMs > limiteMs;
  
  let estadoVisual = 'ok';
  if (incumplio) estadoVisual = 'breached';
  else if (porcentaje >= 75) estadoVisual = 'warning';

  return {
    limiteMs,
    consumidoMs,
    porcentaje: Math.min(porcentaje, 100), // Limitar a 100 para la UI
    estadoVisual, // 'ok', 'warning', 'breached'
    incumplio,
    horasLimite
  };
}

/**
 * Calcula el tiempo que lleva abierto el ticket o el tiempo que tardó en resolverse.
 * @param {Object} ticket
 * @returns {string} Tiempo amigable
 */
export function calcularTiempoAbierto(ticket) {
  const endTimestamp = (ticket.estado === 'Resuelto' && ticket.fechaResolucion) 
    ? ticket.fechaResolucion 
    : Date.now();

  const diffMs = endTimestamp - ticket.timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (ticket.estado === 'Resuelto') return `Resuelto en ${formatTime(diffMins)}`;

  return formatTime(diffMins);
}

function formatTime(diffMins) {
  if (diffMins < 1) return 'menos de 1 min';
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d`;
}

/**
 * Calcula los KPIs del dashboard a partir del estado actual de tickets.
 * @param {Object[]} tickets
 * @param {Object} [matrizSla]
 * @returns {{ total: number, vencidos: number, tasa: number }}
 */
export function calcularKPIs(tickets, matrizSla = null) {
  const total = tickets.length;
  let vencidos = 0;
  let resueltos = 0;

  for (const ticket of tickets) {
    const sla = verificarSLA(ticket, matrizSla);
    if (sla.incumplio) vencidos++;
    if (ticket.estado === 'Resuelto') resueltos++;
  }

  const tasa = total === 0 ? 0 : Math.round((resueltos / total) * 100);
  return { total, vencidos, tasa };
}

/**
 * Aplica filtros y ordenamiento sobre un array de tickets.
 * @param {Object[]} tickets
 * @param {Object} filtros
 * @param {string} rol
 * @returns {Object[]}
 */
export function filtrarTickets(tickets, filtros, rol) {
  const { busqueda = '', estado = 'Todos', tecnico = 'Todos', orden = 'recientes' } = filtros;

  let resultado = tickets.filter((t) => {
    const coincideTexto =
      t.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.id.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = estado === 'Todos' || t.estado === estado;
    const coincideTecnico =
      rol === 'usuario' || tecnico === 'Todos' ? true : t.tecnico === tecnico;

    return coincideTexto && coincideEstado && coincideTecnico;
  });

  if (orden === 'prioridad') {
    resultado = [...resultado].sort(
      (a, b) => PESO_PRIORIDAD[b.prioridad] - PESO_PRIORIDAD[a.prioridad]
    );
  } else {
    resultado = [...resultado].reverse();
  }

  return resultado;
}

/**
 * Genera el contenido CSV de un array de tickets.
 * @param {Object[]} tickets
 * @param {Object} [matrizSla]
 * @returns {string} CSV como string
 */
export function generarCSV(tickets, matrizSla = null) {
  let csv = 'ID,Asunto,Categoría,Subcategoría,Tipo,Prioridad,Estado,Técnico,Fecha,Incumplió SLA\n';
  for (const t of tickets) {
    const sla = verificarSLA(t, matrizSla);
    const incumplioStr = sla.incumplio ? 'Si' : 'No';
    const cat = t.categoria || 'General';
    const sub = t.subcategoria || 'Otros';
    csv += `${t.id},${t.asunto.replace(/,/g, '')},${cat},${sub},${t.tipo},${t.prioridad},${t.estado},${t.tecnico},${t.fecha},${incumplioStr}\n`;
  }
  return csv;
}
