import { useQuery } from '@tanstack/react-query';
import { getWikiPages as fetchWikiPages, getWikiPage as fetchWikiPage } from '@/lib/openproject/actions';

export const wikiKeys = {
  all: ['wiki'] as const,
  lists: () => [...wikiKeys.all, 'list'] as const,
  project: (projectIdentifier: string) => [...wikiKeys.lists(), 'project', projectIdentifier] as const,
  page: (projectIdentifier: string, slug: string) => [...wikiKeys.all, 'page', projectIdentifier, slug] as const,
};

// Fetch wiki pages for a project (using identifier)
export function useWikiPages(projectIdentifier: string | undefined, enabled = true) {
  return useQuery({
    queryKey: projectIdentifier ? wikiKeys.project(projectIdentifier) : wikiKeys.lists(),
    queryFn: async () => {
      if (!projectIdentifier) return [];
      return await fetchWikiPages(projectIdentifier);
    },
    enabled: enabled && !!projectIdentifier,
    staleTime: 60 * 1000,
  });
}

// Fetch single wiki page
export function useWikiPage(projectIdentifier: string | undefined, slug: string | undefined, enabled = true) {
  return useQuery({
    queryKey: projectIdentifier && slug ? wikiKeys.page(projectIdentifier, slug) : wikiKeys.all,
    queryFn: async () => {
      if (!projectIdentifier || !slug) return null;
      return await fetchWikiPage(projectIdentifier, slug);
    },
    enabled: enabled && !!projectIdentifier && !!slug,
  });
}
