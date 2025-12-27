'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { KanbanColumn } from './kanban-column';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getStatuses,
  getWorkPackages,
  updateWorkPackageStatus,
} from '@/lib/openproject/actions';
import type { OpenProjectStatus, OpenProjectWorkPackage } from '@/types/openproject';

interface KanbanBoardProps {
  projectId?: number;
}

type KanbanColumnType = {
  id: number;
  name: string;
  color: string;
  workPackages: OpenProjectWorkPackage[];
};

interface ToastNotification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [statuses, setStatuses] = useState<OpenProjectStatus[]>([]);
  const [workPackages, setWorkPackages] = useState<OpenProjectWorkPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Toast helper
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statusesData, workPackagesData] = await Promise.all([
        getStatuses(),
        getWorkPackages(projectId),
      ]);

      setStatuses(statusesData);
      setWorkPackages(workPackagesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group work packages by status
  const getColumnData = useCallback((): KanbanColumnType[] => {
    return statuses.map((status) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      workPackages: workPackages.filter((wp) => {
        const statusHref = wp._links.status?.href;
        const statusId = statusHref ? parseInt(statusHref.split('/').pop() || '0') : 0;
        return statusId === status.id;
      }),
    }));
  }, [statuses, workPackages]);

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const workPackageId = parseInt(draggableId);
    const sourceStatusId = parseInt(source.droppableId);
    const destinationStatusId = parseInt(destination.droppableId);

    // Find the work package
    const workPackage = workPackages.find((wp) => wp.id === workPackageId);
    if (!workPackage) return;

    // OPTIMISTIC UPDATE: Update UI immediately
    const previousWorkPackages = [...workPackages];

    setWorkPackages((prev) =>
      prev.map((wp) =>
        wp.id === workPackageId
          ? {
            ...wp,
            _links: {
              ...wp._links,
              status: {
                ...wp._links.status,
                href: `/api/v3/statuses/${destinationStatusId}`,
              },
            },
          }
          : wp
      )
    );

    // If status actually changed, call API
    if (sourceStatusId !== destinationStatusId) {
      setIsUpdating(true);

      try {
        const updatedWp = await updateWorkPackageStatus(
          workPackageId,
          destinationStatusId,
          workPackage.lockVersion
        );

        // Update with the real data from server (including new lockVersion)
        setWorkPackages((prev) =>
          prev.map((wp) => (wp.id === workPackageId ? updatedWp : wp))
        );

        showToast('success', `Đã chuyển "${workPackage.subject}" sang trạng thái mới`);
      } catch (err) {
        // ROLLBACK: Revert to previous state on error
        console.error('Failed to update status:', err);
        setWorkPackages(previousWorkPackages);
        showToast(
          'error',
          err instanceof Error ? err.message : 'Không thể cập nhật trạng thái'
        );
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu từ OpenProject...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mx-6 mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi kết nối</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const columns = getColumnData();

  return (
    <div className="relative">
      {/* Updating indicator */}
      {isUpdating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Đang cập nhật...</span>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-in slide-in-from-right fade-in rounded-lg px-4 py-3 shadow-lg ${toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
              }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-6 pb-8">
          {columns.map((column) => {
            const status = statuses.find((s) => s.id === column.id);
            if (!status) return null;
            return (
              <KanbanColumn
                key={column.id}
                status={status}
                workPackages={column.workPackages}
              />
            );
          })}
        </div>
      </DragDropContext>

      {/* Empty state */}
      {columns.every((col) => col.workPackages.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">
            Chưa có Work Package nào
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Hãy tạo Work Package mới trong OpenProject
          </p>
        </div>
      )}
    </div>
  );
}
