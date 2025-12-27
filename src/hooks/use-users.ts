import { useQuery } from '@tanstack/react-query';
import { getProjectMembers as fetchMembers } from '@/lib/openproject/actions';
import type { OpenProjectUser } from '@/types/openproject';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  projectMembers: (projectId: number) => [...userKeys.lists(), 'project', projectId] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
};

// Fetch available assignees for a project
export function useProjectMembers(projectId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: projectId ? userKeys.projectMembers(projectId) : userKeys.lists(),
    queryFn: async () => {
      if (!projectId) return [];
      // Use server action
      return await fetchMembers(projectId);
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

// Search users by name (for @mentions) - simplified version
export function useSearchUsers(query: string, enabled = true) {
  const { data: members = [] } = useProjectMembers(undefined, false);

  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: async () => {
      // Simple client-side filter from cached members
      if (!query || query.length < 2) return [];
      return members.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000,
  });
}
