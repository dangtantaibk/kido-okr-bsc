
import { TeamPlannerContainer } from '@/components/team-planner/team-planner-container';

export default function TeamPlannerPage() {
  // Demo Project ID or fetch from params?
  // Hardcoding a project ID for now or using a selector approach could work, 
  // but for a standalone module, we might want to default to the first project or receive it.
  // The Gantt Chart used `projectId={1}` initially.
  const projectId = 1; // Default for testing

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Team Planner Resource View</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <TeamPlannerContainer projectId={projectId} />
      </div>
    </div>
  );
}
