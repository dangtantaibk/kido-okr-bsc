'use client';

import { Loader2, Clock } from 'lucide-react';
import { TimeEntryRow } from './time-entry-row';
import { useTimeEntries, parseDurationToHours } from '@/hooks/use-time-entries';

interface TimeEntryListProps {
  projectId: number;
}

export function TimeEntryList({ projectId }: TimeEntryListProps) {
  const { data: entries = [], isLoading, error } = useTimeEntries(projectId);

  // Calculate totals
  const totalHours = entries.reduce((sum, e) => sum + parseDurationToHours(e.hours), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-4 text-center">
        Không thể tải time entries: {error.message}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="font-medium text-slate-700">Chưa có time entry nào</h3>
        <p className="text-sm text-slate-500 mt-1">
          Log giờ làm việc trong OpenProject để xem ở đây
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-4 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Tổng giờ làm việc</p>
            <p className="text-3xl font-bold">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">{entries.length} entries</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <TimeEntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
