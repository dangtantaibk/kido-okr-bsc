import { useQuery } from '@tanstack/react-query';
import { getStatuses as fetchStatuses } from '@/lib/openproject/actions';
import type { OpenProjectStatus } from '@/types/openproject';

export const statusKeys = {
  all: ['statuses'] as const,
  list: () => [...statusKeys.all, 'list'] as const,
};

export function useStatuses() {
  return useQuery({
    queryKey: statusKeys.list(),
    queryFn: async () => {
      // Use server action instead of client-side fetch
      return await fetchStatuses();
    },
    staleTime: 5 * 60 * 1000, // Statuses rarely change, cache for 5 minutes
  });
}

// Get status by ID from cache or fetch
export function useStatus(id: number | null) {
  const { data: statuses } = useStatuses();
  return statuses?.find((s) => s.id === id) || null;
}
