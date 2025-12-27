
import { useState, useCallback } from 'react';
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { addDays, startOfWeek } from 'date-fns';
import {
  getWorkPackages,
  getProjectMembers,
  updateWorkPackage
} from '@/lib/openproject/actions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpenProjectWorkPackage } from '@/types/openproject';

export function useTeamPlanner(projectId: number) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<OpenProjectWorkPackage | null>(null);

  // Filter state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Queries
  const { data: users = [] } = useQuery({
    queryKey: ['users', projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const { data: workPackages = [] } = useQuery({
    queryKey: ['workPackages', projectId],
    queryFn: () => getWorkPackages(projectId),
    enabled: !!projectId,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number, lockVersion: number, userId?: number, startDate?: string, dueDate?: string }) => {
      // If we are just reassigning (dragging to sidebar), startDate might be undefined in payload -> don't send it.
      // But OpenProject API PATCH is partial.
      return updateWorkPackage({
        id: data.id,
        lockVersion: data.lockVersion,
        assigneeId: data.userId,
        startDate: data.startDate,
        dueDate: data.dueDate,
      });
    },
    onMutate: async (newData) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['workPackages', projectId] });
      const previousWPs = queryClient.getQueryData<OpenProjectWorkPackage[]>(['workPackages', projectId]);

      queryClient.setQueryData<OpenProjectWorkPackage[]>(['workPackages', projectId], (old) => {
        if (!old) return [];
        return old.map(wp => {
          if (wp.id === newData.id) {
            return {
              ...wp,
              startDate: newData.startDate ?? wp.startDate,
              dueDate: newData.dueDate ?? wp.dueDate,
              _links: {
                ...wp._links,
                assignee: newData.userId ? { href: `/api/v3/users/${newData.userId}` } : wp._links.assignee,
              }
            };
          }
          return wp;
        });
      });

      return { previousWPs };
    },
    onError: (err, newData, context) => {
      if (context?.previousWPs) {
        queryClient.setQueryData(['workPackages', projectId], context.previousWPs);
      }
      console.error("Mutation failed", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workPackages', projectId] });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as number);

    // Find the task data
    const task = active.data.current?.task as OpenProjectWorkPackage;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const task = active.data.current?.task as OpenProjectWorkPackage;
    if (!task) return;

    // Check Data Type
    const targetType = over.data.current?.type;
    const targetUserId = over.data.current?.userId;

    if (!targetType?.startsWith('user-')) return;

    const originalStartDate = task.startDate ?? undefined;
    const originalDueDate = task.dueDate ?? undefined;
    let newStartDate: string | undefined = originalStartDate;
    let newDueDate: string | undefined = originalDueDate;
    let newUserId: number | undefined = undefined;

    // --- SCENARIO 1: Drop on Sidebar (Reassign Only) ---
    if (targetType === 'user-sidebar') {
      // Just reassign. Keep date.
      if (String(targetUserId) !== task._links.assignee?.href?.split('/').pop()) {
        newUserId = targetUserId;
      }
      // Note: If dragging Backlog -> Sidebar, this assigns User but keeps "No Date"? 
      // Or should it default to Today? 
      // User Request: "Dragging a task from the Sidebar -> Drop onto the Grid (Assigns User & Sets Start Date)".
      // It doesn't allow Sidebar->Sidebar drop explicitly, but logic allows it.
      // If Backlog Item (startDate: null) dropped on Sidebar -> We probably shouldn't set a date, just assignee.
      // Or set to "Current Week Start"? Let's keep it consistent: No Date Change if Sidebar.
    }

    // --- SCENARIO 2: Drop on Grid (Reassign + Reschedule) ---
    else if (targetType === 'user-grid') {
      // Reassign Check
      if (String(targetUserId) !== task._links.assignee?.href?.split('/').pop()) {
        newUserId = targetUserId;
      }

      // Reschedule Check
      const deltaX = event.delta.x;
      const rowRect = over.rect; // This is the Grid Rect now
      const days = 7;

      if (active.data.current?.type === 'task' && task.startDate) {
        // GRID -> GRID (Shift Date based on deltaX)
        const shiftDays = Math.round(deltaX / (rowRect.width / days));
        if (shiftDays !== 0) {
          const oldStart = new Date(task.startDate);
          newStartDate = addDays(oldStart, shiftDays).toISOString().split('T')[0];
          if (task.dueDate) {
            const oldDue = new Date(task.dueDate);
            newDueDate = addDays(oldDue, shiftDays).toISOString().split('T')[0];
          }
        }
      } else {
        // BACKLOG -> GRID (Calculate Date from Drop Position)
        // Relative X from the LEFT of the Grid Container
        // We need `active.rect.current.translated`.
        // Fallback: If `active` rect is not available, we can approximate, but dnd-kit usually provides it.

        // Issue: `active` rect might be the dragged overlay.
        // We want the center of the dropped item relative to the container.

        // Use `event.active.rect.current.translated`
        const activeRect = active.rect.current.translated;
        if (activeRect) {
          const center = activeRect.left + activeRect.width / 2;
          const relativeX = center - rowRect.left;
          const colIndex = Math.floor(relativeX / (rowRect.width / days));

          // Clamp to 0-6
          const effectiveIndex = Math.max(0, Math.min(6, colIndex));
          const targetDate = addDays(currentWeekStart, effectiveIndex);

          newStartDate = targetDate.toISOString().split('T')[0];
          newDueDate = addDays(targetDate, 1).toISOString().split('T')[0];
        }
      }
    }

    // Execute Mutation if changed
    const hasUserChange = newUserId !== undefined;
    const hasDateChange =
      newStartDate !== originalStartDate || newDueDate !== originalDueDate;

    if (hasUserChange || hasDateChange) {
      updateMutation.mutate({
        id: task.id,
        lockVersion: task.lockVersion,
        userId: newUserId, // undefined means no change
        startDate: hasDateChange ? newStartDate : undefined, // Only send if changed
        dueDate: hasDateChange ? newDueDate : undefined,
      });
    }

  }, [currentWeekStart, updateMutation]);

  return {
    users,
    workPackages,
    activeId,
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
    currentWeekStart,
    setCurrentWeekStart,
  };
}
