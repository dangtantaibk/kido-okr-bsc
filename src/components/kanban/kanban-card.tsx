'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { OpenProjectWorkPackage } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  workPackage: OpenProjectWorkPackage;
  index: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getPriorityColor(priorityName?: string): string {
  const name = priorityName?.toLowerCase() || '';
  if (name.includes('immediate') || name.includes('urgent')) {
    return 'bg-red-500 text-white';
  }
  if (name.includes('high')) {
    return 'bg-orange-500 text-white';
  }
  if (name.includes('normal') || name.includes('medium')) {
    return 'bg-blue-500 text-white';
  }
  if (name.includes('low')) {
    return 'bg-slate-400 text-white';
  }
  return 'bg-slate-200 text-slate-700';
}

export function KanbanCard({ workPackage, index }: KanbanCardProps) {
  const assignee = workPackage._embedded?.assignee;
  const priority = workPackage._embedded?.priority;
  const type = workPackage._embedded?.type;
  const dueDate = workPackage.dueDate;
  const overdue = isOverdue(dueDate);

  return (
    <Draggable draggableId={String(workPackage.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <Card
            className={cn(
              'cursor-grab border-0 shadow-sm transition-all duration-200 hover:shadow-md',
              snapshot.isDragging && 'rotate-2 shadow-lg ring-2 ring-primary/30'
            )}
          >
            <CardContent className="p-4">
              {/* Type Badge */}
              {type && (
                <Badge
                  variant="outline"
                  className="mb-2 text-xs font-normal"
                  style={{
                    borderColor: type.color,
                    color: type.color,
                  }}
                >
                  {type.name}
                </Badge>
              )}

              {/* Subject */}
              <h4 className="mb-3 text-sm font-medium leading-tight text-slate-800">
                {workPackage.subject}
              </h4>

              {/* Priority */}
              {priority && (
                <Badge className={cn('mb-3 text-xs', getPriorityColor(priority.name))}>
                  {priority.name}
                </Badge>
              )}

              {/* Footer: Assignee + Due Date */}
              <div className="flex items-center justify-between">
                {/* Assignee */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        {assignee ? (
                          <Avatar className="h-6 w-6">
                            {assignee._links.avatar?.href && (
                              <AvatarImage
                                src={assignee._links.avatar.href}
                                alt={assignee.name}
                              />
                            )}
                            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                              {getInitials(assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                            <User className="h-3 w-3 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{assignee?.name || 'Chưa phân công'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Due Date */}
                {dueDate && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      overdue ? 'text-red-600 font-medium' : 'text-slate-500'
                    )}
                  >
                    <Calendar className={cn('h-3 w-3', overdue && 'text-red-600')} />
                    <span>{formatDate(dueDate)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar (if has percentage) */}
              {workPackage.percentageDone > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Tiến độ</span>
                    <span>{workPackage.percentageDone}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${workPackage.percentageDone}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
