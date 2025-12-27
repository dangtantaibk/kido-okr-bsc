'use client';

import { useState } from 'react';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { KanbanBoard } from '@/components/boards';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/hooks/use-projects';

export default function BoardsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  // Auto-select first project if none selected
  if (!selectedProjectId && projects.length > 0 && !projectsLoading) {
    setSelectedProjectId(projects[0].id);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Boards</h1>
              <p className="text-sm text-white/70">
                Kanban linh hoạt - Nhóm theo Status, Assignee, hoặc Version
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

      {/* Board Container */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        {selectedProjectId ? (
          <KanbanBoard projectId={selectedProjectId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Chọn project để xem Board</p>
          </div>
        )}
      </div>
    </div>
  );
}
