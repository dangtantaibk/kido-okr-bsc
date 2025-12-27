'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Plus } from 'lucide-react';
import { OpenProjectEmbed } from '@/components/projects/openproject-embed';

export default function ProjectsPage() {
  // Mock data for initial implementation
  // In real implementation, this would come from the database
  const activeProjects = [
    { id: 'tang-truong-kenh-gt', name: 'Tăng trưởng kênh GT', status: 'In Progress' },
    // { id: '16', name: 'Tối ưu tồn kho', status: 'In Progress' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Execution</h1>
          <p className="text-muted-foreground">
            Quản lý thực thi dự án chi tiết (OpenProject Integration)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a
              href={process.env.NEXT_PUBLIC_OPENPROJECT_URL || "https://openproject.61.28.229.105.sslip.io"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to OpenProject
            </a>
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {activeProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{project.name}</span>
                <span className="text-sm font-normal text-muted-foreground">Project ID: {project.id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OpenProjectEmbed
                projectId={project.id}
                viewType="gantt"
                height="500px"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {activeProjects.length === 0 && (
        <div className="text-center p-10 border rounded-lg bg-slate-50 border-dashed">
          <p className="text-muted-foreground mb-4">Chưa có dự án nào được liên kết.</p>
          <Button variant="outline">Link Existing Project</Button>
        </div>
      )}
    </div>
  );
}
