'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import { KanbanCard } from './kanban-card';
import type { KanbanColumnData } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnData;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-slate-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="font-medium text-slate-700 truncate flex-1">
          {column.name}
        </h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {column.workPackages.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]',
              snapshot.isDraggingOver && 'bg-blue-50'
            )}
          >
            {column.workPackages.map((wp, index) => (
              <Draggable
                key={wp.id}
                draggableId={wp.id.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      snapshot.isDragging && 'rotate-2 shadow-lg'
                    )}
                  >
                    <KanbanCard workPackage={wp} />
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
}
