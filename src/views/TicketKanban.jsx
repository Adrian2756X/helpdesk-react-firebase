/**
 * VIEW — TicketKanban
 * Responsabilidad: Renderizar los tickets en un tablero Kanban.
 * Implementa Drag and Drop para cambiar el estado de los tickets.
 */
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TicketItem from './TicketItem';
import { CircleDot } from 'lucide-react';


const COLUMNAS = [
  { id: 'Abierto', titulo: 'Abierto', iconColor: 'var(--warning)' },
  { id: 'En Progreso', titulo: 'En Progreso', iconColor: 'var(--primary)' },
  { id: 'Resuelto', titulo: 'Resuelto', iconColor: 'var(--success)' },
];

export default function TicketKanban({
  tickets,
  rol,
  onCambiarEstado,
  onAbrirModal,
  slaMatrix
}) {
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Si se suelta fuera de una zona válida o en el mismo lugar, no hacemos nada
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    // Validar permisos (solo técnico o admin pueden mover)
    if (rol !== 'tecnico' && rol !== 'admin') {
      alert('No tienes permisos para cambiar el estado del ticket.');
      return;
    }

    // Actualizamos el estado del ticket (esto dispara una mutación en Firestore)
    onCambiarEstado(draggableId, destination.droppableId);
  };

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        {COLUMNAS.map((columna) => {
          // Filtramos los tickets que pertenecen a esta columna
          const ticketsColumna = tickets.filter(t => t.estado === columna.id);

          return (
            <div key={columna.id} className="kanban-col">
              <div className="kanban-col-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CircleDot size={16} color={columna.iconColor} /> {columna.titulo}</span>
                <span className="kanban-badge">{ticketsColumna.length}</span>
              </div>

              <Droppable droppableId={columna.id}>
                {(provided, snapshot) => (
                  <div
                    className={`kanban-col-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {ticketsColumna.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index} isDragDisabled={rol === 'usuario'}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.9 : 1,
                              transform: snapshot.isDragging ? provided.draggableProps.style.transform : 'none'
                            }}
                            className={`kanban-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          >
                            <TicketItem
                              ticket={ticket}
                              rol={rol}
                              onCambiarEstado={onCambiarEstado}
                              onAbrirModal={onAbrirModal}
                              slaMatrix={slaMatrix}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
