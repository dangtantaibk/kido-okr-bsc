'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KanbanColumn } from './kanban-column';
import { GroupSwitcher } from './group-switcher';
import { useWorkPackages, useUpdateWorkPackage, workPackageKeys } from '@/hooks/use-workpackages';
import { useStatuses } from '@/hooks/use-statuses';
import { useProjectMembers } from '@/hooks/use-users';
import { useVersions } from '@/hooks/use-versions';
import { useQueryClient } from '@tanstack/react-query';
import type {
  OpenProjectWorkPackage,
  KanbanGroupBy,
  KanbanColumnData,
} from '@/types/openproject';
import { getGroupKeyFromWorkPackage } from '@/types/openproject';

interface KanbanBoardProps {
  projectId: number;
  initialGroupBy?: KanbanGroupBy;
}

export function KanbanBoard({ projectId, initialGroupBy = 'status' }: KanbanBoardProps) {
  const [groupBy, setGroupBy] = useState<KanbanGroupBy>(initialGroupBy);
  const queryClient = useQueryClient();

  // Fetch work packages
  const {
    data: wpData,
    isLoading: wpLoading,
    error: wpError,
  } = useWorkPackages({ projectId, pageSize: 200 });

  // Fetch grouping sources
  const { data: statuses = [], isLoading: statusesLoading } = useStatuses();
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: versions = [], isLoading: versionsLoading } = useVersions(projectId);

  const updateWorkPackage = useUpdateWorkPackage();

  const workPackages = wpData?._embedded?.elements || [];

  // Build columns based on groupBy
  const columns = useMemo((): KanbanColumnData[] => {
    switch (groupBy) {
      case 'status':
        return statuses.map((status) => ({
          id: status.id.toString(),
          numericId: status.id,
          name: status.name,
          color: status.color || '#6b7280',
          workPackages: workPackages.filter(
            (wp) => getGroupKeyFromWorkPackage(wp, 'status') === status.id.toString()
          ),
        }));

      case 'assignee':
        const assignedColumns: KanbanColumnData[] = members.map((member) => ({
          id: member.id.toString(),
          numericId: member.id,
          name: member.name,
          color: '#3b82f6', // Blue
          workPackages: workPackages.filter(
            (wp) => getGroupKeyFromWorkPackage(wp, 'assignee') === member.id.toString()
          ),
        }));
        // Add "Unassigned" column
        const unassigned: KanbanColumnData = {
          id: 'unassigned',
          numericId: null,
          name: 'Chưa phân công',
          color: '#9ca3af', // Gray
          workPackages: workPackages.filter(
            (wp) => getGroupKeyFromWorkPackage(wp, 'assignee') === 'unassigned'
          ),
        };
        return [unassigned, ...assignedColumns];

      case 'version':
        const versionColumns: KanbanColumnData[] = versions.map((version) => ({
          id: version.id.toString(),
          numericId: version.id,
          name: version.name,
          color: version.status === 'open' ? '#10b981' : '#6b7280', // Green or Gray
          workPackages: workPackages.filter(
            (wp) => getGroupKeyFromWorkPackage(wp, 'version') === version.id.toString()
          ),
        }));
        // Add "No Version" column
        const noVersion: KanbanColumnData = {
          id: 'no-version',
          numericId: null,
          name: 'Không có Version',
          color: '#9ca3af',
          workPackages: workPackages.filter(
            (wp) => getGroupKeyFromWorkPackage(wp, 'version') === 'no-version'
          ),
        };
        return [noVersion, ...versionColumns];

      default:
        return [];
    }
  }, [groupBy, statuses, members, versions, workPackages]);

  // Handle drag end
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const wpId = parseInt(draggableId);
      const wp = workPackages.find((w) => w.id === wpId);
      if (!wp) return;

      const destinationColumnId = destination.droppableId;

      // Build update payload based on groupBy
      let updateLinks: Record<string, { href: string | null }> = {};

      switch (groupBy) {
        case 'status':
          updateLinks = {
            status: { href: `/api/v3/statuses/${destinationColumnId}` },
          };
          break;
        case 'assignee':
          updateLinks = {
            assignee: {
              href: destinationColumnId === 'unassigned' ? null : `/api/v3/users/${destinationColumnId}`,
            },
          };
          break;
        case 'version':
          updateLinks = {
            version: {
              href: destinationColumnId === 'no-version' ? null : `/api/v3/versions/${destinationColumnId}`,
            },
          };
          break;
      }

      // Optimistic update
      queryClient.setQueryData(
        workPackageKeys.list(projectId, { pageSize: 200, offset: 1, filters: undefined }),
        (old: typeof wpData) => {
          if (!old) return old;
          const newElements = old._embedded.elements.map((w) => {
            if (w.id === wpId) {
              // Update the _links based on groupBy
              return {
                ...w,
                _links: {
                  ...w._links,
                  ...Object.fromEntries(
                    Object.entries(updateLinks).map(([key, value]) => [key, value])
                  ),
                },
              };
            }
            return w;
          });
          return {
            ...old,
            _embedded: { ...old._embedded, elements: newElements },
          };
        }
      );

      // Send API request
      try {
        await updateWorkPackage.mutateAsync({
          id: wpId,
          lockVersion: wp.lockVersion,
          updates: { _links: updateLinks },
        });
      } catch (error) {
        // Rollback on error - refetch
        queryClient.invalidateQueries({ queryKey: workPackageKeys.lists() });
        console.error('Failed to update work package:', error);
      }
    },
    [groupBy, workPackages, projectId, queryClient, updateWorkPackage]
  );

  const isLoading = wpLoading || statusesLoading || membersLoading || versionsLoading;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Đang tải Board...</p>
        </div>
      </div>
    );
  }

  if (wpError) {
    return (
      <Alert variant="destructive" className="mx-6 mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{wpError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {workPackages.length} work packages
          </span>
        </div>
        <GroupSwitcher value={groupBy} onChange={setGroupBy} />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-h-full">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
