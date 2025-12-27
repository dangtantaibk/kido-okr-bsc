
import { OpenProjectUserSimple, OpenProjectWorkPackage } from '@/types/openproject';
import { ResourceRow } from './resource-row';
import { format, addDays } from 'date-fns';

interface TeamPlannerGridProps {
  users: OpenProjectUserSimple[];
  workPackages: OpenProjectWorkPackage[];
  startDate: Date;
  days?: number;
}

export function TeamPlannerGrid({ users, workPackages, startDate, days = 7 }: TeamPlannerGridProps) {
  // Generate date columns
  const dateColumns = Array.from({ length: days }).map((_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      label: format(date, 'EEE dd/MM'),
      isToday: new Date().toDateString() === date.toDateString(),
    };
  });

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Header Row */}
      <div className="grid grid-cols-[200px_1fr] border-b bg-slate-50 sticky top-0 z-20">
        <div className="p-3 font-semibold text-sm text-slate-500 border-r">Resources</div>
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${days}, 1fr)` }}
        >
          {dateColumns.map((col, i) => (
            <div
              key={i}
              className={`p-2 text-center text-sm font-medium border-r last:border-r-0 ${col.isToday ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Rows */}
      <div className="divide-y">
        {users.map(user => {
          // Filter tasks for this user
          const userTasks = workPackages.filter(wp =>
            wp._links.assignee?.href?.endsWith(`/${user.id}`)
          );

          return (
            <ResourceRow
              key={user.id}
              user={user}
              tasks={userTasks}
              startDate={startDate}
              days={days}
              dayWidth={0} // Not used for now as we use Grid
            />
          );
        })}
      </div>
    </div>
  );
}
