import { useQuery } from '@tanstack/react-query';
import { getVersions as fetchVersions } from '@/lib/openproject/actions';

export const versionKeys = {
  all: ['versions'] as const,
  lists: () => [...versionKeys.all, 'list'] as const,
  project: (projectId: number) => [...versionKeys.lists(), 'project', projectId] as const,
};

// Fetch versions for a project
export function useVersions(projectId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: projectId ? versionKeys.project(projectId) : versionKeys.lists(),
    queryFn: async () => {
      if (!projectId) return [];
      return await fetchVersions(projectId);
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}
