'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageSquare, Activity, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useWorkPackageActivities } from '@/hooks/use-activities';
import type { OpenProjectActivity } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  workPackageId: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ActivityItem({ activity }: { activity: OpenProjectActivity }) {
  const user = activity._embedded?.user;
  const hasComment = activity.comment?.raw && activity.comment.raw.trim().length > 0;
  const hasDetails = activity.details && activity.details.length > 0;

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
          {user ? getInitials(user.name) : 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-slate-800">
            {user?.name || 'Người dùng'}
          </span>
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>

        {/* Comment */}
        {hasComment && (
          <div
            className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700"
            dangerouslySetInnerHTML={{ __html: activity.comment!.html }}
          />
        )}

        {/* Change details */}
        {hasDetails && (
          <div className="mt-2 space-y-1">
            {activity.details.map((detail, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-500"
                dangerouslySetInnerHTML={{ __html: detail.html }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed({ workPackageId }: ActivityFeedProps) {
  const { data: activities = [], isLoading, error } = useWorkPackageActivities(workPackageId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-4">
        Không thể tải hoạt động: {error.message}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">Chưa có hoạt động nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
