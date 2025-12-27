'use client';

import { useState } from 'react';
import { Clock, BarChart3 } from 'lucide-react';
import { TimeEntryList, TimeReportCharts } from '@/components/timelog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects } from '@/hooks/use-projects';

export default function TimeLogPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  // Auto-select first project
  if (!selectedProjectId && projects.length > 0 && !projectsLoading) {
    setSelectedProjectId(projects[0].id);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Time & Cost</h1>
              <p className="text-sm text-white/70">
                Theo dõi giờ làm việc và báo cáo
              </p>
            </div>
          </div>

          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Project:</span>
            <Select
              value={selectedProjectId?.toString() || ''}
              onValueChange={(v) => setSelectedProjectId(parseInt(v))}
            >
              <SelectTrigger className="w-[220px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Chọn project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {selectedProjectId ? (
          <Tabs defaultValue="entries" className="max-w-5xl mx-auto">
            <TabsList className="mb-6">
              <TabsTrigger value="entries" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Entries
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Báo cáo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entries">
              <TimeEntryList projectId={selectedProjectId} />
            </TabsContent>

            <TabsContent value="charts">
              <TimeReportCharts projectId={selectedProjectId} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Chọn project để xem time entries</p>
          </div>
        )}
      </div>
    </div>
  );
}
