'use client';

import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, Video, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MeetingCardProps {
  meeting: {
    id: number;
    title: string;
    startTime: string;
    duration: string;
    location?: string;
    state: string;
    _embedded?: { author?: { name: string } };
  };
  onClick?: () => void;
}

function parseDuration(duration: string): string {
  // Parse ISO 8601 duration e.g. "PT1H30M" -> "1h 30m"
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? `${match[2]}m` : '';
  return [hours, minutes].filter(Boolean).join(' ') || '0m';
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const startTime = parseISO(meeting.startTime);
  const isOpen = meeting.state === 'open';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border p-4 cursor-pointer transition-all',
        'hover:shadow-md hover:border-blue-200',
        isOpen ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-slate-300'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-slate-800">{meeting.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(startTime, 'dd/MM/yyyy', { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(startTime, 'HH:mm')}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span>{parseDuration(meeting.duration)}</span>
          </div>
        </div>
        <Badge variant={isOpen ? 'default' : 'secondary'}>
          {isOpen ? 'Đang mở' : 'Đã đóng'}
        </Badge>
      </div>

      {meeting.location && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>{meeting.location}</span>
        </div>
      )}

      {meeting._embedded?.author && (
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
          <Users className="h-3 w-3" />
          <span>Tạo bởi: {meeting._embedded.author.name}</span>
        </div>
      )}
    </div>
  );
}
