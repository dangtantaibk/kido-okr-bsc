'use client';

import { Badge } from '@/components/ui/badge';
import type { OpenProjectWorkPackage } from '@/types/openproject';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, User } from 'lucide-react';

interface KanbanCardProps {
  workPackage: OpenProjectWorkPackage;
  onClick?: () => void;
}

function getTypeBadgeStyle(typeName?: string): string {
  const name = typeName?.toLowerCase() || '';
  if (name.includes('milestone')) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (name.includes('phase')) {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }
  if (name.includes('bug')) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  if (name.includes('feature')) {
    return 'bg-purple-100 text-purple-700 border-purple-200';
  }
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function getPriorityColor(priorityName?: string): string {
  const name = priorityName?.toLowerCase() || '';
  if (name.includes('high') || name.includes('urgent') || name.includes('immediate')) {
    return 'border-l-red-500';
  }
  if (name.includes('low')) {
    return 'border-l-slate-300';
  }
  return 'border-l-blue-400';
}

export function KanbanCard({ workPackage, onClick }: KanbanCardProps) {
  const type = workPackage._embedded?.type;
  const assignee = workPackage._embedded?.assignee;
  const priority = workPackage._embedded?.priority;
  const percentDone = workPackage.percentageDone || 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg shadow-sm border border-l-4 p-3 cursor-pointer',
        'hover:shadow-md transition-shadow',
        getPriorityColor(priority?.name)
      )}
    >
      {/* ID and Type */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-400 font-mono">#{workPackage.id}</span>
        {type && (
          <Badge
            variant="outline"
            className={cn('text-xs font-normal px-1.5 py-0', getTypeBadgeStyle(type.name))}
          >
            {type.name}
          </Badge>
        )}
      </div>

      {/* Subject */}
      <h4 className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">
        {workPackage.subject}
      </h4>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {workPackage.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(workPackage.dueDate), 'dd/MM', { locale: vi })}
              </span>
            </div>
          )}

          {/* Assignee */}
          {assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{assignee.name.split(' ').pop()}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {percentDone > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${percentDone}%` }}
              />
            </div>
            <span className="text-[10px]">{percentDone}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
