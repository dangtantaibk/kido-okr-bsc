import { OpenProjectWorkPackage } from '@/types/openproject';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: OpenProjectWorkPackage;
  isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative flex items-center p-2 text-sm bg-white shadow-sm border-l-4 border-l-blue-500 cursor-grab hover:shadow-md transition-shadow",
        isDragging && "opacity-50",
        isOverlay && "shadow-xl opacity-90 cursor-grabbing scale-105 z-50",
        "h-[40px] rounded-md overflow-hidden" // Fixed height for grid alignment
      )}
    >
      <GripVertical className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{task.subject}</span>
        <span className="text-xs text-slate-500">#{task.id}</span>
      </div>
    </Card>
  );
}
