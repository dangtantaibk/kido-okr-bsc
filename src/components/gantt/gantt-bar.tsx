'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { OpenProjectWorkPackage } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface GanttBarProps {
  workPackage: OpenProjectWorkPackage;
  startOffset: number; // percentage from left
  width: number; // percentage width
  dayWidth: number; // width of one day in pixels
  totalDays: number; // total days in the range
  startDate: Date; // timeline start date
  onDateChange?: (wpId: number, startDate: string | null, dueDate: string | null) => void;
}

function getTypeColor(typeName?: string): { bg: string; border: string; text: string } {
  const name = typeName?.toLowerCase() || '';

  if (name.includes('milestone')) {
    return { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white' };
  }
  if (name.includes('phase')) {
    return { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white' };
  }
  // Default for TASK
  return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' };
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function GanttBar({
  workPackage,
  startOffset,
  width,
  dayWidth,
  totalDays,
  startDate: timelineStartDate,
  onDateChange
}: GanttBarProps) {
  const type = workPackage._embedded?.type;
  const colors = getTypeColor(type?.name);
  const isMilestone = type?.name?.toLowerCase().includes('milestone');
  const percentDone = workPackage.percentageDone || 0;

  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialOffset, setInitialOffset] = useState(startOffset);
  const [initialWidth, setInitialWidth] = useState(width);
  const [currentOffset, setCurrentOffset] = useState(startOffset);
  const [currentWidth, setCurrentWidth] = useState(width);

  // Calculate new dates from position
  const calculateDatesFromPosition = useCallback((offset: number, barWidth: number) => {
    const startDays = Math.round((offset / 100) * totalDays);
    const durationDays = Math.max(1, Math.round((barWidth / 100) * totalDays));

    const newStartDate = new Date(timelineStartDate);
    newStartDate.setDate(newStartDate.getDate() + startDays);

    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + durationDays - 1);

    return {
      startDate: formatDateISO(newStartDate),
      dueDate: formatDateISO(newEndDate),
    };
  }, [totalDays, timelineStartDate]);

  // Mouse down handlers
  const handleMouseDownMove = (e: React.MouseEvent) => {
    if (!onDateChange) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialOffset(currentOffset);
    setInitialWidth(currentWidth);
  };

  const handleMouseDownResizeLeft = (e: React.MouseEvent) => {
    if (!onDateChange) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizingLeft(true);
    setDragStartX(e.clientX);
    setInitialOffset(currentOffset);
    setInitialWidth(currentWidth);
  };

  const handleMouseDownResizeRight = (e: React.MouseEvent) => {
    if (!onDateChange) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizingRight(true);
    setDragStartX(e.clientX);
    setInitialOffset(currentOffset);
    setInitialWidth(currentWidth);
  };

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!barRef.current) return;
    const container = barRef.current.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const deltaX = e.clientX - dragStartX;
    const deltaPercent = (deltaX / containerWidth) * 100;

    if (isDragging) {
      // Move the entire bar
      const newOffset = Math.max(0, Math.min(100 - initialWidth, initialOffset + deltaPercent));
      setCurrentOffset(newOffset);
    } else if (isResizingLeft) {
      // Resize from left - changes start date
      const maxDelta = initialWidth - 1; // minimum 1% width
      const clampedDelta = Math.max(-initialOffset, Math.min(maxDelta, deltaPercent));
      setCurrentOffset(initialOffset + clampedDelta);
      setCurrentWidth(initialWidth - clampedDelta);
    } else if (isResizingRight) {
      // Resize from right - changes end date
      const newWidth = Math.max(1, Math.min(100 - initialOffset, initialWidth + deltaPercent));
      setCurrentWidth(newWidth);
    }
  }, [isDragging, isResizingLeft, isResizingRight, dragStartX, initialOffset, initialWidth]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if ((isDragging || isResizingLeft || isResizingRight) && onDateChange) {
      const { startDate, dueDate } = calculateDatesFromPosition(currentOffset, currentWidth);
      onDateChange(workPackage.id, startDate, dueDate);
    }
    setIsDragging(false);
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, [isDragging, isResizingLeft, isResizingRight, currentOffset, currentWidth, calculateDatesFromPosition, onDateChange, workPackage.id]);

  // Add/remove event listeners
  useState(() => {
    if (isDragging || isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  // Use effect for event listeners
  if (typeof window !== 'undefined') {
    if (isDragging || isResizingLeft || isResizingRight) {
      window.onmousemove = handleMouseMove;
      window.onmouseup = handleMouseUp;
    } else {
      window.onmousemove = null;
      window.onmouseup = null;
    }
  }

  // Milestone - render diamond (no resize for milestone)
  if (isMilestone) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                onDateChange && "cursor-grab"
              )}
              style={{ left: `${currentOffset}%` }}
              onMouseDown={handleMouseDownMove}
            >
              <div
                className={cn(
                  'h-4 w-4 rotate-45 border-2',
                  colors.bg,
                  colors.border,
                  'shadow-sm hover:scale-110 transition-transform',
                  isDragging && 'scale-125 opacity-80'
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{workPackage.subject}</p>
              <p className="text-xs text-muted-foreground">
                📅 {formatDate(workPackage.dueDate || workPackage.startDate)}
              </p>
              {workPackage._embedded?.status && (
                <p className="text-xs">Status: {workPackage._embedded.status.name}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Regular bar for Task/Phase with resize handles
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={barRef}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-6 rounded-md group',
              'shadow-sm hover:shadow-md transition-all',
              'border',
              colors.bg,
              colors.border,
              onDateChange && 'cursor-grab',
              (isDragging || isResizingLeft || isResizingRight) && 'opacity-80 shadow-lg z-50'
            )}
            style={{
              left: `${currentOffset}%`,
              width: `${Math.max(currentWidth, 1)}%`,
              minWidth: '20px',
            }}
            onMouseDown={handleMouseDownMove}
          >
            {/* Left resize handle */}
            {onDateChange && (
              <div
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30 rounded-l-md hover:bg-white/50 transition-opacity"
                onMouseDown={handleMouseDownResizeLeft}
              />
            )}

            {/* Progress fill */}
            {percentDone > 0 && (
              <div
                className="absolute inset-y-0 left-0 rounded-l-md bg-white/30 pointer-events-none"
                style={{ width: `${percentDone}%` }}
              />
            )}

            {/* Label inside bar (if wide enough) */}
            {currentWidth > 15 && dayWidth > 15 && (
              <span className={cn('absolute inset-0 flex items-center px-3 text-xs truncate pointer-events-none', colors.text)}>
                {workPackage.subject}
              </span>
            )}

            {/* Right resize handle */}
            {onDateChange && (
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30 rounded-r-md hover:bg-white/50 transition-opacity"
                onMouseDown={handleMouseDownResizeRight}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{workPackage.subject}</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>📅 {formatDate(workPackage.startDate)} → {formatDate(workPackage.dueDate)}</p>
              {percentDone > 0 && <p>📊 Tiến độ: {percentDone}%</p>}
              {workPackage._embedded?.assignee && (
                <p>👤 {workPackage._embedded.assignee.name}</p>
              )}
              {workPackage._embedded?.status && (
                <p>Status: {workPackage._embedded.status.name}</p>
              )}
            </div>
            {onDateChange && (
              <p className="text-xs text-blue-500 font-medium mt-2">
                💡 Kéo để di chuyển, kéo cạnh để thay đổi ngày
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
