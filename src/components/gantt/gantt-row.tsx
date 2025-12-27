'use client';

import { Badge } from '@/components/ui/badge';
import { GanttBar } from './gantt-bar';
import type { OpenProjectWorkPackage } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface GanttRowProps {
  workPackage: OpenProjectWorkPackage;
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  isEven: boolean;
  onEdit?: (workPackage: OpenProjectWorkPackage) => void;
  onDateChange?: (wpId: number, startDate: string | null, dueDate: string | null) => void;
}

function getTypeBadgeStyle(typeName?: string): string {
  const name = typeName?.toLowerCase() || '';

  if (name.includes('milestone')) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (name.includes('phase')) {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function getStatusBadgeStyle(statusName?: string): string {
  const name = statusName?.toLowerCase() || '';

  if (name.includes('new') || name.includes('mới')) {
    return 'bg-slate-100 text-slate-600';
  }
  if (name.includes('progress') || name.includes('đang')) {
    return 'bg-blue-100 text-blue-700';
  }
  if (name.includes('done') || name.includes('close') || name.includes('hoàn')) {
    return 'bg-emerald-100 text-emerald-700';
  }
  return 'bg-slate-100 text-slate-600';
}

function calculateBarPosition(
  wpStartDate: string | null | undefined,
  wpDueDate: string | null | undefined,
  rangeStart: Date,
  rangeEnd: Date
): { startOffset: number; width: number } {
  const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));

  // Default: if no dates, show at beginning
  if (!wpStartDate && !wpDueDate) {
    return { startOffset: 0, width: 0 };
  }

  const start = wpStartDate ? new Date(wpStartDate) : wpDueDate ? new Date(wpDueDate) : rangeStart;
  const end = wpDueDate ? new Date(wpDueDate) : wpStartDate ? new Date(wpStartDate) : rangeEnd;

  const startDays = Math.max(0, Math.ceil((start.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)));
  const endDays = Math.min(totalDays, Math.ceil((end.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)));

  const startOffset = (startDays / totalDays) * 100;
  const width = ((endDays - startDays + 1) / totalDays) * 100;

  return { startOffset, width };
}

export function GanttRow({ workPackage, startDate, endDate, dayWidth, isEven, onEdit, onDateChange }: GanttRowProps) {
  const type = workPackage._embedded?.type;
  const status = workPackage._embedded?.status;
  const { startOffset, width } = calculateBarPosition(
    workPackage.startDate,
    workPackage.dueDate,
    startDate,
    endDate
  );

  const hasValidDates = workPackage.startDate || workPackage.dueDate;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking on the timeline area (for dragging)
    const target = e.target as HTMLElement;
    if (target.closest('[data-timeline]')) {
      return;
    }
    if (onEdit) {
      onEdit(workPackage);
    }
  };

  return (
    <div
      className={cn(
        'flex border-b border-slate-200 transition-colors',
        isEven ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/50 hover:bg-blue-50/30'
      )}
    >
      {/* Left side - Info panel (clickable for edit) */}
      <div
        className="flex-shrink-0 w-[400px] border-r border-slate-200 flex items-center gap-2 px-3 py-2 sticky left-0 bg-inherit z-10 cursor-pointer hover:bg-blue-50"
        onClick={handleRowClick}
      >
        {/* ID */}
        <span className="text-xs text-slate-400 font-mono w-8">
          #{workPackage.id}
        </span>

        {/* Type Badge */}
        {type && (
          <Badge
            variant="outline"
            className={cn('text-xs font-normal px-1.5', getTypeBadgeStyle(type.name))}
          >
            {type.name}
          </Badge>
        )}

        {/* Subject */}
        <span className="text-sm text-slate-700 truncate flex-1" title={workPackage.subject}>
          {workPackage.subject}
        </span>

        {/* Status */}
        {status && (
          <Badge
            variant="secondary"
            className={cn('text-xs ml-auto', getStatusBadgeStyle(status.name))}
          >
            {status.name}
          </Badge>
        )}
      </div>

      {/* Right side - Timeline (draggable area) */}
      <div className="flex-1 relative h-10 min-w-0" data-timeline>
        {hasValidDates ? (
          <GanttBar
            workPackage={workPackage}
            startOffset={startOffset}
            width={width}
            dayWidth={dayWidth}
            totalDays={totalDays}
            startDate={startDate}
            onDateChange={onDateChange}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => onEdit?.(workPackage)}
          >
            <span className="text-xs text-slate-300 italic hover:text-blue-500">
              Click để thêm ngày
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
