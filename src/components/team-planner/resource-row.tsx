
import React from 'react';
import { OpenProjectUserSimple, OpenProjectWorkPackage } from '@/types/openproject';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { TaskCard } from './task-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ResourceRowProps {
  user: OpenProjectUserSimple;
  tasks: OpenProjectWorkPackage[];
  startDate: Date;
  days: number;
}

export function ResourceRow({ user, tasks, startDate, days }: ResourceRowProps) {
  // 1. Grid Droppable (Reassign + Reschedule)
  const { setNodeRef: setGridRef, isOver: isOverGrid } = useDroppable({
    id: `user-grid-${user.id}`,
    data: {
      type: 'user-grid',
      userId: user.id, // For reassign
      user,
    },
  });

  // 2. Sidebar Droppable (Reassign ONLY)
  const { setNodeRef: setSidebarRef, isOver: isOverSidebar } = useDroppable({
    id: `user-sidebar-${user.id}`,
    data: {
      type: 'user-sidebar',
      userId: user.id, // For reassign
      user,
    },
  });

  // Calculate grid position for a task
  const getTaskStyle = (task: OpenProjectWorkPackage) => {
    if (!task.startDate || !task.dueDate) return {};

    const taskStart = new Date(task.startDate);

    // Calculate difference in days from view start date
    const diffTime = taskStart.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Grid columns are 1 based. 
    const colStart = Math.max(1, diffDays + 1);

    // Duration
    const taskEnd = new Date(task.dueDate);
    const duration = Math.max(1, Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    return {
      gridColumnStart: colStart,
      gridColumnEnd: `span ${duration}`,
    };
  };

  return (
    <div className="grid grid-cols-[200px_1fr] border-b min-h-[60px]">
      {/* User Header (Sidebar) - Droppable Reassign Only */}
      <div
        ref={setSidebarRef}
        className={cn(
          "flex items-center gap-2 p-2 border-r bg-slate-50 sticky left-0 z-10 transition-colors",
          isOverSidebar && "bg-blue-100"
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="truncate text-sm font-medium" title={user.name}>
          {user.name}
        </div>
      </div>

      {/* Days Grid for this User - Droppable Reassign + Reschedule */}
      <div
        ref={setGridRef}
        className={cn(
          "grid relative bg-slate-50/20 transition-colors",
          isOverGrid && "bg-blue-50/50"
        )}
        style={{
          gridTemplateColumns: `repeat(${days}, 1fr)`
        }}
      >
        {/* Render Tasks */}
        {tasks.map(task => {
          const style = getTaskStyle(task);
          return (
            <div key={task.id} className="m-1 relative z-20" style={style}>
              <TaskCard task={task} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
