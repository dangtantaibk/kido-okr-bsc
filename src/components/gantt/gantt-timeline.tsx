'use client';

import { cn } from '@/lib/utils';

interface GanttTimelineProps {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function getMonthsInRange(start: Date, end: Date): { month: string; year: number; days: number; startOffset: number }[] {
  const months: { month: string; year: number; days: number; startOffset: number }[] = [];
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const current = new Date(start);
  let dayOffset = 0;

  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const effectiveEnd = monthEnd > end ? end : monthEnd;

    const daysInMonth = Math.ceil((effectiveEnd.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    months.push({
      month: current.toLocaleDateString('vi-VN', { month: 'short' }),
      year: current.getFullYear(),
      days: daysInMonth,
      startOffset: (dayOffset / totalDays) * 100,
    });

    dayOffset += daysInMonth;
    current.setMonth(current.getMonth() + 1);
    current.setDate(1);
  }

  return months;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function GanttTimeline({ startDate, endDate, dayWidth }: GanttTimelineProps) {
  const days = getDaysInRange(startDate, endDate);
  const months = getMonthsInRange(startDate, endDate);
  const totalDays = days.length;

  // Calculate today marker position
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let todayOffset = -1;

  if (today >= startDate && today <= endDate) {
    const daysDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    todayOffset = (daysDiff / totalDays) * 100;
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Month header */}
      <div className="flex h-8 border-b border-slate-200 bg-slate-100 sticky top-0 z-20">
        <div className="w-[400px] flex-shrink-0 border-r border-slate-200 flex items-center px-3">
          <span className="text-xs font-medium text-slate-500">Thời gian</span>
        </div>
        <div className="flex-1 relative">
          {months.map((m, idx) => (
            <div
              key={idx}
              className="absolute top-0 h-full flex items-center justify-center border-r border-slate-300 text-xs font-semibold text-slate-600"
              style={{
                left: `${m.startOffset}%`,
                width: `${(m.days / totalDays) * 100}%`,
              }}
            >
              Tháng {m.month} {m.year}
            </div>
          ))}
        </div>
      </div>

      {/* Day header (show if dayWidth is large enough) */}
      {dayWidth > 20 && (
        <div className="flex h-6 border-b border-slate-200 bg-slate-50 sticky top-8 z-20">
          <div className="w-[400px] flex-shrink-0 border-r border-slate-200" />
          <div className="flex-1 flex">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex-shrink-0 flex items-center justify-center text-[10px] border-r border-slate-100',
                  isWeekend(day) && 'bg-slate-100 text-slate-400',
                  isToday(day) && 'bg-red-50 text-red-600 font-bold'
                )}
                style={{ width: `${100 / totalDays}%` }}
              >
                {day.getDate()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today marker - will be rendered as overlay in GanttChart */}
    </div>
  );
}

// Export helper for today marker
export function TodayMarker({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today < startDate || today > endDate) return null;

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const offset = (daysDiff / totalDays) * 100;

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
      style={{ left: `calc(400px + ${offset}% * (100% - 400px) / 100%)` }}
    >
      <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
    </div>
  );
}
