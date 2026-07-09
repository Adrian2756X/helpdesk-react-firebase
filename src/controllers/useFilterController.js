/**
 * CONTROLLER — useFilterController
 * Responsabilidad: Gestionar el estado de los filtros y delegar el cálculo
 * al Model (SLAService.filtrarTickets). La View recibe solo el resultado final.
 */

import { useState, useMemo, useCallback } from 'react';
import { filtrarTickets } from '../models/SLAService';

const FILTROS_INICIALES = {
  busqueda: '',
  estado: 'Todos',
  tecnico: 'Todos',
  orden: 'recientes',
};

/**
 * @param {Object[]} tickets - Array de tickets desde useTicketController
 * @param {string} rol - 'usuario' | 'tecnico'
 */
export function useFilterController(tickets, rol) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  // Delega el filtrado/ordenamiento puro al Model (SLAService)
  const ticketsFiltrados = useMemo(
    () => filtrarTickets(tickets, filtros, rol),
    [tickets, filtros, rol]
  );

  // Actualiza un filtro individualmente sin perder los demás
  const actualizarFiltro = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  // Toggle de orden entre 'recientes' y 'prioridad'
  const toggleOrden = useCallback(() => {
    setFiltros((prev) => ({
      ...prev,
      orden: prev.orden === 'recientes' ? 'prioridad' : 'recientes',
    }));
  }, []);

  return {
    filtros,
    ticketsFiltrados,
    actualizarFiltro,
    toggleOrden,
  };
}
