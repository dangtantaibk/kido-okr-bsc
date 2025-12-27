'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { WikiPageList, WikiViewer } from '@/components/wiki';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/hooks/use-projects';

export default function WikiPage() {
  const [selectedProjectIdentifier, setSelectedProjectIdentifier] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  // Auto-select first project
  if (!selectedProjectIdentifier && projects.length > 0 && !projectsLoading) {
    setSelectedProjectIdentifier(projects[0].identifier);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Wiki</h1>
              <p className="text-sm text-white/70">
                Tài liệu dự án
              </p>
            </div>
          </div>

          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Project:</span>
            <Select
              value={selectedProjectIdentifier || ''}
              onValueChange={(v) => {
                setSelectedProjectIdentifier(v);
                setSelectedSlug(null); // Reset slug when changing project
              }}
            >
              <SelectTrigger className="w-[220px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Chọn project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.identifier}>
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
        <div className="max-w-4xl mx-auto">
          {selectedProjectIdentifier ? (
            selectedSlug ? (
              <WikiViewer
                projectIdentifier={selectedProjectIdentifier}
                slug={selectedSlug}
                onBack={() => setSelectedSlug(null)}
              />
            ) : (
              <WikiPageList
                projectIdentifier={selectedProjectIdentifier}
                onPageClick={setSelectedSlug}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">Chọn project để xem wiki</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
