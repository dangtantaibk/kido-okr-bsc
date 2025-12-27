'use client';

import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, User, FileText } from 'lucide-react';
import { parseDurationToHours } from '@/hooks/use-time-entries';
import { cn } from '@/lib/utils';

type TimeEntrySummary = {
  id: number;
  hours: string;
  spentOn: string;
  comment?: { raw: string };
  _embedded?: {
    user?: { name: string };
    workPackage?: { id: number; subject: string };
    activity?: { name: string };
  };
};

interface TimeEntryRowProps {
  entry: TimeEntrySummary;
}

export function TimeEntryRow({ entry }: TimeEntryRowProps) {
  const hours = parseDurationToHours(entry.hours);
  const user = entry._embedded?.user;
  const workPackage = entry._embedded?.workPackage;
  const activity = entry._embedded?.activity;

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
      {/* Date */}
      <div className="w-24 flex-shrink-0">
        <div className="text-sm font-medium text-slate-700">
          {format(parseISO(entry.spentOn), 'dd/MM', { locale: vi })}
        </div>
        <div className="text-xs text-slate-400">
          {format(parseISO(entry.spentOn), 'EEEE', { locale: vi })}
        </div>
      </div>

      {/* Hours */}
      <div className="w-16 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <Clock className="h-4 w-4" />
          <span>{hours.toFixed(1)}h</span>
        </div>
      </div>

      {/* Work Package */}
      <div className="flex-1 min-w-0">
        {workPackage ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">#{workPackage.id}</span>
            <span className="text-sm text-slate-700 truncate">{workPackage.subject}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">Không có work package</span>
        )}
        {entry.comment?.raw && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.comment.raw}</p>
        )}
      </div>

      {/* Activity Type */}
      {activity && (
        <div className="w-24 flex-shrink-0">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {activity.name}
          </span>
        </div>
      )}

      {/* User */}
      <div className="w-32 flex-shrink-0 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs flex items-center justify-center">
          {user?.name?.[0] || 'U'}
        </div>
        <span className="text-sm text-slate-600 truncate">{user?.name || 'Unknown'}</span>
      </div>
    </div>
  );
}
