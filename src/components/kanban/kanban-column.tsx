'use client';

import { Droppable } from '@hello-pangea/dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './kanban-card';
import type { OpenProjectStatus, OpenProjectWorkPackage } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: OpenProjectStatus;
  workPackages: OpenProjectWorkPackage[];
}

export function KanbanColumn({ status, workPackages }: KanbanColumnProps) {
  const count = workPackages.length;

  return (
    <div className="flex h-full min-w-[320px] max-w-[320px] flex-col rounded-xl bg-slate-100/80">
      {/* Column Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: status.color || '#94a3b8' }}
        />
        <h3 className="text-sm font-semibold text-slate-700">{status.name}</h3>
        <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-200 px-2 text-xs font-medium text-slate-600">
          {count}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={String(status.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 transition-colors duration-200',
              snapshot.isDraggingOver && 'bg-primary/5'
            )}
          >
            <ScrollArea className="h-[calc(100vh-280px)] px-3 py-2">
              {workPackages.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-400">
                  Kéo thả task vào đây
                </div>
              ) : (
                workPackages.map((wp, index) => (
                  <KanbanCard key={wp.id} workPackage={wp} index={index} />
                ))
              )}
              {provided.placeholder}
            </ScrollArea>
          </div>
        )}
      </Droppable>

      {/* Column Footer - Stats */}
      <div className="border-t border-slate-200/50 p-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{count} task{count !== 1 ? 's' : ''}</span>
          {status.isClosed && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">
              Đã hoàn thành
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
