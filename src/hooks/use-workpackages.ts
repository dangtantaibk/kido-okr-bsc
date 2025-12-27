import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkPackages as fetchWorkPackages,
  createWorkPackage as serverCreateWorkPackage,
  updateWorkPackage as serverUpdateWorkPackage,
  deleteWorkPackage as serverDeleteWorkPackage,
} from '@/lib/openproject/actions';
import type { OpenProjectWorkPackage } from '@/types/openproject';

// Query keys
export const workPackageKeys = {
  all: ['workPackages'] as const,
  lists: () => [...workPackageKeys.all, 'list'] as const,
  list: (projectId?: number, filters?: Record<string, unknown>) =>
    [...workPackageKeys.lists(), { projectId, filters }] as const,
  details: () => [...workPackageKeys.all, 'detail'] as const,
  detail: (id: number) => [...workPackageKeys.details(), id] as const,
};

interface UseWorkPackagesOptions {
  projectId?: number;
  pageSize?: number;
  offset?: number;
  filters?: Record<string, unknown>[];
  enabled?: boolean;
}

// Fetch work packages with pagination and filters
export function useWorkPackages(options: UseWorkPackagesOptions = {}) {
  const { projectId, enabled = true } = options;

  return useQuery({
    queryKey: workPackageKeys.list(projectId),
    queryFn: async () => {
      // Use server action
      const elements = await fetchWorkPackages(projectId);
      return {
        _embedded: { elements },
        total: elements.length,
        count: elements.length,
      };
    },
    enabled,
  });
}

// Update work package mutation
export function useUpdateWorkPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      lockVersion,
      updates,
    }: {
      id: number;
      lockVersion: number;
      updates: Record<string, unknown>;
    }) => {
      // Use server action
      return await serverUpdateWorkPackage({
        id,
        lockVersion,
        ...updates,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workPackageKeys.lists() });
    },
  });
}

// Create work package mutation
export function useCreateWorkPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      subject: string;
      projectId: number;
      typeId?: number;
      statusId?: number;
      startDate?: string | null;
      dueDate?: string | null;
      description?: string;
      assigneeId?: number | null;
    }) => {
      return await serverCreateWorkPackage(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workPackageKeys.lists() });
    },
  });
}

// Delete work package mutation
export function useDeleteWorkPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await serverDeleteWorkPackage(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workPackageKeys.lists() });
    },
  });
}

// For single work package - not implemented yet via server action
export function useWorkPackage(id: number, enabled = true) {
  return useQuery({
    queryKey: workPackageKeys.detail(id),
    queryFn: async () => {
      // Would need a server action for single WP fetch
      return null as OpenProjectWorkPackage | null;
    },
    enabled: false, // Disable for now
  });
}
