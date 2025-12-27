import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkPackageActivities as fetchActivities,
  addComment as serverAddComment,
} from '@/lib/openproject/actions';

export const activityKeys = {
  all: ['activities'] as const,
  workPackage: (wpId: number) => [...activityKeys.all, 'workPackage', wpId] as const,
};

// Fetch activities for a work package
export function useWorkPackageActivities(workPackageId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: workPackageId ? activityKeys.workPackage(workPackageId) : activityKeys.all,
    queryFn: async () => {
      if (!workPackageId) return [];
      return await fetchActivities(workPackageId);
    },
    enabled: enabled && !!workPackageId,
    staleTime: 30 * 1000,
  });
}

// Add a comment to a work package
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workPackageId,
      comment,
    }: {
      workPackageId: number;
      comment: string;
    }) => {
      await serverAddComment(workPackageId, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.workPackage(variables.workPackageId),
      });
    },
  });
}
