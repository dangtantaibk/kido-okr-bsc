import { useQuery } from '@tanstack/react-query';
import { getProjects as fetchProjects } from '@/lib/openproject/actions';
import type { OpenProjectProject } from '@/types/openproject';

export const projectKeys = {
  all: ['projects'] as const,
  list: () => [...projectKeys.all, 'list'] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      // Use server action instead of client-side fetch
      return await fetchProjects();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
