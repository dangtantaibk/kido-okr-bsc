'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Plus } from 'lucide-react';
import { GanttRow } from './gantt-row';
import { GanttTimeline, TodayMarker } from './gantt-timeline';
import { WorkPackageDialog } from './work-package-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getWorkPackages, updateWorkPackage } from '@/lib/openproject/actions';
import type { OpenProjectWorkPackage } from '@/types/openproject';

interface GanttChartProps {
  projectId?: number;
}

type ZoomLevel = 'week' | 'month' | 'quarter';

const ZOOM_CONFIG: Record<ZoomLevel, { dayWidth: number; label: string }> = {
  week: { dayWidth: 40, label: 'Tuần' },
  month: { dayWidth: 20, label: 'Tháng' },
  quarter: { dayWidth: 8, label: 'Quý' },
};

function calculateDateRange(workPackages: OpenProjectWorkPackage[]): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let minDate = new Date(today);
  let maxDate = new Date(today);

  // Add some buffer days
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 30);

  workPackages.forEach((wp) => {
    if (wp.startDate) {
      const start = new Date(wp.startDate);
      if (start < minDate) minDate = start;
    }
    if (wp.dueDate) {
      const due = new Date(wp.dueDate);
      if (due > maxDate) maxDate = due;
    }
  });

  // Add buffer
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 14);

  return { start: minDate, end: maxDate };
}

export function GanttChart({ projectId }: GanttChartProps) {
  const [workPackages, setWorkPackages] = useState<OpenProjectWorkPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<OpenProjectWorkPackage | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getWorkPackages(projectId);
      setWorkPackages(data);
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

  const { start: startDate, end: endDate } = useMemo(
    () => calculateDateRange(workPackages),
    [workPackages]
  );

  const totalDays = useMemo(() =>
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    [startDate, endDate]
  );

  const { dayWidth } = ZOOM_CONFIG[zoomLevel];
  const timelineWidth = totalDays * dayWidth;

  const handleZoomIn = () => {
    if (zoomLevel === 'quarter') setZoomLevel('month');
    else if (zoomLevel === 'month') setZoomLevel('week');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'week') setZoomLevel('month');
    else if (zoomLevel === 'month') setZoomLevel('quarter');
  };

  const handleCreate = () => {
    setSelectedWorkPackage(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (wp: OpenProjectWorkPackage) => {
    setSelectedWorkPackage(wp);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    loadData(); // Reload data after create/update/delete
  };

  // Handle date change from drag/resize
  const handleDateChange = useCallback(async (wpId: number, newStartDate: string | null, newDueDate: string | null) => {
    const wp = workPackages.find(w => w.id === wpId);
    if (!wp) return;

    // Optimistic update
    setWorkPackages(prev => prev.map(w =>
      w.id === wpId
        ? { ...w, startDate: newStartDate, dueDate: newDueDate }
        : w
    ));

    try {
      await updateWorkPackage({
        id: wpId,
        lockVersion: wp.lockVersion,
        startDate: newStartDate,
        dueDate: newDueDate,
      });
      // Reload to get fresh data with new lockVersion
      loadData();
    } catch (err) {
      console.error('Failed to update dates:', err);
      // Rollback
      loadData();
    }
  }, [workPackages, loadData]);

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

  // Determine project ID for dialog (use first work package's project if not provided)
  const effectiveProjectId = projectId || (workPackages[0] ?
    parseInt(workPackages[0]._links.project?.href?.split('/').pop() || '0') : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!effectiveProjectId}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tạo mới
          </Button>
          <span className="text-sm text-slate-500">
            {workPackages.length} work packages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel === 'quarter'}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-500 min-w-[50px] text-center">
            {ZOOM_CONFIG[zoomLevel].label}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel === 'week'}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {workPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">
            Chưa có Work Package nào
          </h3>
          <p className="mt-1 text-sm text-slate-500 mb-4">
            Hãy tạo Work Package mới để bắt đầu
          </p>
          <Button onClick={handleCreate} disabled={!effectiveProjectId}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo Work Package
          </Button>
        </div>
      ) : (
        /* Gantt content */
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div style={{ minWidth: `${400 + timelineWidth}px` }}>
              {/* Timeline header */}
              <GanttTimeline
                startDate={startDate}
                endDate={endDate}
                dayWidth={dayWidth}
              />

              {/* Rows */}
              <div className="relative">
                {workPackages.map((wp, index) => (
                  <GanttRow
                    key={wp.id}
                    workPackage={wp}
                    startDate={startDate}
                    endDate={endDate}
                    dayWidth={dayWidth}
                    isEven={index % 2 === 0}
                    onEdit={handleEdit}
                    onDateChange={handleDateChange}
                  />
                ))}

                {/* Today marker overlay */}
                <TodayMarker startDate={startDate} endDate={endDate} />
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Work Package Dialog */}
      <WorkPackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        workPackage={selectedWorkPackage}
        projectId={effectiveProjectId}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
