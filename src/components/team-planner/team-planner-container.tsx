
'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core';
import { TeamPlannerGrid } from './team-planner-grid';
import { BacklogSidebar } from './backlog-sidebar';
import { useTeamPlanner } from '@/hooks/use-team-planner';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface TeamPlannerContainerProps {
  projectId: number;
}

export function TeamPlannerContainer({ projectId }: TeamPlannerContainerProps) {
  const {
    users,
    workPackages,
    activeId,
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
    currentWeekStart,
    setCurrentWeekStart
  } = useTeamPlanner(projectId);

  // Split Work Packages: Backlog vs Grid
  const backlogTasks = workPackages.filter(wp => !wp.startDate || !wp._links.assignee?.href);
  const gridTasks = workPackages.filter(wp => wp.startDate && wp._links.assignee?.href);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin} // Or rectIntersection for stricter bounds
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-xl font-bold">Team Planner</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(d => addDays(d, -7))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[100px] text-center">
                {format(currentWeekStart, 'MMM d, yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(d => addDays(d, 7))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <BacklogSidebar tasks={backlogTasks} />
          <TeamPlannerGrid
            users={users}
            workPackages={gridTasks}
            startDate={currentWeekStart}
          />
        </div>

        {/* Overlay for Dragging */}
        <DragOverlay>
          {activeTask ? (
            <div className="w-[150px]">
              <TaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
