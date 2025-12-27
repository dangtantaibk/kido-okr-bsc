import { useQuery } from '@tanstack/react-query';
import { getTimeEntries as fetchTimeEntries } from '@/lib/openproject/actions';

export const timeEntryKeys = {
  all: ['timeEntries'] as const,
  lists: () => [...timeEntryKeys.all, 'list'] as const,
  project: (projectId: number) => [...timeEntryKeys.lists(), 'project', projectId] as const,
};

// Fetch time entries for a project
export function useTimeEntries(projectId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: projectId ? timeEntryKeys.project(projectId) : timeEntryKeys.lists(),
    queryFn: async () => {
      if (!projectId) return [];
      return await fetchTimeEntries(projectId);
    },
    enabled: enabled && !!projectId,
    staleTime: 60 * 1000,
  });
}

// Parse ISO duration to hours
export function parseDurationToHours(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours + minutes / 60;
}

// Group time entries by date for chart
export function groupTimeEntriesByDate(entries: Array<{ spentOn: string; hours: string }>): { date: string; hours: number }[] {
  const grouped = entries.reduce((acc, entry) => {
    const date = entry.spentOn;
    const hours = parseDurationToHours(entry.hours);
    acc[date] = (acc[date] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Group time entries by user
export function groupTimeEntriesByUser(entries: Array<{ hours: string; _embedded?: { user?: { name: string } } }>): { name: string; hours: number }[] {
  const grouped = entries.reduce((acc, entry) => {
    const name = entry._embedded?.user?.name || 'Unknown';
    const hours = parseDurationToHours(entry.hours);
    acc[name] = (acc[name] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours);
}
