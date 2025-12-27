import { useQuery } from '@tanstack/react-query';
import { getMeetings as fetchMeetings } from '@/lib/openproject/actions';

export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  project: (projectId: number) => [...meetingKeys.lists(), 'project', projectId] as const,
  detail: (id: number) => [...meetingKeys.all, 'detail', id] as const,
};

// Fetch meetings for a project
export function useMeetings(projectId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: projectId ? meetingKeys.project(projectId) : meetingKeys.lists(),
    queryFn: async () => {
      if (!projectId) return [];
      return await fetchMeetings(projectId);
    },
    enabled: enabled && !!projectId,
    staleTime: 60 * 1000,
  });
}

// Fetch single meeting - not implemented yet
export function useMeeting(meetingId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: meetingId ? meetingKeys.detail(meetingId) : meetingKeys.all,
    queryFn: async () => null,
    enabled: false,
  });
}
