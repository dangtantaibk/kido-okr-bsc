'use client';

import { Loader2, Calendar } from 'lucide-react';
import { MeetingCard } from './meeting-card';
import { useMeetings } from '@/hooks/use-meetings';

interface MeetingListProps {
  projectId: number;
  onMeetingClick?: (meetingId: number) => void;
}

export function MeetingList({ projectId, onMeetingClick }: MeetingListProps) {
  const { data: meetings = [], isLoading, error } = useMeetings(projectId);

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
        Không thể tải danh sách cuộc họp: {error.message}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="font-medium text-slate-700">Chưa có cuộc họp nào</h3>
        <p className="text-sm text-slate-500 mt-1">
          Tạo cuộc họp trong OpenProject để hiển thị ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onClick={() => onMeetingClick?.(meeting.id)}
        />
      ))}
    </div>
  );
}
