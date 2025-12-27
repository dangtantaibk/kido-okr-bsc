'use client';

import { Loader2, FileText } from 'lucide-react';
import { WikiPageCard } from './wiki-page-card';
import { useWikiPages } from '@/hooks/use-wiki';

interface WikiPageListProps {
  projectIdentifier: string;
  onPageClick?: (slug: string) => void;
}

export function WikiPageList({ projectIdentifier, onPageClick }: WikiPageListProps) {
  const { data: pages = [], isLoading, error } = useWikiPages(projectIdentifier);

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
        Không thể tải danh sách wiki: {(error as Error).message}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="font-medium text-slate-700">Chưa có trang wiki nào</h3>
        <p className="text-sm text-slate-500 mt-1">
          Tạo tài liệu trong OpenProject để hiển thị ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <WikiPageCard
          key={page.id}
          page={page}
          onClick={() => onPageClick?.(page.slug)}
        />
      ))}
    </div>
  );
}
