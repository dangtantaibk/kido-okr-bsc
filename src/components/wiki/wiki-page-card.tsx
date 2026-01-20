'use client';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FileText, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simplified type for wiki page from API
interface WikiPageData {
  id: number;
  title: string;
  slug: string;
  updatedAt: string;
  _embedded?: { author?: { name: string } };
}

interface WikiPageCardProps {
  page: WikiPageData;
  onClick?: () => void;
}

export function WikiPageCard({ page, onClick }: WikiPageCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border p-4 cursor-pointer transition-all',
        'hover:shadow-md hover:border-blue-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <FileText className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 truncate">{page.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(page.updatedAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
            {page._embedded?.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{page._embedded.author.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
