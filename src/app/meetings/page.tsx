'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { MeetingList } from '@/components/meetings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/hooks/use-projects';

export default function MeetingsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  // Auto-select first project
  if (!selectedProjectId && projects.length > 0 && !projectsLoading) {
    setSelectedProjectId(projects[0].id);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Meetings</h1>
              <p className="text-sm text-white/70">
                Quản lý lịch họp và agenda
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
        <div className="max-w-3xl mx-auto">
          {selectedProjectId ? (
            <MeetingList projectId={selectedProjectId} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">Chọn project để xem danh sách cuộc họp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
