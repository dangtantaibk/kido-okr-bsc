'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { GanttChart } from '@/components/gantt';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, CalendarRange } from 'lucide-react';
import { getProjects } from '@/lib/openproject/actions';
import type { OpenProjectProject } from '@/types/openproject';

const OPENPROJECT_BASE_URL = process.env.NEXT_PUBLIC_OPENPROJECT_BASE_URL || 'https://openproject.61.28.229.105.sslip.io';

export default function GanttPage() {
  const [projects, setProjects] = useState<OpenProjectProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
        // Auto-select first project if available
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleProjectChange = (value: string) => {
    if (value === 'all') {
      setSelectedProjectId(undefined);
    } else {
      setSelectedProjectId(parseInt(value));
    }
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Timeline"
        subtitle="Gantt Chart - Theo dõi tiến độ theo thời gian"
      />

      <div className="p-6 flex-1 flex flex-col">
        {/* Info Card */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CalendarRange className="h-8 w-8 text-blue-200" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">Gantt Chart - Miễn phí</h3>
                <p className="mt-1 text-blue-100">
                  Xem tiến độ công việc theo dạng timeline. Tính năng này tương đương với Gantt Charts trong phiên bản Enterprise của OpenProject.
                </p>
              </div>
              <a
                href={OPENPROJECT_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                OpenProject
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Project:</span>
            <Select
              value={selectedProjectId?.toString() || 'all'}
              onValueChange={handleProjectChange}
              disabled={isLoadingProjects}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Chọn project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>

        {/* Gantt Chart */}
        <Card className="border-0 shadow-lg flex-1 overflow-hidden">
          <GanttChart key={refreshKey} projectId={selectedProjectId} />
        </Card>
      </div>
    </div>
  );
}
