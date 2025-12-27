'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWikiPage } from '@/hooks/use-wiki';

interface WikiViewerProps {
  projectIdentifier: string;
  slug: string;
  onBack?: () => void;
}

export function WikiViewer({ projectIdentifier, slug, onBack }: WikiViewerProps) {
  const { data: page, isLoading, error } = useWikiPage(projectIdentifier, slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Không thể tải trang wiki</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      )}

      <article className="bg-white rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{page.title}</h1>

        {page.text?.html ? (
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: page.text.html }}
          />
        ) : (
          <p className="text-slate-500 italic">Trang này chưa có nội dung</p>
        )}
      </article>
    </div>
  );
}
