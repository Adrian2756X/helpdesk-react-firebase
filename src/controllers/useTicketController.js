/**
 * CONTROLLER — useTicketController (Firestore + tiempo real)
 * Responsabilidad: Conectar el Model Firestore con la View.
 * - onSnapshot mantiene el estado sincronizado en tiempo real
 * - Todas las mutaciones van a Firestore (no a estado local directamente)
 */
import { useState, useEffect, useCallback } from 'react';
import * as TicketStore from '../models/TicketStore';
import * as TicketModel from '../models/Ticket';
import { calcularKPIs, generarCSV } from '../models/SLAService';
import { uploadAttachment } from '../models/StorageService';

export function useTicketController(matrizSla = null) {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // ── Suscripción en tiempo real ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = TicketStore.subscribeToTickets(
      (data) => {
        setTickets(data);
        setLoadingTickets(false);
      },
      (err) => {
        console.error('[useTicketController] Error en onSnapshot:', err);
        setLoadingTickets(false);
      }
    );
    return unsubscribe; // cleanup al desmontar
  }, []);

  // ── Acciones (delegan al TicketStore) ────────────────────────────────────

  const crearTicket = useCallback(async (datos) => {
    let adjunto = null;
    if (datos.adjuntoFile) {
      adjunto = await uploadAttachment(datos.adjuntoFile, 'tickets');
    }

    // El Model construye la estructura del ticket (sin id ni counter)
    const ticketData = TicketModel.crearTicketData({ ...datos, adjunto });
    await TicketStore.createTicket(ticketData);
    // onSnapshot actualiza tickets automáticamente
  }, []);

  const cambiarEstado = useCallback(async (id, nuevoEstado, rol) => {
    if (rol !== 'tecnico' && rol !== 'admin') return;

    const ticket = tickets.find((t) => t.id === id);
    if (!ticket || ticket.estado === nuevoEstado) return;

    const comentarioLog = {
      texto: `Estado actualizado de '${ticket.estado}' a '${nuevoEstado}'.`,
      fecha: new Date().toLocaleString(),
      esSistema: true,
    };

    await TicketStore.updateTicket(id, {
      estado: nuevoEstado,
      comentarios: [...ticket.comentarios, comentarioLog],
    });
  }, [tickets]);

  const asignarTecnico = useCallback(async (id, nuevoTecnico, rol) => {
    if (rol !== 'tecnico' && rol !== 'admin') return;

    const ticket = tickets.find((t) => t.id === id);
    if (!ticket || ticket.tecnico === nuevoTecnico) return;

    const comentarioLog = {
      texto: `Ticket reasignado a '${nuevoTecnico}'.`,
      fecha: new Date().toLocaleString(),
      esSistema: true,
    };

    await TicketStore.updateTicket(id, {
      tecnico: nuevoTecnico,
      comentarios: [...ticket.comentarios, comentarioLog],
    });
  }, [tickets]);

  const agregarComentario = useCallback(async (id, texto, adjuntoFile = null) => {
    if (!texto.trim() && !adjuntoFile) return;

    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;

    let adjunto = null;
    if (adjuntoFile) {
      adjunto = await uploadAttachment(adjuntoFile, 'comentarios');
    }

    const nuevoComentario = {
      texto: texto.trim(),
      fecha: new Date().toLocaleString(),
      esSistema: false,
      adjunto: adjunto || null,
    };

    await TicketStore.updateTicket(id, {
      comentarios: [...ticket.comentarios, nuevoComentario],
    });
  }, [tickets]);

  const enviarCalificacion = useCallback(async (id, rating, feedback) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;

    await TicketStore.updateTicket(id, {
      csat: { rating, feedback, fecha: new Date().toLocaleString() }
    });
  }, [tickets]);

  const exportarCSV = useCallback(() => {
    if (tickets.length === 0) return alert('No hay tickets para exportar.');
    const csv  = generarCSV(tickets, matrizSla);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: 'Reporte_Helpdesk.csv', style: 'display:none',
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tickets]);

  // KPIs derivados del estado actual
  const kpis = calcularKPIs(tickets, matrizSla);

  return {
    tickets,
    loadingTickets,
    kpis,
    crearTicket,
    cambiarEstado,
    asignarTecnico,
    agregarComentario,
    exportarCSV,
    enviarCalificacion,
  };
}
