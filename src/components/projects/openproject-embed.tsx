'use client';

import React, { useState } from 'react';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OpenProjectEmbedProps {
  projectId: string; // Identifier or ID
  viewType?: 'work_packages' | 'calendar' | 'gantt' | 'overview';
  height?: string | number;
  className?: string;
}

export function OpenProjectEmbed({
  projectId,
  viewType = 'gantt',
  height = '600px',
  className = '',
}: OpenProjectEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_OPENPROJECT_URL || 'https://openproject.61.28.229.105.sslip.io';

  // Construct URL based on view type
  let embedUrl = '';
  switch (viewType) {
    case 'work_packages':
      embedUrl = `${baseUrl}/projects/${projectId}/work_packages`;
      break;
    case 'calendar':
      embedUrl = `${baseUrl}/projects/${projectId}/work_packages/calendar`;
      break;
    case 'gantt':
      // Gantt is typically the work packages table view with timeline enabled
      // We might need a specific query ID or default view
      embedUrl = `${baseUrl}/projects/${projectId}/work_packages?query_props=%7B%22c%22%3A%5B%22id%22%2C%22subject%22%2C%22type%22%2C%22status%22%2C%22assignee%22%2C%22startDate%22%2C%22dueDate%22%5D%2C%22tv%22%3Atrue%7D`;
      break;
    case 'overview':
    default:
      embedUrl = `${baseUrl}/projects/${projectId}`;
      break;
  }

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Không thể tải OpenProject view. Vui lòng kiểm tra lại kết nối hoặc đăng nhập.');
  };

  return (
    <Card className={`w-full overflow-hidden border-2 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50 dark:bg-slate-900/50">
        <CardTitle className="text-sm font-medium">
          OpenProject Integration: {projectId}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Mở trong tab mới <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent className="p-0 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu dự án...</p>
          </div>
        )}

        {error ? (
          <div className="p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi kết nối</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => window.open(embedUrl, '_blank')}>
              Mở trực tiếp OpenProject
            </Button>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            className="border-0 w-full"
            onLoad={handleLoad}
            onError={handleError}
            title={`OpenProject ${projectId}`}
            // Allow necessary permissions
            // sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allowFullScreen
          />
        )}
      </CardContent>
    </Card>
  );
}
