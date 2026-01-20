
import { OpenProjectWorkPackage } from '@/types/openproject';
import { TaskCard } from './task-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BacklogSidebarProps {
  tasks: OpenProjectWorkPackage[];
}

export function BacklogSidebar({ tasks }: BacklogSidebarProps) {
  return (
    <div className="w-[300px] border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Backlog</h3>
        <p className="text-sm text-slate-500">{tasks.length} unassigned tasks</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              All cleared!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
